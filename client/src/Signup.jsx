import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css'; // Reusing the same CSS as it's identical

const Signup = () => {
    const [role, setRole] = useState('citizen');
    const [fullname, setFullname] = useState('');
    const [email, setEmail] = useState('');
    const [department, setDepartment] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState(''); // 'success' or 'error'

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setMessageType('');

        try {
            const payload = {
                role,
                fullname,
                email,
                password,
                department: role === 'staff' ? department : null
            };

            const response = await fetch('/api/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await response.json();

            if (data.status === 'success') {
                setMessage(data.message);
                setMessageType('success');

                // Reset form
                setFullname('');
                setEmail('');
                setPassword('');
                setDepartment('');
                setRole('citizen');

                setTimeout(() => {
                    navigate('/login');
                }, 1500);
            } else {
                setMessage(data.message || 'Signup failed');
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
                        <h1>Join the Community</h1>
                        <p>Whether you're a resident or a city official, let's work together to build a better city.</p>
                    </div>
                </div>

                <div className="form-side">
                    <div className="header">
                        <h2>Create Account</h2>
                        <p>Select your role and fill in your details.</p>
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
                                    type="text"
                                    id="fullname"
                                    placeholder=" "
                                    required
                                    value={fullname}
                                    onChange={(e) => setFullname(e.target.value)}
                                />
                                <label htmlFor="fullname">Full Name</label>
                            </div>
                        </div>

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

                        {role === 'staff' && (
                            <div className="input-group department-field" style={{ display: 'block', animation: 'slideDown 0.3s ease-out' }}>
                                <div className="input-wrapper">
                                    <input
                                        type="text"
                                        id="department"
                                        placeholder=" "
                                        required
                                        value={department}
                                        onChange={(e) => setDepartment(e.target.value)}
                                    />
                                    <label htmlFor="department">Department (e.g., Sanitation)</label>
                                </div>
                            </div>
                        )}

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

                        <button type="submit" className="submit-btn" disabled={loading}>
                            <span style={{ opacity: loading ? 0.5 : 1 }}>Sign Up</span>
                            {loading && <div className="spinner"></div>}
                        </button>
                    </form>

                    <div style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-sub)', fontSize: '0.9rem' }}>
                        Already have an account? <Link to="/login" className="link">Sign In here</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;
