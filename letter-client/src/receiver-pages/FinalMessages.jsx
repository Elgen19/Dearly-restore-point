// FinalMessages.jsx - Final messages page after letter reading
import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function FinalMessages({ onWriteBackChoice }) {
  const [showPrompt, setShowPrompt] = useState(false);
  const [hasChosen, setHasChosen] = useState(false);
  const [showContinueButton, setShowContinueButton] = useState(false);

  const finalMessages = [
    "Thank you for taking the time to read this letter.",
    "I hope these words brought you some comfort and joy.",
    "Every word was written with you in mind, with the hope that it might bring a smile to your face.",
    "Remember, you are loved and cherished, today and always.",
    "Until we meet again...",
  ];

  // Memoize stars to prevent re-rendering
  const stars = useMemo(() => {
    return [...Array(100)].map((_, i) => {
      const size = Math.random() < 0.7 ? 1 : Math.random() < 0.9 ? 2 : 3;
      const delay = Math.random() * 5;
      const duration = 3 + Math.random() * 4;
      return {
        id: i,
        size,
        delay,
        duration,
        left: Math.random() * 100,
        top: Math.random() * 100,
      };
    });
  }, []);

  // Memoize hearts to prevent re-rendering
  const hearts = useMemo(() => {
    return [...Array(8)].map((_, i) => ({
      id: i,
      left: 10 + Math.random() * 80,
      top: 10 + Math.random() * 80,
      fontSize: 12 + Math.random() * 20,
      duration: 4 + Math.random() * 3,
      delay: Math.random() * 2,
    }));
  }, []);

  // Show continue button after all messages have appeared
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowContinueButton(true);
    }, 500 + finalMessages.length * 500); // Wait for all messages to appear

    return () => clearTimeout(timer);
  }, []);

  const handleChoice = (choice) => {
    setHasChosen(true);
    setTimeout(() => {
      if (onWriteBackChoice) {
        onWriteBackChoice(choice);
      }
    }, 500);
  };

  return (
    <div className="h-screen w-full flex items-center justify-center relative overflow-hidden">
      {/* Romantic Background */}
      <motion.div
        className="absolute inset-0"
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

      {/* Stars Background */}
      {stars.map((star) => (
        <motion.div
          key={`star-${star.id}`}
          className="absolute bg-white rounded-full"
          style={{
            left: `${star.left}%`,
            top: `${star.top}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            boxShadow: star.size > 1 ? `0 0 ${star.size * 2}px rgba(255, 255, 255, 0.8)` : 'none',
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

      {/* Floating Hearts */}
      {hearts.map((heart) => (
        <motion.div
          key={`heart-${heart.id}`}
          className="absolute text-pink-300/40"
          style={{
            left: `${heart.left}%`,
            top: `${heart.top}%`,
            fontSize: `${heart.fontSize}px`,
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

      {/* Soft Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/10 to-transparent pointer-events-none" />

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center w-full max-w-4xl mx-auto px-2 sm:px-4 py-2 sm:py-4 overflow-y-auto">
        <div className="w-full flex flex-col items-center gap-3 sm:gap-4">
          {/* Messages Container and Prompt - Single AnimatePresence for smooth transition */}
          <AnimatePresence mode="wait">
            {!showPrompt ? (
              <motion.div
                key="messages"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
                className="bg-gradient-to-b from-amber-50/95 via-white/95 to-amber-50/95 backdrop-blur-sm rounded-2xl md:rounded-3xl shadow-2xl border-2 md:border-4 border-amber-300/60 p-4 sm:p-6 md:p-8 lg:p-12 w-full"
              >
                <div className="space-y-4 sm:space-y-6">
                  {finalMessages.map((message, index) => (
                    <motion.p
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.3, duration: 0.6 }}
                      className="text-gray-700 text-base sm:text-lg md:text-xl font-serif leading-relaxed text-center px-2"
                    >
                      {message}
                    </motion.p>
                  ))}
                </div>

                {/* Final Heart */}
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 2, duration: 0.8, type: "spring" }}
                  className="flex justify-center mt-6 sm:mt-8"
                >
                  <motion.div
                    className="text-4xl sm:text-5xl"
                    animate={{
                      scale: [1, 1.2, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    ❤️
                  </motion.div>
                </motion.div>

                {/* Continue Button */}
                <AnimatePresence>
                  {showContinueButton && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.5 }}
                      className="flex justify-center mt-6 sm:mt-8"
                    >
                      <motion.button
                        whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(236, 72, 153, 0.4)" }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowPrompt(true)}
                        className="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-pink-500 via-rose-500 to-pink-500 text-white rounded-full font-serif text-base sm:text-lg shadow-lg hover:shadow-xl transition-all"
                      >
                        Continue
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ) : !hasChosen ? (
              <motion.div
                key="prompt"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
                className="w-full"
              >
                <div className="relative bg-gradient-to-br from-pink-50/95 via-rose-50/95 to-pink-50/95 backdrop-blur-sm rounded-2xl md:rounded-3xl shadow-2xl border-2 md:border-4 border-pink-300/60 p-4 sm:p-6 md:p-8">
                  {/* Decorative Hearts */}
                  <div className="absolute top-2 left-2 sm:top-3 sm:left-3 text-base sm:text-xl opacity-30">💌</div>
                  <div className="absolute top-2 right-2 sm:top-3 sm:right-3 text-base sm:text-xl opacity-30">💕</div>
                  <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 text-base sm:text-xl opacity-30">💖</div>
                  <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 text-base sm:text-xl opacity-30">💝</div>

                  {/* Prompt Text */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    className="text-center mb-4 sm:mb-6"
                  >
                    <motion.p
                      className="text-gray-800 text-lg sm:text-xl md:text-2xl font-serif mb-2 sm:mb-3 leading-relaxed px-2"
                      animate={{
                        opacity: [1, 0.8, 1],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      Would you like to write back?
                    </motion.p>
                    <motion.p
                      className="text-gray-600 text-sm sm:text-base md:text-lg font-serif italic px-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4, duration: 0.6 }}
                    >
                      Your words would mean the world to me...
                    </motion.p>
                  </motion.div>

                  {/* Buttons */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                    className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center"
                  >
                    {/* YES Button */}
                    <motion.button
                      whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(236, 72, 153, 0.4)" }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleChoice(true)}
                      className="w-full sm:w-auto relative px-6 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-pink-500 via-rose-500 to-pink-500 text-white rounded-full font-serif text-base sm:text-lg shadow-lg overflow-hidden group"
                    >
                      {/* Shimmer effect */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                        animate={{
                          x: ["-100%", "200%"],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          repeatDelay: 1,
                          ease: "easeInOut",
                        }}
                      />
                      <span className="relative z-10 flex items-center gap-2">
                        <motion.span
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          ✉️
                        </motion.span>
                        Yes, I'd love to
                      </span>
                    </motion.button>

                    {/* NO Button */}
                    <motion.button
                      whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(139, 92, 246, 0.4)" }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleChoice(false)}
                      className="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-500 text-white rounded-full font-serif text-base sm:text-lg shadow-lg hover:shadow-xl transition-all"
                    >
                      Maybe later
                    </motion.button>
                  </motion.div>

                  {/* Decorative Bottom Element */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.7, duration: 0.6, type: "spring" }}
                    className="flex justify-center mt-4 sm:mt-6"
                  >
                    <motion.div
                      className="text-2xl sm:text-3xl"
                      animate={{
                        rotate: [0, 15, -15, 0],
                        scale: [1, 1.1, 1],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      💌
                    </motion.div>
                  </motion.div>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

