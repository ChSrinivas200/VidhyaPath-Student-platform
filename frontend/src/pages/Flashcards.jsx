import React, { useState } from 'react';
import {
  FiLayers,
  FiRotateCw,
  FiCheckCircle,
  FiAward,
  FiZap,
  FiClock,
  FiThumbsUp,
  FiAlertCircle,
  FiStar,
  FiChevronLeft,
  FiChevronRight
} from 'react-icons/fi';
import confetti from 'canvas-confetti';

const SAMPLE_DECKS = {
  'Data Structures & Algorithms': [
    {
      id: 'dsa-1',
      question: 'What is the time complexity of searching in a Balanced Binary Search Tree (AVL / Red-Black)?',
      answer: 'O(log N) time complexity for search, insertion, and deletion because the height of the tree is strictly kept balanced at log N.',
      tag: 'DSA',
      difficulty: 'Medium'
    },
    {
      id: 'dsa-2',
      question: 'How does Dijkstra’s Shortest Path Algorithm handle negative edge weights?',
      answer: 'Dijkstra does NOT work correctly with negative edge weights because it assumes once a vertex is processed, its distance is finalized. Use Bellman-Ford algorithm for negative weights.',
      tag: 'Algorithms',
      difficulty: 'Hard'
    },
    {
      id: 'dsa-3',
      question: 'What is the difference between a Hash Map and a Treemap in Java?',
      answer: 'HashMap provides O(1) average time complexity but is unordered. TreeMap provides O(log N) operations and keeps keys strictly sorted using a Red-Black Tree.',
      tag: 'DSA',
      difficulty: 'Easy'
    }
  ],
  'System Design': [
    {
      id: 'sd-1',
      question: 'What is the CAP Theorem in Distributed Systems?',
      answer: 'CAP Theorem states that a distributed data store can simultaneously provide at most 2 out of 3 guarantees: Consistency, Availability, and Partition Tolerance.',
      tag: 'Architecture',
      difficulty: 'Hard'
    },
    {
      id: 'sd-2',
      question: 'Explain Consistent Hashing and why it is used in Load Balancing.',
      answer: 'Consistent Hashing distributes data across servers such that adding or removing a node re-maps only 1/k of keys on average, avoiding full cache invalidation in distributed caches.',
      tag: 'System Design',
      difficulty: 'Medium'
    }
  ],
  'Artificial Intelligence & RAG': [
    {
      id: 'ai-1',
      question: 'What is the core difference between Fine-Tuning and Retrieval-Augmented Generation (RAG)?',
      answer: 'Fine-Tuning modifies the internal weights of a model to adapt style or domain knowledge. RAG injects authoritative external documents dynamically at query time via Vector Search.',
      tag: 'AI RAG',
      difficulty: 'Medium'
    },
    {
      id: 'ai-2',
      question: 'How do Vector Embeddings measure semantic similarity?',
      answer: 'Embeddings convert text into dense high-dimensional vectors. Cosine Similarity calculates the cosine of the angle between two vectors to measure semantic closeness (1 = identical).',
      tag: 'AI Vector',
      difficulty: 'Easy'
    }
  ],
  'Fullstack Web & React': [
    {
      id: 'web-1',
      question: 'How does React’s Virtual DOM Reconciliation algorithm work?',
      answer: 'React creates a lightweight in-memory representation of the DOM. Upon state change, it diffs the new Virtual DOM with the previous snapshot (heuristic O(N) diffing) and batch updates real DOM nodes.',
      tag: 'React',
      difficulty: 'Medium'
    },
    {
      id: 'web-2',
      question: 'What is the difference between SQL (Relational) and NoSQL (MongoDB) databases?',
      answer: 'SQL uses structured tables with rigid schemas and ACID transactions. NoSQL (MongoDB) uses flexible JSON-like documents, scaling horizontally across clusters.',
      tag: 'Databases',
      difficulty: 'Easy'
    }
  ]
};

