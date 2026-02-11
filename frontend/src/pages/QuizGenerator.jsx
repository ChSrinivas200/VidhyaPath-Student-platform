import React, { useState } from 'react';
import api from '../services/api'; 
import { 
  FiUploadCloud, 
  FiFileText, 
  FiCpu, 
  FiAlertCircle, 
  FiLoader, 
  FiTrash2, 
  FiCheckCircle 
} from 'react-icons/fi';

const QuizGenerator = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [quizData, setQuizData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [score, setScore] = useState(null);

  // --- 1. Handle  File Selection ---
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      setError('');
      setQuizData(null);
    } else {
      setError('Please upload a valid PDF file.');
    }
  };

  // --- 2. Generate Quiz API Call ---
  const handleGenerate = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setError('');
    setScore(null);
    setSelectedAnswers({});

    const formData = new FormData();
    formData.append('pdfFile', selectedFile);

    try {
      // Sending request to Backend
      const response = await api.post('/quiz/generate', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      // Handle response structure
      const data = response.data.quiz || response.data;
      
      if (Array.isArray(data)) {
        setQuizData(data);
      } else {
        throw new Error("Invalid response format from server.");
      }

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.msg || 'Server error. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  // --- 3. Handle Quiz Logic ---
  const handleOptionSelect = (qIndex, option) => {
    setSelectedAnswers({ ...selectedAnswers, [qIndex]: option });
  };

  const handleSubmit = () => {
    let newScore = 0;
    quizData.forEach((q, idx) => {
      // Check against both possible key names from AI (answer or correctAnswer)
      const correct = q.answer || q.correctAnswer;
      if (selectedAnswers[idx] === correct) newScore++;
    });
    setScore(newScore);
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto min-h-screen bg-gray-50 text-gray-800 font-sans animate-fadeIn">
      
      {/* Page Header */}
      <div className="mb-10 text-center">
        <div className="inline-flex items-center justify-center p-3 bg-indigo-100 text-indigo-600 rounded-full mb-4">
           <FiCpu size={32} />
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 mb-2">
          AI Quiz Generator
        </h1>
        <p className="text-slate-500 max-w-xl mx-auto">
          Upload your study notes or lectures (PDF), and our AI will instantly create a practice test to check your understanding.
        </p>
      </div>

      {/* --- Upload Section --- */}
      <div className="bg-white p-6 md:p-10 rounded-2xl shadow-sm border border-gray-200 mb-8 transition-all hover:shadow-md">
        {!selectedFile ? (
          <div className="relative border-2 border-dashed border-indigo-200 rounded-xl p-12 flex flex-col items-center justify-center bg-indigo-50/30 hover:bg-indigo-50/60 transition-colors cursor-pointer group">
            <input 
              type="file" 
              accept=".pdf" 
              onChange={handleFileChange} 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
            />
            <div className="bg-white p-4 rounded-full shadow-sm mb-4 group-hover:scale-110 transition-transform">
                <FiUploadCloud size={40} className="text-indigo-500" />
            </div>
            <p className="text-lg font-bold text-slate-700">Click to upload PDF</p>
            <p className="text-sm text-slate-400 mt-1">Maximum size: 10MB</p>
          </div>
        ) : (
          <div className="border border-indigo-100 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between bg-indigo-50/40">
            <div className="flex items-center gap-4 mb-4 md:mb-0">
                <div className="bg-indigo-100 p-3 rounded-lg text-indigo-600">
                    <FiFileText size={28} />
                </div>
                <div>
                    <p className="font-bold text-slate-800">{selectedFile.name}</p>
                    <p className="text-xs text-slate-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
            </div>
            <button 
                onClick={() => setSelectedFile(null)} 
                className="text-red-500 text-sm font-semibold flex items-center gap-2 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors"
            >
              <FiTrash2 /> Remove
            </button>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-3 border border-red-100">
            <FiAlertCircle size={20} />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={loading || !selectedFile}
          className={`mt-6 w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-3 text-lg
            ${loading || !selectedFile 
              ? 'bg-slate-300 cursor-not-allowed shadow-none' 
              : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-200 hover:-translate-y-1 active:scale-[0.99]'}
          `}
        >
          {loading ? (
            <>
              <FiLoader className="animate-spin" size={24} /> 
              <span>Analyzing Document...</span>
            </>
          ) : (
            <>
              <FiCpu size={24} />
              <span>Generate Quiz</span>
            </>
          )}
        </button>
      </div>

      {/* --- Quiz Display Section --- */}
      {quizData && (
        <div className="animate-fadeIn">
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl border border-gray-100 relative overflow-hidden">
            
            {/* Decoration Top */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-purple-500"></div>

            <div className="flex justify-between items-end mb-8 border-b border-gray-100 pb-4">
              <div>
                 <h2 className="text-2xl font-bold text-slate-800">Practice Quiz</h2>
                 <p className="text-slate-400 text-sm mt-1">Select the best answer for each question.</p>
              </div>
              <span className="bg-indigo-100 text-indigo-700 px-4 py-1.5 rounded-full font-bold text-sm">
                {quizData.length} Questions
              </span>
            </div>
            
            <div className="space-y-8">
              {quizData.map((q, qIndex) => (
                <div key={qIndex} className="bg-gray-50/50 rounded-xl p-2 md:p-4">
                  <p className="font-bold text-lg mb-4 text-slate-800 flex gap-3">
                    <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 text-sm">
                        {qIndex + 1}
                    </span>
                    {q.question}
                  </p>

                  <div className="grid grid-cols-1 gap-3 ml-0 md:ml-11">
                    {q.options.map((option, oIndex) => {
                      const isSelected = selectedAnswers[qIndex] === option;
                      const correctAns = q.answer || q.correctAnswer;
                      const isCorrect = option === correctAns;
                      const showResult = score !== null;

                      // Logic for button colors
                      let btnClass = "border-gray-200 bg-white hover:bg-gray-50 text-slate-600";
                      
                      if (showResult) {
                        if (isCorrect) btnClass = "bg-green-50 border-green-500 text-green-700 font-bold ring-1 ring-green-500";
                        else if (isSelected && !isCorrect) btnClass = "bg-red-50 border-red-500 text-red-700 font-medium ring-1 ring-red-500";
                        else btnClass = "opacity-40 grayscale";
                      } else if (isSelected) {
                        btnClass = "bg-indigo-50 border-indigo-500 text-indigo-700 font-semibold ring-1 ring-indigo-500 shadow-sm";
                      }

                      return (
                        <button
                          key={oIndex}
                          onClick={() => !showResult && handleOptionSelect(qIndex, option)}
                          disabled={showResult}
                          className={`relative p-4 text-left border rounded-xl transition-all duration-200 flex items-center gap-3 ${btnClass}`}
                        >
                          <span className={`flex items-center justify-center w-6 h-6 rounded-md text-xs font-bold border ${isSelected || (showResult && isCorrect) ? 'border-current' : 'border-gray-300 text-gray-400'}`}>
                            {String.fromCharCode(65 + oIndex)}
                          </span>
                          <span>{option}</span>
                          
                          {showResult && isCorrect && <FiCheckCircle className="absolute right-4 text-green-600" size={20} />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer / Results */}
            <div className="mt-10 pt-8 border-t border-gray-100 flex flex-col items-center animate-fadeIn">
              {score === null ? (
                <button
                  onClick={handleSubmit}
                  disabled={Object.keys(selectedAnswers).length < quizData.length}
                  className="w-full md:w-1/2 py-4 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-all shadow-lg shadow-green-200 hover:shadow-xl hover:-translate-y-1"
                >
                  Submit & Check Answers
                </button>
              ) : (
                <div className="text-center w-full bg-gradient-to-b from-indigo-50 to-white p-8 rounded-2xl border border-indigo-100 shadow-sm">
                  <p className="text-gray-500 uppercase tracking-widest text-xs font-bold mb-2">Final Result</p>
                  <p className="text-5xl font-extrabold mb-4 text-slate-800">
                    <span className={score === quizData.length ? "text-green-500" : "text-indigo-600"}>
                        {Math.round((score / quizData.length) * 100)}%
                    </span>
                  </p>
                  <p className="text-lg font-medium text-slate-600 mb-6">
                    You scored {score} out of {quizData.length} correctly.
                    <br />
                    <span className="text-sm text-slate-400">
                        {score === quizData.length ? "Amazing work! 🎉" : "Review the answers above to improve."}
                    </span>
                  </p>
                  
                  <button 
                    onClick={() => { setQuizData(null); setScore(null); setSelectedFile(null); }}
                    className="px-8 py-3 bg-white border border-gray-300 text-slate-700 font-bold rounded-lg hover:bg-gray-50 hover:text-slate-900 transition-colors shadow-sm"
                  >
                    Start New Quiz
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizGenerator;