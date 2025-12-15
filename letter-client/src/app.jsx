import React, { useState } from "react";
import SecretKeyGate from "./receiver-pages/SecretKeyGate";
import EnvelopeOpening from "./receiver-pages/EnvelopeOpening";
import { AnimatePresence, motion } from "framer-motion";
import LetterReveal from "./receiver-pages/LetterReveal";
import FinalMessages from "./receiver-pages/FinalMessages";
import WritingInterface from "./receiver-pages/WritingInterface";
import OptionsPage from "./receiver-pages/OptionsPage";
import DateInvitation from "./receiver-pages/DateInvitation";
import ViewAllLetters from "./receiver-pages/ViewAllLetters";
import PDFDownloadProgress from "./receiver-pages/PDFDownloadProgress";
import ResponseLetters from "./receiver-pages/ResponseLetters";
import AllWriteBackLetters from "./receiver-pages/AllWriteBackLetters";
import ViewWriteBackResponses from "./receiver-pages/ViewWriteBackResponses";
import { MusicPlayerProvider } from "./contexts/MusicPlayerContext";
import { DashboardMusicProvider } from "./contexts/DashboardMusicContext";

// Letter content - this should match the content in LetterReveal.jsx
const LETTER_CONTENT = `Welcome back… this space is just for you. I kept this letter safe while I gathered the right words.

Life has been a journey of small moments, and I wanted to share a few thoughts I've kept in my heart. I hope these words find you in peace and happiness.

Remember, even in the quietest moments, you are never alone. I've thought of you often, and I hope this letter reminds you of that.

There are days when the world feels heavy, and yet even in those times, a thought of you brings a subtle lightness to my heart. I find myself smiling at the memory of your laughter, your voice, and the little things you do that make life brighter.

I wish I could be there to share these moments with you, to hear your thoughts, and to hold space for whatever you are feeling. You deserve a life filled with warmth, joy, and gentle care, and I hope that every step you take leads you closer to it.

As you read this, know that my intentions are sincere, and my heart carries a quiet hope for your happiness. I imagine you finding comfort in these words, just as I found comfort in thinking of you while writing them.

Please take a moment for yourself, to breathe, to smile, and to feel that you are cherished in ways words can barely capture. Life is a collection of fleeting moments, and some of the most meaningful ones are the silent connections that remind us we are seen, remembered, and appreciated.

I hope this letter serves as a gentle reminder: you are valued beyond measure, and even if we are apart, a piece of my thoughts will always be with you, quietly wishing for your light to shine brighter every day.`;

