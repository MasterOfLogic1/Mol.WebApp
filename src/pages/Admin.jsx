import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Admin.css';

function Admin() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="admin">
      <div className="admin-header">
        <h2>Admin Panel</h2>
        <p>Welcome to the admin dashboard, {user?.email}</p>
      </div>

      <div className="admin-content">
        <div className="admin-card">
          <h3>User Management</h3>
          <p>Manage users, roles, and permissions</p>
          <button className="admin-card-btn" onClick={() => navigate('/apps/admin/manage-users')}>
            Manage Users
          </button>
        </div>

        <div className="admin-card">
          <h3>Content Management</h3>
          <p>Manage courses, blog posts, and other content</p>
          <button className="admin-card-btn" onClick={() => navigate('/apps/admin/manage-content')}>
            Manage Content
          </button>
        </div>

        <div className="admin-card">
          <h3>Analytics</h3>
          <p>View site analytics and statistics</p>
          <button className="admin-card-btn" onClick={() => navigate('/apps/admin/analytics')}>
            View Analytics
          </button>
        </div>

        <div className="admin-card">
          <h3>Settings</h3>
          <p>Configure site settings and preferences</p>
          <button className="admin-card-btn">Settings</button>
        </div>
      </div>
    </div>
  );
}

export default Admin;

