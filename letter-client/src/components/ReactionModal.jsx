// ReactionModal.jsx - Survey modal for receiver's reaction to the letter
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ReactionModal({ isOpen, onSubmit, onCancel, isLoading }) {
  const [selectedReaction, setSelectedReaction] = useState("");
  const [customReaction, setCustomReaction] = useState("");
  const [useCustom, setUseCustom] = useState(false);

  const reactions = [
    { emoji: "😊", label: "Happy", value: "happy" },
    { emoji: "😍", label: "Loved", value: "loved" },
    { emoji: "🥺", label: "Touched", value: "touched" },
    { emoji: "😭", label: "Emotional", value: "emotional" },
    { emoji: "💕", label: "Grateful", value: "grateful" },
    { emoji: "😌", label: "Peaceful", value: "peaceful" },
    { emoji: "🤗", label: "Warm", value: "warm" },
    { emoji: "💖", label: "Cherished", value: "cherished" },
  ];

  const handleReactionSelect = (value) => {
    setSelectedReaction(value);
    setUseCustom(false);
    setCustomReaction("");
  };

  const handleCustomToggle = () => {
    setUseCustom(!useCustom);
    if (!useCustom) {
      setSelectedReaction("");
    } else {
      setCustomReaction("");
    }
  };

  const handleSubmit = () => {
    const reaction = useCustom ? customReaction.trim() : selectedReaction;
    if (!reaction) return;
    
    onSubmit({
      type: useCustom ? "custom" : "preset",
      value: reaction,
      timestamp: new Date().toISOString(),
    });
  };

  const canSubmit = useCustom ? customReaction.trim().length > 0 : selectedReaction.length > 0;

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
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-br from-purple-900/95 via-pink-900/95 to-rose-900/95 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-2xl border border-white/20 p-4 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="text-center mb-4 sm:mb-6">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                  className="text-3xl sm:text-5xl mb-2 sm:mb-4"
                >
                  💌
                </motion.div>
                <h3 className="text-lg sm:text-2xl font-serif text-white mb-1 sm:mb-2 px-2">
                  How did this letter make you feel?
                </h3>
                <p className="text-gray-300 font-serif text-xs sm:text-sm px-2">
                  Share your reaction with the sender
                </p>
              </div>

              {/* Reaction Options */}
              {!useCustom && (
                <div className="mb-4 sm:mb-6">
                  <div className="grid grid-cols-4 gap-2 sm:gap-3">
                    {reactions.map((reaction) => (
                      <motion.button
                        key={reaction.value}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleReactionSelect(reaction.value)}
                        className={`p-2 sm:p-4 rounded-lg sm:rounded-xl font-serif text-xs sm:text-sm transition-all ${
                          selectedReaction === reaction.value
                            ? "bg-pink-500/30 border-2 border-pink-300 scale-110"
                            : "bg-white/10 hover:bg-white/20 border-2 border-transparent"
                        }`}
                      >
                        <div className="text-2xl sm:text-3xl mb-0.5 sm:mb-1">{reaction.emoji}</div>
                        <div className="text-white text-[10px] sm:text-xs leading-tight">{reaction.label}</div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* Custom Reaction Toggle */}
              <div className="mb-3 sm:mb-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCustomToggle}
                  className={`w-full px-3 sm:px-4 py-2 rounded-lg font-serif text-xs sm:text-sm transition-all ${
                    useCustom
                      ? "bg-pink-500/30 border-2 border-pink-300 text-white"
                      : "bg-white/10 hover:bg-white/20 border-2 border-transparent text-gray-300"
                  }`}
                >
                  {useCustom ? "✓ Using Custom Response" : "✎ Express in Your Own Words"}
                </motion.button>
              </div>

              {/* Custom Text Area */}
              {useCustom && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6"
                >
                  <textarea
                    value={customReaction}
                    onChange={(e) => setCustomReaction(e.target.value)}
                    placeholder="Share how this letter made you feel..."
                    className="w-full min-h-[120px] p-4 bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-xl text-white font-serif placeholder-gray-400 focus:outline-none focus:border-pink-300 resize-none"
                    style={{ scrollbarWidth: 'thin' }}
                  />
                </motion.div>
              )}

              {/* Actions */}
              <div className="flex justify-center">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSubmit}
                  disabled={!canSubmit || isLoading}
                  className="w-full px-8 py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-lg font-serif font-semibold text-sm shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Saving..." : "This is how I feel"}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

