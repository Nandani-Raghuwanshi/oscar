import { useState, useEffect } from 'react';
import { adminAPI } from '../../../services/api';

export default function AdvocateManagement() {
    const [advocates, setAdvocates] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [filters, setFilters] = useState({
        advocateType: 'all',
        search: '',
    });
    const [pagination, setPagination] = useState({
        skip: 0,
        limit: 20,
        total: 0,
    });
    const [selectedAdvocate, setSelectedAdvocate] = useState(null);
    const [showImportModal, setShowImportModal] = useState(false);
    const [importFile, setImportFile] = useState(null);
    const [importData, setImportData] = useState([]);
    const [isImporting, setIsImporting] = useState(false);

    useEffect(() => {
        loadAdvocates();
    }, [filters, pagination.skip]);

    const loadAdvocates = async () => {
        setIsLoading(true);
        setError('');
        try {
            const response = await adminAPI.listAdvocates(
                pagination.skip,
                pagination.limit,
                filters.advocateType === 'all' ? null : filters.advocateType,
                filters.search || null
            );
            setAdvocates(response.data.advocates || []);
            setPagination(prev => ({
                ...prev,
                total: response.data.total || 0,
            }));
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to load advocates');
            setAdvocates([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value,
        }));
        setPagination(prev => ({
            ...prev,
            skip: 0,
        }));
    };

    const handlePageChange = (direction) => {
        const newSkip = direction === 'next'
            ? pagination.skip + pagination.limit
            : Math.max(0, pagination.skip - pagination.limit);
        setPagination(prev => ({
            ...prev,
            skip: newSkip,
        }));
    };

    const exportAdvocates = async () => {
        try {
            const response = await adminAPI.listAdvocates(0, 10000, null, null);
            const advocates = response.data.advocates || [];

            const headers = ['Name', 'Advocate Type', 'Project', 'Plot No.', 'Referrals', 'Conversions', 'Status'];
            const rows = advocates.map(adv => [
                adv.name || '',
                adv.advocate_type || '',
                adv.project_name || '',
                adv.plot_number || '',
                adv.referral_count || 0,
                adv.conversion_count || 0,
                adv.status || 'active',
            ]);

            const csv = [
                headers.join(','),
                ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
            ].join('\n');

            const blob = new Blob([csv], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `advocates-${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
            window.URL.revokeObjectURL(url);

            setSuccess('Advocates exported successfully!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError('Failed to export advocates');
        }
    };

    const downloadCSVTemplate = () => {
        const headers = ['full_name', 'email', 'phone', 'advocate_type', 'project_name', 'plot_number'];
        // const templateData = [
        //     ['John Doe', 'john@example.com', '+1234567890', 'project_advocate', 'Oscar Sanctuary', 'A-101'],
        //     ['Jane Smith', 'jane@example.com', '+0987654321', 'brand_advocate', 'Oscar Fort', 'B-205'],
        //     ['Bob Johnson', 'bob@example.com', '+1122334455', 'project_advocate', 'Maple Heights', 'C-310']
        // ];

        const csvContent = [
            headers.join(','),
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'advocates_template.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const parseCSV = (text) => {
        const lines = text.split('\n').filter(line => line.trim());
        if (lines.length < 2) return [];

        const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));
        const data = lines.slice(1).map(line => {
            const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
            const obj = {};
            headers.forEach((header, index) => {
                obj[header] = values[index] || '';
            });
            return obj;
        }).filter(row => row.email && row.email.trim());

        return data;
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.name.endsWith('.csv') && !file.name.endsWith('.xlsx')) {
            setError('Please upload a CSV or Excel file');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const content = event.target.result;
                const parsed = parseCSV(content);

                if (parsed.length === 0) {
                    setError('No valid data found in file. Make sure it has a header row and at least one data row.');
                    return;
                }

                setImportData(parsed);
                setImportFile(file.name);
                setError('');
            } catch (err) {
                setError(`Failed to parse file: ${err.message}`);
            }
        };
        reader.readAsText(file);
    };

    const handleImportAdvocates = async () => {
        if (importData.length === 0) {
            setError('No data to import');
            return;
        }

        if (!window.confirm(`Are you sure you want to import ${importData.length} advocates?`)) {
            return;
        }

        setIsImporting(true);
        setError('');

        try {
            const response = await adminAPI.importAdvocates(importData);

            setSuccess(`✓ Successfully imported ${response.data.success} advocates! ${response.data.errors ? `(${response.data.errors.length} errors)` : ''}`);
            setImportData([]);
            setImportFile(null);
            document.getElementById('file-input') && (document.getElementById('file-input').value = '');
            setShowImportModal(false);

            // Reload advocates
            loadAdvocates();

            setTimeout(() => setSuccess(''), 5000);
        } catch (err) {
            const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message;
            setError(`Failed to import: ${errorMsg}`);
        } finally {
            setIsImporting(false);
        }
    };

    const getAdvocateTypeIcon = (type) => {
        if (type === 'PROJECT_ADVOCATE') return '🏘️';
        if (type === 'BRAND_ADVOCATE') return '⭐';
        return '👤';
    };

    const getAdvocateTypeLabel = (type) => {
        if (type === 'PROJECT_ADVOCATE') return 'Project';
        if (type === 'BRAND_ADVOCATE') return 'Brand';
        return type;
    };

    const totalPages = Math.ceil(pagination.total / pagination.limit);
    const currentPage = Math.floor(pagination.skip / pagination.limit) + 1;

    return (
        <div className="advocate-management">
            <h2>🔍 Advocate Management</h2>

            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            {/* Filters & Search */}
            <div className="filters-section">
                <div className="filter-group">
                    <label>Advocate Type:</label>
                    <select
                        value={filters.advocateType}
                        onChange={(e) => handleFilterChange('advocateType', e.target.value)}
                        className="filter-select"
                    >
                        <option value="all">All Advocate Types</option>
                        <option value="PROJECT_ADVOCATE">Project Advocates</option>
                        <option value="BRAND_ADVOCATE">Brand Advocates</option>
                    </select>
                </div>

                <div className="filter-group">
                    <label>Search by name, phone, project:</label>
                    <input
                        type="text"
                        placeholder="Search advocates..."
                        value={filters.search}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                        className="filter-input"
                    />
                </div>

                <button className="btn-primary" onClick={exportAdvocates}>
                    📥 Export Advocates
                </button>

                <button
                    className="btn-primary"
                    onClick={() => {
                        setShowImportModal(true);
                        setImportData([]);
                        setImportFile(null);
                    }}
                    style={{ backgroundColor: '#28a745' }}
                >
                    📤 Import Advocates
                </button>
            </div>

            {/* Advocates Table */}
            <div className="table-container">
                {isLoading ? (
                    <div className="loading">Loading advocates...</div>
                ) : advocates.length > 0 ? (
                    <>
                        <table className="advocates-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Advocate Type</th>
                                    <th>Source Project</th>
                                    <th>Plot No.</th>
                                    <th>Referrals</th>
                                    <th>Conversions</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {advocates.map((advocate) => (
                                    <tr key={advocate.id} className="table-row">
                                        <td className="cell-name">
                                            <strong>{advocate.name || 'N/A'}</strong>
                                        </td>
                                        <td className="cell-type">
                                            <span className="type-badge">
                                                {getAdvocateTypeIcon(advocate.advocate_type)} {getAdvocateTypeLabel(advocate.advocate_type)}
                                            </span>
                                        </td>
                                        <td>{advocate.project_name || '-'}</td>
                                        <td>{advocate.plot_number || '-'}</td>
                                        <td className="cell-stat">{advocate.referral_count || 0}</td>
                                        <td className="cell-stat">{advocate.conversion_count || 0}</td>
                                        <td>
                                            <button
                                                className="btn-small"
                                                onClick={() => setSelectedAdvocate(advocate)}
                                            >
                                                View Details
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Pagination */}
                        <div className="pagination">
                            <button
                                onClick={() => handlePageChange('prev')}
                                disabled={pagination.skip === 0}
                                className="btn-pagination"
                            >
                                ← Previous
                            </button>
                            <span className="page-info">
                                Page {currentPage} of {totalPages} (Total: {pagination.total})
                            </span>
                            <button
                                onClick={() => handlePageChange('next')}
                                disabled={pagination.skip + pagination.limit >= pagination.total}
                                className="btn-pagination"
                            >
                                Next →
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="no-data">No advocates found</div>
                )}
            </div>

            {/* Advocate Details Modal */}
            {selectedAdvocate && (
                <div className="modal-overlay" onClick={() => setSelectedAdvocate(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{selectedAdvocate.name}</h3>
                            <button className="btn-close" onClick={() => setSelectedAdvocate(null)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <div className="detail-grid">
                                <div className="detail-item">
                                    <label>Advocate Type:</label>
                                    <span>{getAdvocateTypeIcon(selectedAdvocate.advocate_type)} {getAdvocateTypeLabel(selectedAdvocate.advocate_type)}</span>
                                </div>
                                <div className="detail-item">
                                    <label>Project:</label>
                                    <span>{selectedAdvocate.project_name || '-'}</span>
                                </div>
                                <div className="detail-item">
                                    <label>Plot Number:</label>
                                    <span>{selectedAdvocate.plot_number || '-'}</span>
                                </div>
                                <div className="detail-item">
                                    <label>Phone:</label>
                                    <span>{selectedAdvocate.phone || '-'}</span>
                                </div>
                                <div className="detail-item">
                                    <label>Referrals:</label>
                                    <span className="stat-value">{selectedAdvocate.referral_count || 0}</span>
                                </div>
                                <div className="detail-item">
                                    <label>Conversions:</label>
                                    <span className="stat-value">{selectedAdvocate.conversion_count || 0}</span>
                                </div>
                                <div className="detail-item">
                                    <label>Conversion Rate:</label>
                                    <span className="stat-value">
                                        {selectedAdvocate.referral_count > 0
                                            ? ((selectedAdvocate.conversion_count / selectedAdvocate.referral_count) * 100).toFixed(1)
                                            : 0}%
                                    </span>
                                </div>
                                <div className="detail-item">
                                    <label>Total Rewards:</label>
                                    <span className="stat-value">₹{(selectedAdvocate.total_rewards || 0).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Import Advocates Modal */}
            {showImportModal && (
                <div className="modal-overlay" onClick={() => { setShowImportModal(false); setImportData([]); setImportFile(null); }}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div className="modal-header">
                            <h3>📤 Import Advocates</h3>
                            <button className="btn-close" onClick={() => { setShowImportModal(false); setImportData([]); setImportFile(null); }}>✕</button>
                        </div>
                        <div className="modal-body">
                            {error && <div className="alert alert-error" style={{ marginBottom: '15px' }}>{error}</div>}

                            {/* Step 1: Download Template */}
                            <div style={{ marginBottom: '25px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
                                <h4 style={{ marginTop: 0 }}>Step 1: Download Template</h4>
                                <p style={{ color: '#666', fontSize: '13px', marginBottom: '12px' }}>Download the CSV template with required columns:</p>
                                <button
                                    onClick={downloadCSVTemplate}
                                    style={{
                                        padding: '8px 16px',
                                        backgroundColor: '#0066cc',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontWeight: 'bold',
                                        fontSize: '13px'
                                    }}
                                >
                                    📥 Download Template
                                </button>
                                <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#e7f3ff', borderRadius: '4px', fontSize: '12px' }}>
                                    <strong>Columns:</strong> full_name, email, phone, advocate_type, project_name, plot_number
                                </div>
                            </div>

                            {/* Step 2: Upload File */}
                            <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
                                <h4 style={{ marginTop: 0 }}>Step 2: Upload CSV File</h4>
                                <div style={{
                                    border: '2px dashed #007bff',
                                    borderRadius: '6px',
                                    padding: '20px',
                                    textAlign: 'center',
                                    backgroundColor: '#f0f7ff'
                                }}>
                                    <input
                                        id="file-input"
                                        type="file"
                                        accept=".csv,.xlsx"
                                        onChange={handleFileUpload}
                                        style={{ display: 'none' }}
                                    />
                                    <button
                                        onClick={() => document.getElementById('file-input').click()}
                                        style={{
                                            padding: '8px 16px',
                                            backgroundColor: '#007bff',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontWeight: 'bold',
                                            fontSize: '13px'
                                        }}
                                    >
                                        📁 Choose File
                                    </button>
                                    {importFile && (
                                        <div style={{ marginTop: '12px', padding: '8px', backgroundColor: '#d4edda', color: '#155724', borderRadius: '4px', fontSize: '12px' }}>
                                            ✓ {importFile} ({importData.length} records)
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Step 3: Preview */}
                            {importData.length > 0 && (
                                <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
                                    <h4 style={{ marginTop: 0 }}>Step 3: Preview ({importData.length} records)</h4>
                                    <div style={{ overflowX: 'auto', maxHeight: '250px', overflowY: 'auto', border: '1px solid #ddd', borderRadius: '4px' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                                            <thead style={{ backgroundColor: '#f5f5f5', position: 'sticky', top: 0 }}>
                                                <tr>
                                                    <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Name</th>
                                                    <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Email</th>
                                                    <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Type</th>
                                                    <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Project</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {importData.slice(0, 8).map((row, idx) => (
                                                    <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                                                        <td style={{ padding: '8px' }}>{row.full_name}</td>
                                                        <td style={{ padding: '8px', fontSize: '11px' }}>{row.email}</td>
                                                        <td style={{ padding: '8px' }}>
                                                            <span style={{
                                                                display: 'inline-block',
                                                                padding: '2px 6px',
                                                                backgroundColor: row.advocate_type === 'project_advocate' ? '#007bff' : '#ff9800',
                                                                color: 'white',
                                                                borderRadius: '3px',
                                                                fontSize: '11px'
                                                            }}>
                                                                {row.advocate_type?.replace(/_/g, ' ')}
                                                            </span>
                                                        </td>
                                                        <td style={{ padding: '8px' }}>{row.project_name}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    {importData.length > 8 && (
                                        <p style={{ color: '#666', fontSize: '11px', marginTop: '8px', marginBottom: 0 }}>
                                            ... and {importData.length - 8} more records
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Action Buttons */}
                            {importData.length > 0 && (
                                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                    <button
                                        onClick={() => {
                                            setImportData([]);
                                            setImportFile(null);
                                            document.getElementById('file-input').value = '';
                                        }}
                                        style={{
                                            padding: '8px 16px',
                                            backgroundColor: '#6c757d',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontSize: '13px',
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        Clear
                                    </button>
                                    <button
                                        onClick={handleImportAdvocates}
                                        disabled={isImporting}
                                        style={{
                                            padding: '8px 16px',
                                            backgroundColor: isImporting ? '#999' : '#28a745',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: isImporting ? 'not-allowed' : 'pointer',
                                            fontSize: '13px',
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        {isImporting ? '⏳ Importing...' : '✓ Import'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
