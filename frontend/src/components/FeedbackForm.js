import React, { useState } from 'react';
import api from '../utils/api';
import './FeedbackForm.css';

const FeedbackForm = () => {
  const [formData, setFormData] = useState({
    student_id: '',
    course_id: '',
    instructor_id: '',
    feedback_text: ''
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [uploadMode, setUploadMode] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await api.post('/api/feedback', formData);
      setResult(response.data); // Triggers success popup
      setFormData({
        student_id: '',
        course_id: '',
        instructor_id: '',
        feedback_text: ''
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit feedback');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const ext = file.name.split('.').pop().toLowerCase();
      if (['csv', 'xlsx', 'xls'].includes(ext)) {
        setSelectedFile(file);
        setError(null);
      } else {
        setError('Invalid file format');
      }
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    setUploadLoading(true);
    setError(null);
    const uploadData = new FormData();
    uploadData.append('file', selectedFile);

    try {
      const response = await api.post('/api/feedback/upload', uploadData);
      setResult({ isUpload: true, ...response.data }); // Triggers success popup
      setSelectedFile(null);
    } catch (err) {
      setError('Upload failed');
    } finally {
      setUploadLoading(false);
    }
  };

  return (
    <div className="feedback-form-inner">
      <div className="card">
        <div className="card-header">
          <h2>Submit Feedback</h2>
          <div className="form-mode-toggle">
            <button
              type="button"
              className={`toggle-btn ${!uploadMode ? 'active' : ''}`}
              onClick={() => { setUploadMode(false); setError(null); }}
            >
              Manual
            </button>
            <button
              type="button"
              className={`toggle-btn ${uploadMode ? 'active' : ''}`}
              onClick={() => { setUploadMode(true); setError(null); }}
            >
              Upload
            </button>
          </div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={uploadMode ? handleFileUpload : handleSubmit} className="scrollable-form">
          {!uploadMode ? (
            <>
              <div className="form-group">
                <label>Student ID</label>
                <input name="student_id" value={formData.student_id} onChange={handleChange} placeholder="Optional" />
              </div>
              <div className="form-group">
                <label>Feedback *</label>
                <textarea name="feedback_text" value={formData.feedback_text} onChange={handleChange} required rows="4" placeholder="Your experience..." />
              </div>
            </>
          ) : (
            <div className="form-group">
              <label>Choose File</label>
              <input type="file" accept=".csv,.xlsx,.xls" onChange={handleFileChange} />
            </div>
          )}
          <button type="submit" className="btn btn-primary submit-btn" disabled={loading || uploadLoading}>
            {loading || uploadLoading ? 'Processing...' : 'Submit Now'}
          </button>
        </form>
      </div>

      {/* Success Popup Modal */}
      {result && (
        <div className="success-popup-overlay" onClick={() => setResult(null)}>
          <div className="success-popup" onClick={e => e.stopPropagation()}>
            <div className="success-popup-icon">✓</div>
            <h3>{result.isUpload ? 'Upload Complete' : 'Feedback Received'}</h3>
            <p>Thank you! Your feedback has been analyzed successfully.</p>
            <button type="button" className="btn btn-primary" onClick={() => setResult(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackForm;