import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { brandAPI } from '../../api/client';

/**
 * BrandProjectPage
 * Display the target project details for the brand advocate
 * Shows project overview, pricing, timeline, certifications, and documents
 */
const BrandProjectPage = () => {
    const { user } = useAuthStore();
    const [project, setProject] = useState(null);
    const [certifications, setCertifications] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        loadProjectData();
    }, []);

    const loadProjectData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch project details
            const projectData = await brandAPI.getProject();
            setProject(projectData);

            // Fetch certifications
            const certData = await brandAPI.getProjectCertifications();
            setCertifications(certData || []);

            // Fetch documents
            const docData = await brandAPI.getProjectDocuments();
            setDocuments(docData || []);
        } catch (err) {
            console.error('Error loading project data:', err);
            setError(err.response?.data?.message || 'Failed to load project data');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-6xl mx-auto px-6 py-8">
                <div className="space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/3 animate-pulse"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-32 bg-gray-200 rounded animate-pulse"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-6xl mx-auto px-6 py-8">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-red-800 mb-2">Unable to Load Project</h3>
                    <p className="text-red-700 mb-4">{error}</p>
                    <button
                        onClick={loadProjectData}
                        className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold transition"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="max-w-6xl mx-auto px-6 py-8">
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                    <p className="text-gray-600">No project assigned</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-6 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">{project.name}</h1>
                <p className="text-gray-600 text-lg mb-4">{project.description}</p>

                <div className="flex flex-wrap gap-3">
                    <span className={`px-4 py-2 rounded-full font-semibold text-sm ${project.status === 'active' ? 'bg-green-100 text-green-800' :
                            project.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                        }`}>
                        {project.status?.toUpperCase()}
                    </span>
                    {project.location && (
                        <span className="px-4 py-2 rounded-full bg-purple-100 text-purple-800 font-semibold text-sm">
                            📍 {project.location}
                        </span>
                    )}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Price Range */}
                {(project.minPrice || project.maxPrice) && (
                    <div className="bg-white rounded-lg shadow p-6">
                        <p className="text-gray-600 text-sm font-medium mb-2">💰 Price Range</p>
                        <p className="text-2xl font-bold text-gray-900">
                            ₹{project.minPrice?.toLocaleString?.('en-IN', {
                                minimumFractionDigits: 0,
                            }) || 'N/A'} - ₹{project.maxPrice?.toLocaleString?.('en-IN', {
                                minimumFractionDigits: 0,
                            }) || 'N/A'}
                        </p>
                    </div>
                )}

                {/* Launch Date */}
                {project.launchDate && (
                    <div className="bg-white rounded-lg shadow p-6">
                        <p className="text-gray-600 text-sm font-medium mb-2">🚀 Launch Date</p>
                        <p className="text-2xl font-bold text-gray-900">
                            {new Date(project.launchDate).toLocaleDateString('en-IN', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                            })}
                        </p>
                    </div>
                )}

                {/* Completion Date */}
                {project.completionDate && (
                    <div className="bg-white rounded-lg shadow p-6">
                        <p className="text-gray-600 text-sm font-medium mb-2">✅ Completion Date</p>
                        <p className="text-2xl font-bold text-gray-900">
                            {new Date(project.completionDate).toLocaleDateString('en-IN', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                            })}
                        </p>
                    </div>
                )}

                {/* Certifications Count */}
                <div className="bg-white rounded-lg shadow p-6">
                    <p className="text-gray-600 text-sm font-medium mb-2">📋 Certifications</p>
                    <p className="text-2xl font-bold text-gray-900">{certifications.length}</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow">
                <div className="border-b flex overflow-x-auto">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`flex-1 px-6 py-4 font-semibold border-b-2 transition ${activeTab === 'overview'
                                ? 'text-blue-600 border-blue-600'
                                : 'text-gray-600 border-transparent hover:text-gray-900'
                            }`}
                    >
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('certifications')}
                        className={`flex-1 px-6 py-4 font-semibold border-b-2 transition ${activeTab === 'certifications'
                                ? 'text-blue-600 border-blue-600'
                                : 'text-gray-600 border-transparent hover:text-gray-900'
                            }`}
                    >
                        Certifications
                    </button>
                    <button
                        onClick={() => setActiveTab('documents')}
                        className={`flex-1 px-6 py-4 font-semibold border-b-2 transition ${activeTab === 'documents'
                                ? 'text-blue-600 border-blue-600'
                                : 'text-gray-600 border-transparent hover:text-gray-900'
                            }`}
                    >
                        Documents
                    </button>
                </div>

                <div className="p-6">
                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            {project.description && (
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                                    <p className="text-gray-700 whitespace-pre-wrap">{project.description}</p>
                                </div>
                            )}

                            {project.amenities && project.amenities.length > 0 && (
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Amenities</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {project.amenities.map((amenity, idx) => (
                                            <div key={idx} className="flex items-center gap-2 bg-blue-50 p-3 rounded-lg">
                                                <span>✓</span>
                                                <span className="text-gray-700">{amenity}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {project.specifications && Object.keys(project.specifications).length > 0 && (
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Specifications</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {Object.entries(project.specifications).map(([key, value]) => (
                                            <div key={key} className="border border-gray-200 rounded-lg p-4">
                                                <p className="text-sm font-medium text-gray-600 mb-1">
                                                    {key.replace(/_/g, ' ').toUpperCase()}
                                                </p>
                                                <p className="text-lg font-semibold text-gray-900">{value}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Certifications Tab */}
                    {activeTab === 'certifications' && (
                        <div>
                            {certifications.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {certifications.map((cert) => (
                                        <div key={cert._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition">
                                            <div className="flex items-start justify-between mb-3">
                                                <h4 className="text-lg font-semibold text-gray-900">{cert.name}</h4>
                                                <span className="text-2xl">{cert.icon || '📜'}</span>
                                            </div>
                                            {cert.issuer && (
                                                <p className="text-sm text-gray-600 mb-2">
                                                    <strong>Issuer:</strong> {cert.issuer}
                                                </p>
                                            )}
                                            {cert.issueDate && (
                                                <p className="text-sm text-gray-600 mb-2">
                                                    <strong>Issued:</strong> {new Date(cert.issueDate).toLocaleDateString('en-IN')}
                                                </p>
                                            )}
                                            {cert.expiryDate && (
                                                <p className="text-sm text-gray-600">
                                                    <strong>Expires:</strong> {new Date(cert.expiryDate).toLocaleDateString('en-IN')}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-600 text-center py-8">No certifications available</p>
                            )}
                        </div>
                    )}

                    {/* Documents Tab */}
                    {activeTab === 'documents' && (
                        <div>
                            {documents.length > 0 ? (
                                <div className="divide-y">
                                    {documents.map((doc) => (
                                        <div key={doc._id} className="py-4 px-4 hover:bg-gray-50 rounded-lg transition flex justify-between items-center">
                                            <div className="flex-1">
                                                <h4 className="text-lg font-semibold text-gray-900 mb-1">{doc.title}</h4>
                                                {doc.description && (
                                                    <p className="text-sm text-gray-600 mb-2">{doc.description}</p>
                                                )}
                                                {doc.uploadDate && (
                                                    <p className="text-xs text-gray-500">
                                                        Uploaded: {new Date(doc.uploadDate).toLocaleDateString('en-IN')}
                                                    </p>
                                                )}
                                            </div>
                                            {doc.url && (
                                                <a
                                                    href={doc.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    download
                                                    className="ml-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold transition whitespace-nowrap"
                                                >
                                                    📥 Download
                                                </a>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-600 text-center py-8">No documents available</p>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Key Contacts Section */}
            {project.contacts && project.contacts.length > 0 && (
                <div className="mt-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Contacts</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {project.contacts.map((contact, idx) => (
                            <div key={idx} className="bg-white rounded-lg shadow p-6">
                                <h4 className="text-lg font-semibold text-gray-900 mb-2">{contact.name}</h4>
                                {contact.title && (
                                    <p className="text-sm text-gray-600 mb-3">{contact.title}</p>
                                )}
                                {contact.phone && (
                                    <p className="text-sm text-gray-700 mb-2">
                                        <strong>📞</strong> {contact.phone}
                                    </p>
                                )}
                                {contact.email && (
                                    <p className="text-sm text-blue-600 hover:underline">
                                        <strong>✉️</strong> <a href={`mailto:${contact.email}`}>{contact.email}</a>
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default BrandProjectPage;
