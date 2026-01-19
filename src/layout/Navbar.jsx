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
        <nav className="glass-card" style={{ margin: '1rem', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Link to="/" style={{ fontSize: '1.5rem', fontWeight: '800', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                Pooly
            </Link>
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                <Link to="/" className="nav-link">Gallery</Link>
                {user ? (
                    <>
                        <Link to="/admin" className="nav-link">Dashboard</Link>
                        <button onClick={handleLogout} className="btn-outline" style={{ padding: '0.5rem 1rem', borderRadius: '6px' }}>Logout</button>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{user.username}</span>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="nav-link">Admin Login</Link>
                    </>
                )}
            </div>
        </nav >
    );
};

export default Navbar;
