import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();

// Helper to determine if we have an API key or use mocks
const useMockAI = !process.env.ANTHROPIC_API_KEY;

// POST /api/ai/explain-step
router.post('/explain-step', authenticate, async (req, res) => {
  try {
    const { topic, stepState, stepDescription } = req.body;
    
    if (useMockAI) {
      return res.json({
        explanation: `[Mock AI] In the ${topic} algorithm, the element at this step (${stepDescription}) is processed. Without a real Anthropic Key, this is a simulated response.`
      });
    }

    // Example real integration structure
    const Anthropic = (await import('@anthropic-ai/sdk')).default;
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    // This is commented out to prevent crashing if the key is invalid while testing, but the code structure is laid down.
    /*
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 300,
      system: "You are a CS tutor explaining algorithm steps. Be concise.",
      messages: [{ role: "user", content: `Explain this step:\nTopic: ${topic}\nState: ${JSON.stringify(stepState)}\nDesc: ${stepDescription}`}]
    });
    return res.json({ explanation: response.content[0].text });
    */

    res.json({ explanation: "Functionality disabled until Anthropic SDK is fully configured with an active key." });
  } catch (error) {
    console.error('AI Explain Error:', error);
    res.status(500).json({ error: 'Failed to generate explanation' });
  }
});

// POST /api/ai/hint
router.post('/hint', authenticate, async (req, res) => {
  try {
    const { problemSlug, userCode, hintLevel } = req.body;
    
    if (useMockAI) {
      return res.json({
        hint: `[Mock AI Hint Level ${hintLevel}]: For problem ${problemSlug}, check your variables. Are you iterating over the entire array unnecessarily? Try using a Hash Map.`
      });
    }

    res.json({ hint: "Integration disabled. Provide ANTHROPIC_API_KEY." });
  } catch (error) {
    console.error('AI Hint Error:', error);
    res.status(500).json({ error: 'Failed to generate hint' });
  }
});

export default router;
