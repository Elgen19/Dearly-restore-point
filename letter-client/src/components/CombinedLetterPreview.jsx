// CombinedLetterPreview.jsx - Combines all three selected animations in sequence
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import IntroductoryPreviewV1 from "./IntroductoryPreviewV1";
import IntroductoryPreviewV2 from "./IntroductoryPreviewV2";
import IntroductoryPreviewV3 from "./IntroductoryPreviewV3";
import MainBodyPreviewV1 from "./MainBodyPreviewV1";
import MainBodyPreviewV3 from "./MainBodyPreviewV3";
import ClosingPreviewV1 from "./ClosingPreviewV1";
import ClosingPreviewV2 from "./ClosingPreviewV2";
import ClosingPreviewV3 from "./ClosingPreviewV3";

export default function CombinedLetterPreview({
  introductory,
  mainBody,
  closing,
  receiverName = "",
  userFirstName = "",
  introductoryStyle = 1,
  mainBodyStyle = 1,
  closingStyle = 1,
  onComplete
}) {
  const [currentSection, setCurrentSection] = useState('introductory'); // introductory, mainBody, closing
  const [hasStarted, setHasStarted] = useState(false);

  // Start animation immediately on mount
  useEffect(() => {
    setHasStarted(true);
  }, []);

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

  const IntroductoryComponent = introductoryComponents[introductoryStyle] || IntroductoryPreviewV1;
  const MainBodyComponent = mainBodyComponents[mainBodyStyle] || MainBodyPreviewV1;
  const ClosingComponent = closingComponents[closingStyle] || ClosingPreviewV1;

  // Auto-advance through sections - only start when component has mounted
  useEffect(() => {
    if (!hasStarted) return;

    if (currentSection === 'introductory') {
      // Show introductory for 4 seconds, then move to main body
      const timer = setTimeout(() => {
        setCurrentSection('mainBody');
      }, 4000);
      return () => clearTimeout(timer);
    } else if (currentSection === 'mainBody') {
      // Show main body for 6 seconds (longer for scroll/envelope), then move to closing
      const timer = setTimeout(() => {
        setCurrentSection('closing');
      }, 6000);
      return () => clearTimeout(timer);
    } else if (currentSection === 'closing') {
      // Show closing for 4 seconds, then loop back to introductory
      const timer = setTimeout(() => {
        setCurrentSection('introductory');
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [currentSection, onComplete, hasStarted]);

  return (
    <div className="h-full w-full relative overflow-hidden">
      <AnimatePresence mode="wait">
        {currentSection === 'introductory' && (
          <motion.div
            key="introductory"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0"
          >
            <IntroductoryComponent
              introductory={introductory}
              receiverName={receiverName}
            />
          </motion.div>
        )}

        {currentSection === 'mainBody' && (
          <motion.div
            key="mainBody"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0"
          >
            <MainBodyComponent
              mainBody={mainBody}
              receiverName={receiverName}
              userFirstName={userFirstName}
            />
          </motion.div>
        )}

        {currentSection === 'closing' && (
          <motion.div
            key="closing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0"
          >
            <ClosingComponent
              closing={closing}
              receiverName={receiverName}
            />
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

