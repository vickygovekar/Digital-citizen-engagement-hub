import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './ReportIssue.css';

const ReportIssue = () => {
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('');
    const [location, setLocation] = useState('');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');

    const navigate = useNavigate();

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const detectLocation = () => {
        if (navigator.geolocation) {
            setLocation('Detecting...');
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation(`Lat: ${position.coords.latitude.toFixed(4)}, Long: ${position.coords.longitude.toFixed(4)}`);
                },
                (error) => {
                    console.error("Error detecting location:", error);
                    setLocation('');
                    alert("Location access denied or failed.");
                }
            );
        } else {
            alert("Geolocation is not supported by this browser.");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            navigate('/login');
            return;
        }
        const user = JSON.parse(storedUser);

        const formData = new FormData();
        formData.append('userId', user.id);
        formData.append('title', title);
        formData.append('category', category);
        formData.append('location', location);
        formData.append('description', description);
        if (image) {
            formData.append('issue_image', image);
        }

        try {
            const response = await fetch('/api/report-issue', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();

            if (data.status === 'success') {
                setMessage(data.message);
                setMessageType('success');
                setTimeout(() => {
                    navigate('/dashboard');
                }, 2000);
            } else {
                setMessage(data.message || 'Submission failed');
                setMessageType('error');
            }
        } catch (error) {
            console.error('Error submitting report:', error);
            setMessage('Connection failed. Please try again.');
            setMessageType('error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="report-issue-body">
            <div className="report-card">
                {/* Header */}
                <div className="card-header">
                    <div className="header-title">
                        <div className="icon-box"><i className="fas fa-bullhorn"></i></div>
                        <h2>New Issue Report</h2>
                    </div>
                    <Link to="/dashboard" className="btn-back"><i className="fas fa-arrow-left"></i> Cancel</Link>
                </div>

                {/* Message */}
                {message && (
                    <div style={{ padding: '0 2.5rem', marginTop: '1.5rem' }}>
                        <div className={`alert-box ${messageType === 'success' ? 'alert-success' : 'alert-error'}`}>
                            {messageType === 'success' ? <i className="fas fa-check-circle"></i> : <i className="fas fa-exclamation-circle"></i>}
                            {message}
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="issue-form-body">
                    {/* LEFT: Upload Zone */}
                    <div className="upload-zone">
                        <label htmlFor="fileInput" className="drop-area">
                            {preview ? (
                                <img id="previewImg" src={preview} alt="Preview" style={{ display: 'block' }} />
                            ) : (
                                <div className="placeholder-content" id="placeholder">
                                    <i className="fas fa-cloud-upload-alt"></i>
                                    <h4>Upload Evidence</h4>
                                    <p>Drag & Drop or Click to Browse<br /><span style={{ opacity: 0.6 }}>Supports JPG, PNG</span></p>
                                </div>
                            )}
                        </label>
                        <input
                            type="file"
                            id="fileInput"
                            accept="image/*"
                            onChange={handleImageChange}
                        />
                    </div>

                    {/* RIGHT: Form */}
                    <div className="form-zone">
                        {/* Title */}
                        <div className="input-wrapper">
                            <label>Issue Title</label>
                            <div className="input-container">
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="What is the issue?"
                                    required
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Category */}
                        <div className="input-wrapper">
                            <label>Category</label>
                            <div className="input-container">
                                <select
                                    className="form-input"
                                    required
                                    style={{ cursor: 'pointer' }}
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                >
                                    <option value="" disabled>Select a category...</option>
                                    <option value="Roads">Roads & Maintenance</option>
                                    <option value="Sanitation">Garbage & Sanitation</option>
                                    <option value="Lighting">Street Lighting</option>
                                    <option value="Water">Water Supply</option>
                                    <option value="Parks">Parks & Greenery</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>

                        {/* Location */}
                        <div className="input-wrapper">
                            <label>Location</label>
                            <div className="input-container">
                                <input
                                    type="text"
                                    id="locationInput"
                                    className="form-input"
                                    placeholder="Address or Landmark"
                                    required
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                />
                                <button type="button" className="detect-btn" onClick={detectLocation}>
                                    <i className="fas fa-crosshairs"></i> Detect
                                </button>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="input-wrapper">
                            <label>Description</label>
                            <div className="input-container">
                                <textarea
                                    className="form-input"
                                    rows="4"
                                    placeholder="Provide specific details to help us..."
                                    style={{ resize: 'none' }}
                                    required
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                ></textarea>
                            </div>
                        </div>

                        <button type="submit" className="btn-submit" disabled={loading}>
                            {loading ? 'Submitting...' : (
                                <>Submit Report <i className="fas fa-paper-plane"></i></>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReportIssue;
