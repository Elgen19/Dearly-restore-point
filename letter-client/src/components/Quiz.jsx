// Quiz.jsx - Interactive quiz component for security
import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Quiz({
  question = "What is the answer?",
  questionType = "multipleChoice", // "multipleChoice", "trueFalse", "identification"
  options = [], // For multiple choice: ["Option 1", "Option 2", "Option 3"]
  correctAnswer = "", // The correct answer (for preview mode only)
  letterId = null, // Letter ID for backend validation
  userId = null, // User ID for backend validation
  onUnlock,
  onCancel,
  showBackground = true // Whether to show the background (set to false when used in preview)
}) {
  // Log when component receives props
  useEffect(() => {
    console.log('🔐 Quiz component mounted/updated with props:', { userId, letterId, hasQuestion: !!question });
  }, [userId, letterId, question]);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [textAnswer, setTextAnswer] = useState("");
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [error, setError] = useState("");
  const [showQuestion, setShowQuestion] = useState(false);
  const [showContent, setShowContent] = useState(false);

  // Smooth fade-in effect for question (same as DateUnlock)
  useEffect(() => {
    if (!question) return;
    
    setShowQuestion(false);
    setShowContent(false);
    
    // Fade in question smoothly
    const questionTimer = setTimeout(() => {
      setShowQuestion(true);
    }, 300);
    
    // After question is fully visible, wait a meaningful pause then show content
    const contentTimer = setTimeout(() => {
      setShowContent(true);
    }, 3500); // 3.5 seconds total: 300ms delay + 3200ms fade duration

    return () => {
      clearTimeout(questionTimer);
      clearTimeout(contentTimer);
    };
  }, [question]);

  const handleUnlock = async () => {
    let answer = questionType === "identification" ? textAnswer.trim() : selectedAnswer;
    
    if (!answer) {
      setError("Please provide an answer");
      return;
    }

    setIsUnlocking(true);
    setError("");

    // If letterId and userId are provided, use backend validation (secure)
    console.log('🔐 Quiz: handleUnlock called with:', { letterId, userId, hasAnswer: !!answer, answer });
    if (letterId && userId) {
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
        const url = `${backendUrl}/api/letters/${userId}/${letterId}/validate-security`;
        console.log('🔐 Quiz: Calling validate-security:', { userId, letterId, answer, url });
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ answer }),
        });
        
        console.log('🔐 Quiz: Response status:', response.status, response.statusText);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('🔐 Quiz: Error response:', { status: response.status, statusText: response.statusText, errorText });
          throw new Error(`Validation failed: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        console.log('🔐 Quiz: Response data:', result);
        
        setIsUnlocking(false);
        if (result.success && result.isCorrect) {
          if (onUnlock) {
            onUnlock();
          }
        } else {
          setError("Incorrect answer. Please try again.");
          setSelectedAnswer("");
          setTextAnswer("");
        }
      } catch (error) {
        console.error('Error validating answer:', error);
        setIsUnlocking(false);
        setError("Error validating answer. Please try again.");
      }
    } else {
      // Fallback to client-side validation for preview mode
      // Check if answer is correct (case-insensitive for identification)
      let isCorrect = false;
      if (questionType === "identification") {
        isCorrect = answer.toLowerCase().trim() === correctAnswer.toLowerCase().trim();
      } else {
        isCorrect = answer === correctAnswer;
      }

      // Simulate unlock animation
      setTimeout(() => {
        setIsUnlocking(false);
        if (isCorrect && onUnlock) {
          onUnlock();
        } else {
          setError("Incorrect answer. Please try again.");
          setSelectedAnswer("");
          setTextAnswer("");
        }
      }, 1000);
    }
  };

  return (
    <div className="h-full w-full flex items-center justify-center relative overflow-hidden">
      {/* Romantic Background - matching MasterLetterCraft - Only show if showBackground is true */}
      {showBackground && (
        <>
          <motion.div
            className="absolute inset-0 pointer-events-none"
            animate={{
              background: [
                "radial-gradient(circle at 20% 50%, rgba(139, 69, 19, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(75, 0, 130, 0.3) 0%, transparent 50%), linear-gradient(135deg, #1a1a2e 0%, #2d1b4e 50%, #1a1a2e 100%)",
                "radial-gradient(circle at 80% 20%, rgba(139, 69, 19, 0.3) 0%, transparent 50%), radial-gradient(circle at 20% 80%, rgba(75, 0, 130, 0.3) 0%, transparent 50%), linear-gradient(135deg, #2d1b4e 0%, #1a1a2e 50%, #2d1b4e 100%)",
              ],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
            }}
          />

          {/* Stars Background - Memoized to prevent re-renders */}
          {useMemo(() => {
            return Array.from({ length: 100 }, (_, i) => {
              const size = Math.random() < 0.7 ? 1 : Math.random() < 0.9 ? 2 : 3;
              const delay = Math.random() * 5;
              const duration = 3 + Math.random() * 4;
              const left = Math.random() * 100;
              const top = Math.random() * 100;
              return { i, size, delay, duration, left, top };
            });
          }, []).map((star) => (
            <motion.div
              key={`star-${star.i}`}
              className="absolute bg-white rounded-full pointer-events-none"
              style={{
                left: `${star.left}%`,
                top: `${star.top}%`,
                width: `${star.size}px`,
                height: `${star.size}px`,
                boxShadow: star.size > 1 ? `0 0 ${star.size * 2}px rgba(255, 255, 255, 0.8)` : 'none',
                willChange: 'opacity, transform',
              }}
              animate={{
                opacity: [0.2, 1, 0.2],
                scale: [0.8, 1.3, 0.8],
              }}
              transition={{
                duration: star.duration,
                repeat: Infinity,
                delay: star.delay,
                ease: "easeInOut",
              }}
            />
          ))}

          {/* Floating Hearts - Memoized to prevent re-renders */}
          {useMemo(() => {
            return Array.from({ length: 8 }, (_, i) => {
              const left = 10 + Math.random() * 80;
              const top = 10 + Math.random() * 80;
              const fontSize = 12 + Math.random() * 20;
              const duration = 4 + Math.random() * 3;
              const delay = Math.random() * 2;
              return { i, left, top, fontSize, duration, delay };
            });
          }, []).map((heart) => (
            <motion.div
              key={`heart-${heart.i}`}
              className="absolute text-pink-300/40 pointer-events-none"
              style={{
                left: `${heart.left}%`,
                top: `${heart.top}%`,
                fontSize: `${heart.fontSize}px`,
                willChange: 'transform, opacity',
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.3, 0.6, 0.3],
                rotate: [0, 10, -10, 0],
              }}
              transition={{
                duration: heart.duration,
                repeat: Infinity,
                delay: heart.delay,
                ease: "easeInOut",
              }}
            >
              💕
            </motion.div>
          ))}
        </>
      )}

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center px-4 md:px-6 lg:px-8 relative z-10 py-2 w-full h-full flex flex-col justify-center items-center max-h-[90vh] overflow-y-auto"
      >
        {/* Question with Smooth Fade-in Effect (same as DateUnlock) */}
        <AnimatePresence>
          {showQuestion && (
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 3.2, ease: [0.4, 0, 0.2, 1] }}
              className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl italic text-white mb-4 md:mb-6 flex-shrink-0 px-2 md:px-4 text-center leading-relaxed"
              style={{
                fontFamily: "'Dancing Script', 'Brush Script MT', 'Lucida Handwriting', cursive",
                textShadow: '0 2px 20px rgba(0, 0, 0, 0.5)',
              }}
            >
              {question}
            </motion.h2>
          )}
        </AnimatePresence>

        {/* Quiz Content - Only show after question is fully displayed */}
        <AnimatePresence>
          {showContent && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white/10 backdrop-blur-md rounded-2xl p-4 md:p-6 lg:p-8 border border-white/20 shadow-2xl w-full max-w-md md:max-w-lg lg:max-w-2xl"
            >
          {/* Multiple Choice */}
          {questionType === "multipleChoice" && options.length > 0 && (
            <div className="space-y-2 md:space-y-3 mb-4 md:mb-6">
              {options.map((option, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedAnswer(option)}
                  className={`w-full px-4 md:px-6 py-3 md:py-4 rounded-lg font-serif text-sm md:text-base lg:text-lg transition-all border-2 ${
                    selectedAnswer === option
                      ? 'bg-pink-500/30 border-pink-400 text-white'
                      : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                  }`}
                >
                  {option}
                </motion.button>
              ))}
            </div>
          )}

          {/* Yes/No */}
          {questionType === "trueFalse" && (
            <div className="flex gap-2 md:gap-4 mb-4 md:mb-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedAnswer("Yes")}
                className={`flex-1 px-4 md:px-6 py-3 md:py-4 rounded-lg font-serif text-sm md:text-base lg:text-lg transition-all border-2 ${
                  selectedAnswer === "Yes"
                    ? 'bg-pink-500/30 border-pink-400 text-white'
                    : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                }`}
              >
                Yes
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedAnswer("No")}
                className={`flex-1 px-4 md:px-6 py-3 md:py-4 rounded-lg font-serif text-sm md:text-base lg:text-lg transition-all border-2 ${
                  selectedAnswer === "No"
                    ? 'bg-pink-500/30 border-pink-400 text-white'
                    : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                }`}
              >
                No
              </motion.button>
            </div>
          )}

          {/* Identification */}
          {questionType === "identification" && (
            <div className="mb-4 md:mb-6">
              <input
                type="text"
                value={textAnswer}
                onChange={(e) => setTextAnswer(e.target.value)}
                placeholder="Type your answer here..."
                className="w-full px-4 md:px-6 py-3 md:py-4 rounded-lg font-serif text-sm md:text-base lg:text-lg bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-400"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && textAnswer.trim()) {
                    handleUnlock();
                  }
                }}
              />
            </div>
          )}

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-red-300 font-serif text-xs md:text-sm mb-3 md:mb-4"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Unlock Button */}
          <motion.button
            whileHover={{ scale: (selectedAnswer || textAnswer.trim()) ? 1.05 : 1 }}
            whileTap={{ scale: (selectedAnswer || textAnswer.trim()) ? 0.95 : 1 }}
            onClick={handleUnlock}
            disabled={!selectedAnswer && !textAnswer.trim() || isUnlocking}
            className="w-full px-4 md:px-6 py-2.5 md:py-3 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-lg font-serif font-semibold text-sm md:text-base lg:text-lg shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
          >
            {isUnlocking ? (
              <span className="flex items-center justify-center gap-2">
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="inline-block"
                >
                  🔓
                </motion.span>
                Unlocking...
              </span>
            ) : (
              "🔓 Unlock Letter"
            )}
          </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

