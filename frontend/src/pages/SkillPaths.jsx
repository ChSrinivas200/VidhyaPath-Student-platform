import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiBookOpen,
  FiCheckCircle,
  FiCode,
  FiCpu,
  FiLayers,
  FiPlay,
  FiSearch,
  FiZap,
  FiChevronRight,
  FiAward,
  FiClock,
  FiCheck,
  FiGlobe,
  FiServer,
  FiX,
  FiVideo,
  FiArrowLeft,
  FiCheckSquare,
  FiChevronDown,
  FiChevronUp,
  FiBriefcase,
  FiFilm,
  FiGrid
} from 'react-icons/fi';
import confetti from 'canvas-confetti';

// ---------------------------------------------------------------------------
// YOUTUBE VIDEO HELPER MAP
// ---------------------------------------------------------------------------
const YOUTUBE_TOPIC_MAP = {
  'Generative AI': { youtubeId: 'kCc8FmEb1nY', duration: '24 mins' },
  'Building LLM Applications': { youtubeId: 'tcqEUSNCn8I', duration: '35 mins' },
  'Python Core Foundations': { youtubeId: 'rfscVS0vtbw', duration: '40 mins' },
  'Object-Oriented Programming (OOP)': { youtubeId: 'pTB0EiLXUC8', duration: '32 mins' },
  'HTML5 & Modern CSS Layouts': { youtubeId: 'qz0aGYrrlhU', duration: '30 mins' },
  'JavaScript ES6+ & Async Async': { youtubeId: '1Rs2ND1ryYc', duration: '28 mins' },
  'React Component State & Hooks': { youtubeId: '843nec-IvW0', duration: '35 mins' },
  'Redux Toolkit State Management': { youtubeId: '9boMnm5X9ak', duration: '25 mins' },
  'SQL Database Queries & Indexing': { youtubeId: 'HXV3zeQKqGY', duration: '42 mins' },
  'MongoDB NoSQL Aggregations': { youtubeId: 'oSIv-E67sT0', duration: '30 mins' },
  'Express.js REST API Architecture': { youtubeId: '7fjOw8ApZ1I', duration: '38 mins' },
  'JWT Authentication & Middleware': { youtubeId: 'mbsmsi7l3r4', duration: '22 mins' },
  'RAG Pipeline Integration': { youtubeId: 'tcqEUSNCn8I', duration: '45 mins' },
  'Full Stack Cloud Deployment': { youtubeId: '1hhm-_A91z0', duration: '35 mins' },
  'Operating Systems': { youtubeId: '26QPDBe-NB8', duration: '50 mins' },
  'Computer Networks': { youtubeId: 'IPvYjXWnt6s', duration: '40 mins' },
  'DBMS': { youtubeId: 'HXV3zeQKqGY', duration: '35 mins' },
  'Data Structures Foundations': { youtubeId: '8hly31xKLI0', duration: '48 mins' },
  'Algorithms & Problem Solving': { youtubeId: 'fAAZ2rCfc18', duration: '55 mins' },
  'System Design Fundamentals': { youtubeId: 'm8Icp_Cid5o', duration: '30 mins' },
  'High Level & Low Level Design': { youtubeId: 'rfscVS0vtbw', duration: '42 mins' }
};

const getYoutubeMeta = (topicName) => {
  if (YOUTUBE_TOPIC_MAP[topicName]) return YOUTUBE_TOPIC_MAP[topicName];
  return { youtubeId: 'kCc8FmEb1nY', duration: '25 mins' };
};

