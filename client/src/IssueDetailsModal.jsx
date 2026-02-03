import React, { useState, useEffect } from 'react';
import './IssueDetailsModal.css';

const IssueDetailsModal = ({ isOpen, onClose, issue }) => {
    const [fetchedIssue, setFetchedIssue] = useState(null);

    useEffect(() => {
        if (isOpen && issue && issue.id) {
            setFetchedIssue(issue); // Initialize with passed data
            fetch(`/api/issues/${issue.id}`)
                .then(res => res.json())
                .then(data => {
                    if (data.status === 'success') {
                        setFetchedIssue(data.data);
                    }
                })
                .catch(err => console.error('Error fetching details:', err));
        } else {
            setFetchedIssue(null);
        }
    }, [isOpen, issue]);

    if (!isOpen || !fetchedIssue) return null;

    const currentIssue = fetchedIssue;

    const getStatusClass = (status) => {
        if (!status) return 'open'; // Default to 'open' class
        const normalizedStatus = status.toLowerCase();
        if (normalizedStatus === 'open') return 'open';
        if (normalizedStatus === 'in progress' || normalizedStatus === 'on progress') return 'progress';
        if (normalizedStatus === 'resolved') return 'resolved';
        return 'open';
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Issue Details</h2>
                    <button className="close-btn" onClick={onClose}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                <div className="modal-body">
                    {/* Image Section */}
                    {currentIssue.image_path ? (
                        <div className="modal-image-container">
                            <img src={currentIssue.image_path} alt={currentIssue.title} className="modal-image" />
                        </div>
                    ) : (
                        <div className="modal-image-container">
                            <i className="fas fa-image no-image"></i>
                        </div>
                    )}

                    {/* Key Details Grid */}
                    <div className="modal-details-grid">
                        <div className="detail-item">
                            <span className="detail-label">Status</span>
                            <span className="detail-value">
                                <span className={`status-badge ${getStatusClass(currentIssue.status)}`}>
                                    {currentIssue.status || 'Open'}
                                </span>
                            </span>
                        </div>

                        <div className="detail-item">
                            <span className="detail-label">Category</span>
                            <span className="detail-value">
                                <i className="fas fa-layer-group"></i> {currentIssue.category}
                            </span>
                        </div>

                        <div className="detail-item">
                            <span className="detail-label">Location</span>
                            <span className="detail-value">
                                <i className="fas fa-map-marker-alt"></i> {currentIssue.location}
                            </span>
                        </div>

                        <div className="detail-item">
                            <span className="detail-label">Reported By</span>
                            <span className="detail-value">
                                <i className="fas fa-user"></i> {currentIssue.full_name || 'Anonymous'}
                            </span>
                        </div>

                        <div className="detail-item">
                            <span className="detail-label">Date Reported</span>
                            <span className="detail-value">
                                <i className="far fa-calendar-alt"></i> {new Date(currentIssue.created_at).toLocaleDateString()}
                            </span>
                        </div>

                        <div className="detail-item">
                            <span className="detail-label">Upvotes</span>
                            <span className="detail-value">
                                <i className="fas fa-heart" style={{ color: '#ef4444' }}></i> {currentIssue.upvotes || 0}
                            </span>
                        </div>
                    </div>

                    {/* Title & Description */}
                    <div className="modal-description">
                        <h3>{currentIssue.title}</h3>
                        <p>{currentIssue.description}</p>
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="btn-secondary" onClick={onClose} style={{
                        padding: '0.75rem 1.5rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.5rem',
                        background: 'white',
                        cursor: 'pointer',
                        fontWeight: '500'
                    }}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default IssueDetailsModal;
