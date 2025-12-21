import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBlogPost } from '../api/blogsApi';
import './JournalPost.css';

function UserBlogPost() {
  const { username, slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPost();
  }, [slug]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getBlogPost(slug);
      setPost(data);
    } catch (err) {
      setError(err.message || 'Failed to load blog post');
      setPost(null);
    } finally {
      setLoading(false);
    }
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

  if (loading) {
    return (
      <div className="blog-post">
        <div className="blog-post-container">
          <div className="blog-post-loading">
            <div className="spinner"></div>
            <p>Loading blog post...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="blog-post">
        <div className="blog-post-container">
          <button onClick={() => navigate(`/journals/user/${username}`)} className="back-btn">
            ← Back to Profile
          </button>
          <div className="blog-post-error">
            <h1>Post Not Found</h1>
            <p>{error || 'The blog post you are looking for does not exist.'}</p>
            <button onClick={fetchPost} className="retry-btn">Try Again</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="blog-post">
      <div className="blog-post-container">
        <button onClick={() => navigate(`/journals/user/${username}`)} className="back-btn">
          ← Back to Profile
        </button>
        
        <article className="blog-post-content">
          {post.thumbnail_url && (
            <div className="blog-post-thumbnail">
              <img src={post.thumbnail_url} alt={post.title} />
            </div>
          )}
          
          <div className="blog-post-header">
            {post.tag_names && post.tag_names.length > 0 && (
              <div className="blog-post-tags">
                {post.tag_names.map((tag, index) => (
                  <span key={index} className="blog-post-tag">{tag}</span>
                ))}
              </div>
            )}
          </div>
          
          <h1 className="blog-post-title">{post.title}</h1>
          
          <div className="blog-post-meta">
            <div className="blog-post-author-section">
              {post.creator_thumbnail_url && (
                <img 
                  src={post.creator_thumbnail_url} 
                  alt={post.creator_fullname || 'Author'} 
                  className="blog-post-author-avatar"
                />
              )}
              <span className="blog-post-author">By {post.creator_fullname || 'Master of Logic'}</span>
            </div>
            <span className="blog-post-date">{formatDate(post.date_uploaded)}</span>
          </div>
          
          {post.description && (
            <p className="blog-post-description">{post.description}</p>
          )}
          
          <div 
            className="blog-post-body"
            dangerouslySetInnerHTML={{ __html: post.body || '' }}
          />
        </article>
      </div>
    </div>
  );
}

export default UserBlogPost;

