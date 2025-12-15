// ConfirmationModal.jsx - Modal for confirming letter generation
import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ConfirmationModal({ isOpen, onConfirm, onCancel, isLoading, title, message, icon }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-br from-purple-900/95 via-pink-900/95 to-rose-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6 sm:p-8 max-w-md w-full">
              {/* Header */}
              <div className="text-center mb-6">
                <div className="text-4xl mb-3">{icon || '💌'}</div>
                <h3 className="text-2xl font-serif text-white mb-2">
                  {title || 'Generate Shareable Link?'}
                </h3>
                <p className="text-gray-300 font-serif text-sm">
                  {message || 'Your letter will be saved and a shareable link will be created. You can share this link with your recipient.'}
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onCancel}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-lg font-serif text-sm shadow-lg transition-all border border-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onConfirm}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-lg font-serif font-semibold text-sm shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Generating..." : "Confirm"}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

