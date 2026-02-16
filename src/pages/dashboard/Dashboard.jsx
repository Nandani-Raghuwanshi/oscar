export default function Dashboard() {
    return (
        <main>
            <div className="page-header">
                <h1>Dashboard</h1>
                <p>Welcome to your Advocate Dashboard</p>
            </div>

            <div className="container">
                <div className="content-box">
                    <h2>Dashboard Overview Page</h2>
                    <div className="description">
                        <p><strong>Route:</strong> /dashboard</p>
                        <p><strong>Task:</strong> Display advocate dashboard with key metrics and overview.</p>
                        <p><strong>Responsibilities:</strong></p>
                        <ul style={{ marginLeft: '20px', marginTop: '10px' }}>
                            <li>Display advocate type badge (Project vs Brand)</li>
                            <li>Show quick stats cards:
                                <ul style={{ marginLeft: '20px', marginTop: '5px' }}>
                                    <li>Active referrals count</li>
                                    <li>Pending rewards amount</li>
                                    <li>Successful conversions count</li>
                                    <li>Total earnings</li>
                                </ul>
                            </li>
                            <li>Display referral summary cards with status breakdown</li>
                            <li>Show recent activity feed (last 5-10 activities)</li>
                            <li>Quick navigation menu to other dashboard sections</li>
                            <li>User profile quick access (name, avatar, email)</li>
                            <li>Recent referral links and QR codes</li>
                            <li>Upcoming reward payouts section</li>
                        </ul>
                    </div>
                </div>
            </div>
        </main>
    );
}
