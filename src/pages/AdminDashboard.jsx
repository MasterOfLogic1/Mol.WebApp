import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AdminManageUsers from './AdminManageUsers';
import AdminManageCourses from './AdminManageCourses';
import AdminManageJournal from './AdminManageJournal';
import './Dashboard.css';

function AdminDashboard() {
  const { user, logout } = useAuth();
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
            <h2>Admin Dashboard</h2>
            <button className="dashboard-menu-toggle" onClick={toggleMenu} aria-label="Toggle menu">
              <span className={`dashboard-toggle-icon ${isMenuOpen ? 'open' : ''}`}></span>
              <span className={`dashboard-toggle-icon ${isMenuOpen ? 'open' : ''}`}></span>
              <span className={`dashboard-toggle-icon ${isMenuOpen ? 'open' : ''}`}></span>
            </button>
          </div>
          <nav className="dashboard-nav">
            <Link
              to="/admin/dashboard"
              className={`dashboard-nav-link ${location.pathname === '/admin/dashboard' ? 'active' : ''}`}
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/admin/manage-users"
              className={`dashboard-nav-link ${location.pathname === '/admin/manage-users' ? 'active' : ''}`}
              onClick={() => setIsMenuOpen(false)}
            >
              User Management
            </Link>
            <Link
              to="/admin/manage-courses"
              className={`dashboard-nav-link ${location.pathname === '/admin/manage-courses' ? 'active' : ''}`}
              onClick={() => setIsMenuOpen(false)}
            >
              Manage Courses
            </Link>
            <Link
              to="/admin/manage-journal"
              className={`dashboard-nav-link ${location.pathname === '/admin/manage-journal' ? 'active' : ''}`}
              onClick={() => setIsMenuOpen(false)}
            >
              Manage Journal
            </Link>
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
            <p>Admin Dashboard</p>
          </div>

          <div className="dashboard-content">
            {location.pathname === '/admin/manage-users' ? (
              <AdminManageUsers />
            ) : location.pathname === '/admin/manage-courses' ? (
              <AdminManageCourses />
            ) : location.pathname === '/admin/manage-journal' ? (
              <AdminManageJournal />
            ) : (
              <AdminDashboardHome />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function AdminDashboardHome() {
  const navigate = useNavigate();

  return (
    <div className="dashboard-home">
      <div className="dashboard-cards">
        <div 
          className="dashboard-card admin-card-users"
          onClick={() => navigate('/admin/manage-users')}
        >
          <h3>User Management</h3>
          <p>Manage users, roles, and permissions</p>
        </div>
        <div 
          className="dashboard-card admin-card-courses"
          onClick={() => navigate('/admin/manage-courses')}
        >
          <h3>Manage Courses</h3>
          <p>Create, edit, and delete courses</p>
        </div>
        <div 
          className="dashboard-card admin-card-journal"
          onClick={() => navigate('/admin/manage-journal')}
        >
          <h3>Manage Journal</h3>
          <p>Manage blog posts and journal entries</p>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;

