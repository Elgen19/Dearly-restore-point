// MasterApp.jsx - Master application for sender to craft and manage letters
import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import MasterLetterCraft from "./MasterLetterCraft";
import SignIn from "./SignIn";
import CheckYourEmail from "./CheckYourEmail";
import ForgotPassword from "./ForgotPassword";
import WelcomeIntro from "./WelcomeIntro";
import ReceiverNameSetup from "./ReceiverNameSetup";
import Dashboard from "./Dashboard";

export default function MasterApp() {
  const { currentUser, logout } = useAuth();
  const [authView, setAuthView] = useState('signin'); // 'signin', 'checkEmail', 'forgotPassword'
  const [checkEmailAddress, setCheckEmailAddress] = useState('');
  const [postAuthFlow, setPostAuthFlow] = useState(null); // 'welcomeIntro', 'receiverNameSetup', 'dashboard', 'letterCraft'
  const [receiverData, setReceiverData] = useState(null);
  const [loadingReceiverData, setLoadingReceiverData] = useState(true);
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard', 'letterCraft', 'datePlanning'
  const [letterCraftSource, setLetterCraftSource] = useState('dashboard'); // 'dashboard' or 'myLetters'
  const [showMyLettersOnDashboard, setShowMyLettersOnDashboard] = useState(false);

  // Update URL when postAuthFlow changes
  useEffect(() => {
    if (!currentUser) {
      // User signed out - update URL to signin
      if (window.location.pathname !== '/signin') {
        window.history.pushState({}, '', '/signin');
      }
      return;
    }

    // User is signed in - update URL based on current view
    if (postAuthFlow === 'dashboard' && window.location.pathname !== '/dashboard' && window.location.pathname !== '/') {
      window.history.pushState({}, '', '/dashboard');
    } else if (postAuthFlow === 'welcomeIntro' && window.location.pathname !== '/welcome') {
      window.history.pushState({}, '', '/welcome');
    } else if (postAuthFlow === 'receiverNameSetup' && window.location.pathname !== '/setup') {
      window.history.pushState({}, '', '/setup');
    } else if (currentView === 'letterCraft' && window.location.pathname !== '/craft') {
      window.history.pushState({}, '', '/craft');
    }
  }, [currentUser, postAuthFlow, currentView]);

  // Fetch receiver data from Firebase when user signs in
  useEffect(() => {
    const fetchReceiverData = async () => {
      if (!currentUser) {
        setLoadingReceiverData(false);
        setReceiverData(null);
        setPostAuthFlow(null);
        return;
      }

      try {
        setLoadingReceiverData(true);
        const backendUrl = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000').replace(/\/+$/, '');
        
        // Add timeout to prevent hanging
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        try {
          const response = await fetch(`${backendUrl}/api/receiver-data/${currentUser.uid}`, {
            signal: controller.signal,
            headers: {
              'Content-Type': 'application/json',
            },
          });
          
          clearTimeout(timeoutId);
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const result = await response.json();

          if (result.success && result.data) {
            setReceiverData(result.data);
            // User already has receiver data, go directly to dashboard
            setPostAuthFlow('dashboard');
            // Update URL to dashboard
            window.history.pushState({}, '', '/dashboard');
          } else {
            // No receiver data - check if user came from receiver account creation
            const pendingSenderUserId = localStorage.getItem('pendingSenderUserId');
            if (pendingSenderUserId) {
              console.log('🔄 Receiver account detected - auto-setting sender as receiver:', pendingSenderUserId);
              
              try {
                // Fetch sender's profile to get their name and email
                const senderProfileResponse = await fetch(`${backendUrl}/api/auth/user/${pendingSenderUserId}`);
                if (senderProfileResponse.ok) {
                  const senderProfileResult = await senderProfileResponse.json();
                  if (senderProfileResult.success && senderProfileResult.data) {
                    const senderData = senderProfileResult.data;
                    // Use sender's name (firstName + lastName) and email as receiver data
                    const senderName = senderData.firstName && senderData.lastName 
                      ? `${senderData.firstName} ${senderData.lastName}`.trim()
                      : senderData.firstName || senderData.email?.split('@')[0] || 'Your Loved One';
                    const senderEmail = senderData.email;
                    
                    if (senderName && senderEmail) {
                      // Automatically save receiver data
                      const saveResponse = await fetch(`${backendUrl}/api/receiver-data/${currentUser.uid}`, {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                          name: senderName,
                          email: senderEmail,
                        }),
                      });
                      
                      if (saveResponse.ok) {
                        const saveResult = await saveResponse.json();
                        if (saveResult.success) {
                          console.log('✅ Automatically set sender as receiver:', { name: senderName, email: senderEmail });
                          setReceiverData(saveResult.data);
                          // Clear the pending sender ID
                          localStorage.removeItem('pendingSenderUserId');
                          // Go directly to dashboard, skip welcome intro and receiver setup
                          setPostAuthFlow('dashboard');
                          // Update URL to dashboard
                          window.history.pushState({}, '', '/dashboard');
                          return;
                        }
                      }
                    }
                  }
                }
              } catch (autoSetupError) {
                console.error('❌ Error auto-setting receiver data:', autoSetupError);
                // Fall through to show welcome intro if auto-setup fails
              }
              
              // If auto-setup failed, clear the pending sender ID and show welcome intro
              localStorage.removeItem('pendingSenderUserId');
            }
            
            // New user or auto-setup failed, show welcome intro
            setPostAuthFlow('welcomeIntro');
            // Update URL to welcome
            window.history.pushState({}, '', '/welcome');
          }
        } catch (fetchError) {
          clearTimeout(timeoutId);
          if (fetchError.name === 'AbortError') {
            console.error('❌ Request timeout: Backend server may not be responding');
            throw new Error('Request timeout: Please check if the backend server is running on ' + backendUrl);
          }
          throw fetchError;
        }
      } catch (error) {
        console.error('❌ Error fetching receiver data:', error);
        console.error('Error details:', {
          message: error.message,
          name: error.name,
          userId: currentUser?.uid,
          backendUrl: import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'
        });
        // On error, show welcome intro (assume new user)
        // This ensures the app doesn't get stuck
        setPostAuthFlow('welcomeIntro');
        // Update URL to welcome
        window.history.pushState({}, '', '/welcome');
      } finally {
        setLoadingReceiverData(false);
      }
    };

    fetchReceiverData();
  }, [currentUser]);

  // Reset flow when user signs out
  useEffect(() => {
    if (!currentUser) {
      setPostAuthFlow(null);
      setReceiverData(null);
      setCurrentView('dashboard');
    }
  }, [currentUser]);

  // Check authView first to handle post-signup flow
  // This ensures CheckYourEmail is shown even if currentUser is briefly still set
  if (authView === 'checkEmail') {
    return (
      <CheckYourEmail 
        email={checkEmailAddress}
        onBackToSignIn={() => setAuthView('signin')}
      />
    );
  }
  
  if (authView === 'forgotPassword') {
    return (
      <ForgotPassword 
        onBack={() => setAuthView('signin')}
      />
    );
  }

  // Show authentication pages if user is not authenticated
  if (!currentUser) {
    return (
      <SignIn 
        onShowCheckEmail={(email) => {
          setCheckEmailAddress(email);
          setAuthView('checkEmail');
        }}
        onShowForgotPassword={() => setAuthView('forgotPassword')}
        onSignupError={() => {
          // Reset to signin view if signup fails
          setAuthView('signin');
        }}
      />
    );
  }

  // Handle post-authentication flow
  if (postAuthFlow === 'welcomeIntro') {
    return (
      <WelcomeIntro 
        onContinue={() => {
          setPostAuthFlow('receiverNameSetup');
          window.history.pushState({}, '', '/setup');
        }}
      />
    );
  }

  if (postAuthFlow === 'receiverNameSetup') {
    return (
      <ReceiverNameSetup 
        onContinue={async (receiverInfo) => {
          try {
            console.log('💾 Saving receiver data:', { userId: currentUser.uid, receiverInfo });
            
            // Save receiver data to Firebase
            const backendUrl = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000').replace(/\/+$/, '');
            
            // Add timeout to prevent hanging
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
            
            let response;
            try {
              response = await fetch(`${backendUrl}/api/receiver-data/${currentUser.uid}`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  name: receiverInfo.name,
                  email: receiverInfo.email,
                }),
                signal: controller.signal,
              });
              clearTimeout(timeoutId);
            } catch (fetchError) {
              clearTimeout(timeoutId);
              if (fetchError.name === 'AbortError') {
                throw new Error('Request timeout: The server took too long to respond. Please check your connection and try again.');
              }
              throw fetchError;
            }

            console.log('📡 Response status:', response.status);
            
            if (!response.ok) {
              const errorText = await response.text();
              console.error('❌ HTTP Error:', response.status, errorText);
              throw new Error(`Failed to save: ${errorText || `HTTP ${response.status}`}`);
            }

            const result = await response.json();
            console.log('📦 Response data:', result);
            
            if (result.success) {
              console.log('✅ Receiver data saved successfully:', result.data);
              setReceiverData(result.data);
              // Ensure MyLetters is not shown automatically
              setShowMyLettersOnDashboard(false);
              // Ensure user is in sender mode after setting up receiver info
              localStorage.setItem('userRole', 'sender');
              console.log('✅ Set userRole to sender after receiver setup');
              setPostAuthFlow('dashboard');
              // Update URL to dashboard
              window.history.pushState({}, '', '/dashboard');
            } else {
              console.error('❌ Error saving receiver data:', result.error);
              throw new Error(result.error || 'Failed to save receiver data');
            }
          } catch (error) {
            console.error('❌ Error saving receiver data:', error);
            console.error('Error details:', {
              message: error.message,
              stack: error.stack,
              userId: currentUser?.uid,
              receiverInfo
            });
            // Re-throw error so ReceiverNameSetup can show it
            throw error;
          }
        }}
        onBack={() => setPostAuthFlow('welcomeIntro')}
      />
    );
  }

  // Show letter crafting interface (from dashboard navigation) - check this first
  if (currentView === 'letterCraft' && postAuthFlow === 'dashboard') {
    return (
      <div className="relative w-full h-screen overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key="letter-craft"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
          >
            <MasterLetterCraft 
              receiverName={receiverData?.name || ''}
              receiverEmail={receiverData?.email || ''}
              onBack={() => {
                if (letterCraftSource === 'myLetters') {
                  // Go back to MyLetters by showing MyLetters in Dashboard
                  setShowMyLettersOnDashboard(true);
                  setCurrentView('dashboard');
                  setLetterCraftSource('dashboard');
                  window.history.pushState({}, '', '/dashboard');
                } else {
                  setCurrentView('dashboard');
                  window.history.pushState({}, '', '/dashboard');
                }
              }}
              onSendSuccess={() => {
                // After sending, navigate to MyLetters if coming from MyLetters
                if (letterCraftSource === 'myLetters') {
                  setShowMyLettersOnDashboard(true);
                  setCurrentView('dashboard');
                  setLetterCraftSource('dashboard');
                } else {
                  // If coming from dashboard, also go to MyLetters to show the new letter
                  setShowMyLettersOnDashboard(true);
                  setCurrentView('dashboard');
                  setLetterCraftSource('dashboard');
                }
              }}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  // Loading state while fetching receiver data - check this BEFORE postAuthFlow
  // This ensures we always show loading state when fetching
  if (loadingReceiverData) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-gray-600 font-serif">Loading...</p>
        </motion.div>
      </div>
    );
  }

  // Show dashboard
  if (postAuthFlow === 'dashboard') {
    // Ensure user is in sender mode when showing dashboard
    // This prevents showing receiver mode (OptionsPage) after fresh setup
    if (localStorage.getItem('userRole') === 'receiver' && !showMyLettersOnDashboard) {
      console.log('🔄 Ensuring sender mode for dashboard');
      localStorage.setItem('userRole', 'sender');
    }
    
    return (
      <Dashboard
        receiverData={receiverData}
        initialShowMyLetters={showMyLettersOnDashboard}
        onMyLettersClose={() => setShowMyLettersOnDashboard(false)}
        onNavigateToLetters={(source = 'dashboard') => {
          setLetterCraftSource(source);
          setCurrentView('letterCraft');
          window.history.pushState({}, '', '/craft');
        }}
        onNavigateToDatePlanning={() => {
          setCurrentView('datePlanning');
          // TODO: Implement date planning view
          console.log('Date planning coming soon');
        }}
        onReceiverUpdate={(updatedReceiverData) => {
          setReceiverData(updatedReceiverData);
        }}
      />
    );
  }

  // Fallback: If postAuthFlow is still null after loading, default to welcomeIntro
  // This should rarely happen, but ensures the app doesn't get stuck
  if (currentUser && !postAuthFlow) {
    console.warn('⚠️ postAuthFlow is null after loading completed, defaulting to welcomeIntro');
    return (
      <WelcomeIntro 
        onContinue={() => setPostAuthFlow('receiverNameSetup')}
      />
    );
  }

  // Final fallback (shouldn't normally show)
  return null;
}

