import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import Dashboard from './Dashboard';
import FeedbackList from './FeedbackList';
import UrgentAlerts from './UrgentAlerts';
import Analytics from './Analytics';
import AdminFeedbackUpload from './AdminFeedbackUpload';
import AdminFacultyManagement from './AdminFacultyManagement';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const storedUser = localStorage.getItem('user');
      const isAuthenticated = localStorage.getItem('isAuthenticated');
      if (!isAuthenticated || !storedUser) {
        navigate('/admin/login');
        return;
      }
      const userData = JSON.parse(storedUser);
      if (userData.role !== 'admin') {
        navigate('/admin/login');
        return;
      }
      try {
        const response = await api.get('/api/auth/me');
        if (response.data.success) {
          setUser(response.data.user);
          setLoading(false);
        } else {
          navigate('/admin/login');
        }
      } catch (err) {
        localStorage.removeItem('user');
        localStorage.removeItem('isAuthenticated');
        navigate('/admin/login');
      }
    };
    checkAuth();
  }, [navigate]);

  const handleLogout = async () => {
    try { await api.post('/api/auth/logout'); } 
    finally {
      localStorage.removeItem('user');
      localStorage.removeItem('isAuthenticated');
      navigate('/admin/login');
    }
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setIsMenuOpen(false); // Auto-close menu on selection
  };

  if (loading) return <div className="loading">Loading Dashboard...</div>;

  return (
    <div className="admin-dashboard">
      <nav className="admin-navbar">
        <div className="nav-container">
          <h1 className="nav-logo">📊 Admin Portal</h1>
          <div className="nav-user">
            <span className="user-welcome">Welcome, {user?.username}</span>
            <button onClick={handleLogout} className="btn btn-logout">Logout</button>
          </div>
        </div>
        
        {/* The Trigger Bar - Placed on the down-left side of the header area */}
        <div className="mobile-menu-bar">
          <button 
            className={`hamburger-btn ${isMenuOpen ? 'open' : ''}`} 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
          <span className="active-tab-title">
            {activeTab.replace(/([A-Z])/g, ' $1').trim()}
          </span>
        </div>
      </nav>

      <div className="admin-layout">
        <aside className={`admin-sidebar ${isMenuOpen ? 'mobile-show' : ''}`}>
          <nav className="sidebar-nav">
            <button className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => handleTabClick('dashboard')}>📊 Dashboard</button>
            <button className={`nav-item ${activeTab === 'feedbacks' ? 'active' : ''}`} onClick={() => handleTabClick('feedbacks')}>📝 View Feedbacks</button>
            <button className={`nav-item ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => handleTabClick('analytics')}>📈 Analytics</button>
            <button className={`nav-item ${activeTab === 'alerts' ? 'active' : ''}`} onClick={() => handleTabClick('alerts')}>🚨 Urgent Alerts</button>
            <button className={`nav-item ${activeTab === 'upload' ? 'active' : ''}`} onClick={() => handleTabClick('upload')}>📤 Upload Feedback</button>
            <button className={`nav-item ${activeTab === 'faculty' ? 'active' : ''}`} onClick={() => handleTabClick('faculty')}>👨‍🏫 Manage Faculty</button>
          </nav>
        </aside>

        {isMenuOpen && <div className="sidebar-overlay" onClick={() => setIsMenuOpen(false)}></div>}

        <main className="admin-main">
          <div className="admin-content">
            {activeTab === 'dashboard' && <Dashboard onViewAlerts={() => setActiveTab('alerts')} />}
            {activeTab === 'feedbacks' && <FeedbackList />}
            {activeTab === 'analytics' && <Analytics />}
            {activeTab === 'alerts' && <UrgentAlerts />}
            {activeTab === 'upload' && <AdminFeedbackUpload />}
            {activeTab === 'faculty' && <AdminFacultyManagement />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;