import { useState, useEffect } from 'react';
import { useReferral } from '../../hooks/useReferral';
import { userAPI } from '../../services/api';
import '../styles/referrals-list.css';

export default function MyReferrals() {
    const advocateId = localStorage.getItem('advocateId');
    const { getByAdvocate: getReferrals } = useReferral();

    const [referralLinks, setReferralLinks] = useState([]);
    const [referralLeads, setReferralLeads] = useState([]);
    const [filteredLeads, setFilteredLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedReferral, setSelectedReferral] = useState(null);
    const [activeTab, setActiveTab] = useState('leads'); // 'leads' or 'links'

    const splitReferrals = (referrals = []) => {
        if (!Array.isArray(referrals)) {
            return { links: [], leads: [] };
        }

        return {
            links: referrals.filter(r => r?.uuid && r?.click_count !== undefined),
            leads: referrals.filter(r => r?.lead_name && r?.lead_phone)
        };
    };

    const applyLeadFilters = (leads = [], status = 'all', search = '') => {
        let result = [...leads];

        if (status !== 'all') {
            result = result.filter(r => r?.status === status);
        }

        if (search?.trim()) {
            const q = search.toLowerCase().trim();
            result = result.filter(r =>
                r?.lead_name?.toLowerCase().includes(q) ||
                r?.lead_email?.toLowerCase().includes(q) ||
                r?.lead_phone?.toString().includes(q)
            );
        }

        return result;
    };

    // -------------------- data loader --------------------

    const loadReferrals = async () => {
        if (!advocateId) {
            console.warn('Advocate ID missing');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);

            // Fetch referral links
            const linksResponse = await getReferrals(advocateId);
            const linksData = linksResponse?.data?.referrals || linksResponse?.referrals || [];
            const links = linksData.filter(r => r?.uuid && r?.click_count !== undefined);

            // Fetch leads by advocate_id
            let leads = [];
            try {
                const leadsResponse = await fetch(`/api/referrals/advocate/${advocateId}/leads`);
                if (leadsResponse.ok) {
                    const leadsData = await leadsResponse.json();
                    leads = leadsData?.data?.leads || leadsData?.leads || [];
                } else {
                    console.warn('Could not fetch leads from API');
                }
            } catch (error) {
                console.warn('Leads API not available, trying alternative approach');
                // Fallback: get leads from the referrals response if available
                const allReferrals = linksResponse?.data?.referrals || linksResponse?.referrals || [];
                leads = allReferrals.filter(r => r?.lead_name && r?.lead_phone);
            }

            setReferralLinks(links);
            setReferralLeads(leads);
            setFilteredLeads(applyLeadFilters(leads, 'all', ''));
        } catch (error) {
            console.error('Failed to load referrals:', error);
            setReferralLinks([]);
            setReferralLeads([]);
            setFilteredLeads([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!advocateId) {
            setLoading(false);
            return;
        }
        loadReferrals();
    }, [advocateId]);

    // -------------------- filters --------------------

    const filterLeads = (list, status, search) => {
        try {
            setFilteredLeads(applyLeadFilters(list, status, search));
        } catch (err) {
            console.error('Filter error:', err);
            setFilteredLeads([]);
        }
    };

    const handleResetFilters = () => {
        setFilterStatus('all');
        setSearchTerm('');
        setFilteredLeads(applyLeadFilters(referralLeads, 'all', ''));
    };

    const handleFilterChange = (status) => {
        setFilterStatus(status);
        filterLeads(referralLeads, status, searchTerm);
    };

    const handleSearch = (e) => {
        const term = e.target.value;
        setSearchTerm(term);
        filterLeads(referralLeads, filterStatus, term);
    };

    // -------------------- status helpers --------------------

    const getStatusColor = (status) =>
    ({
        NEW_LEAD: '#3498db',
        SITE_VISIT: '#f39c12',
        IN_PROGRESS: '#9b59b6',
        CONVERTED: '#27ae60',
        REJECTED: '#e74c3c'
    }[status] || '#95a5a6');

    const getStatusLabel = (status) =>
    ({
        NEW_LEAD: 'New Lead',
        SITE_VISIT: 'Site Visit',
        IN_PROGRESS: 'In Progress',
        CONVERTED: 'Converted',
        REJECTED: 'Rejected'
    }[status] || status);

    // -------------------- stats --------------------

    const stats = {
        all: referralLinks.length + referralLeads.length,
        new: referralLinks.length,
        siteVisit: referralLinks.reduce((s, l) => s + (l?.visits?.length || 0), 0),
        inProgress: referralLeads.filter(r => r?.status === 'IN_PROGRESS').length,
        converted: referralLeads.filter(r => r?.status === 'CONVERTED').length
    };

    const linkStats = {
        total: referralLinks.length,
        totalClicks: referralLinks.reduce((s, l) => s + (l?.click_count || 0), 0),
        totalVisits: referralLinks.reduce((s, l) => s + (l?.visits?.length || 0), 0)
    };

    // -------------------- UI --------------------

    if (loading) {
        return (
            <main className="referrals-page">
                <div className="loading-spinner">
                    <p>Loading referrals...</p>
                </div>
            </main>
        );
    }

    if (!advocateId) {
        return (
            <main className="referrals-page">
                <div className="empty-state" style={{ marginTop: '100px' }}>
                    <p>❌ User ID not found. Please log in again.</p>
                    <a href="/login" className="btn btn-primary">Go to Login</a>
                </div>
            </main>
        );
    }

    return (
        <main className="referrals-page">
            <div className="page-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1>My Referrals</h1>
                        <p>Track referral links and manage converted leads</p>
                    </div>
                    <button
                        onClick={loadReferrals}
                        style={{
                            padding: '8px 16px',
                            fontSize: '13px',
                            backgroundColor: '#f0f0f0',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        🔄 Refresh
                    </button>
                </div>
            </div>

            {/* Tab Navigation */}
            <section className="tabs-section" style={{ marginBottom: '30px' }}>
                <button
                    className={`tab-btn ${activeTab === 'leads' ? 'active' : ''}`}
                    onClick={() => setActiveTab('leads')}
                    style={{
                        padding: '12px 24px',
                        fontSize: '14px',
                        fontWeight: '600',
                        border: 'none',
                        cursor: 'pointer',
                        backgroundColor: activeTab === 'leads' ? '#007bff' : '#e9ecef',
                        color: activeTab === 'leads' ? 'white' : '#333',
                        borderRadius: '4px 0 0 4px'
                    }}
                >
                    📋 Generated Leads ({referralLeads.length})
                </button>
                <button
                    className={`tab-btn ${activeTab === 'links' ? 'active' : ''}`}
                    onClick={() => setActiveTab('links')}
                    style={{
                        padding: '12px 24px',
                        fontSize: '14px',
                        fontWeight: '600',
                        border: 'none',
                        cursor: 'pointer',
                        backgroundColor: activeTab === 'links' ? '#007bff' : '#e9ecef',
                        color: activeTab === 'links' ? 'white' : '#333',
                        borderRadius: '0 4px 4px 0'
                    }}
                >
                    🔗 Referral Links ({linkStats.total})
                </button>
            </section>

            {/* LEADS TAB */}
            {activeTab === 'leads' && (
                <>
                    {/* Stats Section */}
                    <section className="referrals-stats">
                        <div
                            className="stat-badge"
                            onClick={() => {
                                setFilterStatus('all');
                                setSearchTerm('');
                                filterLeads(referralLeads, 'all', '');
                            }}
                            style={{ cursor: 'pointer' }}
                        >
                            <span className="count">{stats.all}</span>
                            <span className="label">All</span>
                        </div>
                        <div
                            className="stat-badge"
                            onClick={() => {
                                setFilterStatus('all');
                                setSearchTerm('');
                                filterLeads(referralLeads, 'all', '');
                            }}
                            style={{ cursor: 'pointer', opacity: 0.8 }}
                        >
                            <span className="count">{stats.new}</span>
                            <span className="label">New Links Created</span>
                        </div>
                        <div
                            className="stat-badge"
                            style={{ cursor: 'default', opacity: 0.8 }}
                        >
                            <span className="count">{stats.siteVisit}</span>
                            <span className="label">Site Visits (Links)</span>
                        </div>
                        <div
                            className="stat-badge"
                            onClick={() => {
                                setFilterStatus('IN_PROGRESS');
                                setSearchTerm('');
                                filterLeads(referralLeads, 'IN_PROGRESS', '');
                            }}
                            style={{ cursor: 'pointer' }}
                        >
                            <span className="count">{stats.inProgress}</span>
                            <span className="label">In Progress</span>
                        </div>
                        <div
                            className="stat-badge converted"
                            onClick={() => {
                                setFilterStatus('CONVERTED');
                                setSearchTerm('');
                                filterLeads(referralLeads, 'CONVERTED', '');
                            }}
                            style={{ cursor: 'pointer' }}
                        >
                            <span className="count">{stats.converted}</span>
                            <span className="label">Converted</span>
                        </div>
                    </section>

                    {/* Filters and Search */}
                    <section className="filters-section">
                        <div className="search-box" style={{ position: 'relative' }}>
                            <input
                                type="text"
                                placeholder="Search by name, phone, or email..."
                                value={searchTerm}
                                onChange={handleSearch}
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => {
                                        setSearchTerm('');
                                        filterLeads(referralLeads, filterStatus, '');
                                    }}
                                    style={{
                                        position: 'absolute',
                                        right: '10px',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: '#999',
                                        fontSize: '18px'
                                    }}
                                >
                                    ✕
                                </button>
                            )}
                        </div>

                        <div className="filter-buttons">
                            <button
                                className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
                                onClick={() => handleFilterChange('all')}
                            >
                                All
                            </button>
                            <button
                                className={`filter-btn ${filterStatus === 'SITE_VISIT' ? 'active' : ''}`}
                                onClick={() => handleFilterChange('SITE_VISIT')}
                            >
                                Site Visit
                            </button>
                            <button
                                className={`filter-btn ${filterStatus === 'IN_PROGRESS' ? 'active' : ''}`}
                                onClick={() => handleFilterChange('IN_PROGRESS')}
                            >
                                In Progress
                            </button>
                            <button
                                className={`filter-btn ${filterStatus === 'CONVERTED' ? 'active' : ''}`}
                                onClick={() => handleFilterChange('CONVERTED')}
                            >
                                Converted
                            </button>
                        </div>
                    </section>

                    {/* Leads List */}
                    <section className="referrals-list">
                        {filteredLeads.length > 0 ? (
                            <>
                                <div style={{
                                    padding: '12px 0',
                                    fontSize: '13px',
                                    color: '#666',
                                    borderBottom: '1px solid #e0e0e0',
                                    marginBottom: '15px'
                                }}>
                                    Showing {filteredLeads.length} lead{filteredLeads.length !== 1 ? 's' : ''}
                                    {filterStatus !== 'all' && ` (${filterStatus.replace(/_/g, ' ')})`}
                                    {searchTerm && ` - Search: "${searchTerm}"`}
                                </div>
                                <div className="referrals-grid">
                                    {filteredLeads.map(lead => (
                                        <div
                                            key={lead._id}
                                            className="referral-card"
                                            onClick={() =>
                                                setSelectedReferral(
                                                    selectedReferral?._id === lead._id ? null : lead
                                                )
                                            }
                                        >
                                            <div className="card-header">
                                                <h3>{lead.lead_name}</h3>
                                                <span
                                                    className="status-badge"
                                                    style={{ backgroundColor: getStatusColor(lead.status) }}
                                                >
                                                    {getStatusLabel(lead.status)}
                                                </span>
                                            </div>

                                            <div className="card-content">
                                                <div className="info-row">
                                                    <span className="label">📞 Phone</span>
                                                    <span className="value">{lead.lead_phone}</span>
                                                </div>
                                                {lead.lead_email && (
                                                    <div className="info-row">
                                                        <span className="label">📧 Email</span>
                                                        <span className="value">{lead.lead_email}</span>
                                                    </div>
                                                )}
                                                {lead.budget && (
                                                    <div className="info-row">
                                                        <span className="label">💰 Budget</span>
                                                        <span className="value">₹{lead.budget.toLocaleString()}</span>
                                                    </div>
                                                )}
                                                {lead.target_project && (
                                                    <div className="info-row">
                                                        <span className="label">🏢 Project</span>
                                                        <span className="value">{lead.target_project}</span>
                                                    </div>
                                                )}
                                                <div className="info-row">
                                                    <span className="label">📅 Date</span>
                                                    <span className="value">
                                                        {new Date(lead.created_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>

                                            {selectedReferral?._id === lead._id && (
                                                <div className="card-actions">
                                                    <button className="btn btn-sm btn-secondary">View Details</button>
                                                    {lead.status === 'NEW_LEAD' && (
                                                        <button className="btn btn-sm btn-primary">Update Status</button>
                                                    )}
                                                    {lead.status === 'CONVERTED' && (
                                                        <div className="success-badge">✓ Reward Unlocked</div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="empty-state">
                                {referralLeads.length === 0 ? (
                                    <>
                                        <p>📊 No leads generated yet.</p>
                                        <p style={{ fontSize: '13px', color: '#999', marginTop: '10px' }}>
                                            Create a referral link and share it to start collecting leads
                                        </p>
                                        <a href="/referral/link-qr" className="btn btn-primary" style={{ marginTop: '15px' }}>Generate Referral Link</a>
                                    </>
                                ) : (
                                    <>
                                        <p>❌ No leads match your filters.</p>
                                        <p style={{ fontSize: '13px', color: '#999', marginTop: '10px' }}>
                                            Try selecting "All" or a different status
                                        </p>
                                        <button
                                            onClick={() => handleResetFilters()}
                                            className="btn btn-secondary"
                                            style={{ marginTop: '15px' }}
                                        >
                                            Clear All Filters
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                    </section>
                </>
            )}

            {/* LINKS TAB */}
            {activeTab === 'links' && (
                <>
                    {/* Link Stats */}
                    <section className="referrals-stats">
                        <div className="stat-badge">
                            <span className="count">{linkStats.total}</span>
                            <span className="label">Total Links</span>
                        </div>
                        <div className="stat-badge">
                            <span className="count">{linkStats.totalClicks}</span>
                            <span className="label">Total Clicks</span>
                        </div>
                        <div className="stat-badge">
                            <span className="count">{linkStats.totalVisits}</span>
                            <span className="label">Total Visits</span>
                        </div>
                    </section>

                    {/* Referral Links List */}
                    <section className="referrals-list">
                        {referralLinks.length > 0 ? (
                            <div className="referrals-grid">
                                {referralLinks.map(link => (
                                    <div
                                        key={link._id}
                                        className="referral-card"
                                        onClick={() =>
                                            setSelectedReferral(
                                                selectedReferral?._id === link._id ? null : link
                                            )
                                        }
                                    >
                                        <div className="card-header">
                                            <h3>📱 {link.channel.toUpperCase()}</h3>
                                            <span
                                                className="status-badge"
                                                style={{ backgroundColor: '#27ae60' }}
                                            >
                                                {link.status}
                                            </span>
                                        </div>

                                        <div className="card-content">
                                            <div className="info-row">
                                                <span className="label">Link UUID</span>
                                                <span className="value" style={{ fontSize: '12px', fontFamily: 'monospace' }}>
                                                    {link.uuid.substring(0, 12)}...
                                                </span>
                                            </div>
                                            <div className="info-row">
                                                <span className="label">🔗 Clicks</span>
                                                <span className="value">{link.click_count || 0}</span>
                                            </div>
                                            <div className="info-row">
                                                <span className="label">👁️ Unique Visits</span>
                                                <span className="value">{link.visits?.length || 0}</span>
                                            </div>
                                            <div className="info-row">
                                                <span className="label">📅 Created</span>
                                                <span className="value">
                                                    {new Date(link.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>

                                        {selectedReferral?._id === link._id && (
                                            <div className="card-actions">
                                                <button
                                                    className="btn btn-sm btn-primary"
                                                    onClick={() => window.location.href = `/analytics/${link.uuid}`}
                                                >
                                                    View Analytics
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-secondary"
                                                    onClick={() =>
                                                        navigator.clipboard
                                                            .writeText(link.link)
                                                            .then(() => alert('Link copied!'))
                                                    }
                                                >
                                                    Copy Link
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-state">
                                <p>No referral links created yet. Create your first referral link!</p>
                                <a href="/referral/link-qr" className="btn btn-primary">
                                    Create First Link
                                </a>
                            </div>
                        )}
                    </section>
                </>
            )}
        </main>
    );
}
