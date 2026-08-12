import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { LearnProgress } from '../db/models.js';

const router = Router();

// Static mock data for Curriculum
const MOCK_TOPICS = [
  { slug: 'arrays', track: 'beginner', title: 'Arrays 101' },
  { slug: 'bubble-sort', track: 'beginner', title: 'Bubble Sort' },
  { slug: 'bst', track: 'intermediate', title: 'Binary Search Trees' }
];

// GET /api/learn/topics
router.get('/topics', async (req, res) => {
  try {
    let completedSet = new Set();
    
    // If the request has an authorization header, we can try to resolve user progress.
    // Assuming simple optional token extraction logic here (if needed).
    // For simplicity, we just return the raw static topics array for unauthenticated.
    res.json(MOCK_TOPICS);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch topics' });
  }
});

// POST /api/learn/complete
router.post('/complete', authenticate, async (req, res) => {
  try {
    const { topic } = req.body;
    if(!topic) return res.status(400).json({ error: 'Topic required' });

    await LearnProgress.findOneAndUpdate(
       { user_id: req.user._id, topic },
       { user_id: req.user._id, topic },
       { upsert: true, new: true }
    );
    
    res.json({ message: 'Marked as complete' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/learn/cheatsheet
router.get('/cheatsheet', (req, res) => {
  // Returns static complexity data
  res.json([
    { ds: 'Array', access: 'O(1)', search: 'O(n)', insert: 'O(n)', delete: 'O(n)' },
    { ds: 'BST', access: 'O(log n)', search: 'O(log n)', insert: 'O(log n)', delete: 'O(log n)'}
  ]);
});

export default router;
