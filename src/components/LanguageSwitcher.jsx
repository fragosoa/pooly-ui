import { useRef, useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';

const LANGUAGES = [
  { code: 'es', label: 'Español' },
  { code: 'en', label: 'English' },
];

const GlobeIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M2 12h20" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

const LanguageSwitcher = ({ dark = false }) => {
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

  const textColor = dark ? 'rgba(255,255,255,0.6)' : 'var(--text-secondary)';
  const bgColor = dark ? 'oklch(18% 0.04 265)' : 'var(--bg-primary)';
  const borderColor = dark ? 'oklch(25% 0.04 265)' : 'var(--border)';
  const hoverBg = dark ? 'oklch(22% 0.04 265)' : 'var(--bg-secondary)';

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
          background: 'none',
          border: `1px solid ${borderColor}`,
          borderRadius: '0',
          padding: '0.35rem 0.6rem',
          cursor: 'pointer',
          fontSize: '0.8125rem',
          color: textColor,
          lineHeight: 1,
          fontFamily: 'inherit',
        }}
        aria-label="Select language"
      >
        <GlobeIcon />
        <span style={{ fontWeight: 500 }}>{language.toUpperCase()}</span>
        <svg width="10" height="10" viewBox="0 0 10 6" fill="none" style={{ opacity: 0.5 }}>
          <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div style={{
          position: 'absolute',
          bottom: dark ? 'calc(100% + 6px)' : undefined,
          top: dark ? undefined : 'calc(100% + 6px)',
          right: 0,
          background: bgColor,
          border: `1px solid ${borderColor}`,
          borderRadius: '0',
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          overflow: 'hidden',
          minWidth: '130px',
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
                background: language === lang.code ? hoverBg : 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.875rem',
                color: dark ? 'rgba(255,255,255,0.8)' : 'var(--text-primary)',
                textAlign: 'left',
                fontFamily: 'inherit',
              }}
            >
              <span>{lang.label}</span>
              {language === lang.code && (
                <span style={{ marginLeft: 'auto', color: '#2563eb', fontWeight: 700 }}>✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
