export default function AdminDashboard() {
    return (
        <main>
            <div className="page-header">
                <h1>Admin Dashboard</h1>
                <p>System administration and analytics</p>
            </div>

            <div className="container">
                <div className="content-box">
                    <h2>Admin Dashboard Page</h2>
                    <div className="description">
                        <p><strong>Route:</strong> /admin</p>
                        <p><strong>Task:</strong> Provide admin tools for system management and analytics.</p>
                        <p><strong>Responsibilities:</strong></p>
                        <ul style={{ marginLeft: '20px', marginTop: '10px' }}>
                            <li>System overview and statistics:
                                <ul style={{ marginLeft: '20px', marginTop: '5px' }}>
                                    <li>Total advocates</li>
                                    <li>Total referrals</li>
                                    <li>Total conversions</li>
                                    <li>Total rewards distributed</li>
                                </ul>
                            </li>
                            <li>Advocate management:
                                <ul style={{ marginLeft: '20px', marginTop: '5px' }}>
                                    <li>Filter by advocate type (Project vs Brand)</li>
                                    <li>View advocate details and performance</li>
                                    <li>Bulk advocate import</li>
                                    <li>Activate/deactivate advocates</li>
                                </ul>
                            </li>
                            <li>Referral pipeline analytics:
                                <ul style={{ marginLeft: '20px', marginTop: '5px' }}>
                                    <li>By advocate type</li>
                                    <li>By project</li>
                                    <li>Status breakdown</li>
                                </ul>
                            </li>
                            <li>Cross-project analytics and reporting</li>
                            <li>Validation override controls (auto-correction management)</li>
                            <li>Reward tier and calculation management</li>
                            <li>CSV exports for reporting</li>
                            <li>System logs and activity monitoring</li>
                        </ul>
                    </div>
                </div>
            </div>
        </main>
    );
}
