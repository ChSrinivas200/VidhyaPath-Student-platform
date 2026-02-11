import React from 'react';

// Inline Icons to avoid  dependency issues
const FiCheckCircle = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);

const FiRefreshCw = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10"></polyline>
    <polyline points="1 20 1 14 7 14"></polyline>
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
  </svg>
);

const FiUploadCloud = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 16 12 12 8 16"></polyline>
    <line x1="12" y1="12" x2="12" y2="21"></line>
    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"></path>
    <polyline points="16 16 12 12 8 16"></polyline>
  </svg>
);

const FiEye = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
);

const QuizResult = ({ score, totalQuestions, onRetake, onNewQuiz, onReview }) => {
  const percentage = Math.round((score / totalQuestions) * 100);

  let feedback = { text: "Great job!", color: "text-green-600" };
  if (percentage < 50) feedback = { text: "Keep practicing!", color: "text-red-600" };
  else if (percentage < 80) feedback = { text: "Good effort!", color: "text-yellow-600" };

  return (
    <div className="bg-white text-center p-8 rounded-xl border border-slate-200 shadow-lg animate-in zoom-in duration-300">
      <FiCheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
      <h2 className="text-3xl font-bold text-slate-800">Quiz Completed!</h2>
      <p className={`text-xl font-medium ${feedback.color} mt-2`}>{feedback.text}</p>
      
      <div className="my-8 p-6 bg-slate-50 rounded-xl">
        <p className="text-5xl font-bold text-indigo-600">{score} / {totalQuestions}</p>
        <p className="text-lg font-semibold text-slate-500 mt-2">{percentage}% Score</p>
      </div>

      <div className="space-y-3">
         <button onClick={onReview} className="w-full flex justify-center items-center gap-2 py-3 px-4 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-all shadow-md">
           <FiEye /> Review Answers
         </button>
         
         <div className="grid grid-cols-2 gap-3">
            <button onClick={onRetake} className="flex justify-center items-center gap-2 py-3 px-4 bg-white border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-all">
              <FiRefreshCw /> Retake
            </button>
            <button onClick={onNewQuiz} className="flex justify-center items-center gap-2 py-3 px-4 bg-white border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-all">
              <FiUploadCloud /> New PDF
            </button>
         </div>
      </div>
    </div>
  );
};

export default QuizResult;