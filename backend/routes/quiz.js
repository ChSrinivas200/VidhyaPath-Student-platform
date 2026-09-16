// backend/routes/quiz.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const pdfParse = require('pdf-parse');
const { generateQuizFromText, getActiveColabUrl } = require('../utils/colabRagClient');

// Memory storage for PDF uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
});

// Route: POST /api/quiz/generate
router.post('/generate', upload.single('pdfFile'), async (req, res) => {
  try {
    let extractedText = '';
    const questionCount = parseInt(req.body.count || req.body.questionCount || '5', 10);

    // 1. Extract Text from PDF or Body
    if (req.file) {
      try {
        const pdfData = await pdfParse(req.file.buffer);
        extractedText = pdfData.text;
      } catch (err) {
        console.error('PDF Read Error:', err.message);
        return res.status(400).json({ error: 'Failed to read PDF. Please ensure the document is not password-protected.' });
      }
    } else if (req.body.text || req.body.content || req.body.topic) {
      extractedText = req.body.text || req.body.content || req.body.topic;
    } else {
      return res.status(400).json({ error: 'No PDF uploaded or text provided. Please select a study document.' });
    }

    // Check if text is too short
    if (!extractedText || extractedText.trim().length < 40) {
      return res.status(400).json({
        error: 'The uploaded document contains insufficient text to generate quiz questions.',
      });
    }

    // 2. Synthesize MCQs via Google Colab RAG with Grounded Fallback
    const result = await generateQuizFromText(extractedText, questionCount);

    return res.json({
      quiz: result.quiz,
      source: result.source,
      colabUrl: getActiveColabUrl(),
    });
  } catch (error) {
    console.error('Quiz Generation Server Error:', error);
    return res.status(500).json({
      error: 'An unexpected error occurred while generating the quiz.',
      message: error.message,
    });
  }
});

module.exports = router;