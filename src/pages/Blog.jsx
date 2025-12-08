import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBlogPosts } from '../api/blogsApi';
import './Blog.css';

function Blog() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const postsPerPage = 4;

  useEffect(() => {
    fetchPosts();
  }, [currentPage]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getBlogPosts({ page: currentPage, page_size: postsPerPage });
      setPosts(response.results || []);
      setTotalPages(response.total_pages || 1);
    } catch (err) {
      setError(err.message || 'Failed to load blog posts');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReadMore = (post) => {
    navigate(`/blog/${post.slug || post.id}`);
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
          <h1 className="blog-title">Our Blog</h1>
          <p className="blog-subtitle">
            Insights, tutorials, and updates on software engineering, AI, and automation
          </p>
        </div>
      </div>

      <div className="blog-container">
        {loading ? (
          <div className="blog-loading">
            <div className="spinner"></div>
            <p>Loading blog posts...</p>
          </div>
        ) : error ? (
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
                      <div className="blog-image-placeholder"></div>
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

export default Blog;

