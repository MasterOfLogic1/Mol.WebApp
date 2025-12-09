import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { getBlogPosts, createBlogPost, updateBlogPost, deleteBlogPost } from '../api/blogsApi';
import { getCourses, createCourse, updateCourse, deleteCourse } from '../api/courseApi';
import { getTeamMembers, createTeamMember, updateTeamMember, deleteTeamMember } from '../api/teamApi';
import './ManageContent.css';

function ManageContent() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [descriptionError, setDescriptionError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    body: '',
    tag_names: [],
    thumbnail: null,
  });
  const [tagInput, setTagInput] = useState('');
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isBlogCollapsed, setIsBlogCollapsed] = useState(false);
  const [isCourseCollapsed, setIsCourseCollapsed] = useState(true);
  const [isTeamCollapsed, setIsTeamCollapsed] = useState(true);
  
  // Course state
  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [coursesError, setCoursesError] = useState('');
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [courseFormData, setCourseFormData] = useState({
    title: '',
    description: '',
    url: '',
    thumbnail: null,
  });
  const [courseThumbnailPreview, setCourseThumbnailPreview] = useState(null);
  const [courseCurrentPage, setCourseCurrentPage] = useState(1);
  const [courseTotalPages, setCourseTotalPages] = useState(1);

  // Team state
  const [teamMembers, setTeamMembers] = useState([]);
  const [teamLoading, setTeamLoading] = useState(true);
  const [teamError, setTeamError] = useState('');
  const [showTeamForm, setShowTeamForm] = useState(false);
  const [editingTeamMember, setEditingTeamMember] = useState(null);
  const [teamFormData, setTeamFormData] = useState({
    full_name: '',
    occupation: '',
    bio: '',
    avatar_url: '',
    email_url: '',
    linkedin_url: '',
  });
  const [teamCurrentPage, setTeamCurrentPage] = useState(1);
  const [teamTotalPages, setTeamTotalPages] = useState(1);

  useEffect(() => {
    fetchPosts();
  }, [currentPage]);

  useEffect(() => {
    if (!isCourseCollapsed) {
      fetchCourses();
    }
  }, [courseCurrentPage, isCourseCollapsed]);

  useEffect(() => {
    if (!isTeamCollapsed) {
      fetchTeamMembers();
    }
  }, [teamCurrentPage, isTeamCollapsed]);

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
      if (editingPost) {
        await updateBlogPost(editingPost.id, formData);
      } else {
        await createBlogPost(formData);
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
    setEditingPost(post);
    setFormData({
      title: post.title || '',
      description: post.description || '',
      body: post.body || '',
      tag_names: post.tag_names || [],
      thumbnail: null,
    });
    setThumbnailPreview(post.thumbnail_url || null);
    setShowForm(true);
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
      body: '',
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

  // Course functions
  const fetchCourses = async () => {
    try {
      setCoursesLoading(true);
      const response = await getCourses({ page: courseCurrentPage, page_size: 10 });
      setCourses(response.results || []);
      setCourseTotalPages(response.total_pages || 1);
      setCoursesError('');
    } catch (err) {
      setCoursesError(err.message || 'Failed to fetch courses');
      setCourses([]);
    } finally {
      setCoursesLoading(false);
    }
  };

  const handleCourseInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'thumbnail' && files && files[0]) {
      const file = files[0];
      setCourseFormData(prev => ({
        ...prev,
        thumbnail: file,
      }));
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setCourseThumbnailPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setCourseFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleCourseSubmit = async (e) => {
    e.preventDefault();
    setCoursesError('');

    try {
      if (editingCourse) {
        await updateCourse(editingCourse.id, courseFormData);
      } else {
        await createCourse(courseFormData);
      }
      setShowCourseForm(false);
      setEditingCourse(null);
      resetCourseForm();
      fetchCourses();
    } catch (err) {
      setCoursesError(err.message || 'Failed to save course');
    }
  };

  const handleCourseEdit = (course) => {
    setEditingCourse(course);
    setCourseFormData({
      title: course.title || '',
      description: course.description || '',
      url: course.url || '',
      thumbnail: null,
    });
    setCourseThumbnailPreview(course.thumbnail_url || null);
    setShowCourseForm(true);
  };

  const handleCourseDelete = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course?')) {
      return;
    }

    try {
      await deleteCourse(courseId);
      fetchCourses();
    } catch (err) {
      setCoursesError(err.message || 'Failed to delete course');
    }
  };

  const resetCourseForm = () => {
    setCourseFormData({
      title: '',
      description: '',
      url: '',
      thumbnail: null,
    });
    setCourseThumbnailPreview(null);
  };

  const handleCourseCancel = () => {
    setShowCourseForm(false);
    setEditingCourse(null);
    resetCourseForm();
  };

  // Team functions
  const fetchTeamMembers = async () => {
    try {
      setTeamLoading(true);
      const response = await getTeamMembers({ page: teamCurrentPage, page_size: 10 });
      setTeamMembers(response.results || []);
      setTeamTotalPages(response.total_pages || 1);
      setTeamError('');
    } catch (err) {
      setTeamError(err.message || 'Failed to fetch team members');
      setTeamMembers([]);
    } finally {
      setTeamLoading(false);
    }
  };

  const handleTeamInputChange = (e) => {
    const { name, value } = e.target;
    setTeamFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTeamSubmit = async (e) => {
    e.preventDefault();
    setTeamError('');

    try {
      if (editingTeamMember) {
        await updateTeamMember(editingTeamMember.id, teamFormData);
      } else {
        await createTeamMember(teamFormData);
      }
      setShowTeamForm(false);
      setEditingTeamMember(null);
      resetTeamForm();
      fetchTeamMembers();
    } catch (err) {
      setTeamError(err.message || 'Failed to save team member');
    }
  };

  const handleTeamEdit = (member) => {
    setEditingTeamMember(member);
    setTeamFormData({
      full_name: member.full_name || '',
      occupation: member.occupation || '',
      bio: member.bio || '',
      avatar_url: member.avatar_url || '',
      email_url: member.email_url || '',
      linkedin_url: member.linkedin_url || '',
    });
    setShowTeamForm(true);
  };

  const handleTeamDelete = async (memberId) => {
    if (!window.confirm('Are you sure you want to delete this team member?')) {
      return;
    }

    try {
      await deleteTeamMember(memberId);
      fetchTeamMembers();
    } catch (err) {
      setTeamError(err.message || 'Failed to delete team member');
    }
  };

  const resetTeamForm = () => {
    setTeamFormData({
      full_name: '',
      occupation: '',
      bio: '',
      avatar_url: '',
      email_url: '',
      linkedin_url: '',
    });
  };

  const handleTeamCancel = () => {
    setShowTeamForm(false);
    setEditingTeamMember(null);
    resetTeamForm();
  };

  return (
    <div className="manage-content">
      {/* Blog Post Section */}
      <div className="manage-content-section">
        <div className="manage-content-section-header" onClick={() => setIsBlogCollapsed(!isBlogCollapsed)}>
          <div className="manage-content-section-title">
            <h2>Blog Post</h2>
            <span className="collapse-icon">{isBlogCollapsed ? '▼' : '▲'}</span>
          </div>
          {!isBlogCollapsed && (
            <button 
              className="manage-content-btn" 
              onClick={(e) => { 
                e.stopPropagation(); 
                setShowForm(true); 
                resetForm(); 
              }}
            >
              Create
            </button>
          )}
        </div>

        {!isBlogCollapsed && (
          <>
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
              <ReactQuill
                theme="snow"
                value={formData.body}
                onChange={(value) => setFormData(prev => ({ ...prev, body: value }))}
                modules={{
                  toolbar: [
                    [{ 'header': [1, 2, 3, false] }],
                    ['bold', 'italic', 'underline', 'strike'],
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                    [{ 'color': [] }, { 'background': [] }],
                    ['link', 'image'],
                    ['clean']
                  ],
                }}
                formats={[
                  'header',
                  'bold', 'italic', 'underline', 'strike',
                  'list', 'bullet',
                  'color', 'background',
                  'link', 'image'
                ]}
                placeholder="Write your blog post content here..."
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
          </>
        )}
      </div>

      {/* Course Section */}
      <div className="manage-content-section">
        <div className="manage-content-section-header" onClick={() => setIsCourseCollapsed(!isCourseCollapsed)}>
          <div className="manage-content-section-title">
            <h2>Course</h2>
            <span className="collapse-icon">{isCourseCollapsed ? '▼' : '▲'}</span>
          </div>
          {!isCourseCollapsed && (
            <button 
              className="manage-content-btn" 
              onClick={(e) => { 
                e.stopPropagation(); 
                setShowCourseForm(true);
                resetCourseForm();
              }}
            >
              Create
            </button>
          )}
        </div>

        {!isCourseCollapsed && (
          <>
            {coursesError && <div className="manage-content-error">{coursesError}</div>}

            {showCourseForm && (
              <div className="manage-content-form-wrapper">
                <form className="manage-content-form" onSubmit={handleCourseSubmit}>
                  <div className="form-header">
                    <h3>{editingCourse ? 'Edit Course' : 'Create New Course'}</h3>
                    <button type="button" onClick={handleCourseCancel} className="form-close-btn">×</button>
                  </div>

                  <div className="form-group">
                    <label htmlFor="course-title">Title *</label>
                    <input
                      type="text"
                      id="course-title"
                      name="title"
                      value={courseFormData.title}
                      onChange={handleCourseInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="course-description">Description</label>
                    <textarea
                      id="course-description"
                      name="description"
                      value={courseFormData.description}
                      onChange={handleCourseInputChange}
                      rows="3"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="course-url">URL</label>
                    <input
                      type="url"
                      id="course-url"
                      name="url"
                      value={courseFormData.url}
                      onChange={handleCourseInputChange}
                      placeholder="https://www.youtube.com/playlist?list=..."
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="course-thumbnail">Thumbnail Image</label>
                    <input
                      type="file"
                      id="course-thumbnail"
                      name="thumbnail"
                      accept="image/*"
                      onChange={handleCourseInputChange}
                    />
                    {courseThumbnailPreview && (
                      <div className="thumbnail-preview">
                        <img src={courseThumbnailPreview} alt="Thumbnail preview" />
                        <button
                          type="button"
                          onClick={() => {
                            setCourseFormData(prev => ({ ...prev, thumbnail: null }));
                            setCourseThumbnailPreview(null);
                            const fileInput = document.getElementById('course-thumbnail');
                            if (fileInput) fileInput.value = '';
                          }}
                          className="thumbnail-remove-btn"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="form-actions">
                    <button type="button" onClick={handleCourseCancel} className="cancel-btn">
                      Cancel
                    </button>
                    <button type="submit" className="submit-btn">
                      {editingCourse ? 'Update Course' : 'Create Course'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="manage-content-list">
              {coursesLoading ? (
                <div className="loading">Loading courses...</div>
              ) : courses.length === 0 ? (
                <div className="empty-state">No courses found. Create your first course!</div>
              ) : (
                <>
                  <div className="posts-table">
                    <table>
                      <thead>
                        <tr>
                          <th>Title</th>
                          <th>Description</th>
                          <th>URL</th>
                          <th>Created</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {courses.map((course) => (
                          <tr key={course.id}>
                            <td>{course.title}</td>
                            <td>{course.description || 'N/A'}</td>
                            <td>
                              {course.url ? (
                                <a href={course.url} target="_blank" rel="noopener noreferrer" className="course-url-link">
                                  View Course
                                </a>
                              ) : (
                                'N/A'
                              )}
                            </td>
                            <td>{new Date(course.created_at).toLocaleDateString()}</td>
                            <td>
                              <button
                                onClick={() => handleCourseEdit(course)}
                                className="action-btn edit-btn"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleCourseDelete(course.id)}
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
                    {courses.map((course) => (
                      <div key={course.id} className="post-card">
                        <div className="post-card-header">
                          <h3 className="post-card-title">{course.title}</h3>
                          <span className="post-card-date">{new Date(course.created_at).toLocaleDateString()}</span>
                        </div>
                        {course.description && (
                          <p className="post-card-description">{course.description}</p>
                        )}
                        {course.url && (
                          <a href={course.url} target="_blank" rel="noopener noreferrer" className="course-url-link">
                            View Course →
                          </a>
                        )}
                        <div className="post-card-actions">
                          <button
                            onClick={() => handleCourseEdit(course)}
                            className="action-btn edit-btn"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleCourseDelete(course.id)}
                            className="action-btn delete-btn"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {courseTotalPages > 1 && (
                    <div className="pagination">
                      <button
                        onClick={() => setCourseCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={courseCurrentPage === 1}
                      >
                        Previous
                      </button>
                      <span>Page {courseCurrentPage} of {courseTotalPages}</span>
                      <button
                        onClick={() => setCourseCurrentPage(prev => Math.min(courseTotalPages, prev + 1))}
                        disabled={courseCurrentPage === courseTotalPages}
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </div>

      {/* Team Section */}
      <div className="manage-content-section">
        <div className="manage-content-section-header" onClick={() => setIsTeamCollapsed(!isTeamCollapsed)}>
          <div className="manage-content-section-title">
            <h2>Team</h2>
            <span className="collapse-icon">{isTeamCollapsed ? '▼' : '▲'}</span>
          </div>
          {!isTeamCollapsed && (
            <button 
              className="manage-content-btn" 
              onClick={(e) => { 
                e.stopPropagation(); 
                setShowTeamForm(true);
                resetTeamForm();
              }}
            >
              Create
            </button>
          )}
        </div>

        {!isTeamCollapsed && (
          <>
            {teamError && <div className="manage-content-error">{teamError}</div>}

            {showTeamForm && (
              <div className="manage-content-form-wrapper">
                <form className="manage-content-form" onSubmit={handleTeamSubmit}>
                  <div className="form-header">
                    <h3>{editingTeamMember ? 'Edit Team Member' : 'Create New Team Member'}</h3>
                    <button type="button" onClick={handleTeamCancel} className="form-close-btn">×</button>
                  </div>

                  <div className="form-group">
                    <label htmlFor="team-full_name">Full Name *</label>
                    <input
                      type="text"
                      id="team-full_name"
                      name="full_name"
                      value={teamFormData.full_name}
                      onChange={handleTeamInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="team-occupation">Occupation</label>
                    <input
                      type="text"
                      id="team-occupation"
                      name="occupation"
                      value={teamFormData.occupation}
                      onChange={handleTeamInputChange}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="team-bio">Bio</label>
                    <textarea
                      id="team-bio"
                      name="bio"
                      value={teamFormData.bio}
                      onChange={handleTeamInputChange}
                      rows="4"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="team-avatar_url">Avatar URL</label>
                    <input
                      type="url"
                      id="team-avatar_url"
                      name="avatar_url"
                      value={teamFormData.avatar_url}
                      onChange={handleTeamInputChange}
                      placeholder="https://example.com/avatar.jpg"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="team-email_url">Email</label>
                    <input
                      type="email"
                      id="team-email_url"
                      name="email_url"
                      value={teamFormData.email_url}
                      onChange={handleTeamInputChange}
                      placeholder="user@example.com"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="team-linkedin_url">LinkedIn URL</label>
                    <input
                      type="url"
                      id="team-linkedin_url"
                      name="linkedin_url"
                      value={teamFormData.linkedin_url}
                      onChange={handleTeamInputChange}
                      placeholder="https://linkedin.com/in/username"
                    />
                  </div>

                  <div className="form-actions">
                    <button type="button" onClick={handleTeamCancel} className="cancel-btn">
                      Cancel
                    </button>
                    <button type="submit" className="submit-btn">
                      {editingTeamMember ? 'Update Member' : 'Create Member'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="manage-content-list">
              {teamLoading ? (
                <div className="loading">Loading team members...</div>
              ) : teamMembers.length === 0 ? (
                <div className="empty-state">No team members found. Create your first team member!</div>
              ) : (
                <>
                  <div className="posts-table">
                    <table>
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Occupation</th>
                          <th>Email</th>
                          <th>Created</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {teamMembers.map((member) => (
                          <tr key={member.id}>
                            <td>{member.full_name}</td>
                            <td>{member.occupation || 'N/A'}</td>
                            <td>{member.email_url || 'N/A'}</td>
                            <td>{new Date(member.created_at).toLocaleDateString()}</td>
                            <td>
                              <button
                                onClick={() => handleTeamEdit(member)}
                                className="action-btn edit-btn"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleTeamDelete(member.id)}
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
                    {teamMembers.map((member) => (
                      <div key={member.id} className="post-card">
                        <div className="post-card-header">
                          <h3 className="post-card-title">{member.full_name}</h3>
                          <span className="post-card-date">{new Date(member.created_at).toLocaleDateString()}</span>
                        </div>
                        {member.occupation && (
                          <p className="post-card-description"><strong>Occupation:</strong> {member.occupation}</p>
                        )}
                        {member.bio && (
                          <p className="post-card-description">{member.bio}</p>
                        )}
                        {member.email_url && (
                          <p className="post-card-description"><strong>Email:</strong> {member.email_url}</p>
                        )}
                        <div className="post-card-actions">
                          <button
                            onClick={() => handleTeamEdit(member)}
                            className="action-btn edit-btn"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleTeamDelete(member.id)}
                            className="action-btn delete-btn"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {teamTotalPages > 1 && (
                    <div className="pagination">
                      <button
                        onClick={() => setTeamCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={teamCurrentPage === 1}
                      >
                        Previous
                      </button>
                      <span>Page {teamCurrentPage} of {teamTotalPages}</span>
                      <button
                        onClick={() => setTeamCurrentPage(prev => Math.min(teamTotalPages, prev + 1))}
                        disabled={teamCurrentPage === teamTotalPages}
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ManageContent;

