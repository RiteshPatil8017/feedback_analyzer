import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import './Login.css';

const StudentLogin = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [registerData, setRegisterData] = useState({
    username: '',
    password: '',
    student_id: ''
  });
  const navigate = useNavigate();

  const handleLoginChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleRegisterChange = (e) => {
    setRegisterData({ ...registerData, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/api/auth/login', formData);
      if (response.data.success && response.data.user.role === 'student') {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('isAuthenticated', 'true');
        navigate('/student/dashboard');
      } else {
        setError('Invalid credentials or not a student account');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/api/auth/register', { ...registerData, role: 'student' });
      if (response.data.success) {
        const loginResponse = await api.post('/api/auth/login', {
          username: registerData.username,
          password: registerData.password
        });
        if (loginResponse.data.success) {
          localStorage.setItem('user', JSON.stringify(loginResponse.data.user));
          localStorage.setItem('isAuthenticated', 'true');
          navigate('/student/dashboard');
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Student Login</h1>
        <p className="login-subtitle">Access your feedback portal</p>

        <div className="login-tabs">
          <button
            type="button"
            className={`tab-btn ${!showRegister ? 'active' : ''}`}
            onClick={() => { setShowRegister(false); setError(null); }}
          >
            Login
          </button>
          <button
            type="button"
            className={`tab-btn ${showRegister ? 'active' : ''}`}
            onClick={() => { setShowRegister(true); setError(null); }}
          >
            Register
          </button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {!showRegister ? (
          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                autoComplete="username"
                value={formData.username}
                onChange={handleLoginChange}
                required
                placeholder="Username"
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                autoComplete="current-password"
                value={formData.password}
                onChange={handleLoginChange}
                required
                placeholder="Password"
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="login-form">
            <div className="form-group">
              <label htmlFor="reg_username">Username</label>
              <input
                type="text"
                id="reg_username"
                name="username"
                autoComplete="username"
                value={registerData.username}
                onChange={handleRegisterChange}
                required
                placeholder="Username"
              />
            </div>
            <div className="form-group">
              <label htmlFor="reg_student_id">Student ID</label>
              <input
                type="text"
                id="reg_student_id"
                name="student_id"
                value={registerData.student_id}
                onChange={handleRegisterChange}
                placeholder="Student ID (Optional)"
              />
            </div>
            <div className="form-group">
              <label htmlFor="reg_password">Password</label>
              <input
                type="password"
                id="reg_password"
                name="password"
                autoComplete="new-password"
                value={registerData.password}
                onChange={handleRegisterChange}
                required
                placeholder="Password (min 6 chars)"
                minLength="6"
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>
        )}

        <div className="login-footer">
          <a href="/faculty/login">Faculty Login</a>
          <span>|</span>
          <a href="/admin/login">Admin Login</a>
        </div>
      </div>
    </div>
  );
};

export default StudentLogin;