// LetterReveal.jsx - A romantic letter reveal experience
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import romanticMusic from "../music/romantic-music-1.mp3";
import EnvelopeOpening from "./EnvelopeOpening";
import ScrollUnravelPreview from "../components/ScrollUnravelPreview";

export default function LetterReveal({ 
  onContinue, 
  letterContent = "", 
  letterTitle = "",
  userFirstName = ""
}) {
  const [stage, setStage] = useState("envelope"); // envelope -> reading
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef(null);

  // Default content if not provided
  const defaultContent = `Welcome back… this space is just for you. I kept this letter safe while I gathered the right words.

Life has been a journey of small moments, and I wanted to share a few thoughts I've kept in my heart. I hope these words find you in peace and happiness.

Remember, even in the quietest moments, you are never alone. I've thought of you often, and I hope this letter reminds you of that.

There are days when the world feels heavy, and yet even in those times, a thought of you brings a subtle lightness to my heart. I find myself smiling at the memory of your laughter, your voice, and the little things you do that make life brighter.

I wish I could be there to share these moments with you, to hear your thoughts, and to hold space for whatever you are feeling. You deserve a life filled with warmth, joy, and gentle care, and I hope that every step you take leads you closer to it.

As you read this, know that my intentions are sincere, and my heart carries a quiet hope for your happiness. I imagine you finding comfort in these words, just as I found comfort in thinking of you while writing them.

Please take a moment for yourself, to breathe, to smile, and to feel that you are cherished in ways words can barely capture. Life is a collection of fleeting moments, and some of the most meaningful ones are the silent connections that remind us we are seen, remembered, and appreciated.

I hope this letter serves as a gentle reminder: you are valued beyond measure, and even if we are apart, a piece of my thoughts will always be with you, quietly wishing for your light to shine brighter every day.`;

  const displayContent = letterContent || defaultContent;
  const displayTitle = letterTitle || "A Letter for You";

  const handleEnvelopeOpened = () => {
    setStage("reading");
    // Start music when letter is revealed
    if (audioRef.current) {
      audioRef.current.play().catch(err => console.log("Audio play failed:", err));
    }
  };

  const handleScrollClose = () => {
    // When scroll closes, navigate to next page
    if (onContinue) {
      setTimeout(() => {
        onContinue();
      }, 300);
    }
  };

  // Toggle mute/unmute audio
  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // Sync muted state with audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);


  return (
    <div className="h-screen w-full flex items-center justify-center relative overflow-hidden">
      {/* Audio element for background music */}
      <audio ref={audioRef} loop>
        <source src={romanticMusic} type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>

      {/* Mute/Unmute Button */}
      {stage === "reading" && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleMute}
          className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center shadow-lg hover:bg-white/30 transition-colors"
          aria-label={isMuted ? "Unmute audio" : "Mute audio"}
        >
          {isMuted ? (
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
          )}
        </motion.button>
      )}

      {/* Romantic Background - only show when not in title or reading stage */}
      {stage === "envelope" && (
        <>
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

          {/* Universe Stars - Multiple sizes and twinkling */}
          {[...Array(150)].map((_, i) => {
            const size = Math.random() < 0.7 ? 1 : Math.random() < 0.9 ? 2 : 3;
            const delay = Math.random() * 5;
            const duration = 3 + Math.random() * 4;
            return (
              <motion.div
                key={`star-${i}`}
                className="absolute bg-white rounded-full"
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

          {/* Bright Twinkling Stars - Larger stars that twinkle more dramatically */}
          {[...Array(15)].map((_, i) => {
            const delay = Math.random() * 4;
            const baseDuration = 4 + Math.random() * 3;
            return (
              <motion.div
                key={`bright-star-${i}`}
                className="absolute w-2 h-2 bg-white rounded-full"
                style={{
                  left: `${10 + Math.random() * 80}%`,
                  top: `${10 + Math.random() * 80}%`,
                  boxShadow: '0 0 8px rgba(255, 255, 255, 0.9), 0 0 16px rgba(255, 255, 255, 0.5)',
                }}
                animate={{
                  opacity: [0.4, 1, 0.4, 1, 0.4],
                  scale: [1, 1.5, 1, 1.8, 1],
                }}
                transition={{
                  duration: baseDuration,
                  repeat: Infinity,
                  delay: delay,
                  ease: "easeInOut",
                }}
              />
            );
          })}

          {/* Soft Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/10 to-transparent pointer-events-none" />
        </>
      )}

      {/* Main Content - Centered */}
      <div className="relative z-10 flex items-center justify-center w-full h-full max-w-6xl mx-auto px-4">
        <AnimatePresence mode="wait">
          {/* ENVELOPE STAGE */}
          {stage === "envelope" && (
            <EnvelopeOpening key="envelope" onEnvelopeOpened={handleEnvelopeOpened} />
          )}

          {/* LETTER READING STAGE - SCROLL STYLE with built-in title opener */}
          {stage === "reading" && (
            <motion.div
              key="letter"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="w-full h-full"
            >
              <ScrollUnravelPreview
                letterContent={displayContent}
                letterTitle={displayTitle}
                userFirstName={userFirstName}
                autoLoop={false}
                onClose={handleScrollClose}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}


