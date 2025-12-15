// CheckYourEmail.jsx - Page shown after successful signup
import React from 'react';
import { motion } from 'framer-motion';

export default function CheckYourEmail({ email, onBackToSignIn }) {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl font-serif font-bold bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 bg-clip-text text-transparent mb-2"
          >
            Dearly
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-gray-600 text-lg font-serif italic"
          >
            Express your heart, beautifully
          </motion.p>
        </div>

        {/* Message Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-white/20 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
            className="w-20 h-20 mx-auto mb-6 bg-rose-100 rounded-full flex items-center justify-center"
          >
            <svg className="w-12 h-12 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </motion.div>

          <h2 className="text-2xl font-serif font-bold text-gray-800 mb-4">
            Check Your Email
          </h2>

          <p className="text-gray-600 mb-2">
            We've sent a verification link to:
          </p>
          <p className="text-rose-600 font-medium mb-6 break-all">
            {email}
          </p>

          <div className="bg-rose-50 border border-rose-200 rounded-lg p-4 mb-6">
            <p className="text-gray-700 text-sm leading-relaxed">
              <strong className="text-rose-600">Please check your inbox</strong> and click on the verification link to activate your account. 
              The link will expire in 24 hours.
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-gray-500 text-sm">
              Didn't receive the email? Check your spam folder or try again.
            </p>

            <button
              onClick={onBackToSignIn}
              className="w-full py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-lg font-medium hover:from-rose-600 hover:to-pink-600 transition-all shadow-md hover:shadow-lg"
            >
              Back to Sign In
            </button>
          </div>
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

