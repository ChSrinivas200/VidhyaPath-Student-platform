import React from 'react';

// Inline Icons
const FiArrowLeft = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"></line>
    <polyline points="12 19 5 12 12 5"></polyline>
  </svg>
);

const FiCheck = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

const FiX = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const QuizReview = ({ reviewData = [], onBack }) => {
  // Guard clause to  prevent "undefined reading map" errors
  if (!reviewData || !Array.isArray(reviewData) || reviewData.length === 0) {
    return (
      <div className="bg-white p-6 md:p-8 rounded-xl border border-slate-200 shadow-sm animate-in slide-in-from-right duration-300">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full text-slate-600 transition-colors">
            <FiArrowLeft />
          </button>
          <h2 className="text-2xl font-semibold text-slate-800">Answer Review</h2>
        </div>
        <div className="text-center py-10 text-slate-500">
          No review data available.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 md:p-8 rounded-xl border border-slate-200 shadow-sm animate-in slide-in-from-right duration-300">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full text-slate-600 transition-colors">
          <FiArrowLeft />
        </button>
        <h2 className="text-2xl font-semibold text-slate-800">Answer Review</h2>
      </div>

      <div className="space-y-8">
        {reviewData.map((item, index) => {
          // Additional safety check for item structure
          if (!item || !item.question) return null;

          return (
            <div key={index} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <p className="font-semibold text-slate-800 mb-4 text-lg">
                <span className="text-indigo-500 mr-2">{index + 1}.</span> 
                {typeof item.question.question === 'string' ? item.question.question : JSON.stringify(item.question.question)}
              </p>

              <div className="space-y-2">
                {item.question.options && item.question.options.map((option, optIndex) => {
                  const isCorrectAnswer = option === item.question.correctAnswer;
                  const isUserSelected = option === item.userAnswer;
                  
                  let style = "border-slate-200 bg-white";
                  let icon = null;

                  if (isCorrectAnswer) {
                    style = "border-green-500 bg-green-50 text-green-800 font-medium";
                    icon = <FiCheck className="text-green-600" />;
                  } else if (isUserSelected && !isCorrectAnswer) {
                    style = "border-red-500 bg-red-50 text-red-800";
                    icon = <FiX className="text-red-600" />;
                  } else if (isUserSelected) {
                     style = "border-green-500 bg-green-50"; 
                  }

                  // Ensure option is rendered as a string to avoid object errors
                  const displayOption = typeof option === 'object' ? JSON.stringify(option) : option;

                  return (
                    <div key={optIndex} className={`flex items-center justify-between p-3 rounded-lg border-2 ${style}`}>
                      <span>{displayOption}</span>
                      {icon}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default QuizReview;