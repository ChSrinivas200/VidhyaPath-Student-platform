const mongoose = require('mongoose');

const AssessmentSubmissionSchema = new mongoose.Schema({
  assessmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assessment',
    required: true,
  },
  assessmentTitle: {
    type: String,
    required: true,
  },
  domain: {
    type: String,
    default: 'Computer Science',
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: false,
  },
  studentName: {
    type: String,
    default: 'Learner Scholar',
  },
  score: {
    type: Number,
    required: true,
  },
  totalQuestions: {
    type: Number,
    required: true,
  },
  percentage: {
    type: Number,
    required: true,
  },
  passed: {
    type: Boolean,
    default: false,
  },
  timeSpentSeconds: {
    type: Number,
    default: 0,
  },
  answers: [
    {
      questionIndex: Number,
      questionText: String,
      selectedOption: String,
      correctAnswer: String,
      isCorrect: Boolean,
      skillTag: String,
      explanation: String,
    },
  ],
  skillBreakdown: [
    {
      skillTag: String,
      total: Number,
      correct: Number,
      percentage: Number,
      masteryStatus: String, // 'Mastered', 'Proficient', 'Skill Gap'
    },
  ],
  aiSkillGapReport: {
    masteryLevel: {
      type: String,
      default: 'Developing',
    },
    summary: String,
    strengths: [String],
    identifiedGaps: [
      {
        skill: String,
        reason: String,
        severity: String, // 'Critical Gap' | 'Moderate Gap'
      },
    ],
    recommendedActions: [String],
  },
  completedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('AssessmentSubmission', AssessmentSubmissionSchema);
