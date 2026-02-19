import { useState } from 'react';
import '../styles/share-promote.css';

/**
 * Share & Promote Page
 * Provide sharing options and promotional materials
 */
export default function SharePromote() {
    const referralLink = localStorage.getItem('referralLink') || 'https://oscar.dev/ref/abc123xyz';
    const [copied, setCopied] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState('professional');

    const messageTemplates = {
        professional: {
            title: 'Professional',
            subject: 'Great Investment Opportunity',
            message: 'I found an amazing residential project that I think would interest you. Check it out here:'
        },
        casual: {
            title: 'Casual',
            subject: 'Check This Out!',
            message: 'Hey! I came across this cool project and thought you might like it:'
        },
        urgent: {
            title: 'Urgent Offer',
            subject: 'Limited Time Offer - Don\'t Miss Out',
            message: 'This is a limited-time opportunity. Check out this amazing project before it\'s too late:'
        },
        family: {
            title: 'Family & Friends',
            subject: 'Perfect for Your New Home',
            message: 'Perfect for a new home! Check out this great project I found:'
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(referralLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const shareOnPlatform = (platform) => {
        const template = messageTemplates[selectedTemplate];
        const shareText = `${template.message}\n${referralLink}`;

        const shareUrls = {
            whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText)}`,
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`,
            twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`,
            linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}`,
            email: `mailto:?subject=${encodeURIComponent(template.subject)}&body=${encodeURIComponent(template.message + '\n' + referralLink)}`
        };

        window.open(shareUrls[platform], '_blank');
    };

    return (
        <main className="share-promote-page">
            <div className="page-header">
                <h1>Share & Promote</h1>
                <p>Share your referral link across your network and earn rewards</p>
            </div>

            <div className="container">
                {/* Main Referral Link */}
                <section className="link-section">
                    <h2>Your Referral Link</h2>
                    <div className="link-display-box">
                        <input
                            type="text"
                            value={referralLink}
                            readOnly
                            className="link-input"
                        />
                        <button
                            onClick={copyToClipboard}
                            className={`btn-copy ${copied ? 'copied' : ''}`}
                        >
                            {copied ? '✓ Copied!' : '📋 Copy'}
                        </button>
                    </div>
                </section>

                {/* Message Templates */}
                <section className="templates-section">
                    <h2>Message Templates</h2>
                    <div className="template-selector">
                        {Object.entries(messageTemplates).map(([key, template]) => (
                            <button
                                key={key}
                                className={`template-btn ${selectedTemplate === key ? 'active' : ''}`}
                                onClick={() => setSelectedTemplate(key)}
                            >
                                {template.title}
                            </button>
                        ))}
                    </div>

                    <div className="template-preview">
                        <h3>Preview</h3>
                        <div className="message-box">
                            <p className="subject">Subject: {messageTemplates[selectedTemplate].subject}</p>
                            <p className="message">{messageTemplates[selectedTemplate].message}</p>
                            <p className="link">{referralLink}</p>
                        </div>
                    </div>
                </section>

                {/* Share Platforms */}
                <section className="platforms-section">
                    <h2>Share on Social Media & Messaging</h2>
                    <div className="share-platforms">
                        <button
                            onClick={() => shareOnPlatform('whatsapp')}
                            className="platform-btn whatsapp"
                        >
                            <span className="icon">💬</span>
                            <span className="platform-name">WhatsApp</span>
                            <span className="description">Message friends & groups</span>
                        </button>

                        <button
                            onClick={() => shareOnPlatform('email')}
                            className="platform-btn email"
                        >
                            <span className="icon">📧</span>
                            <span className="platform-name">Email</span>
                            <span className="description">Send to your contacts</span>
                        </button>

                        <button
                            onClick={() => shareOnPlatform('facebook')}
                            className="platform-btn facebook"
                        >
                            <span className="icon">f</span>
                            <span className="platform-name">Facebook</span>
                            <span className="description">Share on your timeline</span>
                        </button>

                        <button
                            onClick={() => shareOnPlatform('twitter')}
                            className="platform-btn twitter"
                        >
                            <span className="icon">𝕏</span>
                            <span className="platform-name">Twitter/X</span>
                            <span className="description">Tweet to your followers</span>
                        </button>

                        <button
                            onClick={() => shareOnPlatform('linkedin')}
                            className="platform-btn linkedin"
                        >
                            <span className="icon">in</span>
                            <span className="platform-name">LinkedIn</span>
                            <span className="description">Share with your network</span>
                        </button>
                    </div>
                </section>

                {/* Promotional Materials */}
                <section className="materials-section">
                    <h2>Promotional Materials</h2>
                    <div className="materials-grid">
                        <div className="material-card">
                            <h3>📸 Social Media Graphics</h3>
                            <p>Download pre-made graphics for social media posts</p>
                            <div className="preview-grid">
                                <div className="preview-box">Square (Instagram)</div>
                                <div className="preview-box">Story (Vertical)</div>
                                <div className="preview-box">Cover (Facebook)</div>
                            </div>
                            <button className="btn btn-secondary">Download Graphics</button>
                        </div>

                        <div className="material-card">
                            <h3>📄 Email Templates</h3>
                            <p>Ready-to-send email templates for your contacts</p>
                            <ul className="template-list">
                                <li>General Inquiry Email</li>
                                <li>Project Details Email</li>
                                <li>Special Offer Email</li>
                                <li>Follow-up Email</li>
                            </ul>
                            <button className="btn btn-secondary">View Templates</button>
                        </div>

                        <div className="material-card">
                            <h3>📱 QR Code</h3>
                            <p>Share QR code in printed materials or presentations</p>
                            <div className="qr-placeholder">
                                [QR Code Preview]
                            </div>
                            <button className="btn btn-secondary">Download QR Code</button>
                        </div>

                        <div className="material-card">
                            <h3>📊 Presentation Slides</h3>
                            <p>PowerPoint slides to present to your network</p>
                            <ul className="template-list">
                                <li>Project Overview</li>
                                <li>Investment Benefits</li>
                                <li>Referral Program</li>
                                <li>FAQ Slide</li>
                            </ul>
                            <button className="btn btn-secondary">Download Slides</button>
                        </div>
                    </div>
                </section>

                {/* Referral Tips */}
                <section className="tips-section">
                    <h2>💡 Tips for Successful Sharing</h2>
                    <div className="tips-grid">
                        <div className="tip-card">
                            <h3>Know Your Audience</h3>
                            <p>Share with people who are likely interested in real estate investments</p>
                        </div>
                        <div className="tip-card">
                            <h3>Personal Touch</h3>
                            <p>Add a personal message explaining why you recommend the project</p>
                        </div>
                        <div className="tip-card">
                            <h3>Follow-up</h3>
                            <p>Follow up with interested prospects to answer questions</p>
                        </div>
                        <div className="tip-card">
                            <h3>Be Authentic</h3>
                            <p>Share genuine information about the project and its benefits</p>
                        </div>
                        <div className="tip-card">
                            <h3>Use Multiple Channels</h3>
                            <p>Share across different platforms to reach a wider audience</p>
                        </div>
                        <div className="tip-card">
                            <h3>Track Results</h3>
                            <p>Monitor which channels bring the most leads and focus there</p>
                        </div>
                    </div>
                </section>

                {/* Performance Metrics */}
                <section className="metrics-section">
                    <h2>📈 Your Sharing Performance</h2>
                    <div className="metrics-cards">
                        <div className="metric-card">
                            <span className="metric-label">Link Clicks</span>
                            <span className="metric-value">24</span>
                        </div>
                        <div className="metric-card">
                            <span className="metric-label">Leads Generated</span>
                            <span className="metric-value">8</span>
                        </div>
                        <div className="metric-card">
                            <span className="metric-label">Conversion Rate</span>
                            <span className="metric-value">33%</span>
                        </div>
                        <div className="metric-card">
                            <span className="metric-label">Top Channel</span>
                            <span className="metric-value">WhatsApp</span>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}
