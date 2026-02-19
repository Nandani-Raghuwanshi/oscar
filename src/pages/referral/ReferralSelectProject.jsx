import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { projectAPI } from '../../services/api';

/**
 * Project Selection Component
 * Allows advocates to select a project for creating referral links
 */
export default function ReferralSelectProject() {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const userId = localStorage.getItem('userId') || localStorage.getItem('advocateId');  // Support both

    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!userId) {
            navigate('/referral/select-type');
            return;
        }

        const loadProjects = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await projectAPI.getByAdvocate(userId);

                if (response.data?.projects) {
                    setProjects(response.data.projects);

                    // Auto-select if only one project
                    if (response.data.projects.length === 1) {
                        setSelectedProject(response.data.projects[0]);
                    }
                } else {
                    setError('No projects found');
                }
            } catch (err) {
                console.error('Failed to load projects:', err);
                setError(err.response?.data?.error || 'Failed to load projects');
            } finally {
                setLoading(false);
            }
        };

        loadProjects();
    }, [userId, navigate]);

    const handleProceed = async () => {
        if (!selectedProject) {
            setError('Please select a project');
            return;
        }

        // Store selected project information
        localStorage.setItem('selectedProjectId', selectedProject.id);
        localStorage.setItem('selectedProjectName', selectedProject.name);

        // Navigate to link creation page
        navigate('/referral/link-qr');
    };

    if (loading) {
        return (
            <main className="referral-page">
                <div className="loading-spinner">
                    <p>Loading available projects...</p>
                </div>
            </main>
        );
    }

    return (
        <main className="referral-page">
            <div className="page-header">
                <h1>Select Project</h1>
                <p>Choose a project to create your referral link</p>
            </div>

            {error && (
                <div className="container">
                    <div className="error-message" style={{
                        backgroundColor: '#fee',
                        border: '1px solid #fcc',
                        borderRadius: '4px',
                        padding: '15px',
                        color: '#c33',
                        marginBottom: '20px'
                    }}>
                        {error}
                    </div>
                </div>
            )}

            <div className="container">
                {projects.length === 0 ? (
                    <div className="content-box" style={{ textAlign: 'center' }}>
                        <h2>No Projects Available</h2>
                        <p>There are no projects available for your referral at the moment.</p>
                        <a href="/dashboard" className="btn btn-primary" style={{ marginTop: '20px' }}>
                            Return to Dashboard
                        </a>
                    </div>
                ) : (
                    <>
                        <div className="projects-grid" style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                            gap: '20px',
                            marginBottom: '30px'
                        }}>
                            {projects.map(project => (
                                <div
                                    key={project.id}
                                    className={`project-card ${selectedProject?.id === project.id ? 'selected' : ''}`}
                                    onClick={() => setSelectedProject(project)}
                                    style={{
                                        border: selectedProject?.id === project.id ? '2px solid #007bff' : '1px solid #ddd',
                                        backgroundColor: selectedProject?.id === project.id ? '#f0f7ff' : 'white',
                                        borderRadius: '8px',
                                        padding: '20px',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                        boxShadow: selectedProject?.id === project.id ? '0 4px 12px rgba(0,123,255,0.15)' : '0 2px 4px rgba(0,0,0,0.1)'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (selectedProject?.id !== project.id) {
                                            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (selectedProject?.id !== project.id) {
                                            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                                            e.currentTarget.style.transform = 'translateY(0)';
                                        }
                                    }}
                                >
                                    <div style={{ marginBottom: '15px' }}>
                                        <h3 style={{
                                            margin: '0 0 8px 0',
                                            fontSize: '18px',
                                            fontWeight: '600',
                                            color: '#333'
                                        }}>
                                            {project.name}
                                        </h3>
                                        <p style={{
                                            margin: '0 0 5px 0',
                                            color: '#666',
                                            fontSize: '14px'
                                        }}>
                                            📍 {project.location}
                                        </p>
                                    </div>

                                    {project.description && (
                                        <p style={{
                                            marginBottom: '15px',
                                            color: '#555',
                                            fontSize: '13px',
                                            lineHeight: '1.5'
                                        }}>
                                            {project.description}
                                        </p>
                                    )}

                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: '1fr 1fr',
                                        gap: '10px',
                                        marginBottom: '15px',
                                        fontSize: '13px'
                                    }}>
                                        <div style={{ backgroundColor: '#f5f5f5', padding: '10px', borderRadius: '4px' }}>
                                            <p style={{ margin: '0 0 5px 0', color: '#666', fontSize: '11px' }}>UNITS</p>
                                            <p style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>
                                                {project.units || 'N/A'}
                                            </p>
                                        </div>
                                        <div style={{ backgroundColor: '#f5f5f5', padding: '10px', borderRadius: '4px' }}>
                                            <p style={{ margin: '0 0 5px 0', color: '#666', fontSize: '11px' }}>YOUR REFERRALS</p>
                                            <p style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>
                                                {project.advocate_referrals || 0}
                                            </p>
                                        </div>
                                    </div>

                                    {project.status === 'active' && (
                                        <span style={{
                                            display: 'inline-block',
                                            backgroundColor: '#d4edda',
                                            color: '#155724',
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            fontSize: '12px',
                                            fontWeight: '500'
                                        }}>
                                            ✓ Active
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div style={{
                            display: 'flex',
                            gap: '10px',
                            justifyContent: 'center',
                            marginTop: '30px',
                            paddingTop: '20px',
                            borderTop: '1px solid #eee'
                        }}>
                            <a href="/dashboard" className="btn btn-secondary">
                                Back to Dashboard
                            </a>
                            <button
                                className="btn btn-primary"
                                onClick={handleProceed}
                                disabled={!selectedProject}
                                style={{
                                    opacity: selectedProject ? 1 : 0.5,
                                    cursor: selectedProject ? 'pointer' : 'not-allowed'
                                }}
                            >
                                Proceed to Create Link →
                            </button>
                        </div>
                    </>
                )}
            </div>
        </main>
    );
}
