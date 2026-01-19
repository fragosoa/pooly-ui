import { Link } from 'react-router-dom';

const PublicGallery = () => {
    return (
        <div style={{ paddingBottom: '6rem' }}>
            <section className="hero-banner">
                <h1 className="page-title">Citizen Voices</h1>
                <p>
                    A secure and private platform for citizen participation.
                    Empowering communities through transparent collaboration and AI-driven insights.
                </p>
                <div className="cta-group">
                    <Link to="/login" className="btn btn-primary" style={{ padding: '1rem 2rem' }}>
                        Admin Login
                    </Link>
                    <Link to="/register" className="btn btn-outline" style={{ padding: '1rem 2rem' }}>
                        Create Account
                    </Link>
                </div>
            </section>

            <div className="container">
                <div className="feature-grid">
                    <div className="glass-card feature-card">
                        <h3>Private & Secure</h3>
                        <p>
                            Events are shared privately via unique links. Your data is protected
                            and only accessible to authorized organizers.
                        </p>
                    </div>
                    <div className="glass-card feature-card">
                        <h3>Community Driven</h3>
                        <p>
                            Participate in urban planning, local initiatives, and community
                            projects directly from your browser.
                        </p>
                    </div>
                    <div className="glass-card feature-card">
                        <h3>AI powered Insights</h3>
                        <p>
                            Organizers gain deep understanding from citizen feedback through
                            advanced analysis and sentiment mapping.
                        </p>
                    </div>
                </div>

                <div style={{ marginTop: '6rem', textAlign: 'center' }}>
                    <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', fontWeight: '700' }}>Ready to shape the future?</h2>
                    <p style={{ color: 'var(--text-muted)', maxWidth: '700px', margin: '0 auto 3rem auto', fontSize: '1.1rem' }}>
                        Join thousands of citizens already participating in shaping their local environment.
                        Request a private link from your local organizer to get started.
                    </p>
                    <Link to="/register" className="btn btn-primary" style={{ fontSize: '1.1rem', padding: '1rem 3rem' }}>
                        Join the Movement
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default PublicGallery;
