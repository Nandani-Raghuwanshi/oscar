import { useState, useContext, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { AuthContext } from '../../context/AuthContext';

export default function AdminDashboard() {
    const { user } = useContext(AuthContext);
    const [tab, setTab] = useState('pending'); // 'pending', 'all', 'analytics'
    const [users, setUsers] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [skip, setSkip] = useState(0);
    const [limit] = useState(10);
    const [total, setTotal] = useState(0);
    const [selectedUser, setSelectedUser] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [filters, setFilters] = useState({ role: '', status: '' });

    // Load pending users on mount
    useEffect(() => {
        if (tab === 'pending') {
            loadPendingUsers();
        } else if (tab === 'all') {
            loadAllUsers();
        } else if (tab === 'analytics') {
            loadAnalytics();
        }
    }, [tab, skip, filters]);

    const loadPendingUsers = async () => {
        setIsLoading(true);
        setError('');
        try {
            const response = await adminAPI.getPendingUsers(skip, limit, filters.role || null);
            setUsers(response.data.users);
            setTotal(response.data.total);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to load pending users');
        } finally {
            setIsLoading(false);
        }
    };

    const loadAllUsers = async () => {
        setIsLoading(true);
        setError('');
        try {
            const response = await adminAPI.listAllUsers(
                skip,
                limit,
                filters.role || null,
                filters.status || null
            );
            setUsers(response.data.users);
            setTotal(response.data.total);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to load users');
        } finally {
            setIsLoading(false);
        }
    };

    const loadAnalytics = async () => {
        setIsLoading(true);
        setError('');
        try {
            const response = await adminAPI.getAnalytics();
            setAnalytics(response.data);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to load analytics');
        } finally {
            setIsLoading(false);
        }
    };

    const handleApprove = async (userId) => {
        if (!window.confirm('Are you sure you want to approve this user?')) return;

        setIsLoading(true);
        setError('');
        try {
            await adminAPI.approveUser(userId);
            setSuccess('User approved successfully!');
            setSelectedUser(null);
            if (tab === 'pending') {
                loadPendingUsers();
            } else {
                loadAllUsers();
            }
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to approve user');
        } finally {
            setIsLoading(false);
        }
    };

    const handleReject = async (userId) => {
        if (!rejectionReason.trim()) {
            setError('Please provide a rejection reason');
            return;
        }

        if (!window.confirm('Are you sure you want to reject this user?')) return;

        setIsLoading(true);
        setError('');
        try {
            await adminAPI.rejectUser(userId, rejectionReason);
            setSuccess('User rejected successfully!');
            setSelectedUser(null);
            setRejectionReason('');
            if (tab === 'pending') {
                loadPendingUsers();
            } else {
                loadAllUsers();
            }
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to reject user');
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString() + ' ' + new Date(dateString).toLocaleTimeString();
    };

    const getStatusBadge = (status) => {
        const styles = {
            approved: { bg: '#d4edda', color: '#155724', border: '#c3e6cb' },
            pending: { bg: '#ffe6cc', color: '#cc6600', border: '#ffb366' },
            rejected: { bg: '#fee', color: '#c33', border: '#fcc' }
        };
        const style = styles[status] || styles.pending;
        return (
            <span style={{
                display: 'inline-block',
                padding: '4px 12px',
                backgroundColor: style.bg,
                color: style.color,
                border: `1px solid ${style.border}`,
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: 'bold',
                textTransform: 'capitalize'
            }}>
                {status}
            </span>
        );
    };

    return (
        <main>
            <div className="page-header">
                <h1>Admin Dashboard</h1>
                <p>Manage users and registrations</p>
            </div>

            <div className="container">
                {error && (
                    <div style={{
                        padding: '12px',
                        marginBottom: '20px',
                        backgroundColor: '#fee',
                        border: '1px solid #fcc',
                        borderRadius: '4px',
                        color: '#c33'
                    }}>
                        ❌ {error}
                    </div>
                )}

                {success && (
                    <div style={{
                        padding: '12px',
                        marginBottom: '20px',
                        backgroundColor: '#d4edda',
                        border: '1px solid #c3e6cb',
                        borderRadius: '4px',
                        color: '#155724'
                    }}>
                        ✓ {success}
                    </div>
                )}

                {/* Tabs */}
                <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', borderBottom: '1px solid #ddd' }}>
                    {['pending', 'all', 'analytics'].map(t => (
                        <button
                            key={t}
                            onClick={() => {
                                setTab(t);
                                setSkip(0);
                                setSelectedUser(null);
                            }}
                            style={{
                                padding: '10px 20px',
                                backgroundColor: tab === t ? '#007bff' : '#f0f0f0',
                                color: tab === t ? 'white' : '#333',
                                border: 'none',
                                borderRadius: '4px 4px 0 0',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: tab === t ? 'bold' : 'normal',
                                textTransform: 'capitalize'
                            }}
                        >
                            {t === 'pending' && `Pending Users (${total})`}
                            {t === 'all' && `All Users (${total})`}
                            {t === 'analytics' && 'Analytics'}
                        </button>
                    ))}
                </div>

                <div className="content-box">
                    {/* PENDING TAB */}
                    {tab === 'pending' && (
                        <div>
                            <h2>Pending User Registrations</h2>
                            <p style={{ color: '#666', marginBottom: '20px' }}>
                                Review and approve/reject pending user registrations
                            </p>

                            {isLoading ? (
                                <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>
                            ) : users.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                                    No pending users to review
                                </div>
                            ) : (
                                <div>
                                    <div style={{ overflowX: 'auto', marginBottom: '20px' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                            <thead>
                                                <tr style={{ backgroundColor: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
                                                    <th style={{ padding: '10px', textAlign: 'left' }}>Name</th>
                                                    <th style={{ padding: '10px', textAlign: 'left' }}>Email</th>
                                                    <th style={{ padding: '10px', textAlign: 'left' }}>Role</th>
                                                    <th style={{ padding: '10px', textAlign: 'left' }}>Applied</th>
                                                    <th style={{ padding: '10px', textAlign: 'center' }}>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {users.map(u => (
                                                    <tr key={u.user_id} style={{ borderBottom: '1px solid #ddd' }}>
                                                        <td style={{ padding: '10px' }}>{u.full_name}</td>
                                                        <td style={{ padding: '10px' }}>{u.email}</td>
                                                        <td style={{ padding: '10px', textTransform: 'capitalize' }}>
                                                            {u.role} {u.advocate_type && `(${u.advocate_type.replace('_', ' ')})`}
                                                        </td>
                                                        <td style={{ padding: '10px', fontSize: '12px' }}>
                                                            {formatDate(u.created_at)}
                                                        </td>
                                                        <td style={{ padding: '10px', textAlign: 'center' }}>
                                                            <button
                                                                onClick={() => setSelectedUser(u)}
                                                                style={{
                                                                    padding: '6px 12px',
                                                                    backgroundColor: '#007bff',
                                                                    color: 'white',
                                                                    border: 'none',
                                                                    borderRadius: '4px',
                                                                    cursor: 'pointer',
                                                                    fontSize: '12px'
                                                                }}
                                                            >
                                                                Review
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Pagination */}
                                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
                                        <button
                                            onClick={() => setSkip(Math.max(0, skip - limit))}
                                            disabled={skip === 0}
                                            style={{
                                                padding: '8px 16px',
                                                backgroundColor: skip === 0 ? '#ccc' : '#007bff',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: skip === 0 ? 'not-allowed' : 'pointer'
                                            }}
                                        >
                                            Previous
                                        </button>
                                        <span style={{ padding: '8px 16px' }}>
                                            Page {Math.floor(skip / limit) + 1} of {Math.ceil(total / limit)}
                                        </span>
                                        <button
                                            onClick={() => skip + limit < total && setSkip(skip + limit)}
                                            disabled={skip + limit >= total}
                                            style={{
                                                padding: '8px 16px',
                                                backgroundColor: skip + limit >= total ? '#ccc' : '#007bff',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: skip + limit >= total ? 'not-allowed' : 'pointer'
                                            }}
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ALL USERS TAB */}
                    {tab === 'all' && (
                        <div>
                            <h2>All Users</h2>
                            <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
                                <select
                                    value={filters.role}
                                    onChange={(e) => {
                                        setFilters({ ...filters, role: e.target.value });
                                        setSkip(0);
                                    }}
                                    style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                                >
                                    <option value="">All Roles</option>
                                    <option value="user">User</option>
                                    <option value="advocate">Advocate</option>
                                    <option value="brand_advocate">Brand Advocate</option>
                                    <option value="admin">Admin</option>
                                </select>

                                <select
                                    value={filters.status}
                                    onChange={(e) => {
                                        setFilters({ ...filters, status: e.target.value });
                                        setSkip(0);
                                    }}
                                    style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                                >
                                    <option value="">All Statuses</option>
                                    <option value="approved">Approved</option>
                                    <option value="pending">Pending</option>
                                    <option value="rejected">Rejected</option>
                                </select>
                            </div>

                            {isLoading ? (
                                <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>
                            ) : users.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                                    No users found
                                </div>
                            ) : (
                                <div>
                                    <div style={{ overflowX: 'auto', marginBottom: '20px' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                            <thead>
                                                <tr style={{ backgroundColor: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
                                                    <th style={{ padding: '10px', textAlign: 'left' }}>Name</th>
                                                    <th style={{ padding: '10px', textAlign: 'left' }}>Email</th>
                                                    <th style={{ padding: '10px', textAlign: 'left' }}>Role</th>
                                                    <th style={{ padding: '10px', textAlign: 'center' }}>Status</th>
                                                    <th style={{ padding: '10px', textAlign: 'left' }}>Joined</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {users.map(u => (
                                                    <tr key={u.user_id} style={{ borderBottom: '1px solid #ddd' }}>
                                                        <td style={{ padding: '10px' }}>{u.full_name}</td>
                                                        <td style={{ padding: '10px' }}>{u.email}</td>
                                                        <td style={{ padding: '10px', textTransform: 'capitalize' }}>{u.role}</td>
                                                        <td style={{ padding: '10px', textAlign: 'center' }}>
                                                            {getStatusBadge(u.status)}
                                                        </td>
                                                        <td style={{ padding: '10px', fontSize: '12px' }}>
                                                            {formatDate(u.created_at)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ANALYTICS TAB */}
                    {tab === 'analytics' && (
                        <div>
                            <h2>System Analytics</h2>
                            {isLoading ? (
                                <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>
                            ) : analytics ? (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                                    <div style={{
                                        backgroundColor: '#d4edda',
                                        border: '1px solid #c3e6cb',
                                        borderRadius: '8px',
                                        padding: '20px',
                                        textAlign: 'center'
                                    }}>
                                        <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#155724' }}>
                                            {analytics.total_users}
                                        </div>
                                        <div style={{ color: '#155724', marginTop: '8px' }}>Total Users</div>
                                    </div>

                                    <div style={{
                                        backgroundColor: '#d1ecf1',
                                        border: '1px solid #bee5eb',
                                        borderRadius: '8px',
                                        padding: '20px',
                                        textAlign: 'center'
                                    }}>
                                        <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#0c5460' }}>
                                            {analytics.approved_users}
                                        </div>
                                        <div style={{ color: '#0c5460', marginTop: '8px' }}>Approved</div>
                                    </div>

                                    <div style={{
                                        backgroundColor: '#ffe6cc',
                                        border: '1px solid #ffb366',
                                        borderRadius: '8px',
                                        padding: '20px',
                                        textAlign: 'center'
                                    }}>
                                        <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#cc6600' }}>
                                            {analytics.pending_users}
                                        </div>
                                        <div style={{ color: '#cc6600', marginTop: '8px' }}>Pending</div>
                                    </div>

                                    <div style={{
                                        backgroundColor: '#fee',
                                        border: '1px solid #fcc',
                                        borderRadius: '8px',
                                        padding: '20px',
                                        textAlign: 'center'
                                    }}>
                                        <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#c33' }}>
                                            {analytics.rejected_users}
                                        </div>
                                        <div style={{ color: '#c33', marginTop: '8px' }}>Rejected</div>
                                    </div>

                                    <div style={{
                                        backgroundColor: '#e7f3ff',
                                        border: '1px solid #b3d9ff',
                                        borderRadius: '8px',
                                        padding: '20px',
                                        textAlign: 'center'
                                    }}>
                                        <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#004e99' }}>
                                            {analytics.total_advocates}
                                        </div>
                                        <div style={{ color: '#004e99', marginTop: '8px' }}>Advocates</div>
                                    </div>

                                    <div style={{
                                        backgroundColor: '#fff3cd',
                                        border: '1px solid #ffc107',
                                        borderRadius: '8px',
                                        padding: '20px',
                                        textAlign: 'center'
                                    }}>
                                        <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#856404' }}>
                                            {analytics.total_referrals}
                                        </div>
                                        <div style={{ color: '#856404', marginTop: '8px' }}>Referrals</div>
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    )}
                </div>

                {/* User Review Modal */}
                {selectedUser && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000
                    }}>
                        <div style={{
                            backgroundColor: 'white',
                            borderRadius: '8px',
                            padding: '30px',
                            maxWidth: '500px',
                            width: '90%',
                            maxHeight: '80vh',
                            overflowY: 'auto'
                        }}>
                            <h2 style={{ marginTop: 0 }}>{selectedUser.full_name}</h2>

                            <div style={{ marginBottom: '15px', paddingBottom: '15px', borderBottom: '1px solid #eee' }}>
                                <div style={{ color: '#666', fontSize: '12px', marginBottom: '5px' }}>Email</div>
                                <div>{selectedUser.email}</div>
                            </div>

                            <div style={{ marginBottom: '15px', paddingBottom: '15px', borderBottom: '1px solid #eee' }}>
                                <div style={{ color: '#666', fontSize: '12px', marginBottom: '5px' }}>Role</div>
                                <div style={{ textTransform: 'capitalize' }}>
                                    {selectedUser.role} {selectedUser.advocate_type && `(${selectedUser.advocate_type.replace('_', ' ')})`}
                                </div>
                            </div>

                            <div style={{ marginBottom: '15px', paddingBottom: '15px', borderBottom: '1px solid #eee' }}>
                                <div style={{ color: '#666', fontSize: '12px', marginBottom: '5px' }}>Applied On</div>
                                <div>{formatDate(selectedUser.created_at)}</div>
                            </div>

                            <div style={{ marginBottom: '15px', paddingBottom: '15px', borderBottom: '1px solid #eee' }}>
                                <div style={{ color: '#666', fontSize: '12px', marginBottom: '5px' }}>Status</div>
                                {getStatusBadge(selectedUser.status)}
                            </div>

                            {/* Rejection Reason Input (only for rejection) */}
                            {rejectionReason !== '' && (
                                <div style={{ marginBottom: '15px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                                        Rejection Reason
                                    </label>
                                    <textarea
                                        value={rejectionReason}
                                        onChange={(e) => setRejectionReason(e.target.value)}
                                        placeholder="Explain why this registration is being rejected..."
                                        style={{
                                            width: '100%',
                                            minHeight: '100px',
                                            padding: '10px',
                                            border: '1px solid #ccc',
                                            borderRadius: '4px',
                                            fontFamily: 'inherit',
                                            boxSizing: 'border-box'
                                        }}
                                    />
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                                {rejectionReason === '' ? (
                                    <>
                                        <button
                                            onClick={() => handleApprove(selectedUser.user_id)}
                                            disabled={isLoading}
                                            style={{
                                                flex: 1,
                                                padding: '10px',
                                                backgroundColor: '#28a745',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: isLoading ? 'not-allowed' : 'pointer',
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            ✓ Approve
                                        </button>
                                        <button
                                            onClick={() => setRejectionReason('')}
                                            style={{
                                                flex: 1,
                                                padding: '10px',
                                                backgroundColor: '#dc3545',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            ✗ Reject
                                        </button>
                                        <button
                                            onClick={() => setSelectedUser(null)}
                                            style={{
                                                flex: 1,
                                                padding: '10px',
                                                backgroundColor: '#6c757d',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Close
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => handleReject(selectedUser.user_id)}
                                            disabled={isLoading || !rejectionReason.trim()}
                                            style={{
                                                flex: 1,
                                                padding: '10px',
                                                backgroundColor: !rejectionReason.trim() ? '#999' : '#dc3545',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: !rejectionReason.trim() || isLoading ? 'not-allowed' : 'pointer',
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            {isLoading ? 'Rejecting...' : 'Confirm Rejection'}
                                        </button>
                                        <button
                                            onClick={() => {
                                                setRejectionReason('');
                                            }}
                                            style={{
                                                flex: 1,
                                                padding: '10px',
                                                backgroundColor: '#6c757d',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Cancel
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
