import React from 'react'; 
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import StudentLogin from './components/StudentLogin';
import AdminLogin from './components/AdminLogin';
import FacultyLogin from './components/FacultyLogin';
import StudentDashboard from './components/StudentDashboard';
import AdminDashboard from './components/AdminDashboard';
import FacultyDashboard from './components/FacultyDashboard';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Landing/Home - redirect to student login */}
          <Route path="/" element={<Navigate to="/student/login" replace />} />
          
          {/* Student Routes */}
          <Route path="/student/login" element={<StudentLogin />} />
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />

          {/* Faculty Routes */}
          <Route path="/faculty/login" element={<FacultyLogin />} />
          <Route path="/faculty/dashboard" element={<FacultyDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

