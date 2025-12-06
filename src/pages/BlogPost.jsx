import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './BlogPost.css';

function BlogPost() {
  const { id } = useParams();
  const navigate = useNavigate();

  // In a real app, you'd fetch this from an API or database
  // For now, we'll use a simple lookup
  const blogPosts = {
    1: {
      id: 1,
      title: 'Getting Started with Intelligent Automation',
      content: `
        <p>Intelligent automation is revolutionizing the way businesses operate. By combining artificial intelligence with robotic process automation, organizations can achieve unprecedented levels of efficiency and accuracy.</p>
        
        <h2>What is Intelligent Automation?</h2>
        <p>Intelligent automation goes beyond traditional automation by incorporating AI capabilities such as machine learning, natural language processing, and computer vision. This allows systems to learn, adapt, and make decisions autonomously.</p>
        
        <h2>Key Benefits</h2>
        <ul>
          <li>Increased efficiency and productivity</li>
          <li>Reduced errors and improved accuracy</li>
          <li>Cost savings through process optimization</li>
          <li>Enhanced customer experience</li>
          <li>Scalability for business growth</li>
        </ul>
        
        <h2>Getting Started</h2>
        <p>To begin your intelligent automation journey, start by identifying repetitive, rule-based processes that can benefit from automation. Assess your current technology stack and consider tools that integrate well with your existing systems.</p>
        
        <p>Remember, successful automation requires careful planning, stakeholder buy-in, and a commitment to continuous improvement. Start small, measure results, and scale gradually.</p>
      `,
      author: 'Master of Logic',
      date: 'January 15, 2024',
      category: 'Automation',
      readTime: '5 min read'
    },
    2: {
      id: 2,
      title: 'RPA vs AI: Understanding the Differences',
      content: `
        <p>While both Robotic Process Automation (RPA) and Artificial Intelligence (AI) are powerful technologies, they serve different purposes and have distinct capabilities.</p>
        
        <h2>Robotic Process Automation (RPA)</h2>
        <p>RPA focuses on automating repetitive, rule-based tasks by mimicking human interactions with digital systems. It works best with structured data and follows predefined rules.</p>
        
        <h2>Artificial Intelligence (AI)</h2>
        <p>AI, on the other hand, can handle unstructured data, learn from patterns, and make decisions. It's capable of understanding context, natural language, and complex scenarios.</p>
        
        <h2>When to Use Each</h2>
        <p>Use RPA for tasks that are repetitive and follow clear rules. Use AI when you need cognitive capabilities, pattern recognition, or decision-making based on data analysis.</p>
      `,
      author: 'Master of Logic',
      date: 'January 10, 2024',
      category: 'RPA',
      readTime: '7 min read'
    }
    // Add more posts as needed
  };

  const post = blogPosts[id];

  if (!post) {
    return (
      <div className="blog-post">
        <div className="blog-post-container">
          <h1>Post Not Found</h1>
          <button onClick={() => navigate('/blog')} className="back-btn">
            Back to Blog
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="blog-post">
      <div className="blog-post-container">
        <button onClick={() => navigate('/blog')} className="back-btn">
          ← Back to Blog
        </button>
        
        <article className="blog-post-content">
          <div className="blog-post-header">
            <span className="blog-post-category">{post.category}</span>
            <span className="blog-post-read-time">{post.readTime}</span>
          </div>
          
          <h1 className="blog-post-title">{post.title}</h1>
          
          <div className="blog-post-meta">
            <span className="blog-post-author">By {post.author}</span>
            <span className="blog-post-date">{post.date}</span>
          </div>
          
          <div 
            className="blog-post-body"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>
      </div>
    </div>
  );
}

export default BlogPost;

