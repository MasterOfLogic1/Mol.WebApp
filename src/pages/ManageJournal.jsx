import React, { useEffect, useState } from "react";
import JournalEditor from "../components/JournalEditor";
import {
  getBlogPosts,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost
} from "../api/blogsApi";
import { useAuth } from "../context/AuthContext";
import { marked } from "marked";
import "./ManageContent.css";

function ManageJournal() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    body: null,
    tag_names: [],
    thumbnail: null
  });
  const [thumbnailPreview, setThumbnailPreview] = useState(null);

  useEffect(() => {
    if (user?.username) fetchPosts();
  }, [user?.username]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await getBlogPosts({ username: user.username });
      setPosts(res.results || []);
      setError("");
    } catch {
      setError("Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData, body: JSON.stringify(formData.body) };
      if (editingPost) {
        await updateBlogPost(editingPost.id, payload);
      } else {
        await createBlogPost(payload);
      }
      resetForm();
      fetchPosts();
    } catch {
      setError("Failed to save post");
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
      
      setFormData({
        title: post.title || "",
        description: post.description || "",
        body: bodyContent,
        tag_names: post.tag_names || [],
        thumbnail: null
      });
      setThumbnailPreview(post.thumbnail_url || null);
      setShowForm(true);
    } catch (err) {
      console.error('Error in handleEdit:', err);
      setError(`Failed to load post for editing: ${err.message}`);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this post?")) return;
    await deleteBlogPost(id);
    fetchPosts();
  };

  const resetForm = () => {
    setFormData({ title: "", description: "", body: null, tag_names: [], thumbnail: null });
    setThumbnailPreview(null);
    setEditingPost(null);
    setShowForm(false);
  };

  return (
    <div className="manage-content">
      <div className="manage-content-header">
        <h2>My Journal</h2>
        <button className="manage-content-btn" onClick={() => setShowForm(true)}>Create</button>
      </div>

      {error && <div className="manage-content-error">{error}</div>}

      {showForm && (
        <div className="manage-content-form-wrapper">
          <form onSubmit={handleSubmit} className="manage-content-form">
            <div className="form-header">
              <h3>{editingPost ? "Edit Journal Post" : "Create New Journal Post"}</h3>
              <button type="button" onClick={resetForm} className="form-close-btn">×</button>
            </div>

            <div className="form-group">
              <label htmlFor="title">Title *</label>
              <input
                type="text"
                id="title"
                placeholder="Title"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description (max 258 chars) *</label>
              <textarea
                id="description"
                placeholder="Description (max 258 chars)"
                maxLength={258}
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label htmlFor="thumbnail">Thumbnail Image</label>
              <input
                type="file"
                id="thumbnail"
                name="thumbnail"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setFormData(prev => ({ ...prev, thumbnail: file }));
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setThumbnailPreview(reader.result);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
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
              <label>Content *</label>
              <JournalEditor
                value={formData.body}
                onChange={(json) => setFormData(prev => ({ ...prev, body: json }))}
              />
            </div>

            <div className="form-actions">
              <button type="button" onClick={resetForm} className="cancel-btn">Cancel</button>
              <button type="submit" className="submit-btn">{editingPost ? "Update" : "Create"}</button>
            </div>
          </form>
        </div>
      )}

      <div className="manage-content-list">
        {loading ? (
          <div className="loading">Loading posts...</div>
        ) : posts.length === 0 ? (
          <div className="empty-state">No journal posts yet. Create your first one!</div>
        ) : (
          <>
            <div className="posts-table">
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Description</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {posts.map((post) => (
                    <tr key={post.id}>
                      <td>{post.title}</td>
                      <td>{post.description}</td>
                      <td>{post.date_uploaded ? new Date(post.date_uploaded).toLocaleDateString() : 'N/A'}</td>
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
                    {post.date_uploaded && (
                      <span className="post-card-date">{new Date(post.date_uploaded).toLocaleDateString()}</span>
                    )}
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
          </>
        )}
      </div>
    </div>
  );
}

export default ManageJournal;