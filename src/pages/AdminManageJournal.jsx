import React, { useState, useEffect } from 'react';
import JournalEditor from '../components/JournalEditor';
import { marked } from 'marked';
import { getBlogPosts, createBlogPost, updateBlogPost, deleteBlogPost } from '../api/blogsApi';
import './ManageContent.css';

function AdminManageJournal() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [descriptionError, setDescriptionError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    body: null,
    tag_names: [],
    thumbnail: null,
  });
  const [tagInput, setTagInput] = useState('');
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchPosts();
  }, [currentPage]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await getBlogPosts({ page: currentPage, page_size: 10 });
      setPosts(response.results || []);
      setTotalPages(response.total_pages || 1);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to fetch blog posts');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'thumbnail' && files && files[0]) {
      const file = files[0];
      setFormData(prev => ({
        ...prev,
        thumbnail: file,
      }));
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
      
      // Validate description length
      if (name === 'description') {
        if (value.length > 258) {
          setDescriptionError(`Description must be 258 characters or less. Current: ${value.length}`);
        } else {
          setDescriptionError('');
        }
      }
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tag_names.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tag_names: [...prev.tag_names, tagInput.trim()],
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tag_names: prev.tag_names.filter(tag => tag !== tagToRemove),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setDescriptionError('');

    // Validate description length before submission
    if (formData.description.length > 258) {
      setDescriptionError(`Description must be 258 characters or less. Current: ${formData.description.length}`);
      return;
    }

    try {
      // Save TipTap JSON format (same as ManageJournal)
      const payload = { ...formData, body: JSON.stringify(formData.body) };
      
      if (editingPost) {
        await updateBlogPost(editingPost.id, payload);
      } else {
        await createBlogPost(payload);
      }
      setShowForm(false);
      setEditingPost(null);
      resetForm();
      fetchPosts();
    } catch (err) {
      setError(err.message || 'Failed to save blog post');
    }
  };

  const handleEdit = (post) => {
    try {
      setEditingPost(post);
      
      // Handle body format - could be JSON string, markdown, or HTML
      let bodyContent = null;
      if (post.body) {
        try {
          // Try parsing as JSON first (TipTap format)
          const parsed = typeof post.body === 'string' ? JSON.parse(post.body) : post.body;
          // Check if it's a valid TipTap JSON structure
          if (parsed && typeof parsed === 'object' && (parsed.type === 'doc' || parsed.content)) {
            bodyContent = parsed;
          } else {
            // Not valid TipTap JSON, treat as markdown
            throw new Error('Not TipTap JSON');
          }
        } catch {
          // If not JSON, treat as markdown and convert to HTML
          // TipTap can accept HTML directly
          let htmlBody = typeof post.body === 'string' ? post.body : String(post.body);
          
          // Convert markdown images to HTML img tags first
          const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
          htmlBody = htmlBody.replace(imageRegex, (match, alt, src) => {
            const escapedAlt = alt.replace(/"/g, '&quot;');
            return `<img src="${src}" alt="${escapedAlt}" />`;
          });
          
          // Parse markdown to HTML
          htmlBody = marked.parse(htmlBody);
          bodyContent = htmlBody;
        }
      }
      
      const wasFormOpen = showForm;
      setFormData({
        title: post.title || '',
        description: post.description || '',
        body: bodyContent,
        tag_names: post.tag_names || [],
        thumbnail: null,
      });
      setThumbnailPreview(post.thumbnail_url || null);
      setShowForm(true);
      // Scroll to top only if form wasn't already open
      if (!wasFormOpen) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err) {
      console.error('Error in handleEdit:', err);
      setError(`Failed to load post for editing: ${err.message}`);
    }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this blog post?')) {
      return;
    }

    try {
      await deleteBlogPost(postId);
      fetchPosts();
    } catch (err) {
      setError(err.message || 'Failed to delete blog post');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      body: null,
      tag_names: [],
      thumbnail: null,
    });
    setTagInput('');
    setThumbnailPreview(null);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingPost(null);
    resetForm();
  };

  return (
    <div className="manage-content">
      <div className="manage-content-header">
        <h2>Manage Journal</h2>
        <button 
          className="manage-content-btn" 
          onClick={() => {
            setShowForm(true);
            resetForm();
          }}
        >
          Create Post
        </button>
      </div>

      {error && <div className="manage-content-error">{error}</div>}

      {showForm && (
        <div className="manage-content-form-wrapper">
          <form className="manage-content-form" onSubmit={handleSubmit}>
            <div className="form-header">
              <h3>{editingPost ? 'Edit Blog Post' : 'Create New Blog Post'}</h3>
              <button type="button" onClick={handleCancel} className="form-close-btn">×</button>
            </div>

            <div className="form-group">
              <label htmlFor="title">Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description *</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows="3"
              />
              <div className={`description-char-count ${formData.description.length > 258 ? 'error' : ''}`}>
                {formData.description.length} / 258 characters
              </div>
              {descriptionError && (
                <div className="form-error-message">{descriptionError}</div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="thumbnail">Thumbnail Image</label>
              <input
                type="file"
                id="thumbnail"
                name="thumbnail"
                accept="image/*"
                onChange={handleInputChange}
              />
              {thumbnailPreview && (
                <div className="thumbnail-preview">
                  <img src={thumbnailPreview} alt="Thumbnail preview" />
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, thumbnail: null }));
                      setThumbnailPreview(null);
                      const fileInput = document.getElementById('thumbnail');
                      if (fileInput) fileInput.value = '';
                    }}
                    className="thumbnail-remove-btn"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="body">Body *</label>
              <JournalEditor
                value={formData.body}
                onChange={(json) => setFormData(prev => ({ ...prev, body: json }))}
              />
            </div>

            <div className="form-group">
              <label htmlFor="tags">Tags</label>
              <div className="tag-input-wrapper">
                <input
                  type="text"
                  id="tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  placeholder="Type tag and press Enter"
                />
                <button type="button" onClick={handleAddTag} className="tag-add-btn">
                  Add
                </button>
              </div>
              <div className="tags-list">
                {formData.tag_names.map((tag, index) => (
                  <span key={index} className="tag-item">
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="tag-remove-btn"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="form-actions">
              <button type="button" onClick={handleCancel} className="cancel-btn">
                Cancel
              </button>
              <button type="submit" className="submit-btn">
                {editingPost ? 'Update Post' : 'Create Post'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="manage-content-list">
        {loading ? (
          <div className="loading">Loading posts...</div>
        ) : posts.length === 0 ? (
          <div className="empty-state">No blog posts found. Create your first post!</div>
        ) : (
          <>
            <div className="posts-table">
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Description</th>
                    <th>Creator</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {posts.map((post) => (
                    <tr key={post.id}>
                      <td>{post.title}</td>
                      <td>{post.description}</td>
                      <td>{post.creator_fullname || 'N/A'}</td>
                      <td>{new Date(post.date_uploaded).toLocaleDateString()}</td>
                      <td>
                        <button
                          onClick={() => handleEdit(post)}
                          className="action-btn edit-btn"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(post.id)}
                          className="action-btn delete-btn"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="posts-cards">
              {posts.map((post) => (
                <div key={post.id} className="post-card">
                  <div className="post-card-header">
                    <h3 className="post-card-title">{post.title}</h3>
                    <span className="post-card-date">{new Date(post.date_uploaded).toLocaleDateString()}</span>
                  </div>
                  <div className="post-card-meta">
                    <span className="post-card-creator">By {post.creator_fullname || 'N/A'}</span>
                  </div>
                  <p className="post-card-description">{post.description}</p>
                  <div className="post-card-actions">
                    <button
                      onClick={() => handleEdit(post)}
                      className="action-btn edit-btn"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="action-btn delete-btn"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                <span>Page {currentPage} of {totalPages}</span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
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

export default AdminManageJournal;

