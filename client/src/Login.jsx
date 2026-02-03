import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Login.css';

const Login = () => {
    const [role, setRole] = useState('citizen');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState(''); // 'success' or 'error'

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setMessageType('');

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, role })
            });
            const data = await response.json();

            if (data.status === 'success') {
                setMessage(data.message);
                setMessageType('success');

                // Save user data to localStorage
                localStorage.setItem('user', JSON.stringify(data.user));

                // Redirect logic
                setTimeout(() => {
                    if (data.role === 'staff') {
                        window.location.href = '/staff-dashboard';
                    } else if (data.role === 'admin') {
                        // navigate('/admin-dashboard'); // Placeholder
                        console.log('Redirecting to admin dashboard');
                    } else {
                        // window.location.href = '/dashboard'; // Using window.location for full reload or useNavigate for SPA
                        // Using window.location.href to ensure state reset if needed, but for SPA feel navigate is better if we handle state
                        window.location.href = '/dashboard';
                    }
                }, 1000);
            } else {
                setMessage(data.message || 'Login failed');
                setMessageType('error');
            }
        } catch (error) {
            setMessage('Connection failed. Please try again.');
            setMessageType('error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-wrapper">
            <div className="login-container">
                <div className="visual-side">
                    <div className="visual-content">
                        <h1>Digital Citizen Hub</h1>
                        <p>Empowering communities through transparent reporting and real-time engagement.</p>
                    </div>
                </div>

                <div className="form-side">
                    <div className="header">
                        <h2>Welcome Back</h2>
                        <p>Please enter your details to sign in.</p>
                    </div>

                    <div className="role-switcher">
                        <button
                            type="button"
                            className={`role-btn ${role === 'citizen' ? 'active' : ''}`}
                            onClick={() => setRole('citizen')}
                        >
                            Citizen
                        </button>
                        <button
                            type="button"
                            className={`role-btn ${role === 'staff' ? 'active' : ''}`}
                            onClick={() => setRole('staff')}
                        >
                            Municipal Staff
                        </button>
                    </div>

                    {message && (
                        <div className={`alert show ${messageType === 'success' ? 'alert-success' : 'alert-error'}`}>
                            {message}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            <div className="input-wrapper">
                                <input
                                    type="email"
                                    id="email"
                                    placeholder=" "
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                                <label htmlFor="email">Email Address</label>
                            </div>
                        </div>

                        <div className="input-group">
                            <div className="input-wrapper">
                                <input
                                    type="password"
                                    id="password"
                                    placeholder=" "
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <label htmlFor="password">Password</label>
                            </div>
                        </div>

                        <div className="actions">
                            <label className="checkbox-wrapper">
                                <input type="checkbox" /> Remember me
                            </label>
                            <a href="#" className="link">Forgot Password?</a>
                        </div>

                        <button type="submit" className="submit-btn" disabled={loading}>
                            <span style={{ opacity: loading ? 0.5 : 1 }}>Sign In</span>
                            {loading && <div className="spinner"></div>}
                        </button>
                    </form>

                    <div style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-sub)', fontSize: '0.9rem' }}>
                        Don't have an account? <Link to="/signup" className="link">Sign up for free</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
