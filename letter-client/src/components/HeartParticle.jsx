// HeartParticle.jsx - Individual heart particle component
import React from "react";
import { motion } from "framer-motion";

export default function HeartParticle({ 
  x, 
  y, 
  delay = 0,
  size = "small"
}) {
  const sizes = {
    small: { width: 8, height: 8 },
    medium: { width: 12, height: 12 },
    large: { width: 16, height: 16 },
  };
  
  const { width, height } = sizes[size] || sizes.small;
  
  return (
    <motion.div
      initial={{ 
        opacity: 0, 
        scale: 0,
        x: x,
        y: y,
      }}
      animate={{ 
        opacity: [0, 1, 1, 0],
        scale: [0, 1, 1, 0],
        y: y - 100,
        x: x + (Math.random() - 0.5) * 50,
      }}
      transition={{ 
        duration: 2 + Math.random(),
        delay: delay,
        ease: "easeOut",
      }}
      className="absolute pointer-events-none"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: `${width}px`,
        height: `${height}px`,
      }}
    >
      <svg 
        viewBox="0 0 24 24" 
        fill="currentColor"
        className="w-full h-full"
        style={{
          filter: 'drop-shadow(0 0 4px rgba(255, 182, 193, 0.8))',
        }}
      >
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" 
          fill="rgba(255, 182, 193, 0.9)"
        />
      </svg>
    </motion.div>
  );
}

