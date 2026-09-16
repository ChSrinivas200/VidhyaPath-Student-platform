import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  ShoppingBag,
  Search,
  Phone,
  Plus,
  Trash2,
  Book,
  Monitor,
  PenTool,
  Layers,
  FileText,
  Package,
  X
} from 'lucide-react';

const StudentBasket = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: 'Textbooks',
    condition: 'Used',
    contactInfo: ''
  });

  const categories = ['All', 'Textbooks', 'Electronics', 'Lab Coats', 'Stationery', 'Notes', 'Other'];

  // Helper to get icon based on category
  const getCategoryIcon = (cat) => {
    switch (cat) {
      case 'Textbooks':
        return <Book size={32} className="text-indigo-500 dark:text-indigo-400" />;
      case 'Electronics':
        return <Monitor size={32} className="text-purple-500 dark:text-purple-400" />;
      case 'Lab Coats':
        return <Layers size={32} className="text-emerald-500 dark:text-emerald-400" />;
      case 'Stationery':
        return <PenTool size={32} className="text-amber-500 dark:text-amber-400" />;
      case 'Notes':
        return <FileText size={32} className="text-pink-500 dark:text-pink-400" />;
      default:
        return <Package size={32} className="text-slate-500 dark:text-slate-400" />;
    }
  };

  useEffect(() => {
    fetchItems();
  }, [filter]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      let query = '/market';
      if (filter !== 'All') query += `?category=${filter}`;
      const res = await api.get(query);
      setItems(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/market', formData);
      alert('Item listed successfully!');
      setShowModal(false);
      setFormData({ title: '', description: '', price: '', category: 'Textbooks', condition: 'Used', contactInfo: '' });
      fetchItems();
    } catch (err) {
      alert('Failed to list item.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Mark this item as sold/delete it?")) return;
    try {
      await api.delete(`/market/${id}`);
      fetchItems();
    } catch (err) {
      alert("You can only delete your own items.");
    }
  };

  // Filter by search
  const filteredItems = items.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn pb-16 font-sans">
      
      {/* --- HERO HEADER --- */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-gradient-to-br from-emerald-500/15 via-cyan-500/15 to-indigo-500/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-3">
              <ShoppingBag size={14} /> Peer-to-Peer Exchange
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
              Learner Basket
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base mt-1 max-w-xl">
              Buy, sell, and exchange academic textbooks, hardware calculators, lab essentials, and verified notes with fellow learners.
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-6 py-3.5 rounded-2xl font-black text-sm shadow-lg shadow-emerald-500/25 hover:scale-105 active:scale-95 transition-all"
          >
            <Plus size={18} />
            <span>List an Item</span>
          </button>
        </div>
      </div>

      {/* --- FILTER & SEARCH BAR --- */}
      <div className="glass-card rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 flex flex-col lg:flex-row gap-4 items-center justify-between">
        
        {/* Search input */}
        <div className="relative w-full lg:w-1/3">
          <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search textbooks, calculators, notes..."
            className="w-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 pl-11 pr-4 py-2.5 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition-all placeholder-slate-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto w-full lg:w-2/3 pb-1 lg:pb-0 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                filter === cat
                  ? 'bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-500/20'
                  : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* --- ITEMS GRID --- */}
      {loading ? (
        <div className="text-center py-24">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-emerald-500 mx-auto"></div>
          <p className="text-xs text-slate-400 mt-4 font-bold">Loading marketplace listings...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-20 glass-card rounded-3xl border border-slate-200 dark:border-slate-800">
          <ShoppingBag className="mx-auto h-16 w-16 text-slate-300 dark:text-slate-600 mb-4" />
          <h3 className="text-2xl font-bold text-slate-700 dark:text-slate-300">Market is empty</h3>
          <p className="text-slate-400 text-sm mt-1">Be the first to list academic essentials!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item._id}
              className="glass-card rounded-2xl p-5 border border-slate-200 dark:border-slate-800 hover:-translate-y-1 hover:shadow-xl transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Header (Icon + Condition) */}
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700">
                    {getCategoryIcon(item.category)}
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    item.condition === 'New'
                      ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300'
                      : 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300'
                  }`}>
                    {item.condition}
                  </span>
                </div>

                {/* Details */}
                <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100 mb-1 line-clamp-1">
                  {item.title}
                </h3>
                <p className="text-[11px] text-slate-400 mb-2">
                  Seller: <span className="font-bold text-slate-600 dark:text-slate-300">{item.sellerName || 'Learner'}</span>
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                  {item.description}
                </p>
              </div>

              {/* Price & Action */}
              <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
                <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                  ₹{item.price}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                    title="Delete item"
                  >
                    <Trash2 size={16} />
                  </button>
                  <a
                    href={`tel:${item.contactInfo}`}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs"
                  >
                    <Phone size={14} />
                    <span>Contact</span>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- SELL ITEM MODAL --- */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="glass-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden relative">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h2 className="text-lg font-black text-slate-800 dark:text-slate-100">
                List an Item on Learner Basket
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 block">Category</label>
                  <select
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs font-bold text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    {categories.filter((c) => c !== 'All').map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 block">Condition</label>
                  <select
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs font-bold text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500"
                    value={formData.condition}
                    onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                  >
                    <option>New</option>
                    <option>Like New</option>
                    <option>Used</option>
                    <option>Rough</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 block">Item Title</label>
                <input
                  required
                  placeholder="e.g. Casio FX-991EX Calculator / Korth Database Book"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 block">Price (₹)</label>
                  <input
                    required
                    type="number"
                    placeholder="250"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 block">Contact / Phone</label>
                  <input
                    required
                    placeholder="+91 98765 43210"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500"
                    value={formData.contactInfo}
                    onChange={(e) => setFormData({ ...formData, contactInfo: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 block">Description</label>
                <textarea
                  required
                  placeholder="Describe edition, physical condition, pickup spot on campus..."
                  rows="3"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black py-3.5 rounded-2xl shadow-lg shadow-emerald-500/25 transition-all hover:scale-101 active:scale-99 text-sm"
              >
                List Item Now
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default StudentBasket;