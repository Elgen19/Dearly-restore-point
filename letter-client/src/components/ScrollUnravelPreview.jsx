// ScrollUnravelPreview.jsx - Reusable scroll unravelling animation component
import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CinematicTitleOpener from "./CinematicTitleOpener";

export default function ScrollUnravelPreview({ 
  letterContent, 
  userFirstName = "", 
  letterTitle = "",
  autoLoop = true,
  onClose,
  onOpenComplete,
  showTitleOpener: showTitleOpenerProp = true
}) {
  const scrollContainerRef = useRef(null);
  const scrollPaperRef = useRef(null);
  const scrollTopRollRef = useRef(null);
  const scrollBottomRollRef = useRef(null);
  const textRef = useRef(null);
  const backgroundRef = useRef(null);
  const [unravelProgress, setUnravelProgress] = useState(0);
  const [targetHeight, setTargetHeight] = useState(400);
  const [hasStarted, setHasStarted] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const [showTitleOpener, setShowTitleOpener] = useState(showTitleOpenerProp);
  
  // Update showTitleOpener when prop changes
  useEffect(() => {
    setShowTitleOpener(showTitleOpenerProp);
  }, [showTitleOpenerProp]);
  const animationIntervalRef = useRef(null);
  const animationTimeoutRef = useRef(null);
  const hasInitializedRef = useRef(false);

  // Animation function - opens the scroll
  const startUnravelAnimation = useCallback(() => {
    // Prevent multiple starts if already opening or if animation is in progress
    if (isOpening || animationIntervalRef.current || !hasInitializedRef.current) {
      return;
    }
    
    // Phase 1: Unravel (2 seconds) with glowing effect
    setIsOpening(true);
    const unravelDuration = 2000;
    const unravelSteps = 60;
    const unravelStepDuration = unravelDuration / unravelSteps;
    let localProgress = 0;
    
    if (animationIntervalRef.current) {
      clearInterval(animationIntervalRef.current);
    }
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
      animationTimeoutRef.current = null;
    }
    
    const unravelInterval = setInterval(() => {
      localProgress += 1 / unravelSteps;
      if (localProgress >= 1) {
        setUnravelProgress(1);
        setIsOpening(false);
        clearInterval(unravelInterval);
        animationIntervalRef.current = null;
        
        // Notify that opening is complete
        if (onOpenComplete) {
          onOpenComplete();
        }
        
        // Only auto-close if autoLoop is true
        if (autoLoop) {
          // Phase 2: Wait 8 seconds after fully opened, then close
          const timeoutId = setTimeout(() => {
            // Call handleCloseScroll directly - it's defined in the same scope
            handleCloseScroll();
          }, 8000);
          animationTimeoutRef.current = timeoutId;
        }
      } else {
        // Ease out cubic for smooth deceleration when opening
        const eased = 1 - Math.pow(1 - localProgress, 3);
        setUnravelProgress(eased);
      }
    }, unravelStepDuration);
    
    animationIntervalRef.current = unravelInterval;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoLoop, onOpenComplete]);

  // Handle closing the scroll
  const handleCloseScroll = useCallback(() => {
    // Prevent multiple calls if already animating
    if (animationIntervalRef.current || isClosing) {
      return;
    }
    
    setIsClosing(true);
    
    // Clear any existing timeouts
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
      animationTimeoutRef.current = null;
    }
    
    // Phase 3: Closing animation (2 seconds)
    const closeDuration = 2000;
    const closeSteps = 60;
    const closeStepDuration = closeDuration / closeSteps;
    let closeProgress = 0;
    
    const closeInterval = setInterval(() => {
      closeProgress += 1 / closeSteps;
      if (closeProgress >= 1) {
        setUnravelProgress(0);
        setIsClosing(false);
        clearInterval(closeInterval);
        animationIntervalRef.current = null;
        
        // Notify parent that scroll is closed
        if (onClose) {
          onClose();
        }
        
        // Only reopen if autoLoop is true
        if (autoLoop) {
          // Phase 4: Wait 3 seconds before reopening
          const timeoutId = setTimeout(() => {
            startUnravelAnimation();
          }, 3000);
          animationTimeoutRef.current = timeoutId;
        }
      } else {
        // Ease in cubic for smooth acceleration when closing
        const eased = Math.pow(closeProgress, 3);
        setUnravelProgress(1 - eased);
      }
    }, closeStepDuration);
    
    animationIntervalRef.current = closeInterval;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoLoop, onClose, isClosing]);

  useEffect(() => {
    // Don't start scroll animation until title opener is complete (if enabled)
    if (showTitleOpenerProp && showTitleOpener) return;
    
    // Don't start if already initialized, opening, or animation is in progress
    if (hasInitializedRef.current || isOpening || animationIntervalRef.current) return;
    
    let cleanupFunctions = [];
    let mounted = true;
    
    // Wait for refs to be ready and container to have height
    const initializeAnimation = () => {
      if (!mounted || hasInitializedRef.current) return false;
      
      if (!scrollPaperRef.current || !textRef.current || !scrollTopRollRef.current || !scrollBottomRollRef.current || !scrollContainerRef.current) {
        return false;
      }

      // Check if container has height
      const containerHeight = scrollContainerRef.current.clientHeight;
      if (containerHeight === 0) {
        return false;
      }

      // Calculate paper height based on content
      const contentHeight = textRef.current.scrollHeight;
      const minHeight = 400;
      const calculatedHeight = Math.max(contentHeight + 128, minHeight);
      
      // Reserve space for handles (64px total) and padding (32px)
      const availableHeight = containerHeight - 96;
      
      // Ensure scroll fits within container
      const maxHeight = Math.min(calculatedHeight, availableHeight, window.innerHeight * 0.7);
      setTargetHeight(maxHeight);
      
      // Reset state for new animation
      setHasStarted(true);
      setUnravelProgress(0);
      setIsClosing(false);
      setIsOpening(false);
      
      // Mark as initialized to prevent double initialization
      hasInitializedRef.current = true;
      
      return true;
    };
    
    // Try to initialize and start animation
    const tryInitialize = () => {
      if (!mounted || hasInitializedRef.current) return false;
      
      // Double-check state hasn't changed
      if (isOpening || animationIntervalRef.current) return false;
      
      if (initializeAnimation()) {
        // Small delay to ensure state is set before starting animation
        setTimeout(() => {
          if (mounted && !isOpening && !animationIntervalRef.current && hasInitializedRef.current) {
            startUnravelAnimation();
          }
        }, 50);
        return true;
      }
      return false;
    };

    // Try to initialize immediately
    if (!tryInitialize()) {
      // If not ready, wait a bit and try again
      const timeoutId1 = setTimeout(() => {
        if (mounted && !hasInitializedRef.current && !isOpening && !animationIntervalRef.current) {
          if (!tryInitialize()) {
            // Try one more time after a longer delay
            const timeoutId2 = setTimeout(() => {
              if (mounted && !hasInitializedRef.current && !isOpening && !animationIntervalRef.current) {
                tryInitialize();
              }
            }, 300);
            cleanupFunctions.push(() => clearTimeout(timeoutId2));
          }
        }
      }, 150);
      cleanupFunctions.push(() => clearTimeout(timeoutId1));
    }
    
    // Cleanup function
    return () => {
      mounted = false;
      cleanupFunctions.forEach(cleanup => cleanup());
      if (animationIntervalRef.current) {
        clearInterval(animationIntervalRef.current);
        animationIntervalRef.current = null;
      }
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
        animationTimeoutRef.current = null;
      }
      // Reset initialization flag when component unmounts or content changes
      hasInitializedRef.current = false;
    };
  }, [letterContent, showTitleOpener, showTitleOpenerProp, startUnravelAnimation]);
  
  // Handle click on scroll handles to close
  const handleHandleClick = useCallback(() => {
    // Only allow closing if scroll is fully open and not already animating
    if (unravelProgress >= 1 && !isClosing && !isOpening && !animationIntervalRef.current) {
      handleCloseScroll();
    }
  }, [unravelProgress, isClosing, isOpening, handleCloseScroll]);

  // Calculate positions based on animation progress
  const handleHeight = 32;
  const handleHalfHeight = handleHeight / 2;
  
  // When closed: handles should be very close to each other (touching or almost touching)
  // When open: handles at paper edges
  const closedGap = 0; // No gap between handles when closed - they should be touching
  const closedTopHandleY = -(closedGap / 2) - handleHalfHeight;
  const closedBottomHandleY = (closedGap / 2) + handleHalfHeight;
  
  // End positions (fully unravelled)
  const finalTopHandleY = -(targetHeight / 2) - handleHalfHeight;
  const finalBottomHandleY = (targetHeight / 2) + handleHalfHeight;
  
  // Interpolate positions based on progress
  const topHandleY = closedTopHandleY + (finalTopHandleY - closedTopHandleY) * unravelProgress;
  const bottomHandleY = closedBottomHandleY + (finalBottomHandleY - closedBottomHandleY) * unravelProgress;
  
  // Paper height starts at minimal (just handles) and expands
  const minHeight = handleHeight; // Just enough for the handles themselves when closed
  const paperHeight = minHeight + (targetHeight - minHeight) * unravelProgress;

  const handleTitleOpenerComplete = () => {
    // Add a small delay before hiding the opener to ensure smooth transition
    setTimeout(() => {
      setShowTitleOpener(false);
    }, 300);
  };

  return (
    <div className="w-full h-full flex items-center justify-center relative overflow-hidden" ref={scrollContainerRef} style={{ minHeight: '400px' }}>

      {/* Cinematic Title Opener */}
      <AnimatePresence>
        {showTitleOpenerProp && showTitleOpener && (
          <motion.div
            key="title-opener"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="absolute inset-0 z-50 pointer-events-none"
            style={{ willChange: 'opacity' }}
          >
            <CinematicTitleOpener
              title={letterTitle}
              onComplete={handleTitleOpenerComplete}
              duration={3500}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Animated Background with Sparkles */}
      <div ref={backgroundRef} className="absolute inset-0 overflow-hidden rounded-xl" style={{ opacity: (showTitleOpenerProp && showTitleOpener) ? 0 : 1 }}>
        {/* Moving gradient overlay */}
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              "radial-gradient(circle at 30% 40%, rgba(255, 215, 0, 0.15) 0%, transparent 60%), radial-gradient(circle at 70% 60%, rgba(255, 182, 193, 0.15) 0%, transparent 60%)",
              "radial-gradient(circle at 60% 50%, rgba(255, 215, 0, 0.2) 0%, transparent 60%), radial-gradient(circle at 40% 70%, rgba(255, 182, 193, 0.18) 0%, transparent 60%)",
              "radial-gradient(circle at 50% 60%, rgba(255, 215, 0, 0.15) 0%, transparent 60%), radial-gradient(circle at 50% 40%, rgba(255, 182, 193, 0.15) 0%, transparent 60%)",
              "radial-gradient(circle at 30% 40%, rgba(255, 215, 0, 0.15) 0%, transparent 60%), radial-gradient(circle at 70% 60%, rgba(255, 182, 193, 0.15) 0%, transparent 60%)",
            ],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

      </div>

      <div className="relative w-full max-w-2xl z-10" style={{ maxHeight: "100%", visibility: hasStarted && (!showTitleOpenerProp || !showTitleOpener) ? "visible" : "hidden" }}>
        {/* Scroll Top Roll - Wooden Rod */}
        <motion.div
          ref={scrollTopRollRef}
          className="absolute top-1/2 left-0 right-0 z-20"
          style={{
            transform: `translateY(calc(-50% + ${topHandleY}px))`,
            cursor: unravelProgress >= 1 && !isClosing && !isOpening ? 'pointer' : 'default',
          }}
          transition={{
            duration: 0.05,
            ease: "linear",
          }}
          onClick={handleHandleClick}
        >
          {/* Wooden rod horizontal bar */}
          <div
            className="relative w-full h-8 mx-auto"
            style={{
              maxWidth: "min(700px, 95vw)",
              background: "linear-gradient(135deg, #8B4513 0%, #654321 25%, #8B4513 50%, #654321 75%, #8B4513 100%)",
              borderRadius: "4px",
              boxShadow: `
                inset 0 -4px 8px rgba(0, 0, 0, 0.4),
                inset 0 4px 8px rgba(255, 255, 255, 0.1),
                0 2px 4px rgba(0, 0, 0, 0.5)
              `,
            }}
          >
            {/* Wood grain texture */}
            <div
              className="absolute inset-0 opacity-40 rounded"
              style={{
                background: `
                  repeating-linear-gradient(
                    90deg,
                    transparent,
                    transparent 4px,
                    rgba(0, 0, 0, 0.1) 4px,
                    rgba(0, 0, 0, 0.1) 6px
                  ),
                  linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 0%, transparent 50%, rgba(0, 0, 0, 0.1) 100%)
                `,
              }}
            />
          </div>
        </motion.div>

        {/* Scroll Bottom Roll - Wooden Rod */}
        <motion.div
          ref={scrollBottomRollRef}
          className="absolute top-1/2 left-0 right-0 z-20"
          style={{
            transform: `translateY(calc(-50% + ${bottomHandleY}px))`,
            cursor: unravelProgress >= 1 && !isClosing && !isOpening ? 'pointer' : 'default',
          }}
          transition={{
            duration: 0.05,
            ease: "linear",
          }}
          onClick={handleHandleClick}
        >
          {/* Wooden rod horizontal bar */}
          <div
            className="relative w-full h-8 mx-auto"
            style={{
              maxWidth: "min(700px, 95vw)",
              background: "linear-gradient(135deg, #8B4513 0%, #654321 25%, #8B4513 50%, #654321 75%, #8B4513 100%)",
              borderRadius: "4px",
              boxShadow: `
                inset 0 -4px 8px rgba(0, 0, 0, 0.4),
                inset 0 4px 8px rgba(255, 255, 255, 0.1),
                0 2px 4px rgba(0, 0, 0, 0.5)
              `,
            }}
          >
            {/* Wood grain texture */}
            <div
              className="absolute inset-0 opacity-40 rounded"
              style={{
                background: `
                  repeating-linear-gradient(
                    90deg,
                    transparent,
                    transparent 4px,
                    rgba(0, 0, 0, 0.1) 4px,
                    rgba(0, 0, 0, 0.1) 6px
                  ),
                  linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 0%, transparent 50%, rgba(0, 0, 0, 0.1) 100%)
                `,
              }}
            />
          </div>
        </motion.div>

        {/* Scroll Paper Container */}
        <motion.div
          ref={scrollPaperRef}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-b from-amber-50 via-white to-amber-50 shadow-2xl z-10 flex flex-col overflow-hidden"
          style={{
            minWidth: "min(650px, 90vw)",
            width: "auto",
            maxWidth: "min(700px, 95vw)",
            height: `${paperHeight}px`,
            minHeight: `${minHeight}px`,
            padding: "2rem",
            boxShadow: isOpening || isClosing
              ? `0 20px 60px rgba(255, 215, 0, 0.6), 0 0 80px rgba(255, 192, 203, 0.5), 0 0 120px rgba(255, 182, 193, 0.4)`
              : "0 20px 60px rgba(0, 0, 0, 0.4), 0 0 40px rgba(255, 215, 0, 0.2)",
            border: "6px solid",
            borderImage: isOpening || isClosing
              ? "linear-gradient(135deg, rgba(255, 215, 0, 0.8), rgba(255, 192, 203, 0.9), rgba(255, 215, 0, 0.8)) 1"
              : "linear-gradient(135deg, rgba(184, 134, 11, 0.6), rgba(218, 165, 32, 0.8), rgba(184, 134, 11, 0.6)) 1",
            borderRadius: "0px", // Flat edges to match handles
            // External decorative border
            outline: isOpening || isClosing 
              ? "3px solid rgba(255, 215, 0, 0.6)"
              : "3px solid rgba(184, 134, 11, 0.3)",
            outlineOffset: "4px",
            opacity: hasStarted ? Math.max(0, unravelProgress) : 0,
            overflow: unravelProgress > 0.8 ? "auto" : "hidden",
            visibility: unravelProgress > 0.1 ? "visible" : "hidden",
            filter: isOpening || isClosing ? "brightness(1.1)" : "none",
          }}
          animate={isOpening || isClosing ? {
            scale: [1, 1.02, 1],
          } : {}}
          transition={{
            height: {
              duration: 0.05,
              ease: "linear",
            },
            opacity: {
              duration: 0.05,
              ease: "linear",
            },
            scale: {
              duration: 0.5,
              repeat: Infinity,
              ease: "easeInOut",
            },
          }}
        >

          {/* Curved top edge */}
          <div
            className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-amber-200/30 to-transparent"
            style={{
              borderTopLeftRadius: "0.5rem",
              borderTopRightRadius: "0.5rem",
            }}
          />
          
          {/* Curved bottom edge */}
          <div
            className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-amber-200/30 to-transparent"
            style={{
              borderBottomLeftRadius: "0.5rem",
              borderBottomRightRadius: "0.5rem",
            }}
          />

          {/* Letter Content */}
          <motion.div
            ref={textRef}
            className="relative z-10 w-full flex-1 overflow-y-auto px-6 py-4 min-h-0"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "rgba(217, 119, 6, 0.3) rgba(254, 243, 199, 0.2)",
              opacity: unravelProgress > 0.5 ? Math.min(1, (unravelProgress - 0.5) * 2) : 0,
              visibility: unravelProgress > 0.5 ? "visible" : "hidden",
            }}
            transition={{
              opacity: {
                duration: 0.5,
                delay: 0.3,
              },
            }}
          >
              {(() => {
                let processedContent = letterContent.replace(/\[Your Name\]/g, userFirstName ? `${userFirstName} ❤️` : '[Your Name] ❤️');
                // If user's name appears at the end of a line and doesn't already have a heart, add one
                if (userFirstName) {
                  const namePattern = new RegExp(`(${userFirstName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})(?!\\s*❤️)`, 'g');
                  processedContent = processedContent.split('\n').map(line => {
                    const trimmedLine = line.trim();
                    // Check if line ends with just the name (likely a signature)
                    if (trimmedLine === userFirstName || trimmedLine.endsWith(` ${userFirstName}`)) {
                      return line.replace(new RegExp(`${userFirstName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`), `${userFirstName} ❤️`);
                    }
                    return line;
                  }).join('\n');
                }
              
              // Use Dearly app font face (Playfair Display) for all letter content in scroll
              return (
                <div className="text-gray-800 whitespace-pre-wrap">
                  <p
                    style={{
                      fontFamily: "'Playfair Display', 'Cormorant Garamond', 'EB Garamond', 'Lora', 'Merriweather', serif",
                      fontSize: "18px",
                      lineHeight: "2",
                      letterSpacing: "0.2px",
                      fontWeight: "400",
                      fontStyle: "normal",
                      textShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
                      color: "#2c1810",
                    }}
                  >
                    {processedContent}
                  </p>
                </div>
              );
              })()}
          </motion.div>

        </motion.div>

        {/* Decorative paper texture overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-5"
          style={{
            backgroundImage: `url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9InRleHR1cmUiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgxODUsIDEzNywgMTExLCAwLjEpIiBzdHJva2Utd2lkdGg9IjAuNSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCN0ZXh0dXJlKSIvPjwvc3ZnPg==')`,
            mixBlendMode: "multiply",
          }}
        />
      </div>
    </div>
  );
}

