// EmailVerification.jsx - Email verification page
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function EmailVerification() {
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');
  const [hasVerified, setHasVerified] = useState(false); // Prevent duplicate requests
  
  // Get token from URL query parameters
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  
  // Log for debugging
  useEffect(() => {
    console.log('EmailVerification component mounted');
    console.log('Current URL:', window.location.href);
    console.log('Token from URL:', token ? `${token.substring(0, 10)}...` : 'missing');
  }, [token]);

  useEffect(() => {
    // Prevent duplicate verification requests (React StrictMode causes double renders)
    if (hasVerified || status !== 'verifying') {
      return;
    }

    const verifyEmail = async () => {
      if (!token) {
        setStatus('error');
        setMessage('No verification token provided.');
        return;
      }

      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
        const response = await fetch(`${backendUrl}/api/email-verification/verify?token=${encodeURIComponent(token)}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Verification response:', data);

        if (data.success) {
          setHasVerified(true);
          setStatus('success');
          setMessage('Your email has been verified successfully! You can now sign in.');
          // Redirect to sign in after 3 seconds
          setTimeout(() => {
            window.location.href = '/?mode=master';
          }, 3000);
        } else {
          setStatus('error');
          setMessage(data.error || 'Verification failed. Please try again.');
          console.error('Verification failed:', data);
        }
      } catch (error) {
        setStatus('error');
        setMessage(`An error occurred during verification: ${error.message}. Please try again or contact support.`);
        console.error('Verification error:', error);
      }
    };

    verifyEmail();
  }, [token, hasVerified, status]);

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
        </div>

        {/* Verification Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-white/20 text-center"
        >
          {status === 'verifying' && (
            <div>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 mx-auto mb-4"
              >
                <svg className="w-full h-full text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </motion.div>
              <p className="text-gray-700 text-lg">Verifying your email...</p>
            </div>
          )}

          {status === 'success' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center"
              >
                <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>
              <h2 className="text-2xl font-serif font-bold text-gray-800 mb-2">Email Verified!</h2>
              <p className="text-gray-600 mb-6">{message}</p>
              <p className="text-gray-500 text-sm">Redirecting to sign in...</p>
            </motion.div>
          )}

          {status === 'error' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center"
              >
                <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.div>
              <h2 className="text-2xl font-serif font-bold text-gray-800 mb-2">Verification Failed</h2>
              <p className="text-gray-600 mb-6">{message}</p>
              <button
                onClick={() => window.location.href = '/?mode=master'}
                className="px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-lg font-medium hover:from-rose-600 hover:to-pink-600 transition-all shadow-md"
              >
                Go to Sign In
              </button>
            </motion.div>
          )}
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

