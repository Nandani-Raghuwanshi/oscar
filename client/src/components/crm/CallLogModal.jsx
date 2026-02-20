import React, { useState, useEffect } from 'react';

/**
 * Modal for logging interactions (calls, meetings, notes) with 50-word minimum validation
 * Used by Sales Associates to track customer communications
 */
const CallLogModal = ({ isOpen, onClose, onSubmit, referral, loading = false }) => {
    const [formData, setFormData] = useState({
        interactionType: 'call',
        outcome: '',
        duration: '',
        notes: '',
        nextFollowUpDate: ''
    });
    const [wordCount, setWordCount] = useState(0);
    const [errors, setErrors] = useState({});

    const interactionTypes = [
        { value: 'call', label: '📞 Phone Call', icon: '📞' },
        { value: 'email', label: '📧 Email', icon: '📧' },
        { value: 'whatsapp', label: '💬 WhatsApp', icon: '💬' },
        { value: 'meeting', label: '🤝 Meeting', icon: '🤝' },
        { value: 'site_visit', label: '🏗️ Site Visit', icon: '🏗️' },
        { value: 'note', label: '📝 Note', icon: '📝' }
    ];

    const outcomeOptions = [
        'Interested - Follow up required',
        'Very interested - Site visit scheduled',
        'Not interested - High budget',
        'Not interested - Wrong location',
        'Not interested - Wrong timing',
        'Call back later',
        'Switched off / Not reachable',
        'Voicemail left',
        'Wrong number',
        'Other'
    ];

    useEffect(() => {
        if (isOpen) {
            // Reset form when modal opens
            setFormData({
                interactionType: 'call',
                outcome: '',
                duration: '',
                notes: '',
                nextFollowUpDate: ''
            });
            setWordCount(0);
            setErrors({});
        }
    }, [isOpen]);

    useEffect(() => {
        // Calculate word count
        const words = formData.notes.trim().split(/\s+/).filter(word => word.length > 0);
        setWordCount(words.length);
    }, [formData.notes]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.interactionType) {
            newErrors.interactionType = 'Please select an interaction type';
        }

        if (!formData.outcome || formData.outcome.trim() === '') {
            newErrors.outcome = 'Please select or enter an outcome';
        }

        if (!formData.notes || formData.notes.trim() === '') {
            newErrors.notes = 'Notes are required';
        } else if (wordCount < 50) {
            newErrors.notes = `Notes must be at least 50 words (currently ${wordCount} words)`;
        }

        // Duration required for calls, meetings, site visits
        if (['call', 'meeting', 'site_visit'].includes(formData.interactionType)) {
            if (!formData.duration || formData.duration <= 0) {
                newErrors.duration = 'Duration is required';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (validate()) {
            onSubmit({
                ...formData,
                referralId: referral._id,
                duration: formData.duration ? parseInt(formData.duration) : undefined
            });
        }
    };

    if (!isOpen) return null;

    const wordCountColor = wordCount < 50 ? 'text-red-600' : 'text-green-600';
    const progressPercentage = Math.min((wordCount / 50) * 100, 100);
    const progressColor = wordCount < 50 ? 'bg-red-500' : 'bg-green-500';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="bg-indigo-600 text-white px-6 py-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold">Log Interaction</h2>
                        <p className="text-sm text-indigo-100 mt-1">
                            {referral?.customerName} • {referral?.customerPhone}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="text-white hover:text-indigo-100 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                    {/* Interaction Type */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Interaction Type *
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {interactionTypes.map(type => (
                                <button
                                    key={type.value}
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, interactionType: type.value }))}
                                    className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                                        formData.interactionType === type.value
                                            ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                                            : 'border-gray-200 bg-white text-gray-700 hover:border-indigo-300'
                                    }`}
                                >
                                    <span className="text-lg mr-1">{type.icon}</span>
                                    {type.label.split(' ')[1]}
                                </button>
                            ))}
                        </div>
                        {errors.interactionType && (
                            <p className="text-red-600 text-sm mt-1">{errors.interactionType}</p>
                        )}
                    </div>

                    {/* Outcome */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Outcome *
                        </label>
                        <select
                            name="outcome"
                            value={formData.outcome}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                                errors.outcome ? 'border-red-500' : 'border-gray-300'
                            }`}
                        >
                            <option value="">Select outcome...</option>
                            {outcomeOptions.map(option => (
                                <option key={option} value={option}>{option}</option>
                            ))}
                        </select>
                        {errors.outcome && (
                            <p className="text-red-600 text-sm mt-1">{errors.outcome}</p>
                        )}
                    </div>

                    {/* Duration (conditional) */}
                    {['call', 'meeting', 'site_visit'].includes(formData.interactionType) && (
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Duration (minutes) *
                            </label>
                            <input
                                type="number"
                                name="duration"
                                value={formData.duration}
                                onChange={handleChange}
                                min="1"
                                placeholder="e.g., 15"
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                                    errors.duration ? 'border-red-500' : 'border-gray-300'
                                }`}
                            />
                            {errors.duration && (
                                <p className="text-red-600 text-sm mt-1">{errors.duration}</p>
                            )}
                        </div>
                    )}

                    {/* Notes with Word Counter */}
                    <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Detailed Notes * (minimum 50 words)
                            </label>
                            <span className={`text-sm font-medium ${wordCountColor}`}>
                                {wordCount} / 50 words
                            </span>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
                            <div
                                className={`h-1.5 rounded-full transition-all ${progressColor}`}
                                style={{ width: `${progressPercentage}%` }}
                            ></div>
                        </div>

                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            rows="6"
                            placeholder="Describe the interaction in detail. Include: customer's questions, concerns raised, information provided, next steps discussed, customer's current mindset, any objections, and your assessment of their interest level..."
                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none ${
                                errors.notes ? 'border-red-500' : 'border-gray-300'
                            }`}
                        />
                        {errors.notes && (
                            <p className="text-red-600 text-sm mt-1">{errors.notes}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                            💡 Tip: Include customer's specific questions, budget discussions, timeline preferences, and any concerns they raised.
                        </p>
                    </div>

                    {/* Next Follow-up Date */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Next Follow-up Date (optional)
                        </label>
                        <input
                            type="date"
                            name="nextFollowUpDate"
                            value={formData.nextFollowUpDate}
                            onChange={handleChange}
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1 px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || wordCount < 50}
                            className="flex-1 px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Saving...
                                </span>
                            ) : (
                                'Log Interaction'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CallLogModal;
