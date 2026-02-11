const Mentor = require('../models/Mentor');
const User = require('../models/User'); 
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs'); 

// --- 1. Multer Configuration (File Upload) ---

const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); 
  },
  filename: function (req, file, cb) {
    cb(null, 'idcard-' + Date.now() + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only images are allowed!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } 
}).single('idCard'); 


// --- 2. Controller Functions ---

// @desc    Get all mentors (with optional filtering)
// @route   GET /api/mentors
exports.getAllMentors = async (req, res) => {
  try {
    const { category, skill } = req.query;
    let query = {};

    if (category) query.category = category;
    if (skill) query.skills = { $in: [new RegExp(skill, 'i')] };

    const mentors = await Mentor.find(query).sort({ rating: -1 });
    res.status(200).json(mentors);
  } catch (error) {
    console.error('Error fetching mentors:', error);
    res.status(500).json({ message: 'Server Error fetching mentors' });
  }
};

// @desc    Register a User as a Mentor (With File Upload)
// @route   POST /api/mentors/register
exports.registerAsMentor = async (req, res) => {
  upload(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(500).json({ message: 'File Upload Error', error: err.message });
    } else if (err) {
      return res.status(500).json({ message: err.message });
    }

    try {
      const userId = req.user.id;
      let mentor = await Mentor.findOne({ userId });

      if (mentor) {
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(400).json({ message: 'User is already registered as a mentor' });
      }

      if (!req.file) {
        return res.status(400).json({ message: 'Please upload your ID Card for verification.' });
      }

      const { name, role, company, batch, skills, category, linkedIn } = req.body;

      mentor = new Mentor({
        userId,
        name,
        role,
        company,
        batch,
        skills: typeof skills === 'string' ? skills.split(',').map(s => s.trim()) : skills,
        category,
        linkedIn,
        idCardPath: req.file.path, 
        isAvailable: true,
        isVerified: false 
      });

      await mentor.save();
      res.status(201).json({ message: 'Registration successful! Waiting for verification.', mentor });

    } catch (error) {
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      console.error('Error registering mentor:', error);
      res.status(500).json({ message: 'Server Error registering mentor' });
    }
  });
};

// @desc    Send a "Guidance Request"
// @route   POST /api/mentors/:id/connect
exports.connectWithMentor = async (req, res) => {
  try {
    const mentorId = req.params.id;
    const mentor = await Mentor.findById(mentorId);

    if (!mentor) {
      return res.status(404).json({ message: 'Mentor not found' });
    }

    const connectionDetails = {
      mentorName: mentor.name,
      contact: mentor.linkedIn || "Contact via Email",
      status: "Request Sent"
    };

    res.status(200).json({ 
      success: true, 
      message: `Request sent to ${mentor.name}`, 
      data: connectionDetails 
    });

  } catch (error) {
    console.error('Error connecting with mentor:', error);
    res.status(500).json({ message: 'Server Error connecting with mentor' });
  }
};

// @desc    Get details of a specific mentor
// @route   GET /api/mentors/:id
exports.getMentorById = async (req, res) => {
  try {
    const mentor = await Mentor.findById(req.params.id);
    if (!mentor) {
      return res.status(404).json({ message: 'Mentor not found' });
    }
    res.json(mentor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Seed the database with default mentors (Development Only)
// @route   POST /api/mentors/seed
exports.seedMentors = async (req, res) => {
  try {
    const mentorSeeds = [
      {
        name: "Aditya Verma",
        email: "aditya.mentor@example.com",
        role: "SDE II",
        company: "Microsoft",
        skills: ["MERN Stack", "System Design", "Azure"],
        category: "Placements",
        batch: "2019-2023",
        isAvailable: true,
        isVerified: true
      },
      {
        name: "Sneha Reddy",
        email: "sneha.ai@example.com",
        role: "Data Scientist",
        company: "Google DeepMind",
        skills: ["Python", "TensorFlow", "NLP", "Generative AI"],
        category: "Projects",
        batch: "2018-2022",
        isAvailable: false,
        isVerified: true
      },
      {
        name: "Rohan Das",
        email: "rohan.core@example.com",
        role: "Embedded Engineer",
        company: "Qualcomm",
        skills: ["VLSI", "IoT", "C++", "Verilog"],
        category: "Internships",
        batch: "2020-2024",
        isAvailable: true,
        isVerified: true
      },
      {
        name: "Priya Sharma",
        email: "priya.sec@example.com",
        role: "Cyber Security Analyst",
        company: "Palo Alto Networks",
        skills: ["Network Security", "Ethical Hacking", "Cryptography"],
        category: "Placements",
        batch: "2019-2023",
        isAvailable: true,
        isVerified: true
      },
      {
        name: "Vikram Singh",
        email: "vikram.gate@example.com",
        role: "M.Tech Scholar",
        company: "IIT Bombay",
        skills: ["GATE Prep", "Algorithms", "Mathematics"],
        category: "Higher Studies",
        batch: "2021-2025",
        isAvailable: true,
        isVerified: true
      }
    ];

    let createdCount = 0;

    for (const seed of mentorSeeds) {
      // A. Find or Create User
      let user = await User.findOne({ email: seed.email });
      if (!user) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);
        
        user = new User({
          name: seed.name,
          email: seed.email,
          username: seed.email.split('@')[0], // ✅ FIXED: Added username to prevent Duplicate Key Error
          password: hashedPassword,
          year: "4th Year",
          branch: "CSE"
        });
        await user.save();
      }

      // B. Create Mentor if not exists
      const mentorExists = await Mentor.findOne({ userId: user._id });
      if (!mentorExists) {
        const newMentor = new Mentor({
          userId: user._id,
          name: seed.name,
          role: seed.role,
          company: seed.company,
          skills: seed.skills,
          category: seed.category,
          batch: seed.batch,
          isAvailable: seed.isAvailable,
          isVerified: seed.isVerified,
          linkedIn: "https://linkedin.com",
          idCardPath: "uploads/default_id.png"
        });
        await newMentor.save();
        createdCount++;
      }
    }

    res.status(201).json({ message: `Success! Added ${createdCount} new mentors.` });

  } catch (error) {
    console.error('Error seeding mentors:', error);
    // Graceful error handling for duplicate keys
    if (error.code === 11000) {
       return res.status(400).json({ message: 'Database Error: Duplicate data found. Try clearing your users collection first.' });
    }
    res.status(500).json({ message: 'Server Error seeding data' });
  }
};