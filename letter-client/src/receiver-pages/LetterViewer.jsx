// LetterViewer.jsx - View a letter from a shareable link
import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Quiz from "../components/Quiz";
import DateUnlock from "../components/DateUnlock";
import IntroductoryPreviewV1 from "../components/IntroductoryPreviewV1";
import IntroductoryPreviewV2 from "../components/IntroductoryPreviewV2";
import IntroductoryPreviewV3 from "../components/IntroductoryPreviewV3";
import MainBodyPreviewV1 from "../components/MainBodyPreviewV1";
import MainBodyPreviewV3 from "../components/MainBodyPreviewV3";
import ClosingPreviewV1 from "../components/ClosingPreviewV1";
import ClosingPreviewV2 from "../components/ClosingPreviewV2";
import ClosingPreviewV3 from "../components/ClosingPreviewV3";
import ReactionModal from "../components/ReactionModal";
import OptionsPage from "./OptionsPage";
import WritingInterface from "./WritingInterface";
import PDFDownloadProgress from "./PDFDownloadProgress";
import ViewAllLetters from "./ViewAllLetters";
import VoiceMessage from "./VoiceMessage";
import DateInvitation from "./DateInvitation";
import GameSelection from "../components/GameSelection";
import MemoryMatch from "../components/MemoryMatch";
import LoveQuizPlayer from "../components/LoveQuizPlayer";
import MessageModal from "../components/MessageModal";
import AccountCreationModal from "../components/AccountCreationModal";
import ViewWriteBackResponses from "./ViewWriteBackResponses";
import { useAuth } from "../contexts/AuthContext";

