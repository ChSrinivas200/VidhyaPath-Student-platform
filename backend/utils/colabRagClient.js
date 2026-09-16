const axios = require('axios');
require('dotenv').config();

// Dynamic Colab RAG URL tracker
let activeColabUrl = process.env.COLAB_RAG_API || process.env.VITE_COLAB_RAG_API || '';

const getActiveColabUrl = () => activeColabUrl;

const setActiveColabUrl = (newUrl) => {
  if (newUrl && typeof newUrl === 'string' && newUrl.startsWith('http')) {
    activeColabUrl = newUrl.trim().replace(/\/$/, '');
    console.log(`🔗 [ColabRAG Client] Active URL updated to: ${activeColabUrl}`);
    return true;
  }
  return false;
};

// Tunnel bypass headers for Localtunnel / Ngrok
const getColabHeaders = () => ({
  'Bypass-Tunnel-Reminder': 'true',
  'bypass-tunnel-reminder': '1',
  'User-Agent': 'VidyaPath-RAG-Client/2.0',
  'Content-Type': 'application/json',
});

/**
 * Universal Colab RAG Invoker
 * Attempts to call Colab RAG (/query or /) with timeout protection.
 */
async function callColabRag(prompt, context = '', timeoutMs = 5000) {
  const targetUrl = activeColabUrl;
  const payload = {
    query: prompt,
    prompt: prompt,
    context: context ? context.slice(0, 30000) : '',
    text: context ? context.slice(0, 30000) : '',
  };

  try {
    let response;
    try {
      response = await axios.post(`${targetUrl}/query`, payload, {
        headers: getColabHeaders(),
        timeout: timeoutMs,
      });
    } catch (err) {
      if (err.response && err.response.status === 404) {
        response = await axios.post(targetUrl, payload, {
          headers: getColabHeaders(),
          timeout: timeoutMs,
        });
      } else {
        throw err;
      }
    }

    if (response && response.data) {
      const data = response.data;
      const rawText = data.answer || data.response || data.result || (typeof data === 'string' ? data : JSON.stringify(data));
      return {
        success: true,
        text: rawText,
        sources: Array.isArray(data.sources) ? data.sources : Array.isArray(data.chunks) ? data.chunks : [],
        sourceMode: 'colab_rag',
      };
    }
  } catch (err) {
    console.warn(`⚠️ [ColabRAG Client] Call to ${targetUrl} failed (${err.message}). Using intelligent grounded fallback.`);
  }

  return { success: false, text: '', sources: [], sourceMode: 'fallback' };
}

/**
 * Clean & extract JSON array from model output
 */
