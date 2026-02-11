const express = require('express');
const router = express.Router();
const { 
  getAllMentors, 
  registerAsMentor, 
  connectWithMentor,
  getMentorById,
  seedMentors // ✅ Imported seed function
} = require('../controllers/mentorController');

const auth = require('../middleware/auth'); // Middleware to check if user is logged in

// @route   GET /api/mentors
// @desc    Get all mentors (Public)
router.get('/', getAllMentors);

// @route   GET /api/mentors/:id
// @desc    Get specific mentor details
router.get('/:id', getMentorById);

// @route   POST /api/mentors/register
// @desc    Register current user as a Mentor (Private)
router.post('/register', auth, registerAsMentor);

// @route   POST /api/mentors/:id/connect
// @desc    Send a connection request/message to a mentor (Private)
router.post('/:id/connect', auth, connectWithMentor);

// @route   POST /api/mentors/seed
// @desc    Seed database with default mentors (Development Only)
router.post('/seed', seedMentors); // ✅ New Route for seeding

module.exports = router;