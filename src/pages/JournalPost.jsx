import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getBlogPost } from '../api/blogsApi';
import './JournalPost.css';

function JournalPost() {
  const { slug } = useParams();
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
          <button onClick={() => navigate('/journals')} className="back-btn">
            ← Back to Journals
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
        <button onClick={() => navigate('/journals')} className="back-btn">
          ← Back to Journals
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
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[]}
              components={{
                img: ({node, ...props}) => {
                  // Extract src and alt - ReactMarkdown passes them in different ways
                  let imageSrc = props.src || '';
                  let imageAlt = props.alt || '';
                  
                  // If src is empty, try to get it from node properties
                  if (!imageSrc && node?.properties) {
                    imageSrc = node.properties.src || '';
                    imageAlt = node.properties.alt || '';
                  }
                  
                  // If still no src, try to extract from the markdown directly
                  if (!imageSrc) {
                    const markdownText = post.body || '';
                    // Match markdown image syntax: ![alt](url) - handle both regular and base64 URLs
                    const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
                    const matches = [...markdownText.matchAll(imageRegex)];
                    if (matches.length > 0) {
                      // Use the first match (you might want to handle multiple images differently)
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
                // Handle paragraph nodes that might contain base64 URLs as text
                p: ({node, children, ...props}) => {
                  // Check if paragraph contains text with base64 image
                  const paragraphText = node.children
                    ?.map(child => child.type === 'text' ? child.value : '')
                    .join('') || '';
                  
                  if (paragraphText.includes('data:image/') && paragraphText.includes('base64,')) {
                    // Extract the full base64 URL (may span multiple text nodes)
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
                // Handle text nodes that might contain base64 URLs
                text: ({node, ...props}) => {
                  const text = node.value || '';
                  // Check if this text looks like a base64 image URL
                  if (text.includes('data:image/') && text.includes('base64,')) {
                    // Extract the full base64 URL
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
          </div>
          
          {post.creator_username && (
            <div className="blog-post-author-section">
              <button 
                onClick={() => navigate(`/journals/user/${post.creator_username}`)}
                className="view-more-articles-btn"
              >
                View more articles from this user →
              </button>
            </div>
          )}
        </article>
      </div>
    </div>
  );
}

export default JournalPost;

