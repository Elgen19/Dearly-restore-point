// LinkGeneratedPage.jsx - Beautiful page displaying the generated shareable link
import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function LinkGeneratedPage({ shareableLink, onContinue, receiverEmail, receiverName, letterTitle, letterId, userId }) {
  const [copied, setCopied] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailAddress, setEmailAddress] = useState(receiverEmail || '');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [scheduleEmail, setScheduleEmail] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  // Persistent email status info to display on the page
  const [emailStatus, setEmailStatus] = useState(null); // { isScheduled, sentTo, timestamp, scheduledDateTime }

  // Load existing email status from letter data if available
  useEffect(() => {
    const loadEmailStatus = async () => {
      if (letterId && userId && !emailStatus) {
        try {
          const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
          const response = await fetch(`${backendUrl}/api/letters/${userId}/${letterId}`);
          
          if (response.ok) {
            const letter = await response.json();
            if (letter.emailSentTo) {
              setEmailStatus({
                isScheduled: letter.emailScheduled || false,
                sentTo: letter.emailSentTo,
                timestamp: letter.emailSentAt || letter.updatedAt || new Date().toISOString(),
                scheduledDateTime: letter.scheduledDateTime || null,
              });
            }
          }
        } catch (error) {
          console.error('Error loading email status:', error);
          // Silently fail - not critical
        }
      }
    };

    loadEmailStatus();
  }, [letterId, userId, emailStatus]);

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

  const handleCopy = () => {
    navigator.clipboard.writeText(shareableLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendEmail = async () => {
    if (!emailAddress || !emailAddress.includes('@')) {
      setEmailError('Please enter a valid email address');
      return;
    }

    // Validate scheduled date and time if scheduling is enabled
    if (scheduleEmail) {
      if (!scheduledDate || !scheduledTime) {
        setEmailError('Please select both date and time for scheduling');
        return;
      }
      
      // Check if scheduled date/time is in the future
      const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`);
      const now = new Date();
      if (scheduledDateTime <= now) {
        setEmailError('Scheduled date and time must be in the future');
        return;
      }
    }

    setSendingEmail(true);
    setEmailError('');

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      
      // Prepare request body
      const requestBody = {
        recipientEmail: emailAddress,
        recipientName: receiverName || 'there',
        senderName: 'Someone special',
        shareableLink: shareableLink,
        letterTitle: letterTitle || 'A special letter for you',
      };

      // Add scheduling info if enabled
      if (scheduleEmail && scheduledDate && scheduledTime) {
        requestBody.scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`).toISOString();
      }

      const response = await fetch(`${backendUrl}/api/letter-email/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        // Handle validation errors or other API errors
        let errorMessage = result.error || result.message || 'Failed to send email. Please try again.';
        
        // Provide user-friendly messages for common errors
        if (errorMessage.includes('timeout') || errorMessage.includes('connection')) {
          errorMessage = 'Email service is temporarily unavailable. Please try again later or contact support.';
        } else if (errorMessage.includes('authentication') || errorMessage.includes('EAUTH')) {
          errorMessage = 'Email configuration error. Please contact support.';
        }
        
        setEmailError(errorMessage);
        return;
      }

      if (result.success) {
        setEmailSent(true);
        
        // Store email status information to display on the page
        const statusInfo = {
          isScheduled: scheduleEmail,
          sentTo: emailAddress,
          timestamp: new Date().toISOString(),
          scheduledDateTime: scheduleEmail && scheduledDate && scheduledTime 
            ? new Date(`${scheduledDate}T${scheduledTime}`).toISOString() 
            : null,
        };
        setEmailStatus(statusInfo);
        
        // Update the letter to mark email as sent (or scheduled)
        if (letterId && userId) {
          try {
            const updateResponse = await fetch(`${backendUrl}/api/letters/${userId}/${letterId}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                emailSent: !scheduleEmail, // Only mark as sent if not scheduled
                emailScheduled: scheduleEmail,
                emailSentTo: emailAddress,
                scheduledDateTime: statusInfo.scheduledDateTime,
              }),
            });
            
            if (!updateResponse.ok) {
              const updateResult = await updateResponse.json().catch(() => ({}));
              // If it's a validation error (scheduled date in past), show it to user
              if (updateResponse.status === 400 && updateResult.error) {
                setEmailError(updateResult.error || updateResult.message || 'Failed to update scheduled date/time');
                setSendingEmail(false);
                return;
              }
              console.warn('Failed to update emailSent flag, but email was sent/scheduled');
            }
          } catch (updateError) {
            console.error('Error updating emailSent flag:', updateError);
            // Don't fail the email sending if update fails
          }
        }
        
        setTimeout(() => {
          setShowEmailModal(false);
          setEmailSent(false);
          setScheduleEmail(false);
          setScheduledDate('');
          setScheduledTime('');
        }, 3000);
      }
    } catch (error) {
      console.error('Error sending email:', error);
      setEmailError('Failed to send email. Please check your connection and try again.');
    } finally {
      setSendingEmail(false);
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden flex items-center justify-center">
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

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-2xl mx-auto px-4 sm:px-6"
      >
        {/* Glassmorphic Card */}
        <div className="bg-gradient-to-br from-purple-900/40 via-pink-900/40 to-rose-900/40 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 sm:p-10 max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="text-center mb-6"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-pink-500/20 to-rose-500/20 border-2 border-pink-400/50 mb-4">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="text-4xl"
              >
                🔗
              </motion.div>
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif text-white mb-2">
              Link Generated!
            </h2>
            <p className="text-gray-300 font-serif text-sm sm:text-base">
              Your letter is ready to share. Copy the link below and send it to your recipient.
            </p>
          </motion.div>

          {/* Link Display */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-6"
          >
            <label className="block text-white/80 font-serif text-sm mb-2">
              Shareable Link:
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  readOnly
                  value={shareableLink}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white text-sm sm:text-base font-mono focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 transition-all"
                  onClick={(e) => e.target.select()}
                />
                {/* Decorative corner accents */}
                <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-pink-400/30 rounded-tl-lg" />
                <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-pink-400/30 rounded-tr-lg" />
                <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-pink-400/30 rounded-bl-lg" />
                <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-pink-400/30 rounded-br-lg" />
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCopy}
                className="px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-lg font-serif font-semibold text-sm sm:text-base shadow-lg transition-all flex items-center justify-center gap-2 min-w-[120px]"
              >
                {copied ? (
                  <>
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-lg"
                    >
                      ✓
                    </motion.span>
                    Copied!
                  </>
                ) : (
                  <>
                    <span>📋</span>
                    Copy
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>

          {/* Decorative Divider */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="h-px bg-gradient-to-r from-transparent via-pink-400/30 to-transparent mb-6"
          />

          {/* Email Status Info */}
          {emailStatus && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="mb-6 p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20"
            >
              <div className="flex items-start gap-3">
                <div className="text-2xl flex-shrink-0">
                  {emailStatus.isScheduled ? '📅' : '✅'}
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-serif font-semibold text-sm mb-1">
                    {emailStatus.isScheduled ? 'Email Scheduled' : 'Email Sent'}
                  </h4>
                  <p className="text-white/80 font-serif text-xs mb-2">
                    Sent to: <span className="text-white font-medium">{emailStatus.sentTo}</span>
                  </p>
                  {emailStatus.isScheduled && emailStatus.scheduledDateTime ? (
                    <p className="text-white/70 font-serif text-xs">
                      Scheduled for: <span className="text-white/90 font-medium">
                        {new Date(emailStatus.scheduledDateTime).toLocaleString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </p>
                  ) : (
                    <p className="text-white/70 font-serif text-xs">
                      Sent at: <span className="text-white/90 font-medium">
                        {new Date(emailStatus.timestamp).toLocaleString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col gap-3 justify-center"
          >
            {/* Send Email Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowEmailModal(true)}
              className="w-full px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg font-serif font-semibold text-base shadow-lg transition-all overflow-hidden group relative"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                📧 Send via Email
              </span>
            </motion.button>

            {/* Continue Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onContinue}
              className="w-full px-8 py-3 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-lg font-serif font-semibold text-base shadow-lg transition-all overflow-hidden group relative"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                animate={{
                  x: ["-100%", "200%"],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 1,
                  ease: "easeInOut",
                }}
              />
              <span className="relative z-10 flex items-center justify-center gap-2">
                Continue to Dashboard
                <motion.span
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  →
                </motion.span>
              </span>
            </motion.button>
          </motion.div>

          {/* Helpful Tip */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-center text-gray-400 font-serif text-xs sm:text-sm mt-6"
          >
            💡 Tip: Share this link via message, email, or any platform you prefer
          </motion.p>
        </div>
      </motion.div>

      {/* Email Modal */}
      <AnimatePresence>
        {showEmailModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => !sendingEmail && !emailSent && setShowEmailModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-purple-900/95 via-pink-900/95 to-rose-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8 max-w-md w-full"
            >
              {!emailSent ? (
                <>
                  <h3 className="text-2xl font-serif font-bold text-white mb-2 text-center">
                    📧 Send Letter via Email
                  </h3>
                  <p className="text-gray-300 font-serif text-sm text-center mb-6">
                    Enter the recipient's email address to send them the letter link
                  </p>

                  <div className="mb-4">
                    <label className="block text-white/80 font-serif text-sm mb-2">
                      Recipient Email:
                    </label>
                    <input
                      type="email"
                      value={emailAddress}
                      onChange={(e) => {
                        setEmailAddress(e.target.value);
                        setEmailError('');
                      }}
                      placeholder="recipient@example.com"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 transition-all"
                      disabled={sendingEmail}
                    />
                    {emailError && (
                      <p className="text-red-400 text-sm mt-2 font-serif">{emailError}</p>
                    )}
                  </div>

                  {/* Schedule Email Option */}
                  <div className="mb-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={scheduleEmail}
                        onChange={(e) => {
                          setScheduleEmail(e.target.checked);
                          if (!e.target.checked) {
                            setScheduledDate('');
                            setScheduledTime('');
                            setEmailError('');
                          }
                        }}
                        disabled={sendingEmail}
                        className="w-5 h-5 rounded border-white/30 bg-white/10 text-pink-500 focus:ring-2 focus:ring-pink-500/50 focus:ring-offset-2 focus:ring-offset-transparent cursor-pointer"
                      />
                      <span className="text-white/80 font-serif text-sm">
                        📅 Schedule this email
                      </span>
                    </label>
                  </div>

                  {/* Date and Time Inputs (shown only when scheduling is enabled) */}
                  {scheduleEmail && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-4 space-y-3"
                    >
                      <div>
                        <label className="block text-white/80 font-serif text-sm mb-2">
                          Scheduled Date:
                        </label>
                        <input
                          type="date"
                          value={scheduledDate}
                          onChange={(e) => {
                            setScheduledDate(e.target.value);
                            setEmailError('');
                          }}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 transition-all"
                          disabled={sendingEmail}
                        />
                      </div>
                      <div>
                        <label className="block text-white/80 font-serif text-sm mb-2">
                          Scheduled Time:
                        </label>
                        <input
                          type="time"
                          value={scheduledTime}
                          onChange={(e) => {
                            setScheduledTime(e.target.value);
                            setEmailError('');
                          }}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 transition-all"
                          disabled={sendingEmail}
                        />
                      </div>
                    </motion.div>
                  )}

                  <div className="flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowEmailModal(false)}
                      disabled={sendingEmail}
                      className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-serif font-semibold transition-all disabled:opacity-50"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSendEmail}
                      disabled={sendingEmail || !emailAddress}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-lg font-serif font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {sendingEmail ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                          />
                          Sending...
                        </>
                      ) : (
                        'Send Email'
                      )}
                    </motion.button>
                  </div>
                </>
              ) : (
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="text-6xl mb-4"
                  >
                    ✅
                  </motion.div>
                  <h3 className="text-2xl font-serif font-bold text-white mb-2">
                    {scheduleEmail ? 'Email Scheduled!' : 'Email Sent!'}
                  </h3>
                  <p className="text-gray-300 font-serif text-sm">
                    {scheduleEmail 
                      ? `Your letter link is scheduled to be sent to ${emailAddress} on ${new Date(`${scheduledDate}T${scheduledTime}`).toLocaleString()}`
                      : `Your letter link has been sent to ${emailAddress}`
                    }
                  </p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

