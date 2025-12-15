import React from "react";
import ReactDOM from "react-dom/client";
import './index.css';
import App from "./app.jsx"; // Receiver interface
import MasterApp from "./master/MasterApp.jsx"; // Master interface
import EmailVerification from "./master/EmailVerification.jsx"; // Email verification page
import LetterViewer from "./receiver-pages/LetterViewer.jsx"; // Letter viewer for shareable links
import LandingPage from "./pages/LandingPage.jsx"; // Landing page
import { AuthProvider } from "./contexts/AuthContext";
import { MusicPlayerProvider } from "./contexts/MusicPlayerContext";
import { DashboardMusicProvider } from "./contexts/DashboardMusicContext";

// Check URL path and parameters to determine which interface to show
const path = window.location.pathname;
const urlParams = new URLSearchParams(window.location.search);
const mode = urlParams.get('mode') || window.location.hash.replace('#', '');

// Render the appropriate interface
const root = ReactDOM.createRoot(document.getElementById("root"));

// Check if this is a shareable letter link: /letter/:token (token-based only)
const letterTokenMatch = path.match(/^\/letter\/([a-f0-9]{64})$/); // Token is 64 hex characters

// Check if this is an email verification page
// Check both path and query parameter for token
const hasToken = urlParams.get('token');
if (path.includes('/verify-email') || path === '/verify-email' || hasToken) {
  root.render(
    <React.StrictMode>
      <EmailVerification />
    </React.StrictMode>
  );
} else if (letterTokenMatch) {
  // This is a shareable letter link - show LetterViewer for receivers
  // Only token-based URLs are supported (legacy format removed for security)
  root.render(
    <React.StrictMode>
      <AuthProvider>
        <MusicPlayerProvider>
          <DashboardMusicProvider>
            <LetterViewer />
          </DashboardMusicProvider>
        </MusicPlayerProvider>
      </AuthProvider>
    </React.StrictMode>
  );
} else if (path === '/' || path === '') {
  // Show landing page on root path
  root.render(
    <React.StrictMode>
      <LandingPage />
    </React.StrictMode>
  );
} else if (mode === 'receiver') {
  // Only show receiver App if explicitly requested via ?mode=receiver
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  // Default: Show MasterApp (master interface) for all other routes
  // This includes /signin and any other paths
  root.render(
    <React.StrictMode>
      <AuthProvider>
        <MasterApp />
      </AuthProvider>
    </React.StrictMode>
  );
}
