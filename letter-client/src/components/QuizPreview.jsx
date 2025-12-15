// QuizPreview.jsx - Preview of how quiz will look to receiver
import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import Quiz from "./Quiz";
import MessageModal from "./MessageModal.jsx";

export default function QuizPreview({
  question,
  questionType,
  options,
  correctAnswer,
  onConfirm,
  onBack
}) {
  const [modal, setModal] = useState({ isOpen: false, message: '', type: 'success' });
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
      className="h-full w-full flex flex-col relative overflow-hidden"
    >
      {/* Romantic Background - matching MasterLetterCraft */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
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

      {/* Stars Background - Memoized to prevent re-renders */}
      {useMemo(() => {
        return Array.from({ length: 100 }, (_, i) => {
          const size = Math.random() < 0.7 ? 1 : Math.random() < 0.9 ? 2 : 3;
          const delay = Math.random() * 5;
          const duration = 3 + Math.random() * 4;
          const left = Math.random() * 100;
          const top = Math.random() * 100;
          return { i, size, delay, duration, left, top };
        });
      }, []).map((star) => (
        <motion.div
          key={`star-${star.i}`}
          className="absolute bg-white rounded-full pointer-events-none"
          style={{
            left: `${star.left}%`,
            top: `${star.top}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            boxShadow: star.size > 1 ? `0 0 ${star.size * 2}px rgba(255, 255, 255, 0.8)` : 'none',
            willChange: 'opacity, transform',
          }}
          animate={{
            opacity: [0.2, 1, 0.2],
            scale: [0.8, 1.3, 0.8],
          }}
          transition={{
            duration: star.duration,
            repeat: Infinity,
            delay: star.delay,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Floating Hearts - Memoized to prevent re-renders */}
      {useMemo(() => {
        return Array.from({ length: 8 }, (_, i) => {
          const left = 10 + Math.random() * 80;
          const top = 10 + Math.random() * 80;
          const fontSize = 12 + Math.random() * 20;
          const duration = 4 + Math.random() * 3;
          const delay = Math.random() * 2;
          return { i, left, top, fontSize, duration, delay };
        });
      }, []).map((heart) => (
        <motion.div
          key={`heart-${heart.i}`}
          className="absolute text-pink-300/40 pointer-events-none"
          style={{
            left: `${heart.left}%`,
            top: `${heart.top}%`,
            fontSize: `${heart.fontSize}px`,
            willChange: 'transform, opacity',
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.3, 0.6, 0.3],
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            duration: heart.duration,
            repeat: Infinity,
            delay: heart.delay,
            ease: "easeInOut",
          }}
        >
          💕
        </motion.div>
      ))}
      
      <div className="relative z-10 h-full w-full flex flex-col">
      {/* Preview Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-2 flex-shrink-0 pt-4"
      >
        <h2 className="text-lg md:text-xl font-serif text-white mb-1">
          Preview: Quiz
        </h2>
        <p className="text-gray-300 text-xs font-serif italic">
          This is how the receiver will see it
        </p>
      </motion.div>

      {/* Preview Content - Full page */}
      <div className="flex-1 overflow-hidden min-h-0 [&::-webkit-scrollbar]:hidden flex items-center justify-center" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <div className="w-full max-w-[42rem] mx-auto px-4 h-full flex items-center justify-center py-8">
          <Quiz
            question={question}
            questionType={questionType}
            options={options}
            correctAnswer={correctAnswer}
            showBackground={false}
            onUnlock={() => {
              // In preview, just show success message
              setModal({ isOpen: true, message: "Correct! The letter would unlock.", type: 'success' });
            }}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center items-center flex-shrink-0 mt-2 pb-6"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onBack}
          className="w-full sm:w-auto px-5 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-lg font-serif text-sm shadow-lg transition-all border border-white/20"
        >
          ← Back to Edit
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onConfirm}
          className="w-full sm:w-auto px-6 py-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-lg font-serif font-semibold text-sm shadow-lg transition-all"
        >
          Confirm & Continue →
        </motion.button>
      </motion.div>
      </div>

      {/* Message Modal */}
      <MessageModal
        isOpen={modal.isOpen}
        onClose={() => setModal({ isOpen: false, message: '', type: 'success' })}
        message={modal.message}
        type={modal.type}
      />
    </motion.div>
  );
}