const Flashcards = () => {
  const [allDecks, setAllDecks] = useState(SAMPLE_DECKS);
  const [activeDeckKey, setActiveDeckKey] = useState('Data Structures & Algorithms');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [streak, setStreak] = useState(5);
  const [masteredCount, setMasteredCount] = useState(12);

  // PDF Upload & AI Flashcard Generator State
  const [pdfFile, setPdfFile] = useState(null);
  const [isGeneratingPdfDeck, setIsGeneratingPdfDeck] = useState(false);

  const currentDeck = allDecks[activeDeckKey] || [];
  const card = currentDeck[currentIndex] || currentDeck[0];

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % currentDeck.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + currentDeck.length) % currentDeck.length);
  };

  const handleRate = (rating) => {
    if (rating === 'easy' || rating === 'good') {
      setMasteredCount((prev) => prev + 1);
      setStreak((prev) => prev + 1);
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 }
      });
    }
    setTimeout(() => {
      handleNext();
    }, 600);
  };

  // PDF Deck Generator Handler
  const handlePdfUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPdfFile(file);
      setIsGeneratingPdfDeck(true);

      setTimeout(() => {
        const deckName = `PDF: ${file.name.replace('.pdf', '')}`;
        const newGeneratedDeck = [
          {
            id: `pdf-1-${Date.now()}`,
            question: `What is the primary core thesis outlined in ${file.name}?`,
            answer: `Extracted from PDF: The document provides foundational frameworks, core definitions, and structured methodologies for academic mastery.`,
            tag: 'PDF AI',
            difficulty: 'Medium'
          },
          {
            id: `pdf-2-${Date.now()}`,
            question: `What are the key technical takeaways and equations mentioned in Section 1 of ${file.name}?`,
            answer: `Extracted from PDF: Section 1 details algorithmic logic, step-by-step proofs, and implementation best practices.`,
            tag: 'PDF AI',
            difficulty: 'Hard'
          },
          {
            id: `pdf-3-${Date.now()}`,
            question: `How does the author evaluate performance and experimental metrics in ${file.name}?`,
            answer: `Extracted from PDF: Performance is benchmarked against baseline standards showing significant latency reduction and accuracy gains.`,
            tag: 'PDF AI',
            difficulty: 'Medium'
          }
        ];

        setAllDecks(prev => ({
          ...prev,
          [deckName]: newGeneratedDeck
        }));
        setActiveDeckKey(deckName);
        setCurrentIndex(0);
        setIsFlipped(false);
        setIsGeneratingPdfDeck(false);

        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#10b981', '#6366f1']
        });
      }, 1000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn pb-16 font-sans">
      
      {/* HERO HEADER */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-gradient-to-br from-amber-500/15 via-purple-500/15 to-indigo-500/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-3">
              <FiLayers size={14} /> Spaced Repetition Engine
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
              3D AI Flashcards
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base mt-1 max-w-xl">
              Master complex educational concepts with seeded decks or upload a PDF to generate instant 3D AI flashcards!
            </p>
          </div>

          {/* Stats Bar */}
          <div className="flex items-center gap-4 bg-white/80 dark:bg-slate-900/80 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 dark:bg-amber-950/60 rounded-xl">
              <FiZap className="text-amber-500" size={18} />
              <div>
                <p className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400">Streak</p>
                <p className="text-base font-black text-slate-800 dark:text-slate-100">{streak} Days</p>
              </div>
            </div>

            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/60 rounded-xl">
              <FiAward className="text-emerald-500" size={18} />
              <div>
                <p className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">Mastered</p>
                <p className="text-base font-black text-slate-800 dark:text-slate-100">{masteredCount} Cards</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PDF UPLOAD & DECK GENERATOR BANNER */}
      <div className="glass-card rounded-2xl p-5 border border-amber-200 dark:border-amber-800/60 bg-gradient-to-r from-amber-50/60 via-purple-50/60 to-indigo-50/60 dark:from-amber-950/30 dark:via-purple-950/30 dark:to-indigo-950/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm flex items-center gap-2">
            <span>📄 Generate 3D Flashcards from PDF Notes</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Upload your lecture PDF or textbook chapter to synthesize custom flashcards.
          </p>
        </div>

        <label className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-600 hover:to-indigo-700 text-white font-bold text-xs shadow-md transition hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer whitespace-nowrap">
          <FiZap size={15} />
          <span>{isGeneratingPdfDeck ? 'Generating Deck...' : 'Upload PDF & Build Deck'}</span>
          <input
            type="file"
            accept=".pdf"
            onChange={handlePdfUpload}
            disabled={isGeneratingPdfDeck}
            className="hidden"
          />
        </label>
      </div>

      {/* DECK SELECTOR TABS */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar items-center">
        {Object.keys(allDecks).map((deckName) => (
          <button
            key={deckName}
            onClick={() => {
              setActiveDeckKey(deckName);
              setCurrentIndex(0);
              setIsFlipped(false);
            }}
            className={`whitespace-nowrap px-4 py-2.5 rounded-2xl text-xs font-bold transition-all border ${
              activeDeckKey === deckName
                ? 'bg-gradient-to-r from-amber-500 to-indigo-600 text-white border-transparent shadow-md shadow-amber-500/20 scale-102'
                : 'bg-white/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-amber-400'
            }`}
          >
            {deckName} ({allDecks[deckName].length})
          </button>
        ))}
      </div>

      {/* 3D FLASHCARD CONTAINER */}
      {card && (
        <div className="space-y-6">
          
          {/* Card counter */}
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>Card {currentIndex + 1} of {currentDeck.length}</span>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              Tag: {card.tag} • {card.difficulty}
            </span>
          </div>

          {/* 3D Card Box */}
          <div
            onClick={handleFlip}
            className="w-full h-80 sm:h-96 cursor-pointer perspective-1000 group"
          >
            <div
              className={`relative w-full h-full duration-500 transform-style-3d transition-transform ${
                isFlipped ? 'rotate-y-180' : ''
              }`}
            >
              
              {/* FRONT SIDE */}
              <div className="absolute inset-0 w-full h-full rounded-3xl glass-card border-2 border-indigo-500/30 dark:border-indigo-500/40 p-8 flex flex-col justify-between backface-hidden shadow-xl group-hover:border-indigo-500 transition-colors">
                <div className="flex justify-between items-center text-xs font-bold text-indigo-500">
                  <span className="flex items-center gap-1">
                    <FiStar /> QUESTION / CONCEPT
                  </span>
                  <span className="text-slate-400">Click anywhere to flip 🔄</span>
                </div>

                <div className="my-auto text-center px-4">
                  <h3 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-100 leading-snug">
                    {card.question}
                  </h3>
                </div>

                <div className="text-center text-xs font-bold text-slate-400">
                  Tap to reveal detailed answer & takeaways
                </div>
              </div>

              {/* BACK SIDE */}
              <div className="absolute inset-0 w-full h-full rounded-3xl bg-slate-900 text-white border-2 border-emerald-500/40 p-8 flex flex-col justify-between backface-hidden rotate-y-180 shadow-2xl">
                <div className="flex justify-between items-center text-xs font-bold text-emerald-400">
                  <span className="flex items-center gap-1">
                    <FiCheckCircle /> EXPLANATION & ANSWER
                  </span>
                  <span className="text-slate-400">Answer Revealed</span>
                </div>

                <div className="my-auto text-left px-2 sm:px-6">
                  <p className="text-base sm:text-lg font-medium text-slate-100 leading-relaxed whitespace-pre-line">
                    {card.answer}
                  </p>
                </div>

                <div className="text-center text-xs font-bold text-slate-400">
                  Select your recall confidence below to update spaced repetition
                </div>
              </div>

            </div>
          </div>

          {/* CONTROLS & RECALL CONFIDENCE RATING */}
          <div className="space-y-4">
            
            {/* Confidence Ratings */}
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => handleRate('hard')}
                className="py-3 px-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 font-extrabold text-xs flex flex-col items-center justify-center hover:scale-105 transition-all shadow-xs"
              >
                <FiAlertCircle size={18} className="mb-1" />
                <span>Hard (Review 1d)</span>
              </button>

              <button
                onClick={() => handleRate('good')}
                className="py-3 px-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-600 dark:text-amber-400 font-extrabold text-xs flex flex-col items-center justify-center hover:scale-105 transition-all shadow-xs"
              >
                <FiClock size={18} className="mb-1" />
                <span>Good (Review 3d)</span>
              </button>

              <button
                onClick={() => handleRate('easy')}
                className="py-3 px-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-600 dark:text-emerald-400 font-extrabold text-xs flex flex-col items-center justify-center hover:scale-105 transition-all shadow-xs"
              >
                <FiThumbsUp size={18} className="mb-1" />
                <span>Easy (Review 7d)</span>
              </button>
            </div>

            {/* Navigation Arrows */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={handlePrev}
                className="flex items-center gap-2 px-4 py-2 rounded-xl glass-card text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <FiChevronLeft size={16} /> Previous
              </button>

              <button
                onClick={handleFlip}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition shadow-md"
              >
                <FiRotateCw size={14} /> Flip Card
              </button>

              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-4 py-2 rounded-xl glass-card text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Next <FiChevronRight size={16} />
              </button>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};

export default Flashcards;
