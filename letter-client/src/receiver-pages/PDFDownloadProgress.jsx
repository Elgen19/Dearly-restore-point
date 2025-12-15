// PDFDownloadProgress.jsx - Progress page before PDF download
import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { generateLetterPDF } from "../utils/pdfGenerator";

export default function PDFDownloadProgress({ letterContent, recipientName = "Faith", senderName = "Elgen", onBack, onComplete, userId, letterId }) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("Preparing your letter...");

  // Memoize hearts to prevent regeneration on every render
  const hearts = useMemo(() => {
    try {
      return [...Array(8)].map((_, i) => ({
        id: `heart-${i}`,
        left: 10 + Math.random() * 80,
        top: 10 + Math.random() * 80,
        fontSize: 12 + Math.random() * 20,
        duration: 4 + Math.random() * 3,
        delay: Math.random() * 2,
      }));
    } catch (error) {
      console.error('Error creating hearts:', error);
      return [];
    }
  }, []);

  // Memoize stars to prevent regeneration on every render
  const stars = useMemo(() => {
    try {
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
    } catch (error) {
      console.error('Error creating stars:', error);
      return [];
    }
  }, []);

  useEffect(() => {
    let progressInterval;
    let completed = false;

    // Simulate progress
    progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100 || completed) {
          if (progressInterval) clearInterval(progressInterval);
          return 100;
        }
        
        // Update status messages at different progress points
        const increment = Math.random() * 15 + 5;
        const newProgress = Math.min(prev + increment, 100);
        
        if (newProgress >= 100) {
          setStatus("Almost ready...");
          completed = true;
          
          // Generate and download PDF when complete
          setTimeout(async () => {
            try {
              if (letterContent) {
                // letterContent is now just mainBody
                await generateLetterPDF(letterContent, recipientName, senderName);
                setStatus("Download complete! 💕");
                
                // Create notification when PDF is downloaded
                if (userId && letterId) {
                  try {
                    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
                    const notificationResponse = await fetch(`${backendUrl}/api/notifications/${userId}/create`, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        type: 'letter_pdf_download',
                        letterId: letterId,
                        letterTitle: 'Your Letter',
                        message: `${recipientName || 'Your loved one'} downloaded your letter as PDF! 📄`,
                        receiverName: recipientName || 'Your loved one',
                      }),
                    });
                    if (notificationResponse.ok) {
                      console.log('✅ Notification created for PDF download');
                    }
                  } catch (err) {
                    console.error('Error creating PDF download notification:', err);
                  }
                }
                
                // Call onComplete after a short delay
                setTimeout(() => {
                  if (onComplete) {
                    onComplete();
                  }
                }, 1500);
              } else {
                setStatus("Error: Letter content not available");
              }
            } catch (error) {
              console.error("Error generating PDF:", error);
              setStatus("Error generating PDF. Please try again.");
            }
          }, 500);
          
          if (progressInterval) clearInterval(progressInterval);
          return 100;
        } else if (newProgress >= 80) {
          setStatus("Adding final touches...");
        } else if (newProgress >= 60) {
          setStatus("Formatting your letter...");
        } else if (newProgress >= 40) {
          setStatus("Creating beautiful design...");
        } else if (newProgress >= 20) {
          setStatus("Processing content...");
        }
        
        return newProgress;
      });
    }, 200);

    return () => {
      if (progressInterval) clearInterval(progressInterval);
    };
  }, [letterContent, recipientName, onComplete]);

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
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="fixed bg-white rounded-full pointer-events-none"
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
          className="fixed text-pink-300/40 pointer-events-none"
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

      {/* Back Button - Top Left */}
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
      <div className="relative z-10 w-full min-h-screen flex items-center justify-center py-8">
        <div className="w-full max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-white/10 backdrop-blur-md rounded-2xl p-6 md:p-8 shadow-2xl border border-white/20"
          >
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center mb-8"
            >
              <div className="text-5xl mb-3">📄</div>
              <h1 className="text-3xl md:text-4xl font-serif text-white mb-2">
                Preparing Your PDF
              </h1>
              <p className="text-gray-300 text-lg font-serif italic">
                Your beautiful letter is being prepared...
              </p>
            </motion.div>

            {/* Progress Section */}
            <div className="mb-8">
              {/* Status Text */}
              <motion.p
                key={status}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-white/90 font-serif text-lg mb-6"
              >
                {status}
              </motion.p>

              {/* Progress Bar Container */}
              <div className="relative w-full h-4 bg-white/10 rounded-full overflow-hidden border border-white/20">
                {/* Progress Bar Fill */}
                <motion.div
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  {/* Shimmer effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    animate={{
                      x: ["-100%", "200%"],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                </motion.div>
              </div>

              {/* Progress Percentage */}
              <motion.p
                className="text-center text-white/70 font-serif text-sm mt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {Math.round(progress)}%
              </motion.p>
            </div>

            {/* Decorative Elements */}
            <div className="flex justify-center gap-4 mt-8">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.3,
                    ease: "easeInOut",
                  }}
                  className="text-2xl"
                >
                  💕
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

