import { Link } from 'react-router-dom';
import privateImg from '../assets/features/private_sharing.png';
import aiImg from '../assets/features/ai_analysis.png';
import dataImg from '../assets/features/data_control.png';
import urbanImg from '../assets/features/urban_planning.png';
import eventImg from '../assets/features/event_surveying.png';
import productImg from '../assets/features/product_discovery.png';

const features = [
    {
        title: "Private Sharing",
        description: "Share polls securely with specific groups via encrypted unique links. Your community data stays within your trusted circle.",
        image: privateImg
    },
    {
        title: "AI Analysis",
        description: "Get instant sentiment analysis and key-point extraction from all responses. Turn thousands of voices into clear, actionable insights.",
        image: aiImg
    },
    {
        title: "Data Control and Privacy",
        description: "Completely own and control who sees your community data and when. Transparent ownership for empowering decisions.",
        image: dataImg
    }
];

const useCases = [
    {
        title: "Urban Planning",
        description: "Gather citizen feedback on new infrastructure or park developments. Visualizing the city's future through community collaboration.",
        image: urbanImg
    },
    {
        title: "Event Surveying",
        description: "Understand attendee satisfaction and gather improvement suggestions. From conferences to festivals, clarify every voice.",
        image: eventImg
    },
    {
        title: "Product Discovery",
        description: "Test new ideas directly with your core community and iterate fast. Insights that drive meaningful innovation.",
        image: productImg
    }
];

const PublicGallery = () => {
    return (
        <div style={{ background: 'var(--bg-dark)' }}>
            <section className="hero-banner">
                <h1 className="hero-headline">
                    Surveys,
                    <span className="hero-pill">
                        <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'currentColor', opacity: 0.5 }}></span>
                        insights,
                    </span>
                    <span className="hero-pill">
                        <svg width="24" height="12" viewBox="0 0 24 12" fill="none"><path d="M2 10C5 10 7 2 12 2C17 2 19 10 22 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                        and rewards
                    </span>
                    <br />
                    unite for a thrilling experience
                </h1>
                <p style={{ maxWidth: '600px' }}>
                    Delve into Pooly, where surveys, insights, and impactful decisions converge.
                    Join us in the fascinating world of community collaboration.
                </p>
                <div className="cta-group">
                    <Link to="/register" className="btn-premium">
                        Get started — it's free →
                    </Link>
                </div>
            </section>

            <div className="container">
                <section id="features" style={{ padding: '8rem 0' }}>
                    <h2 style={{ fontSize: '3rem', marginBottom: '3rem', textAlign: 'center' }}>Features</h2>
                    <div className="feature-grid">
                        {features.map((f, i) => (
                            <div key={i} className="premium-card">
                                <div className="premium-card-image">
                                    <img src={f.image} alt={f.title} />
                                </div>
                                <div className="premium-card-content">
                                    <h3>{f.title}</h3>
                                    <p>{f.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section id="use-cases" style={{ padding: '8rem 0' }}>
                    <h2 style={{ fontSize: '3rem', marginBottom: '3rem', textAlign: 'center' }}>Use cases</h2>
                    <div className="feature-grid">
                        {useCases.map((u, i) => (
                            <div key={i} className="premium-card">
                                <div className="premium-card-image" style={{ background: '#0e0e0e' }}>
                                    <img src={u.image} alt={u.title} />
                                </div>
                                <div className="premium-card-content">
                                    <h3>{u.title}</h3>
                                    <p>{u.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section id="walkthrough" style={{ padding: '8rem 0', textAlign: 'center' }}>
                    <h2 style={{ fontSize: '3.5rem', marginBottom: '1.5rem', fontWeight: '800' }}>Platform Walkthrough</h2>
                    <p style={{ color: 'var(--text-muted)', maxWidth: '750px', margin: '0 auto 4rem auto', fontSize: '1.2rem' }}>
                        Experience the most fluid way to gather and analyze community feedback.
                        From poll creation to AI insights, everything is designed for clarity.
                    </p>
                    <div className="glass-card" style={{ padding: '4rem', minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <p style={{ color: 'var(--text-muted)' }}>[ Walkthrough Video or Interactive Demo Placeholder ]</p>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default PublicGallery;
