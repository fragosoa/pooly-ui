import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import LanguageSwitcher from '../components/LanguageSwitcher';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Link
          to="/"
          className="navbar-brand"
          style={{ color: 'var(--text-primary)', fontFamily: "'Nunito Sans', sans-serif", fontWeight: 800 }}
        >
          Pool<span style={{ color: '#2563eb' }}>y</span>
        </Link>
        <span style={{
          background: '#059669',
          color: 'white',
          fontSize: '0.8125rem',
          fontWeight: 700,
          padding: '0.25rem 0.875rem',
          borderRadius: '0',
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

      {/* Center nav links — only shown on landing page (logged-out) */}
      {!user && (
        <ul style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          listStyle: 'none',
          margin: '0 auto',
          padding: 0,
        }}>
          {[
            { label: t('landing.nav.product'), href: '/#features' },
            { label: t('landing.nav.how'), href: '/#how' },
            { label: t('landing.nav.customers'), href: '/#testimonials' },
            { label: t('landing.nav.pricing'), href: '/#pricing' },
          ].map(({ label, href }) => (
            <li key={label}>
              <a
                href={href}
                style={{
                  color: 'var(--text-secondary)',
                  textDecoration: 'none',
                  fontSize: '14.5px',
                  fontWeight: 500,
                  padding: '7px 13px',
                  borderRadius: '0',
                  transition: 'color 0.2s, background 0.2s',
                  display: 'block',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = 'var(--text-primary)';
                  e.currentTarget.style.background = 'var(--bg-secondary)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = 'var(--text-secondary)';
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
      )}

      {/* Right actions */}
      <div className="navbar-links">
        {user ? (
          <>
            <LanguageSwitcher />
            <Link to="/admin" className="nav-link" style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              {user.username}
            </Link>
            <Link to="/admin/settings" className="nav-link">
              {t('navbar.controlPanel')}
            </Link>
            <button
              onClick={handleLogout}
              className="btn btn-outline"
              style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', borderRadius: '0' }}
            >
              {t('navbar.logout')}
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="nav-link"
              style={{ borderRadius: '0', fontSize: '14.5px', fontWeight: 500 }}
            >
              {t('navbar.login')}
            </Link>
            <Link
              to="/register"
              className="btn btn-primary"
              style={{
                padding: '0.5rem 1.25rem',
                fontSize: '0.875rem',
                borderRadius: '0',
                background: '#F59E0B',
                color: '#1a1a1a',
                fontWeight: 700,
              }}
            >
              {t('navbar.register')}
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
