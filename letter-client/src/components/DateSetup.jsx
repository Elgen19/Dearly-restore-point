// DateSetup.jsx - Setup page for date unlock configuration
import React, { useState } from "react";
import { motion } from "framer-motion";

export default function DateSetup({
  onComplete,
  onBack
}) {
  const [question, setQuestion] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  const handleNext = () => {
    if (!question.trim()) {
      alert("Please enter a question");
      return;
    }
    if (!selectedDate) {
      alert("Please select a date");
      return;
    }
    
    if (onComplete) {
      onComplete({
        question,
        correctDate: selectedDate
      });
    }
  };

  return (
    <>
      <style>{`
        .date-scroll-wrapper {
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
        .date-scroll-wrapper::-webkit-scrollbar {
          display: none;
        }
        .date-scroll-wrapper {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .date-content-container {
          width: 100%;
          max-width: 42rem;
          margin: 0 auto;
          padding: 1rem;
          padding-bottom: 2rem;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }
        .date-back-button-desktop {
          position: fixed;
          top: 1rem;
          left: 1rem;
          z-index: 9999;
        }
        .date-back-button-mobile {
          position: relative;
          margin-bottom: 1rem;
        }
        @media (max-width: 768px) {
          .date-back-button-desktop {
            display: none;
          }
        }
        @media (min-width: 769px) {
          .date-back-button-mobile {
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
          className="date-back-button-desktop w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 shadow-lg transition-all group"
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
      <div className="date-scroll-wrapper">
        <div className="date-content-container">
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
            <div className="date-back-button-mobile relative mb-4">
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
                  📅 Configure Date Unlock
                </h2>
                <p className="text-gray-300 text-sm font-serif italic">
                  Set up your date-based question
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
                  📅 Configure Date Unlock
                </h2>
                <p className="hidden md:block text-gray-300 text-sm font-serif italic text-center mb-6">
                  Set up your date-based question
                </p>

                {/* Question Input */}
                <div className="mb-6">
                  <label className="block text-sm text-white/80 font-serif mb-3">
                    Question to Guide the Receiver
                  </label>
                  <textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="What is the date of our first date? (e.g., When did we first meet? What day did we have our first date together?)"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white font-serif text-sm placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-pink-400 resize-none"
                    rows="3"
                  />
                  <p className="mt-2 text-xs text-white/60 font-serif italic">
                    Write a clear question that will help the receiver remember the special date
                  </p>
                </div>

                {/* Date Selection */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <label className="block text-sm text-white/80 font-serif mb-3">
                    The Correct Answer Date
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white font-serif text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
                  />
                  <p className="mt-2 text-xs text-white/60 font-serif italic">
                    Select the exact date that matches your question above
                  </p>
                  {selectedDate && (
                    <p className="mt-3 text-white/70 text-sm font-serif font-medium">
                      ✓ Selected: {new Date(selectedDate).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
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
                disabled={!question.trim() || !selectedDate}
                className="w-full px-6 py-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-lg font-serif font-semibold text-sm shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Preview Date Unlock →
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </>
  );
}

