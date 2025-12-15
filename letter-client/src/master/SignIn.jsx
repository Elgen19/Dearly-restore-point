// SignIn.jsx - Beautiful sign-in page for Dearly
import React, { useState, memo } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

// Animated background component - memoized to prevent re-renders
const AnimatedBackground = memo(() => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Moving gradient overlay */}
      <motion.div
        className="absolute inset-0 opacity-30"
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
        style={{
          background: 'linear-gradient(45deg, rgba(236,72,153,0.1), rgba(219,39,119,0.1), rgba(168,85,247,0.1), rgba(147,51,234,0.1))',
          backgroundSize: '200% 200%',
        }}
      />
      
      {/* Secondary moving overlay */}
      <motion.div
        className="absolute inset-0 opacity-20"
        animate={{
          backgroundPosition: ['100% 100%', '0% 0%', '100% 100%'],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear",
        }}
        style={{
          background: 'linear-gradient(-45deg, rgba(251,113,133,0.1), rgba(244,63,94,0.1), rgba(192,132,252,0.1), rgba(167,139,250,0.1))',
          backgroundSize: '200% 200%',
        }}
      />
      {/* Floating orbs */}
      <motion.div
        className="absolute w-96 h-96 bg-rose-300/20 rounded-full blur-3xl"
        animate={{
          x: [0, 100, 0],
          y: [0, 50, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{ top: '10%', left: '10%' }}
      />
      <motion.div
        className="absolute w-96 h-96 bg-pink-300/20 rounded-full blur-3xl"
        animate={{
          x: [0, -80, 0],
          y: [0, 100, 0],
          scale: [1, 1.3, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{ top: '60%', right: '10%' }}
      />
      <motion.div
        className="absolute w-80 h-80 bg-purple-300/20 rounded-full blur-3xl"
        animate={{
          x: [0, 60, 0],
          y: [0, -70, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{ bottom: '20%', left: '50%' }}
      />
      
      {/* Floating particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-rose-400/30 rounded-full"
          animate={{
            y: [0, -30, 0],
            opacity: [0.3, 0.7, 0.3],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 3 + i * 0.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.3,
          }}
          style={{
            left: `${15 + i * 15}%`,
            top: `${20 + (i % 3) * 30}%`,
          }}
        />
      ))}
      
      {/* Floating hearts */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={`heart-${i}`}
          className="absolute text-rose-400/40"
          animate={{
            y: [0, -100, 0],
            x: [0, Math.sin(i) * 30, 0],
            opacity: [0.2, 0.6, 0.2],
            scale: [0.8, 1.2, 0.8],
            rotate: [0, 15, -15, 0],
          }}
          transition={{
            duration: 4 + i * 0.4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.5,
          }}
          style={{
            left: `${10 + (i * 12)}%`,
            top: `${80 + (i % 4) * 5}%`,
            fontSize: `${12 + (i % 3) * 4}px`,
          }}
        >
          ❤️
        </motion.div>
      ))}
    </div>
  );
});

AnimatedBackground.displayName = 'AnimatedBackground';

const SignIn = memo(function SignIn({ onShowCheckEmail, onShowForgotPassword, onSignupError }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, signup, signInWithGoogle } = useAuth();

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (isSignUp) {
      // Validation
      if (!firstName.trim()) {
        setError('First name is required');
        setLoading(false);
        return;
      }
      if (!lastName.trim()) {
        setError('Last name is required');
        setLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        setLoading(false);
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        setLoading(false);
        return;
      }
      
      // Set authView to 'checkEmail' IMMEDIATELY before signup
      // This prevents the brief redirect to MasterLetterCraft
      if (onShowCheckEmail) {
        onShowCheckEmail(email);
      }
      
      const result = await signup(email, password, firstName, lastName);
      if (!result.success) {
        setError(result.error);
        // Reset view back to signin if signup fails
        if (onSignupError) {
          onSignupError();
        }
      } else {
        // Clear form
        setFirstName('');
        setLastName('');
        setPassword('');
        setConfirmPassword('');
      }
    } else {
      const result = await login(email, password);
      if (!result.success) {
        setError(result.error);
      }
    }
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    const result = await signInWithGoogle();
    if (!result.success) {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="h-screen w-full bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 flex items-center justify-center p-4 overflow-hidden relative">
      <AnimatedBackground />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md h-full flex flex-col justify-center"
      >
        {/* Logo and Branding */}
        <div className="text-center mb-4 flex-shrink-0">
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

        {/* Sign In Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 flex flex-col overflow-hidden"
          style={{ height: 'calc(100vh - 200px)', maxHeight: '600px', minHeight: '500px' }}
        >
          {/* Tabs for Sign In and Sign Up - Fixed Header */}
          <div className="flex-shrink-0 p-6 pb-4">
            <div className="flex gap-2 border-b border-gray-200">
            <button
              onClick={() => {
                setIsSignUp(false);
                setError('');
              }}
              className={`flex-1 py-3 px-4 font-medium transition-all relative ${
                !isSignUp
                  ? 'text-rose-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Sign In
              {!isSignUp && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-rose-500 to-pink-500"
                  initial={false}
                />
              )}
            </button>
            <button
              onClick={() => {
                setIsSignUp(true);
                setError('');
              }}
              className={`flex-1 py-3 px-4 font-medium transition-all relative ${
                isSignUp
                  ? 'text-rose-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Sign Up
              {isSignUp && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-rose-500 to-pink-500"
                  initial={false}
                />
              )}
            </button>
            </div>
          </div>

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto px-6" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(0,0,0,0.2) transparent' }}>
            <style>{`
              div::-webkit-scrollbar {
                width: 8px;
              }
              div::-webkit-scrollbar-track {
                background: transparent;
              }
              div::-webkit-scrollbar-thumb {
                background-color: rgba(0,0,0,0.2);
                border-radius: 4px;
              }
              div::-webkit-scrollbar-thumb:hover {
                background-color: rgba(0,0,0,0.3);
              }
            `}</style>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm"
              >
                {error}
              </motion.div>
            )}

            {/* Success Message */}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm"
              >
                {success}
              </motion.div>
            )}

            {/* Email/Password Form */}
            <form onSubmit={handleEmailAuth} className={`${isSignUp ? 'space-y-4' : 'space-y-3'} mb-6`}>
            {isSignUp && (
              <>
                <div>
                  <label htmlFor="firstName" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                    <svg className="w-4 h-4 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    First Name
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none transition-all"
                    placeholder="Enter your first name"
                  />
                </div>

                <div>
                  <label htmlFor="lastName" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                    <svg className="w-4 h-4 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none transition-all"
                    placeholder="Enter your last name"
                  />
                </div>
              </>
            )}

            <div>
              <label htmlFor="email" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                <svg className="w-4 h-4 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none transition-all"
                placeholder="Enter your email address"
              />
            </div>

            <div>
              <label htmlFor="password" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                <svg className="w-4 h-4 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none transition-all"
                placeholder={isSignUp ? "Create a password (min. 6 characters)" : "Enter your password"}
                minLength={6}
              />
              {!isSignUp && (
                <div className="mt-2 text-right">
                  <button
                    type="button"
                    onClick={() => onShowForgotPassword && onShowForgotPassword()}
                    className="text-sm text-rose-500 hover:text-rose-600 font-medium"
                  >
                    Forgot password?
                  </button>
                </div>
              )}
            </div>

            {isSignUp && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <label htmlFor="confirmPassword" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                  <svg className="w-4 h-4 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none transition-all"
                  placeholder="Re-enter your password to confirm"
                  minLength={6}
                />
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-lg font-medium hover:from-rose-600 hover:to-pink-600 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {isSignUp ? 'Creating account...' : 'Signing in...'}
                </span>
              ) : (
                isSignUp ? 'Create Account' : 'Sign In'
              )}
            </button>
          </form>

            {/* Divider */}
            <div className={`relative ${isSignUp ? 'my-6' : 'my-4'}`}>
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            {/* Google Sign In Button */}
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-3 bg-white border-2 border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 mb-6"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              {loading ? 'Signing in...' : 'Sign in with Google'}
            </button>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-4 flex-shrink-0"
        >
          <p className="text-gray-500 font-serif text-sm italic">
            Made with 💕 by Elgen for Faith
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
});

SignIn.displayName = 'SignIn';

export default SignIn;

