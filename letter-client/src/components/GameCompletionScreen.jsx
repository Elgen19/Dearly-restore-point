// GameCompletionScreen.jsx - Screen shown when user completes a game
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function GameCompletionScreen({ onClaimReward, onMaybeLater, score = null }) {
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    // Hide confetti after animation
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

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

      {/* Enhanced Confetti Animation - Smoother */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(80)].map((_, i) => {
            const startX = Math.random() * 100;
            const startY = -10 - Math.random() * 10;
            const endX = startX + (Math.random() - 0.5) * 200;
            const endY = window.innerHeight + 50;
            const rotation = Math.random() * 720 - 360;
            const scale = 0.6 + Math.random() * 0.4;
            const delay = Math.random() * 0.5;
            const duration = 2.5 + Math.random() * 1.5;
            const emoji = ['🎉', '✨', '💫', '⭐', '🌟', '💖', '💕', '🎊', '🎈', '💝'][Math.floor(Math.random() * 10)];
            
            return (
              <motion.div
                key={i}
                className="absolute"
                style={{
                  left: `${startX}%`,
                  top: `${startY}%`,
                }}
                initial={{ 
                  opacity: 0, 
                  y: startY - 50,
                  x: 0,
                  rotate: 0,
                  scale: 0 
                }}
                animate={{
                  opacity: [0, 1, 1, 0.8, 0],
                  y: endY,
                  x: endX - startX,
                  rotate: rotation,
                  scale: [0, scale * 1.1, scale, scale * 0.9, 0],
                }}
                transition={{
                  duration: duration,
                  delay: delay,
                  ease: [0.34, 1.56, 0.64, 1], // Smoother, more natural easing
                  times: [0, 0.15, 0.7, 0.9, 1],
                }}
              >
                <span className="text-2xl md:text-3xl">
                  {emoji}
                </span>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="relative z-10 text-center max-w-2xl mx-auto px-4"
      >
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
          className="text-7xl mb-6"
        >
          🎉
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="text-4xl md:text-5xl font-serif text-white mb-4"
        >
          You did it!
        </motion.h1>

        {score !== null && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 mb-6"
          >
            <p className="text-white/80 font-serif text-lg mb-2">
              Your Score:
            </p>
            <motion.p
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1.0, type: "spring", stiffness: 200 }}
              className="text-6xl font-serif font-bold text-yellow-300"
            >
              {typeof score === 'number' ? `${score}${score <= 100 ? '%' : ' points'}` : score}
            </motion.p>
          </motion.div>
        )}

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: score !== null ? 1.1 : 0.9 }}
          className="text-xl md:text-2xl font-serif text-pink-200 mb-8"
        >
          {onClaimReward ? 'I\'m so proud of you for completing this! Your effort means everything to me, and I can\'t wait to share something special with you 💝' : 'Congratulations on completing the game! 🎉'}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: score !== null ? 1.2 : 1.1 }}
          className="flex justify-center"
        >
          {onClaimReward && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClaimReward}
              className="px-8 py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full font-serif font-semibold text-lg shadow-lg"
            >
              Claim Your Reward 🎁
            </motion.button>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}

