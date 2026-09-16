import React, { useState } from 'react';
import {
  FiShare2,
  FiSearch,
  FiPlus,
  FiMinus,
  FiCompass,
  FiBookOpen
} from 'react-icons/fi';

const SAMPLE_MAPS = {
  'React Architecture': {
    title: 'React Architecture & Virtual DOM',
    rootNode: 'React Ecosystem',
    children: [
      {
        id: '1',
        title: 'Virtual DOM & Fiber',
        summary: 'In-memory representation of real DOM nodes enabling reconciliation algorithm and time-slicing prioritization.',
        children: [
          { id: '1-1', title: 'Reconciliation', summary: 'Diffing algorithm comparing tree nodes in O(N) time.' },
          { id: '1-2', title: 'Fiber Engine', summary: 'Concurrent renderer breaking work into incremental units.' }
        ]
      },
      {
        id: '2',
        title: 'State & Hook System',
        summary: 'Primitive functions to encapsulate stateful logic across component lifecycle without classes.',
        children: [
          { id: '2-1', title: 'useState / useReducer', summary: 'Local component state management.' },
          { id: '2-2', title: 'useEffect / useLayoutEffect', summary: 'Side-effect handlers and DOM synchronization.' }
        ]
      },
      {
        id: '3',
        title: 'Component Patterns',
        summary: 'Architectural composition guidelines for performant UI rendering.',
        children: [
          { id: '3-1', title: 'Higher Order Components', summary: 'Function taking a component and returning enhanced component.' },
          { id: '3-2', title: 'Custom Hooks', summary: 'Reusable stateful logic functions.' }
        ]
      }
    ]
  },
  'Machine Learning Pipeline': {
    title: 'End-to-End Machine Learning Pipeline',
    rootNode: 'ML System Lifecycle',
    children: [
      {
        id: 'ml-1',
        title: 'Data Ingestion & Cleaning',
        summary: 'Extracting raw features, imputing missing values, and scaling vectors.',
        children: [
          { id: 'ml-1-1', title: 'Feature Scaling', summary: 'Standardization and MinMax Normalization.' }
        ]
      },
      {
        id: 'ml-2',
        title: 'Model Training & Tuning',
        summary: 'Fitting weights via Backpropagation and Hyperparameter optimization.',
        children: [
          { id: 'ml-2-1', title: 'Gradient Descent', summary: 'Optimization algorithm minimizing loss function.' }
        ]
      }
    ]
  }
};

const ConceptMapGenerator = () => {
  const [topic, setTopic] = useState('React Architecture');
  const [selectedNode, setSelectedNode] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(100);

  const activeMap = SAMPLE_MAPS[topic] || SAMPLE_MAPS['React Architecture'];

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fadeIn pb-16 font-sans">
      
      {/* HERO HEADER */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-gradient-to-br from-cyan-500/15 via-purple-500/15 to-indigo-500/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800 text-cyan-600 dark:text-cyan-400 text-xs font-bold uppercase tracking-wider mb-3">
              <FiShare2 size={14} /> Knowledge Graph Generator
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
              Interactive Concept Mind Map
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base mt-1 max-w-xl">
              Visualize structural connections between academic topics, sub-concepts, and core definitions through an interactive node network.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setZoomLevel((z) => Math.min(z + 10, 130))}
              className="p-2.5 rounded-xl glass-card text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Zoom In"
            >
              <FiPlus size={18} />
            </button>
            <span className="text-xs font-black text-slate-500 px-2">{zoomLevel}%</span>
            <button
              onClick={() => setZoomLevel((z) => Math.max(z - 10, 70))}
              className="p-2.5 rounded-xl glass-card text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Zoom Out"
            >
              <FiMinus size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* SEARCH / TOPIC SELECTOR */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <FiSearch className="absolute left-4 top-3.5 text-slate-400" size={18} />
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Type any subject (e.g. React Architecture, Machine Learning, Operating Systems)..."
            className="w-full pl-11 pr-4 py-3 rounded-2xl glass-card border border-slate-200 dark:border-slate-800 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-cyan-500 shadow-xs"
          />
        </div>

        <div className="flex gap-2">
          {Object.keys(SAMPLE_MAPS).map((key) => (
            <button
              key={key}
              onClick={() => {
                setTopic(key);
                setSelectedNode(null);
              }}
              className={`px-4 py-3 rounded-2xl text-xs font-bold transition-all border ${
                topic === key
                  ? 'bg-cyan-600 text-white border-cyan-600 shadow-md shadow-cyan-500/20'
                  : 'glass-card text-slate-600 dark:text-slate-400 hover:border-cyan-400'
              }`}
            >
              {key}
            </button>
          ))}
        </div>
      </div>

      {/* GRAPH CANVAS & NODE INSPECTOR */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Node Network Visualizer */}
        <div className="lg:col-span-2 glass-card rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 min-h-[420px] flex flex-col justify-center items-center overflow-x-auto relative">
          
          <div
            className="transition-transform duration-300 space-y-8 w-full"
            style={{ transform: `scale(${zoomLevel / 100})` }}
          >
            {/* Root Node */}
            <div className="flex justify-center">
              <div
                onClick={() => setSelectedNode({ title: activeMap.rootNode, summary: `Root node for ${activeMap.title}` })}
                className="px-6 py-4 rounded-3xl bg-gradient-to-r from-cyan-600 to-indigo-600 text-white font-black text-base shadow-xl shadow-cyan-500/25 cursor-pointer hover:scale-105 transition-all text-center border-2 border-cyan-300/40"
              >
                🌐 {activeMap.rootNode}
              </div>
            </div>

            {/* Connecting Vertical Line */}
            <div className="w-0.5 h-6 bg-cyan-500/40 mx-auto" />

            {/* Sub-node Branches */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {activeMap.children.map((child) => (
                <div key={child.id} className="space-y-4">
                  <div
                    onClick={() => setSelectedNode(child)}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-900 border-2 border-cyan-500/30 hover:border-cyan-500 shadow-md cursor-pointer transition-all hover:-translate-y-1 text-center"
                  >
                    <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-100">
                      {child.title}
                    </h4>
                    <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-bold block mt-1">
                      {child.children?.length || 0} Sub-concepts
                    </span>
                  </div>

                  {/* Child nodes */}
                  {child.children && (
                    <div className="space-y-2 pl-2 border-l-2 border-dashed border-cyan-500/30">
                      {child.children.map((sub) => (
                        <div
                          key={sub.id}
                          onClick={() => setSelectedNode(sub)}
                          className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-cyan-50 dark:hover:bg-cyan-950/40 transition"
                        >
                          📌 {sub.title}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* Node Inspector Panel */}
        <div className="glass-card rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-xs font-black uppercase text-cyan-600 dark:text-cyan-400">
            <FiBookOpen size={16} /> Node Details & Takeaways
          </div>

          {selectedNode ? (
            <div className="space-y-3 animate-fadeIn">
              <h3 className="text-xl font-black text-slate-800 dark:text-slate-100">
                {selectedNode.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                {selectedNode.summary}
              </p>
              <div className="p-3 rounded-2xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800/60 text-xs text-cyan-700 dark:text-cyan-300 font-bold">
                💡 Exam Tip: Be prepared to illustrate code examples or architectural diagrams when discussing {selectedNode.title}.
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <FiCompass className="mx-auto text-cyan-500" size={32} />
              <p className="text-xs font-bold">Click any node in the map above to inspect its detailed definition, sub-topics, and study guidance.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default ConceptMapGenerator;