// ---------------------------------------------------------------------------
// 1. JOB-READY ROLES DATA (Matching Image 1 & Image 2 in User Request)
// ---------------------------------------------------------------------------
const JOB_READY_ROLES = [
  {
    id: 'role-sde',
    title: 'Software Development Engineer (SDE)',
    tagline: 'Become a full-stack software engineer ready for product company hiring at companies like JPMorgan, Goldman Sachs, PayPal, and Uber.',
    salaryRange: '₹8 - 30 LPA',
    coursesCount: 37,
    skills: ['Python', 'JavaScript', 'React', 'Node.js', 'MongoDB', 'DSA', 'System Design', 'Git'],
    category: 'Software Engineering',
    badgeColor: 'border-blue-200 dark:border-blue-900 bg-blue-50/40 dark:bg-blue-950/20',
    roadmapModules: [
      { id: 'm1', title: 'Build AI Powered Applications', items: ['Generative AI', 'Building LLM Applications'] },
      { id: 'm2', title: 'Master Programming', items: ['Python Core Foundations', 'Object-Oriented Programming (OOP)'] },
      { id: 'm3', title: 'Build the Web Foundation', items: ['HTML5 & Modern CSS Layouts', 'JavaScript ES6+ & Async Async'] },
      { id: 'm4', title: 'Build Scalable UIs with React', items: ['React Component State & Hooks', 'Redux Toolkit State Management'] },
      { id: 'm5', title: 'Master Databases', items: ['SQL Database Queries & Indexing', 'MongoDB NoSQL Aggregations'] },
      { id: 'm6', title: 'Build Backend APIs', items: ['Express.js REST API Architecture', 'JWT Authentication & Middleware'] },
      { id: 'm7', title: 'Ship AI Full Stack Projects', items: ['RAG Pipeline Integration', 'Full Stack Cloud Deployment'] },
      { id: 'm8', title: 'Core CS Fundamentals', items: ['Operating Systems', 'Computer Networks', 'DBMS'] },
      { id: 'm9', title: 'Master Problem Solving with DSA', items: ['Data Structures Foundations', 'Algorithms & Problem Solving'] },
      { id: 'm10', title: 'Design Scalable Systems', items: ['System Design Fundamentals', 'High Level & Low Level Design'] }
    ]
  },
  {
    id: 'role-ase',
    title: 'Associate Software Engineer',
    tagline: '15k+ Openings in the last 30 days. Fast-track your engineering pipeline across top tech scale-ups and global tech hubs.',
    salaryRange: '₹6 - 15 LPA',
    coursesCount: 29,
    skills: ['Java', 'Spring Boot', 'SQL', 'Git', 'REST APIs', 'Unit Testing'],
    category: 'Software Engineering',
    badgeColor: 'border-emerald-200 dark:border-emerald-900 bg-emerald-50/40 dark:bg-emerald-950/20',
    roadmapModules: [
      { id: 'm1', title: 'Java & Object-Oriented Basics', items: ['Python Core Foundations', 'Object-Oriented Programming (OOP)'] },
      { id: 'm2', title: 'Data Structures with Java', items: ['Data Structures Foundations', 'Algorithms & Problem Solving'] },
      { id: 'm3', title: 'Relational SQL Databases', items: ['SQL Database Queries & Indexing', 'DBMS'] },
      { id: 'm4', title: 'Spring Boot Backend APIs', items: ['Express.js REST API Architecture', 'JWT Authentication & Middleware'] }
    ]
  },
  {
    id: 'role-frontend',
    title: 'Frontend Developer',
    tagline: 'Master modern web frontend development with React 18, Next.js, Tailwind CSS, TypeScript, and micro-frontend architectures.',
    salaryRange: '₹6 - 20 LPA',
    coursesCount: 31,
    skills: ['HTML5/CSS3', 'JavaScript', 'TypeScript', 'React', 'Next.js', 'Tailwind CSS', 'Redux'],
    category: 'Web Development',
    badgeColor: 'border-amber-200 dark:border-amber-900 bg-amber-50/40 dark:bg-amber-950/20',
    roadmapModules: [
      { id: 'm1', title: 'Modern UI/UX & CSS Mastery', items: ['HTML5 & Modern CSS Layouts', 'JavaScript ES6+ & Async Async'] },
      { id: 'm2', title: 'JavaScript & React Deep Dive', items: ['React Component State & Hooks', 'Redux Toolkit State Management'] },
      { id: 'm3', title: 'Full Stack Cloud & Deployment', items: ['Full Stack Cloud Deployment', 'Building LLM Applications'] }
    ]
  },
  {
    id: 'role-backend-node',
    title: 'Backend Developer (Node.js)',
    tagline: 'Architect high-throughput microservices using Node.js, Express, MongoDB, Redis caching, and Docker containers.',
    salaryRange: '₹8 - 24 LPA',
    coursesCount: 28,
    skills: ['Node.js', 'Express', 'MongoDB', 'Redis', 'Docker', 'GraphQL', 'Microservices'],
    category: 'Software Engineering',
    badgeColor: 'border-indigo-200 dark:border-indigo-900 bg-indigo-50/40 dark:bg-indigo-950/20',
    roadmapModules: [
      { id: 'm1', title: 'Node.js Event Loop & Async I/O', items: ['Express.js REST API Architecture', 'JWT Authentication & Middleware'] },
      { id: 'm2', title: 'Database Design & Caching', items: ['MongoDB NoSQL Aggregations', 'SQL Database Queries & Indexing'] },
      { id: 'm3', title: 'System Design Architecture', items: ['System Design Fundamentals', 'High Level & Low Level Design'] }
    ]
  },
  {
    id: 'role-backend-python',
    title: 'Backend Developer (Python)',
    tagline: 'Build secure, scalable backend architectures with Python, Django, FastAPI, Celery background jobs, and PostgreSQL.',
    salaryRange: '₹7 - 22 LPA',
    coursesCount: 27,
    skills: ['Python', 'FastAPI', 'Django', 'PostgreSQL', 'Celery', 'Docker', 'AWS'],
    category: 'Software Engineering',
    badgeColor: 'border-sky-200 dark:border-sky-900 bg-sky-50/40 dark:bg-sky-950/20',
    roadmapModules: [
      { id: 'm1', title: 'FastAPI High-Performance APIs', items: ['Python Core Foundations', 'Express.js REST API Architecture'] },
      { id: 'm2', title: 'Background Tasks & Queues', items: ['SQL Database Queries & Indexing', 'Full Stack Cloud Deployment'] }
    ]
  },
  {
    id: 'role-backend-java',
    title: 'Backend Developer (Java)',
    tagline: 'Construct enterprise enterprise-grade microservices with Spring Boot, Spring Cloud, Hibernate, and Apache Kafka.',
    salaryRange: '₹8 - 25 LPA',
    coursesCount: 30,
    skills: ['Java 21', 'Spring Boot', 'Microservices', 'Kafka', 'Hibernate', 'PostgreSQL'],
    category: 'Software Engineering',
    badgeColor: 'border-rose-200 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/20',
    roadmapModules: [
      { id: 'm1', title: 'Spring Framework Architecture', items: ['Object-Oriented Programming (OOP)', 'Express.js REST API Architecture'] },
      { id: 'm2', title: 'Event-Driven Microservices', items: ['System Design Fundamentals', 'High Level & Low Level Design'] }
    ]
  },
  {
    id: 'role-data-analyst',
    title: 'Data Analyst',
    tagline: 'Master data querying, Python analytics, SQL window functions, Power BI dashboards, and predictive business statistics.',
    salaryRange: '₹5 - 16 LPA',
    coursesCount: 25,
    skills: ['Python', 'SQL', 'Pandas', 'Power BI', 'Tableau', 'Excel', 'Statistics'],
    category: 'Data & AI',
    badgeColor: 'border-teal-200 dark:border-teal-900 bg-teal-50/40 dark:bg-teal-950/20',
    roadmapModules: [
      { id: 'm1', title: 'SQL & Database Analytics', items: ['SQL Database Queries & Indexing', 'DBMS'] },
      { id: 'm2', title: 'Python for Data Analysis', items: ['Python Core Foundations', 'Building LLM Applications'] }
    ]
  },
  {
    id: 'role-ai-engineer',
    title: 'AI Engineer',
    tagline: 'Build machine learning models, computer vision systems, and neural networks using PyTorch and Scikit-learn.',
    salaryRange: '₹10 - 35 LPA',
    coursesCount: 32,
    skills: ['Python', 'PyTorch', 'Scikit-learn', 'LLMs', 'Computer Vision', 'NLP'],
    category: 'Data & AI',
    badgeColor: 'border-purple-200 dark:border-purple-900 bg-purple-50/40 dark:bg-purple-950/20',
    roadmapModules: [
      { id: 'm1', title: 'Machine Learning Mathematics', items: ['Python Core Foundations', 'Algorithms & Problem Solving'] },
      { id: 'm2', title: 'Deep Learning & Neural Networks', items: ['Generative AI', 'Building LLM Applications'] },
      { id: 'm3', title: 'RAG & AI Deployment', items: ['RAG Pipeline Integration', 'Full Stack Cloud Deployment'] }
    ]
  },
  {
    id: 'role-applied-ai',
    title: 'Applied AI Engineer',
    tagline: 'Architect end-to-end AI applications leveraging RAG, LangChain, Vector Databases, Prompt Engineering, and Agentic AI.',
    salaryRange: '₹12 - 40 LPA',
    coursesCount: 35,
    skills: ['RAG', 'LangChain', 'Vector DBs', 'Prompt Engineering', 'LlamaIndex', 'Agentic AI'],
    category: 'Data & AI',
    badgeColor: 'border-cyan-200 dark:border-cyan-900 bg-cyan-50/40 dark:bg-cyan-950/20',
    roadmapModules: [
      { id: 'm1', title: 'RAG Architecture & Embeddings', items: ['Generative AI', 'RAG Pipeline Integration'] },
      { id: 'm2', title: 'LangChain & Autonomous Agents', items: ['Building LLM Applications', 'Full Stack Cloud Deployment'] }
    ]
  }
];

