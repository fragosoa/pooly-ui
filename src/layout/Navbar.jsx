import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import LanguageSwitcher from '../components/LanguageSwitcher';

const NAV_LINKS = (t) => [
  { label: t('landing.nav.product'), href: '/#features' },
  { label: t('landing.nav.how'), href: '/#how' },
  { label: t('landing.nav.demo'), href: '/#demo' },
  { label: t('landing.nav.pricing'), href: '/#pricing' },
];

const Navbar = () => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  return (
    <nav className="navbar" style={{ position: 'relative' }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
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
          userSelect: 'none',
          clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 50%, calc(100% - 8px) 100%, 0 100%)',
          paddingRight: '1.25rem',
        }}>
          DEMO
        </span>
      </div>

      {/* Center nav links — desktop only, logged-out */}
      {!user && (
        <ul className="navbar-center-links">
          {NAV_LINKS(t).map(({ label, href }) => (
            <li key={label}>
              <a
                href={href}
                className="navbar-center-link"
                onClick={() => setMenuOpen(false)}
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
      )}

      {/* Right actions — desktop */}
      <div className="navbar-links navbar-desktop-actions">
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

      {/* Hamburger button — mobile only */}
      <button
        className="navbar-hamburger"
        onClick={() => setMenuOpen(o => !o)}
        aria-label="Abrir menú"
      >
        {menuOpen ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M3 12h18M3 6h18M3 18h18" />
          </svg>
        )}
      </button>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="navbar-mobile-menu">
          {!user && (
            <ul className="navbar-mobile-links">
              {NAV_LINKS(t).map(({ label, href }) => (
                <li key={label}>
                  <a href={href} className="navbar-mobile-link" onClick={() => setMenuOpen(false)}>
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          )}
          <div className="navbar-mobile-actions">
            {user ? (
              <>
                <Link to="/admin" className="navbar-mobile-link" onClick={() => setMenuOpen(false)}>
                  {user.username}
                </Link>
                <Link to="/admin/settings" className="navbar-mobile-link" onClick={() => setMenuOpen(false)}>
                  {t('navbar.controlPanel')}
                </Link>
                <div style={{ padding: '0.5rem 1rem' }}>
                  <LanguageSwitcher />
                </div>
                <button
                  onClick={handleLogout}
                  className="navbar-mobile-link"
                  style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--error)', fontWeight: 600 }}
                >
                  {t('navbar.logout')}
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="navbar-mobile-link"
                  onClick={() => setMenuOpen(false)}
                >
                  {t('navbar.login')}
                </Link>
                <div style={{ padding: '0.75rem 1rem' }}>
                  <Link
                    to="/register"
                    className="btn btn-primary"
                    onClick={() => setMenuOpen(false)}
                    style={{
                      display: 'block',
                      textAlign: 'center',
                      borderRadius: '0',
                      background: '#F59E0B',
                      color: '#1a1a1a',
                      fontWeight: 700,
                      fontSize: '0.9rem',
                    }}
                  >
                    {t('navbar.register')}
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
