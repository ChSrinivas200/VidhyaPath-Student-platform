import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import {
  FiUser,
  FiX,
  FiCheck,
  FiZap,
  FiAward,
  FiCamera,
  FiCpu,
  FiBriefcase,
  FiTarget,
  FiClock
} from 'react-icons/fi';
import confetti from 'canvas-confetti';

const AVATAR_PRESETS = [
  { id: 'avatar-1', icon: '⚡', bg: 'bg-gradient-to-tr from-indigo-600 to-purple-600' },
  { id: 'avatar-2', icon: '🤖', bg: 'bg-gradient-to-tr from-blue-600 to-indigo-600' },
  { id: 'avatar-3', icon: '🧠', bg: 'bg-gradient-to-tr from-purple-600 to-pink-600' },
  { id: 'avatar-4', icon: '💻', bg: 'bg-gradient-to-tr from-emerald-600 to-teal-600' },
  { id: 'avatar-5', icon: '🚀', bg: 'bg-gradient-to-tr from-amber-500 to-orange-600' },
  { id: 'avatar-6', icon: '👑', bg: 'bg-gradient-to-tr from-yellow-500 to-amber-600' },
  { id: 'avatar-7', icon: '🛡️', bg: 'bg-gradient-to-tr from-cyan-600 to-blue-600' },
  { id: 'avatar-8', icon: '🎓', bg: 'bg-gradient-to-tr from-violet-600 to-purple-700' }
];

const TARGET_ROLES = [
  'Software Development Engineer (SDE)',
  'Frontend Developer',
  'Backend Developer (Node.js/Python/Java)',
  'Data Analyst & BI Specialist',
  'AI Engineer & LLM Specialist',
  'Fullstack Developer',
  'DevOps & Cloud Engineer'
];

