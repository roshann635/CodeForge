import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { Submission, Problem } from '../db/models.js';
import { submitCode, getSubmissionStatus } from '../services/judge.js';

const router = Router();

// POST /api/submissions/run (Quick run against sample tests)
router.post('/run', authenticate, async (req, res) => {
    try {
      const { source_code, language_id, stdin } = req.body;
      
      if (!source_code || !language_id) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
  
      // For runs, we just dispatch and return the immediate result via the mock execution queue
      const token = await submitCode(source_code, language_id, stdin);
      
      // Usually, run requests wait for execution if it's quick
      res.json({ token, status: 'Processing' });
    } catch (error) {
      console.error('Run Error:', error);
      res.status(500).json({ error: 'Failed to run code' });
    }
});

// POST /api/submissions (Full formal submission)
router.post('/', authenticate, async (req, res) => {
    try {
      const { problem_id, language, code } = req.body;

      if (!problem_id || !language || !code) {
          return res.status(400).json({ error: "Missing required fields" });
      }

      // 1. Create submission row
      const newSubmission = await Submission.create({
          user_id: req.user._id,
          problem_id,
          language,
          code,
          status: 'pending'
      });

      // 2. Dispatch to execution queue (Using our simulator for now as per plan)
      // We pass the newSubmission._id instead of token to link it up
      const languageMap = {
          'python': 71, 'javascript': 93, 'java': 91, 'cpp': 54
      };
      
      // Simulate asynchronous worker processing that would normally happen in BullMQ
      submitCode(code, languageMap[language], "").then(async (token) => {
         // The mock execution sets timers, we use that promise
      }).catch(err => console.error("Worker error:", err));

      // 3. Return immediate acknowledgment
      res.status(202).json({ id: newSubmission._id, status: 'pending' });

    } catch (error) {
      console.error('Submit Error:', error);
      res.status(500).json({ error: 'Failed to submit code' });
    }
});

// GET /api/submissions/:id (Poll for status)
router.get('/:id', authenticate, async (req, res) => {
    try {
        const submission = await Submission.findById(req.params.id);
        if (!submission) return res.status(404).json({ error: 'Submission not found' });

        // Since we are mocking worker execution, we simulate checking status
        // In real life, BullMQ output would have mutated this row.
        
        // Let's pretend it succeeded after a few seconds if it's pending
        if(submission.status === 'pending') {
           const timeDiff = Date.now() - submission.createdAt.getTime();
           if(timeDiff > 3000) {
               submission.status = 'accepted';
               submission.runtime_ms = Math.floor(Math.random() * 50) + 10;
               submission.memory_kb = Math.floor(Math.random() * 2000) + 1024;
               submission.test_results = [{ passed: true, input: "Example", expected: "Output", actual: "Output", runtime_ms: submission.runtime_ms }];
               await submission.save();
           } else if (timeDiff > 1000) {
               submission.status = 'running';
               await submission.save();
           }
        }

        res.json(submission);
    } catch (error) {
        console.error('Status check error:', error);
        res.status(500).json({ error: 'Failed to retrieve submission' });
    }
});

export default router;
