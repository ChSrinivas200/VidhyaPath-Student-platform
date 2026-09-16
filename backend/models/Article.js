const mongoose = require('mongoose');

const ArticleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  category: {
    type: String,
    default: 'General Discussion',
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  author: {
    type: String,
    default: 'Anonymous',
    trim: true
  },
  authorRole: {
    type: String,
    default: 'Learner',
    trim: true
  },
  upvotes: {
    type: Number,
    default: 0
  },
  comments: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt
});

module.exports = mongoose.model('Article', ArticleSchema);