export default function LetterViewer() {
  const [letter, setLetter] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stage, setStage] = useState('security'); // 'security', 'introductory', 'mainBody', 'closing', 'complete'
  const [userId, setUserId] = useState(null);
  const [letterId, setLetterId] = useState(null);
  const [token, setToken] = useState(null); // Store the original token separately
  const [hasFetchedLetter, setHasFetchedLetter] = useState(false); // Track if letter has been fetched
  const [showReactionModal, setShowReactionModal] = useState(false);
  const [isSavingReaction, setIsSavingReaction] = useState(false);
  const [hasSubmittedReaction, setHasSubmittedReaction] = useState(false);
  const [showOptionsPage, setShowOptionsPage] = useState(false);
  const [showWritingInterface, setShowWritingInterface] = useState(false);
  const [showViewWriteBackResponses, setShowViewWriteBackResponses] = useState(false);
  const [showPDFDownload, setShowPDFDownload] = useState(false);
  const [showViewAllLetters, setShowViewAllLetters] = useState(false);
  const [showVoiceMessage, setShowVoiceMessage] = useState(false);
  const [showDateInvitation, setShowDateInvitation] = useState(false);
  const [showGameSelection, setShowGameSelection] = useState(false);
  const [showMemoryMatch, setShowMemoryMatch] = useState(false);
  const [showLoveQuiz, setShowLoveQuiz] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [availableQuizzes, setAvailableQuizzes] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageModalData, setMessageModalData] = useState({ title: '', message: '', type: 'info' });
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [showVolumeReminder, setShowVolumeReminder] = useState(false); // Show volume reminder on security page after animations
  const [animationsComplete, setAnimationsComplete] = useState(false); // Track if security page animations are complete
  const audioRef = useRef(null); // Reference to background music audio element
  const viewerStateRestoredRef = useRef(false);
  const VIEWER_STATE_KEY_PREFIX = "letterViewerState_";
  const [senderName, setSenderName] = useState(""); // Sender's first name for PDF (from logged in user)
  const [receiverName, setReceiverName] = useState(""); // Receiver's first name for PDF (from database)
  const [showAccountModal, setShowAccountModal] = useState(false); // Show account creation modal
  const [fromOptionsPage, setFromOptionsPage] = useState(false); // Track if letter was opened from OptionsPage
  const [hasUserInteracted, setHasUserInteracted] = useState(false); // Track if user has interacted (for autoplay)
  const { currentUser } = useAuth(); // Get current logged in user

  // Restore viewer state from session storage (if available)
  useEffect(() => {
    if (!token || viewerStateRestoredRef.current) return;
    try {
      const savedState = sessionStorage.getItem(`${VIEWER_STATE_KEY_PREFIX}${token}`);
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        if (parsedState.stage) setStage(parsedState.stage);
        if (typeof parsedState.showOptionsPage === "boolean") setShowOptionsPage(parsedState.showOptionsPage);
        if (typeof parsedState.showWritingInterface === "boolean") setShowWritingInterface(parsedState.showWritingInterface);
        if (typeof parsedState.showViewWriteBackResponses === "boolean") setShowViewWriteBackResponses(parsedState.showViewWriteBackResponses);
        if (typeof parsedState.showPDFDownload === "boolean") setShowPDFDownload(parsedState.showPDFDownload);
        if (typeof parsedState.showViewAllLetters === "boolean") setShowViewAllLetters(parsedState.showViewAllLetters);
        if (typeof parsedState.showVoiceMessage === "boolean") setShowVoiceMessage(parsedState.showVoiceMessage);
        if (typeof parsedState.showDateInvitation === "boolean") setShowDateInvitation(parsedState.showDateInvitation);
        if (typeof parsedState.showGameSelection === "boolean") setShowGameSelection(parsedState.showGameSelection);
        if (typeof parsedState.showMemoryMatch === "boolean") setShowMemoryMatch(parsedState.showMemoryMatch);
        if (typeof parsedState.showLoveQuiz === "boolean") setShowLoveQuiz(parsedState.showLoveQuiz);
      }
    } catch (error) {
      console.error("❌ Error restoring viewer state:", error);
    } finally {
      viewerStateRestoredRef.current = true;
    }
  }, [token]);

  // Persist viewer state to session storage
  useEffect(() => {
    if (!token) return;
    try {
      const stateToPersist = {
        stage,
        showOptionsPage,
        showWritingInterface,
        showViewWriteBackResponses,
        showPDFDownload,
        showViewAllLetters,
        showVoiceMessage,
        showDateInvitation,
        showGameSelection,
        showMemoryMatch,
        showLoveQuiz,
      };
      sessionStorage.setItem(`${VIEWER_STATE_KEY_PREFIX}${token}`, JSON.stringify(stateToPersist));
    } catch (error) {
      console.error("❌ Error saving viewer state:", error);
    }
  }, [token, stage, showOptionsPage, showWritingInterface, showViewWriteBackResponses, showPDFDownload, showViewAllLetters, showVoiceMessage, showDateInvitation, showGameSelection, showMemoryMatch, showLoveQuiz]);

  // Fetch available quizzes when userId is available
  useEffect(() => {
    if (!userId) return;

    const fetchQuizzes = async () => {
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
        const response = await fetch(`${backendUrl}/api/quizzes/${userId}`);
        if (response.ok) {
          const data = await response.json();
          setAvailableQuizzes(data.quizzes || []);
        }
      } catch (error) {
        console.error('Error fetching quizzes:', error);
      }
    };

    fetchQuizzes();
  }, [userId]);

  // Parse URL to get token (token-based access only)
  useEffect(() => {
    const path = window.location.pathname;
    const pathParts = path.split('/').filter(Boolean);
    
    console.log('🔍 LetterViewer: Parsing URL:', { 
      path, 
      pathParts, 
      pathPartsLength: pathParts.length,
      firstPart: pathParts[0],
      secondPart: pathParts[1],
      secondPartLength: pathParts[1]?.length,
      is64Hex: pathParts[1] ? /^[a-f0-9]{64}$/i.test(pathParts[1]) : false
    });
    
    // Only support token-based URL: /letter/{token} (64 hex characters)
    if (pathParts.length === 2 && pathParts[0] === 'letter') {
      const token = pathParts[1];
      console.log('🔍 LetterViewer: Extracted token:', { 
        token, 
        length: token.length, 
        isValid: /^[a-f0-9]{64}$/i.test(token),
        firstChars: token.substring(0, 10) + '...'
      });
      
      if (/^[a-f0-9]{64}$/i.test(token)) {
        // Token-based access (secure)
        setToken(token); // Store original token
        setUserId(token); // Store token in userId state temporarily (will be replaced with actual userId after fetch)
        setLetterId(null); // Will be fetched from token
        console.log('✅ LetterViewer: Token validated, setting userId to token');
      } else {
        console.error('❌ LetterViewer: Invalid token format:', { 
          token, 
          length: token.length, 
          expected: '64 hex characters',
          actual: `"${token}"`
        });
        setError(`Invalid token format. Token must be 64 hexadecimal characters. Received: ${token.length} characters. Token: ${token.substring(0, 20)}...`);
        setIsLoading(false);
      }
    } else {
      console.error('❌ LetterViewer: Invalid URL format:', { path, pathParts });
      setError("Invalid link format. Expected: /letter/{token}. Legacy URLs are no longer supported for security.");
      setIsLoading(false);
    }
    
    // Check for preview mode from query parameter
    const urlParams = new URLSearchParams(window.location.search);
    const isPreview = urlParams.get('preview') === 'true';
    setIsPreviewMode(isPreview);
    
    // Check if letter was opened from OptionsPage
    const fromOptionsPageParam = urlParams.get('fromOptionsPage') === 'true';
    setFromOptionsPage(fromOptionsPageParam);
  }, []);

  // Fetch letter data
  useEffect(() => {
    const fetchLetter = async () => {
      // Only fetch if we have a token and haven't fetched yet
      if (!token || hasFetchedLetter) {
        console.log('🔍 LetterViewer: fetchLetter - Skipping (no token or already fetched):', { token: !!token, hasFetchedLetter });
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        // Check preview mode from URL
        const urlParams = new URLSearchParams(window.location.search);
        const isPreview = urlParams.get('preview') === 'true';
        
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
        
        // Validate token format (only check the original token, not userId which might be updated)
        console.log('🔍 LetterViewer: fetchLetter - validating token:', { 
          token, 
          length: token?.length, 
          isValid: token ? /^[a-f0-9]{64}$/i.test(token) : false 
        });
        
        if (!/^[a-f0-9]{64}$/i.test(token)) {
          console.error('❌ LetterViewer: fetchLetter - Invalid token format:', { token, length: token?.length });
          setError("Invalid token format. Token must be 64 hexadecimal characters.");
          setIsLoading(false);
          return;
        }
        
        // Token-based access (secure) - use the original token
        const tokenUrl = `${backendUrl}/api/letters/token/${token}`;
        console.log('🔍 LetterViewer: fetchLetter - Fetching letter from:', tokenUrl);
        const response = await fetch(tokenUrl);

        console.log('🔍 LetterViewer: fetchLetter - Response status:', response.status, response.statusText);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ LetterViewer: fetchLetter - Error response:', { 
            status: response.status, 
            statusText: response.statusText,
            errorText 
          });
          
          if (response.status === 404) {
            throw new Error("Letter not found. The link may be invalid or the letter may have been deleted.");
          }
          if (response.status === 410) {
            throw new Error("Link has been revoked or expired. The letter owner may have regenerated the link.");
          }
          throw new Error(`Failed to load letter: ${response.status} - ${errorText}`);
        }

        const letterData = await response.json();
        console.log('✅ LetterViewer: fetchLetter - Letter data received:', { 
          hasUserId: !!letterData.userId, 
          userId: letterData.userId,
          hasId: !!letterData.id,
          id: letterData.id
        });
        console.log('📦 LetterViewer: Received letter data:', { 
          hasUserId: !!letterData.userId, 
          userId: letterData.userId, 
          hasId: !!letterData.id, 
          id: letterData.id,
          token: userId // original token
        });
        setLetter(letterData);
        
        // Extract actual userId and letterId from response
        const actualUserId = letterData.userId || userId;
        const actualLetterId = letterData.id || letterId;
        
        console.log('📦 LetterViewer: Extracted IDs:', { 
          actualUserId, 
          actualLetterId, 
          userIdFromResponse: letterData.userId,
          fallbackToToken: !letterData.userId 
        });
        
        // Update state with actual IDs (token was stored in userId temporarily)
        console.log('📦 LetterViewer: Setting state with:', { actualUserId, actualLetterId });
        setUserId(actualUserId);
        setLetterId(actualLetterId);
        setHasFetchedLetter(true); // Mark that we've fetched the letter
        
        // Log after state update (React batches updates, so this might show old values)
        setTimeout(() => {
          console.log('📦 LetterViewer: State after update (checking via ref/closure):', { 
            actualUserId, 
            actualLetterId 
          });
        }, 0);
        
        // Fetch sender's first name (currently logged in user)
        try {
          const userResponse = await fetch(`${backendUrl}/api/auth/user/${actualUserId}`);
          if (userResponse.ok) {
            const userResult = await userResponse.json();
            if (userResult.success && userResult.data?.firstName) {
              // Extract first name only
              const firstName = userResult.data.firstName.trim().split(/\s+/)[0];
              setSenderName(firstName);
            }
          }
        } catch (err) {
          console.warn('Could not fetch sender name:', err);
        }
        
        // Fetch receiver's first name from database
        try {
          const receiverResponse = await fetch(`${backendUrl}/api/receiver-data/${actualUserId}`);
          if (receiverResponse.ok) {
            const receiverResult = await receiverResponse.json();
            if (receiverResult.success && receiverResult.data?.name) {
              // Extract first name only
              const firstName = receiverResult.data.name.trim().split(/\s+/)[0];
              setReceiverName(firstName);
            }
          }
        } catch (err) {
          console.warn('Could not fetch receiver name:', err);
          // Fallback to letter.receiverName if available
          if (letterData.receiverName) {
            const firstName = letterData.receiverName.trim().split(/\s+/)[0];
            setReceiverName(firstName);
          }
        }
        
        // Check if reaction already exists (only set if not in preview mode)
        if (letterData.reaction && !isPreview) {
          setHasSubmittedReaction(true);
        }
        
        // Create notification when user reaches security page (if letter has security)
        // Only create once per session to prevent duplicate notifications on refresh
        if (letterData.securityType && !isPreview && actualUserId) {
          const notificationKey = `security_notified_${actualLetterId}`;
          const hasNotifiedThisSession = sessionStorage.getItem(notificationKey);
          
          if (!hasNotifiedThisSession) {
            try {
              const notificationResponse = await fetch(`${backendUrl}/api/notifications/${actualUserId}/create`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  type: 'letter_security_access',
                  letterId: actualLetterId,
                  letterTitle: letterData.introductory || 'Your Letter',
                  message: `Someone is trying to access your letter "${letterData.introductory || 'Untitled Letter'}" 🔐`,
                  receiverName: receiverName || 'Your loved one',
                }),
              });
              if (notificationResponse.ok) {
                console.log('✅ Notification created for security page access');
                sessionStorage.setItem(notificationKey, 'true'); // Mark as created to prevent duplicates
              }
            } catch (err) {
              console.error('Error creating security access notification:', err);
            }
          }
        }
        
        // If there's no security, go directly to introductory stage to start music
        if (!letterData.securityType) {
          setStage('introductory');
        }
        
      } catch (err) {
        console.error('Error fetching letter:', err);
        setError(err.message || "Failed to load letter. Please check the link and try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLetter();
  }, [token, hasFetchedLetter]); // Use token instead of userId to prevent re-fetching after userId is updated

  // Memoize stars to prevent re-renders
  const stars = useMemo(() => {
    return Array.from({ length: 100 }, (_, i) => {
      const size = Math.random() < 0.7 ? 1 : Math.random() < 0.9 ? 2 : 3;
      const delay = Math.random() * 5;
      const duration = 3 + Math.random() * 4;
      const left = Math.random() * 100;
      const top = Math.random() * 100;
      return { i, size, delay, duration, left, top };
    });
  }, []);

  // Memoize hearts to prevent re-renders
  const hearts = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => {
      const left = 10 + Math.random() * 80;
      const top = 10 + Math.random() * 80;
      const fontSize = 12 + Math.random() * 20;
      const duration = 4 + Math.random() * 3;
      const delay = Math.random() * 2;
      return { i, left, top, fontSize, duration, delay };
    });
  }, []);

  // Start background music after security unlock or when stage becomes introductory
  const startBackgroundMusic = useCallback(async () => {
    // Stop any existing music first
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      // Revoke object URL if it was cached
      if (audioRef.current.src && audioRef.current.src.startsWith('blob:')) {
        URL.revokeObjectURL(audioRef.current.src);
      }
      audioRef.current = null;
    }

    // Check if letter has letter music (prefer letterMusic over selectedMusic for backward compatibility)
    const letterMusic = letter?.letterMusic || letter?.selectedMusic;
    console.log('🎵 startBackgroundMusic called:', { 
      hasLetter: !!letter, 
      letterMusic: letter?.letterMusic, 
      selectedMusic: letter?.selectedMusic,
      resolvedMusic: letterMusic,
      isNotEmpty: letterMusic && letterMusic.trim() !== ''
    });
    
    if (letterMusic && letterMusic.trim() !== '') {
      try {
        console.log('🎵 Loading background music from:', letterMusic);
        // Import audio cache utility
        const { getAudioWithCache } = await import('../utils/audioCache');
        
        // Get audio URL from cache or fetch and cache it
        const audioUrl = await getAudioWithCache(letterMusic);
        
        if (!audioUrl) {
          console.warn('❌ Failed to load audio URL');
          return;
        }

        console.log('🎵 Audio URL loaded, creating Audio element');
        const audio = new Audio(audioUrl);
        audio.loop = true;
        audio.volume = 0.5; // Set volume to 50%
        
        // Track if audio plays successfully to mark audio interaction
        audio.addEventListener('playing', () => {
          console.log('✅ Background music started playing');
          localStorage.setItem('hasAudioInteraction', 'true');
        }, { once: true });
        
        // Add error listeners for debugging
        audio.addEventListener('error', (e) => {
          console.error('❌ Audio element error:', e, {
            error: audio.error,
            code: audio.error?.code,
            message: audio.error?.message,
            src: audio.src
          });
        });
        
        // Play music with error handling
        try {
          await audio.play();
          console.log('✅ Background music play() called successfully');
        } catch (playError) {
          console.warn('⚠️ Failed to play background music:', playError);
        }
        
        audioRef.current = audio;
      } catch (error) {
        console.error('❌ Error loading background music:', error);
        // Fallback: Try direct URL if cache fails
        try {
          console.log('🎵 Trying fallback: direct URL');
          const audio = new Audio(letterMusic);
          audio.loop = true;
          audio.volume = 0.5;
          audio.addEventListener('error', (e) => {
            console.error('❌ Fallback audio element error:', e, {
              error: audio.error,
              code: audio.error?.code,
              message: audio.error?.message
            });
          });
          audio.play().catch(err => {
            console.warn('⚠️ Failed to play background music (fallback):', err);
          });
          audioRef.current = audio;
        } catch (fallbackError) {
          console.error('❌ Error loading background music (fallback):', fallbackError);
        }
      }
    } else {
      console.log('ℹ️ No background music configured for this letter');
    }
  }, [letter?.letterMusic, letter?.selectedMusic]);

  // Stop background music
  const stopBackgroundMusic = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      // Revoke object URL if it was cached (blob URL)
      if (audioRef.current.src && audioRef.current.src.startsWith('blob:')) {
        URL.revokeObjectURL(audioRef.current.src);
      }
      audioRef.current = null;
    }
  }, []);

  // Cleanup music on unmount
  useEffect(() => {
    return () => {
      stopBackgroundMusic();
    };
  }, [stopBackgroundMusic]);

  // Handle user interaction for autoplay when there's no security
  useEffect(() => {
    if (!letter || (!letter.letterMusic && !letter.selectedMusic)) return;
    if (letter.securityType) return; // Skip if there's security (handled by handleSecurityUnlock)
    if (stage !== 'introductory') return;

    const letterMusic = letter?.letterMusic || letter?.selectedMusic;
    if (!letterMusic || letterMusic.trim() === '') return;

    const handleFirstInteraction = (event) => {
      console.log('🎵 First user interaction detected (no security) - starting music');
      startBackgroundMusic();
      // Remove listeners after first interaction
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };

    // Listen for any user interaction to start music (required for autoplay)
    window.addEventListener('click', handleFirstInteraction, { once: true, passive: true });
    window.addEventListener('touchstart', handleFirstInteraction, { once: true, passive: true });
    window.addEventListener('keydown', handleFirstInteraction, { once: true });

    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };
  }, [stage, letter, startBackgroundMusic]);

  // Handle music playback when stage changes
  useEffect(() => {
    // Note: Music starting is now handled by:
    // 1. handleSecurityUnlock() - for letters with security (direct user interaction)
    // 2. First interaction listener above - for letters without security
    // This effect only handles stopping music when navigating away
    
    // Hide volume reminder when stage changes to introductory (music will start via interaction)
    if (stage === 'introductory') {
      const letterMusic = letter?.letterMusic || letter?.selectedMusic;
      if (letterMusic && letterMusic.trim() !== '') {
        setShowVolumeReminder(false);
      }
    }
    
    // Stop music when navigating to options page or other overlays
    if (showOptionsPage || showWritingInterface || showPDFDownload) {
      console.log('🎵 Stopping background music (overlay shown)');
      stopBackgroundMusic();
    }
  }, [stage, letter?.letterMusic, letter?.selectedMusic, showOptionsPage, showWritingInterface, showPDFDownload, stopBackgroundMusic]);

  // Check if user has interacted with audio before (indicator that volume awareness exists)
  const checkVolumeStatus = useCallback(() => {
    // Check if user has previously interacted with audio on this site
    // If they have, we can assume they're aware of volume settings
    const hasAudioInteraction = localStorage.getItem('hasAudioInteraction');
    return hasAudioInteraction === 'true';
  }, []);

  // Handle security page animations and volume check
  useEffect(() => {
    // Only proceed if on security stage AND letter has selected music (not null, undefined, or empty string)
    const letterMusic = letter?.letterMusic || letter?.selectedMusic;
    const hasSelectedMusic = letterMusic && 
                             letterMusic.trim() !== '' && 
                             letterMusic !== null;
    
    if (stage === 'security' && hasSelectedMusic) {
      setAnimationsComplete(false);
      setShowVolumeReminder(false);
      
      // Wait for security page animations to complete (3.5 seconds for question/content fade-in)
      // Add extra 500ms buffer for smooth transition
      const animationTimer = setTimeout(() => {
        setAnimationsComplete(true);
        
        // After animations, check if user has audio interaction history
        // If they've interacted with audio before, assume volume awareness and don't show reminder
        const hasAudioHistory = checkVolumeStatus();
        
        // Only show reminder if user hasn't interacted with audio before
        if (!hasAudioHistory) {
          setShowVolumeReminder(true);
        }
      }, 4000); // Wait 4 seconds for all animations to complete
      
      return () => {
        clearTimeout(animationTimer);
      };
    } else {
      // If no music selected or not on security stage, hide reminder
      setAnimationsComplete(false);
      setShowVolumeReminder(false);
    }
  }, [stage, letter?.letterMusic, letter?.selectedMusic, checkVolumeStatus]);

  // Mark audio interaction when music successfully starts playing
  useEffect(() => {
    if (audioRef.current) {
      const handlePlay = () => {
        // Mark that user has interacted with audio (volume is likely set up)
        localStorage.setItem('hasAudioInteraction', 'true');
      };
      
      audioRef.current.addEventListener('play', handlePlay);
      
      return () => {
        if (audioRef.current) {
          audioRef.current.removeEventListener('play', handlePlay);
        }
      };
    }
  }, [audioRef.current]);

  // Handle security unlock
  const handleSecurityUnlock = () => {
    console.log('🔓 Security unlocked - starting music');
    setStage('introductory');
    // Start music immediately after user interaction (unlock) to allow autoplay
    // This works because the unlock is a user interaction, so browser allows audio playback
    setTimeout(() => {
      const letterMusic = letter?.letterMusic || letter?.selectedMusic;
      if (letterMusic && letterMusic.trim() !== '') {
        console.log('🎵 Starting music after security unlock (user interaction)');
        startBackgroundMusic();
      } else {
        console.log('ℹ️ No music to play after unlock');
      }
    }, 200); // Small delay to ensure stage is updated
  };

  // Create notification when letter is reread
  const createRereadNotification = async () => {
    if (!userId || !letterId || isPreviewMode || !letter) return;
    
    // Only create notification if letter was already read before
    if (letter.status === 'read') {
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
        const notificationResponse = await fetch(`${backendUrl}/api/notifications/${userId}/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'letter_reread',
            letterId: letterId,
            letterTitle: letter.introductory || 'Your Letter',
            message: `Your letter "${letter.introductory || 'Untitled Letter'}" is being read again! 💌`,
            receiverName: receiverName || 'Your loved one',
          }),
        });
        if (notificationResponse.ok) {
          console.log('✅ Notification created for letter reread');
        }
      } catch (err) {
        console.error('Error creating reread notification:', err);
      }
    }
  };

  // Handle section completion
  const handleSectionComplete = () => {
    if (stage === 'introductory') {
      setStage('mainBody');
    } else if (stage === 'mainBody') {
      setStage('closing');
    } else if (stage === 'closing') {
      // Show reaction modal first (only if not already submitted, or if in preview mode)
      if (!hasSubmittedReaction || isPreviewMode) {
        setShowReactionModal(true);
      } else {
        // If already submitted and not in preview mode, go directly to complete
        setStage('complete');
      }
    }
  };

  // Handle reaction submission
  const handleReactionSubmit = async (reactionData) => {
    if (!userId || !letterId) return;

    setIsSavingReaction(true);
    try {
      // Only save reaction if NOT in preview mode
      if (!isPreviewMode) {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
        const response = await fetch(`${backendUrl}/api/letters/${userId}/${letterId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            reaction: reactionData,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to save reaction');
        }

        // Only mark as submitted if not in preview mode
        setHasSubmittedReaction(true);
      }

      setShowReactionModal(false);
      // Go directly to complete stage
      setStage('complete');
    } catch (error) {
      console.error('Error saving reaction:', error);
      // Still close modal and proceed even if save fails
      if (!isPreviewMode) {
        setHasSubmittedReaction(true);
      }
      setShowReactionModal(false);
      setStage('complete');
    } finally {
      setIsSavingReaction(false);
    }
  };

  const handleReactionCancel = () => {
    setShowReactionModal(false);
    // Go directly to complete stage
    setStage('complete');
  };

  // Handle replay - bypass security and go to introductory
  // In preview mode, reset reaction state so survey can show again
  const handleReplay = () => {
    if (isPreviewMode) {
      // Reset reaction state in preview mode so survey can appear again
      setHasSubmittedReaction(false);
    }
    setStage('introductory');
    // Create notification for reread
    createRereadNotification();
  };

  // Track when stage changes to 'introductory' to detect rereads
  useEffect(() => {
    if (stage === 'introductory' && letter && letter.status === 'read' && !isPreviewMode && userId && letterId) {
      // Check if this is a reread (not the first time reading)
      // We'll use sessionStorage to track if we've already notified for this session
      const hasNotifiedThisSession = sessionStorage.getItem(`reread_notified_${letterId}`);
      if (!hasNotifiedThisSession) {
        createRereadNotification();
        sessionStorage.setItem(`reread_notified_${letterId}`, 'true');
      }
    }
  }, [stage, letter, letterId, isPreviewMode, userId]);

  // Handle continue to dashboard
  const handleContinueToDashboard = () => {
    stopBackgroundMusic(); // Stop music before showing options page
    setShowOptionsPage(true);
  };


  // Map styles to components
  const introductoryComponents = {
    1: IntroductoryPreviewV1,
    2: IntroductoryPreviewV2,
    3: IntroductoryPreviewV3,
  };

  const mainBodyComponents = {
    1: MainBodyPreviewV1,
    3: MainBodyPreviewV3,
  };

  const closingComponents = {
    1: ClosingPreviewV1,
    2: ClosingPreviewV2,
    3: ClosingPreviewV3,
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="h-screen w-full relative overflow-hidden flex items-center justify-center">
        {/* Animated Background */}
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
        <div className="relative z-10 text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="text-6xl mb-4"
          >
            💌
          </motion.div>
          <p className="text-white font-serif text-xl">Loading your letter...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !letter) {
    return (
      <div className="h-screen w-full relative overflow-hidden flex items-center justify-center">
        {/* Animated Background */}
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
        <div className="relative z-10 text-center max-w-md mx-auto px-4">
          <div className="text-6xl mb-4">😔</div>
          <h2 className="text-2xl font-serif text-white mb-2">Letter Not Found</h2>
          <p className="text-gray-300 font-serif">{error || "The letter you're looking for doesn't exist."}</p>
        </div>
      </div>
    );
  }

  const IntroductoryComponent = introductoryComponents[letter.introductoryStyle || 1] || IntroductoryPreviewV1;
  const MainBodyComponent = mainBodyComponents[letter.mainBodyStyle || 1] || MainBodyPreviewV1;
  const ClosingComponent = closingComponents[letter.closingStyle || 1] || ClosingPreviewV1;

  return (
    <div className="h-screen w-full relative overflow-hidden">
      {/* Animated Background */}
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

      {/* Stars Background - Memoized to prevent re-renders */}
      {stars.map((star) => (
        <motion.div
          key={`star-${star.i}`}
          className="absolute bg-white rounded-full pointer-events-none"
          style={{
            left: `${star.left}%`,
            top: `${star.top}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            boxShadow: star.size > 1 ? `0 0 ${star.size * 2}px rgba(255, 255, 255, 0.8)` : 'none',
            willChange: 'opacity, transform',
          }}
          animate={{
            opacity: [0.2, 1, 0.2],
            scale: [0.8, 1.3, 0.8],
          }}
          transition={{
            duration: star.duration,
            repeat: Infinity,
            delay: star.delay,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Floating Hearts - Memoized to prevent re-renders */}
      {hearts.map((heart) => (
        <motion.div
          key={`heart-${heart.i}`}
          className="absolute text-pink-300/40 pointer-events-none"
          style={{
            left: `${heart.left}%`,
            top: `${heart.top}%`,
            fontSize: `${heart.fontSize}px`,
            willChange: 'transform, opacity',
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.3, 0.6, 0.3],
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            duration: heart.duration,
            repeat: Infinity,
            delay: heart.delay,
            ease: "easeInOut",
          }}
        >
          💕
        </motion.div>
      ))}

      {/* Soft Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/10 to-transparent pointer-events-none" />

      {/* Volume Reminder Popup - Only show on security stage if letter has music and animations are complete */}
      <AnimatePresence>
        {stage === 'security' && 
         letter && 
         ((letter.letterMusic && letter.letterMusic.trim() !== '') || (letter.selectedMusic && letter.selectedMusic.trim() !== '')) &&
         animationsComplete && 
         showVolumeReminder && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: 20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: -20, x: 20 }}
            transition={{ duration: 0.3 }}
            className="fixed top-4 right-4 z-50 max-w-sm"
          >
            <motion.div
              className="bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border-2 border-pink-300/50 p-4 relative"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              {/* Close Button */}
              <button
                onClick={() => setShowVolumeReminder(false)}
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close volume reminder"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Content */}
              <div className="flex items-start gap-3 pr-6">
                {/* Music Icon */}
                <motion.div
                  animate={{ 
                    rotate: [0, 10, -10, 0],
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    repeatDelay: 1 
                  }}
                  className="text-3xl flex-shrink-0"
                >
                  🎵
                </motion.div>

                {/* Text */}
                <div className="flex-1">
                  <h3 className="text-sm font-serif font-bold text-gray-800 mb-1">
                    Turn Up Your Volume
                  </h3>
                  <p className="text-xs font-serif text-gray-600 leading-relaxed">
                    Make sure your volume is on! A beautiful musical background will play once you unlock this letter.
                  </p>
                </div>
              </div>

              {/* Bottom Border Animation */}
              <motion.div
                className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-400 via-purple-400 to-pink-400 rounded-b-xl"
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear",
                }}
                style={{
                  backgroundSize: "200% 100%",
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="relative z-10 w-full h-full">
        <AnimatePresence mode="wait">
          {/* Security Stage */}
          {stage === 'security' && letter.securityType && letter.securityConfig && (
            <motion.div
              key="security"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full w-full flex items-center justify-center p-2 md:p-4"
            >
              {letter.securityType === 'quiz' ? (
                (() => {
                  console.log('🔐 LetterViewer: Rendering Quiz component with:', { userId, letterId, hasLetter: !!letter });
                  return (
                    <Quiz
                      question={letter.securityConfig.question || ""}
                      questionType={letter.securityConfig.questionType || "multipleChoice"}
                      options={letter.securityConfig.options || []}
                      letterId={letterId}
                      userId={userId}
                      onUnlock={handleSecurityUnlock}
                      onCancel={() => {
                        // Can't cancel - this is a required step
                      }}
                    />
                  );
                })()
              ) : letter.securityType === 'date' ? (
                <DateUnlock
                  question={letter.securityConfig.question || ""}
                  letterId={letterId}
                  userId={userId}
                  onUnlock={handleSecurityUnlock}
                  onCancel={() => {
                    // Can't cancel - this is a required step
                  }}
                />
              ) : null}
            </motion.div>
          )}

          {/* Introductory Stage */}
          {stage === 'introductory' && letter.introductory && (
            <motion.div
              key="introductory"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full w-full relative"
            >
              <IntroductoryComponent
                introductory={letter.introductory}
                receiverName={letter.receiverName || ""}
                userFirstName={letter.receiverName ? letter.receiverName.split(' ')[0] : ""}
              />
              {/* Continue Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2 }}
                className="absolute bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:right-8 z-20 w-full md:w-auto px-4 md:px-0 flex justify-center md:justify-end"
              >
                <motion.button
                  onClick={handleSectionComplete}
                  className="px-6 md:px-8 py-2.5 md:py-3 bg-pink-500/20 backdrop-blur-md border border-pink-300/30 rounded-full text-white font-serif text-base md:text-lg hover:bg-pink-500/30 transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Continue →
                </motion.button>
              </motion.div>
            </motion.div>
          )}

          {/* Main Body Stage */}
          {stage === 'mainBody' && letter.mainBody && (
            <motion.div
              key="mainBody"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full w-full relative"
            >
              <MainBodyComponent
                mainBody={letter.mainBody}
                receiverName={letter.receiverName || ""}
                userFirstName={letter.receiverName ? letter.receiverName.split(' ')[0] : ""}
                autoLoop={false}
              />
              {/* Continue Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 8 }}
                className="absolute bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:right-8 z-20 w-full md:w-auto px-4 md:px-0 flex justify-center md:justify-end"
              >
                <motion.button
                  onClick={handleSectionComplete}
                  className="px-6 md:px-8 py-2.5 md:py-3 bg-pink-500/20 backdrop-blur-md border border-pink-300/30 rounded-full text-white font-serif text-base md:text-lg hover:bg-pink-500/30 transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Continue →
                </motion.button>
              </motion.div>
            </motion.div>
          )}

          {/* Closing Stage */}
          {stage === 'closing' && letter.closing && (
            <motion.div
              key="closing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full w-full relative"
            >
              <ClosingComponent
                closing={letter.closing}
                receiverName={letter.receiverName || ""}
              />
              {/* Continue Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 4 }}
                className="absolute bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:right-8 z-20 w-full md:w-auto px-4 md:px-0 flex justify-center md:justify-end"
              >
                <motion.button
                  onClick={handleSectionComplete}
                  className="px-6 md:px-8 py-2.5 md:py-3 bg-pink-500/20 backdrop-blur-md border border-pink-300/30 rounded-full text-white font-serif text-base md:text-lg hover:bg-pink-500/30 transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Continue →
                </motion.button>
              </motion.div>
            </motion.div>
          )}

          {/* View All Letters */}
          {showViewAllLetters && !showOptionsPage && !showVoiceMessage && (
            <motion.div
              key="viewAllLetters"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full w-full absolute inset-0 z-40"
            >
              <ViewAllLetters
                userId={userId}
                fromOptionsPage={true}
                onBack={() => {
                  setShowViewAllLetters(false);
                  setShowOptionsPage(true);
                }}
                onViewLetter={(letter) => {
                  // Navigate to the letter - only token-based URLs are supported
                  const baseUrl = window.location.origin;
                  let letterUrl = null;
                  
                  // Check if letter has accessToken (required)
                  if (letter.accessToken && /^[a-f0-9]{64}$/i.test(letter.accessToken)) {
                    letterUrl = `${baseUrl}/letter/${letter.accessToken}`;
                  } else if (letter.shareableLink) {
                    // Check if shareableLink is token-based
                    const tokenMatch = letter.shareableLink.match(/\/letter\/([a-f0-9]{64})$/);
                    if (tokenMatch) {
                      letterUrl = letter.shareableLink;
                    }
                  }
                  
                  if (!letterUrl) {
                    console.error('Letter does not have a valid access token. Legacy URLs are no longer supported.', letter);
                    alert('This letter cannot be accessed. It may need to be regenerated with a secure token.');
                    return;
                  }
                  
                  if (isPreviewMode) {
                    letterUrl += '?preview=true';
                  }
                  
                  window.location.href = letterUrl;
                }}
              />
            </motion.div>
          )}

          {/* Voice Message */}
          {/* Date Invitation */}
          {showDateInvitation && (
            <motion.div
              key="dateInvitation"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full w-full absolute inset-0 z-40"
            >
              <DateInvitation
                onBack={() => {
                  setShowDateInvitation(false);
                  setShowOptionsPage(true);
                }}
              />
            </motion.div>
          )}

          {showVoiceMessage && !showOptionsPage && !showViewAllLetters && (
            <motion.div
              key="voiceMessage"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full w-full absolute inset-0 z-40"
            >
              <VoiceMessage
                userId={userId}
                letterId={letterId}
                receiverName={letter?.receiverName || ""}
                onBack={() => {
                  setShowVoiceMessage(false);
                  setShowOptionsPage(true);
                }}
              />
            </motion.div>
          )}

          {/* Game Selection */}
          {showGameSelection && !showMemoryMatch && !showLoveQuiz && (
            <motion.div
              key="gameSelection"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full w-full absolute inset-0 z-40"
            >
              <GameSelection
                userId={userId}
                onSelectGame={(gameId) => {
                  setSelectedGame(gameId);
                  setShowGameSelection(false);
                  if (gameId === 'memory-match') {
                    setShowMemoryMatch(true);
                  } else if (gameId === 'love-quiz') {
                    if (availableQuizzes.length === 0) {
                      setMessageModalData({
                        title: 'No Quizzes Available',
                        message: 'No quizzes available. Please ask your loved one to create one!',
                        type: 'info',
                      });
                      setShowMessageModal(true);
                      setShowGameSelection(true);
                    } else {
                      // Randomly select a quiz from available quizzes
                      const randomIndex = Math.floor(Math.random() * availableQuizzes.length);
                      const randomQuiz = availableQuizzes[randomIndex];
                      setSelectedQuiz(randomQuiz);
                      setShowLoveQuiz(true);
                    }
                  }
                }}
                onBack={() => {
                  setShowGameSelection(false);
                  setShowOptionsPage(true);
                }}
              />
            </motion.div>
          )}

          {/* Memory Match Game */}
          {showMemoryMatch && (
            <motion.div
              key="memoryMatch"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full w-full absolute inset-0 z-40"
            >
              <MemoryMatch
                userId={userId}
                letterId={letterId}
                game={selectedGame}
                onBack={() => {
                  setShowMemoryMatch(false);
                  setShowOptionsPage(true);
                  // Trigger games refresh with delay to ensure backend has updated
                  setTimeout(() => {
                    if (window.dispatchEvent) {
                      window.dispatchEvent(new CustomEvent('refreshGames'));
                    }
                  }, 1000);
                }}
                onPrizeWon={(score) => {
                  // Handle prize won - could show a notification or special message
                  console.log(`🎁 Prize won with score: ${score}`);
                  // Trigger games refresh with delay to ensure backend has updated
                  setTimeout(() => {
                    if (window.dispatchEvent) {
                      window.dispatchEvent(new CustomEvent('refreshGames'));
                    }
                  }, 1000);
                }}
              />
            </motion.div>
          )}

          {/* Love Quiz Player */}
          {showLoveQuiz && selectedQuiz && (
            <motion.div
              key="loveQuiz"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full w-full absolute inset-0 z-40"
            >
              <LoveQuizPlayer
                quiz={selectedQuiz}
                userId={userId}
                letterId={letterId}
                gameId={selectedQuiz?.id}
                onBack={() => {
                  setShowLoveQuiz(false);
                  setShowOptionsPage(true);
                  // Trigger games refresh with delay to ensure backend has updated
                  setTimeout(() => {
                    if (window.dispatchEvent) {
                      window.dispatchEvent(new CustomEvent('refreshGames'));
                    }
                  }, 1000);
                }}
                onComplete={(result) => {
                  console.log('Quiz completed:', result);
                  // Trigger games refresh with delay to ensure backend has updated
                  setTimeout(() => {
                    if (window.dispatchEvent) {
                      window.dispatchEvent(new CustomEvent('refreshGames'));
                    }
                  }, 1000);
                }}
              />
            </motion.div>
          )}

          {/* View Write Back Responses */}
          {showViewWriteBackResponses && letter && (letter.userId || userId) && (
            <motion.div
              key="viewWriteBackResponses"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full w-full absolute inset-0 z-40"
            >
              <ViewWriteBackResponses
                onBack={() => {
                  setShowViewWriteBackResponses(false);
                  setShowOptionsPage(true);
                }}
                onWriteNew={() => {
                  setShowViewWriteBackResponses(false);
                  setShowWritingInterface(true);
                  // Store that we came from ViewWriteBackResponses so we can return there
                  setFromOptionsPage(true); // Reuse this flag to track origin
                }}
                userId={(() => {
                  // Ensure we use the sender's userId (not the token)
                  const senderUserId = letter?.userId || userId;
                  // Check if userId looks like a token (64 hex characters)
                  if (userId && /^[a-f0-9]{64}$/i.test(userId) && letter?.userId) {
                    console.log('⚠️ LetterViewer: userId looks like a token, using letter.userId instead:', letter.userId);
                    return letter.userId;
                  }
                  console.log('📦 LetterViewer: Passing userId to ViewWriteBackResponses:', senderUserId, { 
                    fromLetter: !!letter?.userId, 
                    fromState: !!userId,
                    letterUserId: letter?.userId 
                  });
                  return senderUserId;
                })()}
                receiverEmail={letter?.receiverEmail || currentUser?.email}
                receiverName={letter?.receiverName}
              />
            </motion.div>
          )}

          {/* Options Page */}
          {showOptionsPage && !showWritingInterface && !showViewWriteBackResponses && !showPDFDownload && !showViewAllLetters && !showVoiceMessage && !showDateInvitation && !showGameSelection && !showMemoryMatch && (
            <motion.div
              key="optionsPage"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full w-full absolute inset-0 z-30"
            >
              <OptionsPage
                letterContent={letter ? `${letter.introductory || ''}\n\n${letter.mainBody || ''}\n\n${letter.closing || ''}` : ''}
                receiverName={letter?.receiverName || ""}
                onWriteLetter={() => {
                  setShowOptionsPage(false);
                  setShowViewWriteBackResponses(true);
                }}
                onDateInvitation={() => {
                  setShowOptionsPage(false);
                  setShowDateInvitation(true);
                }}
                onViewAllLetters={() => {
                  setShowOptionsPage(false);
                  setShowViewAllLetters(true);
                }}
                onVoiceMessage={() => {
                  setShowOptionsPage(false);
                  setShowVoiceMessage(true);
                }}
                onPlayGame={(game) => {
                  setShowOptionsPage(false);
                  if (game && game.id) {
                    // Directly start the game if a game object is provided
                    if (game.type === 'quiz') {
                      setSelectedQuiz(game);
                      setShowLoveQuiz(true);
                    } else if (game.type === 'memory-match') {
                      setSelectedGame(game);
                      setShowMemoryMatch(true);
                    }
                  } else {
                    // Fallback to game selection if no game provided
                    setShowGameSelection(true);
                  }
                }}
                userId={userId}
                letterId={letterId}
                dashboardMusic={letter?.dashboardMusic || []}
                onDownloadPDF={() => {
                  setShowOptionsPage(false);
                  setShowPDFDownload(true);
                }}
                onBack={undefined}
                token={token}
                receiverEmail={letter?.receiverEmail || ''}
                senderUserId={userId}
              />
            </motion.div>
          )}

          {/* Complete Stage */}
          {stage === 'complete' && !showOptionsPage && !showWritingInterface && !showViewWriteBackResponses && !showPDFDownload && !showViewAllLetters && !showVoiceMessage && !showDateInvitation && !showGameSelection && !showMemoryMatch && !showLoveQuiz && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="h-full w-full flex items-center justify-center p-4"
            >
              <div className="text-center max-w-2xl mx-auto">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="text-6xl mb-6"
                >
                  💌
                </motion.div>
                <h2 className="text-3xl font-serif text-white mb-4">
                  You've reached the end
                </h2>
                <p className="text-gray-300 font-serif text-lg mb-4">
                  Thank you for reading this letter with your heart.
                </p>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-pink-200 font-serif text-base md:text-lg italic mb-8"
                >
                  Explore the dashboard to discover more heartfelt experiences and connect in beautiful ways.
                </motion.p>
                
                {/* Action Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                >
                  {/* Replay Button */}
                  <motion.button
                    whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(236, 72, 153, 0.4)" }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleReplay}
                    className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-pink-500 via-rose-500 to-pink-500 text-white rounded-full font-serif text-lg shadow-lg overflow-hidden group"
                  >
                    <span className="relative z-10 flex items-center gap-2 justify-center">
                      <motion.span
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        🔄
                      </motion.span>
                      Replay
                    </span>
                  </motion.button>

                  {/* Continue to Dashboard Button - Hide if opened from OptionsPage */}
                  {!fromOptionsPage && (
                    <motion.button
                      whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(139, 92, 246, 0.4)" }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleContinueToDashboard}
                      className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-500 text-white rounded-full font-serif text-lg shadow-lg hover:shadow-xl transition-all"
                    >
                      Continue to Dashboard
                    </motion.button>
                  )}

                  {/* Create Account Button - Only show if not logged in */}
                  {!currentUser && (
                    <motion.button
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(34, 197, 94, 0.4)" }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowAccountModal(true)}
                      className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-green-500 via-emerald-500 to-green-500 text-white rounded-full font-serif text-lg shadow-lg hover:shadow-xl transition-all"
                    >
                      <span className="flex items-center gap-2">
                        ✨ Create Account
                      </span>
                    </motion.button>
                  )}
                </motion.div>

                {/* Account Creation Prompt - Subtle message */}
                {!currentUser && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="text-gray-400 font-serif text-sm mt-4"
                  >
                    Create a free account to save this letter and write back easily 💌
                  </motion.p>
                )}
              </div>
            </motion.div>
          )}

          {/* Writing Interface */}
          {showWritingInterface && (
            <motion.div
              key="writingInterface"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full w-full absolute inset-0 z-40"
            >
              <WritingInterface
                letterId={letterId}
                userId={(() => {
                  // Use the same logic as ViewWriteBackResponses to ensure consistency
                  const senderUserId = letter?.userId || userId;
                  // Check if userId looks like a token (64 hex characters)
                  if (userId && /^[a-f0-9]{64}$/i.test(userId) && letter?.userId) {
                    console.log('⚠️ LetterViewer: WritingInterface - userId looks like a token, using letter.userId:', letter.userId);
                    return letter.userId;
                  }
                  console.log('📝 LetterViewer: WritingInterface - Using userId:', senderUserId, { 
                    fromLetter: !!letter?.userId, 
                    fromState: !!userId 
                  });
                  return senderUserId;
                })()}
                receiverName={letter?.receiverName || ""}
                onComplete={() => {
                  setShowWritingInterface(false);
                  // If we came from ViewWriteBackResponses, return there and refresh
                  if (fromOptionsPage) {
                    setFromOptionsPage(false);
                    // Trigger refresh event
                    window.dispatchEvent(new CustomEvent('refreshWriteBackResponses'));
                    // Show ViewWriteBackResponses
                    setShowViewWriteBackResponses(true);
                  } else {
                    setShowOptionsPage(true);
                  }
                }}
                onBack={() => {
                  setShowWritingInterface(false);
                  // If we came from ViewWriteBackResponses, return there
                  if (fromOptionsPage) {
                    setFromOptionsPage(false);
                    setShowViewWriteBackResponses(true);
                  } else {
                    setShowOptionsPage(true);
                  }
                }}
              />
            </motion.div>
          )}

          {/* PDF Download Progress */}
          {showPDFDownload && letter && (
            <motion.div
              key="pdfDownload"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full w-full absolute inset-0 z-40"
            >
              <PDFDownloadProgress
                letterContent={letter.mainBody || ''}
                recipientName={receiverName}
                senderName={senderName}
                userId={userId}
                letterId={letterId}
                onBack={() => {
                  setShowPDFDownload(false);
                  setShowOptionsPage(true);
                }}
                onComplete={() => {
                  setShowPDFDownload(false);
                  setShowOptionsPage(true);
                }}
              />
            </motion.div>
          )}

          {/* Reaction Modal */}
          <ReactionModal
            isOpen={showReactionModal}
            onSubmit={handleReactionSubmit}
            onCancel={handleReactionCancel}
            isLoading={isSavingReaction}
          />


          {/* No Security - Go directly to letter */}
          {stage === 'security' && !letter.securityType && (
            <motion.div
              key="no-security"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-full w-full relative"
            >
              {letter.introductory ? (
                <>
                  <IntroductoryComponent
                    introductory={letter.introductory}
                    receiverName={letter.receiverName || ""}
                    userFirstName={letter.receiverName ? letter.receiverName.split(' ')[0] : ""}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 2 }}
                    className="absolute bottom-8 right-8 z-20"
                  >
                    <motion.button
                      onClick={() => setStage('mainBody')}
                      className="px-8 py-3 bg-pink-500/20 backdrop-blur-md border border-pink-300/30 rounded-full text-white font-serif text-lg hover:bg-pink-500/30 transition-all"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Continue →
                    </motion.button>
                  </motion.div>
                </>
              ) : letter.mainBody ? (
                <>
                  <MainBodyComponent
                    mainBody={letter.mainBody}
                    receiverName={letter.receiverName || ""}
                    userFirstName={letter.receiverName ? letter.receiverName.split(' ')[0] : ""}
                    autoLoop={false}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 3 }}
                    className="absolute bottom-8 right-8 z-20"
                  >
                    <motion.button
                      onClick={() => setStage('closing')}
                      className="px-8 py-3 bg-pink-500/20 backdrop-blur-md border border-pink-300/30 rounded-full text-white font-serif text-lg hover:bg-pink-500/30 transition-all"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Continue →
                    </motion.button>
                  </motion.div>
                </>
              ) : letter.closing ? (
                <>
                  <ClosingComponent
                    closing={letter.closing}
                    receiverName={letter.receiverName || ""}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 2 }}
                    className="absolute bottom-8 right-8 z-20"
                  >
                    <motion.button
                      onClick={() => setStage('complete')}
                      className="px-8 py-3 bg-pink-500/20 backdrop-blur-md border border-pink-300/30 rounded-full text-white font-serif text-lg hover:bg-pink-500/30 transition-all"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Continue →
                    </motion.button>
                  </motion.div>
                </>
              ) : null}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Message Modal */}
      <MessageModal
        isOpen={showMessageModal}
        onClose={() => setShowMessageModal(false)}
        title={messageModalData.title}
        message={messageModalData.message}
        type={messageModalData.type}
      />

      {/* Account Creation Modal */}
      <AccountCreationModal
        isOpen={showAccountModal}
        onClose={() => setShowAccountModal(false)}
        onSuccess={async (userData) => {
          console.log('✅ Account created successfully:', userData);
          setShowAccountModal(false);
          
          // Show success message
          setMessageModalData({
            title: 'Account Created!',
            message: 'Your account has been created! Check your email to verify and then sign in to continue.',
            type: 'success'
          });
          setShowMessageModal(true);
          
          // Refresh page after a moment to check auth state
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        }}
        receiverEmail={letter?.receiverEmail || ''}
        letterId={letterId}
        token={token}
        senderUserId={userId}
      />
    </div>
  );
}

