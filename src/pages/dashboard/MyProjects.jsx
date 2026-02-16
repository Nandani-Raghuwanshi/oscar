export default function MyProjects() {
    return (
        <main>
            <div className="page-header">
                <h1>My Projects</h1>
                <p>Manage your projects</p>
            </div>

            <div className="container">
                <div className="content-box">
                    <h2>My Projects Page</h2>
                    <div className="description">
                        <p><strong>Route:</strong> /dashboard/projects</p>
                        <p><strong>Task:</strong> Display and manage advocate's projects.</p>
                        <p><strong>Responsibilities:</strong></p>
                        <ul style={{ marginLeft: '20px', marginTop: '10px' }}>
                            <li>List projects advocate owns or manages</li>
                            <li>Show project-specific referral links and QR codes</li>
                            <li>Display project details:
                                <ul style={{ marginLeft: '20px', marginTop: '5px' }}>
                                    <li>Project name and location</li>
                                    <li>Status (pre-launch, ongoing, completed)</li>
                                    <li>Units available</li>
                                    <li>Developer information</li>
                                </ul>
                            </li>
                            <li>Show referral statistics per project</li>
                            <li>Generate/regenerate project referral links</li>
                            <li>Display scoped referral information</li>
                            <li>Click project to view detailed analytics</li>
                            <li>Manage project-specific settings (optional)</li>
                            <li>View individual project referral links</li>
                        </ul>
                    </div>
                </div>
            </div>
        </main>
    );
}
