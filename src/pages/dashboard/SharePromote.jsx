export default function SharePromote() {
    return (
        <main>
            <div className="page-header">
                <h1>Share & Promote</h1>
                <p>Promote your referral</p>
            </div>

            <div className="container">
                <div className="content-box">
                    <h2>Share & Promote Page</h2>
                    <div className="description">
                        <p><strong>Route:</strong> /dashboard/share</p>
                        <p><strong>Task:</strong> Provide multi-channel sharing and promotional tools.</p>
                        <p><strong>Responsibilities:</strong></p>
                        <ul style={{ marginLeft: '20px', marginTop: '10px' }}>
                            <li>Multi-channel sharing options:
                                <ul style={{ marginLeft: '20px', marginTop: '5px' }}>
                                    <li>WhatsApp share with pre-filled message</li>
                                    <li>SMS share with message template</li>
                                    <li>Email share with email template</li>
                                    <li>Social media sharing (Facebook, Twitter, LinkedIn)</li>
                                    <li>Copy link to clipboard</li>
                                </ul>
                            </li>
                            <li>Customizable share messages and templates</li>
                            <li>Display QR code for easy sharing</li>
                            <li>Track share analytics and click-through rates</li>
                            <li>Provide promotional content:
                                <ul style={{ marginLeft: '20px', marginTop: '5px' }}>
                                    <li>Project highlights</li>
                                    <li>Offer details</li>
                                    <li>Call-to-action messaging</li>
                                </ul>
                            </li>
                            <li>Campaign management (create multiple campaigns)</li>
                            <li>Share history and metrics</li>
                            <li>Suggested sharing times and audiences</li>
                        </ul>
                    </div>
                </div>
            </div>
        </main>
    );
}
