// IntroductoryPreviewV3.jsx - Slide in from side with emphasis
import React from "react";
import { motion } from "framer-motion";

export default function IntroductoryPreviewV3({ 
  introductory, 
  receiverName = "" 
}) {
  return (
    <div className="h-full w-full flex items-center justify-center relative">
      <motion.div
        initial={{ opacity: 0, x: -100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="text-left px-8 max-w-3xl w-full"
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeInOut" }}
          className="h-1 bg-gradient-to-r from-pink-500 to-rose-500 mb-6"
        />
        
        <motion.p
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="text-2xl md:text-4xl font-serif text-white leading-relaxed font-semibold"
          style={{ 
            fontFamily: "'Georgia', 'Palatino Linotype', 'Book Antiqua', Palatino, 'Times New Roman', serif",
            textShadow: '0 2px 20px rgba(0, 0, 0, 0.3)',
          }}
        >
          {introductory || "A letter for the love of my life"}
        </motion.p>
        
        {receiverName && (
          <motion.p
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="text-lg md:text-xl text-pink-200 font-serif mt-6"
            style={{ 
              fontFamily: "'Georgia', 'Palatino Linotype', 'Book Antiqua', Palatino, 'Times New Roman', serif",
            }}
          >
            For {receiverName} 💕
          </motion.p>
        )}
        
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 0.8, delay: 1, ease: "easeInOut" }}
          className="h-1 bg-gradient-to-r from-pink-500 to-rose-500 mt-6"
        />
      </motion.div>
    </div>
  );
}

