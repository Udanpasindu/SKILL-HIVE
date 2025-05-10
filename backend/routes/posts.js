const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Post = require('../models/Post');

// Get posts by user ID
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const posts = await Post.find({ userId: req.params.userId })
      .sort({ createdAt: -1 }); // Sort by newest first
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;