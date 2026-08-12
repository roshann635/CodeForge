import { Router } from 'express';
import { Problem } from '../db/models.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();

// GET /api/problems
router.get('/', async (req, res) => {
  try {
    const { category, difficulty, pattern } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;
    if (pattern) filter.pattern = pattern;

    // We only need basic info for list view
    const problems = await Problem.find(filter)
      .select('slug title difficulty category pattern related_visualizer')
      .lean();

    // If user is authenticated, we might want to attach is_solved status here
    // For now, returning basic list
    res.json(problems);
  } catch (error) {
    console.error('Error fetching problems:', error);
    res.status(500).json({ error: 'Failed to fetch problems' });
  }
});

// GET /api/problems/random
router.get('/random', async (req, res) => {
  try {
    const { difficulty } = req.query;
    const filter = {};
    if (difficulty) filter.difficulty = difficulty;

    const count = await Problem.countDocuments(filter);
    if(count === 0) return res.status(404).json({ error: 'No problems found' });
    
    const random = Math.floor(Math.random() * count);
    const problem = await Problem.findOne(filter).skip(random).lean();
    
    res.json(problem);
  } catch (error) {
    console.error('Error finding random problem:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/problems/:slug
router.get('/:slug', async (req, res) => {
  try {
    const problem = await Problem.findOne({ slug: req.params.slug }).lean();
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }
    // Remove editorial from standard public request
    const { editorial, ...publicProblem } = problem;
    res.json(publicProblem);
  } catch (error) {
    console.error('Error fetching problem details:', error);
    res.status(500).json({ error: 'Failed to fetch problem' });
  }
});

// GET /api/problems/:slug/editorial
router.get('/:slug/editorial', authenticate, async (req, res) => {
  try {
    // Should check if user has attempted the problem
    const problem = await Problem.findOne({ slug: req.params.slug }).select('editorial');
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }
    res.json({ editorial: problem.editorial });
  } catch (error) {
    console.error('Error fetching editorial:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
