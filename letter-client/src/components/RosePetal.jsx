// RosePetal.jsx - Individual rose petal component
import React from "react";
import { motion } from "framer-motion";

export default function RosePetal({ 
  x, 
  y, 
  delay = 0,
  size = "medium",
  rotation = 0
}) {
  const sizes = {
    small: { width: 12, height: 12 },
    medium: { width: 16, height: 16 },
    large: { width: 20, height: 20 },
  };
  
  const { width, height } = sizes[size] || sizes.medium;
  const initialRotation = rotation || Math.random() * 360;
  
  return (
    <motion.div
      initial={{ 
        opacity: 0, 
        scale: 0,
        x: x,
        y: y,
        rotate: initialRotation,
      }}
      animate={{ 
        opacity: [0, 1, 1, 0],
        scale: [0, 1, 1, 0],
        y: y + 150 + Math.random() * 100,
        x: x + (Math.random() - 0.5) * 80,
        rotate: initialRotation + 360 + Math.random() * 180,
      }}
      transition={{ 
        duration: 4 + Math.random() * 2,
        delay: delay,
        ease: "easeInOut",
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
          filter: 'drop-shadow(0 2px 4px rgba(255, 182, 193, 0.6))',
        }}
      >
        <path 
          d="M12 2C8 2 5 5 5 9c0 4 3 7 7 7s7-3 7-7c0-4-3-7-7-7zm0 2c3 0 5 2 5 5s-2 5-5 5-5-2-5-5 2-5 5-5z" 
          fill="rgba(255, 182, 193, 0.9)"
        />
        <path 
          d="M12 4c-2 0-3.5 1.5-3.5 3.5S10 11 12 11s3.5-1.5 3.5-3.5S14 4 12 4z" 
          fill="rgba(255, 192, 203, 0.8)"
        />
      </svg>
    </motion.div>
  );
}
