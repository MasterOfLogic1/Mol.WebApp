import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { verifyNewsletter } from '../api/newsletterApi';
import './NewsletterVerify.css';

function NewsletterVerify() {
  const { verification_token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verify = async () => {
      if (!verification_token) {
        setStatus('error');
        setMessage('Invalid link');
        return;
      }

      try {
        const response = await verifyNewsletter(verification_token);
        setStatus('success');
        setMessage(response.message || 'You have been added to the newsletter!');
      } catch (error) {
        setStatus('error');
        setMessage('Invalid link');
      }
    };

    verify();
  }, [verification_token]);

  const handleOkay = () => {
    navigate('/');
  };

  return (
    <div className="newsletter-verify">
      <div className="newsletter-verify-container">
        <div className="newsletter-verify-content">
          {status === 'verifying' && (
            <div className="newsletter-verify-status">
              <div className="newsletter-verify-spinner"></div>
              <p>Verifying your subscription...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="newsletter-verify-status success">
              <div className="newsletter-verify-icon">✓</div>
              <h2>Successfully Subscribed!</h2>
              <p>{message}</p>
              <button onClick={handleOkay} className="newsletter-verify-btn">
                Okay
              </button>
            </div>
          )}

          {status === 'error' && (
            <div className="newsletter-verify-status error">
              <div className="newsletter-verify-icon">✗</div>
              <h2>Invalid Link</h2>
              <p>{message}</p>
              <button onClick={handleOkay} className="newsletter-verify-btn">
                Okay
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default NewsletterVerify;

