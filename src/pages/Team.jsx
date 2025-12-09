import React, { useState, useEffect } from 'react';
import './Team.css';
import { API_BASE_URL } from '../config/api';
import OfflineEmptyState from '../components/OfflineEmptyState';

const CACHE_KEY = 'team_members_cache';
const CACHE_TIMESTAMP_KEY = 'team_members_cache_timestamp';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

function Team() {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    // Load cached data on mount
    loadCachedTeamMembers();
    fetchTeamMembers();
  }, []);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      // Try to fetch fresh data when coming back online
      if (teamMembers.length === 0) {
        fetchTeamMembers();
      }
    };
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check initial status
    setIsOffline(!navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [teamMembers.length]);

  const loadCachedTeamMembers = () => {
    try {
      const cachedData = localStorage.getItem(CACHE_KEY);
      const cacheTimestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
      
      if (cachedData && cacheTimestamp) {
        const age = Date.now() - parseInt(cacheTimestamp, 10);
        if (age < CACHE_DURATION) {
          const parsed = JSON.parse(cachedData);
          setTeamMembers(parsed.results || []);
        }
      }
    } catch (err) {
      console.error('Error loading cached team members:', err);
    }
  };

  const saveToCache = (data) => {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(data));
      localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
    } catch (err) {
      console.error('Error saving to cache:', err);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/team/?page=1&page_size=12`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch team members');
      }
      
      const data = await response.json();
      setTeamMembers(data.results || []);
      setError(null);
      setIsOffline(false);
      
      // Save to cache on successful fetch
      saveToCache({
        results: data.results || [],
      });
    } catch (err) {
      // Check if it's a network error
      const isNetworkError = !navigator.onLine || 
                            err.message.includes('Failed to fetch') ||
                            err.message.includes('NetworkError') ||
                            err.message.includes('network');
      
      if (isNetworkError) {
        setIsOffline(true);
        // Try to load from cache
        loadCachedTeamMembers();
        // Only show error if no cached data available
        if (teamMembers.length === 0) {
          setError('No internet connection. Please check your network and try again.');
        }
      } else {
        setError(err.message);
        setTeamMembers([]);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="team">
      {isOffline && teamMembers.length > 0 && (
        <div className="offline-notice">
          <span className="offline-icon">●</span>
          <span>You might be offline</span>
        </div>
      )}
      <div className="team-hero">
        <div className="team-hero-content">
          <h1 className="team-title">Our Team</h1>
          <p className="team-subtitle">
            Meet the talented individuals behind Master of Logic
          </p>
        </div>
      </div>

      <div className="team-container">
        {loading && !isOffline ? (
          <div className="team-loading">
            <div className="spinner"></div>
            <p>Loading team members...</p>
          </div>
        ) : isOffline && teamMembers.length === 0 ? (
          <OfflineEmptyState onRetry={fetchTeamMembers} />
        ) : error && teamMembers.length === 0 ? (
          <div className="team-error">Error: {error}</div>
        ) : teamMembers.length === 0 ? (
          <div className="team-empty">
            No team members available at the moment.
          </div>
        ) : (
          <div className="team-grid">
            {teamMembers.map((member) => (
              <div key={member.id} className="team-card">
                <div className="team-card-image-wrapper">
                  {member.avatar_url ? (
                    <img src={member.avatar_url} alt={member.full_name} className="team-card-image" />
                  ) : (
                    <div className="team-image-placeholder"></div>
                  )}
                </div>
                <div className="team-card-content">
                  <h2 className="team-card-name">{member.full_name}</h2>
                  <p className="team-card-role">{member.occupation}</p>
                  <p className="team-card-bio">{member.bio}</p>
                  <div className="team-card-links">
                    {member.email_url && (
                      <a href={`mailto:${member.email_url}`} className="team-link">
                        Email
                      </a>
                    )}
                    {member.linkedin_url && (
                      <a href={member.linkedin_url} target="_blank" rel="noopener noreferrer" className="team-link">
                        LinkedIn
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Team;

