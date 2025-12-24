import React, { useState, useEffect } from 'react';
import { getCourses, createCourse, updateCourse, deleteCourse } from '../api/courseApi';
import './ManageContent.css';

function AdminManageCourses() {
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

  useEffect(() => {
    fetchCourses();
  }, [courseCurrentPage]);

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
    const wasFormOpen = showCourseForm;
    setEditingCourse(course);
    setCourseFormData({
      title: course.title || '',
      description: course.description || '',
      url: course.url || '',
      thumbnail: null,
    });
    setCourseThumbnailPreview(course.thumbnail_url || null);
    setShowCourseForm(true);
    // Scroll to top only if form wasn't already open
    if (!wasFormOpen) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
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

  return (
    <div className="manage-content">
      <div className="manage-content-header">
        <h2>Manage Courses</h2>
        <button 
          className="manage-content-btn" 
          onClick={() => {
            setShowCourseForm(true);
            resetCourseForm();
          }}
        >
          Create Course
        </button>
      </div>

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
    </div>
  );
}

export default AdminManageCourses;

