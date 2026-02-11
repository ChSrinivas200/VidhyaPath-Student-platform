const mongoose = require('mongoose');

const MentorSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  name: { 
    type: String, 
    required: true 
  },
  role: { 
    type: String, 
    required: true // e.g., "SDE Intern"
  },
  company: { 
    type: String 
    // e.g., "Google", "TCS"
  },
  batch: { 
    type: String 
    // e.g., "2023-2027"
  },
  skills: [{ 
    type: String 
  }], 
  category: {
    type: String,
    enum: ['Placements', 'Internships', 'Higher Studies', 'Projects'],
    default: 'Placements'
  },
  linkedIn: { 
    type: String 
  },
  isAvailable: { 
    type: Boolean, 
    default: true 
  },
  isVerified: { 
    type: Boolean, 
    default: false 
  },
  rating: { 
    type: Number, 
    default: 0 
  },
  reviews: [{ 
    studentName: String,
    comment: String,
    rating: Number
  }],
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('Mentor', MentorSchema);