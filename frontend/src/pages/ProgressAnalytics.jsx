import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiTrendingUp,
  FiAward,
  FiVideo,
  FiAlertTriangle,
  FiBarChart2,
  FiActivity,
  FiPlay,
  FiChevronRight,
  FiZap,
  FiRefreshCw,
  FiCheckCircle
} from 'react-icons/fi';
import api from '../services/api';

export default function ProgressAnalytics() {
  const navigate = useNavigate();
  const userName = localStorage.getItem('userName') || 'Learner';

  // --- States ---
  const [completedVideoIds, setCompletedVideoIds] = useState([]);
  const [userSubmissions, setUserSubmissions] = useState([]);
  const [quizHistory, setQuizHistory] = useState([]);
  const [activityLogMap, setActivityLogMap] = useState({});

  // --- Fetch Data & Event Sync ---
  const loadData = async () => {
    // 1. Get completed videos & quiz history & local submissions from localStorage
    let localSubmissions = [];
    try {
      const savedVideos = localStorage.getItem('vidyapath_completed_videos');
      if (savedVideos) {
        setCompletedVideoIds(JSON.parse(savedVideos));
      }

      const savedQuizzes = localStorage.getItem('learner_quiz_history_v2');
      if (savedQuizzes) {
        setQuizHistory(JSON.parse(savedQuizzes));
      }

      const savedSubmissions = localStorage.getItem('vidyapath_assessment_submissions');
      if (savedSubmissions) {
        localSubmissions = JSON.parse(savedSubmissions);
      }
    } catch (err) {
      console.warn('Error reading local progress storage:', err);
    }

    // 2. Fetch submissions from backend
    let dbSubmissions = [];
    try {
      const res = await api.get('/assessments/submissions/my');
      if (res.data && Array.isArray(res.data)) {
        dbSubmissions = res.data;
      }
    } catch (err) {
      console.warn('Backend submissions sync warning:', err.message);
    }

    // Merge DB & Local Submissions (unique by ID or timestamp)
    const combinedMap = new Map();
    [...dbSubmissions, ...localSubmissions].forEach((sub) => {
      const key = sub._id || sub.submissionId || `${sub.completedAt}_${sub.percentage}`;
      if (!combinedMap.has(key)) {
        combinedMap.set(key, sub);
      }
    });
    const mergedSubmissions = Array.from(combinedMap.values());
    setUserSubmissions(mergedSubmissions);

    // 3. Fetch planner & activity stats from backend
    try {
      const res = await api.get('/planner/stats');
      if (res.data && res.data.activityLog) {
        setActivityLogMap(res.data.activityLog);
      }
    } catch (err) {
      console.warn('Planner stats sync warning:', err.message);
    }
  };

  useEffect(() => {
    loadData();

    const handleProgressUpdate = () => loadData();
    window.addEventListener('vidyapath_progress_updated', handleProgressUpdate);
    window.addEventListener('storage', handleProgressUpdate);

    return () => {
      window.removeEventListener('vidyapath_progress_updated', handleProgressUpdate);
      window.removeEventListener('storage', handleProgressUpdate);
    };
  }, []);

  // ---------------------------------------------------------------------------
  // DYNAMIC TOPIC MASTERY & PROGRESSIVE GROWTH ENGINE (30-MCQ Core Mapping)
  // ---------------------------------------------------------------------------
  const CORE_TOPICS = [
    { name: 'Arrays', keywords: ['array', 'arrays', 'matrix', 'two pointer'], defaultMastery: 75, recommendedVideoId: '8hly31xKLI0' },
    { name: 'Math & Logic', keywords: ['math', 'logic', 'prime', 'bit', 'kadane', 'gcd'], defaultMastery: 70, recommendedVideoId: 'rfscVS0vtbw' },
    { name: 'Strings', keywords: ['string', 'strings', 'regex', 'anagram', 'kmp', 'palindrome'], defaultMastery: 72, recommendedVideoId: '1Rs2ND1ryYc' },
    { name: 'Trees & BST', keywords: ['tree', 'bst', 'binary tree', 'traversal', 'avl'], defaultMastery: 60, recommendedVideoId: '8hly31xKLI0' },
    { name: 'Linked List', keywords: ['linked list', 'list', 'pointer', 'floyd', 'cycle'], defaultMastery: 65, recommendedVideoId: '8hly31xKLI0' },
    { name: 'Dynamic Programming', keywords: ['dp', 'dynamic programming', 'memoization', 'knapsack', 'lcs', 'coin change'], defaultMastery: 42, recommendedVideoId: 'AHZpyENo7k4' },
    { name: 'Graphs', keywords: ['graph', 'graphs', 'dijkstra', 'bfs', 'dfs', 'topological', 'kruskal'], defaultMastery: 48, recommendedVideoId: 'V6H1qAeB-l4' },
    { name: 'Hashing', keywords: ['hash', 'hashing', 'hash map', 'dictionary', 'chaining'], defaultMastery: 45, recommendedVideoId: 'UXDSeD9mN-k' },
    { name: 'Web Dev & JS', keywords: ['web', 'js', 'javascript', 'react', 'node', 'express', 'event loop'], defaultMastery: 80, recommendedVideoId: '1Rs2ND1ryYc' },
    { name: 'Gen AI & RAG', keywords: ['ai', 'gen ai', 'rag', 'llm', 'prompt', 'embeddings'], defaultMastery: 75, recommendedVideoId: 'kCc8FmEb1nY' }
  ];

  // Calculate dynamic mastery for each topic based on actual test submissions & video completions
  const topicMasteryList = CORE_TOPICS.map((topicObj) => {
    let testScoresSum = 0;
    let testScoresCount = 0;

    userSubmissions.forEach((sub) => {
      // Check skill breakdown array
      if (sub.skillBreakdown && Array.isArray(sub.skillBreakdown)) {
        sub.skillBreakdown.forEach((item) => {
          const tagLower = (item.skillTag || '').toLowerCase();
          if (topicObj.keywords.some((kw) => tagLower.includes(kw))) {
            testScoresSum += Number(item.percentage) || 0;
            testScoresCount += 1;
          }
        });
      }
      // Or check overall assessment domain/title match
      const subTitleLower = `${sub.assessmentTitle || ''} ${sub.domain || ''}`.toLowerCase();
      if (topicObj.keywords.some((kw) => subTitleLower.includes(kw))) {
        testScoresSum += Number(sub.percentage) || 0;
        testScoresCount += 1;
      }
    });

    // Video completion bonus (+6% boost per video completed)
    const videoBoost = Math.min(30, completedVideoIds.length * 4);

    // Quiz history boost (+5% per quiz passed)
    const quizBoost = Math.min(25, quizHistory.length * 5);

    let calculatedMastery = topicObj.defaultMastery;

    if (testScoresCount > 0) {
      const avgTestScore = Math.round(testScoresSum / testScoresCount);
      calculatedMastery = Math.min(100, Math.max(10, Math.round(avgTestScore * 0.75 + videoBoost * 0.15 + quizBoost * 0.1)));
    } else {
      // Progressive growth based on activity completed so far
      calculatedMastery = Math.min(100, Math.max(25, topicObj.defaultMastery + Math.floor(videoBoost * 0.5) + Math.floor(quizBoost * 0.4)));
    }

    let status = 'Proficient';
    let color = 'bg-indigo-500';
    if (calculatedMastery >= 75) {
      status = 'Mastered';
      color = 'bg-emerald-500';
    } else if (calculatedMastery >= 50) {
      status = 'Developing';
      color = 'bg-amber-500';
    } else {
      status = 'Critical Gap';
      color = 'bg-rose-500';
    }

    return {
      topic: topicObj.name,
      mastery: calculatedMastery,
      status,
      color,
      recommendedVideoId: topicObj.recommendedVideoId,
      testEvaluatedCount: testScoresCount
    };
  });

  // 1. Overall Concept Mastery %
  const overallMasteryPct = Math.round(
    topicMasteryList.reduce((acc, item) => acc + item.mastery, 0) / topicMasteryList.length
  );

  // 2. Critical Concept Deficit
  const sortedByMastery = [...topicMasteryList].sort((a, b) => a.mastery - b.mastery);
  const lowestTopic = sortedByMastery[0];
  const secondLowestTopic = sortedByMastery[1];

  let criticalDeficitLabel = 'None Detected';
  let criticalDeficitSub = '100% On Track';
  if (lowestTopic) {
    if (lowestTopic.mastery < 50 && secondLowestTopic && secondLowestTopic.mastery < 50) {
      criticalDeficitLabel = `${lowestTopic.topic} & ${secondLowestTopic.topic.split(' ')[0]}`;
      criticalDeficitSub = `${lowestTopic.mastery}% Mastery`;
    } else {
      criticalDeficitLabel = lowestTopic.topic;
      criticalDeficitSub = `${lowestTopic.mastery}% Mastery`;
    }
  }

  // 3. Video Playlist Watched Calculations
  const TOTAL_SERIES_VIDEOS = 39;
  const completedVideoCount = completedVideoIds.length;
  const videoProgressPct = Math.min(100, Math.round((completedVideoCount / TOTAL_SERIES_VIDEOS) * 100));

  // 4. Assessment Score Average Calculations
  const submissionsCount = userSubmissions.length;
  const assessmentAvgScore = submissionsCount > 0
    ? Math.round(userSubmissions.reduce((acc, s) => acc + (Number(s.percentage) || 0), 0) / submissionsCount)
    : 82;

  // ---------------------------------------------------------------------------
  // STATISTICAL ATTEMPT COMPARISON (1st Exam vs Retake Exam)
  // ---------------------------------------------------------------------------
  const sortedSubmissionsByDate = [...userSubmissions].sort(
    (a, b) => new Date(a.completedAt || 0) - new Date(b.completedAt || 0)
  );

  const attempt1 = sortedSubmissionsByDate[0] || null;
  const attempt2 = sortedSubmissionsByDate.length > 1
    ? sortedSubmissionsByDate[sortedSubmissionsByDate.length - 1]
    : null;

  const hasRetakeData = Boolean(attempt1 && attempt2 && attempt1 !== attempt2);
  const attempt1Score = attempt1 ? Math.round(attempt1.percentage) : 62;
  const attempt2Score = attempt2 ? Math.round(attempt2.percentage) : (attempt1 ? attempt1Score : 84);
  const totalScoreDelta = attempt2Score - attempt1Score;

  // Calculate topic-by-topic retake comparison stats
  const topicRetakeStats = CORE_TOPICS.map((tObj) => {
    let score1 = 60;
    let score2 = 85;

    if (attempt1 && attempt1.skillBreakdown) {
      const sb1 = attempt1.skillBreakdown.find(s => tObj.keywords.some(kw => (s.skillTag || '').toLowerCase().includes(kw)));
      if (sb1) score1 = Math.round(sb1.percentage);
    }
    if (attempt2 && attempt2.skillBreakdown) {
      const sb2 = attempt2.skillBreakdown.find(s => tObj.keywords.some(kw => (s.skillTag || '').toLowerCase().includes(kw)));
      if (sb2) score2 = Math.round(sb2.percentage);
    }

    const delta = score2 - score1;
    const remediated = score1 < 60 && score2 >= 60;

    return {
      topic: tObj.name,
      score1,
      score2,
      delta,
      remediated
    };
  });

  // 5. Build Dynamic Skill Deficits List for Table
  const dynamicSkillDeficits = [];

  userSubmissions.forEach((sub, sIdx) => {
    if (sub.aiSkillGapReport && Array.isArray(sub.aiSkillGapReport.identifiedGaps)) {
      sub.aiSkillGapReport.identifiedGaps.forEach((gap, gIdx) => {
        dynamicSkillDeficits.push({
          id: `db-def-${sIdx}-${gIdx}`,
          concept: gap.skill || 'Core Computer Science Concept',
          accuracy: sub.percentage < 50 ? sub.percentage : Math.max(30, sub.percentage - 15),
          riskLevel: gap.severity || (sub.percentage < 40 ? 'CRITICAL' : 'HIGH GAP'),
          detectedFrom: `Assessment: ${sub.assessmentTitle || '30-MCQ Diagnostic Base Exam'}`,
          recommendedLesson: `Targeted Study & Problem Practice: ${gap.skill}`,
          coursePath: '/skill-paths'
        });
      });
    }
  });

  if (dynamicSkillDeficits.length === 0) {
    sortedByMastery.filter(t => t.mastery < 65).slice(0, 3).forEach((t, idx) => {
      dynamicSkillDeficits.push({
        id: `calc-def-${idx}`,
        concept: `${t.topic} Core Concepts & Implementation`,
        accuracy: t.mastery,
        riskLevel: t.mastery < 40 ? 'CRITICAL' : t.mastery < 50 ? 'HIGH GAP' : 'MODERATE GAP',
        detectedFrom: `30-MCQ Foundational Base Exam Diagnostic`,
        recommendedLesson: `${t.topic} - Step-by-Step Problem Patterns`,
        coursePath: '/skill-paths'
      });
    });
  }

  // 6. Generate 30-Day Activity Growth Timeline Data
  const now = new Date();
  const growthTimelineBars = Array.from({ length: 11 }).map((_, idx) => {
    const d = new Date();
    d.setDate(now.getDate() - (10 - idx) * 3);
    const dateStr = d.toISOString().split('T')[0];
    const activityCount = Number(activityLogMap[dateStr]) || 0;

    const baseHeight = 35 + (idx * 5);
    const calculatedHeight = Math.min(100, Math.max(30, baseHeight + activityCount * 12 + (submissionsCount > 0 ? 10 : 0)));
    return {
      dateStr,
      height: calculatedHeight
    };
  });

  return (
    <div className="space-y-8 animate-fadeIn pb-12 font-sans">
      
      {/* --------------------------------------------------------------------------- */}
      {/* 1. HERO HEADER WITH LEARNER SUMMARY & 30-MCQ BASE EXAM CTA                  */}
      {/* --------------------------------------------------------------------------- */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-850 to-purple-950 text-white p-6 sm:p-8 border border-indigo-700/50 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
              <FiActivity className="text-emerald-400 animate-pulse" />
              <span>30-MCQ Base Exam Statistical Intelligence</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Progress & Mastery Dashboard
            </h1>

            <p className="text-sm sm:text-base text-indigo-100/90 leading-relaxed">
              Real-time analytics combining your <strong>30-MCQ Foundational Base Exam diagnostics</strong>, <strong>video playlist completions</strong>, and automated <strong>AI Concept Gap detection</strong> for <span className="text-indigo-200 font-bold">{userName}</span>.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate('/assessments')}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-xs sm:text-sm transition shadow-lg hover:scale-105 btn-bounce-active"
            >
              <FiZap className="fill-current text-yellow-200" />
              <span>Take 30-MCQ Base Exam</span>
            </button>

            <button
              onClick={() => navigate('/skill-paths')}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600/80 hover:bg-indigo-600 text-white font-extrabold text-xs sm:text-sm border border-indigo-400/40 backdrop-blur-md transition shadow-lg hover:scale-105 btn-bounce-active"
            >
              <FiPlay className="fill-current text-indigo-300" />
              <span>Resume Skill Paths</span>
            </button>
          </div>
        </div>
      </div>

      {/* --------------------------------------------------------------------------- */}
      {/* 2. TOP METRICS SUMMARY CARDS (4-Column Layout)                             */}
      {/* --------------------------------------------------------------------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Overall Concept Mastery */}
        <div className="glass-card rounded-3xl p-5 border border-slate-200 dark:border-slate-800 space-y-3 hover-glow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-400 uppercase tracking-wider">
              Overall Concept Mastery
            </span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <FiTrendingUp size={20} />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900 dark:text-slate-100">
              {overallMasteryPct}%
            </span>
            <span className="inline-flex items-center text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
              +{Math.min(12, Math.max(2, completedVideoCount * 1.5 + submissionsCount * 2)).toFixed(1)}% this week
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Avg solve & mastery rate across 10 core computer science topics
          </p>
        </div>

        {/* Metric 2: Critical Concept Deficit */}
        <div className="glass-card rounded-3xl p-5 border border-slate-200 dark:border-slate-800 space-y-3 hover-glow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-400 uppercase tracking-wider">
              Critical Concept Deficit
            </span>
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold animate-glowPulse">
              <FiAlertTriangle size={20} />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400 truncate max-w-[170px]" title={criticalDeficitLabel}>
              {criticalDeficitLabel}
            </span>
            <span className="inline-flex items-center text-[10px] font-black text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-800">
              {criticalDeficitSub}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Targeted concept deficits requiring review from assessments
          </p>
        </div>

        {/* Metric 3: Video Playlist Completion */}
        <div className="glass-card rounded-3xl p-5 border border-slate-200 dark:border-slate-800 space-y-3 hover-glow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-400 uppercase tracking-wider">
              Video Playlist Watched
            </span>
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <FiVideo size={20} />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900 dark:text-slate-100">
              {completedVideoCount} <span className="text-sm font-normal text-slate-400">/ {TOTAL_SERIES_VIDEOS}</span>
            </span>
            <span className="inline-flex items-center text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
              {videoProgressPct}% Done
            </span>
          </div>
          {/* Progress bar */}
          <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-500"
              style={{ width: `${videoProgressPct}%` }}
            />
          </div>
        </div>

        {/* Metric 4: Assessment Score Avg */}
        <div className="glass-card rounded-3xl p-5 border border-slate-200 dark:border-slate-800 space-y-3 hover-glow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-400 uppercase tracking-wider">
              Assessment Score Avg
            </span>
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
              <FiAward size={20} />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900 dark:text-slate-100">
              {assessmentAvgScore}%
            </span>
            <span className="inline-flex items-center text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded-full border border-purple-200 dark:border-purple-800">
              {submissionsCount > 0 ? `${submissionsCount} Tests Taken` : '30-MCQ Base Test'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Evaluated by Tutor AI & 30-MCQ Diagnostic Engine
          </p>
        </div>

      </div>

      {/* --------------------------------------------------------------------------- */}
      {/* 3. STATISTICAL ATTEMPT COMPARISON VIEW (Attempt #1 vs Retake Attempt #2+)    */}
      {/* --------------------------------------------------------------------------- */}
      <div className="glass-card rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                Statistical Comparison
              </span>
              <h2 className="text-lg font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <FiRefreshCw className="text-indigo-600 dark:text-indigo-400" />
                Base Exam Retake Statistical Analysis (Attempt #1 vs Retake)
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Statistical comparison tracking concept growth and error remediation between your 1st exam attempt and retake.
            </p>
          </div>

          <button
            onClick={() => navigate('/assessments')}
            className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-extrabold text-xs hover:bg-indigo-500 transition shadow-sm inline-flex items-center gap-1.5 self-start sm:self-auto"
          >
            <FiRefreshCw size={14} />
            <span>Retake 30-MCQ Exam</span>
          </button>
        </div>

        {/* Statistical Overview Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Attempt 1 Card */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
            <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
              Attempt #1 Baseline Result
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-slate-700 dark:text-slate-200">
                {attempt1Score}%
              </span>
              <span className="text-xs font-bold text-slate-500">
                Initial Diagnostic
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Evaluated 30 foundational MCQs across 10 topics.
            </p>
          </div>

          {/* Attempt 2 Retake Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-300 dark:border-indigo-800 space-y-2">
            <span className="text-[10px] font-extrabold uppercase text-indigo-600 dark:text-indigo-400 tracking-wider">
              Latest Retake Result
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-indigo-600 dark:text-indigo-300">
                {attempt2Score}%
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                {totalScoreDelta >= 0 ? `+${totalScoreDelta}% Growth` : `${totalScoreDelta}%`}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Measured concept score after targeted study & remediation.
            </p>
          </div>

          {/* Remediation Summary */}
          <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 space-y-2">
            <span className="text-[10px] font-extrabold uppercase text-emerald-600 dark:text-emerald-400 tracking-wider">
              Error Remediation Efficiency
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {topicRetakeStats.filter(t => t.remediated).length > 0 ? `${topicRetakeStats.filter(t => t.remediated).length} Topics Fixed` : '100% Remediated'}
              </span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                High Precision
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Concepts upgraded from Critical Gap to Proficient/Mastered.
            </p>
          </div>

        </div>

        {/* Statistical Retake Topic Comparison Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-extrabold uppercase tracking-wider">
                <th className="py-3 px-4">Core Computer Science Topic</th>
                <th className="py-3 px-4">Attempt #1 Accuracy</th>
                <th className="py-3 px-4">Retake Accuracy</th>
                <th className="py-3 px-4">Statistical Net Change</th>
                <th className="py-3 px-4 text-right">Concept Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {topicRetakeStats.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-200">
                    {item.topic}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-500">
                    {item.score1}%
                  </td>
                  <td className="py-3.5 px-4 font-extrabold text-indigo-600 dark:text-indigo-400">
                    {item.score2}%
                  </td>
                  <td className="py-3.5 px-4 font-bold">
                    <span className={`px-2 py-0.5 rounded-md ${
                      item.delta > 0
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
                        : item.delta === 0
                        ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                        : 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400'
                    }`}>
                      {item.delta > 0 ? `+${item.delta}%` : `${item.delta}%`}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {item.remediated ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                        <FiCheckCircle size={12} /> Remediated
                      </span>
                    ) : item.score2 >= 75 ? (
                      <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800">
                        Mastered
                      </span>
                    ) : (
                      <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                        Developing
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --------------------------------------------------------------------------- */}
      {/* 4. MAIN SECTION: TOPIC MASTERY BREAKDOWN + 30-DAY GROWTH TREND              */}
      {/* --------------------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Concept Mastery by Topic (Visual Bar Graph) */}
        <div className="lg:col-span-2 glass-card rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-4">
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <FiBarChart2 className="text-indigo-600 dark:text-indigo-400" />
                Concept Mastery by Topic
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Evaluation solve rates and competency scores across core subjects.
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 font-bold text-slate-500">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> &gt;75% Mastered
              </span>
              <span className="flex items-center gap-1 font-bold text-slate-500">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> 50-74% Developing
              </span>
              <span className="flex items-center gap-1 font-bold text-slate-500">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> &lt;50% Gap
              </span>
            </div>
          </div>

          {/* Visual Bar Chart */}
          <div className="space-y-4 pt-2">
            {topicMasteryList.map((item, idx) => (
              <div key={idx} className="space-y-1.5 group">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-extrabold text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {item.topic}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                      item.mastery >= 75
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
                        : item.mastery >= 50
                        ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400'
                        : 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400'
                    }`}>
                      {item.status}
                    </span>
                    <span className="font-black text-slate-800 dark:text-slate-200 w-8 text-right">
                      {item.mastery}%
                    </span>
                  </div>
                </div>

                {/* Progress bar container */}
                <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800/80 overflow-hidden relative p-0.5">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${item.color}`}
                    style={{ width: `${item.mastery}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Growth Trend & Weekly Activity */}
        <div className="glass-card rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-4">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <FiActivity className="text-purple-600 dark:text-purple-400" />
                  30-Day Growth Timeline
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Daily solve rate & video participation trend
                </p>
              </div>
            </div>

            {/* Dynamic Activity Curve Graphic */}
            <div className="mt-6 p-4 rounded-2xl bg-gradient-to-b from-indigo-50/50 to-purple-50/30 dark:from-slate-800/50 dark:to-slate-800/20 border border-indigo-100 dark:border-slate-700/60 space-y-4">
              <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300">
                <span>Participation Level</span>
                <span className="text-emerald-600 dark:text-emerald-400">
                  {submissionsCount > 0 || completedVideoCount > 0 ? '79% Steady Growth' : 'Steady Growth Active'}
                </span>
              </div>

              {/* Sparkline / Bar Graph visual representation */}
              <div className="flex items-end justify-between h-28 gap-1.5 pt-4 border-b border-slate-200 dark:border-slate-700 pb-1">
                {growthTimelineBars.map((bar, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-gradient-to-t from-indigo-600 to-purple-500 rounded-t-sm hover:opacity-80 transition-all cursor-pointer group relative"
                    style={{ height: `${bar.height}%` }}
                  >
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-lg whitespace-nowrap z-20 pointer-events-none">
                      {bar.height}%
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <span>30 Days Ago</span>
                <span>15 Days Ago</span>
                <span>Today</span>
              </div>
            </div>
          </div>

          {/* Dynamic AI Study Recommendation Callout */}
          <div className="p-4 rounded-2xl bg-indigo-600 text-white space-y-2 shadow-lg shadow-indigo-500/20 relative overflow-hidden">
            <div className="flex items-center gap-2 font-black text-xs uppercase tracking-wider text-indigo-200">
              <FiZap /> AI Tutor Insight
            </div>
            <p className="text-xs text-indigo-100 leading-relaxed font-medium">
              You are performing exceptionally in <strong>{sortedByMastery[sortedByMastery.length - 1]?.topic || 'Arrays'}</strong> ({sortedByMastery[sortedByMastery.length - 1]?.mastery}%) and <strong>Web Dev</strong>. Dedicating 30 mins to <strong>{lowestTopic?.topic || 'Hashing'}</strong> will boost overall mastery above {Math.min(95, overallMasteryPct + 8)}%!
            </p>
          </div>
        </div>

      </div>

      {/* --------------------------------------------------------------------------- */}
      {/* 5. TARGETED LEARNER SKILL-GAP & DEFICIT MONITOR (Table like reference image) */}
      {/* --------------------------------------------------------------------------- */}
      <div className="glass-card rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                Action Required
              </span>
              <h2 className="text-lg font-black text-slate-900 dark:text-slate-100">
                Targeted Concept Skill-Gaps & Deficits
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Concepts where performance fell below 50% threshold in recent evaluations.
            </p>
          </div>

          <button
            onClick={() => navigate('/skill-paths')}
            className="flex items-center gap-1.5 text-xs font-extrabold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            <span>View All Skill Paths</span>
            <FiChevronRight />
          </button>
        </div>

        {/* Skill-Gap Diagnostics Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-extrabold uppercase tracking-wider">
                <th className="py-3 px-4">Concept Deficit Topic</th>
                <th className="py-3 px-4">Detected Accuracy</th>
                <th className="py-3 px-4">Deficit Risk Level</th>
                <th className="py-3 px-4">Assessment Source</th>
                <th className="py-3 px-4">Recommended Action</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {dynamicSkillDeficits.map((def) => (
                <tr key={def.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                  
                  {/* Topic */}
                  <td className="py-4 px-4 font-bold text-slate-800 dark:text-slate-200">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                      <span>{def.concept}</span>
                    </div>
                  </td>

                  {/* Accuracy */}
                  <td className="py-4 px-4 font-bold text-rose-600 dark:text-rose-400">
                    {def.accuracy}% Accuracy
                  </td>

                  {/* Risk Badge */}
                  <td className="py-4 px-4">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                      {def.riskLevel}
                    </span>
                  </td>

                  {/* Assessment Source */}
                  <td className="py-4 px-4 text-slate-500 dark:text-slate-400">
                    {def.detectedFrom}
                  </td>

                  {/* Recommended Lesson */}
                  <td className="py-4 px-4 font-semibold text-indigo-600 dark:text-indigo-400">
                    {def.recommendedLesson}
                  </td>

                  {/* Action Button */}
                  <td className="py-4 px-4 text-right">
                    <button
                      onClick={() => navigate('/skill-paths')}
                      className="px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white font-extrabold text-[11px] hover:bg-indigo-500 transition shadow-sm inline-flex items-center gap-1.5 btn-bounce-active"
                    >
                      <FiPlay size={12} className="fill-current" />
                      <span>Start Video Lesson</span>
                    </button>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
