import { useState, useEffect } from 'react';
import { adminAPI } from '../../../services/api';

export default function ReferralPipeline() {
    const [pipelineData, setPipelineData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        loadPipelineData();
    }, []);

    const loadPipelineData = async () => {
        setIsLoading(true);
        setError('');
        try {
            const response = await adminAPI.getAnalytics();
            setPipelineData(response.data);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to load pipeline data');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="referral-pipeline">
            <h2>🔄 Referral Pipeline by Advocate Type</h2>

            {error && <div className="alert alert-error">{error}</div>}

            {isLoading ? (
                <div className="loading">Loading pipeline data...</div>
            ) : pipelineData ? (
                <div className="pipeline-container">
                    {/* Project Advocates Pipeline */}
                    <div className="pipeline-section">
                        <h3>🏘️ Project Advocates (Oscar Sanctuary → Oscar Sanctuary)</h3>

                        <div className="pipeline-stages">
                            <div className="pipeline-stage">
                                <div className="stage-icon">📋</div>
                                <div className="stage-content">
                                    <div className="stage-label">New Leads</div>
                                    <div className="stage-value">
                                        {pipelineData.project_advocates_new_leads || 0}
                                    </div>
                                    <div className="stage-description">From Project Advocates</div>
                                </div>
                            </div>

                            <div className="pipeline-arrow">→</div>

                            <div className="pipeline-stage">
                                <div className="stage-icon">🔔</div>
                                <div className="stage-content">
                                    <div className="stage-label">In Progress</div>
                                    <div className="stage-value">
                                        {pipelineData.project_advocates_in_progress || 0}
                                    </div>
                                    <div className="stage-description">Contacted & site visits</div>
                                </div>
                            </div>

                            <div className="pipeline-arrow">→</div>

                            <div className="pipeline-stage success">
                                <div className="stage-icon">✅</div>
                                <div className="stage-content">
                                    <div className="stage-label">Converted</div>
                                    <div className="stage-value">
                                        {pipelineData.project_advocates_converted || 0}
                                    </div>
                                    <div className="stage-description">
                                        {pipelineData.project_advocates_conversion || 0}% conversion rate
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Brand Advocates Pipeline */}
                    <div className="pipeline-section">
                        <h3>⭐ Brand Advocates (Oscar Fort → Oscar Sanctuary)</h3>

                        <div className="pipeline-stages">
                            <div className="pipeline-stage">
                                <div className="stage-icon">📋</div>
                                <div className="stage-content">
                                    <div className="stage-label">New Leads</div>
                                    <div className="stage-value">
                                        {pipelineData.brand_advocates_new_leads || 0}
                                    </div>
                                    <div className="stage-description">From Brand Advocates</div>
                                </div>
                            </div>

                            <div className="pipeline-arrow">→</div>

                            <div className="pipeline-stage">
                                <div className="stage-icon">🔔</div>
                                <div className="stage-content">
                                    <div className="stage-label">In Progress</div>
                                    <div className="stage-value">
                                        {pipelineData.brand_advocates_in_progress || 0}
                                    </div>
                                    <div className="stage-description">Contacted & site visits</div>
                                </div>
                            </div>

                            <div className="pipeline-arrow">→</div>

                            <div className="pipeline-stage success">
                                <div className="stage-icon">✅</div>
                                <div className="stage-content">
                                    <div className="stage-label">Converted</div>
                                    <div className="stage-value">
                                        {pipelineData.brand_advocates_converted || 0}
                                    </div>
                                    <div className="stage-description">
                                        {pipelineData.brand_advocates_conversion || 0}% conversion rate
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Summary Stats */}
                    <div className="pipeline-summary">
                        <h3>📊 Pipeline Summary</h3>
                        <div className="summary-grid">
                            <div className="summary-card">
                                <div className="summary-label">Total New Leads</div>
                                <div className="summary-value">
                                    {((pipelineData.project_advocates_new_leads || 0) + (pipelineData.brand_advocates_new_leads || 0))}
                                </div>
                            </div>
                            <div className="summary-card">
                                <div className="summary-label">Total In Progress</div>
                                <div className="summary-value">
                                    {((pipelineData.project_advocates_in_progress || 0) + (pipelineData.brand_advocates_in_progress || 0))}
                                </div>
                            </div>
                            <div className="summary-card success">
                                <div className="summary-label">Total Converted</div>
                                <div className="summary-value">
                                    {((pipelineData.project_advocates_converted || 0) + (pipelineData.brand_advocates_converted || 0))}
                                </div>
                            </div>
                            <div className="summary-card">
                                <div className="summary-label">Overall Conversion</div>
                                <div className="summary-value">
                                    {pipelineData.conversion_rate || 0}%
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="no-data">No pipeline data available</div>
            )}
        </div>
    );
}
