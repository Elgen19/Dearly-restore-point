// AllWriteBackLetters.jsx - View all write-back letters (responses) the user has made
import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";

export default function AllWriteBackLetters({ onBack, onWriteNew, userId }) {
  const [allResponses, setAllResponses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Memoize stars to prevent regeneration on every render
  const stars = useMemo(() => {
    return [...Array(100)].map((_, i) => {
      const size = Math.random() < 0.7 ? 1 : Math.random() < 0.9 ? 2 : 3;
      return {
        id: `star-${i}`,
        size,
        delay: Math.random() * 5,
        duration: 3 + Math.random() * 4,
        left: Math.random() * 100,
        top: Math.random() * 100,
      };
    });
  }, []);

  // Memoize hearts to prevent regeneration on every render
  const hearts = useMemo(() => {
    return [...Array(8)].map((_, i) => ({
      id: `heart-${i}`,
      left: 10 + Math.random() * 80,
      top: 10 + Math.random() * 80,
      fontSize: 12 + Math.random() * 20,
      duration: 4 + Math.random() * 3,
      delay: Math.random() * 2,
    }));
  }, []);

  // Fetch all write-back responses
  const fetchAllResponses = async () => {
    if (!userId) return;
    setIsLoading(true);
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const response = await fetch(`${backendUrl}/api/letters/${userId}/all-responses`);
      
      if (response.ok) {
        const data = await response.json();
        setAllResponses(Array.isArray(data) ? data : []);
      } else if (response.status === 404) {
        setAllResponses([]);
      } else {
        console.error('Failed to fetch all responses');
        setAllResponses([]);
      }
    } catch (error) {
      console.error('Error fetching all responses:', error);
      setAllResponses([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchAllResponses();
    }
  }, [userId]);

  return (
    <div className="h-screen w-full relative overflow-hidden flex items-center justify-center">
      {/* Animated Background */}
      <motion.div
        className="absolute inset-0"
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

      {/* Stars Background */}
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute bg-white rounded-full"
          style={{
            left: `${star.left}%`,
            top: `${star.top}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            boxShadow: star.size > 1 ? `0 0 ${star.size * 2}px rgba(255, 255, 255, 0.8)` : 'none',
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

      {/* Floating Hearts */}
      {hearts.map((heart) => (
        <motion.div
          key={heart.id}
          className="absolute text-pink-300/40"
          style={{
            left: `${heart.left}%`,
            top: `${heart.top}%`,
            fontSize: `${heart.fontSize}px`,
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

      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/10 to-transparent pointer-events-none" />

      {/* Back Button */}
      {onBack && (
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={(e) => {
            e.stopPropagation();
            onBack();
          }}
          className="absolute top-4 left-4 z-50 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 shadow-lg transition-all group"
          aria-label="Go back"
        >
          <svg
            className="w-6 h-6 text-white group-hover:text-pink-300 transition-colors"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </motion.button>
      )}

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 py-8 overflow-y-auto" style={{ maxHeight: '100vh', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <style>{`
          .overflow-y-auto::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-white/10 backdrop-blur-md rounded-2xl p-6 md:p-8 shadow-2xl border border-white/20"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-serif text-white mb-2 flex items-center justify-center gap-2">
              <span>✉️</span>
              Your Write-Back Letters
            </h1>
            <p className="text-gray-300 text-lg font-serif italic">
              All the letters you've written back to the sender
            </p>
          </div>

          {/* Write New Button - At the top */}
          <div className="flex justify-center mb-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (onWriteNew) {
                  onWriteNew();
                }
              }}
              className="w-auto min-w-[200px] max-w-sm bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-serif text-base md:text-lg py-2.5 md:py-3 px-5 md:px-8 rounded-full shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <span>✉️</span>
              <span>Write a New Response</span>
            </motion.button>
          </div>

          {/* Response Letters List */}
          {isLoading ? (
            <div className="text-center py-12">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="text-6xl mb-4 inline-block"
              >
                💌
              </motion.div>
              <p className="text-white/70 font-serif text-lg">Loading your write-back letters...</p>
            </div>
          ) : allResponses.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <p className="text-white/70 font-serif text-lg mb-6">
                You haven't written back yet. Click the button above to write your first response!
              </p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {allResponses.map((response, index) => (
                <motion.div
                  key={response.id || response.responseId || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20"
                >
                  <div className="flex items-start gap-4">
                    <div className="text-4xl flex-shrink-0">✉️</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-serif text-white">
                          Response to: {response.letterTitle || 'Letter'}
                        </h3>
                        {response.createdAt && (
                          <p className="text-white/60 font-serif text-xs">
                            {new Date(response.createdAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      {response.letterCreatedAt && (
                        <p className="text-white/50 font-serif text-xs mb-2">
                          Original letter: {new Date(response.letterCreatedAt).toLocaleDateString()}
                        </p>
                      )}
                      {response.content && (
                        <p className="text-white/80 font-serif text-sm whitespace-pre-wrap line-clamp-4">
                          {response.content}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

