import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import LanguageSwitcher from '../components/LanguageSwitcher';
import Icon from '../components/Icon';

const DEMO_URL = 'mailto:hello@pooly.app?subject=Quiero%20agendar%20una%20demo%20de%20Pooly';

const NAV_LINKS = (t) => [
  { label: t('landing.nav.how'), href: '/#como' },
  { label: t('landing.nav.pricing'), href: '/#precios' },
  { label: t('landing.nav.faq'), href: '/#faq' },
];

const getInitials = (username = '') => {
  const parts = username.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
};

const avatarStyle = {
  width: '28px',
  height: '28px',
  borderRadius: '50%',
  background: 'var(--brand-soft, var(--primary-light))',
  color: 'var(--brand, var(--primary))',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '0.6875rem',
  fontWeight: 700,
  flexShrink: 0,
};

const dropdownItemStyle = {
  display: 'block',
  width: '100%',
  textAlign: 'left',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  fontSize: '0.875rem',
  font: 'inherit',
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    if (!userMenuOpen) return;
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [userMenuOpen]);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
    setUserMenuOpen(false);
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
          Pool<span style={{ color: 'var(--primary)' }}>y</span>
        </Link>
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
            <Link
              to="/admin/create"
              className="btn btn-action"
              style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
            >
              <Icon name="plus" size={16} />
              {t('admin.newSurvey')}
            </Link>
            <div ref={userMenuRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setUserMenuOpen((o) => !o)}
                className="nav-link"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-secondary)',
                  fontSize: '0.875rem',
                  font: 'inherit',
                }}
                aria-haspopup="true"
                aria-expanded={userMenuOpen}
              >
                <span style={avatarStyle}>{getInitials(user.username)}</span>
                {user.username}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
              {userMenuOpen && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  minWidth: '190px',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-lg)',
                  overflow: 'hidden',
                  zIndex: 50,
                }}>
                  <Link
                    to="/admin"
                    className="nav-link"
                    style={dropdownItemStyle}
                    onClick={() => setUserMenuOpen(false)}
                  >
                    {t('navbar.controlPanel')}
                  </Link>
                  <Link
                    to="/admin/settings"
                    className="nav-link"
                    style={dropdownItemStyle}
                    onClick={() => setUserMenuOpen(false)}
                  >
                    {t('navbar.settings')}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="nav-link"
                    style={{ ...dropdownItemStyle, color: 'var(--error)' }}
                  >
                    {t('navbar.logout')}
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <LanguageSwitcher />
            <Link
              to="/login"
              className="nav-link"
              style={{ borderRadius: '0', fontSize: '14.5px', fontWeight: 500 }}
            >
              {t('navbar.login')}
            </Link>
            <a
              href={DEMO_URL}
              className="btn btn-primary"
              style={{
                padding: '0.5rem 1.25rem',
                fontSize: '0.875rem',
                borderRadius: '0',
                fontWeight: 700,
              }}
            >
              {t('landing.nav.demoBtn')}
            </a>
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 600 }}>
                  <span style={avatarStyle}>{getInitials(user.username)}</span>
                  {user.username}
                </div>
                <div style={{ padding: '0.5rem 1rem' }}>
                  <Link
                    to="/admin/create"
                    className="btn btn-action"
                    onClick={() => setMenuOpen(false)}
                    style={{ display: 'flex', justifyContent: 'center', width: '100%' }}
                  >
                    <Icon name="plus" size={16} />
                    {t('admin.newSurvey')}
                  </Link>
                </div>
                <Link to="/admin" className="navbar-mobile-link" onClick={() => setMenuOpen(false)}>
                  {t('navbar.controlPanel')}
                </Link>
                <Link to="/admin/settings" className="navbar-mobile-link" onClick={() => setMenuOpen(false)}>
                  {t('navbar.settings')}
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
                <div style={{ padding: '0.5rem 1rem' }}>
                  <LanguageSwitcher />
                </div>
                <div style={{ padding: '0.75rem 1rem' }}>
                  <a
                    href={DEMO_URL}
                    className="btn btn-primary"
                    onClick={() => setMenuOpen(false)}
                    style={{
                      display: 'block',
                      textAlign: 'center',
                      borderRadius: '0',
                      fontWeight: 700,
                      fontSize: '0.9rem',
                    }}
                  >
                    {t('landing.nav.demoBtn')}
                  </a>
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
