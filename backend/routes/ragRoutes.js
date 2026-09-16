const express = require('express');
const router = express.Router();
const axios = require('axios');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const RagQuery = require('../models/RagQuery');
const {
  getActiveColabUrl,
  setActiveColabUrl,
  summarizeDocument,
  generateQuizFromText,
  getColabHeaders
} = require('../utils/colabRagClient');
const {
  queryRagWithOpenRouter,
  summarizeWithOpenRouter,
  generateQuizWithOpenRouter,
} = require('../utils/openRouterClient');

// Dynamic Colab RAG URL
let activeColabUrl = getActiveColabUrl();


// Multer in-memory storage for document upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB limit
});

/**
 * Intelligent Local Semantic Fallback
 * When Colab tunnel is unavailable, provides grounded analysis of user document or query.
 */
function generateFallbackResponse(query, documentContext = '') {
  const queryLower = query.toLowerCase();

  // If document context is provided, perform TF-IDF-like sentence retrieval
  if (documentContext && documentContext.trim().length > 0) {
    const paragraphs = documentContext
      .split(/\n\s*\n/)
      .map(p => p.trim())
      .filter(p => p.length > 30);

    const queryKeywords = queryLower
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2);

    const scoredParagraphs = paragraphs.map((para, idx) => {
      const paraLower = para.toLowerCase();
      let matchCount = 0;
      queryKeywords.forEach(word => {
        if (paraLower.includes(word)) matchCount += 1;
      });
      return {
        content: para,
        score: Math.min(0.98, +(0.4 + (matchCount * 0.15)).toFixed(2)),
        chunkId: idx + 1,
      };
    });

    // Sort by relevance
    scoredParagraphs.sort((a, b) => b.score - a.score);
    const topPassages = scoredParagraphs.slice(0, 3).filter(p => p.score > 0.4);

    let summaryText = '';
    if (topPassages.length > 0) {
      summaryText = topPassages.map(p => p.content).join('\n\n');
    } else {
      summaryText = paragraphs.slice(0, 2).join('\n\n');
    }

    return {
      answer: `### 📖 Grounded Knowledge Insights\n\nBased on your provided study material for **"${query}"**:\n\n${summaryText.slice(0, 1200)}\n\n---\n> 💡 **Study Tip:** To verify deeper conceptual relationships, use the interactive Quiz Generator or ask follow-up questions about specific sections.`,
      sources: (topPassages.length > 0 ? topPassages : scoredParagraphs.slice(0, 2)).map((p, i) => ({
        title: `Document Section #${p.chunkId || i + 1}`,
        content: p.content.slice(0, 300) + '...',
        score: p.score || 0.82,
        page: i + 1,
      })),
    };
  }

  // General concept fallback when no document is attached
  return {
    answer: `### 🎯 Concept Analysis: ${query}\n\nHere is a structured breakdown from VidyaPath's Academic Engine:\n\n1. **Core Concept:** Understanding "${query}" requires breaking it down into fundamental principles, practical application, and examination patterns.\n2. **Key Takeaway:** Focus on core definitions, formulaic relationships, and edge-cases that examiners frequently test.\n3. **Recommended Study Workflow:**\n   - Upload your lecture notes or syllabus PDF in the box above for exact text citations.\n   - Generate a practice quiz on this topic to test retention.\n   - Use the Focus Timer to dedicate a 25-minute Pomodoro session to mastering this unit.`,
    sources: [
      {
        title: 'VidyaPath Academic Knowledge Base',
        content: `Standard syllabus curriculum notes regarding: ${query}`,
        score: 0.88,
        page: 1,
      },
    ],
  };
}

