import { Router } from 'express';
import { submitCode, getSubmissionStatus } from '../services/judge.js';

const router = Router();

// --- Code Execution Routes (Judge0 Proxy) ---

// POST /api/submit
// Payload: { source_code: string, language_id: number, stdin?: string }
router.post('/submit', async (req, res) => {
  try {
    const { source_code, language_id, stdin } = req.body;
    
    if (!source_code || !language_id) {
      return res.status(400).json({ error: 'Missing required fields: source_code, language_id' });
    }

    const token = await submitCode(source_code, language_id, stdin);
    res.json({ token, status: 'Processing' });
  } catch (error) {
    console.error('Submission Error:', error);
    res.status(500).json({ error: error.message || 'Failed to submit code' });
  }
});

// GET /api/submissions/:token
router.get('/submissions/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const result = await getSubmissionStatus(token);
    res.json(result);
  } catch (error) {
    console.error('Status Error:', error);
    res.status(500).json({ error: error.message || 'Failed to get status' });
  }
});

// --- AI Proxy Routes ---
router.post('/ai/hint', async (req, res) => {
  // In a real implementation, this would securely call the Anthropic API using process.env.ANTHROPIC_API_KEY
  const { problem_description, user_code } = req.body;
  
  // Mock response
  res.json({ 
    hint: "Based on your code, it looks like you are using an O(n^2) approach. Try using a Hash Map to store previously seen elements to achieve O(n) time complexity."
  });
});

export default router;
