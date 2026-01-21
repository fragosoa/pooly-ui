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
        <nav style={{
            padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'fixed', top: 0, width: '100%', zIndex: 100, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(20px)'
        }}>
            <Link to="/" style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-main)' }}>
                poolQ
            </Link>

            {!user && (
                <div className="nav-pill-group">
                    <Link to="#features" className="nav-pill-link">Features</Link>
                    <Link to="#use-cases" className="nav-pill-link">Use cases</Link>
                    <Link to="#prices" className="nav-pill-link">Prices</Link>
                    <Link to="#company" className="nav-pill-link">Company</Link>
                </div>
            )}

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                {user ? (
                    <>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginRight: '0.5rem' }}>{user.username}</span>
                        <Link to="/admin" className="nav-pill-link">Dashboard</Link>
                        <button onClick={handleLogout} className="btn-outline" style={{ padding: '0.6rem 1.2rem', borderRadius: '999px', fontSize: '0.9rem' }}>Logout</button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="nav-link" style={{ fontSize: '0.9375rem', fontWeight: '500' }}>Login</Link>
                        <Link to="/register" className="btn-premium" style={{ padding: '0.6rem 1.4rem', fontSize: '0.9rem' }}>
                            Get started
                        </Link>
                    </>
                )}
            </div>
        </nav >
    );
};

export default Navbar;
