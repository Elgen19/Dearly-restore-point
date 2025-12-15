// IntroductoryPreviewV2.jsx - Typewriter effect presentation
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function IntroductoryPreviewV2({ 
  introductory, 
  receiverName = "" 
}) {
  const [displayedText, setDisplayedText] = useState("");
  const fullText = introductory || "A letter for the love of my life";
  
  useEffect(() => {
    setDisplayedText("");
    let currentIndex = 0;
    let isMounted = true;
    
    const typeInterval = setInterval(() => {
      if (currentIndex < fullText.length && isMounted) {
        setDisplayedText(fullText.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(typeInterval);
      }
    }, 50); // Typing speed
    
    return () => {
      isMounted = false;
      clearInterval(typeInterval);
    };
  }, [fullText, introductory]);

  return (
    <div className="h-full w-full flex items-center justify-center relative">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center px-8 max-w-3xl"
      >
        <div className="relative">
          <p
            className="text-2xl md:text-4xl font-serif text-white leading-relaxed"
            style={{ 
              fontFamily: "'Georgia', 'Palatino Linotype', 'Book Antiqua', Palatino, 'Times New Roman', serif",
              textShadow: '0 2px 20px rgba(0, 0, 0, 0.3)',
              minHeight: '4rem',
            }}
          >
            {displayedText}
            {displayedText.length < fullText.length && (
              <span className="animate-pulse">|</span>
            )}
          </p>
        </div>
        {receiverName && displayedText.length === fullText.length && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
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

