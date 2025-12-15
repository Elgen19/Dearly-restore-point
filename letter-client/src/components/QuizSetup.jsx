// QuizSetup.jsx - Setup page for quiz configuration
import React, { useState } from "react";
import { motion } from "framer-motion";
import MessageModal from "./MessageModal.jsx";

export default function QuizSetup({
  onComplete,
  onBack
}) {
  const [question, setQuestion] = useState("");
  const [questionType, setQuestionType] = useState("multipleChoice"); // "multipleChoice", "trueFalse", "identification"
  const [options, setOptions] = useState(["", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [modal, setModal] = useState({ isOpen: false, message: '', type: 'warning' });

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleNext = () => {
    if (!question.trim()) {
      setModal({ isOpen: true, message: "Please enter a question", type: 'warning' });
      return;
    }
    if (questionType === "multipleChoice") {
      const validOptions = options.filter(o => o.trim());
      if (validOptions.length < 2) {
        setModal({ isOpen: true, message: "Please provide at least 2 options", type: 'warning' });
        return;
      }
      if (!correctAnswer.trim()) {
        setModal({ isOpen: true, message: "Please select the correct answer", type: 'warning' });
        return;
      }
    } else if (questionType === "trueFalse") {
      if (!correctAnswer) {
        setModal({ isOpen: true, message: "Please select the correct answer", type: 'warning' });
        return;
      }
    } else if (questionType === "identification") {
      if (!correctAnswer.trim()) {
        setModal({ isOpen: true, message: "Please provide the correct answer", type: 'warning' });
        return;
      }
    }
    
    if (onComplete) {
      onComplete({
        question,
        questionType,
        options: questionType === "multipleChoice" ? options.filter(o => o.trim()) : [],
        correctAnswer
      });
    }
  };

  return (
    <>
      <style>{`
        .quiz-scroll-wrapper {
          width: 100vw;
          margin-left: calc(50% - 50vw);
          margin-right: calc(50% - 50vw);
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          overflow-y: auto;
          overflow-x: hidden;
        }
        .quiz-scroll-wrapper::-webkit-scrollbar {
          display: none;
        }
        .quiz-scroll-wrapper {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .quiz-content-container {
          width: 100%;
          max-width: 42rem;
          margin: 0 auto;
          padding: 1rem;
          padding-bottom: 2rem;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }
        .quiz-back-button-desktop {
          position: fixed;
          top: 1rem;
          left: 1rem;
          z-index: 9999;
        }
        .quiz-back-button-mobile {
          position: relative;
          margin-bottom: 1rem;
        }
        @media (max-width: 768px) {
          .quiz-back-button-desktop {
            display: none;
          }
        }
        @media (min-width: 769px) {
          .quiz-back-button-mobile {
            display: none;
          }
        }
      `}</style>
      {/* Back Button - Desktop: Fixed position at viewport level */}
      {onBack && (
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onBack}
          className="quiz-back-button-desktop w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 shadow-lg transition-all group"
          aria-label="Go back"
        >
          <svg
            className="w-6 h-6 text-white group-hover:text-pink-300 transition-colors"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </motion.button>
      )}
      <div className="quiz-scroll-wrapper">
        <div className="quiz-content-container">
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.96, visibility: "hidden" }}
            animate={{ opacity: 1, y: 0, scale: 1, visibility: "visible" }}
            exit={{ 
              opacity: 0,
              visibility: "hidden",
              transition: { duration: 0, ease: "linear" } 
            }}
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            style={{ willChange: 'opacity, transform, visibility' }}
            className="flex flex-col h-full overflow-hidden"
          >
            {/* Mobile Header - Back Button absolutely positioned, Title/Subheader centered */}
            <div className="quiz-back-button-mobile relative mb-4">
              {onBack && (
                <motion.button
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onBack}
                  className="absolute left-0 top-0 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 shadow-lg transition-all group"
                  aria-label="Go back"
                >
                  <svg
                    className="w-6 h-6 text-white group-hover:text-pink-300 transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </motion.button>
              )}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-center"
              >
                <h2 className="text-2xl font-serif text-white mb-2">
                  ❓ Configure Quiz
                </h2>
                <p className="text-gray-300 text-sm font-serif italic">
                  Set up your personal question
                </p>
              </motion.div>
            </div>
            <div className="flex-1 mb-3">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="relative"
              >
          {/* Desktop Header - Centered */}
          <h2 className="hidden md:block text-2xl md:text-3xl font-serif text-white mb-2 text-center">
            ❓ Configure Quiz
          </h2>
          <p className="hidden md:block text-gray-300 text-sm font-serif italic text-center mb-6">
            Set up your personal question
          </p>

          {/* Question Input */}
          <div className="mb-6">
            <label className="block text-sm text-white/80 font-serif mb-3">
              Question
            </label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder={
                questionType === "multipleChoice" 
                  ? "What is your favorite memory of us?"
                  : questionType === "trueFalse"
                  ? "Did we meet in the summer?"
                  : "What is the name of our first pet?"
              }
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white font-serif text-sm placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-pink-400 resize-none"
              rows="3"
            />
          </div>

          {/* Question Type Selection */}
          <div className="mb-6">
            <label className="block text-sm text-white/80 font-serif mb-3">
              Question Type
            </label>
            <div className="flex gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {["multipleChoice", "trueFalse", "identification"].map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    setQuestionType(type);
                    setCorrectAnswer("");
                  }}
                  className={`px-4 py-2 rounded-lg font-serif text-sm transition-all flex-shrink-0 ${
                    questionType === type
                      ? 'bg-pink-500 text-white'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {type === "multipleChoice" ? "Multiple Choice" : type === "trueFalse" ? "Yes/No" : "Identification"}
                </button>
              ))}
            </div>
          </div>

          {/* Multiple Choice Options */}
          {questionType === "multipleChoice" && (
            <div className="mb-6 bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <label className="block text-sm text-white/80 font-serif mb-3">
                Options (at least 2)
              </label>
              <div className="space-y-3">
                {options.map((option, index) => (
                  <input
                    key={index}
                    type="text"
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white font-serif text-sm placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-pink-400"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Correct Answer */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <label className="block text-sm text-white/80 font-serif mb-3">
              Correct Answer
            </label>
            {questionType === "identification" ? (
              <input
                type="text"
                value={correctAnswer}
                onChange={(e) => setCorrectAnswer(e.target.value)}
                placeholder="The correct answer"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white font-serif text-sm placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
            ) : questionType === "trueFalse" ? (
              <div className="flex gap-2">
                <button
                  onClick={() => setCorrectAnswer("Yes")}
                  className={`flex-1 px-4 py-3 rounded-lg font-serif text-sm transition-all ${
                    correctAnswer === "Yes"
                      ? 'bg-pink-500 text-white'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  Yes
                </button>
                <button
                  onClick={() => setCorrectAnswer("No")}
                  className={`flex-1 px-4 py-3 rounded-lg font-serif text-sm transition-all ${
                    correctAnswer === "No"
                      ? 'bg-pink-500 text-white'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  No
                </button>
              </div>
            ) : (
              <select
                value={correctAnswer}
                onChange={(e) => setCorrectAnswer(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white font-serif text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
              >
                <option value="">Select correct answer</option>
                {options.filter(o => o.trim()).map((option, index) => (
                  <option key={index} value={option} className="bg-pink-900">{option}</option>
                ))}
              </select>
            )}
          </div>
              </motion.div>
            </div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col gap-2 justify-center items-center flex-shrink-0"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleNext}
                disabled={!question.trim() || (questionType === "multipleChoice" && (!correctAnswer || options.filter(o => o.trim()).length < 2)) || (questionType === "trueFalse" && !correctAnswer) || (questionType === "identification" && !correctAnswer.trim())}
                className="w-full px-6 py-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-lg font-serif font-semibold text-sm shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Preview Quiz →
              </motion.button>
            </motion.div>

            {/* Message Modal */}
            <MessageModal
              isOpen={modal.isOpen}
              onClose={() => setModal({ isOpen: false, message: '', type: 'warning' })}
              message={modal.message}
              type={modal.type}
            />
          </motion.div>
        </div>
      </div>
    </>
  );
}

