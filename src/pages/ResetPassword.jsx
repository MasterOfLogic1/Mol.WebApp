import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { sendPasswordResetEmail, resetPassword } from '../api/auth';
import './ResetPassword.css';

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState(token ? 'reset' : 'request'); // request or reset
  const [email, setEmail] = useState('');
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if we have a token from route params or URL query params
    const routeToken = token;
    const queryToken = searchParams.get('token');
    if (routeToken || queryToken) {
      setMode('reset');
    }
  }, [token, searchParams]);

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await sendPasswordResetEmail(email);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      const resetToken = token || searchParams.get('token');
      await resetPassword(resetToken, formData.password, formData.confirmPassword);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Password reset failed. The link may be invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  if (success && mode === 'request') {
    return (
      <div className="reset-password">
        <div className="reset-password-container">
          <div className="reset-password-success-content">
            <h1 className="reset-password-title">Check Your Email</h1>
            <p className="reset-password-subtitle">
              We've sent a password reset link to {email}. Please check your email and click the link to reset your password.
            </p>
            <button onClick={() => navigate('/login')} className="reset-password-btn">
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (success && mode === 'reset') {
    return (
      <div className="reset-password">
        <div className="reset-password-container">
          <div className="reset-password-success-content">
            <h1 className="reset-password-title">Password Reset Successful!</h1>
            <p className="reset-password-subtitle">
              Your password has been reset successfully. You can now login with your new password.
            </p>
            <button onClick={() => navigate('/login')} className="reset-password-btn">
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="reset-password">
      <div className="reset-password-container">
        <div className="reset-password-form-wrapper">
          {mode === 'request' ? (
            <form className="reset-password-form" onSubmit={handleRequestSubmit}>
              {error && <div className="reset-password-error">{error}</div>}

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="reset-password-submit-btn" disabled={loading}>
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>

              <p className="reset-password-login-link">
                Remember your password? <a href="/login">Login here</a>
              </p>
            </form>
          ) : (
            <form className="reset-password-form" onSubmit={handleResetSubmit}>
              {error && <div className="reset-password-error">{error}</div>}

              <div className="form-group">
                <label htmlFor="password">New Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                  minLength={6}
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, confirmPassword: e.target.value })
                  }
                  required
                  minLength={6}
                />
              </div>

              <button type="submit" className="reset-password-submit-btn" disabled={loading}>
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;

