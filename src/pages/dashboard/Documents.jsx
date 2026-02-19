import { useState, useEffect } from 'react';
import '../styles/documents.css';

/**
 * Documents Page
 * Display important documents and agreements
 */
export default function Documents() {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate loading documents
        const docs = [
            {
                id: 1,
                name: 'Advocate Agreement',
                type: 'pdf',
                size: '2.4 MB',
                date: '2025-10-16',
                status: 'signed',
                icon: '📄'
            },
            {
                id: 2,
                name: 'Payment Terms & Conditions',
                type: 'pdf',
                size: '1.8 MB',
                date: '2025-10-16',
                status: 'signed',
                icon: '📄'
            },
            {
                id: 3,
                name: 'Tax Documentation (Form 26AS)',
                type: 'pdf',
                size: '0.9 MB',
                date: '2025-12-01',
                status: 'pending',
                icon: '📋'
            },
            {
                id: 4,
                name: 'Bank Account Verification',
                type: 'pdf',
                size: '1.2 MB',
                date: '2025-10-20',
                status: 'verified',
                icon: '✅'
            },
            {
                id: 5,
                name: 'Commission Summary (Jan 2026)',
                type: 'pdf',
                size: '0.7 MB',
                date: '2026-01-31',
                status: 'available',
                icon: '📊'
            },
            {
                id: 6,
                name: 'GST Certificate',
                type: 'pdf',
                size: '1.1 MB',
                date: '2025-12-15',
                status: 'verified',
                icon: '✅'
            }
        ];

        setDocuments(docs);
        setLoading(false);
    }, []);

    const getStatusBadge = (status) => {
        const statusMap = {
            'signed': { color: '#27ae60', label: 'Signed', icon: '✓' },
            'verified': { color: '#27ae60', label: 'Verified', icon: '✓' },
            'pending': { color: '#f39c12', label: 'Pending', icon: '⏳' },
            'available': { color: '#3498db', label: 'Available', icon: '📥' }
        };
        const info = statusMap[status] || { color: '#95a5a6', label: status, icon: '•' };
        return info;
    };

    const downloadDocument = (docName) => {
        // Simulate document download
        alert(`Document "${docName}" would be downloaded here`);
    };

    if (loading) {
        return (
            <main className="documents-page">
                <div className="loading-spinner">
                    <p>Loading documents...</p>
                </div>
            </main>
        );
    }

    return (
        <main className="documents-page">
            <div className="page-header">
                <h1>Documents & Agreements</h1>
                <p>Manage your important documents and certifications</p>
            </div>

            {/* Quick Stats */}
            <section className="document-stats">
                <div className="stat-box signed">
                    <div className="stat-number">2</div>
                    <div className="stat-label">Signed</div>
                </div>
                <div className="stat-box verified">
                    <div className="stat-number">2</div>
                    <div className="stat-label">Verified</div>
                </div>
                <div className="stat-box pending">
                    <div className="stat-number">1</div>
                    <div className="stat-label">Pending</div>
                </div>
                <div className="stat-box available">
                    <div className="stat-number">1</div>
                    <div className="stat-label">Available</div>
                </div>
            </section>

            {/* Documents List */}
            <section className="documents-list">
                <h2>📚 All Documents</h2>

                <div className="document-grid">
                    {documents.map(doc => {
                        const statusInfo = getStatusBadge(doc.status);
                        return (
                            <div key={doc.id} className="document-card">
                                <div className="doc-header">
                                    <span className="doc-icon">{doc.icon}</span>
                                    <span className="status-badge" style={{ backgroundColor: statusInfo.color }}>
                                        {statusInfo.label}
                                    </span>
                                </div>

                                <div className="doc-content">
                                    <h3 className="doc-name">{doc.name}</h3>
                                    <div className="doc-meta">
                                        <span className="meta-item">
                                            <span className="meta-label">Size:</span>
                                            <span className="meta-value">{doc.size}</span>
                                        </span>
                                        <span className="meta-item">
                                            <span className="meta-label">Date:</span>
                                            <span className="meta-value">
                                                {new Date(doc.date).toLocaleDateString()}
                                            </span>
                                        </span>
                                    </div>
                                </div>

                                <div className="doc-actions">
                                    <button
                                        onClick={() => downloadDocument(doc.name)}
                                        className="btn-download"
                                        title="Download document"
                                    >
                                        ⬇️ Download
                                    </button>
                                    <button
                                        className="btn-view"
                                        title="View document"
                                    >
                                        👁️ View
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* Important Notices */}
            <section className="notices-section">
                <h2>📢 Important Notices</h2>

                <div className="notice-box pending">
                    <h3>⏳ Action Required: Tax Documentation</h3>
                    <p>
                        Your Form 26AS for tax filing is pending. Please upload or verify your tax documents
                        to ensure uninterrupted reward payouts.
                    </p>
                    <a href="#" className="link-btn">Upload Now →</a>
                </div>

                <div className="notice-box info">
                    <h3>ℹ️ Tax Information</h3>
                    <p>
                        All referral rewards are subject to applicable taxes. Please refer to our Terms & Conditions
                        for detailed tax calculation methods. You can download your commission summary for tax filing purposes.
                    </p>
                </div>

                <div className="notice-box info">
                    <h3>ℹ️ Document Retention Policy</h3>
                    <p>
                        We retain all signed agreements and transaction documents for 7 years as per regulatory requirements.
                        You can access and download these documents anytime.
                    </p>
                </div>
            </section>

            {/* Help Section */}
            <section className="help-section">
                <h2>❓ Need Help?</h2>
                <div className="help-cards">
                    <div className="help-card">
                        <h3>Understand Your Documents</h3>
                        <p>Learn about the terms and conditions in our agreement documents.</p>
                        <a href="/about" className="link-btn">Read Guide →</a>
                    </div>
                    <div className="help-card">
                        <h3>Tax & Compliance</h3>
                        <p>Get answers to common questions about taxes and compliance.</p>
                        <a href="#" className="link-btn">FAQ →</a>
                    </div>
                    <div className="help-card">
                        <h3>Contact Support</h3>
                        <p>Need assistance with your documents? Our team is here to help.</p>
                        <a href="#" className="link-btn">Contact Us →</a>
                    </div>
                </div>
            </section>
        </main>
    );
}
