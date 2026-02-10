import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import StudentFeedbackForm from './StudentFeedbackForm';
import './StudentDashboard.css';

const StudentDashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      const storedUser = localStorage.getItem('user');
      const isAuthenticated = localStorage.getItem('isAuthenticated');
      
      if (!isAuthenticated || !storedUser) {
        navigate('/student/login');
        return;
      }

      const userData = JSON.parse(storedUser);
      if (userData.role !== 'student') {
        navigate('/student/login');
        return;
      }

      setUser(userData);
      setLoading(false);
    };

    checkAuth();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await api.post('/api/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('user');
      localStorage.removeItem('isAuthenticated');
      navigate('/student/login');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <span>Loading Dashboard...</span>
      </div>
    );
  }

  return (
    <div className="student-dashboard">
      <nav className="student-navbar">
        <div className="nav-container">
          <h1 className="nav-logo">📝 Portal</h1>
          <div className="nav-user">
            <div className="user-info">
              <span className="welcome-text">Hi, {user?.username}</span>
              {user?.student_id && <span className="student-id">ID: {user.student_id}</span>}
            </div>
            <button onClick={handleLogout} className="btn btn-logout">Logout</button>
          </div>
        </div>
      </nav>

      <main className="student-main">
        <div className="welcome-section">
          <h2>Submit Feedback</h2>
          <p>Your input helps us improve our campus and faculty.</p>
        </div>

        <div className="form-wrapper">
          <StudentFeedbackForm user={user} />
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;