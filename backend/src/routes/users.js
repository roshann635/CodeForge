import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { User, Submission, VisualizerProgress, LearnProgress } from '../db/models.js';

const router = Router();

// GET /api/users/me/dashboard
router.get('/me/dashboard', authenticate, async (req, res) => {
  try {
    const userId = req.user._id;

    // Aggregate solved counts by difficulty
    const solvedSubmissions = await Submission.aggregate([
      { $match: { user_id: userId, status: 'accepted' } },
      { $group: { _id: "$problem_id" } }
    ]);
    const solvedCount = solvedSubmissions.length;

    // Total elements for ring data (Example mock totals, in prod this counts records)
    const stats = {
      streak: req.user.current_streak,
      problemsSolved: solvedCount,
      progressRings: {
        beginner: 40,
        intermediate: 20,
        advanced: 0,
        expert: 0
      }
    };

    res.json(stats);
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to build dashboard' });
  }
});

// PATCH /api/users/me
router.patch('/me', authenticate, async (req, res) => {
  try {
    const { username, avatar_url, track } = req.body;
    
    // Check if new username is taken
    if(username && username !== req.user.username) {
       const existing = await User.findOne({ username });
       if(existing) return res.status(400).json({ error: 'Username taken' });
       req.user.username = username;
    }

    if(avatar_url) req.user.avatar_url = avatar_url;
    if(track) req.user.track = track;

    await req.user.save();
    res.json({ message: 'Profile updated', user: { username: req.user.username, track: req.user.track } });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

export default router;
