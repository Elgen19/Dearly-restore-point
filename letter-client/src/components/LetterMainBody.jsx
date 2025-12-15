// LetterMainBody.jsx - Component for the main letter body
import React from "react";
import { motion } from "framer-motion";

export default function LetterMainBody({ 
  mainBody, 
  onChange, 
  onBack,
  onNext,
  canProceed = false,
  writingPrompts = [],
  onFocus,
  onBlur
}) {
  const handleUsePrompt = (prompt) => {
    onChange(prompt);
  };

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
      {/* Header removed - title and description now at top */}

      {/* Content Area - No scroll on parent */}
      <div className="flex-1 flex flex-col min-h-0 mb-2 md:mb-3">
        {/* Writing Prompts */}
        {writingPrompts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-2 md:mb-3 flex-shrink-0"
          >
            <p className="text-xs text-white/80 font-serif mb-1.5 md:mb-2">Need inspiration? Try a prompt:</p>
            <div className="flex flex-wrap gap-1.5">
              {writingPrompts.map((prompt, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleUsePrompt(prompt.content)}
                  className="px-3 py-1 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-full text-xs font-serif transition-all border border-white/20"
                >
                  {prompt.name}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Text Area - Scrollable with styled scrollbar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="relative flex-1 min-h-0"
        >
          <textarea
            value={mainBody}
            onChange={(e) => onChange(e.target.value)}
            onFocus={onFocus}
            onBlur={onBlur}
            placeholder="Begin writing your letter here... Let your heart guide your words. Share your thoughts, feelings, and everything you want to say."
            className="w-full h-full min-h-[200px] md:min-h-[300px] p-4 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl font-serif text-sm text-white leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent placeholder:text-white/50 placeholder:italic overflow-y-auto letter-textarea-scrollbar"
            style={{ 
              fontFamily: "'Georgia', 'Palatino Linotype', 'Book Antiqua', Palatino, 'Times New Roman', serif",
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(255, 182, 193, 0.5) rgba(255, 255, 255, 0.1)',
            }}
          />
          <style dangerouslySetInnerHTML={{__html: `
            .letter-textarea-scrollbar::-webkit-scrollbar {
              width: 8px;
            }
            .letter-textarea-scrollbar::-webkit-scrollbar-track {
              background: rgba(255, 255, 255, 0.05);
              border-radius: 4px;
            }
            .letter-textarea-scrollbar::-webkit-scrollbar-thumb {
              background: rgba(255, 182, 193, 0.5);
              border-radius: 4px;
            }
            .letter-textarea-scrollbar::-webkit-scrollbar-thumb:hover {
              background: rgba(255, 182, 193, 0.7);
            }
          `}} />
        </motion.div>
      </div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex flex-col items-center gap-2 md:gap-3 flex-shrink-0 mt-2 md:mt-0 pb-2 md:pb-0"
      >
        <motion.button
          whileHover={{ scale: canProceed ? 1.05 : 1 }}
          whileTap={{ scale: canProceed ? 0.95 : 1 }}
          onClick={onNext}
          disabled={!canProceed}
          className="w-full md:w-auto relative px-6 py-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-lg font-serif font-semibold text-sm shadow-lg transition-all overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {canProceed ? (
            <>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                animate={{
                  x: ["-100%", "200%"],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 5,
                  ease: "easeInOut",
                }}
              />
              <span className="relative z-10 flex items-center justify-center gap-2">
                Preview Main Letter →
              </span>
            </>
          ) : (
            "Write something to continue"
          )}
        </motion.button>
        
        {/* Back Button - Mobile Only */}
        {onBack && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="md:hidden w-full px-5 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-lg font-serif text-sm shadow-lg transition-all border border-white/20"
          >
            ← Back
          </motion.button>
        )}
      </motion.div>
    </motion.div>
  );
}

