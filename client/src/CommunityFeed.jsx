import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Dashboard.css';
import './CommunityFeed.css';
import IssueDetailsModal from './IssueDetailsModal';

const CommunityFeed = () => {
    const [user, setUser] = useState({ name: 'Citizen', role: 'citizen' });
    const [feed, setFeed] = useState([]);
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState('recent');
    const [loading, setLoading] = useState(true);
    const [selectedIssue, setSelectedIssue] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            navigate('/login', { replace: true });
            return;
        }
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        fetchFeed(parsedUser.id, search, sort);
    }, [navigate, sort]); // Re-fetch when sort changes

    const fetchFeed = async (userId, searchTerm, sortOption) => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams({
                userId,
                search: searchTerm,
                sort: sortOption
            });
            const response = await fetch(`/api/feed?${queryParams}`);
            const data = await response.json();
            if (data.status === 'success') {
                setFeed(data.data);
            }
        } catch (error) {
            console.error('Error fetching feed:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusClass = (status) => {
        if (!status) return 'status-open';
        const normalizedStatus = status.toLowerCase();
        if (normalizedStatus === 'open') return 'status-open';
        if (normalizedStatus === 'in progress') return 'status-progress';
        if (normalizedStatus === 'resolved') return 'status-resolved';
        return 'status-open';
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchFeed(user.id, search, sort);
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

    return (
        <div className="dashboard-body">
            {/* Sidebar */}
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
                        <Link to="/my-reports" className="nav-link">
                            <i className="fas fa-clipboard-list"></i>
                            <span>My Reports</span>
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link to="/feed" className="nav-link active">
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
                        <h1>Community Feed</h1>
                        <p>See what your neighbors are reporting and support their requests.</p>
                    </div>
                    <Link to="/report-issue" className="btn-report">
                        <i className="fas fa-plus-circle"></i> Report Issue
                    </Link>
                </div>

                {/* Filter Bar */}
                <div className="filter-bar">
                    <form onSubmit={handleSearch} className="search-box">
                        <i className="fas fa-search"></i>
                        <input
                            type="text"
                            placeholder="Search issues by title, description, or category..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </form>

                    <div className="sort-options">
                        <button
                            className={`sort-btn ${sort === 'recent' ? 'active' : ''}`}
                            onClick={() => setSort('recent')}
                        >
                            <i className="fas fa-clock"></i> Recent
                        </button>
                        <button
                            className={`sort-btn ${sort === 'trending' ? 'active' : ''}`}
                            onClick={() => setSort('trending')}
                        >
                            <i className="fas fa-fire"></i> Trending
                        </button>
                    </div>
                </div>

                {/* Feed Grid */}
                <div className="feed-grid">
                    {loading ? (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '2rem' }}>Loading...</div>
                    ) : feed.length > 0 ? (
                        feed.map((item) => (
                            <div key={item.id} className="feed-card">
                                <div className="card-img">
                                    {item.image_path ? (
                                        <img src={item.image_path} alt="Issue" />
                                    ) : (
                                        <div className="card-img-placeholder">
                                            <i className="fas fa-image"></i>
                                        </div>
                                    )}

                                    <span className="category-tag">{item.category}</span>

                                    <span className={`status-tag ${getStatusClass(item.status)}`}>
                                        {item.status}
                                    </span>
                                </div>

                                <div className="feed-card-body">
                                    {item.status === 'Resolved' && (
                                        <div className="resolved-badge">
                                            <i className="fas fa-check-circle"></i> Resolved
                                        </div>
                                    )}
                                    <div className="card-title">{item.title}</div>

                                    <div className="card-meta">
                                        <span><i className="fas fa-user-circle"></i> {item.full_name}</span>
                                        <span>&bull;</span>
                                        <span><i className="fas fa-map-marker-alt"></i> {item.location}</span>
                                    </div>

                                    <div className="card-desc">
                                        {item.description}
                                    </div>

                                    <div className="card-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <button
                                            onClick={() => handleUpvote(item.id)}
                                            className={`btn-vote ${item.has_voted ? 'voted' : ''}`}
                                        >
                                            <i className="fas fa-arrow-up"></i>
                                            {item.upvotes} {item.has_voted ? 'Upvoted' : 'Upvote'}
                                        </button>

                                        <button
                                            className="btn-comment"
                                            onClick={() => openModal(item)}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                                color: '#6b7280',
                                                fontSize: '0.9rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                padding: '0.5rem'
                                            }}
                                        >
                                            <i className="fas fa-eye"></i> View Detailed
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="empty-state">
                            <i className="fas fa-search"></i>
                            <h3>No issues found</h3>
                            <p>Try adjusting your search or be the first to report something!</p>
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

export default CommunityFeed;
