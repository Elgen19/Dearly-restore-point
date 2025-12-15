// WelcomeIntro.jsx - Welcome introduction screen after sign-in
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function WelcomeIntro({ onContinue }) {
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    // Show continue button after intro animation completes
    const timer = setTimeout(() => {
      setShowButton(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-2xl text-center"
      >
        {/* Main Welcome Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-8"
        >
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse",
            }}
            className="text-6xl mb-4"
          >
            💌
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 bg-clip-text text-transparent mb-4">
            Welcome to Dearly
          </h1>
        </motion.div>

        {/* Introduction Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="space-y-4 mb-8"
        >
          <p className="text-xl md:text-2xl text-gray-700 font-serif italic">
            Express your heart, beautifully
          </p>
          <div className="max-w-lg mx-auto space-y-3 text-gray-600 font-serif">
            <p>
              You're about to create something special—a letter that will touch someone's heart.
            </p>
            <p>
              Let's begin by setting up who you'll be writing to, and then you can craft your message with care and love.
            </p>
          </div>
        </motion.div>

        {/* Continue Button */}
        <AnimatePresence>
          {showButton && (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              onClick={onContinue}
              className="px-8 py-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-lg font-serif font-semibold text-lg shadow-lg hover:from-rose-600 hover:to-pink-600 transition-all hover:shadow-xl"
            >
              Let's Begin ✨
            </motion.button>
          )}
        </AnimatePresence>

        {/* Decorative Elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={`heart-${i}`}
              className="absolute text-pink-300/30"
              style={{
                left: `${10 + Math.random() * 80}%`,
                top: `${10 + Math.random() * 80}%`,
                fontSize: `${20 + Math.random() * 30}px`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.2, 0.5, 0.2],
                rotate: [0, 15, -15, 0],
              }}
              transition={{
                duration: 4 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
                ease: "easeInOut",
              }}
            >
              💕
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