// ---------------------------------------------------------------------------
// 2. COURSE LIBRARY DATA (Matching Image 3 in User Request)
// ---------------------------------------------------------------------------
const COURSE_LIBRARY_TRENDING = [
  { id: 'cl-genai', title: 'Generative AI', type: 'Course', icon: '🤖', badge: null, level: 'Beginner', duration: '18 Hours', progress: 45, topics: 'Generative / Prompts / LLMs / Use cases', youtubeId: 'kCc8FmEb1nY' },
  { id: 'cl-web', title: 'Modern Responsive Web Design', type: 'Course', icon: '📱', badge: null, level: 'Intermediate', duration: '24 Hours', progress: 5, topics: 'Flexbox / CSS / Media / Tailwind', youtubeId: 'qz0aGYrrlhU' },
  { id: 'cl-prog', title: 'Programming Foundations', type: 'Course', icon: '💻', badge: null, level: 'Beginner', duration: '48 Hours', progress: 18, topics: 'Python / Basics / Functions / Debugging', youtubeId: 'rfscVS0vtbw' },
  { id: 'cl-oops', title: 'OOPS', type: 'Course', icon: '📦', badge: null, level: 'Intermediate', duration: '20 Hours', progress: 8, topics: 'Classes / Objects / Inheritance / +1 more', youtubeId: 'pTB0EiLXUC8' },
  { id: 'cl-llm', title: 'Building LLM Applications', type: 'Course', icon: '🌐', badge: 'Trending', level: 'Intermediate', duration: '22 Hours', progress: 15, topics: 'Prompts / APIs / Context / Workflows', youtubeId: 'tcqEUSNCn8I' },
  { id: 'cl-oscn', title: 'OS and CN Fundamentals', type: 'Course', icon: '⚙️', badge: null, level: 'Beginner', duration: '16 Hours', progress: 3, topics: 'Hardware / OS / Memory / Network', youtubeId: '26QPDBe-NB8' },
  { id: 'cl-db', title: 'Introduction to Databases', type: 'Course', icon: '🗄️', badge: null, level: 'Beginner', duration: '44 Hours', progress: 3, topics: 'SQL / DBMS / Modeling / Queries', youtubeId: 'HXV3zeQKqGY' },
  { id: 'cl-dbms', title: 'DBMS', type: 'Course', icon: '💾', badge: null, level: 'Beginner', duration: '12 Hours', progress: 0, topics: 'RDS / Normalization / v2.0 update', youtubeId: 'HXV3zeQKqGY' },
  { id: 'cl-dynamic-web', title: 'Build Your Own Dynamic Web Application', type: 'Course', icon: '🖥️', badge: null, level: 'Intermediate', duration: '32 Hours', progress: 0, topics: 'DOM / Events / Async / Forms', youtubeId: '1Rs2ND1ryYc' }
];

