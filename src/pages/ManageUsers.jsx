import React, { useState, useEffect } from 'react';
import { getUsers, blockUser, updateUserPassword, getUser } from '../api/adminApi';
import './ManageUsers.css';

function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchEmail, setSearchEmail] = useState('');
  const [searchUserId, setSearchUserId] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [currentPage]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getUsers({ page: currentPage, page_size: 10 });
      setUsers(response.results || []);
      setTotalPages(response.total_pages || 1);
    } catch (err) {
      setError(err.message || 'Failed to fetch users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchEmail && !searchUserId) {
      setError('Please enter an email or user ID');
      return;
    }

    try {
      setError('');
      const params = {};
      if (searchEmail) params.email = searchEmail;
      if (searchUserId) params.user_id = searchUserId;
      
      const user = await getUser(params);
      setSearchResult(user);
      setSearchEmail('');
      setSearchUserId('');
    } catch (err) {
      setError(err.message || 'Failed to find user');
      setSearchResult(null);
    }
  };

  const handleBlockUser = async (userId, currentStatus) => {
    if (!window.confirm(`Are you sure you want to ${currentStatus ? 'block' : 'unblock'} this user?`)) {
      return;
    }

    try {
      await blockUser(userId, !currentStatus);
      fetchUsers();
      if (searchResult && searchResult.id === userId) {
        setSearchResult(prev => ({ ...prev, is_active: !currentStatus }));
      }
    } catch (err) {
      setError(err.message || 'Failed to update user status');
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    try {
      setError('');
      await updateUserPassword(selectedUser.id, newPassword);
      setShowPasswordModal(false);
      setSelectedUser(null);
      setNewPassword('');
      alert('Password updated successfully');
    } catch (err) {
      setError(err.message || 'Failed to update password');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const displayUsers = searchResult ? [searchResult] : users;

  return (
    <div className="manage-users">
      <div className="manage-users-header">
        <h2>Manage Users</h2>
      </div>

      {error && <div className="manage-users-error">{error}</div>}

      <div className="search-section">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-inputs">
            <input
              type="email"
              placeholder="Search by email"
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              className="search-input"
            />
            <input
              type="number"
              placeholder="Search by User ID"
              value={searchUserId}
              onChange={(e) => setSearchUserId(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-btn">Search</button>
            {searchResult && (
              <button
                type="button"
                onClick={() => {
                  setSearchResult(null);
                  fetchUsers();
                }}
                className="clear-search-btn"
              >
                Clear Search
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="users-list">
        {loading ? (
          <div className="loading">Loading users...</div>
        ) : displayUsers.length === 0 ? (
          <div className="empty-state">No users found.</div>
        ) : (
          <>
            <div className="users-table">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Email</th>
                    <th>Name</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Verified</th>
                    <th>Date Joined</th>
                    <th>Last Login</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayUsers.map((user) => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>{user.email}</td>
                      <td>
                        {[user.firstname, user.middlename, user.lastname]
                          .filter(Boolean)
                          .join(' ') || 'N/A'}
                      </td>
                      <td>
                        <span className={`role-badge ${user.role_name}`}>
                          {user.role_name}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${user.is_active ? 'active' : 'inactive'}`}>
                          {user.is_active ? 'Active' : 'Blocked'}
                        </span>
                      </td>
                      <td>
                        <span className={`verified-badge ${user.is_verified ? 'verified' : 'unverified'}`}>
                          {user.is_verified ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td>{formatDate(user.date_joined)}</td>
                      <td>{formatDate(user.last_login)}</td>
                      <td>
                        <button
                          onClick={() => handleBlockUser(user.id, user.is_active)}
                          className={`action-btn ${user.is_active ? 'block-btn' : 'unblock-btn'}`}
                        >
                          {user.is_active ? 'Block' : 'Unblock'}
                        </button>
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowPasswordModal(true);
                            setNewPassword('');
                          }}
                          className="action-btn password-btn"
                        >
                          Reset Password
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="users-cards">
              {displayUsers.map((user) => (
                <div key={user.id} className="user-card">
                  <div className="user-card-header">
                    <div>
                      <h3 className="user-card-email">{user.email}</h3>
                      <p className="user-card-name">
                        {[user.firstname, user.middlename, user.lastname]
                          .filter(Boolean)
                          .join(' ') || 'N/A'}
                      </p>
                    </div>
                    <div className="user-card-badges">
                      <span className={`role-badge ${user.role_name}`}>
                        {user.role_name}
                      </span>
                      <span className={`status-badge ${user.is_active ? 'active' : 'inactive'}`}>
                        {user.is_active ? 'Active' : 'Blocked'}
                      </span>
                    </div>
                  </div>
                  <div className="user-card-info">
                    <div className="user-info-item">
                      <span className="info-label">ID:</span>
                      <span>{user.id}</span>
                    </div>
                    <div className="user-info-item">
                      <span className="info-label">Verified:</span>
                      <span className={user.is_verified ? 'verified' : 'unverified'}>
                        {user.is_verified ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div className="user-info-item">
                      <span className="info-label">Date Joined:</span>
                      <span>{formatDate(user.date_joined)}</span>
                    </div>
                    <div className="user-info-item">
                      <span className="info-label">Last Login:</span>
                      <span>{formatDate(user.last_login)}</span>
                    </div>
                    {user.phonenumber && (
                      <div className="user-info-item">
                        <span className="info-label">Phone:</span>
                        <span>{user.phonenumber}</span>
                      </div>
                    )}
                  </div>
                  <div className="user-card-actions">
                    <button
                      onClick={() => handleBlockUser(user.id, user.is_active)}
                      className={`action-btn ${user.is_active ? 'block-btn' : 'unblock-btn'}`}
                    >
                      {user.is_active ? 'Block' : 'Unblock'}
                    </button>
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setShowPasswordModal(true);
                        setNewPassword('');
                      }}
                      className="action-btn password-btn"
                    >
                      Reset Password
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {!searchResult && totalPages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                <span>Page {currentPage} of {totalPages}</span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {showPasswordModal && selectedUser && (
        <div className="modal-overlay" onClick={() => {
          setShowPasswordModal(false);
          setSelectedUser(null);
          setNewPassword('');
        }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Reset Password for {selectedUser.email}</h3>
              <button
                className="modal-close"
                onClick={() => {
                  setShowPasswordModal(false);
                  setSelectedUser(null);
                  setNewPassword('');
                }}
              >
                ×
              </button>
            </div>
            <form onSubmit={handlePasswordUpdate} className="password-form">
              <div className="form-group">
                <label htmlFor="new-password">New Password *</label>
                <input
                  type="password"
                  id="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="Enter new password (min 6 characters)"
                />
              </div>
              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setSelectedUser(null);
                    setNewPassword('');
                  }}
                  className="cancel-btn"
                >
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageUsers;

