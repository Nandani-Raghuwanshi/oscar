import React, { useState, useEffect } from 'react';
import { advocateAPI } from '../../api/client';

export const AdvocateDocumentationPage = () => {
    const [project, setProject] = useState(null);
    const [documents, setDocuments] = useState(null);
    const [certifications, setCertifications] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('overview'); // overview, documents, certifications

    useEffect(() => {
        fetchProjectData();
    }, []);

    const fetchProjectData = async () => {
        try {
            setLoading(true);
            const [projectRes, docsRes, certsRes] = await Promise.all([
                advocateAPI.getProject(),
                advocateAPI.getProjectDocuments(),
                advocateAPI.getProjectCertifications()
            ]);

            setProject(projectRes.data);
            setDocuments(docsRes.data);
            setCertifications(Array.isArray(certsRes.data) ? certsRes.data : []);
            setError(null);
        } catch (err) {
            setError(err.message || 'Failed to load project documentation');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="py-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Project Documentation</h2>
                <div className="text-center text-gray-600">Loading documentation...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="py-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Project Documentation</h2>
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="py-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Project Documentation</h2>

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow mb-6">
                <div className="flex border-b">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`flex-1 px-6 py-3 font-medium transition ${activeTab === 'overview'
                                ? 'text-amber-600 border-b-2 border-amber-600'
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        Project Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('documents')}
                        className={`flex-1 px-6 py-3 font-medium transition ${activeTab === 'documents'
                                ? 'text-amber-600 border-b-2 border-amber-600'
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        Documents
                    </button>
                    <button
                        onClick={() => setActiveTab('certifications')}
                        className={`flex-1 px-6 py-3 font-medium transition ${activeTab === 'certifications'
                                ? 'text-amber-600 border-b-2 border-amber-600'
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        Certifications
                    </button>
                </div>

                <div className="p-6">
                    {/* Overview Tab */}
                    {activeTab === 'overview' && project && (
                        <div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">{project.name}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="text-sm font-medium text-gray-600 mb-2">Description</h4>
                                    <p className="text-gray-800 leading-relaxed">
                                        {project.description || 'No description available'}
                                    </p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-600 mb-2">Project Status</h4>
                                    <div className="flex items-center gap-2">
                                        <span className={`inline-block w-3 h-3 rounded-full ${project.status === 'active' ? 'bg-green-500' :
                                                project.status === 'coming_soon' ? 'bg-yellow-500' :
                                                    'bg-gray-500'
                                            }`}></span>
                                        <span className="text-gray-700 capitalize">
                                            {project.status?.replace('_', ' ')}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {project.location && (
                                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                                    <h4 className="text-sm font-medium text-gray-600 mb-2">Location</h4>
                                    <p className="text-gray-800">{project.location}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Documents Tab */}
                    {activeTab === 'documents' && documents && (
                        <div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">Project Documents</h3>
                            {documents.documents && documents.documents.length > 0 ? (
                                <div className="space-y-3">
                                    {documents.documents.map((doc, index) => (
                                        <div key={index} className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                                            <svg className="w-6 h-6 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M4 3a2 2 0 012-2h8a1 1 0 010 2H6v14h12V7a1 1 0 112 0v10a2 2 0 01-2 2H6a2 2 0 01-2-2V3z" />
                                            </svg>
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-900">{doc.name || `Document ${index + 1}`}</p>
                                                {doc.description && (
                                                    <p className="text-sm text-gray-600">{doc.description}</p>
                                                )}
                                            </div>
                                            {doc.url && (
                                                <a
                                                    href={doc.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-amber-600 hover:text-amber-700 font-medium text-sm"
                                                >
                                                    View
                                                </a>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-600 text-center py-8">No documents available yet</p>
                            )}
                        </div>
                    )}

                    {/* Certifications Tab */}
                    {activeTab === 'certifications' && (
                        <div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">Project Certifications</h3>
                            {certifications && certifications.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {certifications.map((cert, index) => (
                                        <div key={index} className="p-4 border border-gray-200 rounded-lg">
                                            <div className="flex items-start gap-3">
                                                <svg className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                                                </svg>
                                                <div>
                                                    <p className="font-medium text-gray-900">{cert.name || `Certification ${index + 1}`}</p>
                                                    {cert.issuer && (
                                                        <p className="text-sm text-gray-600">Issued by: {cert.issuer}</p>
                                                    )}
                                                    {cert.validUntil && (
                                                        <p className="text-sm text-gray-600">Valid until: {new Date(cert.validUntil).toLocaleDateString()}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-600 text-center py-8">No certifications available yet</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
