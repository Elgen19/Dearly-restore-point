// MessageTemplateScreen.jsx - Screen to send a message about claiming the reward
import React, { useState } from 'react';
import { motion } from 'framer-motion';

const DEFAULT_MESSAGE = "Hey! I completed the game and I'm ready to claim my reward! 💗";

export default function MessageTemplateScreen({ reward, onSend, onBack }) {
  const [message, setMessage] = useState(DEFAULT_MESSAGE);
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) return;
    
    setIsSending(true);
    try {
      if (onSend) {
        await onSend(message);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 h-screen w-full flex items-center justify-center overflow-hidden">
      {/* Background */}
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

      {/* Back Button */}
      {onBack && (
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onBack}
          className="absolute top-4 left-4 z-50 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 shadow-lg transition-all group"
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
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-2xl mx-auto px-4"
      >
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-md rounded-3xl p-6 md:p-8 border border-white/20 shadow-2xl"
        >
          <h2 className="text-2xl md:text-3xl font-serif text-white mb-4 text-center">
            Send a Message 💌
          </h2>

          <div className="mb-6">
            <label className="block text-white/80 font-serif text-sm mb-2">
              Your message (you can edit this):
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full h-32 md:h-40 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 text-white font-serif text-base md:text-lg placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
              placeholder="Type your message here..."
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSend}
              disabled={isSending || !message.trim()}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full font-serif font-semibold text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSending ? 'Sending...' : 'Send Message 💌'}
            </motion.button>
            {onBack && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onBack}
                className="px-6 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-full font-serif font-semibold text-lg border border-white/20"
              >
                Cancel
              </motion.button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

