export default function Home() {
    return (
        <main>
            <div className="page-header">
                <h1>Welcome to BuiltCred</h1>
                <p>Referral Management System for Real Estate</p>
            </div>

            <div className="container">
                <div className="content-box">
                    <h2>Home Page</h2>
                    <div className="description">
                        <p><strong>Task:</strong> Create the landing/home page for BuiltCred referral system.</p>
                        <p><strong>Responsibilities:</strong></p>
                        <ul style={{ marginLeft: '20px', marginTop: '10px' }}>
                            <li>Display system overview and key features</li>
                            <li>Show quick stats about the referral system</li>
                            <li>Call-to-action buttons for new users (Sign Up / Start Referral)</li>
                            <li>Display testimonials or case studies if available</li>
                            <li>Real-time API status indicator</li>
                            <li>Responsive design for all devices</li>
                        </ul>
                    </div>
                </div>
            </div>
        </main>
    );
}
