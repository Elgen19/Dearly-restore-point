// RewardRevealScreen.jsx - Screen to reveal the selected reward
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const REWARD_ICONS = {
  'food-drink': '🍕',
  'date-outing': '🎬',
  'emotional-digital': '💌',
};

const getRewardIcon = (reward) => {
  if (reward?.type) {
    return REWARD_ICONS[reward.type] || '🎁';
  }
  return '🎁';
};

export default function RewardRevealScreen({ reward, onMessageMe, onMaybeLater }) {
  const [showSparkles, setShowSparkles] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSparkles(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const rewardIcon = getRewardIcon(reward);
  const rewardName = reward?.name || reward?.typeName || 'Special Reward';

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

      {/* Enhanced Sparkle Animation - Smoother */}
      {showSparkles && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(50)].map((_, i) => {
            const centerX = 50;
            const centerY = 40;
            const angle = (i / 50) * Math.PI * 2;
            const distance = 50 + Math.random() * 150;
            const x = centerX + Math.cos(angle) * (distance / window.innerWidth * 100);
            const y = centerY + Math.sin(angle) * (distance / window.innerHeight * 100);
            const delay = Math.random() * 0.4;
            const duration = 2 + Math.random() * 1;
            const scale = 0.7 + Math.random() * 0.5;
            
            return (
              <motion.div
                key={i}
                className="absolute"
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                }}
                initial={{ 
                  opacity: 0, 
                  scale: 0,
                  rotate: 0,
                  x: 0,
                  y: 0
                }}
                animate={{
                  opacity: [0, 1, 1, 0.9, 0],
                  scale: [0, scale * 1.2, scale, scale * 0.9, 0],
                  rotate: [0, 90, 180, 270, 360],
                  x: [0, (Math.random() - 0.5) * 30],
                  y: [0, (Math.random() - 0.5) * 30],
                }}
                transition={{
                  duration: duration,
                  delay: delay,
                  ease: [0.34, 1.56, 0.64, 1], // Smoother easing
                  times: [0, 0.2, 0.6, 0.85, 1],
                }}
              >
                <span className="text-xl md:text-2xl">
                  {['✨', '⭐', '🌟', '💫', '💖', '💕', '🎉'][Math.floor(Math.random() * 7)]}
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
        className="relative z-10 text-center max-w-2xl mx-auto px-4"
      >
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="text-8xl md:text-9xl mb-6"
        >
          {rewardIcon}
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-3xl md:text-4xl font-serif text-white mb-4"
        >
          You unlocked:
          <br />
          <span className="text-pink-300">{rewardName}</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-lg md:text-xl font-serif text-pink-200 mb-6"
        >
          {reward?.name || reward?.typeName ? 
            `I'm so proud of you for completing this! Your "${reward.name || reward.typeName}" is waiting just for you, and I can't wait to share this special moment together 💝` :
            `I'm so happy you completed this! This reward is waiting just for you, and I can't wait to share this special moment together 💝`
          }
        </motion.p>

        {reward?.description && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-8 border border-white/20"
          >
            <p className="text-white/90 font-serif text-base md:text-lg">
              {reward.description}
            </p>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="flex justify-center"
        >
          {onMessageMe && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onMessageMe}
              className="px-8 py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full font-serif font-semibold text-lg shadow-lg"
            >
              Claim Reward 🎁
            </motion.button>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}

