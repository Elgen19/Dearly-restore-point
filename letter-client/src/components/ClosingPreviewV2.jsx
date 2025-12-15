// ClosingPreviewV2.jsx - Glowing text reveal with ethereal effect
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function ClosingPreviewV2({ 
  closing, 
  receiverName = "" 
}) {
  const [visible, setVisible] = useState(false);
  const [glowIntensity, setGlowIntensity] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (visible) {
      const interval = setInterval(() => {
        setGlowIntensity(prev => (prev + 0.1) % 1);
      }, 100);
      return () => clearInterval(interval);
    }
  }, [visible]);

  return (
    <div className="h-full w-full flex items-center justify-center relative overflow-hidden">
      {/* Ethereal background glow */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{
          background: [
            "radial-gradient(circle at center, rgba(255, 182, 193, 0.2) 0%, transparent 70%)",
            "radial-gradient(circle at center, rgba(255, 192, 203, 0.3) 0%, transparent 70%)",
            "radial-gradient(circle at center, rgba(255, 182, 193, 0.2) 0%, transparent 70%)",
          ],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Floating sparkles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full pointer-events-none"
          style={{
            left: `${20 + (i * 4)}%`,
            top: `${30 + (i * 2)}%`,
            background: 'rgba(255, 182, 193, 0.8)',
            boxShadow: '0 0 6px rgba(255, 182, 193, 0.8)',
          }}
          animate={{
            y: [0, -40, 0],
            x: [0, Math.sin(i) * 30, 0],
            opacity: [0.3, 1, 0.3],
            scale: [0.5, 1.5, 0.5],
          }}
          transition={{
            duration: 5 + i * 0.2,
            repeat: Infinity,
            delay: i * 0.1,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Main text with glowing effect */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: visible ? 1 : 0, scale: visible ? 1 : 0.9 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="text-center px-8 max-w-3xl relative z-10"
      >
        <motion.p
          initial={{ opacity: 0, filter: "blur(20px)" }}
          animate={{ 
            opacity: visible ? 1 : 0, 
            filter: visible ? "blur(0px)" : "blur(20px)",
          }}
          transition={{ delay: 0.8, duration: 1.2 }}
          className="text-3xl md:text-5xl font-serif text-white leading-relaxed"
          style={{ 
            fontFamily: "'Georgia', 'Palatino Linotype', 'Book Antiqua', Palatino, 'Times New Roman', serif",
            textShadow: `
              0 0 20px rgba(255, 182, 193, ${0.6 + glowIntensity * 0.4}),
              0 0 40px rgba(255, 192, 203, ${0.4 + glowIntensity * 0.3}),
              0 0 60px rgba(255, 182, 193, ${0.2 + glowIntensity * 0.2}),
              0 2px 10px rgba(0, 0, 0, 0.3)
            `,
          }}
        >
          {closing || "You will always be the love of my life"}
        </motion.p>
      </motion.div>
    </div>
  );
}

