import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();

// Hardcoded sample quiz questions since there's no model defined purely for questions in the subset
const MOCK_QUESTIONS = [
  {
    id: "q_1",
    topic: "sorting",
    difficulty: "easy",
    type: "trace",
    question: "What is the output of running Bubble Sort on [5,3,8,1] after the first pass?",
    options: ["[3,5,1,8]", "[3,8,1,5]", "[5,3,1,8]", "[1,3,5,8]"],
    correct_index: 0,
    explanation: "Bubble sort bubbles the largest element (8) to the end during the first pass."
  },
  {
    id: "q_2",
    topic: "sorting",
    difficulty: "medium",
    type: "complexity",
    question: "What is the worst-case space complexity of Merge Sort?",
    options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
    correct_index: 2,
    explanation: "Merge sort requires O(n) auxiliary space to merge the sub-arrays."
  }
];

// GET /api/quiz/questions
router.get('/questions', (req, res) => {
  try {
    const { topic } = req.query;
    // Strip correct_index from response payload for security
    const questionsForClient = MOCK_QUESTIONS
      .filter(q => !topic || q.topic === topic)
      .map(({ correct_index, explanation, ...rest }) => rest);
    
    res.json(questionsForClient);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

// POST /api/quiz/sessions
router.post('/sessions', authenticate, async (req, res) => {
  try {
    // Basic grade logic for mock questions
    const { answers } = req.body; // array of { question_id, chosen_index }
    let score = 0;
    
    const graded = answers.map(ans => {
        const q = MOCK_QUESTIONS.find(m => m.id === ans.question_id);
        const correct = q && q.correct_index === ans.chosen_index;
        if(correct) score++;
        return {
            ...ans,
            is_correct: correct,
            explanation: q ? q.explanation : "Unknown",
            correct_index: q ? q.correct_index : -1
        };
    });

    res.json({
        score,
        total: answers.length,
        graded
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to process session' });
  }
});

export default router;
