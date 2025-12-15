// ClosingPreviewV3.jsx - Romantic wave cascade reveal
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function ClosingPreviewV3({ 
  closing, 
  receiverName = "" 
}) {
  const [visible, setVisible] = useState(false);
  const [waveProgress, setWaveProgress] = useState(0);
  const fullText = closing || "You will always be the love of my life";
  const words = fullText.split(' ');

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (visible) {
      // Animate wave progress from 0 to 1.2 to ensure all words appear
      const duration = words.length * 200 + 400; // 200ms per word + extra time
      const startTime = Date.now();
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1.2); // Go slightly past 1 to ensure all words show
        setWaveProgress(progress);
        
        if (progress < 1.2) {
          requestAnimationFrame(animate);
        } else {
          // Ensure final state shows all words
          setWaveProgress(1.2);
        }
      };
      
      requestAnimationFrame(animate);
    }
  }, [visible, words.length]);

  // Calculate which words should be visible based on wave progress
  const getWordVisibility = (index) => {
    // Normalize index to 0-1 range
    const normalizedIndex = index / (words.length - 1 || 1);
    
    // Wave effect: words appear in a cascading wave pattern
    // Use a sine wave to create the cascade effect
    const waveOffset = Math.sin(normalizedIndex * Math.PI) * 0.15;
    
    // Calculate when this word should start appearing (based on its position)
    const wordStartProgress = normalizedIndex * 0.8; // Start showing words earlier
    const wordEndProgress = normalizedIndex * 0.8 + 0.3; // Each word takes 0.3 of progress to fully appear
    
    // Adjust with wave offset for cascade effect
    const adjustedStart = wordStartProgress + waveOffset;
    const adjustedEnd = wordEndProgress + waveOffset;
    
    // If wave has passed this word's end point, it's fully visible
    if (waveProgress >= adjustedEnd) {
      return 1;
    }
    
    // If wave is in this word's range, calculate partial visibility
    if (waveProgress >= adjustedStart) {
      const progressInRange = (waveProgress - adjustedStart) / (adjustedEnd - adjustedStart);
      return Math.min(1, Math.max(0, progressInRange));
    }
    
    // If wave hasn't reached this word yet, it's not visible
    return 0;
  };

  return (
    <div className="h-full w-full flex items-center justify-center relative overflow-hidden">
      {/* Romantic gradient background */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{
          background: [
            "radial-gradient(circle at 30% 50%, rgba(255, 182, 193, 0.2) 0%, transparent 60%), radial-gradient(circle at 70% 50%, rgba(255, 192, 203, 0.15) 0%, transparent 60%)",
            "radial-gradient(circle at 50% 30%, rgba(255, 182, 193, 0.25) 0%, transparent 60%), radial-gradient(circle at 50% 70%, rgba(255, 192, 203, 0.2) 0%, transparent 60%)",
            "radial-gradient(circle at 30% 50%, rgba(255, 182, 193, 0.2) 0%, transparent 60%), radial-gradient(circle at 70% 50%, rgba(255, 192, 203, 0.15) 0%, transparent 60%)",
          ],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Cascading wave effect overlay */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(
            to bottom,
            transparent 0%,
            rgba(255, 182, 193, 0.1) ${waveProgress * 50}%,
            rgba(255, 192, 203, 0.15) ${waveProgress * 70}%,
            transparent 100%
          )`,
        }}
      />

      {/* Main text with wave cascade effect */}
      <div className="text-center px-8 max-w-4xl relative z-10">
        <div className="flex flex-wrap justify-center gap-x-3 gap-y-4">
          {words.map((word, index) => {
            const visibility = getWordVisibility(index);
            const isVisible = visibility > 0;
            
            return (
              <motion.span
                key={`${word}-${index}`}
                initial={{ opacity: 0, y: 30, scale: 0.8 }}
                animate={{ 
                  opacity: visibility,
                  y: isVisible ? 0 : 30,
                  scale: isVisible ? 1 : 0.8,
                  filter: isVisible ? "blur(0px)" : "blur(8px)",
                }}
                transition={{ 
                  duration: 0.6,
                  ease: "easeOut"
                }}
                className="inline-block text-3xl md:text-5xl font-serif text-white relative"
                style={{ 
                  fontFamily: "'Georgia', 'Palatino Linotype', 'Book Antiqua', Palatino, 'Times New Roman', serif",
                  textShadow: `
                    0 2px 20px rgba(255, 182, 193, ${0.5 * visibility}),
                    0 0 30px rgba(255, 192, 203, ${0.4 * visibility}),
                    0 0 40px rgba(255, 182, 193, ${0.2 * visibility})
                  `,
                }}
              >
                {word}
                {/* Wave ripple effect on each word */}
                {isVisible && (
                  <motion.span
                    className="absolute inset-0 rounded-full pointer-events-none"
                    style={{
                      background: 'radial-gradient(circle, rgba(255, 182, 193, 0.4) 0%, transparent 70%)',
                      filter: 'blur(10px)',
                    }}
                    initial={{ scale: 0, opacity: 0.8 }}
                    animate={{ 
                      scale: [0, 2, 3],
                      opacity: [0.8, 0.4, 0],
                    }}
                    transition={{
                      duration: 1.5,
                      ease: "easeOut",
                    }}
                  />
                )}
              </motion.span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
