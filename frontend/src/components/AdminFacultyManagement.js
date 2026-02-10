import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import './AdminFacultyManagement.css';

const AdminFacultyManagement = () => {
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [formData, setFormData] = useState({
    username: '', password: '', name: '', faculty_id: '', classes: ''
  });
  const [editData, setEditData] = useState({
    name: '', faculty_id: '', classes: '', password: ''
  });

  useEffect(() => {
    fetchFaculty();
  }, []);

  const fetchFaculty = async () => {
    try {
      const response = await api.get('/api/faculty');
      if (response.data.success) {
        setFaculty(response.data.faculty || []);
      }
      setLoading(false);
    } catch (err) {
      setError('Failed to load faculty list');
      setLoading(false);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleEditChange = (e) => setEditData({ ...editData, [e.target.name]: e.target.value });

  const openEditModal = (f) => {
    setEditingFaculty(f);
    setEditData({
      name: f.name || f.username,
      faculty_id: f.faculty_id || '',
      classes: Array.isArray(f.classes) ? f.classes.join(', ') : (f.classes || ''),
      password: ''
    });
  };

  const closeEditModal = () => setEditingFaculty(null);

  const handleAddFaculty = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        classes: formData.classes.split(',').map(c => c.trim()).filter(Boolean).join(',')
      };
      await api.post('/api/faculty', payload);
      setSuccessMessage('Faculty added successfully!');
      setFormData({ username: '', password: '', name: '', faculty_id: '', classes: '' });
      setShowAddForm(false);
      fetchFaculty();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add faculty');
    }
  };

  const handleUpdateFaculty = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: editData.name,
        faculty_id: editData.faculty_id,
        classes: editData.classes.split(',').map(c => c.trim()).filter(Boolean).join(',')
      };
      if (editData.password) payload.password = editData.password;
      await api.put(`/api/faculty/${editingFaculty.id}`, payload);
      setSuccessMessage('Faculty updated successfully!');
      closeEditModal();
      fetchFaculty();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update faculty');
    }
  };

  const handleDeleteFaculty = async (id) => {
    if (!window.confirm('Are you sure you want to delete this faculty?')) return;
    setDeletingId(id);
    try {
      await api.delete(`/api/faculty/${id}`);
      setSuccessMessage('Faculty deleted successfully!');
      fetchFaculty();
    } catch (err) {
      setError('Failed to delete faculty');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <div className="loading">Loading faculty...</div>;

  return (
    <div className="admin-faculty-management">
      <h1>👨‍🏫 Faculty Management</h1>

      {successMessage && <div className="alert alert-success">{successMessage}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div className="faculty-actions">
        <button className="btn btn-primary" onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? 'Cancel' : '+ Add Faculty'}
        </button>
      </div>

      {showAddForm && (
        <div className="card add-faculty-form">
          <h2>Add New Faculty</h2>
          <form onSubmit={handleAddFaculty}>
            <div className="form-row">
              <div className="form-group">
                <label>Username *</label>
                <input type="text" name="username" value={formData.username} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Password *</label>
                <input type="password" name="password" value={formData.password} onChange={handleChange} required minLength={6} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Display Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Faculty ID</label>
                <input type="text" name="faculty_id" value={formData.faculty_id} onChange={handleChange} />
              </div>
            </div>
            <div className="form-group">
              <label>Classes (comma-separated)</label>
              <input type="text" name="classes" value={formData.classes} onChange={handleChange} placeholder="e.g. DSE-A, BTech-3A" />
            </div>
            <button type="submit" className="btn btn-primary">Add Faculty</button>
          </form>
        </div>
      )}

      <div className="faculty-list">
        <h2>Current Faculty ({faculty.length})</h2>
        <div className="faculty-table-wrap">
          <table className="faculty-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Username</th>
                <th>Faculty ID</th>
                <th>Classes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {faculty.map((f) => (
                <tr key={f.id}>
                  <td>{f.name || f.username}</td>
                  <td>{f.username}</td>
                  <td>{f.faculty_id || '-'}</td>
                  <td>{Array.isArray(f.classes) ? f.classes.join(', ') : f.classes || '-'}</td>
                  <td className="actions-cell">
                    <button className="btn btn-edit btn-sm" onClick={() => openEditModal(f)}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDeleteFaculty(f.id)} disabled={deletingId === f.id}>
                      {deletingId === f.id ? '...' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editingFaculty && (
        <div className="modal-overlay" onClick={closeEditModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit: {editingFaculty.username}</h2>
              <button className="modal-close" onClick={closeEditModal}>&times;</button>
            </div>
            <form onSubmit={handleUpdateFaculty}>
              <div className="form-group"><label>Name</label><input type="text" name="name" value={editData.name} onChange={handleEditChange} /></div>
              <div className="form-group"><label>Faculty ID</label><input type="text" name="faculty_id" value={editData.faculty_id} onChange={handleEditChange} /></div>
              <div className="form-group"><label>Classes</label><input type="text" name="classes" value={editData.classes} onChange={handleEditChange} /></div>
              <div className="form-group"><label>New Password (Optional)</label><input type="password" name="password" value={editData.password} onChange={handleEditChange} /></div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={closeEditModal}>Cancel</button>
                <button type="submit" className="btn btn-primary">Update</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFacultyManagement;