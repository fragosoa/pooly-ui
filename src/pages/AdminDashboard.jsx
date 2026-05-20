import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import Modal from '../components/Modal';

const AdminDashboard = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user } = useAuth();
    const { t } = useLanguage();
    const navigate = useNavigate();

    // Delete modal state
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [eventToDelete, setEventToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);

    // Open action menu per card
    const [openMenuId, setOpenMenuId] = useState(null);
    const menuRef = useRef(null);

    const getEventSource = (event) => {
        const rawSource = event?.source_type || event?.source || event?.origin;
        if (rawSource === 'imported' || rawSource === 'import') return 'imported';
        return 'online';
    };

    useEffect(() => {
        const fetchUserEvents = async () => {
            try {
                const response = await api.get('/events');
                setEvents(response.data.events || []);
            } catch (err) {
                console.error('Failed to fetch user events:', err);
                setError(t('admin.errorLoad'));
                setEvents([
                    { id: 1, name: 'Movilidad Urbana 2026', description: '¿Qué opinas sobre las nuevas ciclovías...', end: '2026-12-31', response_count: 45, source_type: 'online', is_paused: false },
                    { id: 4, name: 'Feedback asistentes Summit Norte', description: 'Resultados importados desde SurveyMonkey para análisis cualitativo.', end: '2026-05-30', response_count: 128, source_type: 'imported', source_name: 'SurveyMonkey', is_paused: false },
                ]);
            } finally {
                setLoading(false);
            }
        };
        fetchUserEvents();
    }, []);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setOpenMenuId(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getStats = () => {
        const totalEvents = events.length;
        const totalResponses = events.reduce((sum, e) => sum + (e.response_count || 0), 0);
        const now = new Date();
        const activeEvents = events.filter(e => new Date(e.end) >= now).length;
        const avgResponses = totalEvents > 0 ? Math.round(totalResponses / totalEvents) : 0;
        return { totalEvents, totalResponses, activeEvents, avgResponses };
    };

    const getEventStatus = (endDate, isPaused) => {
        if (isPaused) {
            return { label: t('admin.paused'), class: 'paused', daysText: t('admin.paused') };
        }
        const now = new Date();
        const end = new Date(endDate);
        const diffDays = Math.ceil((end - now) / (1000 * 60 * 60 * 24));

        if (diffDays >= 365 * 15) {
            return { label: t('status.alwaysOpen'), class: 'active', daysText: t('status.alwaysOpenText') };
        } else if (diffDays < 0) {
            return { label: t('status.ended'), class: 'ended', daysText: t('status.endedDays', { days: Math.abs(diffDays) }) };
        } else if (diffDays === 0) {
            return { label: t('status.lastDay'), class: 'urgent', daysText: t('status.endsToday') };
        } else if (diffDays <= 3) {
            return { label: t('status.closing'), class: 'warning', daysText: t('status.daysLeft', { days: diffDays }) };
        } else {
            return { label: t('status.active'), class: 'active', daysText: t('status.daysLeft', { days: diffDays }) };
        }
    };

    const stats = getStats();

    const handleCardClick = (eventId) => {
        navigate(`/admin/events/${eventId}`);
    };

    const handleMenuToggle = (e, eventId) => {
        e.stopPropagation();
        setOpenMenuId(prev => prev === eventId ? null : eventId);
    };

    const handleDeleteClick = (e, event) => {
        e.stopPropagation();
        setOpenMenuId(null);
        setEventToDelete(event);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        if (!eventToDelete) return;
        setDeleting(true);
        try {
            const response = await api.delete(`/events/${eventToDelete.id}`);
            if (response.data.status === 'success') {
                setEvents(prev => prev.filter(e => e.id !== eventToDelete.id));
                setShowDeleteModal(false);
                setEventToDelete(null);
                toast.success(t('admin.deleteSuccess'));
            } else {
                toast.error(response.data.message || t('admin.deleteError'));
                setShowDeleteModal(false);
                setEventToDelete(null);
            }
        } catch (err) {
            console.error('Failed to delete event:', err);
            setShowDeleteModal(false);
            setEventToDelete(null);
            toast.error(err.response?.data?.message || t('admin.deleteErrorGeneric'));
        } finally {
            setDeleting(false);
        }
    };

    const handleDeleteCancel = () => {
        setShowDeleteModal(false);
        setEventToDelete(null);
    };

    const handlePauseToggle = async (e, event) => {
        e.stopPropagation();
        setOpenMenuId(null);
        const newPaused = !event.is_paused;
        // Optimistic update
        setEvents(prev => prev.map(ev => ev.id === event.id ? { ...ev, is_paused: newPaused } : ev));
        try {
            await api.patch(`/events/${event.id}`, { is_paused: newPaused });
            toast.success(newPaused ? t('admin.pauseSuccess') : t('admin.resumeSuccess'));
        } catch (err) {
            // Revert on error
            setEvents(prev => prev.map(ev => ev.id === event.id ? { ...ev, is_paused: !newPaused } : ev));
            toast.error(t('admin.pauseError'));
        }
    };

    const handleDuplicate = async (e, event) => {
        e.stopPropagation();
        setOpenMenuId(null);
        const toastId = toast.loading(t('admin.duplicate') + '...');
        try {
            const response = await api.post(`/events/${event.id}/duplicate`);
            const newEvent = response.data.event || response.data;
            setEvents(prev => [newEvent, ...prev]);
            toast.success(t('admin.duplicateSuccess'), { id: toastId });
        } catch (err) {
            toast.error(t('admin.duplicateError'), { id: toastId });
        }
    };

    const handleEditClick = (e, eventId) => {
        e.stopPropagation();
        setOpenMenuId(null);
        navigate(`/admin/events/${eventId}/edit`);
    };

    if (loading) {
        return (
            <div className="container" style={{ paddingTop: '7rem', paddingBottom: '4rem' }}>
                <div className="dashboard-header">
                    <div>
                        <div className="skeleton" style={{ width: '220px', height: '2rem', marginBottom: '0.5rem' }} />
                        <div className="skeleton" style={{ width: '320px', height: '1rem' }} />
                    </div>
                </div>
                <div className="stats-grid" style={{ marginTop: '2rem' }}>
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="stat-card">
                            <div className="skeleton" style={{ width: '48px', height: '48px', borderRadius: '12px' }} />
                            <div style={{ flex: 1 }}>
                                <div className="skeleton" style={{ width: '60px', height: '1.8rem', marginBottom: '0.4rem' }} />
                                <div className="skeleton" style={{ width: '100px', height: '0.8rem' }} />
                            </div>
                        </div>
                    ))}
                </div>
                <div className="events-grid" style={{ marginTop: '2rem' }}>
                    {[1, 2, 3].map(i => (
                        <div key={i} className="survey-card" style={{ pointerEvents: 'none' }}>
                            <div className="skeleton" style={{ width: '70px', height: '1.4rem', borderRadius: '20px', marginBottom: '1rem' }} />
                            <div className="skeleton" style={{ width: '80%', height: '1.2rem', marginBottom: '0.5rem' }} />
                            <div className="skeleton" style={{ width: '95%', height: '0.9rem', marginBottom: '0.3rem' }} />
                            <div className="skeleton" style={{ width: '60%', height: '0.9rem' }} />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="container" style={{ paddingTop: '7rem', paddingBottom: '4rem' }}>
            <header className="dashboard-header">
                <div>
                    <h1 className="page-title">{t('admin.hello', { username: user?.username })}</h1>
                    <p className="page-subtitle" style={{ marginBottom: 0 }}>
                        {t('admin.subtitle')}
                    </p>
                </div>
            </header>

            <section className="dashboard-entry-grid">
                <Link to="/admin/create" className="dashboard-entry-card">
                    <div className="dashboard-entry-icon" aria-hidden="true">
                        <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 10.5v6m3-3H9" />
                        </svg>
                    </div>
                    <div className="dashboard-entry-content">
                        <h2>{t('admin.entryCreateTitle')}</h2>
                        <p>{t('admin.entryCreateDesc')}</p>
                    </div>
                </Link>

                <Link to="/admin/import" className="dashboard-entry-card dashboard-entry-card-accent">
                    <div className="dashboard-entry-icon" aria-hidden="true">
                        <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v12m0 0l4.5-4.5M12 15l-4.5-4.5M4.5 16.5v.75A2.25 2.25 0 006.75 19.5h10.5a2.25 2.25 0 002.25-2.25v-.75" />
                        </svg>
                    </div>
                    <div className="dashboard-entry-content">
                        <h2>{t('admin.entryImportTitle')}</h2>
                        <p>{t('admin.entryImportDesc')}</p>
                    </div>
                </Link>
            </section>

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
                        <span className="stat-label">{t('admin.statTotal')}</span>
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
                        <span className="stat-label">{t('admin.statResponses')}</span>
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
                        <span className="stat-label">{t('admin.statActive')}</span>
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
                        <span className="stat-label">{t('admin.statAvg')}</span>
                    </div>
                </div>
            </div>

            {error && (
                <div className="alert alert-error" style={{ background: 'var(--primary-50)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                    {error} ({t('admin.errorDemo')})
                </div>
            )}

            <div className="dashboard-section-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <h2 className="section-title">{t('admin.sectionTitle')}</h2>
                    <span className="section-count">
                        {events.length} {events.length === 1 ? t('admin.project') : t('admin.projects')}
                    </span>
                </div>
            </div>

            {/* Mobile FAB */}
            <Link to="/admin/create" className="fab" aria-label={t('admin.newSurvey')}>
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
            </Link>

            {events.length === 0 ? (
                <div className="empty-state-card">
                    <div className="empty-state-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                        </svg>
                    </div>
                    <h3 className="empty-state-title">{t('admin.emptyTitle')}</h3>
                    <p className="empty-state-description">{t('admin.emptyDesc')}</p>
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                        <Link to="/admin/create" className="btn btn-primary">
                            {t('admin.createFirst')}
                        </Link>
                        <Link to="/admin/import" className="btn btn-outline">
                            {t('admin.importResults')}
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="events-grid" ref={menuRef}>
                    {events.map(event => {
                        const status = getEventStatus(event.end, event.is_paused);
                        const source = getEventSource(event);
                        const isMenuOpen = openMenuId === event.id;
                        return (
                            <article
                                key={event.id}
                                className={`survey-card${event.is_paused ? ' survey-card-paused' : ''}`}
                                onClick={() => handleCardClick(event.id)}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => e.key === 'Enter' && handleCardClick(event.id)}
                            >
                                {/* Three-dot actions menu */}
                                <div className="survey-card-menu-wrapper">
                                    <button
                                        className="survey-card-menu-btn"
                                        onClick={(e) => handleMenuToggle(e, event.id)}
                                        aria-label="Opciones"
                                        aria-expanded={isMenuOpen}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
                                        </svg>
                                    </button>

                                    {isMenuOpen && (
                                        <div className="survey-card-dropdown">
                                            <button className="survey-card-dropdown-item" onClick={(e) => handleEditClick(e, event.id)}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                                </svg>
                                                {t('admin.edit')}
                                            </button>

                                            <button className="survey-card-dropdown-item" onClick={(e) => handleDuplicate(e, event)}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
                                                </svg>
                                                {t('admin.duplicate')}
                                            </button>

                                            <button className="survey-card-dropdown-item" onClick={(e) => handlePauseToggle(e, event)}>
                                                {event.is_paused ? (
                                                    <>
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                                                        </svg>
                                                        {t('admin.resume')}
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
                                                        </svg>
                                                        {t('admin.pause')}
                                                    </>
                                                )}
                                            </button>

                                            <div className="survey-card-dropdown-divider" />

                                            <button className="survey-card-dropdown-item survey-card-dropdown-item-danger" onClick={(e) => handleDeleteClick(e, event)}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                                </svg>
                                                {t('admin.delete')}
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <span className={`survey-card-status survey-card-status-${status.class}`}>
                                    {status.label}
                                </span>

                                <span className={`survey-card-source-badge survey-card-source-${source}`}>
                                    {source === 'imported' ? t('source.imported') : t('source.online')}
                                </span>

                                <div className="survey-card-content">
                                    <h3 className="survey-card-title">{event.name}</h3>
                                    {event.description && (
                                        <p className="survey-card-description">{event.description}</p>
                                    )}
                                    {source === 'imported' && event.source_name && (
                                        <p className="survey-card-meta">{t('admin.importedFrom', { source: event.source_name })}</p>
                                    )}
                                </div>

                                <div className="survey-card-footer">
                                    <div className="survey-card-stat">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                                        </svg>
                                        <span>{event.response_count || 0}</span>
                                    </div>
                                    <div className="survey-card-stat">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                                        </svg>
                                        <span>{status.daysText}</span>
                                    </div>
                                </div>

                                <div className="survey-card-tap-hint">
                                    <span>{t('admin.tapHint')}</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                                    </svg>
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={showDeleteModal}
                onClose={handleDeleteCancel}
                title={t('admin.deleteModalTitle')}
                footer={
                    <div className="modal-actions">
                        <button className="btn btn-secondary" onClick={handleDeleteCancel} disabled={deleting}>
                            {t('admin.cancel')}
                        </button>
                        <button className="btn btn-danger" onClick={handleDeleteConfirm} disabled={deleting}>
                            {deleting ? t('admin.deleting') : t('admin.delete')}
                        </button>
                    </div>
                }
            >
                <div className="modal-confirm-content">
                    <div className="modal-icon modal-icon-danger">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                        </svg>
                    </div>
                    <p className="modal-message">
                        {t('admin.deleteModalMessage', { name: eventToDelete?.name })}
                    </p>
                    <div className="modal-warning-box">
                        <p>{t('admin.deleteWarning')}</p>
                        <ul>
                            <li>{t('admin.deleteItem1')}</li>
                            <li>{t('admin.deleteItem2', { count: eventToDelete?.response_count || 0 })}</li>
                            <li>{t('admin.deleteItem3')}</li>
                        </ul>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default AdminDashboard;