const COURSE_LIBRARY_SECTIONS = [
  {
    sectionId: 'genai-section',
    title: 'Applied Generative AI',
    badge: 'Most in-demand skill of 2026',
    bannerGradient: 'from-emerald-500/20 via-teal-500/10 to-transparent border-emerald-300 dark:border-emerald-800',
    bannerText: 'AI isn\'t optional anymore — every company now expects it as a baseline.',
    bannerSubtext: 'Google, Meta, and Microsoft are paying Gen AI engineers 40-60% above standard software rates — and the gap is widening.',
    courses: [
      { id: 'cg-1', title: 'Generative AI', type: 'Course', icon: '🤖', badge: null, level: 'Beginner', duration: '18 Hours', progress: 45, topics: 'Generative / Prompts / LLMs / Use cases', youtubeId: 'kCc8FmEb1nY' },
      { id: 'cg-2', title: 'Building LLM Applications', type: 'Course', icon: '🌐', badge: 'Trending', level: 'Intermediate', duration: '22 Hours', progress: 15, topics: 'Prompts / APIs / Context / Workflows', youtubeId: 'tcqEUSNCn8I' },
      { id: 'cg-3', title: 'AI Full-Stack Projects', type: 'Project', icon: '🚀', badge: 'Project', level: 'Intermediate', duration: '40 Hours', progress: 2, topics: 'React / APIs / FastAPI / Auth', youtubeId: '1hhm-_A91z0' },
      { id: 'cg-4', title: 'Automation Anywhere', type: 'Course', icon: '⚡', badge: null, level: 'Beginner Friendly', duration: '10 Hours', progress: 0, topics: 'Automation / CSV / Excel / Bot Creation', youtubeId: 'bMknFfVo04E' }
    ]
  },
  {
    sectionId: 'dsa-section',
    title: 'Data Structures & Algorithms',
    badge: '15 LPA or 100 LPA — DSA decides',
    bannerGradient: 'from-cyan-500/20 via-blue-500/10 to-transparent border-cyan-300 dark:border-cyan-800',
    bannerText: 'The one skill every product company tests — without exception.',
    bannerSubtext: 'Every FAANG and top product company interview — Amazon, Google, Flipkart, Zepto — is gated by a DSA round with no exceptions.',
    courses: [
      { id: 'cd-1', title: 'DSA Level 1', type: 'Course', icon: '⚡', badge: null, level: 'Beginner', duration: '85 Hours', progress: 87, topics: 'Basics / Recursion / Sorting / Arrays', youtubeId: '8hly31xKLI0' },
      { id: 'cd-2', title: 'DSA Level 2', type: 'Course', icon: '⚡', badge: null, level: 'Intermediate', duration: '110 Hours', progress: 24, topics: 'Arrays / Search / Window / Matrix', youtubeId: '8hly31xKLI0' },
      { id: 'cd-3', title: 'DSA Level 3', type: 'Course', icon: '⚡', badge: null, level: 'Intermediate', duration: '95 Hours', progress: 6, topics: 'Strings / LinkedList / Stack / Queue', youtubeId: 'fAAZ2rCfc18' },
      { id: 'cd-4', title: 'DSA Level 4', type: 'Course', icon: '⚡', badge: null, level: 'Advanced', duration: '70 Hours', progress: 0, topics: 'Trees / BST / Heap / Trie', youtubeId: 'fAAZ2rCfc18' },
      { id: 'cd-5', title: 'DSA Level 5', type: 'Course', icon: '⚡', badge: null, level: 'Advanced', duration: '78 Hours', progress: 0, topics: 'Graphs / Path / DSU / MST', youtubeId: 'fAAZ2rCfc18' },
      { id: 'cd-6', title: 'DSA Level 6', type: 'Course', icon: '⚡', badge: null, level: 'Advanced', duration: '87 Hours', progress: 2, topics: 'DP / Tree / Bitwise / Patterns', youtubeId: 'fAAZ2rCfc18' },
      { id: 'cd-7', title: 'Data Structures & Algorithms with Python', type: 'Course', icon: '💻', badge: null, level: 'Beginner', duration: '300 Hours', progress: 0, topics: 'Basics / Logical Thinking / +5 more', youtubeId: '8hly31xKLI0' }
    ]
  },
  {
    sectionId: 'ml-section',
    title: 'AI & ML Engineering',
    badge: 'ML engineer is now a top 3 highest paid fresher role in India',
    bannerGradient: 'from-pink-500/20 via-purple-500/10 to-transparent border-pink-300 dark:border-pink-800',
    bannerText: 'AI is no longer a research problem. It\'s a production engineering problem.',
    bannerSubtext: 'Swiggy, Cred, and global MNCs are offering 15-25 LPA to fresher ML engineers — a bracket that didn\'t exist for freshers 3 years ago.',
    courses: [
      { id: 'cm-1', title: 'Introduction to ML and Classification Algorithms', type: 'Course', icon: '📊', badge: null, level: 'Intermediate', duration: '45 Hours', progress: 0, topics: 'Classification / Features / +2 more', youtubeId: 'V_xro1bcAuA' },
      { id: 'cm-2', title: 'Supervised Learning: Regression', type: 'Course', icon: '📈', badge: null, level: 'Intermediate', duration: '35 Hours', progress: 0, topics: 'Regression / Features / Gradient / Metrics', youtubeId: 'c36lUUr864M' },
      { id: 'cm-3', title: 'Ensemble Learning', type: 'Course', icon: '🧬', badge: null, level: 'Advanced', duration: '30 Hours', progress: 0, topics: 'Bagging / Boosting / +8 more', youtubeId: 'V_xro1bcAuA' },
      { id: 'cm-4', title: 'Unsupervised Learning', type: 'Course', icon: '🧠', badge: null, level: 'Advanced', duration: '28 Hours', progress: 0, topics: 'Clustering / Rules / Reduction / Patterns', youtubeId: 'c36lUUr864M' },
      { id: 'cm-5', title: 'Machine Learning & AI Projects', type: 'Project', icon: '🚀', badge: 'Project', level: 'Advanced', duration: '38 Hours', progress: 0, topics: 'Projects / Deployment / Cases / Pipeline', youtubeId: '1hhm-_A91z0' }
    ]
  }
];

// ---------------------------------------------------------------------------
// 3. CURATED YOUTUBE VIDEO PLAYLISTS & SERIES
// ---------------------------------------------------------------------------
const YOUTUBE_PLAYLIST_SERIES = [
  {
    categoryTitle: 'AI & Machine Learning Video Series',
    categorySubtitle: 'Deepen your knowledge of Artificial Intelligence, RAG pipelines, and Large Language Models.',
    category: 'AI & Machine Learning',
    courses: [
      {
        id: 'yt-gen-ai-rag',
        title: 'Generative AI, LLM & RAG Masterclass',
        category: 'AI & Machine Learning',
        level: 'Intermediate',
        icon: '🤖',
        duration: '18 Hours',
        topics: ['Prompting', 'RAG Pipelines', 'Vector Databases', 'LangChain'],
        videos: [
          { id: 'v-gen-1', youtubeId: 'kCc8FmEb1nY', title: '1. Introduction to Generative AI & Large Language Models', duration: '24 mins', summary: 'Overview of foundation models, GPT architectures, and prompt engineering.' },
          { id: 'v-gen-2', youtubeId: 'tcqEUSNCn8I', title: '2. Building RAG Pipelines with Vector Databases', duration: '35 mins', summary: 'Retrieve context from PDFs using embeddings and ChromaDB.' },
          { id: 'v-gen-3', youtubeId: 'bMknFfVo04E', title: '3. LangChain Agents & Autonomous Tool Integration', duration: '42 mins', summary: 'Connect LLMs to external APIs and autonomous calculation engines.' }
        ]
      },
      {
        id: 'yt-pytorch-deep-learning',
        title: 'PyTorch Deep Learning & Neural Networks',
        category: 'AI & Machine Learning',
        level: 'Advanced',
        icon: '🧠',
        duration: '26 Hours',
        topics: ['Tensors', 'Backpropagation', 'CNNs', 'Transformers'],
        videos: [
          { id: 'v-torch-1', youtubeId: 'V_xro1bcAuA', title: '1. PyTorch Basics: Tensors & Autograd', duration: '28 mins', summary: 'Understand tensor calculations and automatic gradient calculation.' },
          { id: 'v-torch-2', youtubeId: 'c36lUUr864M', title: '2. Building Convolutional Networks for Image Classification', duration: '40 mins', summary: 'Architect CNNs for computer vision pipelines.' }
        ]
      }
    ]
  },
  {
    categoryTitle: 'Web Development & Full-Stack Playlists',
    categorySubtitle: 'Master modern frontend & backend web technologies with practical code-along projects.',
    category: 'Web Development',
    courses: [
      {
        id: 'yt-react-nextjs',
        title: 'Full Stack React 18 & Next.js 14 Course',
        category: 'Web Development',
        level: 'Beginner to Intermediate',
        icon: '💻',
        duration: '22 Hours',
        topics: ['React Hooks', 'Next.js App Router', 'Tailwind', 'REST APIs'],
        videos: [
          { id: 'v-web-1', youtubeId: 'qz0aGYrrlhU', title: '1. Modern Responsive Web Design & Tailwind CSS', duration: '30 mins', summary: 'Semantic markup, Flexbox alignment, and CSS Grid systems.' },
          { id: 'v-web-2', youtubeId: '1Rs2ND1ryYc', title: '2. React 18 State Management & Custom Hooks', duration: '32 mins', summary: 'Master useState, useEffect, and component lifecycle.' },
          { id: 'v-web-3', youtubeId: '843nec-IvW0', title: '3. Next.js Server Components & API Routes', duration: '45 mins', summary: 'Build fast full-stack web applications with server-side rendering.' }
        ]
      },
      {
        id: 'yt-node-express',
        title: 'Node.js & MongoDB Microservices Architecture',
        category: 'Web Development',
        level: 'Intermediate',
        icon: '⚡',
        duration: '20 Hours',
        topics: ['Node Async', 'Express REST', 'Mongoose', 'JWT Auth'],
        videos: [
          { id: 'v-node-1', youtubeId: 'Oe421EPjeBE', title: '1. Node.js Architecture & Event Loop Deep Dive', duration: '35 mins', summary: 'Master non-blocking I/O and asynchronous execution.' },
          { id: 'v-node-2', youtubeId: '7fjOw8ApZ1I', title: '2. Express REST API with MongoDB & Mongoose', duration: '48 mins', summary: 'Design scalable JSON endpoints with JWT security.' }
        ]
      }
    ]
  }
];

