import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReferral } from '../../hooks/useReferral';
import { userAPI, projectAPI } from '../../services/api';
import '../styles/referral-link-qr.css';

export default function ReferralLinkQR() {
    const navigate = useNavigate();
    const userId = localStorage.getItem('userId') || localStorage.getItem('advocateId');  // Support both

    // Loading states
    const [initialLoading, setInitialLoading] = useState(true);
    const [advocateData, setAdvocateData] = useState(null);
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);

    // Form states
    const [channel, setChannel] = useState('direct');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [generatedLink, setGeneratedLink] = useState(null);
    const [qrCode, setQrCode] = useState(null);
    const { createLink } = useReferral();

    // Load advocate details and project info on mount
    useEffect(() => {
        if (!userId) {
            setError('User ID not found. Please log in.');
            setInitialLoading(false);
            return;
        }

        const loadData = async () => {
            try {
                setInitialLoading(true);
                setError('');

                // Get user profile (includes advocate information from schema refactoring)
                const userResponse = await userAPI.getProfile();
                const user = userResponse.data.user;
                console.log('Loaded user profile:', user);
                setAdvocateData(user);

                let projectsList = [];

                // Case 1: User is registered as PROJECT_ADVOCATE
                if (user.advocate_type === 'PROJECT_ADVOCATE') {
                    const projectsResponse = await projectAPI.getByAdvocate(userId);
                    projectsList = projectsResponse.data?.projects || [];
                    console.log('Loaded projects for PROJECT_ADVOCATE:', projectsList);
                }
                // Case 2: User owns a project (has project_name field)
                else if (user.project_name) {
                    try {
                        // Search for project by name
                        const projectsResponse = await projectAPI.search({ name: user.project_name });
                        projectsList = projectsResponse.data?.projects || [];
                        console.log('Loaded projects for project owner:', projectsList);

                        // Auto-register as PROJECT_ADVOCATE if they own a project
                        if (projectsList.length > 0) {
                            // Set advocate type to project advocate with the first project as source
                            setAdvocateData({
                                ...user,
                                advocate_type: 'PROJECT_ADVOCATE',
                                source_project_id: projectsList[0].id
                            });
                        }
                    } catch (err) {
                        console.log('Could not find projects by name, you can still create referral as brand advocate');
                    }
                }

                if (projectsList.length === 0) {
                    setError('Only project advocates can create referral links');
                }

                setProjects(projectsList);

                // Auto-select if only one project
                if (projectsList.length === 1) {
                    setSelectedProject(projectsList[0]);
                }
            } catch (err) {
                console.error('Failed to load user profile:', err);
                setError(err.response?.data?.error || 'Failed to load user information');
            } finally {
                setInitialLoading(false);
            }
        };

        loadData();
    }, [userId]);

    const handleGenerateLink = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            if (!selectedProject) {
                throw new Error('Please select a project first');
            }
            if (!userId) {
                throw new Error('User information not found. Please log in.');
            }

            console.log('Creating link for user:', userId, 'type:', advocateData?.advocate_type, 'project:', selectedProject.id);
            const result = await createLink(userId, selectedProject.id, channel);

            if (!result) {
                throw new Error('No response from server');
            }

            setGeneratedLink(result.link || result.referral_uuid);
            setQrCode(result.qr_code_url);
        } catch (err) {
            console.error('Error creating referral link:', err);
            const errorMsg = err.response?.data?.error || err.message || 'Failed to create referral link';
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(generatedLink);
        } catch (err) {
            console.error(err);
        }
    };

    const downloadQR = () => {
        const link = document.createElement('a');
        link.href = qrCode;
        link.download = `qr-code-${selectedProject?.name || 'referral'}.png`;
        link.click();
    };

    if (initialLoading) {
        return (
            <main className="referral-page">
                <div className="loading-spinner">
                    <p>Loading advocate information...</p>
                </div>
            </main>
        );
    }

    if (error && !advocateData) {
        return (
            <main className="referral-page">
                <div className="page-header">
                    <h1>Referral Link & QR Code</h1>
                </div>
                <div className="container">
                    <div className="error-message" style={{
                        backgroundColor: '#fee',
                        border: '1px solid #fcc',
                        borderRadius: '4px',
                        padding: '20px',
                        color: '#c33',
                        marginBottom: '20px',
                        textAlign: 'center'
                    }}>
                        <p style={{ marginBottom: '15px' }}>{error}</p>
                        <a href="/dashboard" className="btn btn-primary">
                            Return to Dashboard
                        </a>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="referral-page">
            <div className="page-header">
                <h1>Referral Link & QR Code</h1>
                <p>Create a unique referral link for your project</p>
            </div>

            <div className="container">
                {!generatedLink ? (
                    <section className="form-card" style={{
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        padding: '30px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}>
                        <h2 style={{ marginTop: 0, marginBottom: '20px' }}>Generate Referral Link</h2>

                        {/* Advocate Info */}
                        <div style={{
                            backgroundColor: '#f0f7ff',
                            border: '1px solid #b3d9ff',
                            borderRadius: '6px',
                            padding: '15px',
                            marginBottom: '25px'
                        }}>
                            <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#666' }}>
                                Advocate Type
                            </p>
                            <h3 style={{ margin: '0 0 10px 0', color: '#007bff', fontSize: '16px', textTransform: 'capitalize' }}>
                                {advocateData?.advocate_type?.replace('_', ' ') || 'Loading...'}
                            </h3>
                        </div>

                        {/* Project Selection (if multiple projects) */}
                        {projects.length > 1 && (
                            <div style={{ marginBottom: '25px' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '12px',
                                    fontWeight: '600',
                                    color: '#333',
                                    fontSize: '15px'
                                }}>
                                    Select Project
                                </label>
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                                    gap: '12px',
                                    marginBottom: '15px'
                                }}>
                                    {projects.map(project => (
                                        <div
                                            key={project.id}
                                            onClick={() => setSelectedProject(project)}
                                            style={{
                                                border: selectedProject?.id === project.id ? '2px solid #007bff' : '1px solid #ddd',
                                                backgroundColor: selectedProject?.id === project.id ? '#f0f7ff' : 'white',
                                                borderRadius: '6px',
                                                padding: '12px',
                                                cursor: 'pointer',
                                                transition: 'all 0.3s ease'
                                            }}
                                        >
                                            <h4 style={{ margin: '0 0 5px 0', fontSize: '14px', fontWeight: '600' }}>
                                                {project.name}
                                            </h4>
                                            <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>
                                                📍 {project.location}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Selected Project Info */}
                        {selectedProject && (
                            <div style={{
                                backgroundColor: '#f5f5f5',
                                border: '1px solid #ddd',
                                borderRadius: '6px',
                                padding: '15px',
                                marginBottom: '20px'
                            }}>
                                <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#666', fontWeight: '600' }}>
                                    SELECTED PROJECT
                                </p>
                                <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#333' }}>
                                    {selectedProject.name}
                                </h3>
                                <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>
                                    📍 {selectedProject.location}
                                </p>
                                {selectedProject.description && (
                                    <p style={{ margin: '10px 0 0 0', fontSize: '13px', color: '#555' }}>
                                        {selectedProject.description}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Error Message */}
                        {error && (
                            <div style={{
                                backgroundColor: '#fee',
                                border: '1px solid #fcc',
                                borderRadius: '4px',
                                padding: '12px 15px',
                                color: '#c33',
                                marginBottom: '20px',
                                fontSize: '14px'
                            }}>
                                {error}
                            </div>
                        )}

                        {/* Channel Selection Form */}
                        <form onSubmit={handleGenerateLink}>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '8px',
                                    fontWeight: '600',
                                    color: '#333'
                                }}>
                                    Channel
                                </label>
                                <p style={{
                                    margin: '0 0 12px 0',
                                    fontSize: '13px',
                                    color: '#666'
                                }}>
                                    Select how you plan to share this referral link
                                </p>
                                <select
                                    value={channel}
                                    onChange={(e) => setChannel(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        fontSize: '14px',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        fontFamily: 'inherit'
                                    }}
                                >
                                    <option value="direct">Direct Share</option>
                                    <option value="whatsapp">WhatsApp</option>
                                    <option value="email">Email</option>
                                    <option value="qr">QR Code</option>
                                </select>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !selectedProject}
                                style={{
                                    width: '100%',
                                    padding: '12px 20px',
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    backgroundColor: loading || !selectedProject ? '#ccc' : '#007bff',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: loading || !selectedProject ? 'not-allowed' : 'pointer',
                                    transition: 'background-color 0.3s'
                                }}
                                onMouseEnter={(e) => {
                                    if (!loading && selectedProject) {
                                        e.currentTarget.style.backgroundColor = '#0056b3';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!loading && selectedProject) {
                                        e.currentTarget.style.backgroundColor = '#007bff';
                                    }
                                }}
                            >
                                {loading ? 'Generating...' : 'Generate Link'}
                            </button>
                        </form>
                    </section>
                ) : (
                    <section style={{
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        padding: '30px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}>
                        <h2 style={{ marginTop: 0, marginBottom: '20px' }}>Your Referral Link</h2>

                        {/* Generated Link */}
                        <div style={{
                            backgroundColor: '#f5f5f5',
                            border: '1px solid #ddd',
                            borderRadius: '6px',
                            padding: '15px',
                            marginBottom: '20px'
                        }}>
                            <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#666', fontWeight: '600' }}>
                                REFERRAL LINK
                            </p>
                            <div style={{
                                display: 'flex',
                                gap: '10px',
                                alignItems: 'center'
                            }}>
                                <input
                                    type="text"
                                    value={generatedLink}
                                    readOnly
                                    style={{
                                        flex: 1,
                                        padding: '10px 12px',
                                        fontSize: '14px',
                                        border: '1px solid #ccc',
                                        borderRadius: '4px',
                                        backgroundColor: 'white',
                                        fontFamily: 'monospace'
                                    }}
                                />
                                <button
                                    onClick={copyToClipboard}
                                    style={{
                                        padding: '10px 16px',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        backgroundColor: '#28a745',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        transition: 'background-color 0.3s',
                                        whiteSpace: 'nowrap'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#218838'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#28a745'}
                                    title="Copy link to clipboard"
                                >
                                    Copy
                                </button>
                            </div>
                        </div>

                        {/* QR Code */}
                        {qrCode && (
                            <div style={{
                                backgroundColor: '#f5f5f5',
                                border: '1px solid #ddd',
                                borderRadius: '6px',
                                padding: '20px',
                                marginBottom: '20px',
                                textAlign: 'center'
                            }}>
                                <p style={{ margin: '0 0 15px 0', fontSize: '12px', color: '#666', fontWeight: '600' }}>
                                    QR CODE
                                </p>
                                <img
                                    src={qrCode}
                                    alt="Referral QR Code"
                                    style={{
                                        width: '250px',
                                        height: '250px',
                                        border: '2px solid white',
                                        borderRadius: '4px',
                                        marginBottom: '15px'
                                    }}
                                />
                                <button
                                    onClick={downloadQR}
                                    style={{
                                        padding: '10px 20px',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        backgroundColor: '#007bff',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        transition: 'background-color 0.3s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0056b3'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#007bff'}
                                >
                                    Download QR Code
                                </button>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div style={{
                            display: 'flex',
                            gap: '10px',
                            justifyContent: 'center',
                            marginTop: '30px',
                            paddingTop: '20px',
                            borderTop: '1px solid #eee',
                            flexWrap: 'wrap'
                        }}>
                            <button
                                onClick={() => {
                                    setGeneratedLink(null);
                                    setQrCode(null);
                                    setError('');
                                }}
                                style={{
                                    padding: '10px 20px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    backgroundColor: '#e9ecef',
                                    color: '#333',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                            >
                                Create Another Link
                            </button>
                            <button
                                onClick={() => {
                                    // Extract UUID from link (format: http://localhost:3000/ref/{uuid})
                                    const uuid = generatedLink.split('/ref/')[1];
                                    navigate(`/analytics/${uuid}`);
                                }}
                                style={{
                                    padding: '10px 20px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    backgroundColor: '#9b59b6',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                            >
                                View Analytics
                            </button>
                            <a href="/dashboard/my-referrals" style={{
                                padding: '10px 20px',
                                fontSize: '14px',
                                fontWeight: '600',
                                backgroundColor: '#007bff',
                                color: 'white',
                                textDecoration: 'none',
                                borderRadius: '4px',
                                display: 'inline-block'
                            }}>
                                View My Referrals
                            </a>
                        </div>
                    </section>
                )}
            </div>
        </main>
    );
}
