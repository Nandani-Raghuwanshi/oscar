export default function ReferralSelectProject() {
    return (
        <main>
            <div className="page-header">
                <h1>Select Project</h1>
                <p>Choose a project for your referral</p>
            </div>

            <div className="container">
                <div className="content-box">
                    <h2>Project Selection Page</h2>
                    <div className="description">
                        <p><strong>Route:</strong> /referral/select-project</p>
                        <p><strong>Task:</strong> Show and allow selection of available projects.</p>
                        <p><strong>Responsibilities:</strong></p>
                        <ul style={{ marginLeft: '20px', marginTop: '10px' }}>
                            <li>Show available projects based on advocate type</li>
                            <li>Display project details (name, location, status, units available)</li>
                            <li>Filter projects by developer/eligibility</li>
                            <li>Allow project selection with clear UI</li>
                            <li>Show referral scope information:
                                <ul style={{ marginLeft: '20px', marginTop: '5px' }}>
                                    <li>Project Advocate: Can refer for their own project only</li>
                                    <li>Brand Advocate: Can refer for any project of the developer</li>
                                </ul>
                            </li>
                            <li>Search and filter functionality for projects</li>
                            <li>Navigate to lead capture form on selection</li>
                        </ul>
                    </div>
                </div>
            </div>
        </main>
    );
}