export default function SkillPaths() {
  const navigate = useNavigate();
  
  // View Toggle: 'roles' (9 Job-Ready Roles & Timelines) | 'library' (Course Library Image 3 layout) | 'playlists' (YouTube Video Playlists)
  const [viewMode, setViewMode] = useState('library');

  // Role Roadmaps State
  const [selectedRole, setSelectedRole] = useState(null);
  const [roleCategoryFilter, setRoleCategoryFilter] = useState('All');
  const [expandedModules, setExpandedModules] = useState({});

  // Course Library Filter State
  const [libraryFilter, setLibraryFilter] = useState('Overall');

  // Playlist Series State
  const [playlistCategoryFilter, setPlaylistCategoryFilter] = useState('All');
  const [playlistSearch, setPlaylistSearch] = useState('');
  const [completedVideos, setCompletedVideos] = useState([]);
  const [activeVideoModal, setActiveVideoModal] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('vidyapath_completed_videos');
    if (saved) {
      try { setCompletedVideos(JSON.parse(saved)); } catch (e) {}
    }
  }, []);

  const toggleModuleExpand = (modId) => {
    setExpandedModules(prev => ({ ...prev, [modId]: !prev[modId] }));
  };

  const handleMarkVideoCompleted = (videoId) => {
    let updated;
    if (completedVideos.includes(videoId)) {
      updated = completedVideos.filter(id => id !== videoId);
    } else {
      updated = [...completedVideos, videoId];
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    }
    setCompletedVideos(updated);
    localStorage.setItem('vidyapath_completed_videos', JSON.stringify(updated));
    window.dispatchEvent(new Event('vidyapath_progress_updated'));
  };

  const filteredRoles = JOB_READY_ROLES.filter(r => {
    if (roleCategoryFilter === 'All') return true;
    return r.category === roleCategoryFilter;
  });

  const filteredPlaylistSeries = YOUTUBE_PLAYLIST_SERIES.map(series => {
    const matchingCourses = series.courses.filter(course => {
      const matchCat = playlistCategoryFilter === 'All' || course.category === playlistCategoryFilter;
      const matchSearch = playlistSearch === '' ||
        course.title.toLowerCase().includes(playlistSearch.toLowerCase()) ||
        course.topics.some(t => t.toLowerCase().includes(playlistSearch.toLowerCase()));
      return matchCat && matchSearch;
    });
    return { ...series, courses: matchingCourses };
  }).filter(series => series.courses.length > 0);

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fadeIn pb-16 font-sans">
      
      {/* TOP 3-WAY TOGGLE SWITCH BANNER */}
      <div className="glass-card rounded-3xl p-5 border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 shadow-lg flex flex-col lg:flex-row items-center justify-between gap-4">
        
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-bold text-xl shadow-md">
            {viewMode === 'library' ? '📚' : viewMode === 'roles' ? '🎯' : '🎥'}
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800 dark:text-slate-100">
              {viewMode === 'library' ? 'Comprehensive Course Library' : viewMode === 'roles' ? 'Job-Ready Role Roadmaps' : 'Curated YouTube Playlists'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {viewMode === 'library'
                ? 'Curated course swimlanes, trend recommendations, DSA levels & AI engineering tracks'
                : viewMode === 'roles'
                ? 'Structured career paths based on tech role specifications with embedded YouTube video lessons' 
                : 'Free video playlists with interactive video playback, thumbnails, and progress tracking'}
            </p>
          </div>
        </div>

        {/* TOGGLE SWITCH BUTTONS */}
        <div className="flex flex-wrap items-center bg-slate-100 dark:bg-slate-800/90 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700">
          
          <button
            onClick={() => {
              setViewMode('library');
              setSelectedRole(null);
            }}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 cursor-pointer ${
              viewMode === 'library'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md scale-102'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FiGrid size={15} />
            <span>Course Library</span>
          </button>

          <button
            onClick={() => {
              setViewMode('roles');
              setSelectedRole(null);
            }}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 cursor-pointer ${
              viewMode === 'roles'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md scale-102'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FiBriefcase size={15} />
            <span>Role Roadmaps</span>
          </button>

          <button
            onClick={() => {
              setViewMode('playlists');
              setSelectedRole(null);
            }}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 cursor-pointer ${
              viewMode === 'playlists'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md scale-102'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FiVideo size={15} />
            <span>YouTube Playlists</span>
          </button>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* MODE 1: COURSE LIBRARY (MATCHING IMAGE 3 EXACTLY) */}
      {/* ========================================================================= */}
      {viewMode === 'library' && (
        <div className="space-y-10 animate-fadeIn">
          
          {/* SECTION 1: RECOMMENDED BASED ON INDUSTRY TRENDS (Swimlane Carousel - Image 3) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest block">
                  RECOMMENDED
                </span>
                <h2 className="text-xl font-black text-slate-800 dark:text-slate-100">
                  Based on industry trends
                </h2>
              </div>
              <span className="text-xs text-slate-400 font-semibold">Scroll horizontally →</span>
            </div>

            {/* Horizontal Swimlane Scroll Container */}
            <div className="flex gap-4 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-indigo-500/30">
              {COURSE_LIBRARY_TRENDING.map((course) => (
                <div
                  key={course.id}
                  onClick={() => setActiveVideoModal({
                    video: {
                      id: `cl-vid-${course.id}`,
                      title: course.title,
                      youtubeId: course.youtubeId,
                      duration: course.duration,
                      summary: `Watch full course tutorial on ${course.title} (${course.topics})`
                    },
                    courseTitle: course.title
                  })}
                  className="snap-start flex-shrink-0 w-64 glass-card rounded-2xl p-4 border border-slate-200/90 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer flex flex-col justify-between space-y-3 relative group bg-white/80 dark:bg-slate-900/80"
                >
                  {/* Badge Pill */}
                  {course.badge && (
                    <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-amber-500 text-white font-bold text-[9px] uppercase tracking-wider shadow-sm animate-pulse">
                      🔥 {course.badge}
                    </span>
                  )}

                  <div className="space-y-2">
                    <span className="text-[9px] font-bold text-slate-400 uppercase px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 inline-block">
                      {course.type}
                    </span>

                    {/* 3D Visual Icon Container */}
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-50 to-purple-50 dark:from-indigo-950/60 dark:to-purple-950/60 border border-indigo-100 dark:border-indigo-800/60 text-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                      {course.icon}
                    </div>

                    <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                      {course.title}
                    </h3>

                    <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                      {course.topics}
                    </p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                      <span className="flex items-center gap-1">📊 {course.level}</span>
                      <span className="flex items-center gap-1">⏱ {course.duration}</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[9px] font-bold text-slate-400">
                        <span>{course.progress}% Completed</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 to-purple-600"
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FILTER CHIPS BAR (Matching Image 3) */}
          <div className="glass-card rounded-2xl p-3 border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 overflow-x-auto">
            <div className="flex items-center gap-2 min-w-max">
              {[
                'Overall', 'DSA', 'AI / ML Genius Only', 'Deep Learning Engineering Genius Only',
                'Frontend', 'Backend', 'DBMS', 'System & OS', 'Data Analytics',
                'Math for AI & ML', 'Competitive Programming', 'Aptitude', 'Fundamentals'
              ].map((chip) => (
                <button
                  key={chip}
                  onClick={() => setLibraryFilter(chip)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    libraryFilter === chip
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>

          {/* CATEGORIZED SECTIONS WITH GRADIENT INDUSTRY BANNERS (Image 3) */}
          {COURSE_LIBRARY_SECTIONS.map((sec) => (
            <div key={sec.sectionId} className="space-y-5">
              
              {/* Gradient Banner Header */}
              <div className={`rounded-2xl p-5 border bg-gradient-to-r ${sec.bannerGradient} space-y-1 relative overflow-hidden`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse" />
                    <h3 className="text-lg sm:text-xl font-black text-slate-800 dark:text-slate-100">
                      {sec.title}
                    </h3>
                  </div>

                  <span className="px-3 py-1 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 shadow-sm">
                    ✨ {sec.badge}
                  </span>
                </div>

                <p className="font-extrabold text-xs sm:text-sm text-slate-800 dark:text-slate-200 pt-1">
                  {sec.bannerText}
                </p>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  {sec.bannerSubtext}
                </p>
              </div>

              {/* Course Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {sec.courses.map((course) => (
                  <div
                    key={course.id}
                    onClick={() => setActiveVideoModal({
                      video: {
                        id: `sec-vid-${course.id}`,
                        title: course.title,
                        youtubeId: course.youtubeId,
                        duration: course.duration,
                        summary: `Watch video lesson covering ${course.title} (${course.topics})`
                      },
                      courseTitle: sec.title
                    })}
                    className="glass-card rounded-2xl p-4 border border-slate-200/90 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer flex flex-col justify-between space-y-3 bg-white/80 dark:bg-slate-900/80 group"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-bold text-slate-400 uppercase px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                          {course.type}
                        </span>
                        {course.badge && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white font-bold text-[9px] uppercase">
                            🔥 {course.badge}
                          </span>
                        )}
                      </div>

                      {/* 3D Visual Icon Container */}
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-50 to-purple-50 dark:from-indigo-950/60 dark:to-purple-950/60 border border-indigo-100 dark:border-indigo-800/60 text-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                        {course.icon}
                      </div>

                      <h4 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                        {course.title}
                      </h4>

                      <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                        {course.topics}
                      </p>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                        <span>📊 {course.level}</span>
                        <span>⏱ {course.duration}</span>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] font-bold text-slate-400">
                          <span>{course.progress}% Completed</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-600"
                            style={{ width: `${course.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          ))}

          {/* BOTTOM PURPLE FOOTER BANNER (Image 3) */}
          <div className="rounded-2xl p-5 bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-950 text-white border border-purple-800 text-center space-y-1 shadow-lg">
            <h4 className="font-black text-sm sm:text-base tracking-wide">
              GPT, Gemini, Stable Diffusion.
            </h4>
            <p className="text-xs text-purple-200 font-medium">
              All of it runs on what you're about to learn. Pick a track above and start building today!
            </p>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: ROLE ROADMAPS (9 JOB-READY ROLES & VERTICAL TIMELINE) */}
      {/* ========================================================================= */}
      {viewMode === 'roles' && (
        selectedRole ? (
          /* DETAILED ROLE ROADMAP VIEW (Image 2) */
          <div className="space-y-6 animate-fadeIn">
            
            {/* Back Button */}
            <button
              onClick={() => setSelectedRole(null)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
            >
              <FiArrowLeft size={16} />
              <span>Back to All Roles</span>
            </button>

            {/* Role Hero Card (Dark Gradient Styling - Image 2) */}
            <div className="relative overflow-hidden rounded-3xl bg-slate-950 text-white p-6 sm:p-10 border border-slate-800 shadow-2xl">
              <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-emerald-500/20 blur-3xl pointer-events-none" />

              <div className="relative z-10 space-y-4 max-w-4xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold uppercase tracking-wider">
                  <FiZap className="text-amber-400" /> AI POWERED ROLE ROADMAP & YOUTUBE INTEGRATED
                </div>

                <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
                  {selectedRole.title}
                </h1>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
                  {selectedRole.tagline}
                </p>

                {/* Skills Badges */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {selectedRole.skills.map((skill) => (
                    <span key={skill} className="px-3 py-1 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-200 text-xs font-bold">
                      {skill}
                    </span>
                  ))}
                </div>

                {/* KPI Meta */}
                <div className="flex flex-wrap items-center gap-6 pt-4 text-xs font-bold border-t border-slate-800/80 text-slate-400">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-500 block">HIGHLIGHTED SALARY RANGE</span>
                    <span className="text-amber-400 font-black text-sm sm:text-base">{selectedRole.salaryRange}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-500 block">IN THIS PATH</span>
                    <span className="text-indigo-400 font-black text-sm sm:text-base">{selectedRole.coursesCount} Courses</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-500 block">TOP RECRUITERS</span>
                    <span className="text-slate-200 font-bold text-xs sm:text-sm">Amazon, Google, PayPal, Goldman Sachs</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Skill Assessment Banner (Matching Image 2) */}
            <div className="glass-card rounded-2xl p-5 border border-indigo-200/80 dark:border-indigo-900 bg-indigo-50/50 dark:bg-indigo-950/40 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm">
                    Skill Assessment
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Unlock top opportunities. Clear these assessments to increase your hiring chances by 4x.
                  </p>
                </div>

                <button
                  onClick={() => navigate('/assessments')}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition cursor-pointer"
                >
                  Take Assessment
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-[10px]">
                    1
                  </span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">Online Assessment</span>
                </div>
                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">Available Now</span>
              </div>
            </div>

            {/* LEARNING PATH TIMELINE (Image 2 Timeline layout with embedded YouTube Video Lessons) */}
            <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 space-y-6">
              
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100">
                    Your Learning Path & Video Lessons
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Click any module lesson to play its integrated YouTube tutorial directly inside VidyaPath.
                  </p>
                </div>

                <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
                  <button className="px-3 py-1 rounded-lg bg-white dark:bg-slate-900 shadow text-indigo-600 dark:text-indigo-400">
                    Roadmap
                  </button>
                  <button className="px-3 py-1 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white">
                    Self Assessment
                  </button>
                </div>
              </div>

              {/* Vertical Timeline Nodes */}
              <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-indigo-500/30">
                {selectedRole.roadmapModules.map((mod, idx) => {
                  const isExpanded = expandedModules[mod.id] ?? (idx < 2);
                  return (
                    <div key={mod.id} className="relative group">
                      {/* Circle Timeline Marker */}
                      <div className="absolute -left-6 sm:-left-8 top-1 w-6 h-6 rounded-full bg-white dark:bg-slate-900 border-2 border-indigo-600 dark:border-indigo-400 flex items-center justify-center font-bold text-[10px] text-indigo-600 dark:text-indigo-400 shadow-sm">
                        {idx + 1}
                      </div>

                      <div className="glass-card rounded-2xl p-5 border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition">
                        <div 
                          onClick={() => toggleModuleExpand(mod.id)}
                          className="flex items-center justify-between cursor-pointer"
                        >
                          <h4 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm sm:text-base flex items-center gap-2">
                            <span>{mod.title}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                              {mod.items.length} Video Lessons
                            </span>
                          </h4>

                          <button className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                            {isExpanded ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
                          </button>
                        </div>

                        {/* Module Topic Pills with Integrated YouTube Play Buttons */}
                        {isExpanded && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 animate-fadeIn">
                            {mod.items.map((item) => {
                              const meta = getYoutubeMeta(item);
                              const vidId = `role-vid-${selectedRole.id}-${mod.id}-${item}`;
                              const isCompleted = completedVideos.includes(vidId);

                              return (
                                <div
                                  key={item}
                                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3 hover:border-indigo-400 dark:hover:border-indigo-600 transition"
                                >
                                  <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold shadow-inner ${
                                      isCompleted 
                                        ? 'bg-emerald-500 text-white'
                                        : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                                    }`}>
                                      {isCompleted ? <FiCheck size={16} /> : <FiFilm size={15} />}
                                    </div>

                                    <div className="truncate">
                                      <span className="font-bold text-xs text-slate-800 dark:text-slate-200 block truncate">
                                        {item}
                                      </span>
                                      <span className="text-[10px] text-slate-400 block mt-0.5">
                                        ⏱ {meta.duration} • YouTube Lesson
                                      </span>
                                    </div>
                                  </div>

                                  <button
                                    onClick={() => setActiveVideoModal({
                                      video: {
                                        id: vidId,
                                        title: `${selectedRole.title}: ${item}`,
                                        youtubeId: meta.youtubeId,
                                        duration: meta.duration,
                                        summary: `Watch the full video tutorial covering ${item} as part of the ${selectedRole.title} roadmap.`
                                      },
                                      courseTitle: selectedRole.title
                                    })}
                                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-indigo-600 hover:from-red-700 hover:to-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition cursor-pointer whitespace-nowrap"
                                  >
                                    <FiPlay size={12} /> Play Video
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        )}

                      </div>
                    </div>
                  );
                })}
              </div>

            </div>

          </div>
        ) : (
          /* MAIN ROLE GRID (Image 1) */
          <div className="space-y-8 animate-fadeIn">
            
            {/* Header Banner */}
            <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 relative overflow-hidden">
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-gradient-to-br from-indigo-500/15 via-purple-500/15 to-pink-500/15 blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider mb-3">
                    <FiBriefcase /> Career Roadmaps
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
                    Pick the Role, Build the Skills, Become Job-Ready
                  </h1>
                  <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base mt-1 max-w-2xl leading-relaxed">
                    Every role has a structured learning path with curated courses, embedded YouTube video lessons, assessments, and projects. Click any role to inspect its detailed roadmap.
                  </p>
                </div>

                {/* Category Filter Pills */}
                <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-bold">
                  {['All', 'Software Engineering', 'Web Development', 'Data & AI'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setRoleCategoryFilter(cat)}
                      className={`px-3 py-1.5 rounded-xl transition-all ${
                        roleCategoryFilter === cat
                          ? 'bg-indigo-600 text-white shadow-md'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Role Cards Grid (3 Columns like Image 1) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredRoles.map((role) => (
                <div
                  key={role.id}
                  onClick={() => setSelectedRole(role)}
                  className={`glass-card rounded-2xl p-6 border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer flex flex-col justify-between space-y-4 group ${role.badgeColor}`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-md bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800">
                        Skill Path
                      </span>
                      <span className="text-xs font-bold text-slate-400">
                        {role.coursesCount} Courses
                      </span>
                    </div>

                    <h3 className="font-black text-slate-800 dark:text-slate-100 text-lg group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {role.title}
                    </h3>

                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                      {role.tagline}
                    </p>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {role.skills.slice(0, 4).map((s) => (
                        <span key={s} className="px-2 py-0.5 rounded-md bg-white/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-semibold border border-slate-200/60 dark:border-slate-700">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-400 block">Salary Range</span>
                      <strong className="text-indigo-600 dark:text-indigo-400 font-black">{role.salaryRange}</strong>
                    </div>

                    <span className="flex items-center gap-1 font-bold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform">
                      <span>View Path</span>
                      <FiChevronRight size={14} />
                    </span>
                  </div>

                </div>
              ))}
            </div>

          </div>
        )
      )}

      {/* ========================================================================= */}
      {/* MODE 3: YOUTUBE VIDEO PLAYLISTS & SERIES */}
      {/* ========================================================================= */}
      {viewMode === 'playlists' && (
        <div className="space-y-8 animate-fadeIn">
          
          {/* Header & Controls */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-slate-100">
                  Curated YouTube Video Courses & Playlists
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">
                  Learn through handpicked free video series with rich video thumbnails, embedded playback, and progress tracking.
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative w-full md:w-72">
                <FiSearch className="absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search playlists or topics..."
                  value={playlistSearch}
                  onChange={(e) => setPlaylistSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              {['All', 'AI & Machine Learning', 'Web Development', 'CS & DSA', 'System Design'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setPlaylistCategoryFilter(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    playlistCategoryFilter === cat
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Playlist Series Swimlanes */}
          {filteredPlaylistSeries.length === 0 ? (
            <div className="p-12 text-center glass-card rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
              <FiVideo size={40} className="mx-auto text-slate-400" />
              <h3 className="font-bold text-slate-700 dark:text-slate-300 text-sm">No playlists found</h3>
              <p className="text-xs text-slate-500">Try adjusting your search query or category filter.</p>
            </div>
          ) : (
            filteredPlaylistSeries.map((series, idx) => (
              <div key={idx} className="space-y-4">
                <div>
                  <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                    {series.categoryTitle}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {series.categorySubtitle}
                  </p>
                </div>

                {/* Course Playlist Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {series.courses.map((course) => {
                    const totalVids = course.videos.length;
                    const completedVids = course.videos.filter(v => completedVideos.includes(v.id)).length;
                    const progressPercent = totalVids > 0 ? Math.round((completedVids / totalVids) * 100) : 0;

                    return (
                      <div
                        key={course.id}
                        className="glass-card rounded-3xl p-6 border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition space-y-4 shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-2xl flex items-center justify-center shadow-inner">
                              {course.icon}
                            </div>
                            <div>
                              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                                {course.category}
                              </span>
                              <h4 className="font-black text-slate-800 dark:text-slate-100 text-base mt-1">
                                {course.title}
                              </h4>
                            </div>
                          </div>

                          <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                            <FiClock size={12} /> {course.duration}
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px] font-bold text-slate-500">
                            <span>Progress</span>
                            <span>{completedVids} / {totalVids} Completed ({progressPercent}%)</span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500"
                              style={{ width: `${progressPercent}%` }}
                            />
                          </div>
                        </div>

                        {/* Topic Pills */}
                        <div className="flex flex-wrap gap-1.5">
                          {course.topics.map((top) => (
                            <span key={top} className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold">
                              #{top}
                            </span>
                          ))}
                        </div>

                        {/* Video List with YouTube Thumbnail Previews */}
                        <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                          {course.videos.map((vid) => {
                            const isDone = completedVideos.includes(vid.id);
                            return (
                              <div
                                key={vid.id}
                                className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between gap-3 hover:border-indigo-300 transition group"
                              >
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                  {/* YouTube Thumbnail Preview */}
                                  <div className="relative w-16 h-11 rounded-xl overflow-hidden bg-slate-800 flex-shrink-0 group-hover:scale-105 transition-transform">
                                    <img
                                      src={`https://img.youtube.com/vi/${vid.youtubeId}/mqdefault.jpg`}
                                      alt={vid.title}
                                      className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                      <FiPlay className="text-white text-xs drop-shadow" />
                                    </div>
                                  </div>

                                  <div className="truncate">
                                    <h5 className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                      {vid.title}
                                    </h5>
                                    <p className="text-[10px] text-slate-400 truncate mt-0.5">
                                      {vid.summary}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleMarkVideoCompleted(vid.id)}
                                    className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold transition cursor-pointer ${
                                      isDone
                                        ? 'bg-emerald-500 text-white'
                                        : 'border border-slate-300 dark:border-slate-700 text-slate-400 hover:border-indigo-500'
                                    }`}
                                    title={isDone ? 'Completed' : 'Mark as completed'}
                                  >
                                    {isDone ? <FiCheck size={14} /> : <FiCheckSquare size={14} />}
                                  </button>

                                  <button
                                    onClick={() => setActiveVideoModal({ video: vid, courseTitle: course.title })}
                                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition cursor-pointer whitespace-nowrap"
                                  >
                                    <FiPlay size={12} /> Watch
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}

        </div>
      )}

      {/* YOUTUBE VIDEO PLAYER MODAL */}
      {activeVideoModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl space-y-4">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                  {activeVideoModal.courseTitle}
                </span>
                <h3 className="font-bold text-white text-sm sm:text-base truncate max-w-md">
                  {activeVideoModal.video.title}
                </h3>
              </div>

              <button
                onClick={() => setActiveVideoModal(null)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
              >
                <FiX size={18} />
              </button>
            </div>

            {/* Video Player Embed */}
            <div className="relative pt-[56.25%] w-full bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${activeVideoModal.video.youtubeId}?autoplay=1`}
                title={activeVideoModal.video.title}
                className="absolute top-0 left-0 w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            {/* Modal Footer Controls */}
            <div className="p-6 flex items-center justify-between border-t border-slate-800">
              <p className="text-xs text-slate-400">
                Duration: <strong className="text-slate-200">{activeVideoModal.video.duration}</strong>
              </p>

              <button
                onClick={() => {
                  handleMarkVideoCompleted(activeVideoModal.video.id);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
                  completedVideos.includes(activeVideoModal.video.id)
                    ? 'bg-emerald-600 text-white'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                <FiCheckCircle size={15} />
                <span>
                  {completedVideos.includes(activeVideoModal.video.id)
                    ? 'Completed ✓'
                    : 'Mark as Completed'}
                </span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
