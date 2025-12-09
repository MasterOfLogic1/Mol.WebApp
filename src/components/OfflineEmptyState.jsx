import React from 'react';
import noInternetImage from '../assets/no-internet.png';
import './OfflineEmptyState.css';

function OfflineEmptyState({ onRetry }) {
  return (
    <div className="offline-empty-state">
      <img src={noInternetImage} alt="No internet connection" className="offline-empty-image" />
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

