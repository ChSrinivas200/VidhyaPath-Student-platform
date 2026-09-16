// backend/routes/summarizeRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const pdfParse = require('pdf-parse');
const { summarizeDocument, getActiveColabUrl } = require('../utils/colabRagClient');
require('dotenv').config();

// --- Multer setup for PDF uploads ---
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf')) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed!'), false);
    }
  },
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
});

// --- POST /api/summarize ---
router.post('/', upload.single('pdfFile'), async (req, res) => {
  try {
    let textToSummarize = '';
    let docTitle = 'Uploaded Study Document';

    if (req.file) {
      docTitle = req.file.originalname.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      try {
        const data = await pdfParse(req.file.buffer);
        textToSummarize = data.text;
      } catch (pdfErr) {
        console.error('PDF Parse Error:', pdfErr);
        return res.status(400).json({ msg: 'Could not extract text from the uploaded PDF document.' });
      }
    } else if (req.body.text || req.body.content) {
      textToSummarize = req.body.text || req.body.content;
      if (req.body.title) docTitle = req.body.title;
    } else {
      return res.status(400).json({ msg: 'Please upload a PDF file or provide text to summarize.' });
    }

    if (!textToSummarize || !textToSummarize.trim()) {
      return res.status(400).json({ msg: 'Document content is empty or contains unreadable scanned images.' });
    }

    // Call Colab RAG Summarization Engine with grounded fallback
    const result = await summarizeDocument(textToSummarize, docTitle);

    return res.status(200).json({
      summary: result.summary,
      source: result.source,
      colabUrl: getActiveColabUrl(),
    });
  } catch (err) {
    console.error('--- ERROR IN SUMMARIZE ROUTE ---:', err);

    if (err.message.includes('Only PDF files')) {
      return res.status(400).json({ msg: 'Upload Error: Only PDF files are allowed.' });
    }

    return res.status(500).json({ msg: 'An error occurred during summarization. Please try again.' });
  }
});

module.exports = router;
