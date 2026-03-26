import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
    const { user } = useAuth();

    const fields = [
        { label: 'Nombre de usuario', value: user?.username },
        { label: 'Correo electrónico', value: user?.email || '—' },
        { label: 'Rol', value: user?.role || 'Usuario' },
    ];

    return (
        <div className="container" style={{ paddingTop: '5rem', paddingBottom: '4rem', maxWidth: '640px' }}>
            <Link to="/admin" className="back-link">← Volver al panel</Link>

            <h1 className="page-title" style={{ marginTop: '1rem' }}>Configuración</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                Detalles de tu cuenta
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
                    Información de usuario
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
