const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  options: [{
    type: String,
    required: true,
  }],
  correctAnswer: {
    type: String,
    required: true,
  },
  skillTag: {
    type: String,
    required: true, // e.g., 'Dynamic Programming', 'SQL Indexing', 'React State Flow'
  },
  explanation: {
    type: String,
    default: '',
  },
});

const AssessmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  domain: {
    type: String,
    enum: [
      'Data Structures & Algorithms',
      'Full Stack Development',
      'Database Engineering',
      'Artificial Intelligence & ML',
      'System Design & Architecture',
      'General Technical',
    ],
    default: 'Data Structures & Algorithms',
  },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Intermediate',
  },
  timeLimitMinutes: {
    type: Number,
    default: 20,
  },
  passingPercentage: {
    type: Number,
    default: 70,
  },
  tutorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: false,
  },
  tutorName: {
    type: String,
    default: 'VidyaPath Lead Tutor',
  },
  questions: [QuestionSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Assessment', AssessmentSchema);
