// backend/summarizeRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const pdfParse = require('pdf-parse');
// ✅ New Import
const { Mistral } = require('@mistralai/mistralai');
require('dotenv').config();

// --- Initialize Mistral Client ---
const mistral = new Mistral({
  apiKey: process.env.MISTRAL_API_KEY, // Make sure to add this to your .env file
});

// --- Multer setup for PDF uploads (Unchanged) ---
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Only PDF files are allowed!'), false);
  },
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
});

// --- Summarization helper ---
async function summarizeWithMistral(textToSummarize) {
  // Mistral has a context window, but it's generous (32k for small/medium).
  // We'll safe-guard at ~25k chars (~6-8k tokens) to leave room for the prompt and output.
  const MAX_CHARS = 25000; 
  if (textToSummarize.length > MAX_CHARS) {
    console.warn('⚠️ Text too long. Truncating for summarization.');
    textToSummarize = textToSummarize.substring(0, MAX_CHARS);
  }

  try {
    const response = await mistral.chat.complete({
      model: 'mistral-small-latest', // Good balance of speed and cost
      messages: [
        {
          role: 'user',
          content: `Summarize the following document clearly and concisely in markdown format (use bullet points if helpful):\n\n${textToSummarize}`,
        },
      ],
    });

    if (response && response.choices && response.choices.length > 0) {
      return response.choices[0].message.content;
    }
    throw new Error('Invalid or empty response from Mistral API.');
  } catch (err) {
    console.error('Error calling Mistral API:', err.message);
    throw new Error('Summary service (Mistral) failed to respond.');
  }
}

// --- Route handler ---
router.post('/', upload.single('pdfFile'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ msg: 'No PDF file uploaded.' });

    // --- Extract text from PDF ---
    const data = await pdfParse(req.file.buffer);
    const pdfText = data.text;

    if (!pdfText || !pdfText.trim()) {
      return res.status(400).json({ msg: 'Could not extract text from PDF or PDF is empty.' });
    }

    // --- Summarize with Mistral ---
    const summary = await summarizeWithMistral(pdfText);
    res.status(200).json({ summary });

  } catch (err) {
    console.error('--- ERROR IN SUMMARIZE ROUTE ---:', err);

    if (err.message.includes('Only PDF files')) {
      return res.status(400).json({ msg: 'Upload Error: Only PDF files are allowed.' });
    }
    if (err.message.includes('Summary service (Mistral)')) {
      return res.status(503).json({ msg: 'Summary service is temporarily unavailable.' });
    }

    res.status(500).json({ msg: 'An unexpected server error occurred.' });
  }
});

module.exports = router;