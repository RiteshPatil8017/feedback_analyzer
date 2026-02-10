import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import './UrgentAlerts.css';

const UrgentAlerts = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUrgentFeedbacks();
  }, []);

  const fetchUrgentFeedbacks = async () => {
    try {
      const response = await api.get('/api/feedback/urgent');
      setFeedbacks(response.data.feedbacks);
      setLoading(false);
    } catch (err) {
      setError('Failed to load urgent alerts');
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (loading) {
    return <div className="loading">Loading urgent alerts...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="urgent-alerts-container">
      <h1>🚨 Urgent Alerts</h1>

      <div className="alert-header">
        <p className="alert-count">
          Total Urgent Issues: <strong>{feedbacks.length}</strong>
        </p>
        <p className="alert-warning">
          These feedbacks require immediate attention and action.
        </p>
      </div>

      {feedbacks.length === 0 ? (
        <div className="card">
          <div className="no-alerts">
            <h2>✅ No Urgent Alerts</h2>
            <p>There are currently no urgent issues that require immediate attention.</p>
          </div>
        </div>
      ) : (
        <div className="urgent-feedbacks-list">
          {feedbacks.map((feedback) => (
            <div key={feedback.id} className="urgent-feedback-item">
              <div className="urgent-header">
                <div>
                  <h2>🚨 Urgent Alert #{feedback.id}</h2>
                  <span className="urgent-badge">URGENT</span>
                </div>
                <div className="urgent-date">{formatDate(feedback.timestamp)}</div>
              </div>

              <div className="urgent-feedback-text">
                {feedback.feedback_text}
              </div>

              <div className="urgent-meta">
                <div className="meta-item">
                  <strong>Category:</strong> 
                  <span className="badge badge-category">{feedback.category}</span>
                </div>
                <div className="meta-item">
                  <strong>Sentiment:</strong> 
                  <span className={`badge badge-${feedback.sentiment}`}>
                    {feedback.sentiment}
                  </span>
                </div>
                {feedback.student_id && (
                  <div className="meta-item">
                    <strong>Student ID:</strong> {feedback.student_id}
                  </div>
                )}
                {feedback.course_id && (
                  <div className="meta-item">
                    <strong>Course ID:</strong> {feedback.course_id}
                  </div>
                )}
                {feedback.instructor_id && (
                  <div className="meta-item">
                    <strong>Instructor ID:</strong> {feedback.instructor_id}
                  </div>
                )}
              </div>

              {feedback.suggestions && (
                <div className="urgent-suggestions">
                  <h3>Recommended Actions:</h3>
                  <p>{feedback.suggestions}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UrgentAlerts;

