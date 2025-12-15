// CinematicTitleOpener.jsx - Romantic cinematic opener for letter titles
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function CinematicTitleOpener({ title, onComplete, duration = 3000 }) {
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const [showText, setShowText] = useState(true);
  const [showFlashingLight, setShowFlashingLight] = useState(false);
  const [showEngulfingGlow, setShowEngulfingGlow] = useState(false);
  const [showGlow, setShowGlow] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  
  const fullTitle = title || "Untitled Letter";
  const baseTypingSpeed = 80; // Base milliseconds per character - increased for smoother feel

  useEffect(() => {
    let currentIndex = 0;
    let typingTimeout;
    let animationTimers = [];

    // Start typewriter effect with smooth, consistent timing
    const typeNextChar = () => {
      if (currentIndex < fullTitle.length) {
        const char = fullTitle[currentIndex];
        
        // Consistent timing based on character type for smooth, natural feel
        let delay = baseTypingSpeed;
        
        // Adjust timing based on character type for natural feel
        if (char === ' ') {
          delay = baseTypingSpeed * 0.3; // Faster for spaces
        } else if (/[.,!?;:]/.test(char)) {
          delay = baseTypingSpeed * 2.0; // Slower for punctuation - gives pause effect
        } else if (/[A-Z]/.test(char)) {
          delay = baseTypingSpeed * 1.15; // Slightly slower for capitals
        }
        
        // Use consistent delay for smooth animation - no randomness
        const smoothDelay = Math.max(40, delay); // Minimum 40ms for smoothness
        
        setDisplayedText(fullTitle.substring(0, currentIndex + 1));
        currentIndex++;
        
        typingTimeout = setTimeout(typeNextChar, smoothDelay);
      } else {
        // Typing complete - set state immediately
        setIsTyping(false);
        
        // Phase 1: Pause after typing completes to let user read the words (2 seconds)
        const pauseAfterTyping = 2000;
        
        // Phase 2: Fade out the text smoothly (300ms for quick but smooth transition)
        const textFadeOutDuration = 300;
        animationTimers.push(
          setTimeout(() => {
            setShowText(false);
          }, pauseAfterTyping)
        );
        
        // Phase 3: Show flashing light after text starts fading (starts 150ms into fade for smooth overlap)
        const flashingLightDelay = pauseAfterTyping + textFadeOutDuration * 0.5; // Start halfway through fade
        const flashingLightDuration = 700; // Reduced to keep total brief
        animationTimers.push(
          setTimeout(() => {
            setShowFlashingLight(true);
          }, flashingLightDelay)
        );
        
        // Phase 4: Show engulfing glow that grows and covers everything (starts after flashing light)
        const engulfingGlowDelay = flashingLightDelay + flashingLightDuration - 100; // Start 100ms before flash ends
        const engulfingGlowDuration = 1000; // Time for glow to grow and engulf
        animationTimers.push(
          setTimeout(() => {
            setShowFlashingLight(false);
            setShowEngulfingGlow(true);
          }, engulfingGlowDelay)
        );
        
        // Phase 5: Transition to glow after engulfing glow has fully engulfed (starts near end of engulf)
        const glowTransitionDelay = engulfingGlowDelay + engulfingGlowDuration - 200; // Start 200ms before engulf completes
        animationTimers.push(
          setTimeout(() => {
            setShowGlow(true);
          }, glowTransitionDelay)
        );
        
        // Hide engulfing glow after glow has started for smooth blend
        animationTimers.push(
          setTimeout(() => {
            setShowEngulfingGlow(false);
          }, glowTransitionDelay + 300)
        );
        
        // Phase 6: Hold the glow briefly before starting flash effect (700ms after glow starts)
        const glowHoldDuration = 700;
        animationTimers.push(
          setTimeout(() => {
            setIsFadingOut(true);
          }, glowTransitionDelay + glowHoldDuration)
        );
        
        // Phase 7: Complete and transition after flash effect finishes (700ms after fade starts)
        const flashDuration = 700;
        animationTimers.push(
          setTimeout(() => {
            setIsComplete(true);
            if (onComplete) {
              onComplete();
            }
          }, glowTransitionDelay + glowHoldDuration + flashDuration)
        );
      }
    };

    // Start typing after a short delay
    const startTimer = setTimeout(() => {
      typeNextChar();
    }, 400);

    return () => {
      clearTimeout(startTimer);
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
      // Clear all animation timers
      animationTimers.forEach(timer => clearTimeout(timer));
    };
  }, [fullTitle, onComplete, baseTypingSpeed]);

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center overflow-hidden">
      {/* Romantic Background Gradient */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1 }}
        style={{
          background: 'radial-gradient(ellipse at center, rgba(255, 182, 193, 0.4) 0%, rgba(255, 192, 203, 0.3) 50%, rgba(255, 228, 225, 0.5) 100%)',
        }}
      />

      {/* Animated Golden Light */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: [
            'radial-gradient(ellipse at 50% 30%, rgba(255, 215, 0, 0.3) 0%, transparent 60%)',
            'radial-gradient(ellipse at 60% 50%, rgba(255, 215, 0, 0.4) 0%, transparent 60%)',
            'radial-gradient(ellipse at 50% 70%, rgba(255, 215, 0, 0.3) 0%, transparent 60%)',
            'radial-gradient(ellipse at 50% 30%, rgba(255, 215, 0, 0.3) 0%, transparent 60%)',
          ],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Falling Rose Petals */}
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={`petal-${i}`}
          className="absolute pointer-events-none text-rose-300/50"
          style={{
            left: `${Math.random() * 100}%`,
            fontSize: `${10 + Math.random() * 12}px`,
          }}
          initial={{ y: -50, opacity: 0, rotate: 0 }}
          animate={{
            y: [0, 600],
            opacity: [0, 0.7, 0.7, 0],
            rotate: [0, 180, 360, 540],
            x: [0, Math.random() * 40 - 20],
          }}
          transition={{
            duration: 5 + Math.random() * 3,
            repeat: Infinity,
            delay: Math.random() * 4,
            ease: "easeInOut",
          }}
        >
          🌹
        </motion.div>
      ))}

      {/* Sparkles/Stars */}
      {[...Array(30)].map((_, i) => {
        const size = Math.random() < 0.7 ? 2 : Math.random() < 0.9 ? 3 : 4;
        return (
          <motion.div
            key={`sparkle-${i}`}
            className="absolute bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${size}px`,
              height: `${size}px`,
              boxShadow: `0 0 ${size * 3}px rgba(255, 215, 0, 0.8)`,
            }}
            animate={{
              opacity: [0, 1, 0.3, 1, 0],
              scale: [0, 1.2, 0.8, 1.5, 0],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 3,
              ease: "easeInOut",
            }}
          />
        );
      })}

      {/* Main Content Container */}
      <div className="relative z-10 text-center px-8 max-w-3xl">
        {/* Letter Title with Typewriter Effect - Fades out after typing */}
        <AnimatePresence mode="wait">
          {showText && (
            <motion.h1
              key="title-text"
              className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold mb-4"
              initial={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={{ 
                opacity: 0, 
                scale: 0.92,
                filter: 'blur(8px)',
                transition: {
                  duration: 0.3,
                  ease: "easeInOut"
                }
              }}
              style={{
                textShadow: '0 4px 20px rgba(255, 182, 193, 0.4), 0 2px 10px rgba(255, 215, 0, 0.3)',
                background: 'linear-gradient(135deg, #8B4513 0%, #A0522D 25%, #CD853F 50%, #D2691E 75%, #8B4513 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                minHeight: '1.2em',
              }}
            >
              {displayedText}
              {isTyping && (
                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{ 
                    duration: 0.6, 
                    repeat: Infinity, 
                    repeatType: "reverse",
                    ease: "easeInOut"
                  }}
                  className="inline-block w-0.5 h-full bg-amber-600 ml-1"
                  style={{ height: '1em', verticalAlign: 'baseline' }}
                >
                  |
                </motion.span>
              )}
            </motion.h1>
          )}
        </AnimatePresence>

        {/* Flashing Light Effect - Appears after text fades out, transitions to engulfing glow */}
        <AnimatePresence>
          {showFlashingLight && (
            <motion.div
              key="flashing-light"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ 
                opacity: [0, 1, 0.4, 1, 0.6, 1, 0.3, 1, 0.5, 1, 0.2],
                scale: [0.5, 1.8, 1.2, 2.2, 1.5, 2.8, 1.8, 3.2, 2, 3.5, 3.8],
              }}
              exit={{ 
                opacity: 0,
                scale: 4,
                transition: {
                  duration: 0.4,
                  ease: "easeInOut",
                }
              }}
              transition={{
                duration: 0.7,
                times: [0, 0.1, 0.2, 0.35, 0.5, 0.65, 0.75, 0.85, 0.9, 0.95, 1],
                ease: "easeInOut",
              }}
              className="absolute inset-0 -z-10"
              style={{
                background: 'radial-gradient(ellipse at center, rgba(255, 255, 255, 1) 0%, rgba(255, 220, 0, 0.98) 8%, rgba(255, 200, 0, 0.85) 18%, rgba(255, 180, 0, 0.7) 32%, transparent 58%)',
                filter: 'blur(120px)',
              }}
            />
          )}
        </AnimatePresence>

        {/* Engulfing Glow - Grows from center and covers entire preview */}
        <AnimatePresence>
          {showEngulfingGlow && (
            <>
              {/* Main engulfing glow layer */}
              <motion.div
                key="engulfing-glow-main"
                initial={{ 
                  opacity: 0, 
                  scale: 0.2
                }}
                animate={{ 
                  opacity: [0, 0.4, 0.7, 0.9, 1, 1],
                  scale: [0.2, 0.5, 1, 1.8, 2.8, 4.5]
                }}
                exit={{ 
                  opacity: 0,
                  scale: 5,
                  transition: {
                    duration: 0.4,
                    ease: "easeOut",
                  }
                }}
                transition={{
                  duration: 1,
                  times: [0, 0.15, 0.35, 0.55, 0.75, 1],
                  ease: [0.4, 0, 0.2, 1],
                }}
                className="absolute inset-0 z-[60] flex items-center justify-center"
                style={{
                  background: 'radial-gradient(circle at center, rgba(255, 255, 255, 1) 0%, rgba(255, 240, 0, 0.98) 3%, rgba(255, 220, 0, 0.96) 8%, rgba(255, 200, 0, 0.92) 15%, rgba(255, 180, 0, 0.85) 25%, rgba(255, 160, 0, 0.7) 40%, rgba(255, 140, 0, 0.5) 60%, rgba(255, 120, 0, 0.3) 80%, transparent 100%)',
                  filter: 'blur(100px)',
                  pointerEvents: 'none',
                  transformOrigin: 'center center',
                }}
              />
              
              {/* Secondary overlay for more complete engulfment */}
              <motion.div
                key="engulfing-glow-overlay"
                initial={{ 
                  opacity: 0, 
                  scale: 0.3
                }}
                animate={{ 
                  opacity: [0, 0, 0.3, 0.6, 0.8, 0.9],
                  scale: [0.3, 0.6, 1.2, 2, 3, 4]
                }}
                exit={{ 
                  opacity: 0,
                  scale: 4.5,
                  transition: {
                    duration: 0.4,
                    ease: "easeOut",
                  }
                }}
                transition={{
                  duration: 1,
                  times: [0, 0.2, 0.4, 0.6, 0.8, 1],
                  ease: [0.3, 0, 0.1, 1],
                }}
                className="absolute inset-0 z-[60] flex items-center justify-center"
                style={{
                  background: 'radial-gradient(circle at center, rgba(255, 255, 255, 0.9) 0%, rgba(255, 215, 0, 0.85) 10%, rgba(255, 180, 0, 0.7) 25%, rgba(255, 150, 0, 0.5) 45%, rgba(255, 120, 0, 0.3) 70%, transparent 100%)',
                  filter: 'blur(120px)',
                  pointerEvents: 'none',
                  transformOrigin: 'center center',
                }}
              />
            </>
          )}
        </AnimatePresence>

        {/* Cinematic Flashing Glow Effect - Appears after flashing light */}
        <AnimatePresence>
          {showGlow && !isComplete && (
            <>
              {/* Main glowing yellow light - gentle pulse when first shown */}
              <motion.div
                key="main-glow"
                initial={{ opacity: 0.4, scale: 2.5 }}
                animate={{ 
                  opacity: isFadingOut ? [1, 0.4, 1, 0.6, 1, 0.3, 0] : [0.6, 0.9, 0.7, 1, 0.8],
                  scale: isFadingOut ? [1, 1.8, 1.2, 2.2, 1.5, 2.8, 3] : [0.8, 1.2, 1, 1.3, 1.1],
                }}
                exit={{ 
                  opacity: 0,
                  scale: 3.5,
                  transition: {
                    duration: 0.8,
                    ease: "easeOut",
                  }
                }}
                transition={
                  isFadingOut 
                    ? {
                        duration: 0.7,
                        ease: "easeInOut",
                      }
                    : {
                        duration: 1.2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }
                }
                className="absolute inset-0 -z-10"
                style={{
                  background: 'radial-gradient(ellipse at center, rgba(255, 215, 0, 0.95) 0%, rgba(255, 200, 0, 0.8) 15%, rgba(255, 180, 0, 0.5) 30%, transparent 60%)',
                  filter: 'blur(80px)',
                }}
              />
              
              {/* Secondary flash overlay for more dramatic effect - only during fade out */}
              {isFadingOut && (
                <motion.div
                  key="flash-overlay"
                  initial={{ opacity: 0 }}
                  animate={{ 
                    opacity: [0, 0.95, 0, 0.85, 0, 0.75, 0],
                  }}
                  exit={{ opacity: 0 }}
                  transition={{
                    duration: 0.7,
                    times: [0, 0.15, 0.3, 0.45, 0.6, 0.75, 1],
                    ease: "easeInOut",
                  }}
                  className="absolute inset-0 -z-10"
                  style={{
                    background: 'radial-gradient(ellipse at center, rgba(255, 255, 255, 0.95) 0%, rgba(255, 215, 0, 0.8) 20%, transparent 50%)',
                    filter: 'blur(100px)',
                  }}
                />
              )}
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

