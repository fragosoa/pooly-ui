import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="navbar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Link to="/" className="navbar-brand">
                    Pooly
                </Link>
                <span style={{
                    background: '#059669',
                    color: 'white',
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    padding: '0.25rem 0.875rem',
                    borderRadius: '4px 0 0 4px',
                    letterSpacing: '0.05em',
                    lineHeight: '1.4',
                    position: 'relative',
                    userSelect: 'none',
                    clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 50%, calc(100% - 8px) 100%, 0 100%)',
                    paddingRight: '1.25rem',
                }}>
                    DEMO
                </span>
            </div>

            <div className="navbar-links">
                {user ? (
                    <>
                            <Link to="/admin" className="nav-link" style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginRight: '0.5rem' }}>
                            {user.username}
                        </Link>
                        <Link to="/admin/settings" className="nav-link">
                            Panel de control
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="btn btn-outline"
                            style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                        >
                            Cerrar sesión
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="nav-link">
                            Iniciar sesión
                        </Link>
                        <Link
                            to="/register"
                            className="btn btn-primary"
                            style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem' }}
                        >
                            Comenzar
                        </Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
