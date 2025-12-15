// MasterLetterCraft.jsx - Master page for sender to craft letters
import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import ScrollUnravelPreview from "../components/ScrollUnravelPreview";
import LetterIntroductory from "../components/LetterIntroductory";
import LetterMainBody from "../components/LetterMainBody";
import LetterClosing from "../components/LetterClosing";
import LetterProgressIndicator from "../components/LetterProgressIndicator";
import IntroductoryPreviewSelector from "../components/IntroductoryPreviewSelector";
import MainBodyPreviewSelector from "../components/MainBodyPreviewSelector";
import ClosingPreviewSelector from "../components/ClosingPreviewSelector";
import CombinedLetterPreview from "../components/CombinedLetterPreview";
import SecuritySelector from "../components/SecuritySelector";
import QuizSetup from "../components/QuizSetup";
import QuizPreview from "../components/QuizPreview";
import DateSetup from "../components/DateSetup";
import DatePreview from "../components/DatePreview";
import ConfirmationModal from "../components/ConfirmationModal";
import LinkGeneratedPage from "../components/LinkGeneratedPage";
import ExtrasSelection from "../components/ExtrasSelection";
import DatePlanning from "./DatePlanning";
import GameCreationFlow from "./GameCreationFlow";
import Games from "./Games";

export default function MasterLetterCraft({ onBack, receiverName = "", receiverEmail = "", onSendSuccess }) {
  const { currentUser } = useAuth();
  
  // Three-part letter structure
  const [introductory, setIntroductory] = useState("");
  const [mainBody, setMainBody] = useState("");
  const [closing, setClosing] = useState("");
  
  const [selectedAnimation] = useState('rose-bloom'); // Default animation
  const [currentSection, setCurrentSection] = useState('security'); // security, quizSetup, quizPreview, dateSetup, datePreview, introductory, introductoryPreview, mainBody, mainBodyPreview, closing, closingPreview, preview, extras
  const [showPreview, setShowPreview] = useState(false);
  const [introductoryStyle, setIntroductoryStyle] = useState(1); // Selected introductory preview style (1, 2, or 3)
  const [mainBodyStyle, setMainBodyStyle] = useState(1); // Selected main body preview style (1 or 3)
  const [closingStyle, setClosingStyle] = useState(1); // Selected closing preview style (1, 2, or 3)
  const [securityType, setSecurityType] = useState(null); // "quiz", "date", or null
  const [securityConfig, setSecurityConfig] = useState(null); // Configuration for security
  const [selectedMusic, setSelectedMusic] = useState(null); // Legacy support
  const [selectedLetterMusic, setSelectedLetterMusic] = useState(null); // Music for letter viewing
  const [selectedDashboardMusic, setSelectedDashboardMusic] = useState([]); // Music for dashboard (array)
  const [isSaving, setIsSaving] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [alert, setAlert] = useState({ message: "", type: "" });
  const [userFirstName, setUserFirstName] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [shareableLink, setShareableLink] = useState(null);
  const [generatedLetterId, setGeneratedLetterId] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showDatePlanning, setShowDatePlanning] = useState(false);
  const [showGameCreation, setShowGameCreation] = useState(false);
  const [showGames, setShowGames] = useState(false);
  const [dateInvitationToEdit, setDateInvitationToEdit] = useState(null);
  const [gameToEdit, setGameToEdit] = useState(null);
  const [extrasRefreshTrigger, setExtrasRefreshTrigger] = useState(0);
  
  // Handle typing state with a small delay to prevent flickering
  const handleTypingStart = () => {
    setIsTyping(true);
  };
  
  const handleTypingEnd = () => {
    // Small delay before resuming animations to prevent flickering
    setTimeout(() => setIsTyping(false), 300);
  };

  // Extract first name from full name for use in letters
  const getFirstName = (fullName) => {
    if (!fullName) return "";
    // Split by space and take the first part
    return fullName.trim().split(/\s+/)[0];
  };

  const receiverFirstName = getFirstName(receiverName);

  // Fetch user's first name from database
  useEffect(() => {
    const fetchUserFirstName = async () => {
      if (!currentUser) return;

      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
        const response = await fetch(`${backendUrl}/api/auth/check-verification/${currentUser.uid}`);
        
        // If user profile endpoint exists, use it
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.user && result.user.firstName) {
            setUserFirstName(result.user.firstName);
            return;
          }
        }
      } catch (error) {
        console.log('Could not fetch user profile, using fallback');
      }

      // Fallback: try to get from currentUser.displayName or email
      if (currentUser.displayName) {
        setUserFirstName(getFirstName(currentUser.displayName));
      } else if (currentUser.email) {
        // Extract name from email (before @)
        const emailName = currentUser.email.split('@')[0];
        setUserFirstName(getFirstName(emailName));
      }
    };

    fetchUserFirstName();
  }, [currentUser]);

  // Generate prompts with receiver first name replaced
  const writingPrompts = useMemo(() => {
    const basePrompts = [
      {
        name: "Romantic Letter",
        content: `My dearest [Recipient Name],

I wanted to take a moment to express what's in my heart. There are so many things I want to tell you, so many moments I want to share, and so many feelings I want you to know.

Every day with you feels like a gift, and every moment apart makes me realize how much you mean to me. Your smile, your laughter, your presence—they all light up my world in ways I never imagined possible.

I hope this letter finds you well and brings a smile to your face, just as you bring joy to my life every single day.

With all my love,
[Your Name]`
      },
      {
        name: "Thoughtful Message",
        content: `Dear [Recipient Name],

I've been thinking about you a lot lately, and I wanted to share some thoughts that have been on my mind. Life has been a journey of small moments, and I wanted to share a few thoughts I've kept in my heart.

I hope these words find you in peace and happiness. Remember, even in the quietest moments, you are never alone. I've thought of you often, and I hope this letter reminds you of that.

There are days when the world feels heavy, and yet even in those times, a thought of you brings a subtle lightness to my heart. I find myself smiling at the memory of your laughter, your voice, and the little things you do that make life brighter.

With love,
[Your Name]`
      },
      {
        name: "Grateful Letter",
        content: `To my beloved [Recipient Name],

I wanted to take a moment to tell you how much you mean to me. Your presence in my life has been a blessing beyond words, and I'm grateful for every moment we share together.

Your kindness, your warmth, and your beautiful spirit have touched my heart in ways I'm still discovering. I wanted you to know that you are cherished, valued, and deeply loved.

Thank you for being you, for bringing light into my life, and for being the amazing person you are.

Forever grateful,
[Your Name]`
      },
    ];

    // Replace placeholders with actual names
    let processedPrompts = basePrompts;
    
    // Replace [Recipient Name] with receiver's first name if provided
    if (receiverFirstName) {
      processedPrompts = processedPrompts.map(prompt => ({
        ...prompt,
        content: prompt.content.replace(/\[Recipient Name\]/g, receiverFirstName)
      }));
    }

    // Replace [Your Name] with user's first name if available
    if (userFirstName) {
      processedPrompts = processedPrompts.map(prompt => ({
        ...prompt,
        content: prompt.content.replace(/\[Your Name\]/g, userFirstName)
      }));
    }

    return processedPrompts;
  }, [receiverFirstName, userFirstName]);

  // Combine the three parts into full letter content
  const combineLetterContent = () => {
    const parts = [];
    
    if (introductory.trim()) {
      parts.push(introductory.trim());
    }
    
    if (mainBody.trim()) {
      parts.push(mainBody.trim());
    }
    
    if (closing.trim()) {
      parts.push(closing.trim());
    }
    
    return parts.join('\n\n');
  };

  // Get full letter content for display
  const fullLetterContent = combineLetterContent();

  // Navigation handlers
  const handleNextSection = () => {
    if (currentSection === 'security') {
      setCurrentSection('introductory');
      setShowPreview(false);
    } else if (currentSection === 'introductory' && introductory.trim()) {
      setCurrentSection('introductoryPreview');
      setShowPreview(false);
    } else if (currentSection === 'mainBody' && mainBody.trim()) {
      setCurrentSection('mainBodyPreview');
      setShowPreview(false);
    } else if (currentSection === 'closing' && closing.trim()) {
      setCurrentSection('closingPreview');
      setShowPreview(false);
    }
  };
  
  // Handle introductory style selection
  const handleIntroductoryStyleSelect = (styleId) => {
    setIntroductoryStyle(styleId);
    setCurrentSection('mainBody');
    setShowPreview(false);
  };
  
  // Handle main body style selection
  const handleMainBodyStyleSelect = (styleId) => {
    setMainBodyStyle(styleId);
    setCurrentSection('closing');
    setShowPreview(false);
  };

  // Handle closing style selection
  const handleClosingStyleSelect = (styleId) => {
    setClosingStyle(styleId);
    setShowPreview(true);
    setCurrentSection('preview');
  };

  const handleBackSection = () => {
    if (currentSection === 'quizSetup') {
      setCurrentSection('security');
      setShowPreview(false);
    } else if (currentSection === 'quizPreview') {
      setCurrentSection('quizSetup');
      setShowPreview(false);
    } else if (currentSection === 'dateSetup') {
      setCurrentSection('security');
      setShowPreview(false);
    } else if (currentSection === 'datePreview') {
      setCurrentSection('dateSetup');
      setShowPreview(false);
    } else if (currentSection === 'introductory') {
      setCurrentSection('security');
      setShowPreview(false);
    } else if (currentSection === 'introductoryPreview') {
      setCurrentSection('introductory');
      setShowPreview(false);
    } else if (currentSection === 'mainBody') {
      setCurrentSection('introductoryPreview');
      setShowPreview(false);
    } else if (currentSection === 'mainBodyPreview') {
      setCurrentSection('mainBody');
      setShowPreview(false);
    } else if (currentSection === 'closing') {
      setCurrentSection('mainBodyPreview');
      setShowPreview(false);
    } else if (currentSection === 'closingPreview') {
      setCurrentSection('closing');
      setShowPreview(false);
    } else if (currentSection === 'preview') {
      setCurrentSection('closingPreview');
      setShowPreview(false);
    } else if (currentSection === 'extras') {
      setCurrentSection('preview');
      setShowPreview(true);
    } else if (currentSection === 'datePlanning') {
      setShowDatePlanning(false);
      setCurrentSection('extras');
    } else if (currentSection === 'gameCreation') {
      setShowGameCreation(false);
      setCurrentSection('extras');
    }
  };

  // Handle security selection
  const handleSecuritySelect = (type) => {
    if (type === "quiz") {
      setCurrentSection('quizSetup');
    } else if (type === "date") {
      setCurrentSection('dateSetup');
    }
    setShowPreview(false);
  };

  // Security skip removed - security is now mandatory

  // Handle quiz setup completion
  const handleQuizSetupComplete = (config) => {
    setSecurityType("quiz");
    setSecurityConfig(config);
    setCurrentSection('quizPreview');
    setShowPreview(false);
  };

  // Handle date setup completion
  const handleDateSetupComplete = (config) => {
    setSecurityType("date");
    setSecurityConfig(config);
    setCurrentSection('datePreview');
    setShowPreview(false);
  };

  // Handle security preview confirmation
  const handleSecurityPreviewConfirm = () => {
    setCurrentSection('introductory');
    setShowPreview(false);
  };

  const handleSectionClick = (sectionId) => {
    // Only allow navigation to completed sections or current section
    const sections = ['introductory', 'mainBody', 'closing'];
    const currentIndex = sections.indexOf(currentSection);
    const targetIndex = sections.indexOf(sectionId);
    
    // Allow going back or to current section
    // If clicking on introductory and we've completed it, go to preview
    if (sectionId === 'introductory' && introductory.trim() && currentSection !== 'introductory') {
      setCurrentSection('introductoryPreview');
      setShowPreview(false);
    } else if (sectionId === 'mainBody' && mainBody.trim() && currentSection !== 'mainBody') {
      // If clicking on mainBody and we've completed it, go to preview
      setCurrentSection('mainBodyPreview');
      setShowPreview(false);
    } else if (sectionId === 'closing' && closing.trim() && currentSection !== 'closing') {
      // If clicking on closing and we've completed it, go to preview
      setCurrentSection('closingPreview');
      setShowPreview(false);
    } else if (targetIndex <= currentIndex) {
      setCurrentSection(sectionId);
      setShowPreview(false);
    }
  };

  const handleSave = async () => {
    if (!mainBody.trim()) {
      setAlert({ message: "Please write the main body of your letter before saving!", type: "error" });
      return;
    }
    
    if (!currentUser) {
      setAlert({ message: "You must be logged in to save letters.", type: "error" });
      return;
    }
    
    setIsSaving(true);
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const content = combineLetterContent();
      
      const requestBody = {
        content: content,
        title: "Untitled Letter",
        receiverEmail: receiverEmail,
        animation: selectedAnimation || 'rose-bloom',
        // Include separate fields for future use
        introductory: introductory.trim(),
        mainBody: mainBody.trim(),
        closing: closing.trim(),
        // Include security configuration if set
        securityType: securityType,
        securityConfig: securityConfig,
      };

      const response = await fetch(`${backendUrl}/api/letters/${currentUser.uid}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to save letter');
      }

      const result = await response.json();
      setAlert({ message: "Letter saved successfully! 💾", type: "success" });
      setTimeout(() => setAlert({ message: "", type: "" }), 3000);
    } catch (error) {
      console.error('Error saving letter:', error);
      setAlert({ message: error.message || "Failed to save letter. Please try again.", type: "error" });
      setTimeout(() => setAlert({ message: "", type: "" }), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateLink = () => {
    if (!mainBody.trim()) {
      setAlert({ message: "Please write the main body of your letter before generating a link!", type: "error" });
      return;
    }
    
    if (!currentUser) {
      setAlert({ message: "You must be logged in to generate a link.", type: "error" });
      return;
    }
    
    setShowConfirmModal(true);
  };

  const handleConfirmGenerate = async () => {
    setIsGenerating(true);
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const content = combineLetterContent();
      
      const requestBody = {
        content: content,
        receiverEmail: receiverEmail,
        receiverName: receiverName,
        // Include separate fields for future use
        introductory: introductory.trim(),
        mainBody: mainBody.trim(),
        closing: closing.trim(),
        // Include animation styles - always send even if 0
        // These specify which animation style (1, 2, or 3) for each section
        introductoryStyle: introductoryStyle,
        mainBodyStyle: mainBodyStyle,
        closingStyle: closingStyle,
        // Include security configuration - always send (backend will validate)
        securityType: securityType || null,
        securityConfig: securityConfig || null,
        // Include selected music (can be preset ID or uploaded music URL)
        selectedMusic: selectedMusic || null, // Legacy support
        letterMusic: selectedLetterMusic || null, // Music for letter viewing
        dashboardMusic: selectedDashboardMusic || [], // Music for dashboard (array)
      };

      // Debug logging
      console.log('📤 Sending letter data:', {
        hasIntroductoryStyle: introductoryStyle !== undefined,
        introductoryStyle,
        hasMainBodyStyle: mainBodyStyle !== undefined,
        mainBodyStyle,
        hasClosingStyle: closingStyle !== undefined,
        closingStyle,
        hasSecurityType: !!securityType,
        securityType,
        securityTypeType: typeof securityType,
        hasSecurityConfig: !!securityConfig,
        securityConfig,
        securityConfigType: typeof securityConfig,
        securityConfigKeys: securityConfig ? Object.keys(securityConfig) : null
      });
      console.log('📤 Full request body:', JSON.stringify(requestBody, null, 2));

      const response = await fetch(`${backendUrl}/api/letters/${currentUser.uid}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to generate link');
      }

      const result = await response.json();
      const letterId = result.letter?.id || result.letterId;
      const token = result.token; // Get token from response
      
      // Generate shareable link using token (required - legacy format removed)
      if (!token) {
        throw new Error('Token generation failed. Please try again.');
      }
      
      const baseUrl = window.location.origin;
      const link = `${baseUrl}/letter/${token}`;
      
      // Save the shareable link to the database (for backward compatibility)
      try {
        const updateResponse = await fetch(`${backendUrl}/api/letters/${currentUser.uid}/${letterId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            shareableLink: link,
            accessToken: token, // Store token reference
          }),
        });

        if (!updateResponse.ok) {
          console.warn('Failed to save shareable link, but letter was created');
        }
      } catch (err) {
        console.error('Error saving shareable link:', err);
        // Don't fail the whole operation if link save fails
      }
      
      // Store letterId, token, and link so we can pass them to LinkGeneratedPage
      setGeneratedLetterId(letterId);
      setShareableLink(link);
      setShowConfirmModal(false);
    } catch (error) {
      console.error('Error generating link:', error);
      setAlert({ message: error.message || "Failed to generate link. Please try again.", type: "error" });
      setTimeout(() => setAlert({ message: "", type: "" }), 3000);
      setShowConfirmModal(false);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePreview = () => {
    if (mainBody.trim()) {
      setCurrentSection('preview');
      setShowPreview(true);
    }
  };

  // Memoize stars to prevent re-creation on every render (fixes typing lag)
  const stars = useMemo(() => {
    return Array.from({ length: 100 }, (_, i) => {
      const size = Math.random() < 0.7 ? 1 : Math.random() < 0.9 ? 2 : 3;
      const delay = Math.random() * 5;
      const duration = 3 + Math.random() * 4;
      const left = Math.random() * 100;
      const top = Math.random() * 100;
      return { i, size, delay, duration, left, top };
    });
  }, []); // Empty dependency array - only create once

  // Memoize hearts to prevent re-creation on every render
  const hearts = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => {
      const left = 10 + Math.random() * 80;
      const top = 10 + Math.random() * 80;
      const fontSize = 12 + Math.random() * 20;
      const duration = 4 + Math.random() * 3;
      const delay = Math.random() * 2;
      return { i, left, top, fontSize, duration, delay };
    });
  }, []); // Empty dependency array - only create once

  return (
    <div className="h-screen w-full relative overflow-hidden">
      {/* Romantic Background - Paused when typing */}
      <motion.div
        className="fixed inset-0"
        {...(isTyping ? {} : {
          animate: {
            background: [
              "radial-gradient(circle at 20% 50%, rgba(139, 69, 19, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(75, 0, 130, 0.3) 0%, transparent 50%), linear-gradient(135deg, #1a1a2e 0%, #2d1b4e 50%, #1a1a2e 100%)",
              "radial-gradient(circle at 80% 20%, rgba(139, 69, 19, 0.3) 0%, transparent 50%), radial-gradient(circle at 20% 80%, rgba(75, 0, 130, 0.3) 0%, transparent 50%), linear-gradient(135deg, #2d1b4e 0%, #1a1a2e 50%, #2d1b4e 100%)",
            ],
          },
          transition: {
            duration: 8,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          }
        })}
      />

      {/* Stars Background - Memoized to prevent re-renders, paused when typing */}
      {stars.map((star) => (
        <motion.div
          key={`star-${star.i}`}
          className="fixed bg-white rounded-full pointer-events-none"
          style={{
            left: `${star.left}%`,
            top: `${star.top}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            boxShadow: star.size > 1 ? `0 0 ${star.size * 2}px rgba(255, 255, 255, 0.8)` : 'none',
            willChange: 'opacity, transform',
          }}
          {...(isTyping ? {} : {
            animate: {
              opacity: [0.2, 1, 0.2],
              scale: [0.8, 1.3, 0.8],
            },
            transition: {
              duration: star.duration,
              repeat: Infinity,
              delay: star.delay,
              ease: "easeInOut",
            }
          })}
        />
      ))}

      {/* Floating Hearts - Memoized to prevent re-renders, paused when typing */}
      {hearts.map((heart) => (
        <motion.div
          key={`heart-${heart.i}`}
          className="fixed text-pink-300/40 pointer-events-none"
          style={{
            left: `${heart.left}%`,
            top: `${heart.top}%`,
            fontSize: `${heart.fontSize}px`,
            willChange: 'transform, opacity',
          }}
          {...(isTyping ? {} : {
            animate: {
              y: [0, -30, 0],
              opacity: [0.3, 0.6, 0.3],
              rotate: [0, 10, -10, 0],
            },
            transition: {
              duration: heart.duration,
              repeat: Infinity,
              delay: heart.delay,
              ease: "easeInOut",
            }
          })}
        >
          💕
        </motion.div>
      ))}

      {/* Alert Message */}
      <AnimatePresence>
        {alert.message && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`absolute top-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-lg backdrop-blur-md border ${
              alert.type === "success"
                ? "bg-green-500/20 border-green-400/50 text-green-100"
                : "bg-red-500/20 border-red-400/50 text-red-100"
            } shadow-xl`}
          >
            <p className="font-serif text-sm font-semibold">{alert.message}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Back Button - Top Left - Hidden on link page, date planning, game creation, quiz setup, and introductory (mobile only) */}
      {!shareableLink && !showDatePlanning && !showGameCreation && !showGames && currentSection !== 'quizSetup' && (
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={(e) => {
            e.stopPropagation();
            if (showPreview) {
              // If in preview, go back to closing section
              setShowPreview(false);
              setCurrentSection('closing');
            } else if (currentSection === 'security') {
              // If on security section (first section), use the onBack callback
              if (onBack) {
                onBack();
              }
            } else {
              // Otherwise, go back in the flow
              handleBackSection();
            }
          }}
          className={`fixed top-4 left-4 z-40 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 shadow-lg transition-all group ${
            currentSection === 'introductory' || currentSection === 'mainBody' || currentSection === 'closing' || (currentSection === 'preview' && showPreview) ? 'hidden md:flex' : ''
          }`}
          aria-label="Go back"
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

      {/* Link Generated Page - Full Screen */}
      {shareableLink ? (
        <LinkGeneratedPage
          shareableLink={shareableLink}
          receiverEmail={receiverEmail}
          receiverName={receiverName}
          letterTitle={introductory || 'A special letter for you'}
          letterId={generatedLetterId}
          userId={currentUser?.uid}
          onContinue={() => {
            if (onSendSuccess) {
              onSendSuccess();
            }
          }}
        />
      ) : showDatePlanning ? (
        <DatePlanning
          fromExtras={true}
          editInvitation={dateInvitationToEdit}
          onBack={() => {
            setShowDatePlanning(false);
            setDateInvitationToEdit(null);
            setCurrentSection('extras');
            setExtrasRefreshTrigger(prev => prev + 1);
          }}
        />
      ) : showGameCreation ? (
        <GameCreationFlow
          fromExtras={true}
          editGame={gameToEdit}
          onBack={() => {
            setShowGameCreation(false);
            setGameToEdit(null);
            setCurrentSection('extras');
            setExtrasRefreshTrigger(prev => prev + 1);
          }}
          onGameCreated={() => {
            setShowGameCreation(false);
            setGameToEdit(null);
            setCurrentSection('extras');
            setExtrasRefreshTrigger(prev => prev + 1);
          }}
        />
      ) : showGames ? (
        <Games
          fromExtras={true}
          gameToEdit={gameToEdit}
          onBack={() => {
            setShowGames(false);
            setGameToEdit(null);
            setCurrentSection('extras');
            setExtrasRefreshTrigger(prev => prev + 1);
          }}
        />
      ) : (
        <>
          {/* Main Content */}
          <div className={`relative z-10 w-full h-screen flex items-center justify-center ${
            currentSection === 'introductoryPreview' || currentSection === 'mainBodyPreview' ? '' : 'py-4'
          }`}>
            <div className={`w-full h-full flex items-center ${
              currentSection === 'introductoryPreview' || currentSection === 'mainBodyPreview' || currentSection === 'closingPreview' ? '' : 'max-w-4xl mx-auto px-4'
            }`}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className={`w-full h-full flex flex-col ${
                  currentSection === 'introductoryPreview' || currentSection === 'mainBodyPreview' || currentSection === 'security' || currentSection === 'quizSetup' || currentSection === 'quizPreview' || currentSection === 'dateSetup' || currentSection === 'datePreview' || currentSection === 'extras'
                    ? '' 
                    : currentSection === 'closingPreview'
                      ? 'h-[95vh] overflow-hidden'
                      : currentSection === 'introductory' || currentSection === 'mainBody'
                        ? 'h-[95vh] overflow-hidden bg-white/10 backdrop-blur-md rounded-2xl p-4 md:p-6 shadow-2xl border border-white/20'
                        : 'h-[95vh] overflow-hidden bg-white/10 backdrop-blur-md rounded-2xl p-4 md:p-6 shadow-2xl border border-white/20'
                }`}
              >
            {/* Section Title and Description - Show before progress indicator */}
            {currentSection !== 'preview' && currentSection !== 'introductoryPreview' && currentSection !== 'mainBodyPreview' && currentSection !== 'closingPreview' && currentSection !== 'security' && currentSection !== 'quizSetup' && currentSection !== 'quizPreview' && currentSection !== 'dateSetup' && currentSection !== 'datePreview' && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-3 flex-shrink-0"
              >
                <div className="text-3xl mb-2">
                  {currentSection === 'introductory' && '✨'}
                  {currentSection === 'mainBody' && '✍️'}
                  {currentSection === 'closing' && '💝'}
                </div>
                <h1 className="text-2xl md:text-3xl font-serif text-white mb-2">
                  {currentSection === 'introductory' && 'Set the Mood'}
                  {currentSection === 'mainBody' && 'Write Your Letter'}
                  {currentSection === 'closing' && 'Final Message'}
                </h1>
                <p className="text-gray-300 text-sm font-serif italic max-w-md mx-auto">
                  {currentSection === 'introductory' && 'Begin with a short phrase or statement that captures the essence of your letter'}
                  {currentSection === 'mainBody' && 'Pour your heart into these words'}
                  {currentSection === 'closing' && 'Add a final impactful message that will resonate with the reader'}
                </p>
                {currentSection === 'introductory' && receiverName && (
                  <p className="text-pink-200 text-base font-serif font-medium mt-2">
                    Writing to {receiverName} 💕
                  </p>
                )}
              </motion.div>
            )}

            {/* Progress Indicator - Always show, including preview, but hide for preview sections */}
            {currentSection !== 'introductoryPreview' && currentSection !== 'mainBodyPreview' && currentSection !== 'closingPreview' && currentSection !== 'preview' && currentSection !== 'extras' && currentSection !== 'security' && currentSection !== 'quizSetup' && currentSection !== 'quizPreview' && currentSection !== 'dateSetup' && currentSection !== 'datePreview' && (
              <LetterProgressIndicator
                currentSection={currentSection}
                onSectionClick={handleSectionClick}
              />
            )}

            <AnimatePresence mode="wait" initial={false}>
              {currentSection === 'security' && (
                <SecuritySelector
                  key="security-section"
                  onSelect={handleSecuritySelect}
                />
              )}
              {currentSection === 'quizSetup' && (
                <QuizSetup
                  key="quiz-setup"
                  onComplete={handleQuizSetupComplete}
                  onBack={handleBackSection}
                />
              )}
              {currentSection === 'quizPreview' && (
                <QuizPreview
                  key="quiz-preview"
                  question={securityConfig?.question}
                  questionType={securityConfig?.questionType}
                  options={securityConfig?.options}
                  correctAnswer={securityConfig?.correctAnswer}
                  onConfirm={handleSecurityPreviewConfirm}
                  onBack={handleBackSection}
                />
              )}
              {currentSection === 'dateSetup' && (
                <DateSetup
                  key="date-setup"
                  onComplete={handleDateSetupComplete}
                  onBack={handleBackSection}
                />
              )}
              {currentSection === 'datePreview' && (
                <DatePreview
                  key="date-preview"
                  question={securityConfig?.question}
                  correctDate={securityConfig?.correctDate}
                  onConfirm={handleSecurityPreviewConfirm}
                  onBack={handleBackSection}
                />
              )}
              {currentSection === 'introductory' && !showPreview && (
                <LetterIntroductory
                  key="introductory-section"
                  introductory={introductory}
                  onChange={setIntroductory}
                  receiverName={receiverName}
                  onNext={handleNextSection}
                  canProceed={introductory.trim().length > 0}
                  onFocus={handleTypingStart}
                  onBlur={handleTypingEnd}
                  onBack={handleBackSection}
                />
              )}
              {currentSection === 'introductoryPreview' && (
                <IntroductoryPreviewSelector
                  key="introductory-preview-section"
                  introductory={introductory}
                  receiverName={receiverName}
                  onSelect={handleIntroductoryStyleSelect}
                  onBack={handleBackSection}
                />
              )}
              {currentSection === 'mainBody' && !showPreview && (
                <LetterMainBody
                  key="mainbody-section"
                  mainBody={mainBody}
                  onChange={setMainBody}
                  onBack={handleBackSection}
                  onNext={handleNextSection}
                  canProceed={mainBody.trim().length > 0}
                  writingPrompts={writingPrompts}
                  onFocus={handleTypingStart}
                  onBlur={handleTypingEnd}
                />
              )}
              {currentSection === 'mainBodyPreview' && (
                <MainBodyPreviewSelector
                  key="mainbody-preview-section"
                  mainBody={mainBody}
                  receiverName={receiverName}
                  userFirstName={userFirstName}
                  onSelect={handleMainBodyStyleSelect}
                />
              )}
              {currentSection === 'closing' && !showPreview && (
                <LetterClosing
                  key="closing-section"
                  closing={closing}
                  onChange={setClosing}
                  onBack={handleBackSection}
                  onPreview={handleNextSection}
                  canProceed={closing.trim().length > 0}
                  onFocus={handleTypingStart}
                  onBlur={handleTypingEnd}
                />
              )}
              {currentSection === 'closingPreview' && (
                <ClosingPreviewSelector
                  key="closing-preview-section"
                  closing={closing}
                  receiverName={receiverName}
                  onSelect={handleClosingStyleSelect}
                />
              )}
              {currentSection === 'extras' && (
                <ExtrasSelection
                  key={`extras-section-${extrasRefreshTrigger}`}
                  selectedMusic={selectedMusic}
                  onMusicSelect={setSelectedMusic}
                  selectedLetterMusic={selectedLetterMusic}
                  onLetterMusicSelect={setSelectedLetterMusic}
                  selectedDashboardMusic={selectedDashboardMusic}
                  onDashboardMusicSelect={setSelectedDashboardMusic}
                  onContinue={handleGenerateLink}
                  onBack={() => {
                    setCurrentSection('preview');
                    setShowPreview(true);
                  }}
                  onDateSetup={() => {
                    setDateInvitationToEdit(null);
                    setShowDatePlanning(true);
                  }}
                  onDateEdit={(invitation) => {
                    setDateInvitationToEdit(invitation);
                    setShowDatePlanning(true);
                  }}
                  onGameSetup={() => {
                    setGameToEdit(null);
                    setShowGameCreation(true);
                  }}
                  onGameEdit={(game) => {
                    setGameToEdit(game);
                    setShowGames(true);
                  }}
                  refreshTrigger={extrasRefreshTrigger}
                />
              )}
              {currentSection === 'preview' && showPreview && (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0, scale: 0.96, y: 30 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ 
                    opacity: 0,
                    pointerEvents: "none",
                    transition: { duration: 0.08, ease: "easeIn" } 
                  }}
                  transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                  style={{ willChange: 'opacity, transform' }}
                  className="flex flex-col h-full"
                >
                  {/* Header */}
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-center mb-2 md:mb-3 flex-shrink-0 px-2"
                  >
                    <div className="text-2xl md:text-3xl mb-1">📄</div>
                    <h2 className="text-xl md:text-3xl font-serif text-white mb-1">
                      Letter Preview
                    </h2>
                    <p className="text-gray-300 text-xs md:text-sm font-serif italic">
                      Review your complete letter before sending
                    </p>
                  </motion.div>

                  {/* Preview Content - Combined Animations */}
                  <div className="flex-grow min-h-0 overflow-hidden">
                    <CombinedLetterPreview
                      introductory={introductory}
                      mainBody={mainBody}
                      closing={closing}
                      receiverName={receiverName}
                      userFirstName={userFirstName}
                      introductoryStyle={introductoryStyle}
                      mainBodyStyle={mainBodyStyle}
                      closingStyle={closingStyle}
                    />
                  </div>

                  {/* Preview Actions */}
                  <div className="flex flex-col items-center gap-2 md:gap-3 justify-center flex-shrink-0 mt-2 md:mt-3 pb-2 md:pb-0">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setCurrentSection('extras');
                        setShowPreview(false);
                      }}
                      disabled={!mainBody.trim()}
                      className="w-full md:w-auto relative px-6 py-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-lg font-serif font-semibold text-sm shadow-lg transition-all overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                        animate={{
                          x: ["-100%", "200%"],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          repeatDelay: 5,
                          ease: "easeInOut",
                        }}
                      />
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        ✨ Continue to Extras
                      </span>
                    </motion.button>
                    
                    {/* Back Button - Mobile Only */}
                    <motion.button
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setShowPreview(false);
                        setCurrentSection('closing');
                      }}
                      className="md:hidden w-full px-5 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-lg font-serif text-sm shadow-lg transition-all border border-white/20"
                    >
                      ← Back
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
        </>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        onConfirm={handleConfirmGenerate}
        onCancel={() => setShowConfirmModal(false)}
        isLoading={isGenerating}
      />
    </div>
  );
}
