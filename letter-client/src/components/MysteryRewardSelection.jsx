// MysteryRewardSelection.jsx - Screen to select one of three mystery boxes
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MysteryRewardSelection({ rewards, onSelectBox, onBack }) {
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [boxesOpened, setBoxesOpened] = useState([false, false, false]);

  const handleBoxClick = (index) => {
    if (selectedIndex !== null) return; // Already selected
    
    setSelectedIndex(index);
    const newBoxesOpened = [...boxesOpened];
    newBoxesOpened[index] = true;
    setBoxesOpened(newBoxesOpened);
    
    // Call onSelectBox after animation
    setTimeout(() => {
      if (onSelectBox && rewards[index]) {
        onSelectBox(rewards[index]);
      }
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 h-screen w-full flex items-center justify-center overflow-hidden">
      {/* Background */}
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

      {/* Back Button */}
      {onBack && (
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onBack}
          className="absolute top-4 left-4 z-50 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 shadow-lg transition-all group"
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

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 text-center max-w-4xl mx-auto px-4"
      >
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-3xl md:text-4xl font-serif text-white mb-3"
        >
          A little surprise just for you… 🎁
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-lg md:text-xl font-serif text-pink-200 mb-12"
        >
          Choose one of the three mystery boxes.
          <br />
          Each holds something special 💌
        </motion.p>

        {/* Mystery Boxes */}
        <div className="flex flex-wrap justify-center gap-6 md:gap-8">
          {[0, 1, 2].map((index) => {
            const reward = rewards[index];
            const isSelected = selectedIndex === index;
            const isOpened = boxesOpened[index];

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="relative"
              >
                <motion.button
                  whileHover={selectedIndex === null ? { scale: 1.1, y: -10 } : {}}
                  whileTap={selectedIndex === null ? { scale: 0.95 } : {}}
                  onClick={() => handleBoxClick(index)}
                  disabled={selectedIndex !== null}
                  className={`
                    w-32 h-32 md:w-40 md:h-40 rounded-2xl
                    ${isOpened 
                      ? 'bg-gradient-to-br from-yellow-400 to-amber-500' 
                      : 'bg-gradient-to-br from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600'
                    }
                    ${selectedIndex !== null && !isSelected ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    shadow-2xl border-4 border-white/30
                    flex items-center justify-center
                    transition-all duration-300
                    relative overflow-hidden
                  `}
                >
                  {/* Shimmer effect */}
                  {!isOpened && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                      animate={{
                        x: ['-100%', '200%'],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatDelay: 1,
                      }}
                    />
                  )}

                  {/* Box Content */}
                  <AnimatePresence mode="wait">
                    {isOpened ? (
                      <motion.div
                        key="opened"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: 180 }}
                        transition={{ type: "spring", stiffness: 200 }}
                        className="text-5xl md:text-6xl"
                      >
                        {reward?.type === 'food-drink' ? '🍕' : 
                         reward?.type === 'date-outing' ? '🎬' : 
                         reward?.type === 'emotional-digital' ? '💌' : '🎁'}
                      </motion.div>
                    ) : (
                      <motion.div
                        key="closed"
                        initial={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="text-5xl md:text-6xl"
                      >
                        🎁
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Enhanced Sparkle effect when opened */}
                  {isOpened && (
                    <>
                      {[...Array(30)].map((_, i) => {
                        const angle = (i / 30) * Math.PI * 2;
                        const distance = 40 + Math.random() * 30;
                        const x = Math.cos(angle) * distance;
                        const y = Math.sin(angle) * distance;
                        const delay = i * 0.03;
                        const duration = 1.5 + Math.random() * 0.5;
                        
                        return (
                          <motion.div
                            key={`sparkle-${i}`}
                            className="absolute"
                            style={{
                              left: '50%',
                              top: '50%',
                            }}
                            initial={{ 
                              opacity: 0, 
                              scale: 0,
                              x: 0,
                              y: 0,
                              rotate: 0
                            }}
                            animate={{ 
                              opacity: [0, 1, 1, 0], 
                              scale: [0, 1.2, 0.8, 0],
                              x: x,
                              y: y,
                              rotate: 360
                            }}
                            transition={{
                              duration: duration,
                              delay: delay,
                              ease: "easeOut",
                              times: [0, 0.2, 0.8, 1],
                            }}
                          >
                            <span className="text-xl md:text-2xl">
                              {['✨', '⭐', '🌟', '💫', '💖'][Math.floor(Math.random() * 5)]}
                            </span>
                          </motion.div>
                        );
                      })}
                    </>
                  )}
                </motion.button>

                {/* Box Number */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  className="text-white/70 font-serif text-sm mt-2"
                >
                  Box {index + 1}
                </motion.p>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}

