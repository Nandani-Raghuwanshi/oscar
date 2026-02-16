export default function ReferralSelectType() {
    return (
        <main>
            <div className="page-header">
                <h1>Advocate Type Selection</h1>
                <p>Choose your advocate type</p>
            </div>

            <div className="container">
                <div className="content-box">
                    <h2>Advocate Type Selection Page</h2>
                    <div className="description">
                        <p><strong>Route:</strong> /referral/select-type</p>
                        <p><strong>Task:</strong> Display advocate type options and guide selection.</p>
                        <p><strong>Responsibilities:</strong></p>
                        <ul style={{ marginLeft: '20px', marginTop: '10px' }}>
                            <li>Display two advocate type options:
                                <ul style={{ marginLeft: '20px', marginTop: '5px' }}>
                                    <li><strong>Project Advocate:</strong> Owns in the same new project</li>
                                    <li><strong>Brand Advocate:</strong> Owns in other projects of the same developer</li>
                                </ul>
                            </li>
                            <li>Show definitions and eligibility criteria for each type</li>
                            <li>Guide users through selection process</li>
                            <li>Validate user's eligibility for each type</li>
                            <li>Store selection for next steps</li>
                            <li>Display auto-correction messages if invalid selection</li>
                            <li>Navigation to next step (project selection)</li>
                        </ul>
                    </div>
                </div>
            </div>
        </main>
    );
}
