import React from 'react';
import { useNavigate } from 'react-router-dom';
import './AlternateNavBar.css';

function AlternateNavBar() {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <nav className="alternate-nav">
      <div className="alternate-nav-container">
        <button onClick={handleBack} className="alternate-nav-back" aria-label="Go back">
          <span className="back-icon">‹</span>
        </button>
      </div>
    </nav>
  );
}

export default AlternateNavBar;

