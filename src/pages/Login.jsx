import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AlternateNavBar from '../components/AlternateNavBar';
import navbarIcon from '../assets/navbar-icon.jpg';
import './Login.css';

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        navigate('/apps');
      } else {
        setError(result.error || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login">
      <AlternateNavBar />
      <div className="login-container">
        <div className="login-header">
          <img 
            src={navbarIcon} 
            alt="Master of Logic" 
            className="login-logo" 
            onClick={() => navigate('/')}
            style={{ cursor: 'pointer' }}
          />
          <p className="login-header-text">Login to access our tools & resources</p>
        </div>
        <div className="login-form-wrapper">
          <form className="login-form" onSubmit={handleSubmit}>
            {error && <div className="login-error">{error}</div>}

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="login-forgot-password">
              <a href="/reset-password">Forgot password?</a>
            </div>

            <button type="submit" className="login-submit-btn" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>

            <p className="login-register-link">
              Don't have an account? <a href="/register">Register here</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;

