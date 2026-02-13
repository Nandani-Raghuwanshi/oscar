import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { advocateApi } from '../services/api'
import '../styles/dashboard.css'

export default function ReferralForm() {
    const { user } = useAuth()
    const [formData, setFormData] = useState({
        property_name: '',
        property_value: '',
        client_name: '',
        client_email: '',
        client_phone: ''
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setSuccess('')
        setLoading(true)

        try {
            const submitData = {
                ...formData,
                advocate_id: user?.id,
                property_value: parseInt(formData.property_value)
            }

            await advocateApi.createReferral(submitData)
            setSuccess('Referral created successfully!')
            setFormData({
                property_name: '',
                property_value: '',
                client_name: '',
                client_email: '',
                client_phone: ''
            })

            setTimeout(() => setSuccess(''), 3000)
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create referral')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>Create New Referral</h1>
                <p>Add a new property referral</p>
            </div>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <div className="form-card">
                <form onSubmit={handleSubmit}>
                    <div className="form-section">
                        <h3>Property Information</h3>
                        <div className="form-group">
                            <label htmlFor="property_name">Property Name</label>
                            <input
                                type="text"
                                id="property_name"
                                name="property_name"
                                value={formData.property_name}
                                onChange={handleChange}
                                required
                                placeholder="e.g., Luxury Apartment - Downtown"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="property_value">Property Value (₹)</label>
                            <input
                                type="number"
                                id="property_value"
                                name="property_value"
                                value={formData.property_value}
                                onChange={handleChange}
                                required
                                placeholder="e.g., 5000000"
                            />
                        </div>
                    </div>

                    <div className="form-section">
                        <h3>Client Information</h3>
                        <div className="form-group">
                            <label htmlFor="client_name">Client Name</label>
                            <input
                                type="text"
                                id="client_name"
                                name="client_name"
                                value={formData.client_name}
                                onChange={handleChange}
                                required
                                placeholder="Full name"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="client_email">Client Email</label>
                            <input
                                type="email"
                                id="client_email"
                                name="client_email"
                                value={formData.client_email}
                                onChange={handleChange}
                                required
                                placeholder="Email address"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="client_phone">Client Phone</label>
                            <input
                                type="tel"
                                id="client_phone"
                                name="client_phone"
                                value={formData.client_phone}
                                onChange={handleChange}
                                required
                                placeholder="Phone number"
                            />
                        </div>
                    </div>

                    <button type="submit" disabled={loading} className="btn-submit">
                        {loading ? 'Creating Referral...' : 'Create Referral'}
                    </button>
                </form>
            </div>
        </div>
    )
}
