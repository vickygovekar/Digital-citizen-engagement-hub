import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Dashboard.css';
import IssueDetailsModal from './IssueDetailsModal';

const Dashboard = () => {
    const [user, setUser] = useState({ name: 'Citizen', role: 'citizen' });
    const [stats, setStats] = useState({ total: 0, pending: 0, resolved: 0 });
    const [feed, setFeed] = useState([]);
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

        // Fetch user info and stats
        const fetchData = async () => {
            try {
                const response = await fetch(`/api/dashboard?userId=${parsedUser.id}`);
                const data = await response.json();
                if (data.status === 'success') {
                    setStats(data.stats);
                    setFeed(data.feed);
                }
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            }
        };

        fetchData();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login', { replace: true });
    };

    const handleUpvote = async (issueId) => {
        try {
            const response = await fetch('/api/upvote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, issueId })
            });
            const data = await response.json();

            if (data.status === 'success') {
                // Optimistic update
                setFeed(prevFeed => prevFeed.map(item => {
                    if (item.id === issueId) {
                        const isUpvoting = data.action === 'added';
                        return {
                            ...item,
                            upvotes: isUpvoting ? item.upvotes + 1 : item.upvotes - 1,
                            has_voted: isUpvoting ? 1 : 0
                        };
                    }
                    return item;
                }));
            }
        } catch (error) {
            console.error('Error upvoting:', error);
        }
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
            <div className="sidebar">
                <div className="logo">
                    <i className="fas fa-city"></i>
                    <span>Civic Hub</span>
                </div>

                <ul className="nav-links">
                    <li className="nav-item">
                        <Link to="/dashboard" className="nav-link active">
                            <i className="fas fa-home"></i>
                            <span>Dashboard</span>
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link to="/my-reports" className="nav-link">
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

            <div className="main-content">
                <div className="top-bar">
                    <div className="welcome-text">
                        <h1>Hello, {user.fullname || user.name} 👋</h1>
                        <p>Here's what's happening in your city today.</p>
                    </div>
                    <Link to="/report-issue" className="btn-report">
                        <i className="fas fa-plus-circle"></i> Report Issue
                    </Link>
                </div>

                <div className="stats-grid">
                    <div className="stat-card stat-blue">
                        <div className="icon-box"><i className="fas fa-file-alt"></i></div>
                        <div className="stat-info">
                            <h3>{stats.total}</h3>
                            <p>Issues Reported</p>
                        </div>
                    </div>
                    <div className="stat-card stat-orange">
                        <div className="icon-box"><i className="fas fa-clock"></i></div>
                        <div className="stat-info">
                            <h3>{stats.pending}</h3>
                            <p>In Progress</p>
                        </div>
                    </div>
                    <div className="stat-card stat-green">
                        <div className="icon-box"><i className="fas fa-check-circle"></i></div>
                        <div className="stat-info">
                            <h3>{stats.resolved}</h3>
                            <p>Resolved Issues</p>
                        </div>
                    </div>
                </div>

                <div className="feed-section">
                    <div className="feed-header">
                        <h3>Community Priorities</h3>
                        <select className="sort-select">
                            <option>Recent First</option>
                            <option>Most Upvoted</option>
                        </select>
                    </div>

                    {feed.length > 0 ? (
                        feed.map((item) => (
                            <div key={item.id} className="issue-card">
                                <div className="issue-thumbnail">
                                    {item.image_path ? (
                                        <img src={item.image_path} alt="Issue" />
                                    ) : (
                                        <div className="issue-thumbnail-placeholder">
                                            <i className="fas fa-image"></i>
                                        </div>
                                    )}
                                </div>

                                <div className="issue-content">
                                    <div className="issue-header">
                                        <div className="badge-group">
                                            <span className="issue-category">{item.category}</span>
                                            <span className={`issue-status ${getStatusClass(item.status)}`}>
                                                {item.status}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="issue-title">{item.title}</div>
                                    <div className="issue-desc">{item.description}</div>

                                    <div className="issue-meta">
                                        <div className="meta-item">
                                            <i className="fas fa-map-marker-alt"></i>
                                            {item.location}
                                        </div>
                                        <div className="meta-item">
                                            <i className="fas fa-user"></i>
                                            {item.full_name}
                                        </div>
                                        <div className="meta-item">
                                            <i className="far fa-clock"></i>
                                            {new Date(item.created_at).toLocaleDateString()}
                                        </div>
                                        <button
                                            className={`upvote-btn ${item.has_voted ? 'voted' : ''}`}
                                            onClick={() => handleUpvote(item.id)}
                                            style={{ cursor: 'pointer', border: 'none', background: 'none' }}
                                        >
                                            <i className="fas fa-arrow-up"></i>
                                            {item.upvotes}
                                        </button>
                                        <button
                                            className="view-detailed-btn"
                                            onClick={() => openModal(item)}
                                            style={{
                                                cursor: 'pointer',
                                                border: 'none',
                                                background: 'none',
                                                color: '#6b7280',
                                                fontWeight: '500',
                                                fontSize: '0.85rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.25rem',
                                                marginLeft: 'auto'
                                            }}
                                        >
                                            <i className="fas fa-eye"></i> View
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-sub)' }}>
                            <i className="fas fa-inbox" style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}></i>
                            <p>No issues reported yet. Be the first to report!</p>
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

export default Dashboard;
