// LetterClosing.jsx - Component for the closing impactful messages
import React from "react";
import { motion } from "framer-motion";

export default function LetterClosing({ 
  closing, 
  onChange, 
  onBack,
  onPreview,
  canProceed = false,
  onFocus,
  onBlur
}) {
  const closingExamples = [
    "You will always be the love of my life",
    "You mean everything to me",
    "My heart belongs to you, now and always",
    "You are my greatest blessing",
    "I will love you forever and always",
    "You are my everything"
  ];

  const randomClosing = closingExamples[Math.floor(Math.random() * closingExamples.length)];


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

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto pr-2 mb-3">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="relative"
        >
          <label className="block text-sm text-white/80 font-serif mb-3">
            Your Final Impactful Message
          </label>
          <textarea
            value={closing}
            onChange={(e) => onChange(e.target.value)}
            onFocus={onFocus}
            onBlur={onBlur}
            placeholder={randomClosing}
            className="w-full min-h-[150px] max-h-[300px] p-4 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl font-serif text-sm text-white leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent placeholder:text-white/50 placeholder:italic"
            style={{ 
              fontFamily: "'Georgia', 'Palatino Linotype', 'Book Antiqua', Palatino, 'Times New Roman', serif",
            }}
          />
          <p className="text-xs text-white/60 font-serif mt-2 italic">
            This is your final message to make an impact - not the letter's closing
          </p>
        </motion.div>

        {/* Example closings */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-4"
        >
          <p className="text-xs text-white/70 font-serif mb-2 text-center">Need inspiration?</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {closingExamples.slice(0, 3).map((example, index) => (
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

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex flex-col items-center gap-2 md:gap-3 justify-center flex-shrink-0 pb-2 md:pb-0"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onPreview}
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
                Complete Letter Preview →
              </span>
            </>
          ) : (
            "Complete your letter to preview"
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

