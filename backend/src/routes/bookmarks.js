import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { Bookmark } from '../db/models.js';

const router = Router();

// GET /api/bookmarks
router.get('/', authenticate, async (req, res) => {
  try {
    const bookmarks = await Bookmark.find({ user_id: req.user._id }).sort({ createdAt: -1 });
    res.json(bookmarks);
  } catch (error) {
    console.error('Fetch bookmarks error:', error);
    res.status(500).json({ error: 'Failed to fetch bookmarks' });
  }
});

// POST /api/bookmarks
router.post('/', authenticate, async (req, res) => {
  try {
    const { resource_type, resource_id, note } = req.body;

    if (!['visualizer', 'learn', 'problem'].includes(resource_type) || !resource_id) {
      return res.status(400).json({ error: 'Invalid resource type or missing ID' });
    }

    const bookmark = await Bookmark.findOneAndUpdate(
      { user_id: req.user._id, resource_type, resource_id },
      { note },
      { upsert: true, new: true }
    );

    res.status(201).json(bookmark);
  } catch (error) {
    console.error('Create bookmark error:', error);
    res.status(500).json({ error: 'Failed to create bookmark' });
  }
});

// PATCH /api/bookmarks/:id
router.patch('/:id', authenticate, async (req, res) => {
  try {
    const { note } = req.body;
    const bookmark = await Bookmark.findOneAndUpdate(
      { _id: req.params.id, user_id: req.user._id },
      { note },
      { new: true }
    );

    if (!bookmark) {
      return res.status(404).json({ error: 'Bookmark not found' });
    }

    res.json(bookmark);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update bookmark note' });
  }
});

// DELETE /api/bookmarks/:id
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const result = await Bookmark.deleteOne({ _id: req.params.id, user_id: req.user._id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Bookmark not found' });
    }
    res.json({ message: 'Bookmark removed' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove bookmark' });
  }
});

export default router;
