import React from 'react';

/**
 * Reusable stats card component for displaying metrics
 * Used in CRM dashboards and summary views
 */
const StatsCard = ({ 
    title, 
    value, 
    icon, 
    trend, 
    trendValue, 
    color = 'blue',
    subtitle,
    loading = false 
}) => {
    const colorClasses = {
        blue: 'bg-blue-50 text-blue-600 border-blue-200',
        green: 'bg-green-50 text-green-600 border-green-200',
        yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
        red: 'bg-red-50 text-red-600 border-red-200',
        purple: 'bg-purple-50 text-purple-600 border-purple-200',
        indigo: 'bg-indigo-50 text-indigo-600 border-indigo-200',
        gray: 'bg-gray-50 text-gray-600 border-gray-200'
    };

    const trendClasses = {
        up: 'text-green-600 bg-green-50',
        down: 'text-red-600 bg-red-50',
        neutral: 'text-gray-600 bg-gray-50'
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                    {title}
                </h3>
                {icon && (
                    <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
                        {icon}
                    </div>
                )}
            </div>

            <div className="mb-2">
                <p className="text-3xl font-bold text-gray-900">
                    {value?.toLocaleString() || '0'}
                </p>
            </div>

            <div className="flex items-center justify-between">
                {subtitle && (
                    <p className="text-sm text-gray-500">{subtitle}</p>
                )}
                
                {trend && trendValue && (
                    <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${trendClasses[trend]}`}>
                        {trend === 'up' && (
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                        )}
                        {trend === 'down' && (
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                        )}
                        {trendValue}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StatsCard;
