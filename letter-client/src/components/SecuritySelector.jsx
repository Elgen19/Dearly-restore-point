// SecuritySelector.jsx - Component for sender to select security measure type
import React from "react";
import { motion } from "framer-motion";

export default function SecuritySelector({
  onSelect,
  onSkip
}) {

  return (
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
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-2 mb-3" style={{ scrollbarWidth: 'thin', msOverflowStyle: 'none' }}>
        <style>{`
          .overflow-y-auto::-webkit-scrollbar {
            width: 6px;
          }
          .overflow-y-auto::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 3px;
          }
          .overflow-y-auto::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.3);
            border-radius: 3px;
          }
          .overflow-y-auto::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.5);
          }
        `}</style>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="relative px-2"
        >
          <h2 className="text-2xl md:text-3xl font-serif text-white mb-2 text-center">
            🔒 Add Security
          </h2>
          <p className="text-gray-300 text-sm font-serif italic text-center mb-6">
            Choose a security measure to protect your letter
          </p>

          {/* Security Type Selection - Stacked vertically */}
          <div className="grid grid-cols-1 gap-4 mb-6">
            {/* Quiz Option */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect && onSelect("quiz")}
              className="p-6 rounded-xl border-2 transition-all text-left bg-white/10 border-white/20 hover:bg-white/20 w-full"
              style={{ transformOrigin: 'center' }}
            >
              <div className="text-3xl mb-2">❓</div>
              <h3 className="text-xl font-serif text-white mb-2">Quiz Question</h3>
              <p className="text-gray-300 text-sm font-serif">
                Ask a personal question only they know
              </p>
            </motion.button>

            {/* Date Unlock Option */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect && onSelect("date")}
              className="p-6 rounded-xl border-2 transition-all text-left bg-white/10 border-white/20 hover:bg-white/20 w-full"
              style={{ transformOrigin: 'center' }}
            >
              <div className="text-3xl mb-2">📅</div>
              <h3 className="text-xl font-serif text-white mb-2">Date Unlock</h3>
              <p className="text-gray-300 text-sm font-serif">
                Answer a question by selecting a special date
              </p>
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Action Buttons - Removed Skip Security button as security is mandatory */}
    </motion.div>
  );
}