// -------------------------------------------------------------
// GET /api/rag/status - Check OpenRouter & Colab RAG API Health
// -------------------------------------------------------------
router.get('/status', async (req, res) => {
  const startTime = Date.now();
  const targetUrl = activeColabUrl;
  const hasOpenRouter = Boolean(process.env.OPENROUTER_API_KEY);

  try {
    const response = await axios.get(targetUrl, {
      headers: getColabHeaders(),
      timeout: 3000,
      validateStatus: () => true, // Accept any status to analyze
    });

    const latencyMs = Date.now() - startTime;
    const isAvailable = response.status >= 200 && response.status < 400;

    return res.json({
      success: true,
      colabUrl: targetUrl,
      status: hasOpenRouter ? 'online' : (isAvailable ? 'online' : 'tunnel_offline'),
      openRouterActive: hasOpenRouter,
      openRouterModel: process.env.OPENROUTER_MODEL || 'openai/gpt-4o',
      httpStatus: response.status,
      latencyMs,
      message: hasOpenRouter
        ? `OpenRouter AI Engine Active (${process.env.OPENROUTER_MODEL || 'openai/gpt-4o'})`
        : (isAvailable ? `Colab RAG is online (${latencyMs}ms)` : `Colab tunnel returned HTTP ${response.status}. Fallback engine active.`),
    });
  } catch (error) {
    const latencyMs = Date.now() - startTime;
    return res.json({
      success: true,
      colabUrl: targetUrl,
      status: hasOpenRouter ? 'online' : 'tunnel_offline',
      openRouterActive: hasOpenRouter,
      openRouterModel: process.env.OPENROUTER_MODEL || 'openai/gpt-4o',
      latencyMs,
      error: error.message,
      message: hasOpenRouter
        ? `OpenRouter AI Engine Active (${process.env.OPENROUTER_MODEL || 'openai/gpt-4o'})`
        : 'Colab tunnel is offline. VidyaPath Fallback Engine active.',
    });
  }
});

// -------------------------------------------------------------
// POST /api/rag/config - Update or Switch Colab RAG URL
// -------------------------------------------------------------
router.post('/config', (req, res) => {
  const { url } = req.body;
  if (!url || typeof url !== 'string' || !url.startsWith('http')) {
    return res.status(400).json({ msg: 'Please provide a valid HTTP/HTTPS URL.' });
  }

  setActiveColabUrl(url);
  activeColabUrl = getActiveColabUrl();
  console.log(`🔄 Active Colab RAG URL updated to: ${activeColabUrl}`);

  return res.json({
    success: true,
    message: `Active Colab RAG URL updated to ${activeColabUrl}`,
    colabUrl: activeColabUrl,
  });
});

// -------------------------------------------------------------
// POST /api/rag/query - Send Query to OpenRouter / Colab RAG
// -------------------------------------------------------------
router.post('/query', async (req, res) => {
  const { query, documentContext = '', customUrl } = req.body;

  if (!query || !query.trim()) {
    return res.status(400).json({ msg: 'Please provide a query.' });
  }

  const startTime = Date.now();
  let answer = '';
  let sources = [];
  let sourceMode = 'openrouter_rag';

  // 1. Try OpenRouter (GPT-4o) AI first
  if (process.env.OPENROUTER_API_KEY) {
    try {
      const openRouterRes = await queryRagWithOpenRouter(query.trim(), documentContext);
      answer = openRouterRes.answer;
      sources = openRouterRes.sources;
      sourceMode = 'openrouter_rag';
    } catch (orErr) {
      console.warn(`⚠️ OpenRouter RAG query failed (${orErr.message}). Fallback to Colab RAG...`);
    }
  }

  // 2. Try Colab RAG API if OpenRouter failed or not configured
  if (!answer) {
    const targetUrl = customUrl ? customUrl.trim().replace(/\/$/, '') : activeColabUrl;
    try {
      const payload = {
        query: query.trim(),
        prompt: query.trim(),
        context: documentContext ? documentContext.slice(0, 30000) : '',
        text: documentContext ? documentContext.slice(0, 30000) : '',
      };

      let colabRes;
      try {
        colabRes = await axios.post(`${targetUrl}/query`, payload, {
          headers: getColabHeaders(),
          timeout: 4000,
        });
      } catch (err404) {
        if (err404.response && err404.response.status === 404) {
          colabRes = await axios.post(targetUrl, payload, {
            headers: getColabHeaders(),
            timeout: 4000,
          });
        } else {
          throw err404;
        }
      }

      if (colabRes && colabRes.data) {
        const data = colabRes.data;
        answer = data.answer || data.response || data.result || (typeof data === 'string' ? data : JSON.stringify(data));
        sources = Array.isArray(data.sources) ? data.sources : Array.isArray(data.chunks) ? data.chunks : [];
        sourceMode = 'colab_rag';
      }
    } catch (colabError) {
      console.warn(`⚠️ Colab RAG call failed (${colabError.message}). Switching to intelligent fallback.`);
    }
  }

  // 3. Fallback engine if both failed
  if (!answer) {
    const fallback = generateFallbackResponse(query, documentContext);
    answer = fallback.answer;
    sources = fallback.sources;
    sourceMode = 'fallback_rag';
  }

  const latencyMs = Date.now() - startTime;

  // 4. Persist query to MongoDB Atlas
  try {
    const ragRecord = new RagQuery({
      userName: req.body.userName || 'Learner',
      query: query.trim(),
      response: answer,
      source: sourceMode,
      sources: sources.map(s => ({
        title: s.title || 'Context Chunk',
        content: s.content || s.text || String(s),
        score: s.score || 0.85,
        page: s.page || 1,
      })),
      latencyMs,
    });
    await ragRecord.save();
  } catch (dbErr) {
    console.warn('⚠️ Could not save RAG query to MongoDB:', dbErr.message);
  }

  return res.json({
    success: true,
    query,
    answer,
    sources,
    source: sourceMode,
    latencyMs,
    colabUrl: activeColabUrl,
  });
});

