import React, { useState, useEffect } from 'react';
import './Courses.css';
import { getCourses } from '../api/courseApi';
import OfflineEmptyState from '../components/OfflineEmptyState';

const CACHE_KEY = 'courses_cache';
const CACHE_TIMESTAMP_KEY = 'courses_cache_timestamp';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

function Courses() {
  const [currentPage, setCurrentPage] = useState(1);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [isOffline, setIsOffline] = useState(false);
  const coursesPerPage = 4;

  useEffect(() => {
    // Load cached data on mount
    loadCachedCourses();
    fetchCourses();
  }, [currentPage]);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      // Try to fetch fresh data when coming back online
      if (courses.length === 0) {
        fetchCourses();
      }
    };
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check initial status
    setIsOffline(!navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [courses.length]);

  const loadCachedCourses = () => {
    try {
      const cachedData = localStorage.getItem(CACHE_KEY);
      const cacheTimestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
      
      if (cachedData && cacheTimestamp) {
        const age = Date.now() - parseInt(cacheTimestamp, 10);
        if (age < CACHE_DURATION) {
          const parsed = JSON.parse(cachedData);
          // Load cached data for current page if available
          const cachedPage = parsed[currentPage];
          if (cachedPage) {
            setCourses(cachedPage.results || []);
            setTotalPages(cachedPage.total_pages || 1);
          }
        }
      }
    } catch (err) {
      console.error('Error loading cached courses:', err);
    }
  };

  const saveToCache = (page, data) => {
    try {
      const cachedData = localStorage.getItem(CACHE_KEY);
      const cache = cachedData ? JSON.parse(cachedData) : {};
      cache[page] = data;
      localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
      localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
    } catch (err) {
      console.error('Error saving to cache:', err);
    }
  };

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCourses({ page: currentPage, page_size: coursesPerPage });
      setCourses(data.results || []);
      setTotalPages(data.total_pages || 1);
      setIsOffline(false);
      
      // Save to cache on successful fetch
      saveToCache(currentPage, {
        results: data.results || [],
        total_pages: data.total_pages || 1,
      });
    } catch (err) {
      // Check if it's a network error
      const isNetworkError = !navigator.onLine || 
                            err.message.includes('Failed to fetch') ||
                            err.message.includes('NetworkError') ||
                            err.message.includes('network');
      
      if (isNetworkError) {
        setIsOffline(true);
        // Try to load from cache
        loadCachedCourses();
        // Only show error if no cached data available
        if (courses.length === 0) {
          setError('No internet connection. Please check your network and try again.');
        }
      } else {
        setError(err.message || 'Failed to fetch courses');
        setCourses([]);
      }
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
      {isOffline && courses.length > 0 && (
        <div className="offline-notice">
          <span className="offline-icon">●</span>
          <span>You might be offline</span>
        </div>
      )}
      <div className="courses-hero">
        <div className="courses-hero-content">
          <h1 className="courses-title">Our Courses</h1>
          <p className="courses-subtitle">
            Master software engineering, AI, and automation with our comprehensive courses
          </p>
        </div>
      </div>

      <div className="courses-container">
        {loading && !isOffline ? (
          <div className="courses-loading">
            <div className="spinner"></div>
            <p>Loading courses...</p>
          </div>
        ) : isOffline && courses.length === 0 ? (
          <OfflineEmptyState onRetry={fetchCourses} />
        ) : error && courses.length === 0 ? (
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

