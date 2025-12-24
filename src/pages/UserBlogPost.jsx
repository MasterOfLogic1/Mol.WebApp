import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getBlogPost } from '../api/blogsApi';
import TipTapRenderer from '../components/TipTapRenderer';
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

  const getFirstName = (fullName) => {
    if (!fullName) return 'this user';
    const nameParts = fullName.trim().split(/\s+/);
    return nameParts[0] || 'this user';
  };

  // Check if body is TipTap JSON format
  const isTipTapJSON = (body) => {
    if (!body) return false;
    try {
      const parsed = typeof body === 'string' ? JSON.parse(body) : body;
      return parsed && typeof parsed === 'object' && (parsed.type === 'doc' || parsed.content);
    } catch {
      return false;
    }
  };

  const renderContent = () => {
    if (!post.body) return null;

    // Check if it's TipTap JSON format
    if (isTipTapJSON(post.body)) {
      const content = typeof post.body === 'string' ? JSON.parse(post.body) : post.body;
      return <TipTapRenderer content={content} />;
    }

    // Otherwise, render as markdown (legacy format)
    return (
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[]}
        components={{
          img: ({node, ...props}) => {
            let imageSrc = props.src || '';
            let imageAlt = props.alt || '';
            
            if (!imageSrc && node?.properties) {
              imageSrc = node.properties.src || '';
              imageAlt = node.properties.alt || '';
            }
            
            if (!imageSrc) {
              const markdownText = post.body || '';
              const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
              const matches = [...markdownText.matchAll(imageRegex)];
              if (matches.length > 0) {
                imageAlt = matches[0][1] || '';
                imageSrc = matches[0][2] || '';
              }
            }
            
            if (!imageSrc) {
              return null;
            }
            
            return (
              <img 
                src={imageSrc}
                alt={imageAlt}
                style={{
                  maxWidth: '100%', 
                  height: 'auto', 
                  borderRadius: '8px', 
                  margin: '1.5rem 0',
                  display: 'block'
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            );
          },
          p: ({node, children, ...props}) => {
            const paragraphText = node.children
              ?.map(child => child.type === 'text' ? child.value : '')
              .join('') || '';
            
            if (paragraphText.includes('data:image/') && paragraphText.includes('base64,')) {
              const base64Match = paragraphText.match(/data:image\/[^;]+;base64,[A-Za-z0-9+/=]+/);
              if (base64Match) {
                return (
                  <img 
                    src={base64Match[0]}
                    alt=""
                    style={{
                      maxWidth: '100%', 
                      height: 'auto', 
                      borderRadius: '8px', 
                      margin: '1.5rem 0',
                      display: 'block'
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                );
              }
            }
            return <p {...props}>{children}</p>;
          },
          text: ({node, ...props}) => {
            const text = node.value || '';
            if (text.includes('data:image/') && text.includes('base64,')) {
              const base64Match = text.match(/data:image\/[^;]+;base64,[A-Za-z0-9+/=]+/);
              if (base64Match) {
                return (
                  <img 
                    src={base64Match[0]}
                    alt=""
                    style={{
                      maxWidth: '100%', 
                      height: 'auto', 
                      borderRadius: '8px', 
                      margin: '1.5rem 0',
                      display: 'block'
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                );
              }
            }
            return <>{text}</>;
          }
        }}
      >
        {post.body || ''}
      </ReactMarkdown>
    );
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
          <button onClick={() => navigate(`/journals/user/${username}`)} className="back-btn" title="Back to Profile">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ stroke: '#000000' }}>
              <path d="M19 12H5" stroke="#000000"></path>
              <path d="M12 19l-7-7 7-7" stroke="#000000"></path>
            </svg>
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
        <button onClick={() => navigate(`/journals/user/${username}`)} className="back-btn" title="Back to Profile">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ stroke: '#000000' }}>
            <path d="M19 12H5" stroke="#000000"></path>
            <path d="M12 19l-7-7 7-7" stroke="#000000"></path>
          </svg>
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
          
          <div className="blog-post-body">
            {renderContent()}
          </div>
        </article>
      </div>
    </div>
  );
}

export default UserBlogPost;

