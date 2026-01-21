import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user } = useAuth();

    useEffect(() => {
        const fetchUserEvents = async () => {
            try {
                const response = await api.get('/events');
                setEvents(response.data.events || []);
            } catch (err) {
                console.error('Failed to fetch user events:', err);
                setError('Failed to load your events.');
                // Mock data for admin demo
                setEvents([
                    { id: 1, name: 'Urban Mobility 2026', description: 'What do you think about the new bike lanes...', end: '2026-12-31', response_count: 45 },
                    { id: 4, name: 'Community Garden Survey', description: 'Should we expand the public garden?', end: '2026-05-30', response_count: 12 },
                ]);
            } finally {
                setLoading(false);
            }
        };
        fetchUserEvents();
    }, []);

    if (loading) return <div className="container"><p>Loading your dashboard...</p></div>;

    return (
        <div className="container" style={{ paddingBottom: '4rem' }}>
            <header style={{ margin: '3rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 className="page-title">Welcome, {user?.username}</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Manage your community events and analyze responses.</p>
                </div>
                <Link to="/admin/create" className="btn btn-primary">
                    <span style={{ fontSize: '1.5rem', lineHeight: '1' }}>+</span> Create New Event
                </Link>
            </header>

            {error && (
                <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--glass-border)', padding: '1rem', borderRadius: '8px', marginBottom: '2rem', color: 'var(--text-muted)' }}>
                    {error} (Showing demo data)
                </div>
            )}

            {events.length === 0 ? (
                <div className="glass-card" style={{ padding: '4rem', textAlign: 'center' }}>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>You haven't created any events yet.</p>
                    <Link to="/admin/create" className="btn btn-primary">Create Your First Event</Link>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
                    {events.map(event => (
                        <div key={event.id} className="glass-card" style={{ padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'var(--transition)' }}>
                            <div>
                                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{event.name}</h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                    Ends: {new Date(event.end).toLocaleDateString()} • {event.response_count || 0} responses
                                </p>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <Link to={`/admin/events/${event.id}`} className="btn btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                                    View Details
                                </Link>
                                <button className="btn btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', borderColor: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }}>
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
