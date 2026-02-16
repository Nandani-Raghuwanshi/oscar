export default function MyReferrals() {
    return (
        <main>
            <div className="page-header">
                <h1>My Referrals</h1>
                <p>Manage your referrals</p>
            </div>

            <div className="container">
                <div className="content-box">
                    <h2>My Referrals Page</h2>
                    <div className="description">
                        <p><strong>Route:</strong> /dashboard/my-referrals</p>
                        <p><strong>Task:</strong> Display and manage all user referrals.</p>
                        <p><strong>Responsibilities:</strong></p>
                        <ul style={{ marginLeft: '20px', marginTop: '10px' }}>
                            <li>List all referrals with status indicators:
                                <ul style={{ marginLeft: '20px', marginTop: '5px' }}>
                                    <li>Pending (lead received)</li>
                                    <li>Converted (successful sale)</li>
                                    <li>Rejected (not qualified)</li>
                                </ul>
                            </li>
                            <li>Display lead details for each referral (name, contact, budget)</li>
                            <li>Show referral timeline (first-touch, last-touch)</li>
                            <li>Filter/search by project or status</li>
                            <li>Click to view individual referral details and history</li>
                            <li>Display associated reward for each referral</li>
                            <li>Show referral dates and follow-up information</li>
                            <li>Pagination or infinite scroll for large lists</li>
                            <li>Export referrals as CSV (optional)</li>
                        </ul>
                    </div>
                </div>
            </div>
        </main>
    );
}
