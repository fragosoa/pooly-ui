import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';

const Settings = () => {
    const { user, updateUser } = useAuth();
    const { t } = useLanguage();

    const [notifications, setNotifications] = useState(user?.allow_notifications ?? true);
    const [notifStatus, setNotifStatus] = useState(''); // 'saved' | 'error' | ''
    const [notifSaving, setNotifSaving] = useState(false);

    const fields = [
        { label: t('settings.username'), value: user?.username },
        { label: t('settings.email'), value: user?.email || '—' },
        { label: t('settings.role'), value: user?.role || t('settings.roleDefault') },
    ];

    const handleNotificationsToggle = async (value) => {
        setNotifications(value);
        setNotifSaving(true);
        setNotifStatus('');
        try {
            await api.patch('/settings/notifications', { allow_notifications: value });
            updateUser({ allow_notifications: value });
            setNotifStatus('saved');
        } catch {
            setNotifications(!value);
            setNotifStatus('error');
        } finally {
            setNotifSaving(false);
        }
    };

    return (
        <div className="container" style={{ paddingTop: '5rem', paddingBottom: '4rem', maxWidth: '640px' }}>
            <Link to="/admin" className="back-link">{t('settings.back')}</Link>

            <h1 className="page-title" style={{ marginTop: '1rem' }}>{t('settings.title')}</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                {t('settings.subtitle')}
            </p>

            {/* Account info */}
            <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: '1.5rem' }}>
                <div style={{
                    padding: '1rem 1.25rem',
                    background: 'var(--bg-secondary)',
                    borderBottom: '1px solid var(--border)',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    color: 'var(--text-primary)',
                }}>
                    {t('settings.sectionTitle')}
                </div>
                <div>
                    {fields.map(({ label, value }, i) => (
                        <div
                            key={label}
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '0.875rem 1.25rem',
                                borderBottom: i < fields.length - 1 ? '1px solid var(--border)' : 'none',
                            }}
                        >
                            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{label}</span>
                            <span style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-primary)' }}>{value}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Notifications */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{
                    padding: '1rem 1.25rem',
                    background: 'var(--bg-secondary)',
                    borderBottom: '1px solid var(--border)',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    color: 'var(--text-primary)',
                }}>
                    {t('settings.notificationsSection')}
                </div>
                <div style={{ padding: '1rem 1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                        <div>
                            <p style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-primary)', margin: 0 }}>
                                {t('settings.notificationsLabel')}
                            </p>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0' }}>
                                {t('settings.notificationsDesc')}
                            </p>
                        </div>
                        <button
                            type="button"
                            role="switch"
                            aria-checked={notifications}
                            disabled={notifSaving}
                            onClick={() => handleNotificationsToggle(!notifications)}
                            style={{
                                flexShrink: 0,
                                width: '44px',
                                height: '24px',
                                borderRadius: '999px',
                                border: 'none',
                                cursor: notifSaving ? 'not-allowed' : 'pointer',
                                background: notifications ? 'var(--primary)' : 'var(--border)',
                                position: 'relative',
                                transition: 'background 0.2s',
                                opacity: notifSaving ? 0.6 : 1,
                                padding: 0,
                            }}
                        >
                            <span style={{
                                position: 'absolute',
                                top: '3px',
                                left: notifications ? '23px' : '3px',
                                width: '18px',
                                height: '18px',
                                borderRadius: '50%',
                                background: 'white',
                                transition: 'left 0.2s',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                            }} />
                        </button>
                    </div>
                    {notifStatus === 'saved' && (
                        <p style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--secondary, #059669)' }}>
                            {t('settings.notificationsSaved')}
                        </p>
                    )}
                    {notifStatus === 'error' && (
                        <p style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--error)' }}>
                            {t('settings.notificationsError')}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Settings;
