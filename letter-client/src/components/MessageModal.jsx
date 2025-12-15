// MessageModal.jsx - Custom modal for showing messages
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MessageModal({ isOpen, onClose, title, message, type = 'info', icon = null }) {
  if (!isOpen) return null;

  const getIcon = () => {
    if (icon) return icon;
    if (type === 'success') return '✅';
    if (type === 'error') return '❌';
    if (type === 'warning') return '⚠️';
    return 'ℹ️';
  };

  const getColors = () => {
    if (type === 'success') {
      return {
        bg: 'from-green-500 to-emerald-500',
        border: 'border-green-400',
        text: 'text-white',
      };
    }
    if (type === 'error') {
      return {
        bg: 'from-red-500 to-rose-500',
        border: 'border-red-400',
        text: 'text-white',
      };
    }
    if (type === 'warning') {
      return {
        bg: 'from-yellow-500 to-amber-500',
        border: 'border-yellow-400',
        text: 'text-white',
      };
    }
    return {
      bg: 'from-blue-500 to-indigo-500',
      border: 'border-blue-400',
      text: 'text-white',
    };
  };

  const colors = getColors();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className={`bg-gradient-to-br ${colors.bg} rounded-3xl p-8 shadow-2xl border-2 ${colors.border} max-w-md w-full ${colors.text}`}
          >
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                className="text-6xl mb-4"
              >
                {getIcon()}
              </motion.div>
              
              {title && (
                <h2 className="text-2xl md:text-3xl font-serif font-bold mb-3">
                  {title}
                </h2>
              )}
              
              <p className="text-lg font-serif mb-6">
                {message}
              </p>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="px-8 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full font-serif font-semibold transition-all shadow-lg border border-white/30"
              >
                OK
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

