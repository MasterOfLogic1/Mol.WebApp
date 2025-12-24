import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserProfile } from '../api/profileApi';
import ManageContent from './ManageContent';
import Analytics from './Analytics';
import ManageUsers from './ManageUsers';
import Profile from './Profile';
import ManageJournal from './ManageJournal';
import './Dashboard.css';

function Dashboard() {
  const { user, logout, isAdmin, isWriter } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const profile = await getUserProfile();
        setUserProfile(profile);
      } catch (err) {
        // Profile might not exist yet, that's okay
        console.log('Profile not found:', err);
      }
    };
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  const getFirstName = () => {
    if (userProfile?.firstname) {
      return userProfile.firstname;
    }
    // Fallback to email if no profile exists
    return user?.email || 'User';
  };

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
              to="/apps"
              className={`dashboard-nav-link ${location.pathname === '/apps' ? 'active' : ''}`}
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/apps/profile"
              className={`dashboard-nav-link ${location.pathname === '/apps/profile' ? 'active' : ''}`}
              onClick={() => setIsMenuOpen(false)}
            >
              Profile
            </Link>
            {(isWriter() || isAdmin()) && (
              <Link
                to="/apps/journal"
                className={`dashboard-nav-link ${location.pathname === '/apps/journal' ? 'active' : ''}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Journal
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
            <h1>Welcome, {getFirstName()}</h1>
            <p>Access your tools and resources</p>
          </div>

          <div className="dashboard-content">
            {location.pathname === '/apps/profile' ? (
              <Profile />
            ) : location.pathname === '/apps/journal' && (isWriter() || isAdmin()) ? (
              <ManageJournal />
            ) : location.pathname === '/apps/admin/manage-users' && isAdmin() ? (
              <ManageUsers />
            ) : location.pathname === '/apps/admin/analytics' && isAdmin() ? (
              <Analytics />
            ) : location.pathname === '/apps/admin/manage-content' && isAdmin() ? (
              <ManageContent />
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
  const navigate = useNavigate();
  const { isWriter, isAdmin } = useAuth();

  return (
    <div className="dashboard-home">
      <div className="dashboard-cards">
        <div 
          className="dashboard-card user-card-profile"
          onClick={() => navigate('/apps/profile')}
        >
          <h3>Profile</h3>
          <p>Manage your account settings</p>
        </div>
        {(isWriter() || isAdmin()) && (
          <div 
            className="dashboard-card user-card-journal"
            onClick={() => navigate('/apps/journal')}
          >
            <h3>Manage Journals</h3>
            <p>Create and manage your journal posts</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;

