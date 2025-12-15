// MainBodyPreviewV2.jsx - Diary/Journal reveal with elegant page turn
import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function MainBodyPreviewV2({ 
  mainBody, 
  receiverName = "" 
}) {
  const [pageTurnProgress, setPageTurnProgress] = useState(0);
  const [visibleParagraphs, setVisibleParagraphs] = useState(0);
  const [isTurning, setIsTurning] = useState(false);
  const containerRef = useRef(null);
  
  const paragraphs = useMemo(() => 
    mainBody 
      ? mainBody.split('\n').filter(p => p.trim().length > 0)
      : ["Your letter content will appear here..."],
    [mainBody]
  );
  
  // Page turn animation
  useEffect(() => {
    setPageTurnProgress(0);
    setVisibleParagraphs(0);
    setIsTurning(true);
    let isMounted = true;
    
    const turnDuration = 3000; // 3 seconds for page turn
    const turnSteps = 80;
    const stepDuration = turnDuration / turnSteps;
    let progress = 0;
    
    const turnInterval = setInterval(() => {
      if (progress >= 1 && isMounted) {
        setPageTurnProgress(1);
        setIsTurning(false);
        clearInterval(turnInterval);
        
        // Start showing paragraphs after page is turned
        let currentIndex = 0;
        const showParagraph = () => {
          if (currentIndex < paragraphs.length && isMounted) {
            setVisibleParagraphs(currentIndex + 1);
            currentIndex++;
            setTimeout(showParagraph, 1000);
          }
        };
        setTimeout(showParagraph, 600);
      } else if (isMounted) {
        progress += 1 / turnSteps;
        // Ease out cubic for smooth deceleration
        const eased = 1 - Math.pow(1 - progress, 3);
        setPageTurnProgress(eased);
      }
    }, stepDuration);
    
    return () => {
      isMounted = false;
      clearInterval(turnInterval);
    };
  }, [mainBody, paragraphs.length]);
  
  const journalWidth = Math.min(750, window.innerWidth * 0.88);
  const journalHeight = Math.min(650, window.innerHeight * 0.75);
  const pageTurnAngle = pageTurnProgress * 180;
  
  return (
    <div 
      ref={containerRef}
      className="h-full w-full flex items-center justify-center relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(139, 69, 19, 0.05) 0%, rgba(101, 67, 33, 0.03) 50%, rgba(139, 69, 19, 0.05) 100%)',
      }}
    >
      {/* Elegant background pattern */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-5"
        style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 10px,
            rgba(139, 69, 19, 0.1) 10px,
            rgba(139, 69, 19, 0.1) 20px
          )`,
        }}
      />
      
      {/* Journal/Diary Book */}
      <motion.div
        className="relative z-10"
        style={{
          width: `${journalWidth}px`,
          maxWidth: '90vw',
          perspective: '1200px',
        }}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="relative" style={{ height: `${journalHeight}px` }}>
          {/* Back cover (left page) */}
          <motion.div
            className="absolute left-0 top-0 bottom-0 bg-gradient-to-br from-amber-900 via-amber-800 to-amber-900 shadow-2xl"
            style={{
              width: `${journalWidth / 2}px`,
              borderRight: '2px solid rgba(101, 67, 33, 0.8)',
              boxShadow: 'inset -10px 0 20px rgba(0, 0, 0, 0.3), 10px 0 30px rgba(0, 0, 0, 0.4)',
            }}
            initial={{ rotateY: 0 }}
            animate={{ rotateY: pageTurnProgress * -15 }}
            transition={{ duration: 0.1, ease: "linear" }}
          >
            {/* Leather texture */}
            <div 
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: `url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0ibGVhdGhlciIgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxwYXRoIGQ9Ik0gMCAwIFEgNTAgMjUgMTAwIDAgUSA1MCA3NSAxMDAgMTAwIFEgNTAgNzUgMCAxMDAgUSA1MCAyNSAwIDAgWiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDAsMCwwLDAuMSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNsZWF0aGVyKSIvPjwvc3ZnPg==')`,
              }}
            />
          </motion.div>
          
          {/* Front page (right page) - turning */}
          <motion.div
            className="absolute right-0 top-0 bottom-0 bg-gradient-to-b from-amber-50 via-white to-amber-50 shadow-2xl overflow-hidden"
            style={{
              width: `${journalWidth / 2}px`,
              transformOrigin: 'left center',
              transformStyle: 'preserve-3d',
              boxShadow: isTurning
                ? `0 20px 60px rgba(139, 69, 19, 0.4), 0 0 80px rgba(184, 134, 11, 0.3)`
                : "0 20px 60px rgba(0, 0, 0, 0.3), 0 0 40px rgba(184, 134, 11, 0.2)",
              border: "3px solid",
              borderImage: "linear-gradient(135deg, rgba(184, 134, 11, 0.3), rgba(218, 165, 32, 0.5), rgba(184, 134, 11, 0.3)) 1",
              borderRadius: "0 8px 8px 0",
            }}
            animate={{
              rotateY: pageTurnAngle,
              scale: isTurning ? [1, 1.01, 1] : 1,
            }}
            transition={{
              rotateY: { duration: 0.1, ease: "linear" },
              scale: { duration: 0.8, repeat: isTurning ? Infinity : 0, ease: "easeInOut" },
            }}
          >
            {/* Page content */}
            <div className="relative h-full p-8 flex flex-col">
              {/* Paper texture */}
              <div 
                className="absolute inset-0 pointer-events-none opacity-5"
                style={{
                  backgroundImage: `url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9InRleHR1cmUiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgxODUsIDEzNywgMTExLCAwLjEpIiBzdHJva2Utd2lkdGg9IjAuNSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCN0ZXh0dXJlKSIvPjwvc3ZnPg==')`,
                  mixBlendMode: "multiply",
                }}
              />
              
              {/* Binding line */}
              <div 
                className="absolute left-0 top-0 bottom-0 w-1"
                style={{
                  background: 'linear-gradient(to right, rgba(139, 69, 19, 0.3), transparent)',
                }}
              />
              
              {/* Letter content */}
              <div className="relative z-10 flex-1 overflow-y-auto" style={{
                scrollbarWidth: "thin",
                scrollbarColor: "rgba(217, 119, 6, 0.3) rgba(254, 243, 199, 0.2)",
                opacity: pageTurnProgress > 0.5 ? Math.min(1, (pageTurnProgress - 0.5) * 2) : 0,
              }}>
                <div className="space-y-5">
                  <AnimatePresence mode="popLayout">
                    {paragraphs.slice(0, visibleParagraphs).map((paragraph, index) => (
                      <motion.p
                        key={index}
                        initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        exit={{ opacity: 0 }}
                        transition={{ 
                          duration: 1.2, 
                          ease: "easeOut",
                          delay: index * 0.15 
                        }}
                        className="text-lg md:text-xl leading-relaxed"
                        style={{ 
                          fontFamily: "'Georgia', 'Palatino Linotype', 'Book Antiqua', Palatino, 'Times New Roman', serif",
                          color: '#2c1810',
                          textShadow: '0 1px 2px rgba(255, 255, 255, 0.1)',
                        }}
                      >
                        {paragraph}
                      </motion.p>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Page shadow during turn */}
          {isTurning && pageTurnProgress > 0.1 && pageTurnProgress < 0.9 && (
            <motion.div
              className="absolute"
              style={{
                left: `${journalWidth / 2}px`,
                top: 0,
                bottom: 0,
                width: '40px',
                background: 'linear-gradient(to right, rgba(0, 0, 0, 0.3), transparent)',
                transform: `translateX(${-20 + pageTurnProgress * 20}px)`,
                opacity: Math.sin(pageTurnProgress * Math.PI) * 0.6,
              }}
            />
          )}
        </div>
      </motion.div>
    </div>
  );
}
