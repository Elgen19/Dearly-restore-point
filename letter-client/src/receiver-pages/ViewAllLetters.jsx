// ViewAllLetters.jsx - View all letters in a list
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function ViewAllLetters({ onBack, onViewLetter, userId, fromOptionsPage = false }) {
  const [letters, setLetters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLetter, setSelectedLetter] = useState(null);

  const fetchLetters = async () => {
    if (!userId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch all letters for the specific sender (userId)
      const apiUrl = `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/api/letters/${userId}`;
      console.log("Fetching letters from:", apiUrl);
      
      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      // Handle different error status codes
      if (!response.ok) {
        if (response.status === 404) {
          // API endpoint doesn't exist yet - this is expected for now
          console.log("Letters API endpoint not yet implemented");
          setLetters([]);
          setIsLoading(false);
          return;
        } else if (response.status === 503) {
          setError("Firebase is not configured. Please contact the administrator.");
        } else if (response.status >= 500) {
          setError("Server error. Please try again later.");
        } else {
          const errorData = await response.json().catch(() => ({}));
          setError(errorData.message || "Failed to load letters. Please try again later.");
        }
        
        console.error("API Error:", response.status);
        setLetters([]);
        return;
      }
      
      const data = await response.json();
      console.log("Letters loaded:", data);
      setLetters(data || []);
      
      // Clear any previous errors on success
      setError(null);
    } catch (err) {
      console.error("Error fetching letters:", err);
      
      // Handle network errors - API might not exist yet
      if (err.name === "TypeError" && err.message.includes("fetch")) {
        console.log("Letters API endpoint not yet implemented");
        setLetters([]);
      } else {
        setError(err.message || "Failed to load letters. Please try again later.");
        setLetters([]);
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch letters from API
  useEffect(() => {
    if (userId) {
      fetchLetters();
    } else {
      setError("User ID is required to fetch letters.");
      setIsLoading(false);
    }
  }, [userId]);

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown date";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleViewLetter = async (letter, event) => {
    // Prevent default behavior if event is provided
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    // Only token-based URLs are supported (legacy format removed for security)
    const baseUrl = window.location.origin;
    let letterUrl = null;
    
    // Check if letter has accessToken (token-based URL - required)
    if (letter.accessToken && /^[a-f0-9]{64}$/i.test(letter.accessToken)) {
      letterUrl = `${baseUrl}/letter/${letter.accessToken}`;
    }
    // Check if shareableLink exists and contains a token
    else if (letter.shareableLink) {
      // Check if shareableLink is token-based
      const tokenMatch = letter.shareableLink.match(/\/letter\/([a-f0-9]{64})$/);
      if (tokenMatch) {
        letterUrl = letter.shareableLink; // Already token-based
      } else if (letter.accessToken && /^[a-f0-9]{64}$/i.test(letter.accessToken)) {
        // Extract token from letter if available
        letterUrl = `${baseUrl}/letter/${letter.accessToken}`;
      }
    }
    
    // If no token available, show error
    if (!letterUrl) {
      console.error('Letter does not have a valid access token. Legacy URLs are no longer supported.', letter);
      alert('This letter cannot be accessed. It may need to be regenerated with a secure token.');
      return;
    }
    
    // Create notification when letter is clicked to be reread
    if (userId && letter.id) {
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
        const notificationResponse = await fetch(`${backendUrl}/api/notifications/${userId}/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'letter_reread',
            letterId: letter.id,
            letterTitle: letter.introductory || letter.title || 'Your Letter',
            message: `Your letter "${letter.introductory || letter.title || 'Untitled Letter'}" is being read again from the letters list! 💌`,
            receiverName: 'Your loved one',
          }),
        });
        if (notificationResponse.ok) {
          console.log('✅ Notification created for letter reread from ViewAllLetters');
        }
      } catch (err) {
        console.error('Error creating reread notification:', err);
      }
    }
    
    // Open in new tab
    // If opened from OptionsPage, add a URL parameter to track the source
    let finalLetterUrl = letterUrl;
    if (fromOptionsPage) {
      const separator = letterUrl.includes('?') ? '&' : '?';
      finalLetterUrl = `${letterUrl}${separator}fromOptionsPage=true`;
    }
    window.open(finalLetterUrl, '_blank', 'noopener,noreferrer');
    
    // Also call onViewLetter callback if provided (for compatibility)
    if (onViewLetter) {
      onViewLetter({
        ...letter,
        userId: letter.userId || userId
      });
    }
  };

  return (
    <div className="h-screen w-full relative overflow-y-auto">
      {/* Romantic Background */}
      <motion.div
        className="fixed inset-0"
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
      {[...Array(100)].map((_, i) => {
        const size = Math.random() < 0.7 ? 1 : Math.random() < 0.9 ? 2 : 3;
        const delay = Math.random() * 5;
        const duration = 3 + Math.random() * 4;
        return (
          <motion.div
            key={`star-${i}`}
            className="fixed bg-white rounded-full pointer-events-none"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${size}px`,
              height: `${size}px`,
              boxShadow: size > 1 ? `0 0 ${size * 2}px rgba(255, 255, 255, 0.8)` : 'none',
            }}
            animate={{
              opacity: [0.2, 1, 0.2],
              scale: [0.8, 1.3, 0.8],
            }}
            transition={{
              duration: duration,
              repeat: Infinity,
              delay: delay,
              ease: "easeInOut",
            }}
          />
        );
      })}

      {/* Floating Hearts */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={`heart-${i}`}
          className="fixed text-pink-300/40 pointer-events-none"
          style={{
            left: `${10 + Math.random() * 80}%`,
            top: `${10 + Math.random() * 80}%`,
            fontSize: `${12 + Math.random() * 20}px`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.3, 0.6, 0.3],
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            duration: 4 + Math.random() * 3,
            repeat: Infinity,
            delay: Math.random() * 2,
            ease: "easeInOut",
          }}
        >
          💕
        </motion.div>
      ))}

      {/* Back Button - Top Left (Desktop Only) */}
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
          className="hidden md:flex absolute top-4 left-4 z-50 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full items-center justify-center border border-white/20 shadow-lg transition-all group"
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
      <div className="relative z-10 w-full min-h-screen flex items-center justify-center py-4 md:py-8">
        <div className="w-full max-w-4xl mx-auto px-4 h-full flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-white/10 backdrop-blur-md rounded-2xl p-4 md:p-6 lg:p-8 shadow-2xl border border-white/20 relative w-full max-h-[90vh] flex flex-col"
          >
            {/* Back Button - Mobile Only (Inside Card) */}
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
                className="md:hidden absolute top-4 left-4 z-10 w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 shadow-lg transition-all group"
                aria-label="Go back"
              >
                <svg
                  className="w-5 h-5 text-white group-hover:text-pink-300 transition-colors"
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
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center mb-4 md:mb-6 pt-12 md:pt-0 flex-shrink-0"
            >
              <div className="text-3xl md:text-5xl mb-2 md:mb-3">📜</div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-serif text-white mb-1 md:mb-2">
                All Letters
              </h1>
              <p className="text-gray-300 text-sm md:text-base lg:text-lg font-serif italic">
                Browse through all your special letters
              </p>
            </motion.div>

            {/* Loading State */}
            {isLoading && (
              <div className="text-center py-8 md:py-12 flex-1 flex items-center justify-center">
                <div>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="text-4xl md:text-6xl mb-4 inline-block"
                  >
                    💕
                  </motion.div>
                  <p className="text-white/70 font-serif text-base md:text-lg">
                    Loading letters...
                  </p>
                </div>
              </div>
            )}

            {/* Error State */}
            {error && !isLoading && (
              <div className="text-center py-8 md:py-12 flex-1 flex items-center justify-center">
                <div>
                  <div className="text-4xl md:text-6xl mb-4">⚠️</div>
                  <p className="text-red-300 font-serif text-base md:text-lg mb-2">
                    {error}
                  </p>
                  <p className="text-gray-400 font-serif text-xs md:text-sm mb-4">
                    Check the browser console (F12) for more details
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={fetchLetters}
                    className="px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-lg font-serif text-sm md:text-base font-semibold shadow-lg transition-all"
                  >
                    Try Again
                  </motion.button>
                </div>
              </div>
            )}

            {/* Letters List */}
            {!isLoading && !error && letters.length > 0 && (
              <div className="space-y-3 md:space-y-4 overflow-y-auto flex-1 min-h-0">
                {letters.map((letter, index) => (
                  <motion.div
                    key={letter.id || index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="bg-white/10 backdrop-blur-sm rounded-xl p-3 md:p-4 lg:p-6 border border-white/20 hover:border-white/40 transition-all cursor-pointer"
                    onClick={(e) => handleViewLetter(letter, e)}
                  >
                    <div className="flex items-start gap-2 md:gap-4">
                      <span className="text-2xl md:text-3xl flex-shrink-0">💌</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1 md:mb-2 flex-wrap gap-2">
                          <h3 className="text-base md:text-lg lg:text-xl font-serif text-white truncate">
                            {letter.introductory || letter.title || "Untitled Letter"}
                          </h3>
                          {letter.createdAt && (
                            <span className="text-white/60 font-serif text-xs md:text-sm whitespace-nowrap">
                              {formatDate(letter.createdAt)}
                            </span>
                          )}
                        </div>
                        {letter.mainBody && (
                          <p className="text-white/70 font-serif text-xs md:text-sm mb-2 line-clamp-2 md:line-clamp-3">
                            {letter.mainBody.substring(0, 150)}...
                          </p>
                        )}
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="mt-2 md:mt-3 px-3 md:px-4 py-1.5 md:py-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-lg font-serif text-xs md:text-sm shadow-lg transition-all"
                          onClick={(e) => handleViewLetter(letter, e)}
                        >
                          Read Letter →
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* No Letters */}
            {!isLoading && !error && letters.length === 0 && (
              <div className="text-center py-8 md:py-12 flex-1 flex items-center justify-center">
                <div>
                  <div className="text-4xl md:text-6xl mb-4">💌</div>
                  <p className="text-white/70 font-serif text-base md:text-lg mb-2">
                    No letters found yet.
                  </p>
                  <p className="text-gray-400 font-serif text-xs md:text-sm">
                    Letters will appear here once they are created.
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

