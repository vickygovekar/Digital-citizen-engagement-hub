import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Dashboard.css'; // Reusing Dashboard styles
import './MyReports.css'; // Specific styles for My Reports
import IssueDetailsModal from './IssueDetailsModal';

const MyReports = () => {
    const [user, setUser] = useState({ name: 'Citizen', role: 'citizen' });
    const [reports, setReports] = useState([]);
    const [filter, setFilter] = useState('All');
    const [loading, setLoading] = useState(true);
    const [selectedIssue, setSelectedIssue] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Check if user is logged in
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            navigate('/login', { replace: true });
            return;
        }

        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);

        fetchReports(parsedUser.id, filter);
    }, [navigate, filter]);

    const fetchReports = async (userId, status) => {
        setLoading(true);
        try {
            const response = await fetch(`/api/my-reports?userId=${userId}&status=${status}`);
            const data = await response.json();
            if (data.status === 'success') {
                setReports(data.data);
            }
        } catch (error) {
            console.error('Error fetching reports:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login', { replace: true });
    };

    const openModal = (issue) => {
        setSelectedIssue(issue);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedIssue(null);
    };

    const getStatusClass = (status) => {
        if (!status) return 'status-open';
        const normalizedStatus = status.toLowerCase();
        if (normalizedStatus === 'open') return 'status-open';
        if (normalizedStatus === 'in progress') return 'status-progress';
        if (normalizedStatus === 'resolved') return 'status-resolved';
        return 'status-open';
    };

    return (
        <div className="dashboard-body">
            {/* Sidebar - Same as Dashboard */}
            <div className="sidebar">
                <div className="logo">
                    <i className="fas fa-city"></i>
                    <span>Civic Hub</span>
                </div>

                <ul className="nav-links">
                    <li className="nav-item">
                        <Link to="/dashboard" className="nav-link">
                            <i className="fas fa-home"></i>
                            <span>Dashboard</span>
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link to="/my-reports" className="nav-link active">
                            <i className="fas fa-clipboard-list"></i>
                            <span>My Reports</span>
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link to="/feed" className="nav-link">
                            <i className="fas fa-bullhorn"></i>
                            <span>Community Feed</span>
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link to="/settings" className="nav-link">
                            <i className="fas fa-cog"></i>
                            <span>Settings</span>
                        </Link>
                    </li>
                </ul>

                <div className="user-profile">
                    <div className="avatar">
                        {(user.fullname || user.name || 'C').charAt(0).toUpperCase()}
                    </div>
                    <div className="user-info">
                        <h4>{user.fullname || user.name}</h4>
                        <span><i className="fas fa-check-circle"></i> Verified Citizen</span>
                    </div>
                    <button onClick={handleLogout} className="logout-btn" title="Logout">
                        <i className="fas fa-sign-out-alt"></i>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="main-content">
                <div className="page-header">
                    <div className="header-title">
                        <h1>My Reports</h1>
                        <p>Track the status and history of your submitted issues.</p>
                    </div>
                    <Link to="/report-issue" className="btn-new">
                        <i className="fas fa-plus-circle"></i> New Report
                    </Link>
                </div>

                {/* Filter Tabs */}
                <div className="filter-tabs">
                    {['All', 'Open', 'In Progress', 'Resolved'].map((status) => (
                        <button
                            key={status}
                            className={`filter-link ${filter === status ? 'active' : ''}`}
                            onClick={() => setFilter(status)}
                        >
                            {status === 'All' ? 'All Reports' : status}
                        </button>
                    ))}
                </div>

                {/* Reports Grid */}
                <div className="reports-grid">
                    {loading ? (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '2rem' }}>Loading...</div>
                    ) : reports.length > 0 ? (
                        reports.map((report) => (
                            <div key={report.id} className="report-card">
                                <div className="card-image">
                                    <span className={`status-badge ${getStatusClass(report.status)}`}>
                                        {report.status}
                                    </span>
                                    {report.image_path ? (
                                        <img src={report.image_path} alt="Issue" />
                                    ) : (
                                        <div className="card-image-placeholder">
                                            <i className="fas fa-image"></i>
                                        </div>
                                    )}
                                </div>

                                <div className="my-report-card-body">
                                    <span className="report-id">#{String(report.id).padStart(5, '0')}</span>
                                    <div className="report-title">{report.title}</div>

                                    <div className="card-meta">
                                        <span><i className="fas fa-layer-group"></i> {report.category}</span>
                                        <span><i className="fas fa-map-marker-alt"></i> {report.location}</span>
                                    </div>

                                    <div className="card-desc">
                                        {report.description}
                                    </div>

                                    <div className="card-footer">
                                        <span className="date-posted">
                                            <i className="far fa-calendar-alt"></i>
                                            {new Date(report.created_at).toLocaleDateString()}
                                        </span>
                                        <button
                                            className="btn-view"
                                            onClick={() => openModal(report)}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2563eb', fontWeight: '500' }}
                                        >
                                            View Details <i className="fas fa-arrow-right"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="empty-state">
                            <i className="fas fa-folder-open"></i>
                            <h3>No reports found</h3>
                            <p>You haven't submitted any issues in this category yet.</p>
                            <Link to="/report-issue" className="btn-new" style={{ display: 'inline-flex' }}>Create First Report</Link>
                        </div>
                    )}
                </div>
            </div>
            <IssueDetailsModal
                isOpen={isModalOpen}
                onClose={closeModal}
                issue={selectedIssue}
            />
        </div>
    );
};

export default MyReports;
