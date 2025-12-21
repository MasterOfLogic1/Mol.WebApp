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

  // Update meta tags for social media sharing
  useEffect(() => {
    // Set meta tags immediately, even if userProfile is not loaded yet
    // This ensures crawlers see something, and we'll update when profile loads
    if (!userProfile) {
      // Set a default title based on username while loading
      const defaultTitle = `Read journals by @${username} | Master of Logic`;
      document.title = defaultTitle;
      
      // Set default Open Graph tags
      const existingMetaTags = document.querySelectorAll('meta[property^="og:"], meta[name^="twitter:"], meta[name="description"]');
      existingMetaTags.forEach(tag => tag.remove());
      
      const ogTitle = document.createElement('meta');
      ogTitle.setAttribute('property', 'og:title');
      ogTitle.setAttribute('content', defaultTitle);
      document.head.appendChild(ogTitle);
      
      return;
    }

    // Get full name
    const getFullName = () => {
      if (!userProfile?.profile) return 'N/A';
      const { firstname, middlename, lastname } = userProfile.profile;
      return [firstname, middlename, lastname].filter(Boolean).join(' ') || 'N/A';
    };

    const fullName = getFullName();
    const bio = userProfile.bio || userProfile.profile?.bio || '';
    let profileImage = userProfile.profile?.thumbnail_url || userProfile.thumbnail_url || '';
    
    // Ensure image URL is absolute for Open Graph
    if (profileImage && !profileImage.startsWith('http')) {
      profileImage = `${window.location.origin}${profileImage}`;
    }
    
    const currentUrl = window.location.href;
    const title = `Read journals by ${fullName} | Master of Logic`;
    const description = bio || `Explore articles and journals written by ${fullName} on Master of Logic.`;

    // Update document title
    document.title = title;

    // Remove existing meta tags if any
    const existingMetaTags = document.querySelectorAll('meta[property^="og:"], meta[name^="twitter:"], meta[name="description"]');
    existingMetaTags.forEach(tag => tag.remove());

    // Add standard meta description
    const metaDescription = document.createElement('meta');
    metaDescription.setAttribute('name', 'description');
    metaDescription.setAttribute('content', description);
    document.head.appendChild(metaDescription);

    // Create and add Open Graph meta tags
    const ogTags = [
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:type', content: 'profile' },
      { property: 'og:url', content: currentUrl },
      { property: 'og:site_name', content: 'Master of Logic' },
      { property: 'og:locale', content: 'en_US' },
    ];

    if (profileImage) {
      ogTags.push(
        { property: 'og:image', content: profileImage },
        { property: 'og:image:secure_url', content: profileImage },
        { property: 'og:image:type', content: 'image/jpeg' },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' }
      );
    }

    ogTags.forEach(tag => {
      const meta = document.createElement('meta');
      meta.setAttribute('property', tag.property);
      meta.setAttribute('content', tag.content);
      document.head.appendChild(meta);
    });

    // Create and add Twitter Card meta tags
    const twitterTags = [
      { name: 'twitter:card', content: 'summary' },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description },
    ];

    if (profileImage) {
      twitterTags.push({ name: 'twitter:image', content: profileImage });
    }

    twitterTags.forEach(tag => {
      const meta = document.createElement('meta');
      meta.setAttribute('name', tag.name);
      meta.setAttribute('content', tag.content);
      document.head.appendChild(meta);
    });

    // Cleanup function to remove meta tags when component unmounts
    return () => {
      const metaTags = document.querySelectorAll('meta[property^="og:"], meta[name^="twitter:"], meta[name="description"]');
      metaTags.forEach(tag => tag.remove());
      document.title = 'Master of Logic - Software Engineering, AI & Automation';
    };
  }, [userProfile]);

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
          <button onClick={() => navigate('/journals')} className="back-btn">
            Back to Journals
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="user-blog">
      <div className="user-profile-section">
        <div className="user-profile-container">
          <div className="user-profile-header">
            <div className="user-profile-cover"></div>
            <div className="user-profile-content">
              <div className="user-profile-main">
                <div className="user-profile-avatar">
                  {(userProfile.profile?.thumbnail_url || userProfile.thumbnail_url) ? (
                    <div className="user-avatar-image">
                      <img src={userProfile.profile?.thumbnail_url || userProfile.thumbnail_url} alt={getUserFullName()} />
                    </div>
                  ) : (
                    <div className="user-avatar-placeholder">
                      {getUserFullName()
                        .split(' ')
                        .map(n => n[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2)}
                    </div>
                  )}
                </div>
                <div className="user-profile-details">
                  <div className="user-profile-name-section">
                    <h1 className="user-profile-name">{getUserFullName()}</h1>
                    {userProfile.is_verified && (
                      <span className="user-verified-icon" title="Verified">✓</span>
                    )}
                  </div>
                  <p className="user-profile-username">@{userProfile.username}</p>
                  {(userProfile.occupation || userProfile.profile?.occupation) && (
                    <p className="user-profile-occupation">{userProfile.occupation || userProfile.profile?.occupation}</p>
                  )}
                  {(userProfile.bio || userProfile.profile?.bio) && (
                    <p className="user-profile-bio">{userProfile.bio || userProfile.profile?.bio}</p>
                  )}
                  <div className="user-profile-meta">
                    <span className="user-role-badge">{userProfile.role_name}</span>
                    <span className="user-joined-date">Joined {formatDate(userProfile.date_joined)}</span>
                    <span className="user-post-count">{posts.length} {posts.length === 1 ? 'Post' : 'Posts'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="user-blog-container">
        {posts.length === 0 ? (
          <div className="user-blog-empty">
            <p>No blog posts found from this user.</p>
            <button onClick={() => navigate('/journals')} className="back-btn">
              Back to Journals
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
                        onClick={() => navigate(`/journals/user/${username}/${post.slug || post.id}`)}
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