export default function App() {
  const [unlocked, setUnlocked] = useState(false);
  const [showFinalMessages, setShowFinalMessages] = useState(false);
  const [showWritingInterface, setShowWritingInterface] = useState(false);
  const [showOptionsPage, setShowOptionsPage] = useState(false);
  const [showDateInvitation, setShowDateInvitation] = useState(false);
  const [showLetterReveal, setShowLetterReveal] = useState(false);
  const [showViewAllLetters, setShowViewAllLetters] = useState(false);
  const [showPDFDownloadProgress, setShowPDFDownloadProgress] = useState(false);
  const [showResponseLetters, setShowResponseLetters] = useState(false);
  const [showAllWriteBackLetters, setShowAllWriteBackLetters] = useState(false);
  const [showViewWriteBackResponses, setShowViewWriteBackResponses] = useState(false);
  const [writingInterfaceOrigin, setWritingInterfaceOrigin] = useState(null); // 'finalMessages' or 'optionsPage'
  const [letterRevealOrigin, setLetterRevealOrigin] = useState(null); // 'optionsPage' or null
  const [selectedLetter, setSelectedLetter] = useState(null); // Store the selected letter data

  const handleWriteBackChoice = (wantsToWrite) => {
    if (wantsToWrite) {
      setWritingInterfaceOrigin('finalMessages');
      setShowWritingInterface(true);
    } else {
      setShowOptionsPage(true);
    }
  };

  return (
    <MusicPlayerProvider>
      <DashboardMusicProvider>
        <div className="relative w-full h-screen overflow-hidden">
        <AnimatePresence mode="wait">
        {!unlocked ? (
          <motion.div
            key="secret-gate"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <SecretKeyGate onSuccess={() => setUnlocked(true)} />
          </motion.div>
        ) : showViewWriteBackResponses ? (
          <motion.div
            key="view-write-back-responses"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
          >
            <ViewWriteBackResponses
              onBack={() => {
                setShowViewWriteBackResponses(false);
                setShowOptionsPage(true);
              }}
              onWriteNew={() => {
                setWritingInterfaceOrigin('optionsPage');
                setShowViewWriteBackResponses(false);
                setShowWritingInterface(true);
              }}
              userId={selectedLetter?.senderUserId || "test-user"}
            />
          </motion.div>
        ) : showAllWriteBackLetters ? (
          <motion.div
            key="all-write-back-letters"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
          >
            <AllWriteBackLetters
              onBack={() => {
                setShowAllWriteBackLetters(false);
                setShowOptionsPage(true);
              }}
              onWriteNew={() => {
                setWritingInterfaceOrigin('optionsPage');
                setShowAllWriteBackLetters(false);
                setShowWritingInterface(true);
              }}
              userId={selectedLetter?.senderUserId || "test-user"}
            />
          </motion.div>
        ) : showWritingInterface ? (
          <motion.div
            key="writing-interface"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
          >
            <WritingInterface 
              onComplete={() => {
                setShowWritingInterface(false);
                setShowOptionsPage(true);
              }} 
              onBack={() => {
                setShowWritingInterface(false);
                if (writingInterfaceOrigin === 'optionsPage') {
                  setShowOptionsPage(true);
                } else {
                  setShowFinalMessages(true);
                }
              }}
              userId={selectedLetter?.senderUserId || "test-user"}
              letterId={selectedLetter?.id || "test-letter"}
              receiverName={selectedLetter?.receiverName || "Friend"}
            />
          </motion.div>
        ) : showDateInvitation ? (
          <motion.div
            key="date-invitation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
          >
            <DateInvitation
              onBack={() => {
                setShowDateInvitation(false);
                setShowOptionsPage(true);
              }}
            />
          </motion.div>
        ) : showLetterReveal ? (
          <motion.div
            key="letter-reveal-again"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
          >
            <LetterReveal 
              onContinue={() => {
                setShowLetterReveal(false);
                setSelectedLetter(null);
                if (letterRevealOrigin === 'optionsPage') {
                  setShowOptionsPage(true);
                } else {
                  setShowFinalMessages(true);
                }
              }}
              letterContent={selectedLetter?.content || LETTER_CONTENT}
              letterTitle={selectedLetter?.title || "A Letter for You"}
              userFirstName="Faith"
            />
          </motion.div>
        ) : showPDFDownloadProgress ? (
          <motion.div
            key="pdf-download-progress"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
          >
            <PDFDownloadProgress
              letterContent={LETTER_CONTENT}
              recipientName="Faith"
              onBack={() => {
                setShowPDFDownloadProgress(false);
                setShowOptionsPage(true);
              }}
              onComplete={() => {
                setShowPDFDownloadProgress(false);
                setShowOptionsPage(true);
              }}
            />
          </motion.div>
        ) : showViewAllLetters ? (
          <motion.div
            key="view-all-letters"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
          >
            <ViewAllLetters
              onBack={() => {
                setShowViewAllLetters(false);
                setShowOptionsPage(true);
              }}
              onViewLetter={(letter) => {
                setSelectedLetter(letter);
                setLetterRevealOrigin('optionsPage');
                setShowViewAllLetters(false);
                setShowLetterReveal(true);
              }}
            />
          </motion.div>
        ) : showOptionsPage ? (
          <motion.div
            key="options-page"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
          >
            <OptionsPage
              letterContent={LETTER_CONTENT}
              receiverName={selectedLetter?.receiverName || "Faith"}
              userId={selectedLetter?.senderUserId || "test-user"}
              letterId={selectedLetter?.id || "test-letter"}
              onWriteLetter={() => {
                setShowWritingInterface(false);
                setShowAllWriteBackLetters(false);
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
              onDownloadPDF={() => {
                setShowOptionsPage(false);
                setShowPDFDownloadProgress(true);
              }}
              onBack={() => {
                setShowOptionsPage(false);
                setShowFinalMessages(true);
              }}
            />
          </motion.div>
        ) : showResponseLetters ? (
          <motion.div
            key="response-letters"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
          >
            <ResponseLetters
              onBack={() => {
                setShowResponseLetters(false);
                setShowOptionsPage(true);
              }}
              onWriteBack={() => {
                setWritingInterfaceOrigin('optionsPage');
                setShowResponseLetters(false);
                setShowWritingInterface(true);
              }}
              userId={selectedLetter?.senderUserId || "test-user"}
              letterId={undefined}
            />
          </motion.div>
        ) : showFinalMessages ? (
          <motion.div
            key="final-messages"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
          >
            <FinalMessages onWriteBackChoice={handleWriteBackChoice} />
          </motion.div>
        ) : (
          <motion.div
            key="letter-reveal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
          >
            <LetterReveal 
              onContinue={() => {
                setShowLetterReveal(false);
                setSelectedLetter(null);
                setShowFinalMessages(true);
              }}
              letterContent={LETTER_CONTENT}
              letterTitle="A Letter for You"
              userFirstName="Faith"
            />
          </motion.div>
        )}
      </AnimatePresence>
      </div>
      </DashboardMusicProvider>
    </MusicPlayerProvider>
  );
}
