// DateUnlock.jsx - Combination lock-style date picker for unlocking letters
import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function DateUnlock({
  question = "What is our first date?",
  correctDate = "", // Format: "YYYY-MM-DD" (for preview mode only)
  letterId = null, // Letter ID for backend validation
  userId = null, // User ID for backend validation
  onUnlock,
  onCancel
}) {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState({ month: false, day: false, year: false });
  const [clickIndicator, setClickIndicator] = useState(null);
  const [showQuestion, setShowQuestion] = useState(false);
  const [showDials, setShowDials] = useState(false);

  const monthRef = useRef(null);
  const dayRef = useRef(null);
  const yearRef = useRef(null);
  const lastDragOffsetRef = useRef({ month: 0, day: 0, year: 0 });

  // Generate arrays for dials
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - 50 + i);

  // Get month name
  const getMonthName = (monthNum) => {
    const date = new Date(2000, monthNum - 1, 1);
    return date.toLocaleDateString('en-US', { month: 'short' });
  };

  // Smooth fade-in effect for question
  useEffect(() => {
    if (!question) return;
    
    setShowQuestion(false);
    setShowDials(false);
    
    // Fade in question smoothly
    const questionTimer = setTimeout(() => {
      setShowQuestion(true);
    }, 300);
    
    // After question is fully visible, wait a meaningful pause then show dials
    const dialsTimer = setTimeout(() => {
      setShowDials(true);
    }, 3500); // 3.5 seconds total: 300ms delay + 3200ms fade duration

    return () => {
      clearTimeout(questionTimer);
      clearTimeout(dialsTimer);
    };
  }, [question]);

  // Handle drag for month dial - using offset to track total movement
  const handleMonthDrag = (event, info) => {
    const threshold = 50; // Pixels needed to move one value
    const currentOffset = info.offset.y;
    const lastOffset = lastDragOffsetRef.current.month;
    const diff = currentOffset - lastOffset;
    
    if (Math.abs(diff) >= threshold) {
      const direction = diff > 0 ? -1 : 1;
      setSelectedMonth(prev => {
        let newMonth = prev + direction;
        while (newMonth < 1) newMonth += 12;
        while (newMonth > 12) newMonth -= 12;
        return newMonth;
      });
      lastDragOffsetRef.current.month = currentOffset;
      showClickIndicator('month');
    }
  };

  // Handle drag for day dial
  const handleDayDrag = (event, info) => {
    const threshold = 50;
    const currentOffset = info.offset.y;
    const lastOffset = lastDragOffsetRef.current.day;
    const diff = currentOffset - lastOffset;
    
    if (Math.abs(diff) >= threshold) {
      const direction = diff > 0 ? -1 : 1;
      setSelectedDay(prev => {
        let newDay = prev + direction;
        while (newDay < 1) newDay += 31;
        while (newDay > 31) newDay -= 31;
        return newDay;
      });
      lastDragOffsetRef.current.day = currentOffset;
      showClickIndicator('day');
    }
  };

  // Handle drag for year dial
  const handleYearDrag = (event, info) => {
    const threshold = 60;
    const currentOffset = info.offset.y;
    const lastOffset = lastDragOffsetRef.current.year;
    const diff = currentOffset - lastOffset;
    
    if (Math.abs(diff) >= threshold) {
      const direction = diff > 0 ? -1 : 1;
      setSelectedYear(prev => {
        let newYear = prev + direction;
        if (newYear < years[0]) newYear = years[years.length - 1];
        if (newYear > years[years.length - 1]) newYear = years[0];
        return newYear;
      });
      lastDragOffsetRef.current.year = currentOffset;
      showClickIndicator('year');
    }
  };

  // Handle drag start - reset offset tracking
  const handleDragStart = (type) => {
    setIsDragging(prev => ({ ...prev, [type]: true }));
    lastDragOffsetRef.current[type] = 0;
  };

  // Handle drag end - reset offset
  const handleDragEnd = (type) => {
    setIsDragging(prev => ({ ...prev, [type]: false }));
    lastDragOffsetRef.current[type] = 0;
  };

  // Handle click increment/decrement
  const handleIncrement = (type) => {
    if (type === 'month') {
      setSelectedMonth(prev => {
        const newMonth = prev + 1;
        return newMonth > 12 ? 1 : newMonth;
      });
    } else if (type === 'day') {
      setSelectedDay(prev => {
        const newDay = prev + 1;
        return newDay > 31 ? 1 : newDay;
      });
    } else if (type === 'year') {
      setSelectedYear(prev => {
        const newYear = prev + 1;
        return newYear > years[years.length - 1] ? years[0] : newYear;
      });
    }
    showClickIndicator(type);
  };

  const handleDecrement = (type) => {
    if (type === 'month') {
      setSelectedMonth(prev => {
        const newMonth = prev - 1;
        return newMonth < 1 ? 12 : newMonth;
      });
    } else if (type === 'day') {
      setSelectedDay(prev => {
        const newDay = prev - 1;
        return newDay < 1 ? 31 : newDay;
      });
    } else if (type === 'year') {
      setSelectedYear(prev => {
        const newYear = prev - 1;
        return newYear < years[0] ? years[years.length - 1] : newYear;
      });
    }
    showClickIndicator(type);
  };

  // Show click indicator
  const showClickIndicator = (dial) => {
    setClickIndicator(dial);
    setTimeout(() => setClickIndicator(null), 200);
  };

  // Handle unlock
  const handleUnlock = async () => {
    setIsUnlocking(true);
    setError("");

    // Format selected date as YYYY-MM-DD
    const formattedDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
    
    // If letterId and userId are provided, use backend validation (secure)
    if (letterId && userId) {
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
        const url = `${backendUrl}/api/letters/${userId}/${letterId}/validate-security`;
        console.log('🔐 DateUnlock: Calling validate-security:', { userId, letterId, answer: formattedDate, url });
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ answer: formattedDate }),
        });
        
        console.log('🔐 DateUnlock: Response status:', response.status, response.statusText);

        const result = await response.json();
        
        setIsUnlocking(false);
        if (result.success && result.isCorrect) {
          if (onUnlock) {
            onUnlock();
          }
        } else {
          setError("Incorrect date. Please try again.");
        }
      } catch (error) {
        console.error('Error validating date:', error);
        setIsUnlocking(false);
        setError("Error validating date. Please try again.");
      }
    } else if (!correctDate) {
      // Fallback: if no correctDate and no backend validation, show error
      setIsUnlocking(false);
      setError("Date unlock not configured properly");
    } else {
      // Fallback to client-side validation for preview mode
      // Compare dates (ignore time) - normalize both dates to midnight UTC
      const selected = new Date(formattedDate + 'T00:00:00.000Z');
      const correct = new Date(correctDate + 'T00:00:00.000Z');
      
      // Verify date comparison - check year, month, and day
      const selectedYearNum = selected.getUTCFullYear();
      const selectedMonthNum = selected.getUTCMonth();
      const selectedDayNum = selected.getUTCDate();
      
      const correctYearNum = correct.getUTCFullYear();
      const correctMonthNum = correct.getUTCMonth();
      const correctDayNum = correct.getUTCDate();
      
      const isCorrect = 
        selectedYearNum === correctYearNum &&
        selectedMonthNum === correctMonthNum &&
        selectedDayNum === correctDayNum;

      setTimeout(() => {
        setIsUnlocking(false);
        if (isCorrect && onUnlock) {
          onUnlock();
        } else {
          setError("Incorrect date. Please try again.");
        }
      }, 1500);
    }
  };

  // Render dial component
  const renderDial = (type, values, selected, setSelected, ref, isDragging, onDrag) => {
    const centerIndex = Math.floor(values.length / 2);
    const visibleRange = 5; // Show 5 items above and below center
    
    return (
      <div className="relative flex flex-col items-center z-10 py-2">
        {/* Up Arrow Button - Move backwards */}
        <motion.button
          whileHover={{ scale: 1.1, y: -1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleDecrement(type)}
          className="mb-1 w-6 h-6 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-rose-400/30 to-pink-500/30 hover:from-rose-400/50 hover:to-pink-500/50 backdrop-blur-sm border-2 border-rose-300/40 hover:border-rose-300/60 flex items-center justify-center text-rose-200 hover:text-white transition-all shadow-lg shadow-rose-500/20 hover:shadow-rose-500/40 relative"
          aria-label={`Move ${type} backwards`}
          style={{ zIndex: 20 }}
        >
          <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
          </svg>
        </motion.button>

        <motion.div
          ref={ref}
          className="relative w-16 h-40 md:w-24 md:h-56 flex flex-col items-center"
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={0.1}
          dragMomentum={false}
          dragTransition={{ bounceStiffness: 300, bounceDamping: 30 }}
          onDragStart={() => handleDragStart(type)}
          onDragEnd={() => handleDragEnd(type)}
          onDrag={onDrag}
          style={{ cursor: 'grab' }}
          whileDrag={{ cursor: 'grabbing' }}
        >
        {/* Dial Container - Romantic rose gold appearance */}
        <div className="relative w-full h-full overflow-hidden rounded-3xl border-3 border-rose-300/40 bg-gradient-to-b from-rose-900/40 via-rose-800/30 to-rose-900/40 shadow-2xl"
          style={{
            background: 'linear-gradient(135deg, rgba(190, 18, 60, 0.4) 0%, rgba(157, 23, 77, 0.3) 50%, rgba(190, 18, 60, 0.4) 100%)',
            boxShadow: 'inset 0 2px 15px rgba(251, 113, 133, 0.3), 0 8px 32px rgba(190, 18, 60, 0.4), 0 0 0 1px rgba(251, 113, 133, 0.2)',
          }}
        >
          {/* Romantic texture overlay - subtle floral pattern */}
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `radial-gradient(circle at 20% 30%, rgba(251, 113, 133, 0.1) 0%, transparent 50%),
                                radial-gradient(circle at 80% 70%, rgba(244, 114, 182, 0.1) 0%, transparent 50%),
                                repeating-linear-gradient(
                                  45deg,
                                  transparent,
                                  transparent 3px,
                                  rgba(251, 113, 133, 0.02) 3px,
                                  rgba(251, 113, 133, 0.02) 6px
                                )`,
            }}
          />
          
          {/* Decorative heart accents */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 text-rose-400/20 text-xs">♥</div>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-rose-400/20 text-xs">♥</div>
          
          {/* Center indicator line - Romantic rose gold glow */}
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 z-20 pointer-events-none">
            <div className="h-1 bg-gradient-to-r from-transparent via-rose-300 to-transparent shadow-[0_0_15px_rgba(251,113,133,0.8),0_0_30px_rgba(244,114,182,0.4)]" />
            <div className="absolute left-1/2 -translate-x-1/2 -top-3 w-1.5 h-6 bg-gradient-to-b from-rose-200 to-rose-400 rounded-full shadow-[0_0_12px_rgba(251,113,133,0.9),0_0_24px_rgba(244,114,182,0.5)]" />
            {/* Small heart indicator */}
            <div className="absolute left-1/2 -translate-x-1/2 -top-8 text-rose-300/60 text-xs">♥</div>
          </div>

          {/* Values */}
          <div className="relative h-full flex flex-col items-center justify-center py-6 md:py-12">
            {values.map((value, index) => {
              const selectedIndex = values.indexOf(selected);
              const distance = Math.abs(index - selectedIndex);
              const opacity = distance === 0 ? 1 : Math.max(0.2, 1 - distance * 0.3);
              const scale = distance === 0 ? 1.1 : Math.max(0.7, 1 - distance * 0.1);
              const isSelected = value === selected;
              const offset = (index - selectedIndex) * (window.innerWidth < 768 ? 28 : 42);
              
              return (
                <motion.div
                  key={`${type}-${value}`}
                  className="absolute w-full flex items-center justify-center"
                  style={{
                    top: '50%',
                    transform: `translateY(calc(-50% + ${offset}px)) scale(${scale})`,
                    opacity,
                  }}
                  animate={{
                    y: `${offset}px`,
                    scale,
                    opacity,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                  }}
                >
                  <span
                    className={`text-sm md:text-lg font-bold font-serif transition-all ${
                      isSelected
                        ? 'text-rose-200 drop-shadow-[0_0_12px_rgba(251,113,133,0.9),0_0_20px_rgba(244,114,182,0.6)]'
                        : 'text-rose-400/40'
                    }`}
                    style={{
                      textShadow: isSelected ? '0 0 15px rgba(251,113,133,0.8), 0 0 25px rgba(244,114,182,0.5)' : 'none',
                    }}
                  >
                    {type === 'month' ? getMonthName(value) : value}
                  </span>
                </motion.div>
              );
            })}
          </div>

          {/* Click indicator - Romantic */}
          {clickIndicator === type && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1.5, opacity: [0.8, 0] }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none z-30"
            >
              <div className="w-20 h-20 rounded-full border-4 border-rose-300/60 shadow-[0_0_20px_rgba(251,113,133,0.6)]" />
            </motion.div>
          )}

          {/* Top and bottom fade gradients - Romantic */}
          <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-rose-950/60 via-rose-950/30 to-transparent pointer-events-none z-10" />
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-rose-950/60 via-rose-950/30 to-transparent pointer-events-none z-10" />
        </div>

        </motion.div>

        {/* Down Arrow Button - Move forwards */}
        <motion.button
          whileHover={{ scale: 1.1, y: 1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleIncrement(type)}
          className="mt-1 w-6 h-6 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-rose-400/30 to-pink-500/30 hover:from-rose-400/50 hover:to-pink-500/50 backdrop-blur-sm border-2 border-rose-300/40 hover:border-rose-300/60 flex items-center justify-center text-rose-200 hover:text-white transition-all shadow-lg shadow-rose-500/20 hover:shadow-rose-500/40"
          aria-label={`Move ${type} forwards`}
        >
          <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
          </svg>
        </motion.button>

        {/* Label - Romantic style */}
        <div className="mt-1 text-center">
          <span className="text-xs font-serif text-rose-200/80 uppercase tracking-wider drop-shadow-[0_0_8px_rgba(251,113,133,0.5)]">
            {type === 'month' ? 'Month' : type === 'day' ? 'Day' : 'Year'}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div 
      className="h-full w-full flex items-center justify-center relative overflow-hidden [&::-webkit-scrollbar]:hidden" 
      style={{ 
        scrollbarWidth: 'none', 
        msOverflowStyle: 'none'
      }}
    >
      {/* Romantic Background - matching MasterLetterCraft */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{
          background: [
            "radial-gradient(circle at 20% 50%, rgba(139, 69, 19, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(75, 0, 130, 0.3) 0%, transparent 50%), linear-gradient(135deg, #1a1a2e 0%, #2d1b4e 50%, #1a1a2e 100%)",
            "radial-gradient(circle at 80% 20%, rgba(139, 69, 19, 0.3) 0%, transparent 50%), radial-gradient(circle at 20% 80%, rgba(75, 0, 130, 0.3) 0%, transparent 50%), linear-gradient(135deg, #2d1b4e 0%, #1a1a2e 50%, #2d1b4e 100%)",
          ],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
        }}
      />

      {/* Stars Background - Memoized to prevent re-renders */}
      {useMemo(() => {
        return Array.from({ length: 100 }, (_, i) => {
          const size = Math.random() < 0.7 ? 1 : Math.random() < 0.9 ? 2 : 3;
          const delay = Math.random() * 5;
          const duration = 3 + Math.random() * 4;
          const left = Math.random() * 100;
          const top = Math.random() * 100;
          return { i, size, delay, duration, left, top };
        });
      }, []).map((star) => (
        <motion.div
          key={`star-${star.i}`}
          className="absolute bg-white rounded-full pointer-events-none"
          style={{
            left: `${star.left}%`,
            top: `${star.top}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            boxShadow: star.size > 1 ? `0 0 ${star.size * 2}px rgba(255, 255, 255, 0.8)` : 'none',
            willChange: 'opacity, transform',
          }}
          animate={{
            opacity: [0.2, 1, 0.2],
            scale: [0.8, 1.3, 0.8],
          }}
          transition={{
            duration: star.duration,
            repeat: Infinity,
            delay: star.delay,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Floating Hearts - Memoized to prevent re-renders */}
      {useMemo(() => {
        return Array.from({ length: 8 }, (_, i) => {
          const left = 10 + Math.random() * 80;
          const top = 10 + Math.random() * 80;
          const fontSize = 12 + Math.random() * 20;
          const duration = 4 + Math.random() * 3;
          const delay = Math.random() * 2;
          return { i, left, top, fontSize, duration, delay };
        });
      }, []).map((heart) => (
        <motion.div
          key={`heart-${heart.i}`}
          className="absolute text-pink-300/40 pointer-events-none"
          style={{
            left: `${heart.left}%`,
            top: `${heart.top}%`,
            fontSize: `${heart.fontSize}px`,
            willChange: 'transform, opacity',
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.3, 0.6, 0.3],
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            duration: heart.duration,
            repeat: Infinity,
            delay: heart.delay,
            ease: "easeInOut",
          }}
        >
          💕
        </motion.div>
      ))}

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center px-4 max-w-4xl relative z-10 py-2 w-full h-full flex flex-col justify-center items-center"
      >
        {/* Question with Smooth Fade-in Effect */}
        <AnimatePresence>
          {showQuestion && (
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 3.2, ease: [0.4, 0, 0.2, 1] }}
              className="text-3xl md:text-4xl lg:text-5xl italic text-white mb-6 flex-shrink-0 px-4 text-center leading-relaxed"
              style={{
                fontFamily: "'Dancing Script', 'Brush Script MT', 'Lucida Handwriting', cursive",
                textShadow: '0 2px 20px rgba(0, 0, 0, 0.5)',
              }}
            >
              {question}
            </motion.h2>
          )}
        </AnimatePresence>

        {/* Combination Lock Dials - Only show after question is fully displayed */}
        <AnimatePresence>
          {showDials && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="flex flex-row items-center justify-center gap-2 md:gap-4 mb-3 px-2 flex-shrink-0"
            >
              {renderDial('month', months, selectedMonth, setSelectedMonth, monthRef, isDragging.month, handleMonthDrag)}
              {renderDial('day', days, selectedDay, setSelectedDay, dayRef, isDragging.day, handleDayDrag)}
              {renderDial('year', years, selectedYear, setSelectedYear, yearRef, isDragging.year, handleYearDrag)}
            </motion.div>
          )}
        </AnimatePresence>


        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-red-300 font-serif text-sm mb-4"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Unlock Button - Only show after dials are visible */}
        <AnimatePresence>
          {showDials && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleUnlock}
              disabled={isUnlocking}
              className="px-6 py-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-lg font-serif font-semibold text-sm shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden flex-shrink-0"
            >
          {isUnlocking ? (
            <span className="flex items-center justify-center gap-2">
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="inline-block"
              >
                🔓
              </motion.span>
              Unlocking...
            </span>
          ) : (
            "🔓 Unlock Letter"
          )}
            </motion.button>
          )}
        </AnimatePresence>

        {/* Instructions - Only show after dials are visible */}
        <AnimatePresence>
          {showDials && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="mt-2 text-gray-300 text-xs font-serif italic flex-shrink-0"
            >
              Drag the dials or use the arrows to select the date
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

