import React, { useState, useEffect } from 'react';
import './Team.css';
import { API_BASE_URL } from '../config/api';

function Team() {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTeamMembers();
  }, []);

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
    } catch (err) {
      setError(err.message);
      setTeamMembers([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="team">
      <div className="team-hero">
        <div className="team-hero-content">
          <h1 className="team-title">Our Team</h1>
          <p className="team-subtitle">
            Meet the talented individuals behind Master of Logic
          </p>
        </div>
      </div>

      <div className="team-container">
        {loading ? (
          <div className="team-loading">
            <div className="spinner"></div>
            <p>Loading team members...</p>
          </div>
        ) : error ? (
          <div className="team-error">Error: {error}</div>
        ) : teamMembers.length === 0 ? (
          <div className="team-empty">No team members available at the moment.</div>
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

