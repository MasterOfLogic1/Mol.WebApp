import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Nav.css';
import navbarIcon from '../assets/navbar-icon.jpg';

function Nav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleToolsClick = () => {
    closeMenu();
    if (isAuthenticated()) {
      navigate('/apps');
    } else {
      navigate('/login');
    }
  };

  return (
    <nav className="nav">
      <div className="nav-container">
        <Link to="/" className="nav-logo" onClick={closeMenu}>
          <img src={navbarIcon} alt="Master of Logic" className="nav-logo-img" />
        </Link>
        <button className="nav-toggle" onClick={toggleMenu} aria-label="Toggle menu">
          <span className={`nav-toggle-icon ${isMenuOpen ? 'open' : ''}`}></span>
          <span className={`nav-toggle-icon ${isMenuOpen ? 'open' : ''}`}></span>
          <span className={`nav-toggle-icon ${isMenuOpen ? 'open' : ''}`}></span>
        </button>
        {isMenuOpen && (
          <div className="nav-overlay" onClick={closeMenu}></div>
        )}
        <div className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
          <Link to="/" className="nav-link" onClick={closeMenu}>Home</Link>
          <Link to="/courses" className="nav-link" onClick={closeMenu}>Courses</Link>
          <Link to="/journals" className="nav-link" onClick={closeMenu}>Journals</Link>
          <Link to="/team" className="nav-link" onClick={closeMenu}>Team</Link>
          <Link to="/contact" className="nav-link" onClick={closeMenu}>Contact</Link>
          <button className="nav-membership-btn" onClick={handleToolsClick}>
            Tools & Resources
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Nav;

