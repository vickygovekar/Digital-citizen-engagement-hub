import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './StaffReports.css';
import './StaffDashboard.css'; // Reuse sidebar styles

const StaffReports = () => {
    const [user, setUser] = useState({ name: 'Staff', department: 'General' });
    const [stats, setStats] = useState({
        total: 0,
        open: 0,
        progress: 0,
        resolved: 0,
        resolutionRate: 0,
        recentResolved: []
    });
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

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
        fetchReports(parsedUser.department);
    }, [navigate]);

    const fetchReports = async (department) => {
        try {
            const response = await fetch(`/api/staff/reports?department=${department}`);
            const data = await response.json();
            if (data.status === 'success') {
                setStats(data.data);
            }
        } catch (error) {
            console.error('Error fetching reports:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    // Calculate bar heights for chart
    const maxVal = Math.max(stats.open, stats.progress, stats.resolved, 1); // Avoid division by zero
    const hOpen = (stats.open / maxVal) * 100;
    const hProg = (stats.progress / maxVal) * 100;
    const hRes = (stats.resolved / maxVal) * 100;

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;

    return (
        <div className="staff-reports-body">
            {/* Sidebar */}
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
                        <Link to="/staff-tasks" className="staff-nav-link">
                            <i className="fas fa-tasks"></i>
                            <span>Tasks</span>
                        </Link>
                    </li>
                    <li className="staff-nav-item">
                        <Link to="/staff-reports" className="staff-nav-link active">
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
                        <h1>Department Reports</h1>
                        <p>Analytics and performance metrics for <strong>{user.department}</strong>.</p>
                    </div>
                    <button className="btn-export" onClick={() => window.print()}>
                        <i className="fas fa-download"></i> Download Report
                    </button>
                </div>

                {/* KPI Cards */}
                <div className="kpi-grid">
                    <div className="kpi-card">
                        <div className="kpi-header">
                            <div className="kpi-icon bg-blue"><i className="fas fa-layer-group"></i></div>
                            <span className="kpi-label">Total Issues</span>
                        </div>
                        <div className="kpi-value">{stats.total}</div>
                        <div className="kpi-trend trend-neutral">Lifetime reports</div>
                    </div>

                    <div className="kpi-card">
                        <div className="kpi-header">
                            <div className="kpi-icon bg-green"><i className="fas fa-chart-line"></i></div>
                            <span className="kpi-label">Resolution Rate</span>
                        </div>
                        <div className="kpi-value">{stats.resolutionRate}%</div>
                        <div className="kpi-trend trend-up"><i className="fas fa-arrow-up"></i> Performance</div>
                    </div>

                    <div className="kpi-card">
                        <div className="kpi-header">
                            <div className="kpi-icon bg-orange"><i className="fas fa-exclamation-triangle"></i></div>
                            <span className="kpi-label">Pending Action</span>
                        </div>
                        <div className="kpi-value">{stats.open + stats.progress}</div>
                        <div className="kpi-trend trend-neutral">Needs attention</div>
                    </div>

                    <div className="kpi-card">
                        <div className="kpi-header">
                            <div className="kpi-icon bg-purple"><i className="fas fa-check-double"></i></div>
                            <span className="kpi-label">Resolved</span>
                        </div>
                        <div className="kpi-value">{stats.resolved}</div>
                        <div className="kpi-trend trend-up"><i className="fas fa-check"></i> Completed</div>
                    </div>
                </div>

                {/* Charts & Lists */}
                <div className="charts-row">

                    {/* Status Distribution Chart */}
                    <div className="chart-card">
                        <div className="chart-header">
                            <div className="chart-title">Current Workload Distribution</div>
                        </div>

                        <div className="bar-chart">
                            <div className="bar-group">
                                <div className="bar-tooltip">{stats.open} Issues</div>
                                <div className="bar bar-open" style={{ height: `${hOpen}%` }}></div>
                                <div className="bar-label">Open</div>
                            </div>
                            <div className="bar-group">
                                <div className="bar-tooltip">{stats.progress} Issues</div>
                                <div className="bar bar-progress" style={{ height: `${hProg}%` }}></div>
                                <div className="bar-label">Progress</div>
                            </div>
                            <div className="bar-group">
                                <div className="bar-tooltip">{stats.resolved} Issues</div>
                                <div className="bar bar-resolved" style={{ height: `${hRes}%` }}></div>
                                <div className="bar-label">Resolved</div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Resolved List */}
                    <div className="chart-card">
                        <div className="chart-header">
                            <div className="chart-title">Recently Resolved</div>
                        </div>
                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Issue</th>
                                        <th>Date</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats.recentResolved.length > 0 ? (
                                        stats.recentResolved.map(issue => (
                                            <tr key={issue.id}>
                                                <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                                                    {issue.title.length > 20 ? issue.title.substring(0, 20) + '...' : issue.title}
                                                </td>
                                                <td style={{ color: 'var(--text-sub)' }}>
                                                    {new Date(issue.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                </td>
                                                <td><span className="badge-resolved"><i className="fas fa-check"></i> Resolved</span></td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="3" style={{ textAlign: 'center', color: 'var(--text-sub)', padding: '2rem' }}>No resolved issues yet.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
};

export default StaffReports;
