export default function ReferralLinkQR() {
    return (
        <main>
            <div className="page-header">
                <h1>Referral Link & QR Code</h1>
                <p>Share your unique referral link</p>
            </div>

            <div className="container">
                <div className="content-box">
                    <h2>Referral Link & QR Page</h2>
                    <div className="description">
                        <p><strong>Route:</strong> /referral/link-qr</p>
                        <p><strong>Task:</strong> Display and enable sharing of referral link and QR code.</p>
                        <p><strong>Responsibilities:</strong></p>
                        <ul style={{ marginLeft: '20px', marginTop: '10px' }}>
                            <li>Display generated UUID-based referral link</li>
                            <li>Show QR code for the referral link</li>
                            <li>Provide download QR code functionality (PNG/PDF)</li>
                            <li>Copy link to clipboard with visual feedback</li>
                            <li>Display link validity and expiration dates</li>
                            <li>Show link sharing options:
                                <ul style={{ marginLeft: '20px', marginTop: '5px' }}>
                                    <li>WhatsApp share</li>
                                    <li>Email share</li>
                                    <li>SMS share</li>
                                    <li>Direct copy</li>
                                </ul>
                            </li>
                            <li>Track sharing metrics (optional)</li>
                            <li>Generate new link option if expired</li>
                            <li>Regenerate link on demand</li>
                        </ul>
                    </div>
                </div>
            </div>
        </main>
    );
}
