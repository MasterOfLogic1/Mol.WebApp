import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { verifyAccount } from '../api/auth';
import './Verification.css';

function Verification() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link');
        return;
      }

      try {
        await verifyAccount(token);
        setStatus('success');
        setMessage('Your account has been verified successfully!');
      } catch (error) {
        setStatus('error');
        setMessage(error.message || 'Verification failed. The link may be invalid or expired.');
      }
    };

    verify();
  }, [token]);

  return (
    <div className="verification">
      <div className="verification-container">
        <div className="verification-content">
          {status === 'verifying' && (
            <div className="verification-status">
              <div className="verification-spinner"></div>
              <p>Verifying your account...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="verification-status success">
              <div className="verification-icon">✓</div>
              <h2>Verification Successful!</h2>
              <p>{message}</p>
              <button onClick={() => navigate('/login')} className="verification-btn">
                Go to Login
              </button>
            </div>
          )}

          {status === 'error' && (
            <div className="verification-status error">
              <div className="verification-icon">✗</div>
              <h2>Verification Failed</h2>
              <p>{message}</p>
              <button onClick={() => navigate('/register')} className="verification-btn">
                Go to Register
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Verification;

