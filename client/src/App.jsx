import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Signup from './Signup';
import Dashboard from './Dashboard';
import MyReports from './MyReports';
import ReportIssue from './ReportIssue';
import CommunityFeed from './CommunityFeed';
import Settings from './Settings';
import StaffDashboard from './StaffDashboard';
import StaffTasks from './StaffTasks';
import StaffSettings from './StaffSettings';
import StaffReports from './StaffReports';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/my-reports" element={<MyReports />} />
        <Route path="/report-issue" element={<ReportIssue />} />
        <Route path="/feed" element={<CommunityFeed />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/staff-dashboard" element={<StaffDashboard />} />
        <Route path="/staff-tasks" element={<StaffTasks />} />
        <Route path="/staff-settings" element={<StaffSettings />} />
        <Route path="/staff-reports" element={<StaffReports />} />
      </Routes>
    </Router>
  );
}

export default App;
