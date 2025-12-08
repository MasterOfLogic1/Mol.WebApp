import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBlogPosts, getUserProfile } from '../api/blogsApi';
import './UserBlog.css';

function UserBlog() {
  const { username } = useParams();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const postsPerPage = 4;

  useEffect(() => {
    fetchUserData();
  }, [username, currentPage]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch user profile and posts in parallel
      const [profileData, postsData] = await Promise.all([
        getUserProfile(username),
        getBlogPosts({ username, page: currentPage, page_size: postsPerPage })
      ]);
      
      setUserProfile(profileData);
      setPosts(postsData.results || []);
      setTotalPages(postsData.total_pages || 1);
    } catch (err) {
      setError(err.message || 'Failed to load user profile');
      setUserProfile(null);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getUserFullName = () => {
    if (!userProfile?.profile) return 'N/A';
    const { firstname, middlename, lastname } = userProfile.profile;
    return [firstname, middlename, lastname].filter(Boolean).join(' ') || 'N/A';
  };

  if (loading) {
    return (
      <div className="user-blog">
        <div className="user-blog-loading">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !userProfile) {
    return (
      <div className="user-blog">
        <div className="user-blog-error">
          <h1>User Not Found</h1>
          <p>{error || 'The user you are looking for does not exist.'}</p>
          <button onClick={() => navigate('/blog')} className="back-btn">
            Back to Blog
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="user-blog">
      <div className="user-blog-hero">
        <div className="user-blog-hero-content">
          <div className="user-profile-header">
            <div className="user-profile-info">
              <h1 className="user-profile-name">{getUserFullName()}</h1>
              <p className="user-profile-username">@{userProfile.username}</p>
              {userProfile.profile && (
                <div className="user-profile-meta">
                  <span className="user-role-badge">{userProfile.role_name}</span>
                  {userProfile.is_verified && (
                    <span className="user-verified-badge">✓ Verified</span>
                  )}
                </div>
              )}
            </div>
            <div className="user-profile-stats">
              <div className="stat-item">
                <span className="stat-value">{posts.length}</span>
                <span className="stat-label">Posts</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{formatDate(userProfile.date_joined)}</span>
                <span className="stat-label">Joined</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="user-blog-container">
        {posts.length === 0 ? (
          <div className="user-blog-empty">
            <p>No blog posts found from this user.</p>
            <button onClick={() => navigate('/blog')} className="back-btn">
              Back to Blog
            </button>
          </div>
        ) : (
          <>
            <div className="user-blog-grid">
              {posts.map((post) => (
                <article key={post.id} className="user-blog-card">
                  <div className="user-blog-card-left">
                    {post.thumbnail_url ? (
                      <img src={post.thumbnail_url} alt={post.title} className="user-blog-image" />
                    ) : (
                      <div className="user-blog-image-placeholder"></div>
                    )}
                  </div>
                  <div className="user-blog-card-right">
                    <h2 className="user-blog-card-title">{post.title}</h2>
                    <p className="user-blog-card-excerpt">{post.description}</p>
                    <div className="user-blog-card-footer">
                      <span className="user-blog-card-date">{formatDate(post.date_uploaded)}</span>
                      <button 
                        className="user-blog-read-btn"
                        onClick={() => navigate(`/blog/${post.slug || post.id}`)}
                      >
                        Read More →
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="pagination-btn"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                <div className="pagination-numbers">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      className={`pagination-number ${currentPage === page ? 'active' : ''}`}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  className="pagination-btn"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default UserBlog;

