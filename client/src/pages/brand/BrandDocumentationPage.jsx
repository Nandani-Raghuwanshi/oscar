import React, { useState } from 'react';

/**
 * BrandDocumentationPage
 * Multi-tab documentation interface for brand advocates
 * Provides access to project overview, documents, and helpful resources
 */
const BrandDocumentationPage = () => {
    const [activeTab, setActiveTab] = useState('overview');

    const tabs = [
        {
            id: 'overview',
            label: 'Overview',
            icon: '📋',
        },
        {
            id: 'resources',
            label: 'Resources',
            icon: '📚',
        },
        {
            id: 'referral-guide',
            label: 'Referral Guide',
            icon: '🎯',
        },
        {
            id: 'rewards',
            label: 'Rewards Program',
            icon: '🎁',
        },
    ];

    const overviewContent = [
        {
            title: 'What is a Brand Advocate?',
            content: `A Brand Advocate is a business professional who helps promote a real estate project to their network. 
            You earn rewards when referrals lead to actual sales conversions. It's a great way to generate additional income 
            while building professional relationships.`,
        },
        {
            title: 'Your Role',
            content: `As a Brand Advocate, you're responsible for:
- Identifying and referring potential buyers to your assigned project
- Providing referral details accurately (name, phone, email, location)
- Tracking referral status and conversion progress
- Following up on referred prospects as needed
- Claiming earned rewards when referrals convert`,
        },
        {
            title: 'Getting Started',
            content: `1. Review your assigned project details (go to the Project tab)
2. Understand the pricing and target market
3. Start submitting referrals through the Referrals tab
4. Monitor referral status and pending conversions
5. Claim your rewards when referrals convert to sales`,
        },
    ];

    const resourcesContent = [
        {
            title: 'Project Marketing Materials',
            description: 'Download project brochures, presentation decks, and marketing assets from the Project tab',
            icon: '📁',
        },
        {
            title: 'Referral Forms',
            description: 'Standard forms for capturing referral information and customer consent',
            icon: '📝',
        },
        {
            title: 'FAQ & Support',
            description: 'Frequently asked questions about the referral program and how to maximize your earnings',
            icon: '❓',
        },
        {
            title: 'Contact Sales Team',
            description: 'Get in touch with the sales team for project-specific questions or referral support',
            icon: '📞',
        },
    ];

    const referralGuideContent = [
        {
            title: 'How to Submit a Referral',
            steps: [
                'Go to the Referrals tab',
                'Click "Submit New Referral"',
                'Enter the prospect\'s details (name and phone are required)',
                'Add additional information if available (email, city, notes)',
                'Submit the form',
            ],
        },
        {
            title: 'Referral Status Workflow',
            steps: [
                'Pending: Your referral has been submitted and is awaiting initial contact',
                'Contacted: Sales team has reached out to the prospect',
                'Qualified: Prospect has shown genuine buying interest',
                'Converted: Prospect has completed the purchase',
                'Lost: Prospect did not proceed with purchase',
            ],
        },
        {
            title: 'Tips for Successful Referrals',
            steps: [
                'Refer people you know who are genuinely interested in real estate',
                'Provide accurate contact information',
                'Share project details and pricing with referrals',
                'Follow up with referred prospects to encourage them',
                'Quality referrals convert faster and better than random submissions',
            ],
        },
        {
            title: 'What Qualifies as a Referral?',
            steps: [
                'Anyone you personally know or refer to the project',
                'Must be a potential buyer interested in the property type',
                'Must provide their contact information in the system',
                'Must be a first-time referral from you (no duplicates)',
                'Should not already be a customer of the project',
            ],
        },
    ];

    const rewardsContent = [
        {
            title: 'How You Earn Rewards',
            content: `When your referral converts to a purchase:
1. Your referral status changes to "Converted"
2. A reward is automatically generated and marked as "Earned"
3. The reward amount is calculated based on the property price and reward structure
4. Rewards appear in your Rewards dashboard`,
        },
        {
            title: 'Reward Status Workflow',
            content: `Earned → Your referral converted and reward was created
Processed → Management has verified the sale and processed the reward
Claimed → You have requested payment/redemption
Expired → Reward validity period has passed (if applicable)`,
        },
        {
            title: 'Redemption Methods',
            content: `You can redeem your rewards through:
1. Bank Transfer: Direct deposit to your bank account (fastest method)
2. Digital Wallet: Credit to a digital payment account
3. Check: Physical check mailed to your address`,
        },
        {
            title: 'Claim Your Rewards',
            content: `Once a reward reaches "Processed" status:
1. Go to the Rewards tab
2. Find the processed reward you want to claim
3. Click "Claim Reward"
4. Choose your redemption method (bank transfer recommended)
5. Provide the necessary details
6. Submit to complete the claim`,
        },
    ];

    return (
        <div className="max-w-6xl mx-auto px-6 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">Documentation & Guides</h1>
                <p className="text-gray-600 text-lg">Everything you need to know about being a Brand Advocate</p>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow">
                <div className="border-b flex overflow-x-auto">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 px-6 py-4 font-semibold border-b-2 transition whitespace-nowrap ${activeTab === tab.id
                                    ? 'text-blue-600 border-blue-600'
                                    : 'text-gray-600 border-transparent hover:text-gray-900'
                                }`}
                        >
                            <span className="mr-2">{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="p-8">
                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                        <div className="space-y-8">
                            {overviewContent.map((section, idx) => (
                                <div key={idx}>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-4">{section.title}</h2>
                                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                        {section.content}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Resources Tab */}
                    {activeTab === 'resources' && (
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Resources</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {resourcesContent.map((resource, idx) => (
                                    <div
                                        key={idx}
                                        className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition cursor-pointer"
                                    >
                                        <div className="text-4xl mb-3">{resource.icon}</div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                            {resource.title}
                                        </h3>
                                        <p className="text-gray-600">
                                            {resource.description}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Referral Guide Tab */}
                    {activeTab === 'referral-guide' && (
                        <div className="space-y-8">
                            {referralGuideContent.map((guide, idx) => (
                                <div key={idx}>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-4">{guide.title}</h2>
                                    <ol className="space-y-3">
                                        {guide.steps.map((step, stepIdx) => (
                                            <li
                                                key={stepIdx}
                                                className="flex gap-4 items-start bg-blue-50 p-4 rounded-lg"
                                            >
                                                <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                                                    {stepIdx + 1}
                                                </span>
                                                <span className="text-gray-700 pt-1">{step}</span>
                                            </li>
                                        ))}
                                    </ol>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Rewards Tab */}
                    {activeTab === 'rewards' && (
                        <div className="space-y-8">
                            {rewardsContent.map((section, idx) => (
                                <div key={idx}>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-4">{section.title}</h2>
                                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
                                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                            {section.content}
                                        </p>
                                    </div>
                                </div>
                            ))}

                            {/* Reward Structure Box */}
                            <div className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-8">
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">💰 Reward Structure</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="bg-white rounded p-4 border border-green-200">
                                        <p className="text-sm text-gray-600 font-medium mb-1">REFERRAL CONVERSION</p>
                                        <p className="text-xl font-bold text-green-600">
                                            0.5-1% of<br />Property Price
                                        </p>
                                    </div>
                                    <div className="bg-white rounded p-4 border border-green-200">
                                        <p className="text-sm text-gray-600 font-medium mb-1">EXAMPLE</p>
                                        <p className="text-xl font-bold text-green-600">
                                            ₹50 Lakhs Property<br />= ₹25,000-50,000 Reward
                                        </p>
                                    </div>
                                    <div className="bg-white rounded p-4 border border-green-200">
                                        <p className="text-sm text-gray-600 font-medium mb-1">PAYMENT TIMELINE</p>
                                        <p className="text-xl font-bold text-green-600">
                                            Within 30 Days<br />of Sale Processing
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Help Section */}
            <div className="mt-8 bg-blue-50 border-2 border-blue-200 rounded-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">🤔 Need Help?</h2>
                <p className="text-gray-700 mb-4">
                    If you have questions or need support, please reach out to our Brand Advocate support team:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white rounded p-4 border border-blue-200">
                        <p className="text-sm text-gray-600 mb-1">📧 Email</p>
                        <p className="text-lg font-semibold text-blue-600">advocates@builtcred.com</p>
                    </div>
                    <div className="bg-white rounded p-4 border border-blue-200">
                        <p className="text-sm text-gray-600 mb-1">📞 Phone</p>
                        <p className="text-lg font-semibold text-blue-600">+91 1234-567-890</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BrandDocumentationPage;
