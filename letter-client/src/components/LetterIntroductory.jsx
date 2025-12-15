// LetterIntroductory.jsx - Component for the introductory phrase/statement
import React from "react";
import { motion } from "framer-motion";

export default function LetterIntroductory({ 
  introductory, 
  onChange, 
  receiverName = "",
  onNext,
  canProceed = false,
  onFocus,
  onBlur,
  onBack
}) {
  const placeholderExamples = [
    "A letter for the love of my life",
    "Words from my heart to yours",
    "A message I've been meaning to share",
    "Thoughts I've been holding close",
    "A letter written just for you"
  ];

  const randomPlaceholder = placeholderExamples[Math.floor(Math.random() * placeholderExamples.length)];

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
      className="flex flex-col h-full"
    >
      {/* Header removed - title and description now at top */}

      {/* Input Section */}
      <div className="flex-grow flex flex-col justify-center min-h-0 overflow-hidden" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <style>{`
          .overflow-hidden::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="w-full"
        >
          <label className="block text-sm text-white/80 font-serif mb-3 text-left">
            Your Opening Statement
          </label>
          <textarea
            value={introductory}
            onChange={(e) => onChange(e.target.value)}
            onFocus={onFocus}
            onBlur={onBlur}
            placeholder={randomPlaceholder}
            className="w-full min-h-[100px] md:min-h-[120px] max-h-[150px] md:max-h-[200px] p-4 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl font-serif text-base text-white leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent placeholder:text-white/50 placeholder:italic text-left"
            style={{ 
              fontFamily: "'Georgia', 'Palatino Linotype', 'Book Antiqua', Palatino, 'Times New Roman', serif",
              textAlign: 'left',
            }}
          />
          <p className="text-xs text-white/60 font-serif text-center mt-2 italic">
            This will set the tone for your entire letter
          </p>
        </motion.div>

        {/* Example prompts */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-4 md:mt-6"
        >
          <p className="text-xs text-white/70 font-serif mb-2 text-center">Need inspiration?</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {placeholderExamples.slice(0, 3).map((example, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onChange(example)}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-full text-xs font-serif transition-all border border-white/20"
              >
                {example}
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Next Button */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex flex-col items-center gap-3 flex-shrink-0 mt-4 md:mt-6 pb-2 md:pb-0"
      >
        <motion.button
          whileHover={{ scale: canProceed ? 1.05 : 1 }}
          whileTap={{ scale: canProceed ? 0.95 : 1 }}
          onClick={onNext}
          disabled={!canProceed}
          className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-lg font-serif font-semibold text-sm shadow-lg transition-all overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
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
                Preview Introductory →
              </span>
            </>
          ) : (
            "Enter an opening statement to continue"
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

