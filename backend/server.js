require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./utils/db');
const path = require('path'); 

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
const marketRoutes = require('./routes/marketRoutes'); // ✅ NEW: Import Market Routes

// --- 2. Connect to Database ---
connectDB();

const app = express();

// --- 3. Middleware ---
app.use(express.json({ extended: false }));

// Make the 'uploads' folder accessible so you can view ID cards
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- 4. Enable CORS ---
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5000', 
  'http://192.168.255.147:3000',
  'http://192.168.255.147:5000'  
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || origin.startsWith('http://192.168.')) {
      return callback(null, true);
    }
    console.error(`❌ CORS Blocked: '${origin}' is NOT allowed`);
    return callback(new Error('CORS: Origin not allowed'), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));

// --- 5. API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/summarize', summarizeRoutes);
app.use('/api/quiz', quizRoutes); 
app.use('/api/visualizer', visualizerRoutes);
app.use('/api/articles', articleRoutes); 
app.use('/api/timer', timerRoutes);
app.use('/api/pdf-tools', pdfToolRoutes);
app.use('/api/planner', plannerRoutes);
app.use('/api/mentors', mentorRoutes);
app.use('/api/market', marketRoutes); // ✅ NEW: StudentBasket API is live

// --- 6. Start Server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));