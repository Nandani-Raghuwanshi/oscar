import { Link } from 'react-router-dom';

export default function NotFound() {
    return (
        <main>
            <div className="container">
                <div className="content-box" style={{ textAlign: 'center', padding: '60px 30px' }}>
                    <h1 style={{ fontSize: '4rem', color: '#667eea', marginBottom: '20px' }}>404</h1>
                    <h2>Page Not Found</h2>
                    <p className="description">
                        Sorry, the page you're looking for doesn't exist. Please check the URL or navigate back to home.
                    </p>
                    <Link
                        to="/"
                        style={{
                            display: 'inline-block',
                            marginTop: '20px',
                            padding: '10px 30px',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            textDecoration: 'none',
                            borderRadius: '4px',
                            transition: 'transform 0.3s ease'
                        }}
                        onMouseEnter={(e) => (e.target.style.transform = 'scale(1.05)')}
                        onMouseLeave={(e) => (e.target.style.transform = 'scale(1)')}
                    >
                        Go Back Home
                    </Link>
                </div>
            </div>
        </main>
    );
}
