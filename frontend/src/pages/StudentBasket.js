import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  ShoppingBag, Search, Tag, Phone, Plus, Trash2, 
  Book, Monitor, PenTool, Layers, FileText, Package 
} from 'lucide-react';

const StudentBasket = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '', description: '', price: '', category: 'Textbooks', condition: 'Used', contactInfo: ''
  });

  const categories = ['All', 'Textbooks', 'Electronics', 'Lab Coats', 'Stationery', 'Notes', 'Other'];

  // Helper to get icon based on  category
  const getCategoryIcon = (cat) => {
    switch(cat) {
      case 'Textbooks': return <Book size={40} className="text-blue-400" />;
      case 'Electronics': return <Monitor size={40} className="text-purple-400" />;
      case 'Lab Coats': return <Layers size={40} className="text-green-400" />;
      case 'Stationery': return <PenTool size={40} className="text-yellow-400" />;
      case 'Notes': return <FileText size={40} className="text-pink-400" />;
      default: return <Package size={40} className="text-gray-400" />;
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
    if(!window.confirm("Mark this item as sold/delete it?")) return;
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
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8 font-sans relative overflow-x-hidden">
      
      {/* Background Decor */}
      <div className="fixed top-20 left-20 w-72 h-72 bg-emerald-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob pointer-events-none"></div>
      <div className="fixed bottom-20 right-20 w-72 h-72 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000 pointer-events-none"></div>

      {/* --- HEADER --- */}
      <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500 mb-2">
            StudentBasket 🛒
          </h1>
          <p className="text-gray-400 text-sm md:text-base">
            Buy, sell, and exchange academic essentials on campus.
          </p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-emerald-500/20 transform hover:scale-105 transition-all flex items-center gap-2"
        >
          <Plus size={20} /> Sell Item
        </button>
      </div>

      {/* --- FILTER BAR --- */}
      <div className="relative z-10 bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 p-4 rounded-2xl shadow-xl mb-8 flex flex-col lg:flex-row gap-4 items-center">
        <div className="relative w-full lg:w-1/3">
          <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Search for books, calc..." 
            className="w-full bg-gray-900/50 border border-gray-600 text-white pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto w-full lg:w-2/3 pb-2 lg:pb-0 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all border ${
                filter === cat 
                  ? 'bg-emerald-600 border-emerald-500 text-white' 
                  : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* --- ITEMS GRID --- */}
      {loading ? (
        <div className="text-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-emerald-500 mx-auto"></div></div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-20 bg-gray-800/30 rounded-3xl border border-gray-700/50">
          <ShoppingBag className="mx-auto h-16 w-16 text-gray-500 mb-4" />
          <h3 className="text-2xl font-bold text-gray-300">Market is empty</h3>
          <p className="text-gray-500">Be the first to list something!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-10 relative z-10">
          {filteredItems.map((item) => (
            <div key={item._id} className="bg-gray-800/40 backdrop-blur-md border border-gray-700/50 rounded-2xl p-5 hover:bg-gray-800/60 transition-all hover:-translate-y-1 hover:shadow-xl group flex flex-col h-full">
              
              {/* Card Header (Icon + Condition) */}
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-gray-900/50 rounded-2xl border border-gray-700/50">
                  {getCategoryIcon(item.category)}
                </div>
                <span className={`px-2 py-1 rounded-lg text-xs font-bold uppercase ${
                  item.condition === 'New' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {item.condition}
                </span>
              </div>

              {/* Details */}
              <div className="mb-4 flex-grow">
                <h3 className="text-lg font-bold text-white mb-1 line-clamp-1">{item.title}</h3>
                <p className="text-xs text-gray-400 mb-2">by {item.sellerName}</p>
                <p className="text-sm text-gray-300 line-clamp-2 bg-gray-900/30 p-2 rounded-lg border border-gray-700/30">
                  {item.description}
                </p>
              </div>

              {/* Price & Action */}
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-700/50">
                <div>
                  <span className="text-xl font-bold text-emerald-400">₹{item.price}</span>
                </div>
                <div className="flex gap-2">
                   {/* Delete button (Visible to everyone for simplicity, backend handles auth check) */}
                   <button 
                    onClick={() => handleDelete(item._id)}
                    className="p-2 rounded-lg bg-gray-700 text-gray-400 hover:text-red-400 hover:bg-red-900/20 transition-colors"
                    title="Delete (If yours)"
                  >
                    <Trash2 size={18} />
                  </button>
                  <a 
                    href={`tel:${item.contactInfo}`}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold transition-all"
                  >
                    <Phone size={16} /> Contact
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- SELL ITEM MODAL --- */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-gray-900 border border-gray-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden relative animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-800 bg-gray-800/50 flex justify-between">
              <h2 className="text-xl font-bold text-white">List an Item</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <select className="bg-gray-800 border border-gray-700 rounded-xl p-3 text-white outline-none"
                  value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                  {categories.filter(c=>c!=='All').map(c => <option key={c}>{c}</option>)}
                </select>
                <select className="bg-gray-800 border border-gray-700 rounded-xl p-3 text-white outline-none"
                  value={formData.condition} onChange={e => setFormData({...formData, condition: e.target.value})}>
                  <option>New</option><option>Like New</option><option>Used</option><option>Rough</option>
                </select>
              </div>

              <input required placeholder="Item Title (e.g. Casio FX-991EX)" 
                className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white outline-none focus:border-emerald-500"
                value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
              />

              <div className="grid grid-cols-2 gap-4">
                <input required type="number" placeholder="Price (₹)" 
                  className="bg-gray-800 border border-gray-700 rounded-xl p-3 text-white outline-none focus:border-emerald-500"
                  value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})}
                />
                 <input required placeholder="Phone / UPI ID" 
                  className="bg-gray-800 border border-gray-700 rounded-xl p-3 text-white outline-none focus:border-emerald-500"
                  value={formData.contactInfo} onChange={e => setFormData({...formData, contactInfo: e.target.value})}
                />
              </div>

              <textarea required placeholder="Description (Condition, Edition, etc.)" rows="3"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white outline-none focus:border-emerald-500"
                value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
              ></textarea>

              <button type="submit" className="w-full bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-500/20">
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