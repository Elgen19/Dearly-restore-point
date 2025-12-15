// AccountCreationModal.jsx - Modal for receivers to create accounts
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

export default function AccountCreationModal({ 
  isOpen, 
  onClose, 
  onSuccess,
  receiverEmail,
  letterId,
  token,
  senderUserId
}) {
  const [isSignUp, setIsSignUp] = useState(true);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState(receiverEmail || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup, login, signInWithGoogle } = useAuth();

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setError('');
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
      if (!email.trim()) {
        setError('Email is required');
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
      
      const result = await signup(email, password, firstName, lastName);
      if (result.success) {
        // Store senderUserId for automatic receiver setup when switching to sender mode
        if (senderUserId) {
          localStorage.setItem('pendingSenderUserId', senderUserId);
          console.log('💾 Stored senderUserId for automatic receiver setup:', senderUserId);
        }
        
        // Link account to letter if token provided
        if (token && letterId && senderUserId) {
          try {
            const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
            // Get the current user after signup
            const linkResponse = await fetch(`${backendUrl}/api/receiver-accounts/link`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                receiverEmail: email,
                letterId,
                senderUserId,
                token
              }),
            });
            
            if (linkResponse.ok) {
              console.log('✅ Account linked to letter successfully');
            }
          } catch (linkError) {
            console.error('Error linking account:', linkError);
            // Don't fail the signup if linking fails - user can link later
          }
        }
        
        setError('');
        if (onSuccess) {
          onSuccess({ email, firstName, lastName });
        }
        onClose();
      } else {
        setError(result.error || 'Failed to create account');
      }
    } else {
      const result = await login(email, password);
      if (result.success) {
        setError('');
        if (onSuccess) {
          onSuccess({ email });
        }
        onClose();
      } else {
        setError(result.error || 'Failed to sign in');
      }
    }
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    const result = await signInWithGoogle();
    if (result.success) {
      // Store senderUserId for automatic receiver setup when switching to sender mode
      if (senderUserId) {
        localStorage.setItem('pendingSenderUserId', senderUserId);
        console.log('💾 Stored senderUserId for automatic receiver setup:', senderUserId);
      }
      
      // Link account to letter if token provided
      if (token && letterId && senderUserId) {
        try {
          const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
          const linkResponse = await fetch(`${backendUrl}/api/receiver-accounts/link`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              receiverEmail: result.user?.email,
              letterId,
              senderUserId,
              token
            }),
          });
          
          if (linkResponse.ok) {
            console.log('✅ Account linked to letter successfully');
          }
        } catch (linkError) {
          console.error('Error linking account:', linkError);
        }
      }
      
      if (onSuccess) {
        onSuccess({ email: result.user?.email });
      }
      onClose();
    } else {
      setError(result.error || 'Failed to sign in with Google');
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-gradient-to-br from-[#2d1b4e] to-[#1a1a2e] rounded-3xl shadow-2xl border border-white/20 max-w-lg w-full h-[600px] overflow-hidden flex flex-col"
        >
          {/* Header - Sticky */}
          <div className={`text-center flex-shrink-0 relative ${isSignUp ? 'p-6 md:p-8 pb-4' : 'p-4 md:p-6 pb-3'}`}>
            {/* Close Button */}
            <motion.button
              onClick={onClose}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="absolute top-4 right-4 w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-all z-10"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.button>
            {isSignUp && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="text-5xl mb-4"
              >
                💌
              </motion.div>
            )}
            <h2 className={`font-serif text-white ${isSignUp ? 'text-2xl md:text-3xl mb-2' : 'text-xl md:text-2xl mb-1'}`}>
              {isSignUp ? 'Create Your Account' : 'Sign In'}
            </h2>
            {isSignUp && (
              <p className="text-gray-300 font-serif text-sm md:text-base">
                Save your letters and write back easily!
              </p>
            )}
          </div>

          {/* Scrollable Content */}
          <div className={`overflow-y-auto flex-1 ${isSignUp ? 'px-6 md:px-8' : 'px-4 md:px-6'}`} style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.3) transparent' }}>
            <style>{`
              div::-webkit-scrollbar {
                width: 8px;
              }
              div::-webkit-scrollbar-track {
                background: transparent;
              }
              div::-webkit-scrollbar-thumb {
                background-color: rgba(255,255,255,0.3);
                border-radius: 4px;
              }
              div::-webkit-scrollbar-thumb:hover {
                background-color: rgba(255,255,255,0.5);
              }
            `}</style>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg"
              >
                <p className="text-red-200 text-sm">{error}</p>
              </motion.div>
            )}

            {/* Tabs */}
            <div className={`flex gap-2 border-b border-white/20 ${isSignUp ? 'mb-6' : 'mb-4'}`}>
            <button
              onClick={() => {
                setIsSignUp(false);
                setError('');
              }}
              className={`flex-1 py-3 px-4 font-medium transition-all relative ${
                !isSignUp
                  ? 'text-pink-400'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Sign In
              {!isSignUp && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-pink-500 to-rose-500"
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
                  ? 'text-pink-400'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Sign Up
              {isSignUp && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-pink-500 to-rose-500"
                  initial={false}
                />
              )}
            </button>
          </div>

            {/* Form */}
            <form onSubmit={handleEmailAuth} className={isSignUp ? 'space-y-4' : 'space-y-3'}>
            {isSignUp && (
              <>
                <div>
                  <label className="block text-white/80 font-serif text-sm mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="John"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white/80 font-serif text-sm mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="Doe"
                    required
                  />
                </div>
              </>
            )}
            <div>
              <label className="block text-white/80 font-serif text-sm mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="you@example.com"
                required
                disabled={!!receiverEmail} // Disable if email is pre-filled
              />
            </div>
            <div>
              <label className="block text-white/80 font-serif text-sm mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder={isSignUp ? "At least 6 characters" : "Your password"}
                required
              />
            </div>
            {isSignUp && (
              <div>
                <label className="block text-white/80 font-serif text-sm mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  placeholder="Confirm your password"
                  required
                />
              </div>
            )}
            
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg font-serif font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Please wait...' : (isSignUp ? 'Create Account' : 'Sign In')}
            </motion.button>
            </form>

            {/* Divider */}
            <div className={`relative ${isSignUp ? 'my-6' : 'my-4'}`}>
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/20"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-[#2d1b4e] text-white/60 font-serif">
                Or continue with
              </span>
            </div>
          </div>

          {/* Google Sign In */}
          <motion.button
            onClick={handleGoogleSignIn}
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-lg font-serif font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {isSignUp ? 'Sign up with Google' : 'Sign in with Google'}
          </motion.button>
          </div>

          {/* Footer - Sticky */}
          <div className={`flex-shrink-0 border-t border-white/10 ${isSignUp ? 'p-6 md:p-8 pt-4' : 'p-4 md:p-6 pt-3'}`}>
            <p className="text-center text-white/60 font-serif text-xs">
              By continuing, you agree to our terms of service and privacy policy.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

