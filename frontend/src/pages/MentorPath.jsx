import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Search,
  Filter,
  Briefcase,
  UserCheck,
  MessageSquare,
  ExternalLink,
  Zap,
  X,
  Upload
} from 'lucide-react';

const MentorPath = () => {
  // --- State Management ---
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    company: '',
    skills: '',
    category: 'Placements',
    linkedIn: ''
  });
  const [idFile, setIdFile] = useState(null);

  // Categories
  const categories = ["All", "Placements", "Internships", "Projects", "Higher Studies"];

  // --- Effects ---
  useEffect(() => {
    fetchMentors();
  }, [activeFilter]);

  // --- API Functions ---
  const fetchMentors = async () => {
    setLoading(true);
    try {
      let query = '/mentors';
      if (activeFilter !== 'All') {
        query += `?category=${activeFilter}`;
      }
      const res = await api.get(query);
      setMentors(res.data);
    } catch (err) {
      console.error("Failed to load mentors", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!idFile) return alert("Please upload your ID Card.");

    const data = new FormData();
    data.append('name', formData.name);
    data.append('role', formData.role);
    data.append('company', formData.company);
    data.append('skills', formData.skills);
    data.append('category', formData.category);
    data.append('linkedIn', formData.linkedIn);
    data.append('idCard', idFile);

    try {
      await api.post('/mentors/register', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert("Registration Successful! Your profile will be visible after admin verification.");
      setShowModal(false);
      setFormData({ name: '', role: '', company: '', skills: '', category: 'Placements', linkedIn: '' });
      setIdFile(null);
      fetchMentors();
    } catch (error) {
      alert(error.response?.data?.message || "Registration failed.");
    }
  };

  const handleConnect = async (mentorId) => {
    try {
      const res = await api.post(`/mentors/${mentorId}/connect`);
      alert(`✅ ${res.data.message}\nContact: ${res.data.data.contact}`);
    } catch (err) {
      alert("❌ Failed to connect. Please try again.");
    }
  };

  // --- Filtering ---
  const filteredMentors = mentors.filter(mentor =>
    mentor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    mentor.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    mentor.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn pb-16 font-sans">
      
      {/* --- HERO HEADER --- */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-gradient-to-br from-purple-500/15 via-indigo-500/15 to-blue-500/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 text-xs font-bold uppercase tracking-wider mb-3">
              <Zap size={14} /> Career & Peer Mentorship
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
              MentorPath
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base mt-1 max-w-xl">
              Connect with alumni, seniors, and industry practitioners for 1-on-1 career guidance, interview mock sessions, and project advice.
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-3.5 rounded-2xl font-black text-sm shadow-lg shadow-purple-500/25 hover:scale-105 active:scale-95 transition-all"
          >
            <Zap size={18} />
            <span>Become a Mentor</span>
          </button>
        </div>
      </div>

      {/* --- SEARCH & FILTERS --- */}
      <div className="glass-card rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 flex flex-col lg:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full lg:w-1/3">
          <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search by mentor, company, or tech stack..."
            className="w-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 pl-11 pr-4 py-2.5 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-purple-500 transition-all placeholder-slate-400"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filter Chips */}
        <div className="flex gap-2 overflow-x-auto w-full lg:w-2/3 pb-1 lg:pb-0 no-scrollbar items-center">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                activeFilter === cat
                  ? 'bg-purple-600 border-purple-600 text-white shadow-md shadow-purple-500/20'
                  : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* --- GRID LAYOUT --- */}
      {loading ? (
        <div className="flex flex-col justify-center items-center py-24">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-purple-500"></div>
          <p className="text-xs text-slate-400 mt-4 font-bold">Discovering mentors across network...</p>
        </div>
      ) : filteredMentors.length === 0 ? (
        <div className="text-center py-20 glass-card rounded-3xl border border-slate-200 dark:border-slate-800">
          <Filter className="mx-auto h-16 w-16 text-slate-300 dark:text-slate-600 mb-4" />
          <h3 className="text-2xl font-bold text-slate-700 dark:text-slate-300">No mentors found</h3>
          <p className="text-slate-400 text-sm mt-1">Try adjusting your search criteria or register as a mentor!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMentors.map((mentor) => (
            <div
              key={mentor._id}
              className="glass-card rounded-2xl p-5 border border-slate-200 dark:border-slate-800 hover:-translate-y-1 hover:shadow-xl transition-all flex flex-col justify-between group relative"
            >
              <div>
                {/* Status Badge */}
                <div className="flex justify-between items-center mb-4">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    mentor.isAvailable
                      ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300'
                      : 'bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${mentor.isAvailable ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
                    {mentor.isAvailable ? 'Available' : 'Busy'}
                  </span>

                  <span className="text-[10px] font-bold uppercase text-slate-400">
                    {mentor.category}
                  </span>
                </div>

                {/* Profile Header */}
                <div className="flex items-center gap-3.5 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-lg font-black text-white shadow-md shadow-purple-500/20 flex-shrink-0">
                    {mentor.name.charAt(0)}
                  </div>
                  <div className="overflow-hidden">
                    <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100 truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                      {mentor.name}
                    </h3>
                    <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      <Briefcase size={12} className="mr-1 flex-shrink-0" />
                      <span className="truncate">{mentor.role}</span>
                    </div>
                    <p className="text-[11px] text-purple-600 dark:text-purple-400 font-bold truncate">@ {mentor.company}</p>
                  </div>
                </div>

                {/* Skills Tags */}
                <div className="mb-4">
                  <div className="flex flex-wrap gap-1.5">
                    {mentor.skills.slice(0, 3).map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 text-[11px] font-bold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-700/80"
                      >
                        {skill}
                      </span>
                    ))}
                    {mentor.skills.length > 3 && (
                      <span className="px-1.5 py-0.5 text-[10px] text-slate-400 font-bold">
                        +{mentor.skills.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => handleConnect(mentor._id)}
                  disabled={!mentor.isAvailable}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    mentor.isAvailable
                      ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-xs hover:scale-105 active:scale-95'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <MessageSquare size={14} />
                  <span>Connect</span>
                </button>

                {mentor.linkedIn && (
                  <a
                    href={mentor.linkedIn}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 border border-slate-200 dark:border-slate-700 transition"
                    title="View LinkedIn Profile"
                  >
                    <ExternalLink size={16} />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- REGISTRATION MODAL --- */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="glass-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden relative">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h2 className="text-lg font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <UserCheck className="text-purple-600" /> Apply as Mentor
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleRegisterSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 block">Full Name</label>
                  <input
                    required
                    placeholder="Your Name"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-purple-500"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 block">Mentorship Category</label>
                  <select
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs font-bold text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-purple-500"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option>Placements</option>
                    <option>Internships</option>
                    <option>Projects</option>
                    <option>Higher Studies</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 block">Current Role</label>
                  <input
                    required
                    placeholder="e.g. SDE-1 / Research Scholar"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-purple-500"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 block">Company / Univ</label>
                  <input
                    required
                    placeholder="Google, Microsoft, IIT..."
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-purple-500"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 block">Key Competencies & Skills</label>
                <input
                  required
                  placeholder="React, Distributed Systems, DSA, System Design..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-purple-500"
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 block">LinkedIn Profile</label>
                <input
                  placeholder="https://linkedin.com/in/yourprofile"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-purple-500"
                  value={formData.linkedIn}
                  onChange={(e) => setFormData({ ...formData, linkedIn: e.target.value })}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 block">Verification Document (ID / Offer Letter)</label>
                <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-5 text-center cursor-pointer hover:bg-purple-50/40 dark:hover:bg-purple-950/20 hover:border-purple-400 transition-all relative group">
                  <input
                    type="file"
                    accept="image/*"
                    required
                    onChange={(e) => setIdFile(e.target.files[0])}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="flex flex-col items-center text-slate-400 group-hover:text-purple-600 transition-colors">
                    <Upload size={24} className="mb-1 text-purple-500" />
                    <span className="text-xs font-bold">
                      {idFile ? idFile.name : "Click to Upload ID Card / Offer Letter"}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5">Required for badge verification (Max 5MB)</span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black py-3.5 rounded-2xl shadow-lg shadow-purple-500/25 transition-all hover:scale-101 active:scale-99 text-sm"
              >
                Submit Mentor Application
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default MentorPath;