import React, { useState, useEffect } from 'react';
import './Courses.css';
import { getCourses } from '../api/courseApi';

function Courses() {
  const [currentPage, setCurrentPage] = useState(1);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const coursesPerPage = 4;

  useEffect(() => {
    fetchCourses();
  }, [currentPage]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCourses({ page: currentPage, page_size: coursesPerPage });
      setCourses(data.results || []);
      setTotalPages(data.total_pages || 1);
    } catch (err) {
      setError(err.message || 'Failed to fetch courses');
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="courses">
      <div className="courses-hero">
        <div className="courses-hero-content">
          <h1 className="courses-title">Our Courses</h1>
          <p className="courses-subtitle">
            Master software engineering, AI, and automation with our comprehensive courses
          </p>
        </div>
      </div>

      <div className="courses-container">
        {loading ? (
          <div className="courses-loading">
            <div className="spinner"></div>
            <p>Loading courses...</p>
          </div>
        ) : error ? (
          <div className="courses-error">Error: {error}</div>
        ) : courses.length === 0 ? (
          <div className="courses-empty">No courses available at the moment.</div>
        ) : (
          <div className="courses-grid">
            {courses.map((course) => (
              <div key={course.id} className="course-card">
                <div className="course-card-left">
                  {course.thumbnail_url ? (
                    <img src={course.thumbnail_url} alt={course.title} className="course-image" />
                  ) : (
                    <div className="course-image-placeholder"></div>
                  )}
                </div>
                <div className="course-card-right">
                  <h3 className="course-title">{course.title}</h3>
                  <p className="course-description">{course.description}</p>
                  <a 
                    href={course.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="course-btn"
                  >
                    VIEW PLAYLIST <span className="btn-arrow">→</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && !error && totalPages > 1 && (
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

export default Courses;

