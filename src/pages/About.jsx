export default function About() {
    return (
        <main>
            <div className="page-header">
                <h1>About BuiltCred</h1>
                <p>Learn more about our platform</p>
            </div>

            <div className="container">
                <div className="content-box">
                    <h2>About Page</h2>
                    <div className="description">
                        <p><strong>Task:</strong> Create about page with system information.</p>
                        <p><strong>Responsibilities:</strong></p>
                        <ul style={{ marginLeft: '20px', marginTop: '10px' }}>
                            <li>System description and vision</li>
                            <li>Key features overview</li>
                            <li>Platform statistics and usage metrics</li>
                            <li>Team/company information</li>
                            <li>Contact information</li>
                            <li>Links to social media or external resources</li>
                            <li>FAQ section (optional)</li>
                            <li>Privacy policy link</li>
                            <li>Terms of service link</li>
                        </ul>
                    </div>
                </div>
            </div>
        </main>
    );
}
