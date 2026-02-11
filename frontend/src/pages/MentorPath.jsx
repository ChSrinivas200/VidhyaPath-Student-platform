import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  Search, Filter, Briefcase, UserCheck, 
  MessageSquare, ExternalLink, Zap, X, Upload 
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
    name: '', role: '', company: '', skills: '', category: 'Placements', linkedIn: ''
  });
  const [idFile, setIdFile] = useState(null);

  // Categories
  const categories = ["All", "Placements", "Internships", "Projects", "Higher Studies"];

  // --- Effects  ---
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
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8 font-sans relative overflow-x-hidden">
      
      {/* Background Decor */}
      <div className="fixed top-0 left-0 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob pointer-events-none"></div>
      <div className="fixed top-0 right-0 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000 pointer-events-none"></div>

      {/* --- HEADER --- */}
      <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-2">
            Find Your Mentor 🚀
          </h1>
          <p className="text-gray-400 text-sm md:text-base max-w-lg">
            Connect with seniors and alumni from top companies and universities.
          </p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="w-full md:w-auto bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
        >
          <Zap size={20} />
          Become a Mentor
        </button>
      </div>

      {/* --- SEARCH & FILTERS --- */}
      <div className="relative z-10 bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 p-4 rounded-2xl shadow-xl mb-8 flex flex-col lg:flex-row gap-4 items-center">
        {/* Search */}
        <div className="relative w-full lg:w-1/3">
          <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Search by name, company, or skill..." 
            className="w-full bg-gray-900/50 border border-gray-600 text-white pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        {/* Filter Chips */}
        <div className="flex gap-2 overflow-x-auto w-full lg:w-2/3 pb-2 lg:pb-0 no-scrollbar items-center">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-300 border flex-shrink-0 ${
                activeFilter === cat 
                  ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-500/20' 
                  : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* --- GRID LAYOUT --- */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      ) : filteredMentors.length === 0 ? (
        <div className="text-center py-20 bg-gray-800/30 rounded-3xl border border-gray-700/50 backdrop-blur-sm">
          <Filter className="mx-auto h-16 w-16 text-gray-500 mb-4" />
          <h3 className="text-2xl font-bold text-gray-300">No mentors found</h3>
          <p className="text-gray-500 mt-2">Try adjusting your filters or be the first to join!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 relative z-10 pb-10">
          {filteredMentors.map((mentor) => (
            <div 
              key={mentor._id} 
              className="group relative bg-gray-800/40 backdrop-blur-md border border-gray-700/50 rounded-3xl p-6 hover:bg-gray-800/60 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-purple-500/10 flex flex-col h-full"
            >
              {/* Status Badge */}
              <div className="absolute top-4 right-4 z-10">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${
                  mentor.isAvailable 
                    ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                    : 'bg-red-500/10 text-red-400 border-red-500/20'
                }`}>
                  <span className={`w-2 h-2 rounded-full mr-2 ${mentor.isAvailable ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></span>
                  {mentor.isAvailable ? 'Available' : 'Busy'}
                </span>
              </div>

              {/* Profile Header */}
              <div className="flex items-center gap-4 mb-5">
                <div className="w-14 h-14 min-w-[3.5rem] rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xl font-bold text-white shadow-lg shadow-indigo-500/20">
                  {mentor.name.charAt(0)}
                </div>
                <div className="overflow-hidden">
                  <h3 className="text-lg font-bold text-white truncate group-hover:text-purple-400 transition-colors">
                    {mentor.name}
                  </h3>
                  <div className="flex items-center text-xs text-gray-400 mt-1">
                     <Briefcase size={12} className="mr-1 flex-shrink-0" />
                     <span className="truncate">{mentor.role}</span>
                  </div>
                  <p className="text-xs text-gray-500 font-medium mt-0.5 truncate">@ {mentor.company}</p>
                </div>
              </div>

              {/* Skills Tags (Flexible Height) */}
              <div className="mb-6 flex-grow">
                <div className="flex flex-wrap gap-2">
                  {mentor.skills.slice(0, 3).map((skill, idx) => (
                    <span 
                      key={idx} 
                      className="px-2.5 py-1 text-xs font-medium rounded-lg bg-gray-700/50 text-gray-300 border border-gray-600/30"
                    >
                      {skill}
                    </span>
                  ))}
                  {mentor.skills.length > 3 && (
                    <span className="px-2 py-1 text-xs text-gray-500">+ {mentor.skills.length - 3}</span>
                  )}
                </div>
              </div>

              {/* Action Buttons (Always at bottom) */}
              <div className="flex gap-3 mt-auto">
                <button 
                  onClick={() => handleConnect(mentor._id)}
                  disabled={!mentor.isAvailable}
                  className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all duration-300 ${
                    mentor.isAvailable
                      ? 'bg-white text-gray-900 hover:bg-purple-50 hover:scale-105 active:scale-95'
                      : 'bg-gray-700 text-gray-500 cursor-not-allowed opacity-50'
                  }`}
                >
                  <MessageSquare size={16} />
                  Connect
                </button>

                <a 
                  href={mentor.linkedIn}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-3 py-2.5 rounded-xl bg-gray-700/50 text-gray-300 hover:bg-gray-700 hover:text-white transition-all border border-gray-600/30 hover:border-gray-500 flex items-center justify-center"
                  title="View Profile"
                >
                  <ExternalLink size={18} />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- REGISTRATION MODAL --- */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-gray-900 border border-gray-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden relative">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-800 bg-gray-800/50">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <UserCheck className="text-purple-500" /> Register as Mentor
              </h2>
              <button 
                onClick={() => setShowModal(false)} 
                className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-gray-800"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleRegisterSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input 
                  required placeholder="Your Name" 
                  className="bg-gray-800 border border-gray-700 rounded-xl p-3 text-white focus:border-purple-500 outline-none transition-colors"
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                />
                <select 
                  className="bg-gray-800 border border-gray-700 rounded-xl p-3 text-white outline-none focus:border-purple-500 transition-colors"
                  value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
                >
                  <option>Placements</option>
                  <option>Internships</option>
                  <option>Projects</option>
                  <option>Higher Studies</option>
                </select>
              </div>

              <input 
                required placeholder="Current Role (e.g. SDE Intern)" 
                className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white outline-none focus:border-purple-500 transition-colors"
                value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}
              />
              
              <input 
                required placeholder="Company / College Name" 
                className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white outline-none focus:border-purple-500 transition-colors"
                value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})}
              />

              <input 
                required placeholder="Skills (e.g. React, Java, System Design)" 
                className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white outline-none focus:border-purple-500 transition-colors"
                value={formData.skills} onChange={e => setFormData({...formData, skills: e.target.value})}
              />

              <input 
                placeholder="LinkedIn Profile URL" 
                className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white outline-none focus:border-purple-500 transition-colors"
                value={formData.linkedIn} onChange={e => setFormData({...formData, linkedIn: e.target.value})}
              />

              {/* ID Card Upload */}
              <div className="border-2 border-dashed border-gray-700 rounded-xl p-6 text-center cursor-pointer hover:bg-gray-800/50 hover:border-purple-500 transition-all relative group">
                <input 
                  type="file" accept="image/*" required 
                  onChange={(e) => setIdFile(e.target.files[0])}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="flex flex-col items-center text-gray-400 group-hover:text-purple-400 transition-colors">
                  <Upload size={32} className="mb-2" />
                  <span className="text-sm font-medium">
                    {idFile ? idFile.name : "Click to Upload ID Card / Offer Letter"}
                  </span>
                  <span className="text-xs text-gray-500 mt-1">Required for verification (Max 5MB)</span>
                </div>
              </div>

              <button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3.5 rounded-xl mt-2 shadow-lg shadow-purple-500/20 transform hover:scale-[1.02] transition-all">
                Submit Application
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default MentorPath;