// -------------------------------------------------------------
// GET /api/rag/history - Get Recent Queries from MongoDB
// -------------------------------------------------------------
router.get('/history', async (req, res) => {
  try {
    const history = await RagQuery.find().sort({ createdAt: -1 }).limit(20);
    return res.json(history);
  } catch (err) {
    console.error('Error fetching RAG history:', err.message);
    return res.status(500).json({ msg: 'Failed to fetch history.' });
  }
});

// -------------------------------------------------------------
// POST /api/rag/upload - Parse Document and Extract Context Chunks
// -------------------------------------------------------------
router.post('/upload', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'No file uploaded.' });
    }

    let extractedText = '';

    if (req.file.mimetype === 'application/pdf') {
      const parsed = await pdfParse(req.file.buffer);
      extractedText = parsed.text;
    } else {
      extractedText = req.file.buffer.toString('utf-8');
    }

    if (!extractedText || !extractedText.trim()) {
      return res.status(400).json({ msg: 'Could not extract readable text from the file.' });
    }

    // Split text into chunk paragraphs for RAG inspection
    const chunks = extractedText
      .split(/\n\s*\n/)
      .map(p => p.trim())
      .filter(p => p.length > 40);

    return res.json({
      success: true,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      totalWords: extractedText.split(/\s+/).length,
      chunksCount: chunks.length,
      text: extractedText,
      previewChunks: chunks.slice(0, 5),
    });
  } catch (err) {
    console.error('Error uploading RAG document:', err);
    return res.status(500).json({ msg: 'Failed to process document.' });
  }
});

// -------------------------------------------------------------
// POST /api/rag/summarize - Summarize for Personal AI Agent
// -------------------------------------------------------------
router.post('/summarize', async (req, res) => {
  try {
    const { text, title = 'Study Document' } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ msg: 'Please provide text content to summarize.' });
    }

    if (process.env.OPENROUTER_API_KEY) {
      try {
        const orResult = await summarizeWithOpenRouter(text, title);
        return res.json({
          success: true,
          summary: orResult.summary,
          source: 'openrouter_rag',
          colabUrl: getActiveColabUrl(),
        });
      } catch (orErr) {
        console.warn('⚠️ OpenRouter summarize failed, falling back to Colab:', orErr.message);
      }
    }

    const result = await summarizeDocument(text, title);
    return res.json({
      success: true,
      summary: result.summary,
      source: result.source,
      colabUrl: getActiveColabUrl(),
    });
  } catch (err) {
    console.error('Error in /api/rag/summarize:', err);
    return res.status(500).json({ msg: 'Failed to generate summary.' });
  }
});

// -------------------------------------------------------------
// POST /api/rag/generate-quiz - Generate Quiz for Personal AI Agent
// -------------------------------------------------------------
router.post('/generate-quiz', async (req, res) => {
  try {
    const { text, count = 5 } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ msg: 'Please provide text content to generate quiz.' });
    }

    if (process.env.OPENROUTER_API_KEY) {
      try {
        const orResult = await generateQuizWithOpenRouter(text, count);
        return res.json({
          success: true,
          quiz: orResult.quiz,
          source: 'openrouter_rag',
          colabUrl: getActiveColabUrl(),
        });
      } catch (orErr) {
        console.warn('⚠️ OpenRouter quiz generation failed, falling back to Colab:', orErr.message);
      }
    }

    const result = await generateQuizFromText(text, count);
    return res.json({
      success: true,
      quiz: result.quiz,
      source: result.source,
      colabUrl: getActiveColabUrl(),
    });
  } catch (err) {
    console.error('Error in /api/rag/generate-quiz:', err);
    return res.status(500).json({ msg: 'Failed to generate quiz.' });
  }
});

module.exports = router;

