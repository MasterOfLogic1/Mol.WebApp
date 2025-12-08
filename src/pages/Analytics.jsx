import React, { useState, useEffect } from 'react';
import { getUserStatistics } from '../api/adminApi';
import './Analytics.css';

function Analytics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getUserStatistics();
      setStats(data);
    } catch (err) {
      setError(err.message || 'Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="analytics">
        <div className="analytics-loading">
          <div className="spinner"></div>
          <p>Loading statistics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics">
        <div className="analytics-error">
          <p>Error: {error}</p>
          <button onClick={fetchStatistics} className="retry-btn">Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics">
      <div className="analytics-header">
        <h2>Analytics Dashboard</h2>
        <p>User statistics and insights</p>
      </div>

      <div className="analytics-content">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon total-users">👥</div>
            <div className="stat-info">
              <h3 className="stat-label">Total Users</h3>
              <p className="stat-value">{stats?.total_users || 0}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon active-users">✓</div>
            <div className="stat-info">
              <h3 className="stat-label">Active Users</h3>
              <p className="stat-value">{stats?.active_users || 0}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon inactive-users">○</div>
            <div className="stat-info">
              <h3 className="stat-label">Inactive Users</h3>
              <p className="stat-value">{stats?.inactive_users || 0}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon verified-users">✓</div>
            <div className="stat-info">
              <h3 className="stat-label">Verified Users</h3>
              <p className="stat-value">{stats?.verified_users || 0}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Analytics;

