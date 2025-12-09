import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBlogPosts } from '../api/blogsApi';
import noBlogPic from '../assets/no-blog-pic.png';
import OfflineEmptyState from '../components/OfflineEmptyState';
import './Journal.css';

const CACHE_KEY = 'journal_posts_cache';
const CACHE_TIMESTAMP_KEY = 'journal_posts_cache_timestamp';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

function Journal() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [isOffline, setIsOffline] = useState(false);
  const postsPerPage = 4;

  useEffect(() => {
    // Load cached data on mount
    loadCachedPosts();
    fetchPosts();
  }, [currentPage]);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      // Try to fetch fresh data when coming back online
      if (posts.length === 0) {
        fetchPosts();
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
  }, [posts.length]);

  const loadCachedPosts = () => {
    try {
      const cachedData = localStorage.getItem(CACHE_KEY);
      const cacheTimestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
      
      if (cachedData && cacheTimestamp) {
        const age = Date.now() - parseInt(cacheTimestamp, 10);
        if (age < CACHE_DURATION) {
          const parsed = JSON.parse(cachedData);
          // Load cached data for current page if available
          const cachedPage = parsed[currentPage];
          if (cachedPage) {
            setPosts(cachedPage.results || []);
            setTotalPages(cachedPage.total_pages || 1);
          }
        }
      }
    } catch (err) {
      console.error('Error loading cached posts:', err);
    }
  };

  const saveToCache = (page, data) => {
    try {
      const cachedData = localStorage.getItem(CACHE_KEY);
      const cache = cachedData ? JSON.parse(cachedData) : {};
      cache[page] = data;
      localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
      localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
    } catch (err) {
      console.error('Error saving to cache:', err);
    }
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getBlogPosts({ page: currentPage, page_size: postsPerPage });
      setPosts(response.results || []);
      setTotalPages(response.total_pages || 1);
      setIsOffline(false);
      
      // Save to cache on successful fetch
      saveToCache(currentPage, {
        results: response.results || [],
        total_pages: response.total_pages || 1,
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
        loadCachedPosts();
        // Only show error if no cached data available
        if (posts.length === 0) {
          setError('No internet connection. Please check your network and try again.');
        }
      } else {
        setError(err.message || 'Failed to load blog posts');
        setPosts([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReadMore = (post) => {
    navigate(`/journals/${post.slug || post.id}`);
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

  return (
    <div className="blog">
      <div className="blog-hero">
        <div className="blog-hero-content">
          <h1 className="blog-title">Masters Journal</h1>
          <p className="blog-subtitle">
            Read articles and journals from experts in fields of interest
          </p>
        </div>
      </div>

      {isOffline && posts.length > 0 && (
        <div className="offline-notice">
          <span className="offline-icon">●</span>
          <span>You might be offline</span>
        </div>
      )}
      <div className="blog-container">
        {loading && !isOffline ? (
          <div className="blog-loading">
            <div className="spinner"></div>
            <p>Loading blog posts...</p>
          </div>
        ) : isOffline && posts.length === 0 ? (
          <OfflineEmptyState onRetry={fetchPosts} />
        ) : error && posts.length === 0 ? (
          <div className="blog-error">
            <p>Error: {error}</p>
            <button onClick={fetchPosts} className="retry-btn">Try Again</button>
          </div>
        ) : posts.length === 0 ? (
          <div className="blog-empty">
            <p>No blog posts available at the moment.</p>
          </div>
        ) : (
          <>
            <div className="blog-grid">
              {posts.map((post) => (
                <article key={post.id} className="blog-card">
                  <div className="blog-card-left">
                    {post.thumbnail_url ? (
                      <img src={post.thumbnail_url} alt={post.title} className="blog-image" />
                    ) : (
                      <img src={noBlogPic} alt={post.title} className="blog-image" />
                    )}
                  </div>
                  <div className="blog-card-right">
                    <h2 className="blog-card-title">{post.title}</h2>
                    <p className="blog-card-excerpt">{post.description}</p>
                    <div className="blog-card-footer">
                      <div className="blog-card-meta">
                        <span className="blog-author">By {post.creator_fullname || 'Master of Logic'}</span>
                        <span className="blog-date">{formatDate(post.date_uploaded)}</span>
                      </div>
                      <button 
                        className="blog-read-btn"
                        onClick={() => handleReadMore(post)}
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

export default Journal;

