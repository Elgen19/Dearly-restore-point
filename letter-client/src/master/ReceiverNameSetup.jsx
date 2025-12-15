// ReceiverNameSetup.jsx - Component to collect receiver's name and email
import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function ReceiverNameSetup({ onContinue, onBack }) {
  const [receiverName, setReceiverName] = useState('');
  const [receiverEmail, setReceiverEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!receiverName.trim()) {
      setError('Please enter a name for the receiver');
      return;
    }

    if (receiverName.trim().length < 2) {
      setError('Please enter a valid name (at least 2 characters)');
      return;
    }

    if (!receiverEmail.trim()) {
      setError('Please enter an email address for the receiver');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(receiverEmail.trim())) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      await onContinue({
        name: receiverName.trim(),
        email: receiverEmail.trim()
      });
    } catch (err) {
      setError(err.message || 'Failed to save. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse",
            }}
            className="text-5xl mb-4"
          >
            ✍️
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl font-serif font-bold bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 bg-clip-text text-transparent mb-2"
          >
            Who are you writing to?
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-gray-600 text-lg font-serif italic"
          >
            Let's personalize your letter
          </motion.p>
        </div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-white/20"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm"
              >
                {error}
              </motion.div>
            )}

            {/* Name Input */}
            <div>
              <label htmlFor="receiverName" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <svg className="w-5 h-5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Receiver's Name
              </label>
              <input
                id="receiverName"
                type="text"
                value={receiverName}
                onChange={(e) => {
                  setReceiverName(e.target.value);
                  setError('');
                }}
                placeholder="Enter the name of the person you're writing to"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none transition-all font-serif text-lg"
                autoFocus
              />
              <p className="mt-2 text-xs text-gray-500 font-serif italic">
                This name will be used to personalize your letter
              </p>
            </div>

            {/* Email Input */}
            <div>
              <label htmlFor="receiverEmail" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <svg className="w-5 h-5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Receiver's Email
              </label>
              <input
                id="receiverEmail"
                type="email"
                value={receiverEmail}
                onChange={(e) => {
                  setReceiverEmail(e.target.value);
                  setError('');
                }}
                placeholder="Enter the email address of the person you're writing to"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none transition-all font-serif text-lg"
              />
              <p className="mt-2 text-xs text-gray-500 font-serif italic">
                This email will be used to send letters and notifications
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              {onBack && (
                <button
                  type="button"
                  onClick={onBack}
                  className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-all"
                >
                  Back
                </button>
              )}
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-lg font-medium hover:from-rose-600 hover:to-pink-600 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  'Continue ✨'
                )}
              </button>
            </div>
          </form>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-6"
        >
          <p className="text-gray-500 font-serif text-sm italic">
            Made with 💕 by Elgen for Faith
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}

