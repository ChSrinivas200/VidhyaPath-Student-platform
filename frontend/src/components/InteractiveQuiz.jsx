import React, { useState } from 'react';

// --- SVG Icon Components ---
// Replaced react-icons to remove  dependency error.

const FiCheck = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

const FiX = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const FiRefreshCw = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polyline points="23 4 23 10 17 10"></polyline>
    <polyline points="1 20 1 14 7 14"></polyline>
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
  </svg>
);

const InteractiveQuiz = ({ questions }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [isAnswered, setIsAnswered] = useState(false);

  // Handle if questions prop is empty or invalid
  if (!questions || !Array.isArray(questions) || questions.length === 0) {
    return <div className="text-center p-4 text-gray-500">No quiz questions available.</div>;
  }

  const currentQuestion = questions[currentQuestionIndex];

  const handleOptionClick = (option) => {
    if (isAnswered) return;
    setSelectedOption(option);
    setIsAnswered(true);

    if (option === currentQuestion.answer) {
      setScore(score + 1);
    }
  };

  const handleNextQuestion = () => {
    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex < questions.length) {
      setCurrentQuestionIndex(nextIndex);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setShowScore(true);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setScore(0);
    setShowScore(false);
    setIsAnswered(false);
  };

  // --- Score View ---
  if (showScore) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center animate-fade-in border border-slate-200">
        <h2 className="text-3xl font-bold text-slate-800 mb-4">Quiz Completed!</h2>
        <div className="text-6xl font-extrabold text-primary-600 mb-4">
          {score} / {questions.length}
        </div>
        <p className="text-slate-600 mb-8 text-lg">
          {score === questions.length ? 'Perfect Score! 🎉' : 'Great effort! Keep learning.'}
        </p>
        <button
          onClick={resetQuiz}
          className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold"
        >
          <FiRefreshCw className="mr-2" /> Try Again
        </button>
      </div>
    );
  }

  // --- Question View ---
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Progress Bar */}
      <div className="w-full bg-slate-100 h-2">
        <div 
          className="bg-primary-500 h-2 transition-all duration-500 ease-out"
          style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      <div className="p-6 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
            Question {currentQuestionIndex + 1} of {questions.length}
          </span>
          <span className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
            Score: {score}
          </span>
        </div>

        <h3 className="text-xl md:text-2xl font-bold text-slate-800 mb-8 leading-relaxed">
          {currentQuestion.question}
        </h3>

        <div className="space-y-3">
          {currentQuestion.options.map((option, index) => {
            // Determine styling based on state
            let optionStyle = "border-slate-200 hover:bg-slate-50 hover:border-primary-300 text-slate-700";
            let icon = null;

            if (isAnswered) {
              if (option === currentQuestion.answer) {
                // Correct Answer
                optionStyle = "bg-green-50 border-green-500 text-green-700 font-medium";
                icon = <FiCheck className="text-green-600 text-xl" />;
              } else if (option === selectedOption) {
                // Incorrect User Selection
                optionStyle = "bg-red-50 border-red-500 text-red-700";
                icon = <FiX className="text-red-600 text-xl" />;
              } else {
                // Other unselected options
                optionStyle = "border-slate-100 text-slate-400 opacity-60";
              }
            } else if (selectedOption === option) {
                // Selected but not submitted (if we had a confirm step, irrelevant here due to immediate feedback)
                optionStyle = "border-primary-500 bg-primary-50 text-primary-700";
            }

            return (
              <button
                key={index}
                onClick={() => handleOptionClick(option)}
                disabled={isAnswered}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 flex justify-between items-center ${optionStyle}`}
              >
                <span>{option}</span>
                {icon}
              </button>
            );
          })}
        </div>

        {isAnswered && (
          <div className="mt-8 flex justify-end animate-fade-in-up">
            <button
              onClick={handleNextQuestion}
              className="px-8 py-3 bg-slate-800 text-white rounded-lg hover:bg-slate-900 font-semibold shadow-md transition-transform hover:-translate-y-0.5"
            >
              {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'See Results'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default InteractiveQuiz;