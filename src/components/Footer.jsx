import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { registerNewsletter } from '../api/newsletterApi';
import './Footer.css';

function Footer() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const response = await registerNewsletter(email);
      
      // API returns 200 with { "message": "Verification email sent. Please check your inbox to verify your subscription." }
      if (response.message) {
        setSuccessMessage(response.message);
        setEmail('');
      }
    } catch (error) {
      setErrorMessage(error.data?.error || error.message || 'Failed to subscribe. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    // Clear messages when user starts typing
    if (successMessage || errorMessage) {
      setSuccessMessage(null);
      setErrorMessage(null);
    }
  };

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-main">
          <div className="footer-brand">
            <h3 className="footer-brand-name">Master of Logic</h3>
            <p className="footer-description">
              If you can imagine it, we can make it possible.
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
              {successMessage && (
                <div className="footer-newsletter-message footer-newsletter-success">
                  {successMessage}
                </div>
              )}
              {errorMessage && (
                <div className="footer-newsletter-message footer-newsletter-error">
                  {errorMessage}
                </div>
              )}
              <form className="footer-newsletter-form" onSubmit={handleSubmit}>
                <input
                  type="email"
                  placeholder="Enter your email here *"
                  className="footer-newsletter-input"
                  value={email}
                  onChange={handleEmailChange}
                  required
                  disabled={isSubmitting}
                />
                <button 
                  type="submit" 
                  className="footer-newsletter-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Signing Up...' : 'Sign Up!'}
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

