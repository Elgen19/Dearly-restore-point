// IntroductoryPreviewV1.jsx - Elegant fade-in centered presentation
import React from "react";
import { motion } from "framer-motion";

export default function IntroductoryPreviewV1({ 
  introductory, 
  receiverName = "" 
}) {
  return (
    <div className="h-full w-full flex items-center justify-center relative">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="text-center px-8 max-w-3xl"
      >
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="text-3xl md:text-5xl font-serif text-white leading-relaxed italic"
          style={{ 
            fontFamily: "'Georgia', 'Palatino Linotype', 'Book Antiqua', Palatino, 'Times New Roman', serif",
            textShadow: '0 2px 20px rgba(0, 0, 0, 0.3)',
          }}
        >
          {introductory || "A letter for the love of my life"}
        </motion.p>
        {receiverName && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="text-lg md:text-xl text-pink-200 font-serif mt-4"
            style={{ 
              fontFamily: "'Georgia', 'Palatino Linotype', 'Book Antiqua', Palatino, 'Times New Roman', serif",
            }}
          >
            For {receiverName} 💕
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}

