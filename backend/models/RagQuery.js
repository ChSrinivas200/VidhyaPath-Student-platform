const mongoose = require('mongoose');

const RagQuerySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false, // Optional for guest mode or anonymous tests
  },
  userName: {
    type: String,
    default: 'Learner',
  },
  query: {
    type: String,
    required: true,
  },
  response: {
    type: String,
    required: true,
  },
  source: {
    type: String,
    enum: ['colab_rag', 'local_rag', 'fallback_rag'],
    default: 'colab_rag',
  },
  sources: [
    {
      title: String,
      content: String,
      score: Number,
      page: Number,
    },
  ],
  latencyMs: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('RagQuery', RagQuerySchema);
