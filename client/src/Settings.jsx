import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Dashboard.css';
import './Settings.css';

const Settings = () => {
    const [user, setUser] = useState({ name: 'Citizen', role: 'citizen', email: '' });
    const [formData, setFormData] = useState({
        fullname: '',
        email: '',
        current_password: '',
        new_password: '',
        confirm_password: ''
    });
    const [msg, setMsg] = useState('');
    const [msgType, setMsgType] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            navigate('/login', { replace: true });
            return;
        }
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setFormData(prev => ({
            ...prev,
            fullname: parsedUser.fullname || parsedUser.name || '',
            email: parsedUser.email || ''
        }));
    }, [navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMsg('');
        try {
            const response = await fetch('/api/settings/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    fullname: formData.fullname,
                    email: formData.email
                })
            });
            const data = await response.json();
            if (data.status === 'success') {
                setMsg(data.message);
                setMsgType('success');
                // Update local storage
                const updatedUser = { ...user, fullname: formData.fullname, email: formData.email };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                setUser(updatedUser);
            } else {
                setMsg(data.message);
                setMsgType('error');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            setMsg('An error occurred. Please try again.');
            setMsgType('error');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (formData.new_password !== formData.confirm_password) {
            setMsg('New passwords do not match.');
            setMsgType('error');
            return;
        }
        setLoading(true);
        setMsg('');
        try {
            const response = await fetch('/api/settings/password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    current_password: formData.current_password,
                    new_password: formData.new_password
                })
            });
            const data = await response.json();
            if (data.status === 'success') {
                setMsg(data.message);
                setMsgType('success');
                setFormData(prev => ({
                    ...prev,
                    current_password: '',
                    new_password: '',
                    confirm_password: ''
                }));
            } else {
                setMsg(data.message);
                setMsgType('error');
            }
        } catch (error) {
            console.error('Error changing password:', error);
            setMsg('An error occurred. Please try again.');
            setMsgType('error');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login', { replace: true });
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
                        <Link to="/feed" className="nav-link">
                            <i className="fas fa-bullhorn"></i>
                            <span>Community Feed</span>
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link to="/settings" className="nav-link active">
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
                <div className="page-header">
                    <h1>Account Settings</h1>
                    <p>Manage your profile details and preferences.</p>
                </div>

                {msg && (
                    <div className={`alert ${msgType === 'success' ? 'alert-success' : 'alert-error'}`}>
                        {msgType === 'success' ? <i className="fas fa-check-circle"></i> : <i className="fas fa-exclamation-circle"></i>}
                        {msg}
                    </div>
                )}

                <div className="settings-grid">

                    {/* LEFT COLUMN */}
                    <div className="left-col">

                        {/* Profile Card */}
                        <div className="card">
                            <div className="card-title"><i className="fas fa-user-circle"></i> Profile Information</div>
                            <form onSubmit={handleProfileUpdate}>
                                <div className="form-group">
                                    <label>Full Name</label>
                                    <div className="input-with-icon">
                                        <i className="fas fa-user"></i>
                                        <input
                                            type="text"
                                            name="fullname"
                                            className="form-input"
                                            value={formData.fullname}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Email Address</label>
                                    <div className="input-with-icon">
                                        <i className="fas fa-envelope"></i>
                                        <input
                                            type="email"
                                            name="email"
                                            className="form-input"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>
                                <button type="submit" className="btn-save" disabled={loading}>
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </button>
                            </form>
                        </div>

                        {/* Security Card */}
                        <div className="card">
                            <div className="card-title"><i className="fas fa-lock"></i> Security</div>
                            <form onSubmit={handlePasswordChange}>
                                <div className="form-group">
                                    <label>Current Password</label>
                                    <div className="input-with-icon">
                                        <i className="fas fa-key"></i>
                                        <input
                                            type="password"
                                            name="current_password"
                                            className="form-input"
                                            value={formData.current_password}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>New Password</label>
                                    <div className="input-with-icon">
                                        <i className="fas fa-unlock-alt"></i>
                                        <input
                                            type="password"
                                            name="new_password"
                                            className="form-input"
                                            value={formData.new_password}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Confirm New Password</label>
                                    <div className="input-with-icon">
                                        <i className="fas fa-check-circle"></i>
                                        <input
                                            type="password"
                                            name="confirm_password"
                                            className="form-input"
                                            value={formData.confirm_password}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>
                                <button type="submit" className="btn-save" disabled={loading}>
                                    {loading ? 'Updating...' : 'Update Password'}
                                </button>
                            </form>
                        </div>

                    </div>

                    {/* RIGHT COLUMN */}
                    <div className="right-col">

                        {/* Preferences */}
                        <div className="card">
                            <div className="card-title"><i className="fas fa-bell"></i> Notifications</div>

                            <div className="toggle-row">
                                <div className="toggle-label">
                                    <h5>Email Alerts</h5>
                                    <p>Receive updates on your issues</p>
                                </div>
                                <label className="switch">
                                    <input type="checkbox" defaultChecked />
                                    <span className="slider"></span>
                                </label>
                            </div>

                            <div className="toggle-row">
                                <div className="toggle-label">
                                    <h5>SMS Notifications</h5>
                                    <p>Get urgent alerts on your phone</p>
                                </div>
                                <label className="switch">
                                    <input type="checkbox" />
                                    <span className="slider"></span>
                                </label>
                            </div>

                            <div className="toggle-row">
                                <div className="toggle-label">
                                    <h5>Community Feed</h5>
                                    <p>Weekly summary of top issues</p>
                                </div>
                                <label className="switch">
                                    <input type="checkbox" defaultChecked />
                                    <span className="slider"></span>
                                </label>
                            </div>
                        </div>

                        {/* Danger Zone */}
                        <div className="card danger-zone">
                            <div className="card-title"><i className="fas fa-exclamation-triangle"></i> Danger Zone</div>
                            <p style={{ fontSize: '0.9rem', color: '#7f1d1d', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                                Once you delete your account, there is no going back. Please be certain.
                            </p>
                            <button type="button" className="btn-danger" onClick={() => alert('Please contact admin to delete account.')}>Delete Account</button>
                        </div>

                    </div>

                </div>
            </div>
        </div>
    );
};

export default Settings;
