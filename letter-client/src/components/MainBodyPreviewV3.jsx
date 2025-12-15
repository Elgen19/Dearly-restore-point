// MainBodyPreviewV3.jsx - Enchanted love letter materializing from magic
import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import HeartParticle from "./HeartParticle";

export default function MainBodyPreviewV3({ 
  mainBody, 
  receiverName = "",
  autoLoop = true // Default to true for preview, false for actual viewing
}) {
  const [visibleParagraphs, setVisibleParagraphs] = useState(0);
  const [heartParticles, setHeartParticles] = useState([]);
  const [sparkles, setSparkles] = useState([]);
  const [sealBroken, setSealBroken] = useState(false);
  const [flapOpen, setFlapOpen] = useState(false);
  const [letterExtracted, setLetterExtracted] = useState(false);
  const containerRef = useRef(null);
  const particleIntervalRef = useRef(null);
  const sparkleIntervalRef = useRef(null);
  
  const paragraphs = useMemo(() => 
    mainBody 
      ? mainBody.split('\n').filter(p => p.trim().length > 0)
      : ["Your letter content will appear here..."],
    [mainBody]
  );
  
  // Copy exact pattern from EnvelopeOpening.jsx - slower and more romantic
  const breakSeal = () => {
    setSealBroken(true);
    setTimeout(() => {
      setFlapOpen(true);
    }, 2000); // Slower - 2 seconds for seal breaking effect
  };

  const extractLetter = useCallback(() => {
    if (flapOpen && !letterExtracted) {
      setLetterExtracted(true);
      setTimeout(() => {
        // Start showing paragraphs after letter is extracted
        let currentIndex = 0;
        const showParagraph = () => {
          if (currentIndex < paragraphs.length) {
            setVisibleParagraphs(currentIndex + 1);
            
            // Add heart particles when paragraph appears
            const newParticles = Array.from({ length: 5 }, (_, i) => ({
              id: Date.now() + i + Math.random(),
              x: 20 + Math.random() * 60,
              y: 20 + currentIndex * 10 + Math.random() * 8,
              delay: i * 0.3,
              size: ['small', 'medium', 'large'][Math.floor(Math.random() * 3)],
            }));
            setHeartParticles(prev => [...prev, ...newParticles]);
            
            currentIndex++;
            setTimeout(showParagraph, 1500);
          } else {
            // After all paragraphs shown, only loop if autoLoop is true
            if (autoLoop) {
              setTimeout(() => {
                setVisibleParagraphs(0);
                setSealBroken(false);
                setFlapOpen(false);
                setLetterExtracted(false);
                // Auto-trigger again after a short delay
                setTimeout(() => {
                  breakSeal();
                }, 500);
              }, 3000);
            }
            // If autoLoop is false, just stop - don't loop
          }
        };
        setTimeout(showParagraph, 500);
      }, 1200); // Slower - more time to appreciate the letter extraction
    }
  }, [flapOpen, letterExtracted, paragraphs.length]);

  // Auto-extract letter after flap opens - slower and more dramatic
  useEffect(() => {
    if (flapOpen && !letterExtracted) {
      const timer = setTimeout(() => {
        extractLetter();
      }, 2000); // Slower - 2 seconds to appreciate the open envelope
      return () => clearTimeout(timer);
    }
  }, [flapOpen, letterExtracted, extractLetter]);

  // Auto-trigger seal breaking on mount (instead of click)
  useEffect(() => {
    setVisibleParagraphs(0);
    setSealBroken(false);
    setFlapOpen(false);
    setLetterExtracted(false);
    
    // Auto-start after 2 seconds (reduced from 5 seconds)
    const timer = setTimeout(() => {
      breakSeal();
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [mainBody]);
  
  // Continuous heart particles - much slower
  useEffect(() => {
    const addRandomHeart = () => {
      if (containerRef.current && visibleParagraphs > 0) {
        const heart = {
          id: Date.now() + Math.random(),
          x: Math.random() * 100,
          y: 100,
          delay: 0,
          size: ['small', 'medium'][Math.floor(Math.random() * 2)],
        };
        setHeartParticles(prev => [...prev.slice(-25), heart]);
      }
    };
    
    particleIntervalRef.current = setInterval(addRandomHeart, 5000); // Much slower - every 5 seconds
    
    return () => {
      if (particleIntervalRef.current) {
        clearInterval(particleIntervalRef.current);
      }
    };
  }, [visibleParagraphs]);
  
  // Sparkle effects - more frequent but slower
  useEffect(() => {
    const addSparkle = () => {
      if (containerRef.current && (flapOpen || letterExtracted)) {
        const sparkle = {
          id: Date.now() + Math.random(),
          x: Math.random() * 100,
          y: Math.random() * 100,
        };
        setSparkles(prev => [...prev.slice(-40), sparkle]);
      }
    };
    
    sparkleIntervalRef.current = setInterval(addSparkle, 1200); // Every 1.2 seconds
    
    return () => {
      if (sparkleIntervalRef.current) {
        clearInterval(sparkleIntervalRef.current);
      }
    };
  }, [flapOpen, letterExtracted]);
  
  // Clean up old particles and sparkles
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      setHeartParticles(prev => prev.filter(p => {
        const age = Date.now() - p.id;
        return age < 8000;
      }));
      setSparkles(prev => prev.filter(s => {
        const age = Date.now() - s.id;
        return age < 4000;
      }));
    }, 1000);
    
    return () => clearInterval(cleanupInterval);
  }, []);
  
  const letterWidth = Math.min(700, window.innerWidth * 0.85);
  const letterHeight = Math.min(500, window.innerHeight * 0.7);
  
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
      
      {/* Sparkle effects */}
      <AnimatePresence>
        {sparkles.map((sparkle) => (
          <motion.div
            key={sparkle.id}
            className="absolute w-3 h-3 rounded-full pointer-events-none"
            style={{
              left: `${sparkle.x}%`,
              top: `${sparkle.y}%`,
              background: 'radial-gradient(circle, rgba(255, 255, 255, 1) 0%, rgba(255, 182, 193, 0.8) 40%, transparent 100%)',
              boxShadow: '0 0 12px rgba(255, 182, 193, 1), 0 0 24px rgba(255, 192, 203, 0.8)',
            }}
            initial={{ opacity: 0, scale: 0, rotate: 0 }}
            animate={{ 
              opacity: [0, 1, 1, 0],
              scale: [0, 1.8, 1, 0],
              rotate: 360,
            }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ 
              duration: 3,
              ease: "easeInOut",
            }}
          />
        ))}
      </AnimatePresence>
      
      {/* Romantic glow background - much slower */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{
          background: [
            "radial-gradient(circle at 30% 40%, rgba(255, 182, 193, 0.25) 0%, transparent 50%), radial-gradient(circle at 70% 60%, rgba(255, 192, 203, 0.2) 0%, transparent 50%)",
            "radial-gradient(circle at 60% 50%, rgba(255, 182, 193, 0.3) 0%, transparent 50%), radial-gradient(circle at 40% 70%, rgba(255, 192, 203, 0.25) 0%, transparent 50%)",
            "radial-gradient(circle at 30% 40%, rgba(255, 182, 193, 0.25) 0%, transparent 50%), radial-gradient(circle at 70% 60%, rgba(255, 192, 203, 0.2) 0%, transparent 50%)",
          ],
        }}
        transition={{
          duration: 12, // Much slower - 12 seconds
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      {/* Magic particles floating around */}
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full pointer-events-none"
          style={{
            left: `${20 + (i * 5)}%`,
            top: `${30 + (i * 3)}%`,
            background: 'radial-gradient(circle, rgba(255, 182, 193, 0.8) 0%, transparent 70%)',
            boxShadow: '0 0 8px rgba(255, 182, 193, 0.6)',
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.sin(i) * 20, 0],
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{
            duration: 4 + i * 0.3,
            repeat: Infinity,
            delay: i * 0.2,
            ease: "easeInOut",
          }}
        />
      ))}
      
      {/* Envelope Container - Copy exact structure from EnvelopeOpening.jsx */}
      {!letterExtracted && (
        <motion.div
          key="envelope"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative mx-auto"
          style={{ perspective: "1200px", perspectiveOrigin: "center center" }}
        >
          <div className="relative w-[90vw] max-w-[700px] h-[200px] md:h-[400px] mx-auto" style={{ perspective: "1500px" }}>
            {/* Letter is completely hidden inside envelope - not visible until extracted */}

            {/* Envelope Body - Cream color */}
            <div className="absolute bottom-0 w-full h-[70%]" style={{ zIndex: 10 }}>
              {/* Solid background layer - ensures opacity */}
              <div className="absolute bottom-0 w-full h-full bg-gradient-to-b from-stone-50 via-stone-50 to-stone-50" />
              
              {/* Main envelope body - Cream background */}
              <div 
                className="absolute bottom-0 w-full h-full shadow-lg"
                style={{
                  backgroundImage: `
                    url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9InRleHR1cmUiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgxODUsIDEzNywgMTEsIDAuMDUpIiBzdHJva2Utd2lkdGg9IjAuNSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCN0ZXh0dXJlKSIvPjwvc3ZnPg==')
                  `,
                  backgroundColor: "rgb(255, 253, 250)", // Cream color
                }}
              >
                {/* Subtle inner shadow */}
                <div className="absolute inset-0 bg-gradient-to-b from-stone-200/20 via-transparent to-transparent" />
                {/* Subtle top edge for gentle separation */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-b from-stone-300/30 to-transparent" />
                
                {/* Decorative corner elements - More visible */}
                <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-stone-500/70" />
                <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-stone-500/70" />
                <div className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-stone-500/70" />
                <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-stone-500/70" />
                
                {/* Clear decorative border pattern - More visible */}
                <div className="absolute inset-0 border-2 border-stone-500/60" />
              </div>
            </div>

            {/* Envelope Flap - Smaller and rounder */}
            <motion.div
              className="absolute left-0 w-full h-[50%]"
              style={{
                top: "calc(100% - 70%)",
                transformStyle: "preserve-3d",
                transformOrigin: "top center",
                zIndex: 30,
              }}
              animate={{
                rotateX: flapOpen ? 120 : 0,
                zIndex: flapOpen ? 5 : 30,
              }}
              transition={{
                duration: 2.5, // Slower and more romantic - 2.5 seconds
                ease: [0.25, 0.1, 0.25, 1],
              }}
            >
              {/* Flap outer side - Rounded triangular shape with blending color */}
              <div
                className="absolute inset-0 shadow-2xl"
                style={{
                  clipPath: "polygon(0% 0%, 100% 0%, 98% 2%, 52% 98%, 50% 100%, 48% 98%, 2% 2%)",
                  backfaceVisibility: "hidden",
                  backgroundColor: "rgb(253, 251, 247)", // Slightly cooler ivory tone that blends with body
                  background: "linear-gradient(to bottom, rgb(254, 252, 248) 0%, rgb(253, 251, 247) 50%, rgb(252, 250, 246) 100%)", // Subtle gradient for depth
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2), inset 0 1px 2px rgba(255, 255, 255, 0.3)",
                }}
              >
                {/* Subtle top edge highlight for gentle separation */}
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-b from-stone-200/20 to-transparent" />
                {/* Subtle bottom point shadow for triangle definition */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-6 bg-black/10 blur-sm" />
                
                {/* Decorative corner elements on flap - More visible */}
                <div className="absolute top-2 left-2 w-3 h-3 border-l-2 border-t-2 border-stone-500/60" />
                <div className="absolute top-2 right-2 w-3 h-3 border-r-2 border-t-2 border-stone-500/60" />
                
                {/* Subtle decorative pattern on flap - More visible */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-0.5 bg-stone-500/40" />
                <div className="absolute top-8 left-1/2 -translate-x-1/2 w-16 h-0.5 bg-stone-500/35" />
              </div>

              {/* Flap inner side (visible when open) */}
              <div
                className="absolute inset-0 bg-gradient-to-b from-stone-50 to-stone-100"
                style={{
                  clipPath: "polygon(0% 0%, 100% 0%, 98% 2%, 52% 98%, 50% 100%, 48% 98%, 2% 2%)",
                  backfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-stone-100/30 to-transparent" />
              </div>
            </motion.div>

            {/* Wax Seal - Realistic smudged appearance with glow */}
            <AnimatePresence>
              {!sealBroken && (
            <motion.div
              initial={{ scale: 1, rotate: 0 }}
              animate={{
                scale: sealBroken ? [1, 1.3, 1.5, 0] : 1,
                rotate: sealBroken ? [0, 20, -20, 30, 0] : 0,
                opacity: sealBroken ? [1, 1, 0.8, 0] : 1,
              }}
              transition={{ duration: 2, ease: "easeInOut" }}
                  className="absolute left-1/2 -translate-x-1/2 z-30"
                  style={{ bottom: "17%" }}
                >
                  {/* Enhanced glowing aura around seal */}
                  <motion.div
                    className="absolute inset-0 -z-10"
                    animate={{
                      scale: [1, 1.4, 1],
                      opacity: [0.8, 1, 0.8],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <div className="absolute inset-0 bg-red-600/60 rounded-full blur-lg" />
                    <div className="absolute inset-0 bg-red-500/50 rounded-full blur-xl" />
                    <div className="absolute inset-0 bg-red-400/40 rounded-full blur-2xl" />
                  </motion.div>

                  {/* Seal Base - Smudged, not perfectly circular */}
                  <motion.div
                    className="relative w-14 h-14"
                  >
                    {/* Main seal body - irregular shape */}
                    <div 
                      className="absolute inset-0 bg-gradient-to-br from-red-700 via-red-800 to-red-900 shadow-2xl border-[3px] border-red-950/50"
                      style={{
                        borderRadius: "45% 55% 52% 48% / 48% 52% 48% 52%",
                        clipPath: "polygon(10% 0%, 90% 0%, 100% 20%, 95% 50%, 100% 80%, 90% 100%, 10% 100%, 0% 80%, 5% 50%, 0% 20%)",
                      }}
                    >
                      {/* Seal texture and smudges */}
                      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-red-900/40 to-red-950/60" 
                        style={{
                          borderRadius: "45% 55% 52% 48% / 48% 52% 48% 52%",
                        }}
                      />
                      {/* Smudge marks */}
                      <div className="absolute top-2 left-3 w-2 h-2 bg-red-950/30 rounded-full blur-sm" />
                      <div className="absolute bottom-3 right-2 w-1.5 h-3 bg-red-950/40 rounded-full blur-sm rotate-12" />
                      <div className="absolute top-1/2 right-1 w-1.5 h-1.5 bg-red-950/30 rounded-full blur-sm" />
                      
                      {/* Text only */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-white text-[7px] font-serif leading-tight text-center drop-shadow-md">
                          Always and Forever
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Seal Fragments (when broken) */}
            <AnimatePresence>
              {sealBroken && (
                <>
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={`fragment-${i}`}
                      className="absolute left-1/2 w-4 h-4 bg-red-800 rounded-full z-30 shadow-lg"
                      style={{ bottom: "17%" }}
                      initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                      animate={{
                        x: (Math.random() - 0.5) * 120,
                        y: (Math.random() - 0.5) * 120,
                        opacity: 0,
                        scale: 0,
                      }}
                      transition={{
                        duration: 1,
                        delay: i * 0.1,
                        ease: "easeOut",
                      }}
                    />
                  ))}
                </>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

        {/* Letter - dramatic extraction animation */}
        {letterExtracted && (
          <motion.div
            key="letter"
            initial={{ opacity: 0, y: 200, scale: 0.8, rotateY: -15 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotateY: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{
              duration: 1.5,
              ease: [0.34, 1.56, 0.64, 1], // Dramatic ease-out-back effect
            }}
            className="relative mx-auto"
            style={{ 
              width: `${letterWidth}px`,
              maxWidth: '90vw',
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
              animate={{ 
                opacity: 1, 
                scale: 1, 
                filter: "blur(0px)",
                boxShadow: [
                  "0 20px 60px rgba(255, 182, 193, 0.4), 0 0 100px rgba(255, 192, 203, 0.3), 0 0 150px rgba(255, 182, 193, 0.2)",
                  "0 20px 60px rgba(255, 182, 193, 0.6), 0 0 100px rgba(255, 192, 203, 0.5), 0 0 150px rgba(255, 182, 193, 0.4)",
                ],
              }}
              transition={{
                duration: 1.2,
                delay: 0.3,
                ease: "easeOut",
              }}
              className="bg-gradient-to-b from-amber-50 via-white to-amber-50 shadow-2xl flex flex-col overflow-hidden relative"
              style={{
                width: '100%',
                minHeight: `${letterHeight + 100}px`,
                maxHeight: `${window.innerHeight * 0.7}px`,
                padding: '2.5rem',
                border: "2px solid rgba(255, 182, 193, 0.4)",
                borderRadius: "4px",
                filter: `brightness(1.05) drop-shadow(0 0 30px rgba(255, 182, 193, 0.6))`,
                overflow: 'hidden',
              }}
            >
            {/* Decorative border pattern */}
            <div 
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255, 182, 193, 0.1) 2px, rgba(255, 182, 193, 0.1) 4px),
                                  repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(255, 182, 193, 0.1) 2px, rgba(255, 182, 193, 0.1) 4px)`,
                backgroundSize: '20px 20px',
                opacity: 0.3,
              }}
            />
            
            {/* Corner decorative flourishes */}
            <div className="absolute top-0 left-0 w-16 h-16 pointer-events-none opacity-20">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <path d="M10,10 Q20,5 30,10 T50,10" stroke="rgba(255, 182, 193, 0.6)" strokeWidth="1.5" fill="none"/>
                <path d="M10,10 Q5,20 10,30 T10,50" stroke="rgba(255, 182, 193, 0.6)" strokeWidth="1.5" fill="none"/>
              </svg>
            </div>
            <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none opacity-20">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <path d="M90,10 Q80,5 70,10 T50,10" stroke="rgba(255, 182, 193, 0.6)" strokeWidth="1.5" fill="none"/>
                <path d="M90,10 Q95,20 90,30 T90,50" stroke="rgba(255, 182, 193, 0.6)" strokeWidth="1.5" fill="none"/>
              </svg>
            </div>
            <div className="absolute bottom-0 left-0 w-16 h-16 pointer-events-none opacity-20">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <path d="M10,90 Q20,95 30,90 T50,90" stroke="rgba(255, 182, 193, 0.6)" strokeWidth="1.5" fill="none"/>
                <path d="M10,90 Q5,80 10,70 T10,50" stroke="rgba(255, 182, 193, 0.6)" strokeWidth="1.5" fill="none"/>
              </svg>
            </div>
            <div className="absolute bottom-0 right-0 w-16 h-16 pointer-events-none opacity-20">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <path d="M90,90 Q80,95 70,90 T50,90" stroke="rgba(255, 182, 193, 0.6)" strokeWidth="1.5" fill="none"/>
                <path d="M90,90 Q95,80 90,70 T90,50" stroke="rgba(255, 182, 193, 0.6)" strokeWidth="1.5" fill="none"/>
              </svg>
            </div>
            
            {/* Paper texture */}
            <div 
              className="absolute inset-0 pointer-events-none opacity-5"
              style={{
                backgroundImage: `url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9InRleHR1cmUiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgxODUsIDEzNywgMTExLCAwLjEpIiBzdHJva2Utd2lkdGg9IjAuNSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCN0ZXh0dXJlKSIvPjwvc3ZnPg==')`,
                mixBlendMode: "multiply",
              }}
            />
            
            {/* Subtle floral pattern overlay */}
            <div 
              className="absolute inset-0 pointer-events-none opacity-[0.03]"
              style={{
                backgroundImage: `radial-gradient(circle at 20% 30%, rgba(255, 182, 193, 0.3) 1px, transparent 1px),
                                  radial-gradient(circle at 80% 70%, rgba(255, 192, 203, 0.3) 1px, transparent 1px)`,
                backgroundSize: '60px 60px, 80px 80px',
              }}
            />
            
            {/* Decorative corner hearts - appear when letter is fully out */}
            {letterExtracted && (
            <>
              <motion.div
                initial={{ opacity: 0, scale: 0, rotate: -180 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ delay: 0.8, duration: 0.8, type: "spring" }}
                className="absolute top-4 right-4"
                style={{
                  filter: 'drop-shadow(0 0 8px rgba(255, 182, 193, 0.8))',
                }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="rgba(255, 182, 193, 0.9)">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0, rotate: 180 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ delay: 1, duration: 0.8, type: "spring" }}
                className="absolute bottom-4 left-4"
                style={{
                  filter: 'drop-shadow(0 0 8px rgba(255, 182, 193, 0.8))',
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="rgba(255, 182, 193, 0.9)">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </motion.div>
            </>
          )}
          
          {/* Letter content - only when extracted */}
          {letterExtracted && (
            <div className="relative z-10 flex-1 overflow-y-auto" style={{
              scrollbarWidth: "thin",
              scrollbarColor: "rgba(255, 182, 193, 0.3) rgba(254, 243, 199, 0.2)",
            }}>
              <div className="space-y-6">
                <AnimatePresence mode="popLayout">
                  {paragraphs.slice(0, visibleParagraphs).map((paragraph, index) => {
                    const isGreeting = index === 0 && paragraph.trim().toLowerCase().startsWith('dear');
                    return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 40, scale: 0.95, filter: "blur(8px)" }}
                      animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                      exit={{ opacity: 0 }}
                      transition={{ 
                        duration: 2, // Much slower - 2 seconds
                        ease: "easeOut",
                        delay: isGreeting ? index * 0.25 + 1.5 : index * 0.25 // Dramatic pause for greeting
                      }}
                      className="relative"
                    >
                      {/* Glowing text effect - slower animation */}
                      {/* Use Dearly-like font (Playfair Display) for envelope animation */}
                      <motion.p
                        className={isGreeting ? "text-3xl md:text-4xl leading-relaxed relative mb-8" : "text-lg md:text-xl leading-relaxed relative"}
                        style={{ 
                          fontFamily: isGreeting 
                            ? "'Playfair Display', 'Cormorant Garamond', 'Libre Baskerville', 'Lora', 'Merriweather', serif"
                            : "'Playfair Display', 'Cormorant Garamond', 'EB Garamond', 'Lora', 'Merriweather', serif",
                          color: '#2c1810',
                          textShadow: `
                            0 1px 2px rgba(255, 255, 255, 0.1),
                            0 0 10px rgba(255, 182, 193, 0.4)
                          `,
                          letterSpacing: isGreeting ? '0.05em' : 'normal',
                          fontWeight: isGreeting ? 500 : 'normal',
                        }}
                        animate={{
                          textShadow: [
                            `0 1px 2px rgba(255, 255, 255, 0.1), 0 0 10px rgba(255, 182, 193, 0.4)`,
                            `0 1px 2px rgba(255, 255, 255, 0.1), 0 0 16px rgba(255, 182, 193, 0.6)`,
                            `0 1px 2px rgba(255, 255, 255, 0.1), 0 0 10px rgba(255, 182, 193, 0.4)`,
                          ],
                        }}
                        transition={{
                          duration: 6, // Much slower - 6 seconds
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      >
                        {paragraph}
                      </motion.p>
                      
                      {/* Decorative underline for greeting */}
                      {isGreeting && (
                        <motion.div
                          initial={{ width: 0, opacity: 0 }}
                          animate={{ width: "100%", opacity: 1 }}
                          transition={{ delay: index * 0.25 + 1.5 + 0.5, duration: 0.8, ease: "easeOut" }}
                          className="h-0.5 bg-gradient-to-r from-transparent via-pink-300/50 to-transparent mt-2"
                        />
                      )}
                    
                    {/* Decorative heart accent with rotation - only for non-greeting paragraphs */}
                    {!isGreeting && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0, rotate: -180 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        transition={{ delay: index * 0.25 + 1, duration: 1, type: "spring" }}
                        className="absolute -left-10 top-2"
                        style={{
                          filter: 'drop-shadow(0 0 8px rgba(255, 182, 193, 0.8))',
                        }}
                      >
                        <svg 
                          width="28" 
                          height="28" 
                          viewBox="0 0 24 24" 
                          fill="rgba(255, 182, 193, 0.9)"
                        >
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                        </svg>
                      </motion.div>
                    )}
                  </motion.div>
                  );
                  })}
              </AnimatePresence>
              </div>
            </div>
          )}
          </motion.div>
          </motion.div>
        )}
    </div>
  );
}
