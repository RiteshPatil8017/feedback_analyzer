import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import './FacultyDashboard.css';

const COLORS = ['#28a745', '#ffc107', '#dc3545', '#17a2b8', '#6f42c1'];
const SENTIMENT_COLORS = { positive: '#28a745', neutral: '#ffc107', negative: '#dc3545' };

const FacultyDashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feedbacks, setFeedbacks] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [classFilter, setClassFilter] = useState('');
  const [allClasses, setAllClasses] = useState([]);
  const [activeTab, setActiveTab] = useState('feedback');
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const storedUser = localStorage.getItem('user');
      const isAuthenticated = localStorage.getItem('isAuthenticated');
      if (!isAuthenticated || !storedUser) {
        navigate('/faculty/login');
        return;
      }
      const userData = JSON.parse(storedUser);
      if (userData.role !== 'faculty') {
        navigate('/faculty/login');
        return;
      }
      try {
        const response = await api.get('/api/auth/me');
        if (response.data.success) {
          setUser(response.data.user);
          setLoading(false);
        } else {
          navigate('/faculty/login');
        }
      } catch (err) {
        localStorage.removeItem('user');
        localStorage.removeItem('isAuthenticated');
        navigate('/faculty/login');
      }
    };
    checkAuth();
  }, [navigate]);

  useEffect(() => {
    if (user) {
      fetchFeedbacks();
      fetchAnalytics();
    }
  }, [user, classFilter]);

  const fetchFeedbacks = async () => {
    try {
      const params = classFilter ? { class_name: classFilter } : {};
      const response = await api.get('/api/feedback', { params });
      const list = response.data.feedbacks || [];
      setFeedbacks(list);
      const classes = [...new Set(list.map(f => f.class_name).filter(Boolean))];
      setAllClasses(prev => [...new Set([...prev, ...classes])].sort());
    } catch (err) {
      console.error('Error fetching feedbacks:', err);
      setFeedbacks([]);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const params = classFilter ? { class_name: classFilter } : {};
      const response = await api.get('/api/feedback/analytics', { params });
      setAnalytics(response.data.analytics || {});
    } catch (err) {
      console.error('Error fetching analytics:', err);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post('/api/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('user');
      localStorage.removeItem('isAuthenticated');
      navigate('/faculty/login');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString() + ' ' + new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return <div className="loading faculty-loading">Loading Dashboard...</div>;
  }

  const sentimentDist = analytics?.sentiment_distribution || {};
  const categoryDist = analytics?.category_distribution || {};

  const sentimentChartData = [
    { name: 'Positive', value: sentimentDist.positive || 0, color: SENTIMENT_COLORS.positive },
    { name: 'Neutral', value: sentimentDist.neutral || 0, color: SENTIMENT_COLORS.neutral },
    { name: 'Negative', value: sentimentDist.negative || 0, color: SENTIMENT_COLORS.negative }
  ].filter(d => d.value > 0);

  const categoryChartData = Object.entries(categoryDist).map(([name, value]) => ({
    name: name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    count: value,
    fill: COLORS[Object.keys(categoryDist).indexOf(name) % COLORS.length]
  }));

  const totalFeedbacks = analytics?.total_feedbacks || 0;

  return (
    <div className="faculty-dashboard">
      <nav className="faculty-navbar">
        <div className="nav-container">
          {/* Logo on the left corner */}
          <h1 className="nav-logo">👨‍🏫 Faculty Portal</h1>
          
          {/* Profile and Logout on the right corner */}
          <div className="nav-user">
            <div className="user-profile-info">
              <span className="user-name">{user?.name || user?.username}</span>
              <span className="faculty-label">Faculty Member</span>
            </div>
            <button onClick={handleLogout} className="btn btn-logout">Logout</button>
          </div>
        </div>
      </nav>

      <main className="faculty-main">
        <div className="dashboard-header">
          <div className="filter-section">
            <label>Filter:</label>
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="class-filter-select"
            >
              <option value="">All Classes</option>
              {allClasses.map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>

          <div className="faculty-tabs">
            <button
              className={`tab-btn ${activeTab === 'feedback' ? 'active' : ''}`}
              onClick={() => setActiveTab('feedback')}
            >
              📝 Feedback
            </button>
            <button
              className={`tab-btn ${activeTab === 'charts' ? 'active' : ''}`}
              onClick={() => setActiveTab('charts')}
            >
              📊 Analytics
            </button>
          </div>
        </div>

        {activeTab === 'feedback' && (
          <div className="faculty-feedback-list">
            {feedbacks.length === 0 ? (
              <div className="empty-state">
                <p>No feedback found for this selection.</p>
              </div>
            ) : (
              feedbacks.map((fb, idx) => (
                <div key={fb.id} className={`feedback-card ${fb.sentiment}`} style={{ animationDelay: `${idx * 0.05}s` }}>
                  <div className="feedback-card-header">
                    <div className="badge-group">
                      <span className={`sentiment-badge ${fb.sentiment}`}>{fb.sentiment}</span>
                      {fb.class_name && <span className="class-badge">{fb.class_name}</span>}
                    </div>
                    <span className="feedback-date">{formatDate(fb.timestamp)}</span>
                  </div>
                  <div className="feedback-text">{fb.feedback_text}</div>
                  <div className="feedback-analysis">
                    <div className="analysis-row">
                      <strong>Category:</strong> {fb.category || 'general'}
                    </div>
                    {fb.suggestions && (
                      <div className="improvements-section">
                        <strong>💡 Suggestion:</strong>
                        <p>{fb.suggestions}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'charts' && (
          <div className="faculty-charts-section">
            <div className="stats-row animated">
              <div className="stat-box">
                <span className="stat-num">{totalFeedbacks}</span>
                <span className="stat-label">Total</span>
              </div>
              <div className="stat-box positive">
                <span className="stat-num">{sentimentDist.positive || 0}</span>
                <span className="stat-label">Positive</span>
              </div>
              <div className="stat-box negative">
                <span className="stat-num">{sentimentDist.negative || 0}</span>
                <span className="stat-label">Negative</span>
              </div>
            </div>

            <div className="charts-grid">
              <div className="chart-card">
                <h3>Sentiment</h3>
                <div className="responsive-chart">
                  <ResponsiveContainer width="100%" height="100%">
                    {sentimentChartData.length > 0 ? (
                      <PieChart>
                        <Pie
                          data={sentimentChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius="60%"
                          outerRadius="80%"
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {sentimentChartData.map((entry, index) => (
                            <Cell key={index} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" height={36} />
                      </PieChart>
                    ) : (
                      <div className="chart-empty">No data</div>
                    )}
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="chart-card">
                <h3>Categories</h3>
                <div className="responsive-chart">
                  <ResponsiveContainer width="100%" height="100%">
                    {categoryChartData.length > 0 ? (
                      <BarChart data={categoryChartData} layout="vertical" margin={{ left: -20, right: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" hide />
                        <YAxis type="category" dataKey="name" width={80} style={{ fontSize: '0.8rem' }} />
                        <Tooltip />
                        <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                          {categoryChartData.map((entry, index) => (
                            <Cell key={index} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    ) : (
                      <div className="chart-empty">No data</div>
                    )}
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default FacultyDashboard;