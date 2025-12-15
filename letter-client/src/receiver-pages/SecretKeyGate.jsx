// SecretKeyGate.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function SecretKeyGate({ correctKey = "Faith Marie", onSuccess }) {
  const [input, setInput] = useState("");
  const [message, setMessage] = useState("");
  const [shake, setShake] = useState(false);
  const [showReveal, setShowReveal] = useState(false);

  // Romantic reveal states
  const [showIntro, setShowIntro] = useState(false);
  const [showTypewriter, setShowTypewriter] = useState(false);
  const [showContinue, setShowContinue] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() === correctKey) {
      setMessage("");
      setShowReveal(true);
      setTimeout(() => setShowIntro(true), 500); // fade in "For Faith..."
      setTimeout(() => setShowTypewriter(true), 2000); // start typewriter
      setTimeout(() => setShowContinue(true), 5000); // show continue button
    } else {
      setMessage("Hmm… that doesn’t seem right. Try again, love.");
      setShake(true);
      setTimeout(() => setShake(false), 600);
    }
  };

  return (
    <div className="h-screen w-full relative overflow-hidden">
      {/* INPUT SCREEN */}
      <AnimatePresence>
        {!showReveal && (
          <motion.div
            key="key-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 flex items-center justify-center 
            bg-gradient-to-br from-indigo-700 via-blue-600 to-purple-800"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="backdrop-blur-xl bg-white/70 shadow-lg rounded-3xl p-10 max-w-md 
              w-[90%] text-center border border-white/40"
            >
              <motion.h1
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-3xl font-semibold text-gray-800 mb-4"
              >
                A letter for someone special…
              </motion.h1>

              <p className="text-gray-600 mb-6 text-sm">
                Only the right heart can open it.
              </p>

              <motion.form
                onSubmit={handleSubmit}
                animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}
                transition={{ duration: 0.4 }}
                className="flex flex-col items-center"
              >
                <input
                  type="text"
                  placeholder="Enter the secret key"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="p-3 rounded-xl border border-gray-300 mb-3 w-full text-center
                  focus:outline-none focus:ring-2 focus:ring-pink-400 shadow-sm"
                />

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.9 }}
                  type="submit"
                  className="bg-pink-500 text-white px-5 py-2 rounded-xl shadow-md font-medium 
                  hover:bg-pink-600 transition w-full"
                >
                  Unlock the Letter
                </motion.button>
              </motion.form>

              {message && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-4 text-pink-400"
                >
                  {message}
                </motion.p>
              )}

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 0.7, y: -2 }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                  repeatType: "mirror",
                }}
                className="mt-6 text-pink-500 text-xl"
              >
                ❤️
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ROMANTIC REVEAL */}
      <AnimatePresence>
        {showReveal && (
          <motion.div
            key="reveal-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 flex items-center justify-center overflow-hidden"
          >
            {/* Heartbeat + Color Shift Background (no pink) */}
            <motion.div
              className="absolute inset-0"
              animate={{
                scale: [1, 1.02, 1],
                background: [
  "#1a1a2e", // deep navy (night sky)
  "#3a0ca3", // vibrant purple
  "#7209b7", // warm violet
  "#9d4edd", // soft lavender
  "#1a1a2e", // back to deep navy
]
              }}
              transition={{ repeat: Infinity, duration: 12, repeatType: "loop", ease: "easeInOut" }}
            />

            {/* Semi-transparent overlay for readability */}
            <div className="absolute inset-0 bg-black/20 pointer-events-none" />

            {/* Floating Petals (blue/purple) */}
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute bg-blue-300 rounded-full"
                style={{
                  width: 6 + Math.random() * 4,
                  height: 6 + Math.random() * 4,
                  top: Math.random() * 100 + "%",
                  left: Math.random() * 100 + "%",
                  opacity: 0.7,
                }}
                animate={{
                  y: ["0%", "110%"],
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 10 + Math.random() * 5,
                  repeat: Infinity,
                  delay: i * 0.3,
                }}
              />
            ))}

            <div className="z-20 flex flex-col items-center text-center px-6">
              {/* "For Faith..." Intro */}
              {showIntro && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1.5 }}
                  className="text-3xl font-semibold mb-6 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                >
                  For Faith…
                </motion.p>
              )}

              {/* Typewriter Text */}
              {showTypewriter && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1 }}
                  className="text-xl font-light mb-10 text-white drop-shadow-[0_0_6px_rgba(255,255,255,0.8)]"
                >
                  <TypewriterText text="Welcome back… This space is just for Faith." />
                </motion.p>
              )}

              {/* Continue Button (pink accent) */}
              {showContinue && (
                <motion.button
                  onClick={onSuccess}
                  className="px-8 py-3 bg-pink-500 rounded-full shadow-lg text-white font-medium
                  hover:bg-pink-600 transition"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Continue
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* Typewriter Text Component */
function TypewriterText({ text }) {
  const [display, setDisplay] = useState("");
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setDisplay(text.slice(0, i));
      i++;
      if (i > text.length) clearInterval(interval);
    }, 50);
    return () => clearInterval(interval);
  }, [text]);

  return <span>{display}</span>;
}
