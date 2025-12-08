import React from 'react';
import { useNavigate } from 'react-router-dom';
import nothingHereImage from '../assets/nothing-here.png';
import './NotFound.css';

function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="not-found">
      <div className="not-found-container">
        <div className="not-found-content">
          <h1 className="not-found-title">Oops! There is nothing here</h1>
          <div className="not-found-image-container">
            <img 
              src={nothingHereImage} 
              alt="Nothing here" 
              className="not-found-image"
            />
          </div>
          <button 
            className="not-found-button"
            onClick={() => navigate('/')}
          >
            Go Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}

export default NotFound;

