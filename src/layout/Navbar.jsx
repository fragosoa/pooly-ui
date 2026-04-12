import { useRef, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const LANGUAGES = [
  { code: 'es', flag: '🇲🇽', label: 'Español' },
  { code: 'en', flag: '🇺🇸', label: 'English' },
];

const LanguageSwitcher = () => {
  const { language, changeLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const current = LANGUAGES.find(l => l.code === language);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
          background: 'none',
          border: '1px solid var(--border)',
          borderRadius: '6px',
          padding: '0.35rem 0.55rem',
          cursor: 'pointer',
          fontSize: '0.875rem',
          color: 'var(--text-secondary)',
          lineHeight: 1,
        }}
        aria-label="Select language"
      >
        <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>{current.flag}</span>
        <span style={{ fontWeight: 500 }}>{current.code.toUpperCase()}</span>
        <svg width="10" height="10" viewBox="0 0 10 6" fill="none" style={{ opacity: 0.6 }}>
          <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 6px)',
          right: 0,
          background: 'var(--bg-primary)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          overflow: 'hidden',
          minWidth: '140px',
          zIndex: 200,
        }}>
          {LANGUAGES.map(lang => (
            <button
              key={lang.code}
              onClick={() => { changeLanguage(lang.code); setOpen(false); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                width: '100%',
                padding: '0.6rem 1rem',
                background: language === lang.code ? 'var(--bg-secondary)' : 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.875rem',
                color: 'var(--text-primary)',
                textAlign: 'left',
              }}
            >
              <span style={{ fontSize: '1.1rem' }}>{lang.flag}</span>
              <span>{lang.label}</span>
              {language === lang.code && (
                <span style={{ marginLeft: 'auto', color: 'var(--primary)', fontWeight: 700 }}>✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

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
              style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
            >
              {t('navbar.logout')}
            </button>
          </>
        ) : (
          <>
            <LanguageSwitcher />
            <Link to="/login" className="nav-link">
              {t('navbar.login')}
            </Link>
            <Link
              to="/register"
              className="btn btn-primary"
              style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem' }}
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
