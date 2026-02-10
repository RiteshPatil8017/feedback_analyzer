import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import './Dashboard.css';

const Dashboard = ({ onViewAlerts }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await api.get('/api/feedback/analytics');
      setAnalytics(response.data.analytics);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err.response?.data?.error || 'Failed to load analytics. Please check if the backend server is running.');
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  const { total_feedbacks, sentiment_distribution, category_distribution, average_sentiment_score, urgent_count } = analytics;
  
  const getPercentage = (value) => {
    return total_feedbacks > 0 ? ((value || 0) / total_feedbacks) * 100 : 0;
  };

  return (
    <div className="dashboard">
      <h1>Dashboard Overview</h1>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Feedbacks</h3>
          <p className="stat-value">{total_feedbacks}</p>
        </div>
        
        <div className="stat-card">
          <h3>Average Sentiment</h3>
          <p className="stat-value">{(average_sentiment_score || 0).toFixed(2)}</p>
        </div>
        
        <div className="stat-card">
          <h3>Urgent Alerts</h3>
          <p className="stat-value" style={{ color: urgent_count > 0 ? '#dc3545' : '#667eea' }}>
            {urgent_count}
          </p>
        </div>
        
        <div className="stat-card">
          <h3>Positive Feedbacks</h3>
          <p className="stat-value" style={{ color: '#28a745' }}>
            {sentiment_distribution.positive || 0}
          </p>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <h2>Sentiment Distribution</h2>
          <div className="sentiment-chart">
            <div className="sentiment-bar">
              <div className="sentiment-label">Positive</div>
              <div className="sentiment-bar-container">
                <div 
                  className="sentiment-bar-fill positive"
                  style={{ width: `${getPercentage(sentiment_distribution.positive)}%` }}
                ></div>
              </div>
              <div className="sentiment-value">{sentiment_distribution.positive || 0}</div>
            </div>
            <div className="sentiment-bar">
              <div className="sentiment-label">Neutral</div>
              <div className="sentiment-bar-container">
                <div 
                  className="sentiment-bar-fill neutral"
                  style={{ width: `${getPercentage(sentiment_distribution.neutral)}%` }}
                ></div>
              </div>
              <div className="sentiment-value">{sentiment_distribution.neutral || 0}</div>
            </div>
            <div className="sentiment-bar">
              <div className="sentiment-label">Negative</div>
              <div className="sentiment-bar-container">
                <div 
                  className="sentiment-bar-fill negative"
                  style={{ width: `${getPercentage(sentiment_distribution.negative)}%` }}
                ></div>
              </div>
              <div className="sentiment-value">{sentiment_distribution.negative || 0}</div>
            </div>
          </div>
        </div>

        <div className="card">
          <h2>Category Distribution</h2>
          <div className="category-list">
            {Object.entries(category_distribution).map(([category, count]) => (
              <div key={category} className="category-item">
                <span className="category-name">{category.replace('_', ' ')}</span>
                <span className="category-count">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="quick-actions">
        {urgent_count > 0 && onViewAlerts && (
          <button onClick={onViewAlerts} className="btn btn-primary" style={{ background: '#dc3545' }}>
            View Urgent Alerts ({urgent_count})
          </button>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

