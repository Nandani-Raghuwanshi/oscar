export default function Rewards() {
    return (
        <main>
            <div className="page-header">
                <h1>Rewards & Payouts</h1>
                <p>Track your earnings</p>
            </div>

            <div className="container">
                <div className="content-box">
                    <h2>Rewards & Payouts Page</h2>
                    <div className="description">
                        <p><strong>Route:</strong> /dashboard/rewards</p>
                        <p><strong>Task:</strong> Display reward eligibility and payout information.</p>
                        <p><strong>Responsibilities:</strong></p>
                        <ul style={{ marginLeft: '20px', marginTop: '10px' }}>
                            <li>Display reward eligibility criteria and tier system</li>
                            <li>Show reward calculation breakdown</li>
                            <li>List paid rewards with:
                                <ul style={{ marginLeft: '20px', marginTop: '5px' }}>
                                    <li>Payout dates</li>
                                    <li>Amounts</li>
                                    <li>Associated referral details</li>
                                </ul>
                            </li>
                            <li>Show pending rewards with expected payout dates</li>
                            <li>Display reward history and transaction records</li>
                            <li>Show total rewards earned vs. paid</li>
                            <li>Display reward tier information and benefits</li>
                            <li>Filter rewards by date range or project</li>
                            <li>Download reward statement (PDF/CSV)</li>
                            <li>Referral-to-reward mapping visualization</li>
                        </ul>
                    </div>
                </div>
            </div>
        </main>
    );
}
