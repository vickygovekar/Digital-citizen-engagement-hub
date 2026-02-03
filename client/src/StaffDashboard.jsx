import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './StaffDashboard.css';

const StaffDashboard = () => {
    const [user, setUser] = useState({ name: 'Staff', department: 'General' });
    const [stats, setStats] = useState({ pending: 0, critical: 0, resolved: 0 });
    const [tasks, setTasks] = useState([]);
    const [recentResolved, setRecentResolved] = useState([]);
    const [loading, setLoading] = useState(true);
    const [msg, setMsg] = useState('');
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
            navigate('/dashboard'); // Redirect non-staff to main dashboard
            return;
        }
        setUser(parsedUser);
        fetchDashboardData(parsedUser.id, parsedUser.department);
    }, [navigate]);

    const fetchDashboardData = async (userId, department) => {
        try {
            const response = await fetch(`/api/staff/dashboard?userId=${userId}&department=${department}`);
            const data = await response.json();
            if (data.status === 'success') {
                setStats(data.data.stats);
                setTasks(data.data.tasks);
                setRecentResolved(data.data.recentResolved || []);
            }
        } catch (error) {
            console.error('Error fetching staff dashboard data:', error);
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
                setMsg(`Ticket #${issueId} updated to ${newStatus}.`);
                // Refresh data
                fetchDashboardData(user.id, user.department);

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
        if (upvotes > 10) return 'p-high';
        if (upvotes > 5) return 'p-medium';
        return 'p-low';
    };

    const getBadgeClass = (status) => {
        if (status === 'In Progress') return 'badge-Progress';
        if (status === 'Resolved') return 'badge-Resolved';
        return 'badge-Open';
    };

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;

    return (
        <div className="staff-dashboard-body">
            {msg && (
                <div className="alert-toast">
                    <i className="fas fa-check-circle" style={{ fontSize: '1.2rem' }}></i>
                    <span>{msg}</span>
                </div>
            )}

            {/* Sidebar */}
            <div className="staff-sidebar">
                <div className="staff-logo">
                    <i className="fas fa-shield-alt"></i>
                    <span>Staff Portal</span>
                </div>

                <ul className="staff-nav-links">
                    <li className="staff-nav-item">
                        <Link to="/staff-dashboard" className="staff-nav-link active">
                            <i className="fas fa-th-large"></i>
                            <span>Dashboard</span>
                        </Link>
                    </li>
                    <li className="staff-nav-item">
                        <Link to="/staff-tasks" className="staff-nav-link">
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
                <div className="staff-top-bar">
                    <div className="staff-page-title">
                        <h1>Department Overview</h1>
                        <p>Managing tickets for <strong>{user.department}</strong></p>
                    </div>
                    <div className="date-badge">
                        <i className="far fa-calendar-alt"></i>
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                </div>

                {/* Stats */}
                <div className="staff-stats-grid">
                    <div className="staff-stat-card">
                        <div className="staff-icon-box bg-red"><i className="fas fa-exclamation-circle"></i></div>
                        <div className="staff-stat-info">
                            <h3>{stats.pending}</h3>
                            <p>Pending Tasks</p>
                        </div>
                    </div>
                    <div className="staff-stat-card">
                        <div className="staff-icon-box bg-blue"><i className="fas fa-fire"></i></div>
                        <div className="staff-stat-info">
                            <h3>{stats.critical}</h3>
                            <p>High Priority (&gt;5 Votes)</p>
                        </div>
                    </div>
                    <div className="staff-stat-card">
                        <div className="staff-icon-box bg-green"><i className="fas fa-check-circle"></i></div>
                        <div className="staff-stat-info">
                            <h3>{stats.resolved}</h3>
                            <p>Resolved Total</p>
                        </div>
                    </div>
                </div>

                {/* Task Board */}
                <div className="task-header">
                    <h3>Incoming Tickets</h3>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-sub)', background: 'white', padding: '6px 12px', borderRadius: '20px', border: '1px solid var(--border)' }}>
                        <i className="fas fa-sort-amount-down"></i> Sorted by Urgency
                    </div>
                </div>

                {tasks.length > 0 ? (
                    tasks.map(task => (
                        <div key={task.id} className="task-card" style={{ zIndex: openDropdownId === task.id ? 100 : 'auto', overflow: 'visible' }}>
                            <div className={`priority-strip ${getPriorityClass(task.upvotes)}`}></div>

                            <div className="task-body">
                                <div className="task-details">
                                    <div className="task-top">
                                        <span className="task-id">#{task.id}</span>
                                        <span className={`status-badge ${getBadgeClass(task.status)}`}>{task.status}</span>
                                    </div>

                                    <div className="task-title">{task.title}</div>

                                    <div className="task-meta">
                                        <span><i className="fas fa-user"></i> {task.full_name}</span>
                                        <span><i className="fas fa-map-marker-alt"></i> {task.location}</span>
                                        <span style={task.upvotes > 5 ? { color: 'var(--danger)', fontWeight: 600 } : {}}>
                                            <i className="fas fa-arrow-up"></i> {task.upvotes} Votes
                                        </span>
                                        {task.image_path && (
                                            <span className="view-evidence" onClick={() => window.open(task.image_path, '_blank')}>
                                                <i className="fas fa-image"></i> View Evidence
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="task-actions">
                                    <div className="status-wrapper" style={{ position: 'relative' }}>
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
                    ))
                ) : (
                    <div style={{ textAlign: 'center', padding: '4rem', background: 'var(--surface)', borderRadius: '12px', border: '1px dashed #cbd5e1', color: 'var(--text-sub)' }}>
                        <i className="fas fa-clipboard-check" style={{ fontSize: '3rem', color: '#cbd5e1', marginBottom: '1rem' }}></i>
                        <h4 style={{ color: 'var(--text-main)', fontSize: '1.2rem', marginBottom: '0.5rem' }}>All Caught Up!</h4>
                        <p>There are no pending issues for {user.department}.</p>
                    </div>
                )}

                {/* Recently Resolved Section */}
                <div className="task-header" style={{ marginTop: '3rem' }}>
                    <h3>Recently Resolved</h3>
                    <div style={{ fontSize: '0.9rem', color: 'var(--success)', background: '#dcfce7', padding: '6px 12px', borderRadius: '20px', fontWeight: 600 }}>
                        <i className="fas fa-check-circle"></i> Completed
                    </div>
                </div>

                {recentResolved.length > 0 ? (
                    recentResolved.map(task => (
                        <div key={task.id} className="task-card" style={{ opacity: 0.8 }}>
                            <div className="priority-strip" style={{ background: 'var(--success)' }}></div>
                            <div className="task-body">
                                <div className="task-details">
                                    <div className="task-top">
                                        <span className="task-id">#{task.id}</span>
                                        <span className="status-badge badge-Resolved">Resolved</span>
                                    </div>
                                    <div className="task-title" style={{ textDecoration: 'line-through', color: 'var(--text-sub)' }}>{task.title}</div>
                                    <div className="task-meta">
                                        <span><i className="fas fa-user"></i> {task.full_name}</span>
                                        <span><i className="fas fa-calendar-check"></i> {new Date(task.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <div className="task-actions">
                                    <button className="btn-update" style={{ background: 'var(--bg-body)', color: 'var(--text-sub)', cursor: 'default' }} disabled>
                                        Archived
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <p style={{ color: 'var(--text-sub)', fontStyle: 'italic' }}>No recently resolved issues.</p>
                )}
            </div>
        </div>
    );
};

export default StaffDashboard;
