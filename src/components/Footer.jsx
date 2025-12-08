import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

function Footer() {
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle newsletter subscription here
    console.log('Newsletter signup:', email);
    alert('Thank you for subscribing to our newsletter!');
    setEmail('');
  };

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-main">
          <div className="footer-brand">
            <h3 className="footer-brand-name">Master of Logic</h3>
            <p className="footer-description">
              Empowering developers through software engineering, AI, and automation.
            </p>
            <div className="footer-contact-info">
              <div className="footer-contact-item">
                <span className="footer-contact-label">Email:</span> <a href="mailto:hello@masteroflogic.com">hello@masteroflogic.com</a>
              </div>
              <div className="footer-contact-item">
                <span className="footer-contact-label">Phone:</span> <a href="tel:+1234567890">+1 234 567 890</a>
              </div>
            </div>
          </div>
          
          <div className="footer-right-section">
            <div className="footer-links-section">
              <div className="footer-links-group">
                <h4 className="footer-links-title">Pages</h4>
                <ul className="footer-links">
                  <li><Link to="/">Home</Link></li>
                  <li><Link to="/courses">Courses</Link></li>
                  <li><Link to="/journals">Journals</Link></li>
                  <li><Link to="/contact">Contact</Link></li>
                </ul>
              </div>
            </div>

            <div className="footer-newsletter">
              <h4 className="footer-newsletter-title">Get Monthly Updates</h4>
              <form className="footer-newsletter-form" onSubmit={handleSubmit}>
                <input
                  type="email"
                  placeholder="Enter your email here *"
                  className="footer-newsletter-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button type="submit" className="footer-newsletter-btn">
                  Sign Up!
                </button>
              </form>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p className="footer-copyright">
            © {new Date().getFullYear()} Master of Logic. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

