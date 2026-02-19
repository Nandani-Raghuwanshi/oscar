import { useState } from 'react';
import { useReferral } from '../../hooks/useReferral';
import '../styles/create-referral.css';

/**
 * Create Referral Link Component
 * Allows advocates to create new referral links with QR codes
 */
export default function CreateReferralLink() {
    const advocateId = localStorage.getItem('advocateId');
    const [projectId, setProjectId] = useState('');
    const [channel, setChannel] = useState('direct');
    const [error, setError] = useState(null);

    const {
        referral,
        referralLink,
        qrCode,
        loading,
        error: apiError,
        createLink
    } = useReferral();

    const handleCreateLink = async (e) => {
        e.preventDefault();
        setError(null);

        if (!projectId) {
            setError('Please select a project');
            return;
        }

        try {
            await createLink(advocateId, projectId, channel);
        } catch (err) {
            console.error('Failed to create link', err);
        }
    };

    return (
        <div className="create-referral-page">
            <div className="page-header">
                <h1>Create Referral Link</h1>
                <p>Generate a unique referral link with QR code to share</p>
            </div>

            <div className="create-form">
                {!referral ? (
                    <form onSubmit={handleCreateLink}>
                        <div className="form-group">
                            <label htmlFor="project">Select Project</label>
                            <select
                                id="project"
                                value={projectId}
                                onChange={(e) => setProjectId(e.target.value)}
                                disabled={loading}
                                required
                            >
                                <option value="">-- Choose a project --</option>
                                <option value="project-1">Oscar Sanctuary</option>
                                <option value="project-2">Oscar Residences</option>
                                <option value="project-3">Oscar Fort</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="channel">Share Channel</label>
                            <select
                                id="channel"
                                value={channel}
                                onChange={(e) => setChannel(e.target.value)}
                                disabled={loading}
                            >
                                <option value="direct">Direct Link</option>
                                <option value="whatsapp">WhatsApp</option>
                                <option value="email">Email</option>
                                <option value="qr">QR Code</option>
                            </select>
                        </div>

                        {error && <div className="error-message">{error}</div>}
                        {apiError && <div className="error-message">{apiError}</div>}

                        <button type="submit" disabled={loading} className="btn btn-primary">
                            {loading ? 'Creating...' : 'Create Link'}
                        </button>
                    </form>
                ) : (
                    <div className="link-created">
                        <div className="success-message">
                            <h2>✓ Referral Link Created!</h2>
                        </div>

                        <div className="link-details">
                            <div className="detail-group">
                                <label>Your Referral Link</label>
                                <div className="link-box">
                                    <input
                                        type="text"
                                        value={referralLink}
                                        readOnly
                                        onClick={(e) => e.target.select()}
                                    />
                                    <button
                                        className="btn btn-small"
                                        onClick={() => {
                                            navigator.clipboard.writeText(referralLink);
                                            alert('Link copied!');
                                        }}
                                    >
                                        Copy
                                    </button>
                                </div>
                            </div>

                            {qrCode && (
                                <div className="detail-group">
                                    <label>QR Code</label>
                                    <div className="qr-container">
                                        <img src={qrCode} alt="Referral QR Code" />
                                    </div>
                                    <p className="description">
                                        Share this QR code or print it. People can scan it to fill the lead form.
                                    </p>
                                </div>
                            )}

                            <div className="sharing-guide">
                                <h3>How to Share</h3>
                                <div className="share-options">
                                    <div className="option">
                                        <h4>📱 WhatsApp</h4>
                                        <p>Copy the link and share in chats or groups</p>
                                        <button
                                            className="btn btn-outline"
                                            onClick={() => {
                                                const message = `Check out this amazing prop! ${referralLink}`;
                                                window.open(`https://wa.me/?text=${encodeURIComponent(message)}`);
                                            }}
                                        >
                                            Share on WhatsApp
                                        </button>
                                    </div>
                                    <div className="option">
                                        <h4>📧 Email</h4>
                                        <p>Email the link to friends and family</p>
                                        <button
                                            className="btn btn-outline"
                                            onClick={() => {
                                                const subject = 'Check Out This Amazing Property!';
                                                const body = `You might be interested in this property. Check it out:\n\n${referralLink}`;
                                                window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
                                            }}
                                        >
                                            Share via Email
                                        </button>
                                    </div>
                                    <div className="option">
                                        <h4>🖨️ Print</h4>
                                        <p>Print the QR code to share (business cards, flyers)</p>
                                        <button
                                            className="btn btn-outline"
                                            onClick={() => {
                                                const printWindow = window.open('', '', 'height=400,width=600');
                                                printWindow.document.write(`
                                                    <html>
                                                        <head>
                                                            <title>Referral QR Code</title>
                                                        </head>
                                                        <body style="text-align: center; padding: 20px;">
                                                            <h2>Scan to View Property</h2>
                                                            <img src="${qrCode}" style="width: 300px; height: 300px;" />
                                                            <p>${referralLink}</p>
                                                        </body>
                                                    </html>
                                                `);
                                                printWindow.document.close();
                                                printWindow.print();
                                            }}
                                        >
                                            Print QR Code
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="next-steps">
                                <h3>Next Steps</h3>
                                <ol>
                                    <li>Share your link with friends and family</li>
                                    <li>They fill the lead form when they click the link</li>
                                    <li>Sales team contacts them with your referral</li>
                                    <li>When they convert, you get rewarded!</li>
                                </ol>
                            </div>

                            <button
                                className="btn btn-secondary"
                                onClick={() => window.location.href = '/referral/dashboard'}
                            >
                                Back to Dashboard
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
