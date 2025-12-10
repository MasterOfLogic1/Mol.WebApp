import React, { useState } from 'react';
import noInternetImage from '../assets/no-internet.png';
import './OfflineEmptyState.css';

function OfflineEmptyState({ onRetry }) {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div className="offline-empty-state">
      {!imageError ? (
        <img 
          src={noInternetImage} 
          alt="No internet connection" 
          className="offline-empty-image"
          onError={handleImageError}
        />
      ) : (
        <div className="offline-empty-image-placeholder">
          <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="100" cy="100" r="80" stroke="#6c757d" strokeWidth="2" fill="none"/>
            <path d="M60 100 L100 60 L140 100" stroke="#6c757d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            <line x1="100" y1="100" x2="100" y2="140" stroke="#6c757d" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="100" cy="140" r="3" fill="#6c757d"/>
          </svg>
        </div>
      )}
      <h2 className="offline-empty-title">You are offline</h2>
      <p className="offline-empty-message">
        Please check your internet connection and try again.
      </p>
      {onRetry && (
        <button onClick={onRetry} className="offline-retry-btn">
          Retry
        </button>
      )}
    </div>
  );
}

export default OfflineEmptyState;

