const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); 
const auth = require('../middleware/auth');

// @route   POST api/auth/register
// @desc    Register user (Learner or Tutor)
// @access  Public
router.post('/register', async (req, res) => {
  const { name, email, password, role = 'user', tutorPasscode, specialization } = req.body;

  // Simple validation
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Please enter all fields' });
  }

  // Tutor Passcode Verification
  if (role === 'tutor') {
    if (!tutorPasscode || tutorPasscode.trim() !== '123456') {
      return res.status(400).json({
        message: 'Invalid Tutor Passcode. Access code 123456 is strictly required for tutor authorization.'
      });
    }
  }

  try {
    // Check for existing user
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Create new user instance
    user = new User({
      name,
      email,
      password,
      role: role === 'tutor' ? 'tutor' : 'user',
      isTutorVerified: role === 'tutor',
      specialization: specialization || (role === 'tutor' ? 'Expert Tutor & Mentor' : 'Computer Science & Engineering')
    });

    // Hash password
    user.password = await bcrypt.hash(password, 10);

    // Save user to database
    await user.save();

    // Create JWT Token with role
    const payload = {
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '30d' },
      (err, token) => {
        if (err) throw err;
        res.json({
          message: role === 'tutor' ? 'Tutor registered successfully!' : 'Registration successful!',
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            isTutor: user.role === 'tutor',
          },
        });
      }
    );
  } catch (err) {
    console.error('Registration Error:', err.message);
    res.status(500).json({ message: 'Server Error during registration' });
  }
});

// @route   POST api/auth/login
// @desc    Authenticate user & get token with role
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please enter all fields' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    const userRole = user.role || 'user';

    const payload = {
      user: {
        id: user.id,
        name: user.name,
        role: userRole,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '30d' },
      (err, token) => {
        if (err) throw err;
        res.json({
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: userRole,
            isTutor: userRole === 'tutor',
          },
        });
      }
    );
  } catch (err) {
    console.error('Login Error:', err.message);
    res.status(500).json({ message: 'Server Error during login' });
  }
});

// @route   GET api/auth/user
// @desc    Get user profile data
// @access  Private
router.get('/user', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;