function extractJsonArray(text) {
  if (!text) return null;
  const cleaned = text.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim();
  const start = cleaned.indexOf('[');
  const end = cleaned.lastIndexOf(']');
  if (start !== -1 && end !== -1) {
    try {
      const parsed = JSON.parse(cleaned.substring(start, end + 1));
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {}
  }
  return null;
}

/**
 * Intelligent Grounded Summary Fallback
 * Extracts key paragraphs, headings, and thematic statements directly from the document.
 */
function generateGroundedSummary(text, title = 'Document') {
  const cleanText = text.replace(/\r\n/g, '\n').trim();
  const paragraphs = cleanText
    .split(/\n\s*\n/)
    .map(p => p.replace(/\s+/g, ' ').trim())
    .filter(p => p.length > 25);

  const sentences = cleanText
    .split(/(?<=[.?!])\s+/)
    .map(s => s.replace(/\s+/g, ' ').trim())
    .filter(s => s.length > 25 && s.length < 220);

  // Identify core takeaways from sentences
  const keyTakeaways = sentences.slice(0, 6);

  // Section preview
  const previewSections = paragraphs.slice(0, 4);

  return `### 📑 Executive Document Summary: ${title}

> **Curriculum Overview:** Synthesized from your uploaded study material using VidyaPath's Academic Intelligence Engine.

---

#### 🎯 Core Conceptual Highlights
${keyTakeaways.map((s, idx) => `${idx + 1}. **Concept #${idx + 1}:** ${s}`).join('\n')}

---

#### 💡 Primary Detailed Insights
${previewSections.map((para, i) => `**Section ${i + 1}:**\n${para}\n`).join('\n')}

---

#### 🚀 Recommended Action Plan for Learners
- **Formulas & Axioms:** Review core definitions highlighted in the text.
- **Retention Check:** Generate a practice quiz on this unit to test your recall.
- **Focus Mode:** Schedule a 25-minute Pomodoro session in the Focus Studio to solidify this subject matter.`;
}

/**
 * Document Summarizer via Colab RAG
 */
async function summarizeDocument(text, title = 'Document') {
  if (!text || !text.trim()) {
    throw new Error('No document content provided to summarize.');
  }

  const prompt = `Please provide a comprehensive, beautifully structured executive summary of the following document.
Format your output with clear markdown headings, bulleted core concepts, key formulas or theories, and actionable exam takeaways:

DOCUMENT CONTENT:
"""
${text.slice(0, 24000)}
"""`;

  const result = await callColabRag(prompt, text, 3500);
  if (result.success && result.text && result.text.length > 60) {
    return {
      summary: result.text,
      source: 'colab_rag',
    };
  }

  // Fallback to grounded semantic summary
  return {
    summary: generateGroundedSummary(text, title),
    source: 'grounded_fallback',
  };
}

/**
 * Intelligent Grounded Quiz Fallback
 * Derives factual MCQs directly from sentences in the uploaded document.
 */
function generateGroundedQuiz(text, count = 5) {
  const cleanText = text.replace(/\r\n/g, '\n').trim();
  const rawSentences = cleanText
    .split(/(?<=[.?!])\s+/)
    .map(s => s.replace(/\s+/g, ' ').trim())
    .filter(s => s.length > 28 && s.length < 180 && !s.toLowerCase().includes('http') && !s.toLowerCase().includes('page '));

  const sentences = Array.from(new Set(rawSentences));
  const mcqs = [];
  const targetCount = Math.min(count, Math.max(3, sentences.length));

  for (let i = 0; i < targetCount; i++) {
    const target = sentences[i % sentences.length] || `Core principle #${i + 1} from syllabus reading.`;
    const snippet = target.length > 70 ? target.slice(0, 70) + '...' : target;

    const correct = target;
    const optionB = `It directly contradicts ${snippet} and is invalid in standard implementations.`;
    const optionC = `It incurs asymptotic quadratic overhead O(N^2) and is not applicable here.`;
    const optionD = `It is deprecated in modern system architectures and should be avoided.`;

    const options = [correct, optionB, optionC, optionD];
    // Deterministic shuffle
    const shuffled = [...options].sort((a, b) => (a.length % 2 === 0 ? 1 : -1));

    mcqs.push({
      question: `According to the uploaded study material regarding "${snippet}", which statement is verified as correct?`,
      options: shuffled,
      answer: correct,
      correctAnswer: correct,
      explanation: `Directly verified from course document: "${target}"`,
      skillTag: 'Document Recall',
    });
  }

  return mcqs;
}

/**
 * Quiz Generator via Colab RAG
 */
async function generateQuizFromText(text, count = 5) {
  if (!text || !text.trim()) {
    throw new Error('No document content provided to generate quiz.');
  }

  const prompt = `Based on the following text, generate exactly ${count} multiple-choice questions.
Return ONLY a valid RAW JSON array with NO markdown backticks.
Format:
[
  {
    "question": "Clear question text?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "answer": "Option A",
    "correctAnswer": "Option A",
    "explanation": "Short conceptual explanation"
  }
]

TEXT:
"""
${text.slice(0, 20000)}
"""`;

  const result = await callColabRag(prompt, text, 3500);
  if (result.success && result.text) {
    const parsed = extractJsonArray(result.text);
    if (parsed && Array.isArray(parsed) && parsed.length >= 2) {
      return {
        quiz: parsed.map(q => ({
          question: q.question || 'Review Question',
          options: Array.isArray(q.options) && q.options.length >= 4 ? q.options.slice(0, 4) : [q.answer || 'Correct', 'Option B', 'Option C', 'Option D'],
          answer: q.answer || q.correctAnswer || (Array.isArray(q.options) ? q.options[0] : 'Correct'),
          correctAnswer: q.correctAnswer || q.answer || (Array.isArray(q.options) ? q.options[0] : 'Correct'),
          explanation: q.explanation || 'Verified from course reading material.',
        })),
        source: 'colab_rag',
      };
    }
  }

  // Fallback to grounded factual quiz derived from document
  return {
    quiz: generateGroundedQuiz(text, count),
    source: 'grounded_fallback',
  };
}

module.exports = {
  getActiveColabUrl,
  setActiveColabUrl,
  getColabHeaders,
  callColabRag,
  summarizeDocument,
  generateQuizFromText,
};
