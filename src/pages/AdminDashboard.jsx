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
                setError('No se pudieron cargar tus eventos.');
                setEvents([
                    { id: 1, name: 'Movilidad Urbana 2026', description: '¿Qué opinas sobre las nuevas ciclovías...', end: '2026-12-31', response_count: 45 },
                    { id: 4, name: 'Encuesta del Jardín Comunitario', description: '¿Deberíamos expandir el jardín público?', end: '2026-05-30', response_count: 12 },
                ]);
            } finally {
                setLoading(false);
            }
        };
        fetchUserEvents();
    }, []);

    if (loading) {
        return (
            <div className="container" style={{ paddingTop: '8rem', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-secondary)' }}>Cargando tu panel de control...</p>
            </div>
        );
    }

    return (
        <div className="container" style={{ paddingTop: '7rem', paddingBottom: '4rem' }}>
            <header className="dashboard-header">
                <div>
                    <h1 className="page-title">Hola, {user?.username}</h1>
                    <p className="page-subtitle" style={{ marginBottom: 0 }}>
                        Gestiona tus encuestas y analiza las respuestas de tu comunidad.
                    </p>
                </div>
                <Link to="/admin/create" className="btn btn-primary">
                    + Nueva encuesta
                </Link>
            </header>

            {error && (
                <div className="alert alert-error" style={{ background: 'var(--primary-50)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                    {error} (Mostrando datos de demostración)
                </div>
            )}

            {events.length === 0 ? (
                <div className="card" style={{ padding: '4rem', textAlign: 'center' }}>
                    <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                        Aún no tienes encuestas
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                        Crea tu primera encuesta para comenzar a recolectar opiniones.
                    </p>
                    <Link to="/admin/create" className="btn btn-primary">
                        Crear mi primera encuesta
                    </Link>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {events.map(event => (
                        <div key={event.id} className="event-card">
                            <div>
                                <h3>{event.name}</h3>
                                <div className="event-card-meta">
                                    <span>Finaliza: {new Date(event.end).toLocaleDateString('es-MX')}</span>
                                    <span>{event.response_count || 0} respuestas</span>
                                </div>
                            </div>
                            <div className="event-card-actions">
                                <Link
                                    to={`/admin/events/${event.id}`}
                                    className="btn btn-secondary"
                                    style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                                >
                                    Ver detalles
                                </Link>
                                <button
                                    className="btn btn-outline"
                                    style={{
                                        padding: '0.5rem 1rem',
                                        fontSize: '0.875rem',
                                        color: 'var(--error)',
                                        borderColor: 'var(--error-light)'
                                    }}
                                >
                                    Eliminar
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
