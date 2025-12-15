// InkWritingEffect.jsx - Text appears as if being written with ink, with brush stroke effects
import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function InkWritingEffect({ 
  text,
  className = "",
  style = {}
}) {
  const [displayedText, setDisplayedText] = useState("");
  const [isWriting, setIsWriting] = useState(false);
  const [inkSplashes, setInkSplashes] = useState([]);
  const containerRef = useRef(null);
  
  useEffect(() => {
    if (!text) return;
    
    setDisplayedText("");
    setIsWriting(true);
    let currentIndex = 0;
    let isMounted = true;
    
    const writeInterval = setInterval(() => {
      if (currentIndex < text.length && isMounted) {
        setDisplayedText(text.slice(0, currentIndex + 1));
        currentIndex++;
        
        // Occasionally add ink splash effect
        if (Math.random() > 0.95 && currentIndex % 10 === 0) {
          const splash = {
            id: Date.now() + Math.random(),
            x: Math.random() * 100,
            y: Math.random() * 100,
          };
          setInkSplashes(prev => [...prev.slice(-2), splash]);
          setTimeout(() => {
            setInkSplashes(prev => prev.filter(s => s.id !== splash.id));
          }, 1000);
        }
      } else {
        clearInterval(writeInterval);
        setIsWriting(false);
      }
    }, 40); // Writing speed
    
    return () => {
      isMounted = false;
      clearInterval(writeInterval);
    };
  }, [text]);
  
  const textColor = style.color || '#2c1810';
  
  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Ink splashes */}
      <AnimatePresence>
        {inkSplashes.map((splash) => (
          <motion.div
            key={splash.id}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.3 }}
            className="absolute pointer-events-none"
            style={{
              left: `${splash.x}%`,
              top: `${splash.y}%`,
              width: '8px',
              height: '8px',
              background: 'radial-gradient(circle, rgba(75, 0, 130, 0.6) 0%, transparent 70%)',
              borderRadius: '50%',
            }}
          />
        ))}
      </AnimatePresence>
      
      {/* Text with ink writing effect */}
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="relative"
        style={style}
      >
        {displayedText}
        {isWriting && (
          <motion.span
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 0.8, repeat: Infinity }}
            className="inline-block w-0.5 h-5 ml-1 align-middle"
            style={{ 
              backgroundColor: textColor,
              boxShadow: '0 0 4px rgba(75, 0, 130, 0.6)',
            }}
          />
        )}
      </motion.span>
    </div>
  );
}

