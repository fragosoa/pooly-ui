import { useRef, useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';

const THEME_OPTIONS = [
  { value: 'default', label: 'Default' },
  { value: 'dark', label: 'Dark' },
];

const ThemeIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3v2" />
    <path d="M12 19v2" />
    <path d="M4.22 4.22l1.42 1.42" />
    <path d="M18.36 18.36l1.42 1.42" />
    <path d="M1 12h2" />
    <path d="M21 12h2" />
    <path d="M4.22 19.78l1.42-1.42" />
    <path d="M18.36 5.64l1.42-1.42" />
    <circle cx="12" cy="12" r="4" />
  </svg>
);

const ThemeSwitcher = () => {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentTheme = THEME_OPTIONS.find(option => option.value === theme) || THEME_OPTIONS[0];

  return (
    <div ref={ref} className="theme-switcher">
      <button
        type="button"
        className="theme-switcher-button"
        onClick={() => setOpen(o => !o)}
        aria-label="Select theme"
        aria-expanded={open}
      >
        <ThemeIcon />
        <span>{currentTheme.label}</span>
        <svg width="10" height="10" viewBox="0 0 10 6" fill="none" aria-hidden="true">
          <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className="theme-switcher-menu" role="menu">
          {THEME_OPTIONS.map(option => (
            <button
              key={option.value}
              type="button"
              role="menuitemradio"
              aria-checked={theme === option.value}
              className="theme-switcher-option"
              onClick={() => {
                setTheme(option.value);
                setOpen(false);
              }}
            >
              <span>{option.label}</span>
              {theme === option.value && <span className="theme-switcher-check">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ThemeSwitcher;
