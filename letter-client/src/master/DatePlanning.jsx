// DatePlanning.jsx - Create and manage date invitations (sender view)
import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import MessageModal from "../components/MessageModal.jsx";
import ConfirmationModal from "../components/ConfirmationModal.jsx";

const initialForm = {
  date: "",
  time: "",
  location: "",
  googleMapsUrl: "",
  message: "",
};

// Background Animation Components
const AnimatedBackground = () => {
  const hearts = useMemo(() => 
    Array.from({ length: 15 }, (_, i) => ({
      i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      fontSize: 20 + Math.random() * 40,
      duration: 8 + Math.random() * 4,
      delay: Math.random() * 2,
      xOffset: Math.random() * 50 - 25,
    })), []
  );

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {hearts.map((heart) => (
        <motion.div
          key={`heart-${heart.i}`}
          className="absolute text-pink-300/20"
          style={{
            left: `${heart.left}%`,
            top: `${heart.top}%`,
            fontSize: `${heart.fontSize}px`,
          }}
          animate={{
            y: [0, -100, 0],
            x: [0, heart.xOffset, 0],
            opacity: [0.1, 0.4, 0.1],
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
    </div>
  );
};

const FormBackground = () => {
  const floatingHearts = useMemo(() => 
    Array.from({ length: 15 }, (_, i) => ({
      i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      fontSize: 20 + Math.random() * 40,
      duration: 8 + Math.random() * 4,
      delay: Math.random() * 2,
      xOffset: Math.random() * 50 - 25,
    })), []
  );

  const floatingStars = useMemo(() => 
    Array.from({ length: 30 }, (_, i) => ({
      i,
      size: Math.random() < 0.7 ? 2 : Math.random() < 0.9 ? 3 : 4,
      left: Math.random() * 100,
      top: Math.random() * 100,
      duration: 3 + Math.random() * 3,
      delay: Math.random() * 2,
    })), []
  );

  const gradientBlobs = useMemo(() => 
    Array.from({ length: 4 }, (_, i) => ({
      i,
      width: 200 + Math.random() * 300,
      height: 200 + Math.random() * 300,
      left: Math.random() * 100,
      top: Math.random() * 100,
      duration: 20 + Math.random() * 10,
      delay: Math.random() * 5,
      isEven: i % 2 === 0,
    })), []
  );

  const sparkles = useMemo(() => 
    Array.from({ length: 20 }, (_, i) => ({
      i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      duration: 2 + Math.random() * 2,
      delay: Math.random() * 3,
    })), []
  );

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {floatingHearts.map((heart) => (
        <motion.div
          key={`heart-${heart.i}`}
          className="absolute text-pink-300/20"
          style={{
            left: `${heart.left}%`,
            top: `${heart.top}%`,
            fontSize: `${heart.fontSize}px`,
          }}
          animate={{
            y: [0, -100, 0],
            x: [0, heart.xOffset, 0],
            opacity: [0.1, 0.4, 0.1],
            rotate: [0, 360],
            scale: [1, 1.2, 1],
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

      {floatingStars.map((star) => (
        <motion.div
          key={`star-${star.i}`}
          className="absolute bg-pink-300/30 rounded-full"
          style={{
            left: `${star.left}%`,
            top: `${star.top}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            boxShadow: `0 0 ${star.size * 3}px rgba(244, 63, 94, 0.5)`,
          }}
          animate={{
            opacity: [0.2, 1, 0.2],
            scale: [0.8, 1.5, 0.8],
            y: [0, -50, 0],
          }}
          transition={{
            duration: star.duration,
            repeat: Infinity,
            delay: star.delay,
            ease: "easeInOut",
          }}
        />
      ))}

      {gradientBlobs.map((blob) => (
        <motion.div
          key={`blob-${blob.i}`}
          className="absolute rounded-full blur-3xl opacity-20"
          style={{
            width: `${blob.width}px`,
            height: `${blob.height}px`,
            background: blob.isEven
              ? 'linear-gradient(135deg, rgba(244, 63, 94, 0.4), rgba(236, 72, 153, 0.4))'
              : 'linear-gradient(135deg, rgba(168, 85, 247, 0.4), rgba(217, 70, 239, 0.4))',
            left: `${blob.left}%`,
            top: `${blob.top}%`,
          }}
          animate={{
            x: [0, 100, -100, 0],
            y: [0, -100, 100, 0],
            scale: [1, 1.3, 0.8, 1],
          }}
          transition={{
            duration: blob.duration,
            repeat: Infinity,
            delay: blob.delay,
            ease: "easeInOut",
          }}
        />
      ))}

      {sparkles.map((sparkle) => (
        <motion.div
          key={`sparkle-${sparkle.i}`}
          className="absolute"
          style={{
            left: `${sparkle.left}%`,
            top: `${sparkle.top}%`,
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: sparkle.duration,
            repeat: Infinity,
            delay: sparkle.delay,
            ease: "easeInOut",
          }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-pink-400">
            <path d="M6 0L7.5 4.5L12 6L7.5 7.5L6 12L4.5 7.5L0 6L4.5 4.5L6 0Z" fill="currentColor" opacity="0.6" />
          </svg>
        </motion.div>
      ))}
    </div>
  );
};

// Header Component
const PageHeader = ({ onBack, onPlanDate, hasInvitations }) => (
  <div className="sticky top-0 w-full z-40 overflow-hidden shadow-lg">
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative py-6 md:py-8 lg:py-10 px-4 md:px-8"
    >
      <motion.div
        className="absolute inset-0"
        animate={{
          background: [
            'linear-gradient(135deg, rgb(244, 63, 94) 0%, rgb(236, 72, 153) 50%, rgb(168, 85, 247) 100%)',
            'linear-gradient(135deg, rgb(236, 72, 153) 0%, rgb(168, 85, 247) 50%, rgb(244, 63, 94) 100%)',
            'linear-gradient(135deg, rgb(168, 85, 247) 0%, rgb(244, 63, 94) 50%, rgb(236, 72, 153) 100%)',
          ],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      {[...Array(3)].map((_, i) => (
        <motion.div
          key={`orb-${i}`}
          className="absolute rounded-full blur-3xl opacity-20"
          style={{
            width: `${300 + i * 100}px`,
            height: `${300 + i * 100}px`,
            background: i % 2 === 0
              ? 'radial-gradient(circle, rgba(255, 255, 255, 0.4), rgba(244, 63, 94, 0.3))'
              : 'radial-gradient(circle, rgba(255, 255, 255, 0.4), rgba(168, 85, 247, 0.3))',
          }}
          animate={{
            x: [0, 100, -100, 0],
            y: [0, -100, 100, 0],
            scale: [1, 1.2, 0.8, 1],
          }}
          transition={{
            duration: 15 + i * 3,
            repeat: Infinity,
            delay: i * 2,
            ease: "easeInOut",
          }}
        />
      ))}

      {[...Array(20)].map((_, i) => (
        <motion.div
          key={`sparkle-${i}`}
          className="absolute"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0.8, 1.4, 0.8],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 3,
            ease: "easeInOut",
          }}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="text-white/70">
            <path d="M5 0L6.5 3.5L10 5L6.5 6.5L5 10L3.5 6.5L0 5L3.5 3.5L5 0Z" fill="currentColor" opacity="0.8" />
          </svg>
        </motion.div>
      ))}

        <div className="relative max-w-7xl mx-auto flex items-center justify-between">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onBack}
          className="w-10 h-10 md:w-12 md:h-12 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white shadow-lg flex-shrink-0"
        >
          <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </motion.button>

        <div className="text-center flex-1 px-2">
          <h1 className="text-xl md:text-3xl lg:text-4xl font-serif font-bold text-white drop-shadow mb-1 md:mb-2 flex items-center justify-center gap-2">
            Date Planning
            <motion.span
              animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="inline-block"
            >
              💑
            </motion.span>
          </h1>
          <p className="text-xs md:text-sm text-white/90 font-serif">Create magical invitations and track their responses</p>
        </div>

        <div className="hidden md:flex justify-end">
          {hasInvitations && (
            <button
              onClick={onPlanDate}
              className="px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-full font-serif font-semibold shadow-lg"
            >
              Plan a Date
            </button>
          )}
        </div>
        <div className="w-0 md:w-auto" /> {/* Spacer for mobile */}
      </div>
    </motion.div>
  </div>
);

// Invitation Card Component
const InvitationCard = ({ invitation, formatDate, formatTime, badge, onEdit, onDelete }) => {
  const getMapsUrl = () => {
    // Use saved Google Maps URL if available (most accurate)
    if (invitation.googleMapsUrl && invitation.googleMapsUrl.trim()) {
      return invitation.googleMapsUrl.trim();
    }
    // Fallback: construct from location
    if (!invitation.location) return null;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(invitation.location)}`;
  };

  const mapsUrl = getMapsUrl();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -2 }}
      className="bg-white rounded-xl md:rounded-2xl shadow-lg border border-rose-100 p-4 md:p-6 hover:shadow-xl transition-all"
    >
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 md:gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
            <div className="text-2xl md:text-3xl">💑</div>
            <div className="flex-1">
              <div className="flex items-center justify-between gap-2 mb-1">
                <h4 className="text-lg md:text-xl font-serif text-gray-800">{formatDate(invitation.date)}</h4>
                {/* Badge next to date on mobile, hidden on desktop */}
                <div className="md:hidden">
                  {badge}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm md:text-base text-gray-500 font-serif">
                  {formatTime(invitation.time)} • {invitation.location}
                </p>
                {mapsUrl && (
                  <motion.a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="text-blue-600 hover:text-blue-700 underline text-xs md:text-sm font-serif transition-all flex items-center gap-1"
                    title={`View location on map: ${invitation.location}`}
                  >
                    🗺️ View location on map
                  </motion.a>
                )}
              </div>
            </div>
          </div>
          <p className="text-sm md:text-base text-gray-600 font-serif italic mb-2 md:mb-3">
            "{invitation.message || "No message provided."}"
          </p>
          {invitation.status !== "pending" && invitation.rsvpMessage && (
            <div className="bg-gray-50 rounded-lg md:rounded-xl p-2 md:p-3 border border-gray-100">
              <p className="text-xs md:text-sm font-serif text-gray-500 mb-1">Their message:</p>
              <p className="text-sm md:text-base text-gray-700 font-serif">"{invitation.rsvpMessage}"</p>
            </div>
          )}
        </div>
        <div className="flex flex-col md:items-end gap-2 md:gap-3 items-start md:items-end">
          {/* Badge shown on desktop only (mobile badge is next to date) */}
          <div className="hidden md:block w-auto">
            {badge}
          </div>
          <div className="flex flex-wrap gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onEdit}
              className="px-4 md:px-5 py-2 text-xs md:text-sm bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-full font-serif font-semibold shadow-lg transition-all flex items-center gap-1 md:gap-2"
            >
              <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onDelete}
              className="px-4 md:px-5 py-2 text-xs md:text-sm bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-full font-serif font-semibold shadow-lg transition-all flex items-center gap-1 md:gap-2"
            >
              <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Location Verification Modal Component
const LocationVerificationModal = ({ isOpen, onClose, onGotIt }) => {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col"
      >
        <div className="text-center p-6 pb-4 border-b border-gray-200 flex-shrink-0">
          <div className="text-4xl mb-2">🗺️</div>
          <h3 className="text-xl font-serif font-bold text-gray-800 mb-1">Verify Exact Location</h3>
          <p className="text-sm text-gray-600 font-serif">Follow these steps to get the exact location link</p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-xl flex-shrink-0">1️⃣</div>
            <div className="flex-1 min-w-0">
              <p className="font-serif text-gray-800 font-semibold text-sm mb-1">Pick the exact place</p>
              <p className="text-xs text-gray-600 font-serif">
                If multiple places appear, click the <strong>exact one</strong> you want.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="text-xl flex-shrink-0">2️⃣</div>
            <div className="flex-1 min-w-0">
              <p className="font-serif text-gray-800 font-semibold text-sm mb-1">Share → Copy link</p>
              <p className="text-xs text-gray-600 font-serif">
                Click <strong>"Share"</strong> button, then <strong>"Copy link"</strong> to get the reliable link.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
            <div className="text-xl flex-shrink-0">3️⃣</div>
            <div className="flex-1 min-w-0">
              <p className="font-serif text-gray-800 font-semibold text-sm mb-1">Paste the link</p>
              <p className="text-xs text-gray-600 font-serif">Return here and paste into the "Google Maps URL" field.</p>
            </div>
          </div>

          <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-xs text-gray-600 font-serif">
              💡 <strong>Why Share > Copy link?</strong> It gives you a reliable, permanent link to the exact place, ensuring your date partner finds the right location!
            </p>
          </div>
        </div>

        <div className="flex gap-3 p-6 pt-4 border-t border-gray-200 flex-shrink-0">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full font-serif font-semibold text-sm transition-all"
          >
            Cancel
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onGotIt}
            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-full font-serif font-semibold shadow-lg transition-all flex items-center justify-center gap-2 text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            Got it, open Maps
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Main DatePlanning Component
export default function DatePlanning({ onBack, fromExtras = false, editInvitation = null }) {
  const [invitations, setInvitations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreatePage, setShowCreatePage] = useState(false);
  const [formInvitation, setFormInvitation] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [modal, setModal] = useState({ isOpen: false, message: '', type: 'error' });
  const { currentUser } = useAuth();

  useEffect(() => {
    fetchInvitations();
  }, []);

  // If editInvitation is provided (from extras), open the form with that invitation
  useEffect(() => {
    if (editInvitation && fromExtras) {
      setFormInvitation(editInvitation);
      setShowCreatePage(true);
    }
  }, [editInvitation, fromExtras]);

  const fetchInvitations = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"}/api/date-invitations`
      );
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Failed to load invitations");
      }
      const data = await response.json();
      setInvitations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching invitations:", err);
      setError(err.message || "Failed to load invitations. Please try again later.");
      setInvitations([]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return "";
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "accepted":
        return (
          <span className="inline-block px-2 md:px-3 py-0.5 md:py-1 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full text-xs md:text-sm font-serif whitespace-nowrap">
            Accepted ✓
          </span>
        );
      case "declined":
        return (
          <span className="inline-block px-2 md:px-3 py-0.5 md:py-1 bg-red-50 text-red-600 border border-red-200 rounded-full text-xs md:text-sm font-serif whitespace-nowrap">
            Declined
          </span>
        );
      default:
        return (
          <span className="inline-block px-1.5 md:px-3 py-0.5 md:py-1 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-full text-xs md:text-sm font-serif whitespace-nowrap">
            Pending
          </span>
        );
    }
  };

  const handlePlanDate = () => {
    setFormInvitation(null);
    setShowCreatePage(true);
  };

  const handleEditInvitation = (invitation) => {
    setFormInvitation(invitation);
    setShowCreatePage(true);
  };

  const handleDeleteInvitation = (invitation) => {
    setDeleteTarget(invitation);
  };

  const confirmDeleteInvitation = async () => {
    if (!deleteTarget) return;
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"}/api/date-invitations/${deleteTarget.id}`,
        { method: "DELETE" }
      );
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Failed to delete invitation");
      }
      setInvitations((prev) => prev.filter((inv) => inv.id !== deleteTarget.id));
      setDeleteTarget(null);
      setModal({ isOpen: true, message: "Invitation deleted successfully", type: 'success' });
    } catch (err) {
      console.error("Error deleting invitation:", err);
      setModal({ isOpen: true, message: err.message || "Failed to delete invitation. Please try again.", type: 'error' });
    }
  };

  // Filter invitations based on fromExtras
  const pendingInvitations = fromExtras ? [] : invitations.filter((inv) => inv.status === "pending");
  const respondedInvitations = fromExtras 
    ? invitations.filter((inv) => inv.status !== "pending")
    : invitations.filter((inv) => inv.status !== "pending");

  if (showCreatePage) {
    return (
      <DatePlanningForm
        currentUser={currentUser}
        invitation={formInvitation}
        onBack={() => {
          setShowCreatePage(false);
          setFormInvitation(null);
        }}
        onSaved={() => {
          setShowCreatePage(false);
          setFormInvitation(null);
          fetchInvitations();
          // If came from extras, navigate back
          if (fromExtras && onBack) {
            onBack();
          }
        }}
        fromExtras={fromExtras}
      />
    );
  }

  return (
    <>
      <div className="min-h-screen w-full h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 relative overflow-y-auto overflow-x-hidden">
        <AnimatedBackground />
        <PageHeader onBack={onBack} onPlanDate={handlePlanDate} hasInvitations={invitations.length > 0} />

        <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-10 space-y-6 md:space-y-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 md:p-4 text-center font-serif text-sm md:text-base">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="text-center py-12">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full mx-auto mb-4"
              />
              <p className="text-gray-500 font-serif">Loading invitations...</p>
            </div>
          ) : invitations.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-8 md:py-12 bg-white/60 backdrop-blur-sm rounded-xl md:rounded-2xl border border-rose-100 p-6 md:p-8"
            >
              <div className="text-4xl md:text-6xl mb-3 md:mb-4">💑</div>
              <h3 className="text-xl md:text-2xl font-serif font-bold text-gray-800 mb-2">No planned dates yet</h3>
              <p className="text-sm md:text-base text-gray-600 font-serif mb-4 md:mb-6">Start planning a romantic date to surprise your special someone.</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handlePlanDate}
                className="w-full sm:w-auto px-6 md:px-8 py-2.5 md:py-3 text-sm md:text-base bg-gradient-to-r from-rose-500 via-pink-500 to-rose-500 text-white rounded-full font-serif font-semibold shadow-lg"
              >
                Plan a Date
              </motion.button>
            </motion.div>
          ) : (
            <>
              {pendingInvitations.length > 0 && (
                <section>
                  <h3 className="text-xl md:text-2xl font-serif text-gray-800 mb-3 md:mb-4 flex items-center gap-2">
                    <span>✨</span> Pending Invitations
                  </h3>
                  <div className="space-y-3 md:space-y-4">
                    {pendingInvitations.map((invitation) => (
                      <InvitationCard
                        key={invitation.id}
                        invitation={invitation}
                        formatDate={formatDate}
                        formatTime={formatTime}
                        badge={getStatusBadge(invitation.status)}
                        onEdit={() => handleEditInvitation(invitation)}
                        onDelete={() => handleDeleteInvitation(invitation)}
                      />
                    ))}
                  </div>
                </section>
              )}

              {respondedInvitations.length > 0 && (
                <section>
                  <h3 className="text-xl md:text-2xl font-serif text-gray-800 mb-3 md:mb-4 flex items-center gap-2">
                    <span>💌</span> Responses Received
                  </h3>
                  <div className="space-y-3 md:space-y-4">
                    {respondedInvitations.map((invitation) => (
                      <InvitationCard
                        key={invitation.id}
                        invitation={invitation}
                        formatDate={formatDate}
                        formatTime={formatTime}
                        badge={getStatusBadge(invitation.status)}
                        onEdit={() => handleEditInvitation(invitation)}
                        onDelete={() => handleDeleteInvitation(invitation)}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* Plan a Date button - mobile only, shown when invitations exist, placed after cards */}
              {invitations.length > 0 && (
                <div className="md:hidden mt-6">
                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handlePlanDate}
                    className="w-full px-6 py-3 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-500 text-white rounded-full font-serif font-semibold shadow-lg"
                  >
                    Plan a Date
                  </motion.button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <ConfirmationModal
        isOpen={!!deleteTarget}
        onConfirm={confirmDeleteInvitation}
        onCancel={() => setDeleteTarget(null)}
        isLoading={isLoading}
        icon="⚠️"
        title="Delete Invitation?"
        message={deleteTarget ? `This will permanently remove your invitation for ${formatDate(deleteTarget.date)} at ${formatTime(deleteTarget.time)}.` : ''}
      />

      <MessageModal
        isOpen={modal.isOpen}
        onClose={() => setModal({ isOpen: false, message: '', type: 'error' })}
        message={modal.message}
        type={modal.type}
      />
    </>
  );
}

// Date Planning Form Component
const DatePlanningForm = ({ onBack, onSaved, currentUser, invitation, fromExtras = false }) => {
  const isEditMode = Boolean(invitation);
  const [formData, setFormData] = useState(
    invitation
      ? {
          date: invitation.date,
          time: invitation.time,
          location: invitation.location,
          googleMapsUrl: invitation.googleMapsUrl || "",
          message: invitation.message || "",
        }
      : { ...initialForm }
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modal, setModal] = useState({ isOpen: false, message: '', type: 'error' });
  const [showLocationVerification, setShowLocationVerification] = useState(false);

  useEffect(() => {
    if (invitation) {
      setFormData({
        date: invitation.date,
        time: invitation.time,
        location: invitation.location,
        googleMapsUrl: invitation.googleMapsUrl || "",
        message: invitation.message || "",
      });
    } else {
      setFormData({ ...initialForm });
    }
  }, [invitation]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentUser) {
      setModal({ isOpen: true, message: "You need to be signed in to manage invitations.", type: 'warning' });
      return;
    }

    if (!formData.date || !formData.time || !formData.location.trim()) {
      setModal({ isOpen: true, message: "Please fill in all required fields.", type: 'warning' });
      return;
    }

    if (!formData.googleMapsUrl.trim()) {
      setModal({ isOpen: true, message: "Please provide the Google Maps URL. Click 'Verify' to get the exact location link.", type: 'warning' });
      return;
    }

    // Validate date is not in the past
    const selectedDate = new Date(formData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      setModal({ isOpen: true, message: "Please select a date that is today or in the future.", type: 'warning' });
      return;
    }

    // Validate time is at least 2 hours from now
    const now = new Date();
    const [hours, minutes] = formData.time.split(':');
    const selectedDateTime = new Date(formData.date);
    selectedDateTime.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
    
    // If date is today, check time
    if (selectedDate.getTime() === today.getTime()) {
      const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);
      if (selectedDateTime < twoHoursFromNow) {
        setModal({ isOpen: true, message: "Please select a time that is at least 2 hours from now to give your invitee time to prepare.", type: 'warning' });
        return;
      }
    }

    try {
      setIsSubmitting(true);
      const endpoint = isEditMode
        ? `${import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"}/api/date-invitations/${invitation.id}`
        : `${import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"}/api/date-invitations`;

      const response = await fetch(endpoint, {
        method: isEditMode ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: formData.date,
          time: formData.time,
          location: formData.location.trim(),
          googleMapsUrl: formData.googleMapsUrl.trim() || undefined,
          message: formData.message.trim(),
          ...(isEditMode ? {} : {
            creatorUserId: currentUser.uid,
            creatorName: currentUser.displayName || currentUser.email?.split("@")[0] || "Someone special",
          }),
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Failed to create invitation");
      }

      setFormData(initialForm);
      setModal({
        isOpen: true,
        message: isEditMode ? "Invitation updated successfully! 💕" : "Invitation created successfully! 💕",
        type: 'success',
      });
      setTimeout(() => onSaved(), 1500);
    } catch (err) {
      console.error("Error creating invitation:", err);
      setModal({ isOpen: true, message: err.message || "Failed to create invitation. Please try again.", type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getMapsUrl = (location) => {
    if (!location) return null;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
  };

  const handleOpenMaps = () => {
    if (!formData.location.trim()) {
      setModal({ isOpen: true, message: "Please enter a location first.", type: 'warning' });
      return;
    }
    setShowLocationVerification(true);
  };

  const handleGotItAndOpenMaps = () => {
    setShowLocationVerification(false);
    const mapsUrl = getMapsUrl(formData.location);
    if (mapsUrl) {
      window.open(mapsUrl, '_blank', 'noopener,noreferrer');
    }
    setTimeout(() => {
      const mapsUrlInput = document.getElementById('googleMapsUrl');
      if (mapsUrlInput) mapsUrlInput.focus();
    }, 500);
  };

  return (
    <div className="min-h-screen w-full h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 relative overflow-y-auto overflow-x-hidden">
      <FormBackground />
      
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onBack}
        className="absolute top-4 left-4 z-50 w-12 h-12 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 shadow-lg transition-all"
        aria-label="Go back"
      >
        <svg className="w-6 h-6 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </motion.button>

      <div className="relative z-10 max-w-3xl mx-auto px-4 md:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-8"
        >
          <div className="text-5xl mb-4">💌</div>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-800 mb-2">
            {isEditMode ? "Edit Date Invitation" : "Plan a Romantic Date"}
          </h2>
          <p className="text-gray-600 font-serif text-lg">
            {isEditMode ? "Update the details of this special invitation." : "Craft the perfect invitation to create unforgettable moments."}
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl shadow-2xl border border-rose-100 p-6 md:p-10 space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-serif text-gray-600 mb-1">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-rose-400 focus:border-transparent bg-gray-50"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-serif text-gray-600 mb-1">
                Time <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-rose-400 focus:border-transparent bg-gray-50"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-serif text-gray-600 mb-1">
              Location <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="e.g., Merci, Central Park"
                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-rose-400 focus:border-transparent bg-gray-50"
                required
              />
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleOpenMaps}
                disabled={!formData.location.trim()}
                className="px-4 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl font-serif font-semibold shadow-lg transition-all flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                <span className="hidden sm:inline">Verify</span>
              </motion.button>
            </div>
            <p className="text-xs text-gray-500 font-serif mt-1">
              Enter a search term, then click "Verify" to get the exact location link
            </p>
          </div>

          <div>
            <label className="block text-sm font-serif text-gray-600 mb-1">
              Google Maps URL <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              id="googleMapsUrl"
              name="googleMapsUrl"
              value={formData.googleMapsUrl}
              onChange={handleInputChange}
              placeholder="https://maps.google.com/?cid=..."
              className="w-full px-4 py-3 rounded-xl border-2 border-blue-200 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-blue-50/50 font-mono text-sm"
              required
            />
            <p className="text-xs text-gray-500 font-serif mt-1">
              Click "Verify" to see instructions, then use Share > Copy link from Google Maps
            </p>
            {formData.googleMapsUrl && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 flex items-center gap-2 text-green-600 text-sm font-serif"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Google Maps URL saved!
              </motion.div>
            )}
          </div>

          <div>
            <label className="block text-sm font-serif text-gray-600 mb-1">Message</label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              rows={4}
              placeholder="Add a heartfelt message..."
              className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-rose-400 focus:border-transparent bg-gray-50 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4">
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onBack}
              disabled={isSubmitting}
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full font-serif font-semibold transition-all disabled:opacity-50 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(244, 63, 94, 0.4)" }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-full font-serif font-semibold shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                  />
                  Saving...
                </>
              ) : (
                <>
                  {isEditMode ? (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Save Changes
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Create Invitation
                    </>
                  )}
                </>
              )}
            </motion.button>
          </div>
        </motion.form>

        <MessageModal
          isOpen={modal.isOpen}
          onClose={() => setModal({ isOpen: false, message: '', type: 'error' })}
          message={modal.message}
          type={modal.type}
        />

        <LocationVerificationModal
          isOpen={showLocationVerification}
          onClose={() => setShowLocationVerification(false)}
          onGotIt={handleGotItAndOpenMaps}
        />
      </div>
    </div>
  );
};
