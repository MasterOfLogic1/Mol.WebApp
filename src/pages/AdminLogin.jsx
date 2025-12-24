import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { jwtDecode } from 'jwt-decode';
import AlternateNavBar from '../components/AlternateNavBar';
import navbarIcon from '../assets/navbar-icon.jpg';
import './Login.css';

function AdminLogin() {
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
        // Check if user is admin
        const token = localStorage.getItem('accessToken');
        if (token) {
          const decoded = jwtDecode(token);
          if (decoded.role === 'admin') {
            navigate('/admin/dashboard');
          } else {
            // Not an admin, logout and show error
            setError('Access denied. Admin privileges required.');
            // Clear the token since they're not admin
            localStorage.removeItem('accessToken');
            // Wait a bit then reload to clear auth state
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          }
        }
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
    <div className="login admin-login">
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
          <p className="login-header-text">Admin Login</p>
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

            <button type="submit" className="login-submit-btn" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
      <div className="admin-login-warning-banner">
        <p>
          ⚠️ Warning: This is an admin-only area. Unauthorized access is prohibited.{' '}
          <Link to="/login" className="admin-login-warning-link">
            Go to regular login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default AdminLogin;

