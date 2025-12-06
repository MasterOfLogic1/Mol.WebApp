import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Blog.css';

function Blog() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 4;

  const blogPosts = [
    {
      id: 1,
      title: 'Getting Started with Intelligent Automation',
      excerpt: 'Learn the fundamentals of intelligent automation and how it can transform your business processes. Discover the key concepts and tools needed to begin your automation journey.',
      author: 'Master of Logic',
      date: 'January 15, 2024',
      category: 'Automation',
      readTime: '5 min read',
      image: null
    },
    {
      id: 2,
      title: 'RPA vs AI: Understanding the Differences',
      excerpt: 'Explore the distinctions between Robotic Process Automation (RPA) and Artificial Intelligence (AI), and learn when to use each technology in your automation strategy.',
      author: 'Master of Logic',
      date: 'January 10, 2024',
      category: 'RPA',
      readTime: '7 min read',
      image: null
    },
    {
      id: 3,
      title: 'Building Your First UiPath Workflow',
      excerpt: 'A step-by-step guide to creating your first workflow in UiPath. From installation to deployment, we cover everything you need to know to get started.',
      author: 'David .O',
      date: 'January 5, 2024',
      category: 'UiPath',
      readTime: '10 min read',
      image: null
    },
    {
      id: 4,
      title: 'The Future of AI in Business Automation',
      excerpt: 'Discover how artificial intelligence is revolutionizing business automation and what trends to watch in the coming years.',
      author: 'Master of Logic',
      date: 'December 28, 2023',
      category: 'AI',
      readTime: '8 min read',
      image: null
    },
    {
      id: 5,
      title: 'Best Practices for Process Mining',
      excerpt: 'Learn how to effectively use process mining to identify automation opportunities and optimize your business processes.',
      author: 'Master of Logic',
      date: 'December 20, 2023',
      category: 'Process Mining',
      readTime: '6 min read',
      image: null
    },
    {
      id: 6,
      title: 'Integrating AI Services with APIs',
      excerpt: 'A comprehensive guide to integrating AI services into your applications using REST APIs and modern development practices.',
      author: 'Master of Logic',
      date: 'December 15, 2023',
      category: 'Integration',
      readTime: '9 min read',
      image: null
    },
    {
      id: 7,
      title: 'Cloud Automation Strategies',
      excerpt: 'Explore effective strategies for automating cloud infrastructure and managing resources efficiently in modern cloud environments.',
      author: 'Master of Logic',
      date: 'December 10, 2023',
      category: 'Cloud',
      readTime: '7 min read',
      image: null
    },
    {
      id: 8,
      title: 'Debugging RPA Workflows',
      excerpt: 'Common debugging techniques and best practices for troubleshooting RPA workflows and ensuring reliable automation.',
      author: 'Master of Logic',
      date: 'December 5, 2023',
      category: 'RPA',
      readTime: '6 min read',
      image: null
    },
    {
      id: 9,
      title: 'Machine Learning for Automation',
      excerpt: 'How machine learning algorithms can enhance your automation solutions and create more intelligent, adaptive systems.',
      author: 'Master of Logic',
      date: 'November 28, 2023',
      category: 'AI',
      readTime: '10 min read',
      image: null
    }
  ];

  // Calculate pagination
  const totalPages = Math.ceil(blogPosts.length / postsPerPage);
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = blogPosts.slice(indexOfFirstPost, indexOfLastPost);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReadMore = (postId) => {
    navigate(`/blog/${postId}`);
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
        <div className="blog-grid">
          {currentPosts.map((post) => (
            <article key={post.id} className="blog-card">
              <div className="blog-card-left">
                {post.image ? (
                  <img src={post.image} alt={post.title} className="blog-image" />
                ) : (
                  <div className="blog-image-placeholder"></div>
                )}
              </div>
              <div className="blog-card-right">
                <h2 className="blog-card-title">{post.title}</h2>
                <p className="blog-card-excerpt">{post.excerpt}</p>
                <div className="blog-card-footer">
                  <div className="blog-card-meta">
                    <span className="blog-author">By {post.author}</span>
                    <span className="blog-date">{post.date}</span>
                  </div>
                  <button 
                    className="blog-read-btn"
                    onClick={() => handleReadMore(post.id)}
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
      </div>
    </div>
  );
}

export default Blog;

