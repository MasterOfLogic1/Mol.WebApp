import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Admin from './Admin';
import ManageContent from './ManageContent';
import Analytics from './Analytics';
import ManageUsers from './ManageUsers';
import Profile from './Profile';
import './Dashboard.css';

function Dashboard() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="dashboard">
      <div className="dashboard-container">
        <aside className={`dashboard-sidebar ${isMenuOpen ? 'open' : 'collapsed'}`}>
          <div className="dashboard-sidebar-header">
            <h2>Dashboard</h2>
            <button className="dashboard-menu-toggle" onClick={toggleMenu} aria-label="Toggle menu">
              <span className={`dashboard-toggle-icon ${isMenuOpen ? 'open' : ''}`}></span>
              <span className={`dashboard-toggle-icon ${isMenuOpen ? 'open' : ''}`}></span>
              <span className={`dashboard-toggle-icon ${isMenuOpen ? 'open' : ''}`}></span>
            </button>
          </div>
          <nav className="dashboard-nav">
            <Link
              to="/dashboard"
              className={`dashboard-nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/dashboard/profile"
              className={`dashboard-nav-link ${location.pathname === '/dashboard/profile' ? 'active' : ''}`}
              onClick={() => setIsMenuOpen(false)}
            >
              Profile
            </Link>
            {isAdmin() && (
              <Link
                to="/dashboard/admin"
                className={`dashboard-nav-link ${location.pathname === '/dashboard/admin' ? 'active' : ''}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Admin
              </Link>
            )}
            <button className="dashboard-nav-link logout" onClick={handleLogout}>
              Logout
            </button>
          </nav>
        </aside>

        <main className="dashboard-main">
          <button className="dashboard-main-toggle" onClick={toggleMenu} aria-label="Toggle menu">
            <span className={`dashboard-toggle-icon ${isMenuOpen ? 'open' : ''}`}></span>
            <span className={`dashboard-toggle-icon ${isMenuOpen ? 'open' : ''}`}></span>
            <span className={`dashboard-toggle-icon ${isMenuOpen ? 'open' : ''}`}></span>
          </button>
          {isMenuOpen && (
            <div className="dashboard-overlay" onClick={() => setIsMenuOpen(false)}></div>
          )}
          <div className="dashboard-header">
            <h1>Welcome, {user?.email}</h1>
            <p>Access your tools and resources</p>
          </div>

          <div className="dashboard-content">
            {location.pathname === '/dashboard/profile' ? (
              <Profile />
            ) : location.pathname === '/dashboard/admin/manage-users' && isAdmin() ? (
              <ManageUsers />
            ) : location.pathname === '/dashboard/admin/analytics' && isAdmin() ? (
              <Analytics />
            ) : location.pathname === '/dashboard/admin/manage-content' && isAdmin() ? (
              <ManageContent />
            ) : location.pathname === '/dashboard/admin' && isAdmin() ? (
              <Admin />
            ) : (
              <DashboardHome />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function DashboardHome() {
  return (
    <div className="dashboard-home">
      <div className="dashboard-cards">
        <div className="dashboard-card">
          <h3>Tools & Resources</h3>
          <p>Access your exclusive tools and resources here.</p>
          <button className="dashboard-card-btn">View Resources</button>
        </div>
        <div className="dashboard-card">
          <h3>My Courses</h3>
          <p>Continue your learning journey.</p>
          <button className="dashboard-card-btn">View Courses</button>
        </div>
        <div className="dashboard-card">
          <h3>Profile</h3>
          <p>Manage your account settings.</p>
          <button className="dashboard-card-btn">Edit Profile</button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

