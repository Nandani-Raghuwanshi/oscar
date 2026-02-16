export default function ReferralLeadForm() {
    return (
        <main>
            <div className="page-header">
                <h1>Lead Capture Form</h1>
                <p>Enter buyer details</p>
            </div>

            <div className="container">
                <div className="content-box">
                    <h2>Lead Capture Form Page</h2>
                    <div className="description">
                        <p><strong>Route:</strong> /referral/lead-form</p>
                        <p><strong>Task:</strong> Collect and validate buyer information.</p>
                        <p><strong>Responsibilities:</strong></p>
                        <ul style={{ marginLeft: '20px', marginTop: '10px' }}>
                            <li>Display lead capture form with fields:
                                <ul style={{ marginLeft: '20px', marginTop: '5px' }}>
                                    <li>Buyer name (required)</li>
                                    <li>Email address (required, validated)</li>
                                    <li>Phone number (required, formatted)</li>
                                    <li>Budget range (optional)</li>
                                    <li>Preferred possession date (optional)</li>
                                    <li>Additional notes (optional)</li>
                                </ul>
                            </li>
                            <li>Show form submission status and loading indicators</li>
                            <li>Validate all required fields</li>
                            <li>Format and validate phone numbers</li>
                            <li>Submit lead data to backend (/api/referral/lead endpoint)</li>
                            <li>Display success/error messages</li>
                            <li>Navigate to referral link/QR page on success</li>
                            <li>Implement form reset after submission</li>
                        </ul>
                    </div>
                </div>
            </div>
        </main>
    );
}
