import { useState, useEffect } from 'react';
import { projectAPI } from '../../../services/api';

export default function ProjectConfiguration() {
    const [projects, setProjects] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        setIsLoading(true);
        setError('');
        try {
            const response = await projectAPI.getAll();
            setProjects(response.data.projects || []);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to load projects');
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusIcon = (status) => {
        if (status === 'active' || status === 'ACTIVE') return '🏗️ Active/New';
        if (status === 'completed' || status === 'COMPLETED') return '✅ Completed';
        if (status === 'inactive' || status === 'INACTIVE') return '⏸️ Inactive';
        return status;
    };

    const formatCurrency = (value) => {
        return (value || 0).toLocaleString('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        });
    };

    return (
        <div className="project-configuration">
            <h2>⚙️ Project Configuration</h2>

            {error && <div className="alert alert-error">{error}</div>}

            <div className="table-container">
                {isLoading ? (
                    <div className="loading">Loading projects...</div>
                ) : projects.length > 0 ? (
                    <table className="projects-table">
                        <thead>
                            <tr>
                                <th>Project Name</th>
                                <th>Status</th>
                                <th>Accepts Referrals</th>
                                <th>Project Advocates</th>
                                <th>Brand Advocates</th>
                                <th>Total Budget</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {projects.map((project) => (
                                <tr key={project.id} className="table-row">
                                    <td className="cell-name">
                                        <strong>{project.name || 'N/A'}</strong>
                                    </td>
                                    <td className="cell-status">
                                        <span className="status-badge">
                                            {getStatusIcon(project.status)}
                                        </span>
                                    </td>
                                    <td className="cell-center">
                                        {project.accepts_referrals ? (
                                            <span className="badge-success">✅ Yes</span>
                                        ) : (
                                            <span className="badge-warning">❌ No</span>
                                        )}
                                    </td>
                                    <td className="cell-stat">
                                        {project.project_advocates_count || 0}
                                    </td>
                                    <td className="cell-stat">
                                        {project.brand_advocates_count || 0}
                                    </td>
                                    <td className="cell-currency">
                                        {formatCurrency(project.total_budget)}
                                    </td>
                                    <td>
                                        <button className="btn-small">
                                            {project.status === 'active' || project.status === 'ACTIVE'
                                                ? 'Configure'
                                                : 'View Only'
                                            }
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="no-data">No projects found</div>
                )}
            </div>

            {/* Project Statistics */}
            {!isLoading && projects.length > 0 && (
                <div className="project-stats">
                    <h3>📊 Projects Overview</h3>
                    <div className="stats-grid">
                        <div className="stat-box">
                            <div className="stat-label">Active Projects</div>
                            <div className="stat-value">
                                {projects.filter(p => p.status === 'active' || p.status === 'ACTIVE').length}
                            </div>
                        </div>
                        <div className="stat-box">
                            <div className="stat-label">Total Projects</div>
                            <div className="stat-value">{projects.length}</div>
                        </div>
                        <div className="stat-box">
                            <div className="stat-label">Accepting Referrals</div>
                            <div className="stat-value">
                                {projects.filter(p => p.accepts_referrals).length}
                            </div>
                        </div>
                        <div className="stat-box">
                            <div className="stat-label">Total Advocates</div>
                            <div className="stat-value">
                                {projects.reduce((sum, p) => sum + (p.project_advocates_count || 0) + (p.brand_advocates_count || 0), 0)}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
