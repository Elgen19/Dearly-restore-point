// MainBodyPreviewV1.jsx - Scroll unravelling animation
import React from "react";
import ScrollUnravelPreview from "./ScrollUnravelPreview";

export default function MainBodyPreviewV1({ 
  mainBody, 
  receiverName = "",
  userFirstName = ""
}) {
  return (
    <div className="h-full w-full">
      <ScrollUnravelPreview 
        letterContent={mainBody || "Your letter content will appear here..."} 
        userFirstName={userFirstName}
        letterTitle=""
        autoLoop={false}
        showTitleOpener={false}
      />
    </div>
  );
}

