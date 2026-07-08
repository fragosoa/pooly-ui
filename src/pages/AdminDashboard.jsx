import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import Modal from '../components/Modal';
import Icon from '../components/Icon';

const AdminDashboard = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [suggestedAction, setSuggestedAction] = useState(null);
    const { user } = useAuth();
    const { t } = useLanguage();
    const navigate = useNavigate();

    // Delete modal state
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [eventToDelete, setEventToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);

    // Open action menu per row
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
                    { id: 1, name: 'Feedback post-compra — Marzo', description: '¿Qué te hizo dudar antes de comprar?', end: '2026-12-31', response_count: 45, source_type: 'online', is_paused: false },
                    { id: 4, name: 'Feedback asistentes Summit Norte', description: 'Resultados importados desde SurveyMonkey para análisis cualitativo.', end: '2026-05-30', response_count: 128, source_type: 'imported', source_name: 'SurveyMonkey', is_paused: false },
                ]);
            } finally {
                setLoading(false);
            }
        };
        fetchUserEvents();
    }, []);

    // Opportunistically surface a high-impact recommendation from the most
    // active survey as the "suggested action" highlight band. Best-effort:
    // silently skip the band if there's no data or the call fails.
    useEffect(() => {
        if (loading || events.length === 0) return;
        const candidate = [...events].sort((a, b) => (b.response_count || 0) - (a.response_count || 0))[0];
        if (!candidate) return;
        (async () => {
            try {
                const res = await api.get(`/events/${candidate.id}/recommendations`);
                const recs = res.data?.recommendations || res.data || [];
                const top = recs.find(r => r.impact_level === 'high') || null;
                if (top) setSuggestedAction({ event: candidate, recommendation: top });
            } catch {
                // No recommendations yet for this event — just don't show the band.
            }
        })();
    }, [loading, events]);

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
    const firstName = (user?.username || '').split(' ')[0];

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
            await api.post(`/events/${event.id}/duplicate`);
            const refreshed = await api.get('/events');
            setEvents(refreshed.data.events || []);
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
                <div className="events-list" style={{ marginTop: '2rem' }}>
                    {[1, 2, 3].map(i => (
                        <div key={i} className="event-card-enhanced" style={{ pointerEvents: 'none' }}>
                            <div style={{ flex: 1 }}>
                                <div className="skeleton" style={{ width: '60%', height: '1.2rem', marginBottom: '0.5rem' }} />
                                <div className="skeleton" style={{ width: '80%', height: '0.9rem' }} />
                            </div>
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
                    <h1 className="page-title">{t('admin.hello', { username: firstName })}</h1>
                    <p className="page-subtitle" style={{ marginBottom: 0 }}>
                        {t('admin.subtitle')}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <Link to="/admin/import" className="btn btn-outline">
                        {t('admin.importResults')}
                    </Link>
                    <Link to="/admin/create" className="btn btn-action">
                        <Icon name="plus" size={17} />
                        {t('admin.newSurvey')}
                    </Link>
                </div>
            </header>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon stat-icon-primary">
                        <Icon name="clipboard" size={22} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{stats.totalEvents}</span>
                        <span className="stat-label">{t('admin.statTotal')}</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon stat-icon-info">
                        <Icon name="message" size={22} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{stats.totalResponses.toLocaleString()}</span>
                        <span className="stat-label">{t('admin.statResponses')}</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon stat-icon-success">
                        <Icon name="activity" size={22} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{stats.activeEvents}</span>
                        <span className="stat-label">{t('admin.statActive')}</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon stat-icon-warning">
                        <Icon name="timer" size={22} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{stats.avgResponses}</span>
                        <span className="stat-label">{t('admin.statAvg')}</span>
                    </div>
                </div>
            </div>

            {error && (
                <div className="alert alert-info">
                    {error} ({t('admin.errorDemo')})
                </div>
            )}

            {/* Suggested action — top high-impact recommendation, when available */}
            {suggestedAction && (
                <div className="suggested-action-card">
                    <span className="suggested-action-icon">
                        <Icon name="zap" size={20} />
                    </span>
                    <div className="suggested-action-body">
                        <span className="suggested-action-eyebrow">{t('admin.suggestedAction')}</span>
                        <div className="suggested-action-title">{suggestedAction.recommendation.title}</div>
                        {suggestedAction.recommendation.recommendation_text && (
                            <div className="suggested-action-desc">{suggestedAction.recommendation.recommendation_text}</div>
                        )}
                    </div>
                    <button className="btn btn-primary" onClick={() => handleCardClick(suggestedAction.event.id)}>
                        {t('admin.viewTopic')}
                        <Icon name="arrow-right" size={16} />
                    </button>
                </div>
            )}

            <div className="dashboard-section-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <h2 className="section-title">{t('admin.sectionTitle')}</h2>
                    <span className="section-count">
                        {events.length} {events.length === 1 ? t('admin.survey') : t('admin.surveys')}
                    </span>
                </div>
            </div>

            {/* Mobile FAB */}
            <Link to="/admin/create" className="fab" aria-label={t('admin.newSurvey')}>
                <Icon name="plus" size={26} />
            </Link>

            {events.length === 0 ? (
                <div className="empty-state-card">
                    <div className="empty-state-icon">
                        <Icon name="clipboard" size={40} />
                    </div>
                    <h3 className="empty-state-title">{t('admin.emptyTitle')}</h3>
                    <p className="empty-state-description">{t('admin.emptyDesc')}</p>
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                        <Link to="/admin/create" className="btn btn-action">
                            {t('admin.createFirst')}
                        </Link>
                        <Link to="/admin/import" className="btn btn-outline">
                            {t('admin.importResults')}
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="events-list" ref={menuRef}>
                    {events.map(event => {
                        const status = getEventStatus(event.end, event.is_paused);
                        const source = getEventSource(event);
                        const isMenuOpen = openMenuId === event.id;
                        return (
                            <article
                                key={event.id}
                                className="event-card-enhanced"
                                onClick={() => handleCardClick(event.id)}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => e.key === 'Enter' && handleCardClick(event.id)}
                                style={{ cursor: 'pointer' }}
                            >
                                <div className="event-card-main">
                                    <div className="event-card-header">
                                        <h3 className="event-card-title">{event.name}</h3>
                                        <span className={`event-status-badge event-status-${status.class}`}>
                                            {status.label}
                                        </span>
                                    </div>
                                    <div className="event-card-stats">
                                        <span className="event-stat">
                                            <Icon name={source === 'imported' ? 'download' : 'wifi'} size={14} />
                                            {source === 'imported' ? t('source.imported') : t('source.online')}
                                        </span>
                                        <span className="event-stat">
                                            <Icon name="message" size={14} />
                                            {(event.response_count || 0).toLocaleString()} {t('eventDetails.responses')}
                                        </span>
                                        <span className="event-stat">
                                            <Icon name="clock" size={14} />
                                            {status.daysText}
                                        </span>
                                    </div>
                                </div>

                                <div className="event-card-actions">
                                    <div style={{ position: 'relative' }}>
                                        <button
                                            className="survey-card-menu-btn"
                                            style={{ opacity: 1, position: 'static' }}
                                            onClick={(e) => handleMenuToggle(e, event.id)}
                                            aria-label="Opciones"
                                            aria-expanded={isMenuOpen}
                                        >
                                            <Icon name="more-vertical" size={16} />
                                        </button>

                                        {isMenuOpen && (
                                            <div className="survey-card-dropdown">
                                                <button className="survey-card-dropdown-item" onClick={(e) => handleEditClick(e, event.id)}>
                                                    <Icon name="pencil" size={15} />
                                                    {t('admin.edit')}
                                                </button>

                                                <button className="survey-card-dropdown-item" onClick={(e) => handleDuplicate(e, event)}>
                                                    <Icon name="copy" size={15} />
                                                    {t('admin.duplicate')}
                                                </button>

                                                <button className="survey-card-dropdown-item" onClick={(e) => handlePauseToggle(e, event)}>
                                                    <Icon name={event.is_paused ? 'play' : 'pause'} size={15} />
                                                    {event.is_paused ? t('admin.resume') : t('admin.pause')}
                                                </button>

                                                <div className="survey-card-dropdown-divider" />

                                                <button className="survey-card-dropdown-item survey-card-dropdown-item-danger" onClick={(e) => handleDeleteClick(e, event)}>
                                                    <Icon name="trash" size={15} />
                                                    {t('admin.delete')}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    <button className="btn btn-outline" onClick={(e) => { e.stopPropagation(); handleCardClick(event.id); }}>
                                        {t('admin.viewInsights')}
                                        <Icon name="arrow-right" size={15} />
                                    </button>
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
                        <Icon name="alert-triangle" size={32} />
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
