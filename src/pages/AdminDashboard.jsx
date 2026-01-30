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

    // Calculate stats from events
    const getStats = () => {
        const totalEvents = events.length;
        const totalResponses = events.reduce((sum, e) => sum + (e.response_count || 0), 0);
        const now = new Date();
        const activeEvents = events.filter(e => new Date(e.end) >= now).length;
        const avgResponses = totalEvents > 0 ? Math.round(totalResponses / totalEvents) : 0;
        return { totalEvents, totalResponses, activeEvents, avgResponses };
    };

    // Get event status info
    const getEventStatus = (endDate) => {
        const now = new Date();
        const end = new Date(endDate);
        const diffDays = Math.ceil((end - now) / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
            return { label: 'Finalizada', class: 'ended', daysText: 'Terminó hace ' + Math.abs(diffDays) + ' días' };
        } else if (diffDays === 0) {
            return { label: 'Último día', class: 'urgent', daysText: 'Termina hoy' };
        } else if (diffDays <= 3) {
            return { label: 'Por cerrar', class: 'warning', daysText: `${diffDays} días restantes` };
        } else {
            return { label: 'Activa', class: 'active', daysText: `${diffDays} días restantes` };
        }
    };

    const stats = getStats();

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

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon stat-icon-primary">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                        </svg>
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{stats.totalEvents}</span>
                        <span className="stat-label">Encuestas totales</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon stat-icon-success">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                        </svg>
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{stats.totalResponses}</span>
                        <span className="stat-label">Respuestas totales</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon stat-icon-info">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                        </svg>
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{stats.activeEvents}</span>
                        <span className="stat-label">Encuestas activas</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon stat-icon-warning">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                        </svg>
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{stats.avgResponses}</span>
                        <span className="stat-label">Promedio respuestas</span>
                    </div>
                </div>
            </div>

            {error && (
                <div className="alert alert-error" style={{ background: 'var(--primary-50)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                    {error} (Mostrando datos de demostración)
                </div>
            )}

            {/* Section header for events list */}
            <div className="section-header">
                <h2 className="section-title">Mis encuestas</h2>
                <span className="section-count">{events.length} {events.length === 1 ? 'encuesta' : 'encuestas'}</span>
            </div>

            {events.length === 0 ? (
                <div className="empty-state-card">
                    <div className="empty-state-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                        </svg>
                    </div>
                    <h3 className="empty-state-title">Aún no tienes encuestas</h3>
                    <p className="empty-state-description">
                        Crea tu primera encuesta para comenzar a recolectar opiniones de tu comunidad.
                    </p>
                    <Link to="/admin/create" className="btn btn-primary">
                        Crear mi primera encuesta
                    </Link>
                </div>
            ) : (
                <div className="events-list">
                    {events.map(event => {
                        const status = getEventStatus(event.end);
                        return (
                            <div key={event.id} className="event-card-enhanced">
                                <div className="event-card-main">
                                    <div className="event-card-header">
                                        <h3 className="event-card-title">{event.name}</h3>
                                        <span className={`event-status-badge event-status-${status.class}`}>
                                            {status.label}
                                        </span>
                                    </div>
                                    <div className="event-card-stats">
                                        <div className="event-stat">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                                            </svg>
                                            <span>{event.response_count || 0} respuestas</span>
                                        </div>
                                        <div className="event-stat">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                                            </svg>
                                            <span>{status.daysText}</span>
                                        </div>
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
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
