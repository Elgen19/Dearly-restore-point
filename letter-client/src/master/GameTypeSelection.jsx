// GameTypeSelection.jsx - Select game type (memory match or quiz)
import React from 'react';
import { motion } from 'framer-motion';

export default function GameTypeSelection({ onBack, onSelect, availableTypes, isEditMode = false }) {
  const allGameTypes = [
    {
      id: 'quiz',
      name: 'Quiz Game',
      icon: '❓',
      description: 'Create personalized quiz questions about your relationship',
      color: 'from-pink-500 to-rose-500',
    },
    {
      id: 'memory-match',
      name: 'Memory Match',
      icon: '🧠',
      description: 'Create a memory matching game with pairs of romantic items',
      color: 'from-purple-500 to-indigo-500',
    },
  ];

  // Filter game types based on availableTypes prop
  const gameTypes = availableTypes 
    ? allGameTypes.filter(type => availableTypes.includes(type.id))
    : allGameTypes;

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={`heart-${i}`}
            className="absolute text-pink-300/20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              fontSize: `${20 + Math.random() * 40}px`,
            }}
            animate={{
              y: [0, -100, 0],
              x: [0, Math.random() * 50 - 25, 0],
              opacity: [0.1, 0.4, 0.1],
              rotate: [0, 360],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeInOut",
            }}
          >
            💕
          </motion.div>
        ))}
      </div>

      {/* Header */}
      <div className="sticky top-0 w-full z-50 overflow-hidden shadow-lg">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative py-6 md:py-8 px-4 md:px-8"
        >
          <motion.div
            className="absolute inset-0"
            animate={{
              background: [
                'linear-gradient(135deg, rgb(244, 63, 94) 0%, rgb(236, 72, 153) 50%, rgb(168, 85, 247) 100%)',
                'linear-gradient(135deg, rgb(236, 72, 153) 0%, rgb(168, 85, 247) 50%, rgb(244, 63, 94) 100%)',
                'linear-gradient(135deg, rgb(168, 85, 247) 0%, rgb(244, 63, 94) 50%, rgb(236, 72, 153) 100%)',
              ],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Floating Gradient Orbs */}
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={`orb-${i}`}
              className="absolute rounded-full blur-3xl opacity-20"
              style={{
                width: `${300 + i * 100}px`,
                height: `${300 + i * 100}px`,
                background: i % 2 === 0
                  ? 'radial-gradient(circle, rgba(255, 255, 255, 0.4), rgba(244, 63, 94, 0.3))'
                  : 'radial-gradient(circle, rgba(255, 255, 255, 0.4), rgba(168, 85, 247, 0.3))',
              }}
              animate={{
                x: [0, 100, -100, 0],
                y: [0, -100, 100, 0],
                scale: [1, 1.2, 0.8, 1],
              }}
              transition={{
                duration: 15 + i * 3,
                repeat: Infinity,
                delay: i * 2,
                ease: "easeInOut",
              }}
            />
          ))}

          {/* Twinkling Stars/Sparkles */}
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={`sparkle-${i}`}
              className="absolute"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0.8, 1.4, 0.8],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 3,
                ease: "easeInOut",
              }}
            >
              <svg
                width="10"
                height="10"
                viewBox="0 0 10 10"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-white/70"
              >
                <path
                  d="M5 0L6.5 3.5L10 5L6.5 6.5L5 10L3.5 6.5L0 5L3.5 3.5L5 0Z"
                  fill="currentColor"
                  opacity="0.8"
                />
              </svg>
            </motion.div>
          ))}

          <div className="relative max-w-7xl mx-auto flex items-center justify-between">
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onBack}
              className="w-12 h-12 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all shadow-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </motion.button>

            <motion.h1
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl md:text-3xl lg:text-4xl font-serif font-bold text-white drop-shadow-lg text-center"
            >
              {isEditMode ? 'Select Game Type to Edit ✏️' : 'Select Game Type 🎮'}
            </motion.h1>

            <div className="w-12" /> {/* Spacer for centering */}
          </div>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-8 lg:py-12 relative z-10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-6 md:mb-8"
        >
          <h2 className="text-xl md:text-2xl lg:text-3xl font-serif font-bold text-gray-800 text-center mb-2 px-2">
            {isEditMode ? 'Choose a Game Type to Edit' : 'Choose a Game Type'}
          </h2>
          <p className="text-sm md:text-base text-gray-600 text-center font-serif italic px-2">
            {isEditMode 
              ? 'Select the type of game you want to edit' 
              : 'Select the type of game you want to create'}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-w-4xl mx-auto">
          {gameTypes.map((game, index) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className="relative"
            >
              <motion.button
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onSelect(game.id)}
                className="w-full bg-white rounded-2xl shadow-lg p-5 md:p-8 cursor-pointer transition-all duration-300 hover:shadow-2xl border-2 border-transparent hover:border-rose-200 relative overflow-hidden group"
              >
                {/* Gradient Background on Hover */}
                <motion.div
                  className={`absolute inset-0 opacity-0 group-hover:opacity-10 rounded-2xl bg-gradient-to-br ${game.color}`}
                  transition={{ duration: 0.3 }}
                />

                {/* Shimmer effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "200%" }}
                  transition={{ duration: 0.6 }}
                />

                <div className="relative z-10">
                  <div className="text-4xl md:text-6xl mb-3 md:mb-4">{game.icon}</div>
                  <h3 className="text-xl md:text-2xl font-serif font-bold text-gray-800 mb-2">
                    {game.name}
                  </h3>
                  <p className="text-sm md:text-base text-gray-600 font-serif">
                    {game.description}
                  </p>
                </div>
              </motion.button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

