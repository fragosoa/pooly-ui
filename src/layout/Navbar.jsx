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
            <Link to="/" className="navbar-brand">
                Pooly
            </Link>

            <div className="navbar-links">
                {user ? (
                    <>
                        <span style={{
                            color: 'var(--text-secondary)',
                            fontSize: '0.875rem',
                            marginRight: '0.5rem'
                        }}>
                            {user.username}
                        </span>
                        <Link to="/admin" className="nav-link">
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
