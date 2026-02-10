import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import './FeedbackList.css';

const FeedbackList = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [filters, setFilters] = useState({
    instructor_id: '',
    course_id: '',
    class_name: '',
    feedback_type: ''
  });

  useEffect(() => {
    fetchFeedbacks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchFeedbacks = async (filtersToUse = null) => {
    try {
      setLoading(true);
      const params = {};
      const activeFilters = filtersToUse !== null ? filtersToUse : filters;
      
      if (activeFilters.instructor_id) params.instructor_id = activeFilters.instructor_id;
      if (activeFilters.course_id) params.course_id = activeFilters.course_id;
      if (activeFilters.class_name) params.class_name = activeFilters.class_name;
      if (activeFilters.feedback_type) params.feedback_type = activeFilters.feedback_type;

      const response = await api.get('/api/feedback', { params });
      setFeedbacks(response.data.feedbacks);
      setLoading(false);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load feedbacks');
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchFeedbacks();
  };

  const handleDelete = async (feedbackId) => {
    if (!window.confirm('Are you sure you want to delete this feedback? This action cannot be undone.')) {
      return;
    }

    setDeletingId(feedbackId);
    try {
      await api.delete(`/api/feedback/${feedbackId}`);
      setSuccessMessage('Feedback deleted successfully!');
      // Refresh the feedback list
      await fetchFeedbacks();
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete feedback');
      setTimeout(() => setError(null), 5000);
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (loading) {
    return <div className="loading">Loading feedbacks...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  /* riteshpatil9162/feedback_analyzer_running/frontend/src/components/FeedbackList.js */
// ... (keep imports and existing logic)

  return (
    <div className="feedback-list-container">
      <div className="feedback-list-header">
        <h1>📝 Feedbacks</h1>
        <div className="feedbacks-count-badge">
          <span className="count-number">{feedbacks.length}</span>
          <span className="count-label">Total</span>
        </div>
      </div>

      {/* ... (keep success/error alerts) */}

      <div className="card filter-card">
        <form onSubmit={handleFilterSubmit} className="filter-form">
          <div className="form-group">
            <label>Course ID</label>
            <input
              type="text"
              name="course_id"
              value={filters.course_id}
              onChange={handleFilterChange}
              placeholder="Course..."
            />
          </div>

          <div className="form-group">
            <label>Class</label>
            <input
              type="text"
              name="class_name"
              value={filters.class_name}
              onChange={handleFilterChange}
              placeholder="Class..."
            />
          </div>

          <div className="form-group">
            <label>Type</label>
            <select
              name="feedback_type"
              value={filters.feedback_type}
              onChange={handleFilterChange}
            >
              <option value="">All Types</option>
              <option value="campus">Campus</option>
              <option value="faculty">Faculty</option>
            </select>
          </div>

          <div className="filter-actions">
            <button type="submit" className="btn btn-primary">Apply</button>
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={() => {
                const empty = { course_id: '', class_name: '', feedback_type: '' };
                setFilters(empty);
                fetchFeedbacks(empty);
              }}
            >
              Reset
            </button>
          </div>
        </form>
      </div>

      <div className="feedbacks-list">
        {feedbacks.length === 0 ? (
          <div className="card empty-state">
            <div className="empty-icon">📭</div>
            <p>No results found for your filters.</p>
          </div>
        ) : (
          feedbacks.map((feedback, index) => (
            <div
              key={feedback.id}
              className={`feedback-item ${feedback.is_urgent ? 'urgent' : ''}`}
            >
              <div className="feedback-header">
                <div className="feedback-number-section">
                  <span className="feedback-number">#{index + 1}</span>
                  {feedback.is_urgent && (
                    <span className="badge badge-urgent">🚨 Urgent</span>
                  )}
                </div>
                <button
                  className="btn-delete"
                  onClick={() => handleDelete(feedback.id)}
                  disabled={deletingId === feedback.id}
                >
                  {deletingId === feedback.id ? '...' : '🗑️'}
                </button>
              </div>

              <div className="feedback-meta">
                <span className={`badge badge-${feedback.sentiment || 'neutral'}`}>
                  {feedback.sentiment || 'neutral'}
                </span>
                <span className="badge badge-category">
                  {feedback.category || 'general'}
                </span>
                {feedback.feedback_type && (
                  <span className="meta-item">📍 {feedback.feedback_type}</span>
                )}
                {feedback.student_id && (
                  <span className="meta-item">👤 {feedback.student_id}</span>
                )}
                {feedback.class_name && (
                  <span className="meta-item">📋 {feedback.class_name}</span>
                )}
              </div>

              <div className="feedback-text">
                {feedback.feedback_text}
              </div>

              {feedback.suggestions && (
                <div className="feedback-suggestions">
                  <strong>💡 Action Suggestion:</strong>
                  <p>{feedback.suggestions}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FeedbackList;

