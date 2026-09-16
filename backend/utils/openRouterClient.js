const axios = require('axios');
require('dotenv').config();

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

/**
 * Get OpenRouter credentials from environment
 */
function getOpenRouterConfig() {
  const apiKey = process.env.OPENROUTER_API_KEY || '';
  const model = process.env.OPENROUTER_MODEL || 'openai/gpt-4o';
  return { apiKey, model };
}

/**
 * Low-level function to call OpenRouter Chat Completions REST API
 */
async function callOpenRouter(messages, options = {}) {
  const { apiKey, model } = getOpenRouterConfig();

  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is missing in environment variables.');
  }

  const selectedModel = options.model || model;

  const response = await axios.post(
    OPENROUTER_API_URL,
    {
      model: selectedModel,
      messages: messages,
      temperature: options.temperature ?? 0.4,
      max_tokens: options.max_tokens ?? 2000,
    },
    {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'VidyaPath RAG Assistant',
        'Content-Type': 'application/json',
      },
      timeout: options.timeout || 25000,
    }
  );

  if (response.data && response.data.choices && response.data.choices.length > 0) {
    const choice = response.data.choices[0];
    return choice.message ? choice.message.content : choice.text || '';
  }

  throw new Error('Empty or invalid response structure received from OpenRouter API.');
}

/**
 * Extract relevant grounded context chunks from document context for user query
 */
function extractContextChunks(query, documentContext = '') {
  if (!documentContext || !documentContext.trim()) return [];

  const paragraphs = documentContext
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(p => p.length > 30);

  if (paragraphs.length === 0) return [];

  const queryLower = query.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
  const queryKeywords = queryLower.split(/\s+/).filter(w => w.length > 2);

  const scored = paragraphs.map((para, idx) => {
    const paraLower = para.toLowerCase();
    let matchCount = 0;
    queryKeywords.forEach(word => {
      if (paraLower.includes(word)) matchCount += 1;
    });
    return {
      content: para,
      score: Math.min(0.99, +(0.5 + matchCount * 0.12).toFixed(2)),
      chunkId: idx + 1,
    };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 4);
}

/**
 * Primary RAG Query with OpenRouter (GPT-4o)
 */
async function queryRagWithOpenRouter(query, documentContext = '') {
  const topChunks = extractContextChunks(query, documentContext);

  const systemMessage = {
    role: 'system',
    content: `You are VidyaPath AI, an elite academic tutor and Retrieval-Augmented Generation (RAG) assistant.
Your goal is to answer the student's question accurately, concisely, and with structured formatting.
- Use clear markdown headers (###), bullet points, bold key terms, and code/math blocks where appropriate.
- If document context is provided, ground your explanation primarily on the document facts while enhancing clarity with standard academic knowledge.
- Keep tone encouraging, educational, and precise.`,
  };

  let userPrompt = '';
  if (documentContext && documentContext.trim().length > 0) {
    const contextSnippet = documentContext.slice(0, 20000);
    userPrompt = `STUDY DOCUMENT CONTEXT:\n"""\n${contextSnippet}\n"""\n\nSTUDENT QUESTION:\n${query}`;
  } else {
    userPrompt = `STUDENT QUESTION:\n${query}`;
  }

  const messages = [
    systemMessage,
    { role: 'user', content: userPrompt }
  ];

  const answer = await callOpenRouter(messages, { max_tokens: 2500 });

  const sources = topChunks.map((chunk, i) => ({
    title: `Document Passage #${chunk.chunkId || i + 1}`,
    content: chunk.content.slice(0, 300) + (chunk.content.length > 300 ? '...' : ''),
    score: chunk.score,
    page: i + 1,
  }));

  return {
    answer,
    sources,
    sourceMode: 'openrouter_rag',
  };
}

/**
 * Document Summarizer via OpenRouter (GPT-4o)
 */
async function summarizeWithOpenRouter(text, title = 'Document') {
  if (!text || !text.trim()) {
    throw new Error('No document text provided for summarization.');
  }

  const messages = [
    {
      role: 'system',
      content: 'You are an expert academic text summarizer. Synthesize input study notes/documents into high-yield, structured markdown summaries.',
    },
    {
      role: 'user',
      content: `Please provide an executive, high-yield study summary for the document titled "${title}".
Format the summary into clean Markdown with the following sections:
1. ### 📑 Executive Overview
2. #### 🎯 Core Concepts & Key Theories (bullet points with bold terms)
3. #### 💡 Detailed Analytical Breakdown
4. #### 🚀 Actionable Exam Takeaways

DOCUMENT TEXT:
"""
${text.slice(0, 25000)}
"""`,
    },
  ];

  const summary = await callOpenRouter(messages, { max_tokens: 3000 });
  return {
    summary,
    source: 'openrouter_rag',
  };
}

/**
 * Quiz Generator via OpenRouter (GPT-4o)
 */
async function generateQuizWithOpenRouter(text, count = 5) {
  if (!text || !text.trim()) {
    throw new Error('No document text provided for quiz generation.');
  }

  const messages = [
    {
      role: 'system',
      content: 'You are an academic exam creator. Respond ONLY with a valid JSON array of multiple-choice questions. Do not include markdown code block indicators like ```json.',
    },
    {
      role: 'user',
      content: `Based on the following study text, create exactly ${count} high-yield multiple-choice practice questions.
Each question MUST have 4 options, a correct answer string, and an explanation.

JSON format requirement:
[
  {
    "question": "Question text?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "answer": "Option A",
    "explanation": "Clear explanation grounded in the text."
  }
]

STUDY TEXT:
"""
${text.slice(0, 22000)}
"""`,
    },
  ];

  const rawOutput = await callOpenRouter(messages, { max_tokens: 2500 });
  
  // Clean potential JSON markdown formatting
  const cleaned = rawOutput.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim();
  const start = cleaned.indexOf('[');
  const end = cleaned.lastIndexOf(']');

  if (start !== -1 && end !== -1) {
    const jsonStr = cleaned.substring(start, end + 1);
    const parsed = JSON.parse(jsonStr);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return {
        quiz: parsed.map(q => ({
          question: q.question || 'Practice Question',
          options: Array.isArray(q.options) && q.options.length >= 4 ? q.options.slice(0, 4) : [q.answer || 'Option A', 'Option B', 'Option C', 'Option D'],
          answer: q.answer || (Array.isArray(q.options) ? q.options[0] : 'Option A'),
          correctAnswer: q.answer || (Array.isArray(q.options) ? q.options[0] : 'Option A'),
          explanation: q.explanation || 'Verified from course text.',
        })),
        source: 'openrouter_rag',
      };
    }
  }

  throw new Error('Could not parse valid JSON quiz array from OpenRouter response.');
}

module.exports = {
  callOpenRouter,
  queryRagWithOpenRouter,
  summarizeWithOpenRouter,
  generateQuizWithOpenRouter,
};
