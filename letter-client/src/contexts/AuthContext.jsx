// AuthContext.jsx - Authentication context for managing user auth state
import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sign up with email and password
  const signup = async (email, password, firstName, lastName) => {
    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Send verification email via backend
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
        const response = await fetch(`${backendUrl}/api/email-verification/send`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            firstName,
            lastName,
            userId: user.uid,
          }),
        });

        const data = await response.json();
        if (!data.success) {
          console.error('Failed to send verification email:', data.error);
          // Still return success since user is created, but log the error
        }
      } catch (emailError) {
        console.error('Error sending verification email:', emailError);
        // Still return success since user is created
      }

      // Sign out the user immediately - they need to verify email first
      await signOut(auth);

      return { 
        success: true, 
        user: user,
        message: 'Account created! Please check your email to verify your account.' 
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Sign in with email and password
  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Check if email is verified via backend
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
        const response = await fetch(`${backendUrl}/api/auth/check-verification/${user.uid}`);
        const data = await response.json();

        if (data.success && !data.emailVerified) {
          // Sign out the user if email is not verified
          await signOut(auth);
          return { 
            success: false, 
            error: 'Please verify your email address before signing in. Check your inbox for the verification link.' 
          };
        }
      } catch (verificationError) {
        console.error('Error checking verification status:', verificationError);
        // If we can't check, allow login but log the error
        // In production, you might want to be more strict here
      }

      return { success: true, user: user };
    } catch (error) {
      let errorMessage = error.message;
      // Provide more user-friendly error messages
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password. Please try again.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later.';
      }
      return { success: false, error: errorMessage };
    }
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      console.log('🔐 Google sign-in successful:', { 
        uid: user.uid, 
        email: user.email, 
        displayName: user.displayName 
      });

      // Save user data to Realtime Database via backend
      try {
        const backendUrl = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000').replace(/\/+$/, '');
        const requestUrl = `${backendUrl}/api/auth/save-google-user`;
        const requestBody = {
          userId: user.uid,
          email: user.email,
          displayName: user.displayName || '',
        };

        console.log('📡 Calling backend to save Google user data:', {
          url: requestUrl,
          backendUrl: backendUrl,
          userId: user.uid,
          email: user.email,
          displayName: user.displayName
        });

        const response = await fetch(requestUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });

        console.log('📥 Response status:', response.status, response.statusText);
        console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));

        if (!response.ok) {
          let errorText = '';
          try {
            errorText = await response.text();
            console.error('❌ HTTP Error response body:', errorText);
          } catch (textError) {
            console.error('❌ Could not read error response:', textError);
          }
          console.error('❌ HTTP Error saving Google user data:', {
            status: response.status,
            statusText: response.statusText,
            errorText: errorText
          });
          // Don't throw - still allow sign-in to proceed
          console.warn('⚠️ User data save failed, but authentication succeeded');
          // Return early since we can't parse JSON from error response
          return { success: true, user: user };
        }

        let data;
        try {
          const responseText = await response.text();
          console.log('📦 Raw response text:', responseText);
          data = JSON.parse(responseText);
        } catch (parseError) {
          console.error('❌ Failed to parse response as JSON:', parseError);
          console.warn('⚠️ User data save may have failed, but authentication succeeded');
          return { success: true, user: user };
        }

        console.log('📦 Parsed response data:', data);
        
        if (!data.success) {
          console.error('❌ Failed to save Google user data:', data.error);
          console.error('❌ Error details:', data.details || 'No details provided');
          // Still return success since user is authenticated, but log the error
        } else {
          console.log('✅ Google user data saved successfully:', data.message);
        }
      } catch (saveError) {
        console.error('❌ Error saving Google user data:', saveError);
        console.error('❌ Error details:', {
          name: saveError.name,
          message: saveError.message,
          stack: saveError.stack,
          cause: saveError.cause
        });
        // Still return success since user is authenticated
      }

      return { success: true, user: user };
    } catch (error) {
      let errorMessage = error.message;
      // Provide more user-friendly error messages
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Sign-in was cancelled. Please try again.';
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = 'Popup was blocked. Please allow popups and try again.';
      } else if (error.code === 'auth/unauthorized-domain') {
        errorMessage = 'This domain is not authorized for Google sign-in.';
      }
      return { success: false, error: errorMessage };
    }
  };

  // Sign out
  const logout = async () => {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    signup,
    login,
    signInWithGoogle,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

