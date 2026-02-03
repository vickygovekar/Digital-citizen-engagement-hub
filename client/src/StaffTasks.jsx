import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './StaffTasks.css';
import './StaffDashboard.css'; // Import dashboard styles for sidebar reuse

const StaffTasks = () => {
    const [user, setUser] = useState({ name: 'Staff', department: 'General' });
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [msg, setMsg] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [sortBy, setSortBy] = useState('date_desc');
    const [openDropdownId, setOpenDropdownId] = useState(null);
    const navigate = useNavigate();

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = () => setOpenDropdownId(null);
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            navigate('/login');
            return;
        }
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser.role !== 'staff') {
            navigate('/dashboard');
            return;
        }
        setUser(parsedUser);
        fetchTasks(parsedUser.id, parsedUser.department, filterStatus, sortBy);
    }, [navigate, filterStatus, sortBy]);

    const fetchTasks = async (userId, department, status, sort) => {
        try {
            const response = await fetch(`/api/staff/tasks?userId=${userId}&department=${department}&status=${status}&sort=${sort}`);
            const data = await response.json();
            if (data.status === 'success') {
                setTasks(data.tasks);
            }
        } catch (error) {
            console.error('Error fetching staff tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (e, issueId, newStatus) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/staff/update-status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ issueId, newStatus })
            });
            const data = await response.json();
            if (data.status === 'success') {
                setMsg(`Task #${issueId} marked as ${newStatus}`);
                // Refresh data
                fetchTasks(user.id, user.department, filterStatus, sortBy);

                // Clear message after 4 seconds
                setTimeout(() => setMsg(''), 4000);
            }
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    const getPriorityClass = (upvotes) => {
        if (upvotes > 10) return 'priority-high';
        if (upvotes > 5) return 'priority-med';
        return 'priority-low';
    };

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;

    return (
        <div className="staff-tasks-body">
            {msg && (
                <div className="alert-toast">
                    <i className="fas fa-check-circle" style={{ fontSize: '1.2rem' }}></i>
                    <span>{msg}</span>
                </div>
            )}

            {/* Sidebar - Reusing structure from Dashboard */}
            <div className="staff-sidebar">
                <div className="staff-logo">
                    <i className="fas fa-shield-alt"></i>
                    <span>Staff Portal</span>
                </div>

                <ul className="staff-nav-links">
                    <li className="staff-nav-item">
                        <Link to="/staff-dashboard" className="staff-nav-link">
                            <i className="fas fa-th-large"></i>
                            <span>Dashboard</span>
                        </Link>
                    </li>
                    <li className="staff-nav-item">
                        <Link to="/staff-tasks" className="staff-nav-link active">
                            <i className="fas fa-tasks"></i>
                            <span>Tasks</span>
                        </Link>
                    </li>
                    <li className="staff-nav-item">
                        <Link to="/staff-reports" className="staff-nav-link">
                            <i className="fas fa-chart-bar"></i>
                            <span>Reports</span>
                        </Link>
                    </li>
                    <li className="staff-nav-item">
                        <Link to="/staff-settings" className="staff-nav-link">
                            <i className="fas fa-cog"></i>
                            <span>Settings</span>
                        </Link>
                    </li>
                </ul>

                <div className="dept-badge">
                    <i className="fas fa-building"></i>
                    <span>{user.department} Dept.</span>
                </div>

                <div className="staff-user-profile">
                    <div className="staff-avatar">
                        {(user.fullname || user.name || 'S').charAt(0).toUpperCase()}
                    </div>
                    <div className="staff-user-info">
                        <h4>{user.fullname || user.name}</h4>
                        <span>Municipal Staff</span>
                    </div>
                    <button onClick={handleLogout} className="staff-logout-btn" title="Logout">
                        <i className="fas fa-sign-out-alt"></i>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="staff-main-content">

                <div className="page-header">
                    <div className="header-title">
                        <h1>Task Management</h1>
                        <p>Review and update citizen reports assigned to your department.</p>
                    </div>
                    <div className="task-count">
                        <i className="fas fa-inbox" style={{ color: 'var(--accent)' }}></i>
                        <strong>{tasks.length}</strong> Tasks Found
                    </div>
                </div>

                {/* Toolbar */}
                <div className="toolbar">
                    <div className="filter-group">
                        <button onClick={() => setFilterStatus('All')} className={`filter-btn ${filterStatus === 'All' ? 'active' : ''}`}>All Tasks</button>
                        <button onClick={() => setFilterStatus('Open')} className={`filter-btn ${filterStatus === 'Open' ? 'active' : ''}`}>Open</button>
                        <button onClick={() => setFilterStatus('In Progress')} className={`filter-btn ${filterStatus === 'In Progress' ? 'active' : ''}`}>In Progress</button>
                        <button onClick={() => setFilterStatus('Resolved')} className={`filter-btn ${filterStatus === 'Resolved' ? 'active' : ''}`}>Resolved</button>
                    </div>

                    <div className="sort-form">
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-sub)' }}>Sort by:</span>
                        <select
                            className="sort-select"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                        >
                            <option value="date_desc">Newest First</option>
                            <option value="date_asc">Oldest First</option>
                            <option value="priority">Highest Priority</option>
                        </select>
                    </div>
                </div>

                {/* Task List */}
                <div className="task-list">
                    {tasks.length > 0 ? (
                        tasks.map(task => {
                            const isHigh = task.upvotes > 10;
                            const isDropdownOpen = openDropdownId === task.id;
                            return (
                                <div key={task.id} className="task-item" style={{ zIndex: isDropdownOpen ? 100 : 'auto' }}>
                                    <div className={`priority-line ${getPriorityClass(task.upvotes)}`}></div>

                                    <div className="task-content">
                                        <div className="task-header-row">
                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                <span className="task-id">#{task.id}</span>
                                                <span className="task-title">{task.title}</span>

                                                {isHigh && (
                                                    <span className="prio-badge bg-prio-high"><i className="fas fa-fire"></i> High Priority</span>
                                                )}
                                            </div>
                                            <div className="date-text">
                                                <i className="far fa-calendar-alt" style={{ marginRight: '4px' }}></i>
                                                {new Date(task.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </div>
                                        </div>

                                        <div className="task-meta">
                                            <span><i className="fas fa-user"></i> {task.full_name}</span>
                                            <span><i className="fas fa-map-marker-alt"></i> {task.location}</span>
                                            <span style={task.upvotes > 5 ? { color: 'var(--danger)', fontWeight: 600 } : {}}>
                                                <i className="fas fa-thumbs-up"></i> {task.upvotes} Votes
                                            </span>
                                        </div>

                                        <div className="task-desc">
                                            {task.description}
                                        </div>

                                        <div className="task-actions">
                                            {/* Evidence Link */}
                                            {task.image_path ? (
                                                <a href={task.image_path} target="_blank" rel="noopener noreferrer" className="btn-evidence">
                                                    <i className="fas fa-paperclip"></i> View Evidence
                                                </a>
                                            ) : (
                                                <span style={{ fontSize: '0.9rem', color: '#cbd5e1', cursor: 'default', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <i className="fas fa-ban"></i> No Evidence
                                                </span>
                                            )}

                                            {/* Custom Status Dropdown */}
                                            <div className="status-wrapper" style={{ position: 'relative' }}>
                                                <span className="status-label">Status:</span>
                                                <button
                                                    type="button"
                                                    className={`status-pill ${task.status.toLowerCase().replace(' ', '-')}`}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setOpenDropdownId(openDropdownId === task.id ? null : task.id);
                                                    }}
                                                >
                                                    {task.status}
                                                    <i className="fas fa-chevron-down" style={{ fontSize: '0.7em', marginLeft: '6px' }}></i>
                                                </button>

                                                {openDropdownId === task.id && (
                                                    <div className="status-menu">
                                                        {['Open', 'In Progress', 'Resolved'].map(status => (
                                                            <div
                                                                key={status}
                                                                className={`status-option ${status === task.status ? 'selected' : ''}`}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleStatusUpdate(e, task.id, status);
                                                                    setOpenDropdownId(null);
                                                                }}
                                                            >
                                                                <span className={`dot ${status.toLowerCase().replace(' ', '-')}`}></span>
                                                                {status}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div style={{ textAlign: 'center', padding: '4rem', background: 'var(--surface)', borderRadius: '16px', border: '1px dashed #cbd5e1', color: 'var(--text-sub)' }}>
                            <i className="fas fa-clipboard-check" style={{ fontSize: '3.5rem', marginBottom: '1.5rem', opacity: 0.5 }}></i>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>No tasks found</h3>
                            <p style={{ fontSize: '1.1rem' }}>There are no issues matching your current filters.</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default StaffTasks;
