require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./utils/db');
const path = require('path'); 
const seedAssessments = require('./utils/seedAssessments');

// --- 1. Import Routes ---
const authRoutes = require('./routes/auth');
const summarizeRoutes = require('./routes/summarizeRoutes');
const quizRoutes = require('./routes/quiz');
const visualizerRoutes = require('./routes/visualizerRoutes'); 
const articleRoutes = require('./routes/articles'); 
const timerRoutes = require('./routes/timer'); 
const pdfToolRoutes = require('./routes/pdfToolRoutes');
const plannerRoutes = require('./routes/planner');
const mentorRoutes = require('./routes/mentorRoutes');
const marketRoutes = require('./routes/marketRoutes');
const ragRoutes = require('./routes/ragRoutes');
const assessmentRoutes = require('./routes/assessmentRoutes'); // ✅ Tutor Skill Assessments & AI Skill Gap Engine

// --- 2. Connect to Database & Seed Initial Tutor Assessments ---
connectDB().then(() => {
  seedAssessments();
}).catch(err => console.warn('DB Connection / Seeding notice:', err.message));

const app = express();

// --- 3. Middleware ---
app.use(express.json({ limit: '30mb', extended: false }));
app.use(express.urlencoded({ limit: '30mb', extended: true }));

// Make the 'uploads' folder accessible so you can view ID cards
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- 4. Enable CORS ---
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5000',
  'http://localhost:5173',
  'https://project-frontend-kncn.onrender.com', 
  'http://192.168.255.147:3000',
  'http://192.168.255.147:5000',
  process.env.FRONTEND_URL,
  process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (
      allowedOrigins.includes(origin) ||
      origin.endsWith('.onrender.com') ||
      origin.endsWith('.render.com') ||
      origin.startsWith('http://192.168.') ||
      origin.startsWith('http://localhost:') ||
      origin.endsWith('.loca.lt')
    ) {
      return callback(null, true);
    }
    console.error(`❌ CORS Blocked: '${origin}' is NOT allowed`);
    return callback(new Error('CORS: Origin not allowed'), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-auth-token', 'Authorization', 'Bypass-Tunnel-Reminder']
}));

// --- Health Check ---
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date(),
    service: 'VidyaPath API Server',
    database: 'MongoDB Atlas',
    ragEnabled: true,
    tutorAssessmentsEnabled: true
  });
});

// --- 5. API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/rag', ragRoutes);
app.use('/api/assessments', assessmentRoutes); // ✅ Tutor Assessments & AI Skill Gap Diagnostics
app.use('/api/summarize', summarizeRoutes);
app.use('/api/quiz', quizRoutes); 
app.use('/api/visualizer', visualizerRoutes);
app.use('/api/articles', articleRoutes); 
app.use('/api/timer', timerRoutes);
app.use('/api/pdf-tools', pdfToolRoutes);
app.use('/api/planner', plannerRoutes);
app.use('/api/mentors', mentorRoutes);
app.use('/api/market', marketRoutes);

// --- Serve Static Frontend in Production (Single Web Service Fallback) ---
if (process.env.NODE_ENV === 'production') {
  const frontendBuildPath = path.join(__dirname, '../frontend/build');
  if (require('fs').existsSync(frontendBuildPath)) {
    app.use(express.static(frontendBuildPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(frontendBuildPath, 'index.html'));
    });
  }
}

// --- 6. Start Server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 VidyaPath Server running on port ${PORT}`));