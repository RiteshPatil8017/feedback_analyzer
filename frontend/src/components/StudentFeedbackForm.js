/* riteshpatil9162/feedback_analyzer_running/frontend/src/components/StudentFeedbackForm.js */
import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import './FeedbackForm.css';

const StudentFeedbackForm = ({ user }) => {
  const [formData, setFormData] = useState({
    class_name: '',
    student_id: '',
    feedback_type: 'campus',
    instructor_id: '',
    feedback_text: ''
  });
  const [facultyList, setFacultyList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); // Triggers success popup
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFaculty = async () => {
      try {
        const res = await api.get('/api/faculty');
        if (res.data.success) setFacultyList(res.data.faculty || []);
      } catch (err) {
        console.error('Error fetching faculty:', err);
      }
    };
    fetchFaculty();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    const payload = {
      ...formData,
      course_id: 'general',
      student_id: formData.student_id || user?.student_id || 'anonymous',
      instructor_id: formData.feedback_type === 'faculty' ? formData.instructor_id : ''
    };

    try {
      const response = await api.post('/api/feedback', payload);
      if (response.data.success) {
        setResult(response.data); // Triggers success popup
        setFormData({
          class_name: '',
          student_id: '',
          feedback_type: 'campus',
          instructor_id: '',
          feedback_text: ''
        });
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit feedback');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="feedback-form-inner">
      <div className="card">
        <div className="card-header">
          <h2>Feedback Form</h2>
          {error && <div className="alert alert-error">{error}</div>}
        </div>

        <form onSubmit={handleSubmit} className="scrollable-form">
          <div className="form-group">
            <label htmlFor="class_name">Class / Section *</label>
            <input
              type="text"
              id="class_name"
              name="class_name"
              value={formData.class_name}
              onChange={handleChange}
              placeholder="e.g., DSE-A"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="student_id">Student ID</label>
            <input
              type="text"
              id="student_id"
              name="student_id"
              value={formData.student_id || user?.student_id || ''}
              onChange={handleChange}
              placeholder="Optional ID"
            />
          </div>

          <div className="form-group">
            <label>Type *</label>
            <div className="form-mode-toggle">
              <button
                type="button"
                className={`toggle-btn ${formData.feedback_type === 'campus' ? 'active' : ''}`}
                onClick={() => setFormData({ ...formData, feedback_type: 'campus', instructor_id: '' })}
              >
                🏫 Campus
              </button>
              <button
                type="button"
                className={`toggle-btn ${formData.feedback_type === 'faculty' ? 'active' : ''}`}
                onClick={() => setFormData({ ...formData, feedback_type: 'faculty' })}
              >
                👨‍🏫 Faculty
              </button>
            </div>
          </div>

          {formData.feedback_type === 'faculty' && (
            <div className="form-group">
              <label htmlFor="instructor_id">Select Faculty *</label>
              <select
                id="instructor_id"
                name="instructor_id"
                value={formData.instructor_id}
                onChange={handleChange}
                required={formData.feedback_type === 'faculty'}
              >
                <option value="">-- Choose Faculty --</option>
                {facultyList.map((f) => (
                  <option key={f.id} value={f.id}>{f.name || f.username}</option>
                ))}
              </select>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="feedback_text">Feedback *</label>
            <textarea
              id="feedback_text"
              name="feedback_text"
              value={formData.feedback_text}
              onChange={handleChange}
              placeholder="Your honest thoughts..."
              required
              rows="4"
            />
          </div>

          <button type="submit" className="btn btn-primary submit-btn" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </form>
      </div>

      {/* Success Popup */}
      {result && (
        <div className="success-popup-overlay" onClick={() => setResult(null)}>
          <div className="success-popup" onClick={e => e.stopPropagation()}>
            <div className="success-popup-icon">✓</div>
            <h3>Thank You!</h3>
            <p>Your feedback has been submitted successfully.</p>
            <button type="button" className="btn btn-primary" onClick={() => setResult(null)}>OK</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentFeedbackForm;