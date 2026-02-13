import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function NotFound() {
    const navigate = useNavigate()

    return (
        <div className='container'>
            <div className='not-found-content'>
                <div className='not-found-icon'>404</div>
                <h1>Page Not Found</h1>
                <p className='not-found-message'>The page you're looking for doesn't exist or has been moved.</p>

                <div className='not-found-suggestions'>
                    <p>Here are some helpful suggestions:</p>
                    <ul>
                        <li>
                            <button className='link-button' onClick={() => navigate('/')}>
                                Go to Home Page
                            </button>
                        </li>
                        <li>
                            <button className='link-button' onClick={() => navigate('/about')}>
                                Learn About BuiltCred
                            </button>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    )
}
