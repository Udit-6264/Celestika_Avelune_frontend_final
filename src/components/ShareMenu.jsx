import React from 'react';
import './ShareButton.css';

const ShareButton = ({ shareData }) => {
  const defaultData = {
    title: 'Check this out!',
    text: 'Take a look at this page:',
    url: typeof window !== 'undefined' ? window.location.href : '',
    ...shareData,
  };

  const handleShare = async () => {
    // Check if Native Share is supported
    if (navigator.share) {
      try {
        await navigator.share(defaultData);
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Share failed:', error);
        }
      }
    } else {
      // Direct Clipboard Copy Fallback (Desktop/Unsupported Browsers)
      try {
        await navigator.clipboard.writeText(defaultData.url);
        alert('Link copied to clipboard!');
      } catch (err) {
        console.error('Failed to copy link:', err);
      }
    }
  };

  return (
    <button className="share-btn" onClick={handleShare}>
      Share
    </button>
  );
};

export default ShareButton;