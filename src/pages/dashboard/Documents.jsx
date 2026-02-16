export default function Documents() {
    return (
        <main>
            <div className="page-header">
                <h1>Documents & Resources</h1>
                <p>Access project documents</p>
            </div>

            <div className="container">
                <div className="content-box">
                    <h2>Documents Repository Page</h2>
                    <div className="description">
                        <p><strong>Route:</strong> /dashboard/documents</p>
                        <p><strong>Task:</strong> Provide access to project documents and resources.</p>
                        <p><strong>Responsibilities:</strong></p>
                        <ul style={{ marginLeft: '20px', marginTop: '10px' }}>
                            <li>Display available documents for download</li>
                            <li>Categorize documents by type:
                                <ul style={{ marginLeft: '20px', marginTop: '5px' }}>
                                    <li>Brochures</li>
                                    <li>Floor plans</li>
                                    <li>Legal documents</li>
                                    <li>Specifications</li>
                                    <li>Price lists</li>
                                </ul>
                            </li>
                            <li>Provide search and filter functionality</li>
                            <li>Show document metadata:
                                <ul style={{ marginLeft: '20px', marginTop: '5px' }}>
                                    <li>File size</li>
                                    <li>Upload date</li>
                                    <li>Format (PDF, DOC, etc.)</li>
                                </ul>
                            </li>
                            <li>Enable bulk download options</li>
                            <li>Track document views and downloads</li>
                            <li>Preview documents in browser if possible</li>
                            <li>Organize documents by project</li>
                        </ul>
                    </div>
                </div>
            </div>
        </main>
    );
}
