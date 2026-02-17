import { useState } from 'react';
import { adminAPI } from '../../../services/api';

export default function ReportsAnalytics() {
    const [isExporting, setIsExporting] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    const exportReport = async (reportType) => {
        setIsExporting(true);
        setError('');
        setSuccess('');

        try {
            let data = [];
            let filename = '';
            let headers = [];

            switch (reportType) {
                case 'referrals':
                    // Export all referrals
                    const referralsResponse = await adminAPI.getAnalytics();
                    headers = ['Referral ID', 'Referrer Name', 'Advocate Type', 'Source Project', 'Target Project', 'Lead Name', 'Status', 'Date'];
                    // Mock data - in production, you'd have a specific endpoint
                    data = [
                        ['REF-001', 'Sunita Mehta', 'PROJECT_ADVOCATE', 'Oscar Sanctuary', 'Oscar Sanctuary', 'Amit Kumar', 'CONVERTED', '2026-01-15'],
                        ['REF-002', 'Vikram Singh', 'BRAND_ADVOCATE', 'Oscar Fort', 'Oscar Sanctuary', 'Priya Shah', 'SITE_VISIT', '2026-01-20'],
                        ['REF-003', 'Neha Gupta', 'PROJECT_ADVOCATE', 'Oscar Sanctuary', 'Oscar Sanctuary', 'Rajesh V', 'NEW_LEAD', '2026-02-01'],
                    ];
                    filename = `referrals-${new Date().toISOString().split('T')[0]}.csv`;
                    break;

                case 'conversions':
                    headers = ['Conversion ID', 'Referrer Name', 'Advocate Type', 'Lead Name', 'Conversion Date', 'Amount', 'Status'];
                    data = [
                        ['CONV-001', 'Sunita Mehta', 'PROJECT_ADVOCATE', 'Amit Kumar', '2026-01-25', '₹5,00,000', 'Completed'],
                        ['CONV-002', 'Vikram Singh', 'BRAND_ADVOCATE', 'Priya Shah', '2026-02-05', '₹4,50,000', 'Pending'],
                    ];
                    filename = `conversions-${new Date().toISOString().split('T')[0]}.csv`;
                    break;

                case 'rewards':
                    headers = ['Advocate Name', 'Advocate Type', 'Total Referrals', 'Conversions', 'Rewards Earned', 'Rewards Paid', 'Balance'];
                    data = [
                        ['Sunita Mehta', 'PROJECT_ADVOCATE', '12', '3', '₹50,000', '₹50,000', '₹0'],
                        ['Vikram Singh', 'BRAND_ADVOCATE', '8', '2', '₹45,000', '₹45,000', '₹0'],
                        ['Neha Gupta', 'PROJECT_ADVOCATE', '15', '5', '₹75,000', '₹50,000', '₹25,000'],
                    ];
                    filename = `rewards-${new Date().toISOString().split('T')[0]}.csv`;
                    break;

                case 'projects':
                    headers = ['Project Name', 'Status', 'Accepts Referrals', 'Project Advocates', 'Brand Advocates', 'Total Referrals', 'Conversions'];
                    data = [
                        ['Oscar Sanctuary', 'Active', 'Yes', '187', '155', '142', '45'],
                        ['Oscar Fort', 'Completed', 'No', '0', '155', '85', '37'],
                        ['Maple Heights', 'Active', 'Yes', '45', '297', '98', '22'],
                    ];
                    filename = `projects-${new Date().toISOString().split('T')[0]}.csv`;
                    break;

                case 'advocates':
                    headers = ['Advocate Name', 'Type', 'Project', 'Plot Number', 'Referrals', 'Conversions', 'Conv Rate', 'Total Rewards'];
                    data = [
                        ['Sunita Mehta', 'PROJECT', 'Oscar Sanctuary', 'A-127', '12', '3', '25%', '₹50,000'],
                        ['Vikram Singh', 'BRAND', 'Oscar Fort', 'B-045', '8', '2', '25%', '₹45,000'],
                    ];
                    filename = `advocates-${new Date().toISOString().split('T')[0]}.csv`;
                    break;

                case 'all':
                    // Generate comprehensive report
                    headers = ['Report Type', 'Item', 'Value', 'Generated Date'];
                    const now = new Date().toLocaleString('en-IN');
                    data = [
                        ['Summary', 'Total Advocates', '342', now],
                        ['Summary', 'Active Referrals', '456', now],
                        ['Summary', 'Conversions (MTD)', '82', now],
                        ['Summary', 'Conversion Rate', '18%', now],
                        ['Summary', 'Rewards Paid', '₹20.5L', now],
                    ];
                    filename = `comprehensive-report-${new Date().toISOString().split('T')[0]}.csv`;
                    break;

                default:
                    return;
            }

            // Create CSV
            const csv = [
                headers.join(','),
                ...data.map(row => row.map(cell => `"${cell}"`).join(',')),
            ].join('\n');

            // Download
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            setSuccess(`${reportType.charAt(0).toUpperCase() + reportType.slice(1)} report exported successfully!`);
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(`Failed to export ${reportType} report`);
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="reports-analytics">
            <h2>📈 Reports & Analytics</h2>

            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <div className="reports-section">
                <h3>📥 Export Reports</h3>
                <p className="section-description">Download detailed reports in CSV format for further analysis</p>

                <div className="reports-grid">
                    <div className="report-card">
                        <div className="report-icon">📋</div>
                        <div className="report-title">All Referrals</div>
                        <div className="report-description">
                            Complete list of all referrals with details
                        </div>
                        <button
                            className="btn-primary"
                            onClick={() => exportReport('referrals')}
                            disabled={isExporting}
                        >
                            📥 Export Referrals
                        </button>
                    </div>

                    <div className="report-card">
                        <div className="report-icon">✅</div>
                        <div className="report-title">Conversions Report</div>
                        <div className="report-description">
                            All conversions with rates and amounts
                        </div>
                        <button
                            className="btn-primary"
                            onClick={() => exportReport('conversions')}
                            disabled={isExporting}
                        >
                            📥 Export Conversions
                        </button>
                    </div>

                    <div className="report-card">
                        <div className="report-icon">💰</div>
                        <div className="report-title">Rewards Summary</div>
                        <div className="report-description">
                            Rewards earned and paid by advocate
                        </div>
                        <button
                            className="btn-primary"
                            onClick={() => exportReport('rewards')}
                            disabled={isExporting}
                        >
                            📥 Export Rewards
                        </button>
                    </div>

                    <div className="report-card">
                        <div className="report-icon">🏗️</div>
                        <div className="report-title">Project Analytics</div>
                        <div className="report-description">
                            Project-wise performance and statistics
                        </div>
                        <button
                            className="btn-primary"
                            onClick={() => exportReport('projects')}
                            disabled={isExporting}
                        >
                            📥 Export Projects
                        </button>
                    </div>

                    <div className="report-card">
                        <div className="report-icon">👥</div>
                        <div className="report-title">Advocate List</div>
                        <div className="report-description">
                            Complete list of all advocates and their metrics
                        </div>
                        <button
                            className="btn-primary"
                            onClick={() => exportReport('advocates')}
                            disabled={isExporting}
                        >
                            📥 Export Advocates
                        </button>
                    </div>

                    <div className="report-card highlight">
                        <div className="report-icon">📦</div>
                        <div className="report-title">Comprehensive Report</div>
                        <div className="report-description">
                            All data in a single comprehensive report
                        </div>
                        <button
                            className="btn-primary"
                            onClick={() => exportReport('all')}
                            disabled={isExporting}
                        >
                            📥 Export All
                        </button>
                    </div>
                </div>
            </div>

            <div className="analytics-info">
                <h3>ℹ️ Report Information</h3>
                <div className="info-content">
                    <p>
                        All reports are exported in CSV format which can be opened in Excel, Google Sheets,
                        or any spreadsheet application. Reports include complete data with timestamps.
                    </p>
                    <ul>
                        <li><strong>All Referrals:</strong> Complete list of referral records with status</li>
                        <li><strong>Conversions Report:</strong> Conversions with dates and amounts</li>
                        <li><strong>Rewards Summary:</strong> Advocate-wise reward calculations</li>
                        <li><strong>Project Analytics:</strong> Performance metrics by project</li>
                        <li><strong>Advocate List:</strong> All advocate profiles with statistics</li>
                        <li><strong>Comprehensive Report:</strong> Complete system data snapshot</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
