import { useState, useEffect } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';

const PublicGallery = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await api.get('/events/active');
                setEvents(response.data);
            } catch (err) {
                console.error('Failed to fetch events:', err);
                setError('Could not load active events. Please try again later.');
                // Mock data for visual verification if API fails
                setEvents([
                    { id: 1, name: 'Urban Mobility 2026', description: 'What do you think about the new bike lanes in the city center?', end_date: '2026-12-31' },
                    { id: 2, name: 'Green Spaces Initiative', description: 'Help us decide which parks need more trees.', end_date: '2026-06-15' },
                    { id: 3, name: 'Digital Citizenship', description: 'Share your thoughts on the new digital voting platform.', end_date: '2026-08-20' },
                ]);
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    if (loading) return <div className="container" style={{ marginTop: '4rem' }}><p>Loading events...</p></div>;

    return (
        <div style={{ paddingBottom: '4rem' }}>
            <section className="hero-banner">
                <h1 className="page-title">Citizen Voices</h1>
                <p>
                    Participate in active events and help shape the future of our community.
                </p>
            </section>

            <div className="container">

                {error && (
                    <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--glass-border)', padding: '1rem', borderRadius: '8px', marginBottom: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        {error} (Showing demo events)
                    </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
                    {events.map(event => (
                        <div key={event.id} className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', transition: 'var(--transition)' }}>
                            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>{event.name}</h2>
                            <p style={{ color: 'var(--text-muted)', flex: 1, marginBottom: '2rem' }}>{event.description}</p>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                                <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                    Ends: {new Date(event.end_date).toLocaleDateString()}
                                </span>
                                <Link to={`/submit/${event.id}`} className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                                    Respond
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PublicGallery;
