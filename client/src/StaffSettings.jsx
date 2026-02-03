import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './StaffSettings.css';
import './StaffDashboard.css'; // Reuse sidebar styles

const StaffSettings = () => {
    const [user, setUser] = useState({ name: 'Staff', department: 'General', email: '' });
    const [msg, setMsg] = useState('');
    const [msgType, setMsgType] = useState('');

    // Profile Form State
    const [fullname, setFullname] = useState('');
    const [email, setEmail] = useState('');

    // Password Form State
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

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
        setFullname(parsedUser.fullname || parsedUser.name);
        setEmail(parsedUser.email);
    }, [navigate]);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setMsg('');
        try {
            const response = await fetch('/api/settings/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, fullname, email })
            });
            const data = await response.json();

            if (data.status === 'success') {
                setMsg('Staff profile updated successfully!');
                setMsgType('success');
                // Update local storage
                const updatedUser = { ...user, fullname, email };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                setUser(updatedUser);
            } else {
                setMsg(data.message || 'Error updating profile');
                setMsgType('error');
            }
        } catch (error) {
            setMsg('Connection failed');
            setMsgType('error');
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setMsg('');

        if (newPassword !== confirmPassword) {
            setMsg('New passwords do not match.');
            setMsgType('error');
            return;
        }

        try {
            const response = await fetch('/api/settings/password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    current_password: currentPassword,
                    new_password: newPassword
                })
            });
            const data = await response.json();

            if (data.status === 'success') {
                setMsg('Password changed successfully!');
                setMsgType('success');
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            } else {
                setMsg(data.message || 'Error changing password');
                setMsgType('error');
            }
        } catch (error) {
            setMsg('Connection failed');
            setMsgType('error');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <div className="staff-settings-body">
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
                        <Link to="/staff-reports" className="staff-nav-link">
                            <i className="fas fa-chart-bar"></i>
                            <span>Reports</span>
                        </Link>
                    </li>
                    <li className="staff-nav-item">
                        <Link to="/staff-settings" className="staff-nav-link active">
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
                        <h1>Staff Settings</h1>
                        <p>Manage your account and department preferences.</p>
                    </div>
                </div>

                {msg && (
                    <div className={`alert ${msgType === 'success' ? 'alert-success' : 'alert-error'}`}>
                        <i className={msgType === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle'}></i>
                        {msg}
                    </div>
                )}

                <div className="settings-grid">

                    {/* LEFT COLUMN */}
                    <div className="left-col">

                        {/* Profile Card */}
                        <div className="card">
                            <div className="card-title"><i className="fas fa-id-card"></i> Employee Details</div>
                            <form onSubmit={handleUpdateProfile}>
                                <div className="form-group">
                                    <label>Full Name</label>
                                    <div className="input-with-icon">
                                        <i className="fas fa-user"></i>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={fullname}
                                            onChange={(e) => setFullname(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Work Email</label>
                                    <div className="input-with-icon">
                                        <i className="fas fa-envelope"></i>
                                        <input
                                            type="email"
                                            className="form-input"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Department (Read-Only)</label>
                                    <div className="input-with-icon">
                                        <i className="fas fa-building"></i>
                                        <input type="text" className="form-input" value={user.department} readOnly />
                                    </div>
                                </div>
                                <button type="submit" className="btn-save">Update Profile</button>
                            </form>
                        </div>

                        {/* Security Card */}
                        <div className="card">
                            <div className="card-title"><i className="fas fa-shield-alt"></i> Security</div>
                            <form onSubmit={handleChangePassword}>
                                <div className="form-group">
                                    <label>Current Password</label>
                                    <div className="input-with-icon">
                                        <i className="fas fa-key"></i>
                                        <input
                                            type="password"
                                            className="form-input"
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>New Password</label>
                                    <div className="input-with-icon">
                                        <i className="fas fa-lock"></i>
                                        <input
                                            type="password"
                                            className="form-input"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Confirm Password</label>
                                    <div className="input-with-icon">
                                        <i className="fas fa-check-circle"></i>
                                        <input
                                            type="password"
                                            className="form-input"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                                <button type="submit" className="btn-save">Change Password</button>
                            </form>
                        </div>

                    </div>

                    {/* RIGHT COLUMN */}
                    <div className="right-col">

                        {/* Work Preferences */}
                        <div className="card">
                            <div className="card-title"><i className="fas fa-sliders-h"></i> Work Preferences</div>

                            <div className="toggle-row">
                                <div className="toggle-label">
                                    <h5><span className="status-indicator"></span> Active Status</h5>
                                    <p>Appear available for new assignments</p>
                                </div>
                                <label className="switch">
                                    <input type="checkbox" defaultChecked />
                                    <span className="slider"></span>
                                </label>
                            </div>

                            <div className="toggle-row">
                                <div className="toggle-label">
                                    <h5>Critical Alerts</h5>
                                    <p>Notify me for High Priority issues</p>
                                </div>
                                <label className="switch">
                                    <input type="checkbox" defaultChecked />
                                    <span className="slider"></span>
                                </label>
                            </div>

                            <div className="toggle-row">
                                <div className="toggle-label">
                                    <h5>Daily Digest</h5>
                                    <p>Email summary of open tickets</p>
                                </div>
                                <label className="switch">
                                    <input type="checkbox" />
                                    <span className="slider"></span>
                                </label>
                            </div>
                        </div>

                    </div>

                </div>
            </div>
        </div>
    );
};

export default StaffSettings;
