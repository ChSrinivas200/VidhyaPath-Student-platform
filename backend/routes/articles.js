const express = require('express');
const router = express.Router();
const Article = require('../models/Article');

// @route   GET /api/articles
// @desc    Get all articles (optionally filtered by category, sorted by newest)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    const query = {};
    if (category && category !== 'All') {
      query.category = category;
    }

    const articles = await Article.find(query).sort({ createdAt: -1 });
    res.json(articles);
  } catch (err) {
    console.error('Error fetching articles:', err.message);
    res.status(500).json({ msg: 'Server error while fetching discussions.' });
  }
});

// @route   POST /api/articles
// @desc    Create a new article / discussion post
// @access  Public
router.post('/', async (req, res) => {
  const { title, content, author, category, tags, authorRole } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ msg: 'Discussion title is required.' });
  }
  if (!content || !content.trim()) {
    return res.status(400).json({ msg: 'Discussion content is required.' });
  }

  try {
    const parsedTags = Array.isArray(tags)
      ? tags.map(t => String(t).trim()).filter(Boolean)
      : typeof tags === 'string'
      ? tags.split(',').map(t => t.trim()).filter(Boolean)
      : [];

    const newArticle = new Article({
      title: title.trim(),
      content: content.trim(),
      author: (author && author.trim()) || 'Learner',
      category: (category && category.trim()) || 'General Discussion',
      tags: parsedTags,
      authorRole: (authorRole && authorRole.trim()) || 'Learner',
    });

    const article = await newArticle.save();
    res.status(201).json(article);
  } catch (err) {
    console.error('Error creating article:', err.message);
    res.status(500).json({ msg: 'Server error while publishing discussion.' });
  }
});

// @route   POST /api/articles/:id/upvote
// @desc    Toggle or increment upvote count
// @access  Public
router.post('/:id/upvote', async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ msg: 'Discussion post not found.' });
    }

    const delta = req.body.delta !== undefined ? Number(req.body.delta) : 1;
    article.upvotes = Math.max(0, (article.upvotes || 0) + delta);
    await article.save();

    res.json({ success: true, upvotes: article.upvotes });
  } catch (err) {
    console.error('Error upvoting article:', err.message);
    res.status(500).json({ msg: 'Could not update upvotes.' });
  }
});

module.exports = router;