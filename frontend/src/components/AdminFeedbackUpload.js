import React, { useState } from 'react';
import api from '../utils/api';
import './FeedbackForm.css';

const AdminFeedbackUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [feedbackType, setFeedbackType] = useState('campus'); // 'campus' or 'faculty'
  const [uploadResult, setUploadResult] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const fileExtension = file.name.split('.').pop().toLowerCase();
      if (['csv', 'xlsx', 'xls'].includes(fileExtension)) {
        setSelectedFile(file);
        setError(null);
      } else {
        setError('Please select a valid CSV or Excel file (.csv, .xlsx, .xls)');
        setSelectedFile(null);
      }
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please select a file to upload');
      return;
    }

    setUploadLoading(true);
    setError(null);
    setUploadResult(null);

    const uploadFormData = new FormData();
    uploadFormData.append('file', selectedFile);
    uploadFormData.append('feedback_type', feedbackType);

    try {
      const response = await api.post('/api/feedback/upload', uploadFormData, {
        timeout: 60000, // 60 seconds timeout for file uploads
      });
      setUploadResult(response.data);
      setSelectedFile(null);
      // Reset file input
      e.target.reset();
    } catch (err) {
      console.error('Error uploading file:', err);
      let errorMessage = 'Failed to upload file';
      
      if (err.response) {
        errorMessage = err.response.data?.error || err.response.data?.message || `Server error: ${err.response.status}`;
      } else if (err.request) {
        errorMessage = 'Unable to connect to the server. Please make sure the backend server is running on http://localhost:5000';
      } else {
        errorMessage = err.message || 'An unexpected error occurred';
      }
      
      setError(errorMessage);
    } finally {
      setUploadLoading(false);
    }
  };

  return (
    <div className="feedback-form-container">
      <div className="card">
        <h2>Upload Feedback File</h2>

        <div className="form-mode-toggle" style={{ marginBottom: '1.5rem' }}>
          <button
            type="button"
            className={`toggle-btn ${feedbackType === 'campus' ? 'active' : ''}`}
            onClick={() => setFeedbackType('campus')}
          >
            Campus Feedback
          </button>
          <button
            type="button"
            className={`toggle-btn ${feedbackType === 'faculty' ? 'active' : ''}`}
            onClick={() => setFeedbackType('faculty')}
          >
            Faculty Feedback
          </button>
        </div>
        
        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        {uploadResult && (
          <div className="alert alert-success">
            <h3>File Uploaded Successfully!</h3>
            <div className="result-details">
              <p><strong>Total Rows:</strong> {uploadResult.total_rows}</p>
              <p><strong>Processed:</strong> {uploadResult.processed}</p>
              {uploadResult.failed > 0 && (
                <p><strong>Failed:</strong> {uploadResult.failed}</p>
              )}
              <p style={{ marginTop: '1rem' }}>{uploadResult.message}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleFileUpload}>
          <div className="form-group">
            <label htmlFor="file_upload">Upload CSV or Excel File</label>

            <div
              className="file-drop-zone"
              onClick={() => document.getElementById('file_upload')?.click()}
            >
              <span className="file-drop-icon">⬆️</span>
              <span className="file-drop-text">
                {selectedFile ? selectedFile.name : 'Click to choose a file or drop it here'}
              </span>
            </div>

            <input
              type="file"
              id="file_upload"
              name="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
              required
              style={{ display: 'none' }}
            />

            <small style={{ color: '#666', marginTop: '0.5rem', display: 'block' }}>
              Supported formats: CSV (.csv), Excel (.xlsx, .xls)
            </small>
          </div>

          <button type="submit" className="btn btn-primary" disabled={uploadLoading || !selectedFile}>
            {uploadLoading ? 'Uploading...' : 'Upload and Process File'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminFeedbackUpload;

