import React, { useState } from 'react';
import api from '../services/api'; 
import { 
  FiUploadCloud, 
  FiFileText, 
  FiLoader, 
  FiFile, 
  FiTrash2, 
  FiAlertCircle 
} from 'react-icons/fi';
import BashSummary from '../components/BashSummary'; 

const Summarizer = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [summary, setSummary] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
        setSelectedFile(file);
        setSummary('');
        setError('');
    } else {
        setError('Please select a valid PDF file.');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedFile) {
      setError('Please select a PDF file first.');
      return;
    }

    setIsLoading(true);
    setSummary('');
    setError('');

    const formData = new FormData();
    formData.append('pdfFile', selectedFile);

    try {
      const res = await api.post('/summarize', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSummary(res.data.summary);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.msg || 'An error occurred while summarizing the file.');
    }
    setIsLoading(false);
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto min-h-screen bg-gray-50 text-gray-800 font-sans animate-fadeIn">
      
      {/* Header  */}
      <div className="mb-10 text-center">
        <div className="inline-flex items-center justify-center p-3 bg-indigo-100 text-indigo-600 rounded-full mb-4">
           <FiFileText size={32} />
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 mb-2">
          AI Document Summarizer
        </h1>
        <p className="text-slate-500 max-w-xl mx-auto">
          Upload a PDF lecture, research paper, or article to instantly distill key insights and save hours of reading time.
        </p>
      </div>

      <div className="max-w-3xl mx-auto">
        <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          
          {/* Upload Area */}
          {!selectedFile ? (
            <div className="relative border-2 border-dashed border-indigo-200 rounded-xl p-10 flex flex-col items-center justify-center bg-indigo-50/30 hover:bg-indigo-50/60 transition-colors cursor-pointer group">
                <input 
                    id="pdfFile" 
                    name="pdfFile" 
                    type="file" 
                    accept="application/pdf" 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                    onChange={handleFileChange} 
                />
                <div className="bg-white p-4 rounded-full shadow-sm mb-4 group-hover:scale-110 transition-transform">
                    <FiUploadCloud size={40} className="text-indigo-500" />
                </div>
                <p className="text-lg font-bold text-slate-700">Click to upload PDF</p>
                <p className="text-sm text-slate-400 mt-1">Maximum size: 15MB</p>
            </div>
          ) : (
            <div className="border border-indigo-100 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between bg-indigo-50/40">
                <div className="flex items-center gap-4 mb-4 md:mb-0">
                    <div className="bg-indigo-100 p-3 rounded-lg text-indigo-600">
                        <FiFile size={28} />
                    </div>
                    <div>
                        <p className="font-bold text-slate-800">{selectedFile.name}</p>
                        <p className="text-xs text-slate-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                </div>
                <button 
                    type="button"
                    onClick={() => setSelectedFile(null)} 
                    className="text-red-500 text-sm font-semibold flex items-center gap-2 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors"
                >
                    <FiTrash2 /> Remove
                </button>
            </div>
          )}
          
          {/* Action Button */}
          <div className="mt-6">
            <button
              type="submit"
              disabled={isLoading || !selectedFile}
              className={`w-full flex justify-center items-center gap-3 py-4 px-4 rounded-xl font-bold text-white shadow-lg transition-all text-lg
                ${isLoading || !selectedFile 
                    ? 'bg-slate-300 cursor-not-allowed shadow-none' 
                    : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-200 hover:-translate-y-1 active:scale-[0.99]'}
              `}
            >
              {isLoading ? <FiLoader className="animate-spin" size={24} /> : null}
              {isLoading ? 'Analyzing Document...' : 'Generate Summary'}
            </button>
          </div>
        </form>

        {/* Output Section */}
        <div className="mt-8">
            {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-3 border border-red-100 animate-fadeIn">
                    <FiAlertCircle size={20} />
                    <span className="font-medium">{error}</span>
                </div>
            )}
            
            {summary && !isLoading && (
                <div className="animate-fadeIn">
                    <BashSummary summary={summary} />
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Summarizer;