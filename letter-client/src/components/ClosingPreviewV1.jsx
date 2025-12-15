// ClosingPreviewV1.jsx - Heart particles reveal with romantic glow
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import HeartParticle from "./HeartParticle";

export default function ClosingPreviewV1({ 
  closing, 
  receiverName = "" 
}) {
  const [visible, setVisible] = useState(false);
  const [heartParticles, setHeartParticles] = useState([]);
  const containerRef = useRef(null);
  const particleIntervalRef = useRef(null);

  useEffect(() => {
    // Start animation after mount
    const timer = setTimeout(() => {
      setVisible(true);
    }, 500);

    // Generate heart particles
    const addHeartParticle = () => {
      if (containerRef.current && visible) {
        const heart = {
          id: Date.now() + Math.random(),
          x: Math.random() * 100,
          y: 100,
          delay: 0,
          size: ['small', 'medium', 'large'][Math.floor(Math.random() * 3)],
        };
        setHeartParticles(prev => [...prev.slice(-30), heart]);
      }
    };

    if (visible) {
      particleIntervalRef.current = setInterval(addHeartParticle, 800);
    }

    return () => {
      clearTimeout(timer);
      if (particleIntervalRef.current) {
        clearInterval(particleIntervalRef.current);
      }
    };
  }, [visible]);

  // Clean up old particles
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      setHeartParticles(prev => prev.filter(p => {
        const age = Date.now() - p.id;
        return age < 5000;
      }));
    }, 1000);

    return () => clearInterval(cleanupInterval);
  }, []);

  return (
    <div 
      ref={containerRef}
      className="h-full w-full flex items-center justify-center relative overflow-hidden"
    >
      {/* Heart particles */}
      <AnimatePresence>
        {heartParticles.map((particle) => (
          <HeartParticle
            key={particle.id}
            x={particle.x}
            y={particle.y}
            delay={particle.delay}
            size={particle.size}
          />
        ))}
      </AnimatePresence>

      {/* Romantic glow background */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{
          background: [
            "radial-gradient(circle at 30% 40%, rgba(255, 182, 193, 0.3) 0%, transparent 50%), radial-gradient(circle at 70% 60%, rgba(255, 192, 203, 0.25) 0%, transparent 50%)",
            "radial-gradient(circle at 60% 50%, rgba(255, 182, 193, 0.35) 0%, transparent 50%), radial-gradient(circle at 40% 70%, rgba(255, 192, 203, 0.3) 0%, transparent 50%)",
            "radial-gradient(circle at 30% 40%, rgba(255, 182, 193, 0.3) 0%, transparent 50%), radial-gradient(circle at 70% 60%, rgba(255, 192, 203, 0.25) 0%, transparent 50%)",
          ],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Main text */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: visible ? 1 : 0, scale: visible ? 1 : 0.8 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="text-center px-8 max-w-3xl relative z-10"
      >
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 20 }}
          transition={{ delay: 0.8, duration: 1 }}
          className="text-3xl md:text-5xl font-serif text-white leading-relaxed"
          style={{ 
            fontFamily: "'Georgia', 'Palatino Linotype', 'Book Antiqua', Palatino, 'Times New Roman', serif",
            textShadow: '0 2px 30px rgba(255, 182, 193, 0.6), 0 0 40px rgba(255, 192, 203, 0.4)',
          }}
        >
          {closing || "You will always be the love of my life"}
        </motion.p>
      </motion.div>
    </div>
  );
}