const ProfileModal = ({ isOpen, onClose, onProfileUpdated }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [institution, setInstitution] = useState('');
  const [role, setRole] = useState('user');
  const [specialization, setSpecialization] = useState('Software Development Engineer (SDE)');
  const [selectedAvatar, setSelectedAvatar] = useState('avatar-1');
  const [customPhotoUrl, setCustomPhotoUrl] = useState('');
  const [activeTab, setActiveTab] = useState('basic'); // 'basic' | 'ai_builder'

  // AI Questionnaire State
  const [targetRole, setTargetRole] = useState('Software Development Engineer (SDE)');
  const [skillLevel, setSkillLevel] = useState('Intermediate');
  const [primaryFocus, setPrimaryFocus] = useState('Data Structures, React & AI RAG Systems');
  const [weeklyGoal, setWeeklyGoal] = useState('5 Hours / Week');
  const [aiBio, setAiBio] = useState('');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  useEffect(() => {
    const savedName = localStorage.getItem('userName') || 'Learner';
    const savedEmail = localStorage.getItem('userEmail') || 'scholar@university.edu';
    const savedInstitution = localStorage.getItem('userInstitution') || 'VidyaPath Institute of Technology';
    const savedRole = localStorage.getItem('userRole') || 'user';
    const savedSpec = localStorage.getItem('userSpecialization') || 'Software Development Engineer (SDE)';
    const savedAvatar = localStorage.getItem('userAvatar') || 'avatar-1';
    const savedPhoto = localStorage.getItem('userPhotoUrl') || '';
    const savedBio = localStorage.getItem('userAiBio') || '';

    setName(savedName);
    setEmail(savedEmail);
    setInstitution(savedInstitution);
    setRole(savedRole);
    setSpecialization(savedSpec);
    setSelectedAvatar(savedAvatar);
    setCustomPhotoUrl(savedPhoto);
    setAiBio(savedBio);
  }, [isOpen]);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Please choose an image file under 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomPhotoUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isOpen) return null;

  // AI Automatic Suggestions for Profile Questions
  const handleAiAutoFill = () => {
    setIsGeneratingAi(true);

    setTimeout(() => {
      let suggestedSpec = targetRole;
      let suggestedBio = '';

      if (targetRole.includes('SDE')) {
        suggestedBio = 'Aspiring Software Development Engineer focused on mastering DSA (Striver A-Z), Fullstack Web Dev, and High-Performance System Design. Building real-world AI projects.';
        setPrimaryFocus('DSA, React, Node.js, System Design & Clean Architecture');
      } else if (targetRole.includes('AI')) {
        suggestedBio = 'AI Engineer passionate about LLMs, RAG Pipelines, Vector Databases, and PyTorch. Building production-grade AI agents and document intelligence tools.';
        setPrimaryFocus('Python, LangChain, RAG Models, Vector DBs & PyTorch');
      } else if (targetRole.includes('Frontend')) {
        suggestedBio = 'Frontend Specialist crafting pixel-perfect, responsive UIs with React, Next.js, and Tailwind CSS. Obsessed with micro-animations and accessibility.';
        setPrimaryFocus('React, Next.js, Tailwind CSS, TypeScript & UI UX Design');
      } else {
        suggestedBio = 'Tech scholar committed to continuous learning, daily study streaks, and mastering computer science fundamentals.';
        setPrimaryFocus('Python, SQL, Data Pipelines & Analytics');
      }

      setSpecialization(suggestedSpec);
      setAiBio(suggestedBio);
      setIsGeneratingAi(false);

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#a855f7', '#6366f1', '#10b981']
      });
    }, 600);
  };

  const handleSaveProfile = () => {
    localStorage.setItem('userName', name);
    localStorage.setItem('userEmail', email);
    localStorage.setItem('userInstitution', institution);
    localStorage.setItem('userRole', role);
    localStorage.setItem('userSpecialization', specialization);
    localStorage.setItem('userAvatar', selectedAvatar);
    localStorage.setItem('userPhotoUrl', customPhotoUrl);
    localStorage.setItem('userAiBio', aiBio);

    if (onProfileUpdated) {
      onProfileUpdated({
        name,
        email,
        institution,
        role,
        specialization,
        selectedAvatar,
        customPhotoUrl,
        aiBio
      });
    }

    confetti({
      particleCount: 70,
      spread: 70,
      origin: { y: 0.6 }
    });

    onClose();
  };

  const currentAvatarObj = AVATAR_PRESETS.find(a => a.id === selectedAvatar) || AVATAR_PRESETS[0];

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-[99999] animate-fadeIn overflow-y-auto font-sans">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto animate-popIn">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-600 text-white flex items-center justify-center font-black shadow-md">
              <FiUser size={20} />
            </div>
            <div>
              <h2 className="font-black text-slate-800 dark:text-slate-100 text-lg leading-tight">
                Edit Learner & Educator Profile
              </h2>
              <p className="text-xs text-slate-400">
                Customize display name, profile photo, institution details, role, and AI auto-build questions.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Modal Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 bg-slate-50/30 dark:bg-slate-800/30">
          <button
            onClick={() => setActiveTab('basic')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'basic'
                ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <FiUser size={14} /> Basic Profile & Photo
          </button>
          <button
            onClick={() => setActiveTab('ai_builder')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'ai_builder'
                ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <FiZap size={14} className="text-amber-500" /> AI Profile Builder & Questions
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          
          {activeTab === 'basic' ? (
            <>
              {/* Avatar & Photo Picker */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 block">
                  Profile Photo & Preset Avatar
                </label>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
                  <div className={`w-16 h-16 rounded-2xl ${currentAvatarObj.bg} text-white font-black text-2xl flex items-center justify-center shadow-lg shrink-0 overflow-hidden relative group`}>
                    {customPhotoUrl ? (
                      <img src={customPhotoUrl} alt="Avatar" className="w-full h-full object-cover rounded-2xl" />
                    ) : (
                      currentAvatarObj.icon
                    )}
                  </div>

                  <div className="flex-1 space-y-2 w-full">
                    <div className="flex items-center gap-2">
                      <label className="cursor-pointer px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-md transition hover:scale-102 btn-bounce-active">
                        <FiCamera size={14} />
                        <span>Upload Photo File</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>

                      {customPhotoUrl && (
                        <button
                          type="button"
                          onClick={() => setCustomPhotoUrl('')}
                          className="px-3 py-2 rounded-xl border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs font-bold hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                        >
                          Remove Photo
                        </button>
                      )}
                    </div>

                    <input
                      type="text"
                      placeholder="Or paste Custom Photo URL (https://...)"
                      value={customPhotoUrl}
                      onChange={(e) => setCustomPhotoUrl(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <span className="text-[10px] text-slate-400 block">
                      Or select one of the avatar presets below:
                    </span>
                  </div>
                </div>

                {/* Avatar Presets Grid */}
                <div className="grid grid-cols-8 gap-2">
                  {AVATAR_PRESETS.map((av) => (
                    <button
                      key={av.id}
                      type="button"
                      onClick={() => {
                        setSelectedAvatar(av.id);
                        setCustomPhotoUrl('');
                      }}
                      className={`w-10 h-10 rounded-xl ${av.bg} text-white flex items-center justify-center text-base transition-all ${
                        selectedAvatar === av.id && !customPhotoUrl
                          ? 'ring-4 ring-purple-500 scale-110 shadow-md'
                          : 'opacity-80 hover:opacity-100 hover:scale-105'
                      }`}
                    >
                      {av.icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name & Email & Institution Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                  University / College / Institution
                </label>
                <input
                  type="text"
                  placeholder="e.g. VidyaPath Institute of Technology"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Account Role Selector */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 block">
                  Select Account Role
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => setRole('user')}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      role === 'user'
                        ? 'border-indigo-500 bg-indigo-50/80 dark:bg-indigo-950/60 ring-2 ring-indigo-400'
                        : 'border-slate-200 dark:border-slate-800 hover:border-indigo-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <FiUser className="text-indigo-600" />
                      <span className="font-bold text-xs text-slate-800 dark:text-slate-100">
                        Learner / Scholar
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Access learning paths, AI tools, 3D flashcards & quizzes.
                    </p>
                  </div>

                  <div
                    onClick={() => setRole('tutor')}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      role === 'tutor'
                        ? 'border-purple-500 bg-purple-50/80 dark:bg-purple-950/60 ring-2 ring-purple-400'
                        : 'border-slate-200 dark:border-slate-800 hover:border-purple-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <FiAward className="text-purple-600" />
                      <span className="font-bold text-xs text-slate-800 dark:text-slate-100">
                        Tutor / Educator
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Author assessments, monitor learner progress & module analytics.
                    </p>
                  </div>
                </div>
              </div>

              {/* Target Specialization */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                  Target Specialization / Role Track
                </label>
                <select
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {TARGET_ROLES.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            </>
          ) : (
            /* AI QUESTIONNAIRE & AUTO-BUILDER TAB */
            <div className="space-y-4">
              
              <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-50 via-indigo-50 to-pink-50 dark:from-purple-950/40 dark:via-indigo-950/40 dark:to-pink-950/40 border border-purple-200/60 dark:border-purple-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wide">
                    <FiZap className="text-amber-500 animate-pulse" /> AI Profile Question Engine
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                    Answer these career questions or click auto-suggest to generate an optimized profile.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAiAutoFill}
                  disabled={isGeneratingAi}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs shadow-md hover:scale-105 active:scale-95 transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                >
                  <FiCpu className={isGeneratingAi ? 'animate-spin' : ''} />
                  <span>{isGeneratingAi ? 'Synthesizing...' : '⚡ Auto-Fill with AI'}</span>
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                    <FiBriefcase className="text-indigo-500" /> Target Job Role
                  </label>
                  <select
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-100"
                  >
                    {TARGET_ROLES.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                    <FiTarget className="text-emerald-500" /> Current Proficiency Level
                  </label>
                  <select
                    value={skillLevel}
                    onChange={(e) => setSkillLevel(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-100"
                  >
                    <option value="Beginner">Beginner (Building Foundations)</option>
                    <option value="Intermediate">Intermediate (Building Projects)</option>
                    <option value="Advanced">Advanced (Job / Placement Ready)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                    <FiZap className="text-amber-500" /> Primary Skill Focus Areas
                  </label>
                  <input
                    type="text"
                    value={primaryFocus}
                    onChange={(e) => setPrimaryFocus(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                    <FiClock className="text-purple-500" /> Weekly Learning Goal
                  </label>
                  <input
                    type="text"
                    value={weeklyGoal}
                    onChange={(e) => setWeeklyGoal(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                    AI Auto-Generated Profile Bio
                  </label>
                  <textarea
                    rows={3}
                    value={aiBio}
                    onChange={(e) => setAiBio(e.target.value)}
                    placeholder="Click 'Auto-Fill with AI' to generate custom bio..."
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-100 leading-relaxed"
                  />
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            Cancel
          </button>

          <button
            onClick={handleSaveProfile}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md transition hover:scale-102 active:scale-98 cursor-pointer flex items-center gap-1.5"
          >
            <FiCheck size={14} />
            <span>Save Profile Changes</span>
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
};

export default ProfileModal;
