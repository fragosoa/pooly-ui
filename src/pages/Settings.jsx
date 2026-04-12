import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const Settings = () => {
    const { user } = useAuth();
    const { t } = useLanguage();

    const fields = [
        { label: t('settings.username'), value: user?.username },
        { label: t('settings.email'), value: user?.email || '—' },
        { label: t('settings.role'), value: user?.role || t('settings.roleDefault') },
    ];

    return (
        <div className="container" style={{ paddingTop: '5rem', paddingBottom: '4rem', maxWidth: '640px' }}>
            <Link to="/admin" className="back-link">{t('settings.back')}</Link>

            <h1 className="page-title" style={{ marginTop: '1rem' }}>{t('settings.title')}</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                {t('settings.subtitle')}
            </p>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
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
        </div>
    );
};

export default Settings;
