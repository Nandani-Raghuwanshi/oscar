import React from 'react'

export default function About() {
    return (
        <div className='container'>
            <div className='about-content'>
                <h1>About BuiltCred</h1>

                <section className='about-section'>
                    <h2>Our Mission</h2>
                    <p>
                        BuiltCred is a referral management system designed to empower real estate advocates
                        (project owners and brand advocates) to share properties and earn attractive rewards
                        when their referrals convert into customers.
                    </p>
                </section>

                <section className='about-section'>
                    <h2>Key Features</h2>
                    <ul className='features-list'>
                        <li>
                            <strong>Multi-Channel Support:</strong> WhatsApp, SMS, Email, QR Code, and Web links
                        </li>
                        <li>
                            <strong>Smart Attribution:</strong> First-touch and last-touch attribution for fair reward distribution
                        </li>
                        <li>
                            <strong>CRM Integration:</strong> Seamless sync with Salesforce, HubSpot, and Zoho
                        </li>
                        <li>
                            <strong>Real-Time Analytics:</strong> Track referrals, conversions, and reward metrics
                        </li>
                        <li>
                            <strong>Tiered Rewards:</strong> Transparent reward calculations based on property value
                        </li>
                    </ul>
                </section>

                <section className='about-section'>
                    <h2>Advocate Types</h2>
                    <div className='advocate-types'>
                        <div className='advocate-card'>
                            <h3>📍 Project Advocates</h3>
                            <p>
                                Residents of a specific project who refer other customers
                                to their project or other projects by the same developer.
                            </p>
                        </div>
                        <div className='advocate-card'>
                            <h3>🏢 Brand Advocates</h3>
                            <p>
                                Existing customers of a developer who can refer to any
                                project by the same developer.
                            </p>
                        </div>
                    </div>
                </section>

                <section className='about-section'>
                    <h2>Technology Stack</h2>
                    <div className='tech-stack'>
                        <div className='tech-item'>
                            <strong>Frontend:</strong> React + Vite + React Router
                        </div>
                        <div className='tech-item'>
                            <strong>Backend:</strong> Flask + Python
                        </div>
                        <div className='tech-item'>
                            <strong>Database:</strong> MongoDB
                        </div>
                        <div className='tech-item'>
                            <strong>Integrations:</strong> Salesforce, HubSpot, Zoho, Twilio, SendGrid
                        </div>
                    </div>
                </section>
            </div>
        </div>
    )
}
