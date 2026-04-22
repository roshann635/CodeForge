const fs = require('fs');
const path = require('path');

const kbPath = path.join(__dirname, '../rag/knowledgeBase.json');
const knowledgeBase = JSON.parse(fs.readFileSync(kbPath, 'utf8'));

async function analyzeVoice(transcript, topic) {
    if (process.env.GEMINI_API_KEY) {
        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `You are an expert SWE interviewer. Evaluate this DSA explanation for the topic "${topic}".
                            Explanation: "${transcript}"
                            
                            Return ONLY a JSON object with this exact structure:
                            {
                              "error_detection": ["list of logical errors or missed steps"],
                              "confidence_score": 0-100,
                              "communication_rating": 0-100,
                              "dsa_understanding": 0-100,
                              "feedback": "a concise helpful message"
                            }`
                        }]
                    }]
                })
            });
            const data = await response.json();
            if (data.candidates && data.candidates[0]) {
                const rawText = data.candidates[0].content.parts[0].text;
                // Clean markdown code blocks if AI included them
                const cleanJson = rawText.replace(/```json|```/g, "").trim();
                const aiResult = JSON.parse(cleanJson);
                
                const finalScore = (aiResult.dsa_understanding * 0.6) + (aiResult.communication_rating * 0.4);
                return {
                    score: finalScore.toFixed(2),
                    confidence: (aiResult.confidence_score || 0).toFixed(2),
                    communication: aiResult.communication_rating || 50,
                    matchedKeywords: [],
                    missedSteps: aiResult.error_detection || [],
                    feedback: aiResult.feedback || "Assessment complete."
                };
            }
        } catch (e) {
            console.error("Gemini AI error, falling back to rules.", e);
        }
    }

    const topicData = knowledgeBase.find(k => k.topic.toLowerCase() === topic.toLowerCase());
    if (!topicData) return { error: 'Topic not found in Knowledge Base' };

    const words = transcript.toLowerCase().split(/\W+/);
    
    // Count exact keyword matches
    const matchedKeywords = topicData.keywords.filter(kw => words.includes(kw.toLowerCase()));
    
    // Core logic rule checking (very basic)
    let missedSteps = [];
    topicData.core_steps.forEach(step => {
        if (!transcript.toLowerCase().includes(step.toLowerCase())) {
            missedSteps.push(step);
        }
    });

    const confidence = (matchedKeywords.length / topicData.keywords.length) * 100;
    
    let communication = 100;
    if (words.length < 10) communication = 30;
    else if (words.length < 20) communication = 60;
    else communication = 90;

    const finalScore = (confidence * 0.6) + (communication * 0.4);

    return {
        score: finalScore.toFixed(2),
        confidence: confidence.toFixed(2),
        communication: communication,
        matchedKeywords,
        missedSteps,
        feedback: confidence > 70 ? topicData.feedback.positive : topicData.feedback.improvement
    };
}

module.exports = { analyzeVoice };
