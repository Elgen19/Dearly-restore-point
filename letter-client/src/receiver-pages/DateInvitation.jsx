// DateInvitation.jsx - View and RSVP to date invitations
import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import MessageModal from "../components/MessageModal.jsx";

export default function DateInvitation({ onBack }) {
  const [invitations, setInvitations] = useState([]);
  const [selectedInvitation, setSelectedInvitation] = useState(null);
  const [showRSVPForm, setShowRSVPForm] = useState(false);
  const [rsvpMessage, setRsvpMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState({ isOpen: false, message: '', type: 'success' });
  const [sortBy, setSortBy] = useState('upcoming'); // 'upcoming', 'chronological', 'recent'
  const [timeUntilDates, setTimeUntilDates] = useState({});

  // Fetch invitations from API
  useEffect(() => {
    fetchInvitations();
  }, []);

  const fetchInvitations = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const apiUrl = `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/api/date-invitations`;
      console.log("Fetching invitations from:", apiUrl);
      
      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      // Handle different error status codes
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        if (response.status === 503) {
          setError("Firebase is not configured. Please contact the administrator.");
        } else if (response.status === 404) {
          setError("API endpoint not found. Please check server configuration.");
        } else if (response.status >= 500) {
          setError("Server error. Please try again later.");
        } else {
          setError(errorData.message || "Failed to load invitations. Please try again later.");
        }
        
        console.error("API Error:", response.status, errorData);
        setInvitations([]);
        return;
      }
      
      const data = await response.json();
      console.log("Invitations loaded:", data);
      setInvitations(data || []);
      
      // Clear any previous errors on success
      setError(null);
    } catch (err) {
      console.error("Error fetching invitations:", err);
      
      // Handle network errors
      if (err.name === "TypeError" && err.message.includes("fetch")) {
        setError("Cannot connect to server. Please make sure the server is running on port 5000.");
      } else {
        setError(err.message || "Failed to load invitations. Please try again later.");
      }
      
      // Fallback to empty array if API fails
      setInvitations([]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  // Calculate time until date
  const calculateTimeUntil = (dateString, timeString) => {
    if (!dateString || !timeString) return null;
    
    const [hours, minutes] = timeString.split(":");
    const date = new Date(dateString);
    date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    
    const now = new Date();
    const diff = date - now;
    
    if (diff < 0) return { passed: true, text: "This date has passed" };
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hoursRemaining = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutesRemaining = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) {
      return { passed: false, text: `${days} day${days > 1 ? 's' : ''} away` };
    } else if (hoursRemaining > 0) {
      return { passed: false, text: `${hoursRemaining} hour${hoursRemaining > 1 ? 's' : ''} away` };
    } else {
      return { passed: false, text: `${minutesRemaining} minute${minutesRemaining > 1 ? 's' : ''} away` };
    }
  };

  // Update countdown timers
  useEffect(() => {
    const updateTimers = () => {
      const timers = {};
      invitations.forEach(inv => {
        if (inv.date && inv.time) {
          timers[inv.id] = calculateTimeUntil(inv.date, inv.time);
        }
      });
      setTimeUntilDates(timers);
    };

    updateTimers();
    const interval = setInterval(updateTimers, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [invitations]);

  // Check if date has passed
  const isDatePassed = (dateString, timeString) => {
    if (!dateString || !timeString) return false;
    const [hours, minutes] = timeString.split(":");
    const date = new Date(dateString);
    date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    return date < new Date();
  };

  // Get Google Maps URL - use saved URL if available, otherwise construct from address
  const getMapsUrl = (invitation) => {
    // If a Google Maps URL was saved, use it directly (most accurate)
    if (invitation.googleMapsUrl && invitation.googleMapsUrl.trim()) {
      return invitation.googleMapsUrl.trim();
    }
    // Fallback: use location to construct search URL
    const location = invitation.location;
    if (!location) return null;
    const encodedLocation = encodeURIComponent(location);
    return `https://www.google.com/maps/search/?api=1&query=${encodedLocation}`;
  };

  // Sort invitations
  const getSortedInvitations = (invitationsList) => {
    const sorted = [...invitationsList];
    
    switch (sortBy) {
      case 'upcoming':
        return sorted.sort((a, b) => {
          const dateA = new Date(`${a.date}T${a.time}`);
          const dateB = new Date(`${b.date}T${b.time}`);
          const now = new Date();
          
          const aPassed = dateA < now;
          const bPassed = dateB < now;
          
          if (aPassed && !bPassed) return 1;
          if (!aPassed && bPassed) return -1;
          if (!aPassed && !bPassed) return dateA - dateB;
          return dateB - dateA; // Both passed, show most recent first
        });
      
      case 'chronological':
        return sorted.sort((a, b) => {
          const dateA = new Date(`${a.date}T${a.time}`);
          const dateB = new Date(`${b.date}T${b.time}`);
          return dateA - dateB;
        });
      
      case 'recent':
        return sorted.sort((a, b) => {
          const dateA = new Date(a.createdAt || a.date);
          const dateB = new Date(b.createdAt || b.date);
          return dateB - dateA;
        });
      
      default:
        return sorted;
    }
  };

  const handleRSVP = (invitation, response) => {
    setSelectedInvitation(invitation);
    setShowRSVPForm(true);
    // Populate with previous message if changing RSVP
    setRsvpMessage(invitation.rsvpMessage || "");
  };

  const handleSubmitRSVP = async (response) => {
    if (!selectedInvitation) return;

    setIsSubmitting(true);

    try {
      const apiUrl = `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/api/date-invitations/${selectedInvitation.id}/rsvp`;
      const res = await fetch(apiUrl, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: response,
          rsvpMessage: rsvpMessage.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update RSVP");
      }

      // Update local state
      setInvitations(invitations.map(inv => 
        inv.id === selectedInvitation.id 
          ? { ...inv, status: response, rsvpMessage: rsvpMessage.trim() || undefined }
          : inv
      ));

      setIsSubmitting(false);
      setShowRSVPForm(false);
      setSelectedInvitation(null);
      setRsvpMessage("");
      
      // Show success message
      setModal({
        isOpen: true,
        message: response === "accepted" 
          ? "💕 You've accepted the invitation! Looking forward to seeing you!" 
          : "Thank you for letting me know. Maybe next time! 💕",
        type: 'success',
      });
    } catch (err) {
      console.error("Error submitting RSVP:", err);
      setModal({
        isOpen: true,
        message: `Failed to submit RSVP: ${err.message}`,
        type: 'error',
      });
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "accepted":
        return <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm font-serif">Accepted ✓</span>;
      case "declined":
        return <span className="px-3 py-1 bg-red-500/20 text-red-300 rounded-full text-sm font-serif">Declined</span>;
      default:
        return <span className="px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-sm font-serif">Pending</span>;
    }
  };

  const pendingInvitations = getSortedInvitations(invitations.filter(inv => inv.status === "pending"));
  const respondedInvitations = getSortedInvitations(invitations.filter(inv => inv.status !== "pending"));

  // Memoize background elements to prevent re-renders
  const stars = useMemo(() => {
    return Array.from({ length: 100 }, (_, i) => {
      const rand1 = Math.random();
      const rand2 = Math.random();
      const rand3 = Math.random();
      const rand4 = Math.random();
      const rand5 = Math.random();
      const rand6 = Math.random();
      const size = rand1 < 0.7 ? 1 : rand2 < 0.9 ? 2 : 3;
      return {
        i,
        size,
        left: rand3 * 100,
        top: rand4 * 100,
        delay: rand5 * 5,
        duration: 3 + rand6 * 4,
      };
    });
  }, []);

  const hearts = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => {
      const rand1 = Math.random();
      const rand2 = Math.random();
      const rand3 = Math.random();
      const rand4 = Math.random();
      const rand5 = Math.random();
      return {
        i,
        left: 10 + rand1 * 80,
        top: 10 + rand2 * 80,
        fontSize: 12 + rand3 * 20,
        duration: 4 + rand4 * 3,
        delay: rand5 * 2,
      };
    });
  }, []);

  return (
    <div className="h-screen w-full relative overflow-y-auto">
      {/* Romantic Background */}
      <motion.div
        className="fixed inset-0"
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

      {/* Stars Background - Memoized */}
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

      {/* Floating Hearts - Memoized */}
      {hearts.map((heart) => (
        <motion.div
          key={`heart-${heart.i}`}
          className="fixed text-pink-300/40 pointer-events-none"
          style={{
            left: `${heart.left}%`,
            top: `${heart.top}%`,
            fontSize: `${heart.fontSize}px`,
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

      {/* Back Button - Top Left (Desktop Only) */}
      {onBack && (
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={(e) => {
            e.stopPropagation();
            onBack();
          }}
          className="hidden md:flex absolute top-4 left-4 z-50 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full items-center justify-center border border-white/20 shadow-lg transition-all group"
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

      {/* Main Content */}
      <div className="relative z-10 w-full min-h-screen flex items-center justify-center py-8">
        <div className="w-full max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-white/10 backdrop-blur-md rounded-2xl p-6 md:p-8 shadow-2xl border border-white/20 relative"
          >
            {/* Back Button - Mobile Only (Inside Card) */}
            {onBack && (
              <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onBack();
                }}
                className="md:hidden absolute top-4 left-4 z-10 w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 shadow-lg transition-all group"
                aria-label="Go back"
              >
                <svg
                  className="w-5 h-5 text-white group-hover:text-pink-300 transition-colors"
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
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-6 pt-12 md:pt-0"
          >
            <div className="text-3xl md:text-5xl mb-2 md:mb-3">💑</div>
            <h1 className="text-2xl md:text-4xl font-serif text-white mb-1 md:mb-2">
              Date Invitations
            </h1>
            <p className="text-gray-300 text-sm md:text-lg font-serif italic">
              View your special date invitations
            </p>
          </motion.div>

          {/* Sort Options */}
          {!isLoading && !error && invitations.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mb-4 md:mb-6 flex flex-wrap items-center justify-center gap-2 md:gap-3"
            >
              <span className="text-white/70 font-serif text-xs md:text-sm">Sort by:</span>
              <div className="flex gap-1.5 md:gap-2 flex-wrap">
                {['upcoming', 'chronological', 'recent'].map((option) => (
                  <motion.button
                    key={option}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSortBy(option)}
                    className={`px-3 md:px-4 py-1.5 md:py-2 rounded-full font-serif text-xs md:text-sm transition-all ${
                      sortBy === option
                        ? 'bg-white/30 text-white shadow-lg'
                        : 'bg-white/10 text-white/70 hover:bg-white/20'
                    }`}
                  >
                    {option === 'upcoming' ? '📅 Upcoming First' : 
                     option === 'chronological' ? '📆 Chronological' : 
                     '🕐 Most Recent'}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* RSVP Form Modal */}
          {showRSVPForm && selectedInvitation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => !isSubmitting && setShowRSVPForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#2d1b4e]/95 rounded-2xl md:rounded-3xl p-4 md:p-10 shadow-2xl border border-white/20 max-w-2xl w-full text-white max-h-[90vh] overflow-y-auto"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              <style>{`
                .overflow-y-auto::-webkit-scrollbar {
                  display: none;
                }
              `}</style>
              <div className="flex items-start gap-3 md:gap-4 mb-4 md:mb-6">
                <div className="text-2xl md:text-4xl">💝</div>
                <div className="flex-1">
                  <h2 className="text-xl md:text-3xl font-serif font-semibold mb-1 md:mb-2">
                    {selectedInvitation.status && selectedInvitation.status !== "pending" 
                      ? "Change Your RSVP" 
                      : "RSVP to This Magical Night"}
                  </h2>
                  <p className="text-white/70 font-serif text-sm md:text-base">
                    {selectedInvitation.status && selectedInvitation.status !== "pending"
                      ? "Update your response to this special invitation."
                      : "Let them know how you feel about this special invitation."}
                  </p>
                  {selectedInvitation.status && selectedInvitation.status !== "pending" && (
                    <div className="mt-3">
                      {getStatusBadge(selectedInvitation.status)}
                      {selectedInvitation.rsvpMessage && (
                        <p className="text-white/60 font-serif text-sm mt-2 italic">
                          Previous message: "{selectedInvitation.rsvpMessage}"
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 bg-white/10 border border-white/10 rounded-xl md:rounded-2xl p-3 md:p-4 mb-4 md:mb-6">
                <div>
                  <p className="text-xs md:text-sm text-white/70 font-serif">Date</p>
                  <p className="text-sm md:text-lg font-serif">{formatDate(selectedInvitation.date)}</p>
                </div>
                <div>
                  <p className="text-xs md:text-sm text-white/70 font-serif">Time</p>
                  <p className="text-sm md:text-lg font-serif">{formatTime(selectedInvitation.time)}</p>
                </div>
                <div>
                  <p className="text-xs md:text-sm text-white/70 font-serif">Location</p>
                  <div>
                    <p className="text-sm md:text-lg font-serif">{selectedInvitation.location}</p>
                  </div>
                </div>
              </div>
              <textarea
                value={rsvpMessage}
                onChange={(e) => setRsvpMessage(e.target.value)}
                placeholder="Add a heartfelt note (optional)..."
                rows={3}
                className="w-full px-3 md:px-4 py-2 md:py-3 rounded-xl md:rounded-2xl bg-white/15 border border-white/30 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent font-serif text-sm md:text-base resize-none mb-4 md:mb-5"
                disabled={isSubmitting}
              />
              <div className="space-y-2 md:space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSubmitRSVP("accepted")}
                  disabled={isSubmitting}
                  className="w-full px-5 md:px-6 py-2.5 md:py-3 bg-gradient-to-r from-green-400 via-emerald-500 to-green-600 hover:from-green-500 hover:to-emerald-600 text-white rounded-full font-serif text-sm md:text-base font-semibold shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? "Sending..." : <>Accept & Celebrate 💕</>}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSubmitRSVP("declined")}
                  disabled={isSubmitting}
                  className="w-full px-5 md:px-6 py-2.5 md:py-3 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 hover:from-rose-600 hover:to-pink-600 text-white rounded-full font-serif text-sm md:text-base font-semibold shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? "Sending..." : <>Decline with Love</>}
                </motion.button>
                <button
                  onClick={() => setShowRSVPForm(false)}
                  disabled={isSubmitting}
                  className="w-full text-white/70 hover:text-white font-serif text-xs md:text-sm disabled:opacity-50 mt-2"
                >
                  Not now, maybe later
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

          {/* Pending Invitations */}
          {!isLoading && !error && pendingInvitations.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-serif text-white mb-4">Pending Invitations</h2>
              <div className="space-y-4">
                {pendingInvitations.map((invitation) => (
                  <motion.div
                    key={invitation.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
                  >
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-2xl">💑</span>
                          <div className="flex-1">
                            <h3 className="text-xl font-serif text-white">
                              {formatDate(invitation.date)}
                            </h3>
                            <div>
                              <p className="text-pink-200 font-serif">
                                {formatTime(invitation.time)} • {invitation.location}
                              </p>
                            </div>
                            {/* Countdown Timer */}
                            {timeUntilDates[invitation.id] && (
                              <motion.p
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`text-sm font-serif mt-1 ${
                                  timeUntilDates[invitation.id].passed
                                    ? 'text-gray-400'
                                    : 'text-yellow-300'
                                }`}
                              >
                                ⏰ {timeUntilDates[invitation.id].text}
                              </motion.p>
                            )}
                          </div>
                        </div>
                        {invitation.message && invitation.message.trim() && (
                          <p className="text-white/90 font-serif mb-4 italic">
                            "{invitation.message}"
                          </p>
                        )}
                        <div className="flex items-center gap-3 flex-wrap mb-3">
                          {getStatusBadge(invitation.status)}
                          {/* Map Link */}
                          {invitation.location && (
                            <motion.a
                              href={getMapsUrl(invitation)}
                              target="_blank"
                              rel="noopener noreferrer"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="text-blue-300 hover:text-blue-200 underline text-sm font-serif transition-all flex items-center gap-1"
                              title={`View location on map: ${invitation.location}`}
                            >
                              🗺️ View location on map
                            </motion.a>
                          )}
                        </div>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleRSVP(invitation)}
                        className="px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-lg font-serif font-semibold shadow-lg transition-all"
                      >
                        RSVP
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Responded Invitations */}
          {!isLoading && !error && respondedInvitations.length > 0 && (
            <div>
              <h2 className="text-2xl font-serif text-white mb-4">Previous Invitations</h2>
              <div className="space-y-4">
                {respondedInvitations.map((invitation) => (
                  <motion.div
                    key={invitation.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 opacity-75"
                  >
                    <div className="flex items-start gap-4">
                      <span className="text-2xl">💑</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h3 className="text-xl font-serif text-white">
                            {formatDate(invitation.date)}
                          </h3>
                          {getStatusBadge(invitation.status)}
                          {/* Show if date has passed */}
                          {isDatePassed(invitation.date, invitation.time) && (
                            <span className="px-2 py-1 bg-gray-500/20 text-gray-300 rounded-full text-xs font-serif">
                              Past
                            </span>
                          )}
                        </div>
                        <div className="mb-2">
                          <p className="text-pink-200 font-serif">
                            {formatTime(invitation.time)} • {invitation.location}
                          </p>
                        </div>
                        {invitation.message && invitation.message.trim() && (
                          <p className="text-white/70 font-serif italic mb-2">
                            "{invitation.message}"
                          </p>
                        )}
                        {/* RSVP Message */}
                        {invitation.rsvpMessage && invitation.rsvpMessage.trim() && (
                          <div className="mt-3 p-3 bg-white/5 rounded-lg border border-white/10">
                            <p className="text-xs text-white/60 font-serif mb-1">Your Response:</p>
                            <p className="text-white/80 font-serif italic">
                              "{invitation.rsvpMessage}"
                            </p>
                          </div>
                        )}
                        {/* Map Link and Change RSVP */}
                        <div className="flex items-center gap-3 flex-wrap mt-3">
                          {invitation.location && (
                            <motion.a
                              href={getMapsUrl(invitation)}
                              target="_blank"
                              rel="noopener noreferrer"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="text-blue-300 hover:text-blue-200 underline text-sm font-serif transition-all flex items-center gap-1"
                              title={`View location on map: ${invitation.location}`}
                            >
                              🗺️ View location on map
                            </motion.a>
                          )}
                          {/* Change RSVP button - only show if date hasn't passed */}
                          {!isDatePassed(invitation.date, invitation.time) && (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleRSVP(invitation)}
                              className="px-3 py-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-full text-sm font-serif transition-all"
                            >
                              ✏️ Change RSVP
                            </motion.button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-12">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="text-6xl mb-4 inline-block"
              >
                💕
              </motion.div>
              <p className="text-white/70 font-serif text-lg">
                Loading invitations...
              </p>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">⚠️</div>
              <p className="text-red-300 font-serif text-lg mb-2">
                {error}
              </p>
              <p className="text-gray-400 font-serif text-sm mb-4">
                Check the browser console (F12) for more details
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={fetchInvitations}
                className="px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-lg font-serif font-semibold shadow-lg transition-all"
              >
                Try Again
              </motion.button>
            </div>
          )}

          {/* No Invitations */}
          {!isLoading && !error && invitations.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">💌</div>
              <p className="text-white/70 font-serif text-lg">
                No date invitations yet. Check back soon!
              </p>
            </div>
          )}
          </motion.div>
        </div>
      </div>

      {/* Message Modal */}
      <MessageModal
        isOpen={modal.isOpen}
        onClose={() => setModal({ isOpen: false, message: '', type: 'success' })}
        message={modal.message}
        type={modal.type}
      />
    </div>
  );
}

