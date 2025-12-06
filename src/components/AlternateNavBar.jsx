import React from 'react';
import { Link } from 'react-router-dom';
import './AlternateNavBar.css';
import navbarIcon from '../assets/navbar-icon.jpg';

function AlternateNavBar() {
  return (
    <nav className="alternate-nav">
      <div className="alternate-nav-container">
        <Link to="/" className="alternate-nav-logo">
          <img src={navbarIcon} alt="Master of Logic" className="alternate-nav-logo-img" />
        </Link>
      </div>
    </nav>
  );
}

export default AlternateNavBar;

