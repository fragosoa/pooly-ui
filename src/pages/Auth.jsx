import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import Modal from '../components/Modal';

const FacebookIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
    <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
  </svg>
);

const LinkedInIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="#0A66C2">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

const ForgotPasswordModal = ({ onClose }) => {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <Modal isOpen={true} onClose={onClose} title={t('forgotPwd.title')}>
      {!sent ? (
        <>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            {t('forgotPwd.description')}
          </p>
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label className="input-label">{t('forgotPwd.email')}</label>
              <input
                type="email"
                className="input-field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder={t('forgotPwd.placeholder')}
                autoFocus
              />
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
              <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>
                {t('forgotPwd.cancel')}
              </button>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                {t('forgotPwd.send')}
              </button>
            </div>
          </form>
        </>
      ) : (
        <>
          <div className="alert alert-success" style={{ marginBottom: '1rem' }}>
            {t('forgotPwd.success')}
          </div>
          <button className="btn btn-primary" style={{ width: '100%' }} onClick={onClose}>
            {t('forgotPwd.close')}
          </button>
        </>
      )}
    </Modal>
  );
};

const Auth = () => {
  const location = useLocation();
  const isRegister = location.pathname === '/register';

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const { login, register, loginWithGoogle } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const switchTab = (tab) => {
    setError('');
    setUsername('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    navigate(tab === 'login' ? '/login' : '/register');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await login(username, password);
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.msg || err.response?.data?.message || t('login.error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return setError(t('register.errorPasswordMatch'));
    }
    setIsLoading(true);
    setError('');
    try {
      await register(username, password, email);
    } catch (err) {
      if (err.response?.status === 409) {
        setError(t('register.errorUserExists'));
      } else {
        setError(err.response?.data?.message || t('register.errorGeneric'));
      }
      setIsLoading(false);
      return;
    }
    try {
      await login(username, password);
      navigate('/admin');
    } catch (err) {
      setError(t('register.errorAutoLogin'));
      console.error('Auto-login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setIsLoading(true);
    setError('');
    try {
      await loginWithGoogle(credentialResponse.credential);
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.msg || err.response?.data?.message || t('auth.googleError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* Tabs */}
        <div style={{
          display: 'flex',
          borderBottom: '2px solid var(--border, #E5E7EB)',
          marginBottom: '1.5rem',
        }}>
          <button
            type="button"
            onClick={() => switchTab('login')}
            style={{
              flex: 1,
              padding: '0.75rem',
              background: 'none',
              border: 'none',
              borderBottom: !isRegister ? '2px solid var(--primary, #6366F1)' : '2px solid transparent',
              marginBottom: '-2px',
              color: !isRegister ? 'var(--primary, #6366F1)' : 'var(--text-secondary, #6B7280)',
              fontWeight: !isRegister ? 600 : 400,
              fontSize: '0.95rem',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {t('login.submit')}
          </button>
          <button
            type="button"
            onClick={() => switchTab('register')}
            style={{
              flex: 1,
              padding: '0.75rem',
              background: 'none',
              border: 'none',
              borderBottom: isRegister ? '2px solid var(--primary, #6366F1)' : '2px solid transparent',
              marginBottom: '-2px',
              color: isRegister ? 'var(--primary, #6366F1)' : 'var(--text-secondary, #6B7280)',
              fontWeight: isRegister ? 600 : 400,
              fontSize: '0.95rem',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {t('register.submit')}
          </button>
        </div>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        {/* Login form */}
        {!isRegister && (
          <form onSubmit={handleLoginSubmit}>
            <div className="input-group">
              <label className="input-label">{t('login.username')}</label>
              <input
                type="text"
                className="input-field"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder={t('login.usernamePlaceholder')}
              />
            </div>
            <div className="input-group">
              <label className="input-label">{t('login.password')}</label>
              <input
                type="password"
                className="input-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
              <div style={{ textAlign: 'right', marginTop: '0.35rem' }}>
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.85rem', cursor: 'pointer', padding: 0 }}
                >
                  {t('login.forgotPassword')}
                </button>
              </div>
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '0.5rem' }}
              disabled={isLoading}
            >
              {isLoading ? t('login.submitting') : t('login.submit')}
            </button>
          </form>
        )}

        {/* Register form */}
        {isRegister && (
          <form onSubmit={handleRegisterSubmit}>
            <div className="input-group">
              <label className="input-label">{t('register.username')}</label>
              <input
                type="text"
                className="input-field"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder={t('register.usernamePlaceholder')}
              />
            </div>
            <div className="input-group">
              <label className="input-label">{t('register.email')}</label>
              <input
                type="email"
                className="input-field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder={t('register.emailPlaceholder')}
              />
            </div>
            <div className="input-group">
              <label className="input-label">{t('register.password')}</label>
              <input
                type="password"
                className="input-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
            </div>
            <div className="input-group">
              <label className="input-label">{t('register.confirmPassword')}</label>
              <input
                type="password"
                className="input-field"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '0.5rem' }}
              disabled={isLoading}
            >
              {isLoading ? t('register.submitting') : t('register.submit')}
            </button>
            <p className="auth-legal" style={{ marginTop: '1rem' }}>
              {t('register.legalPrefix')}{' '}
              <Link to="/terms_of_use">{t('register.termsLink')}</Link>
              {' '}{t('register.legalAnd')}{' '}
              <Link to="/privacy_notice">{t('register.privacyLink')}</Link>
              {t('register.legalSuffix')}
            </p>
          </form>
        )}

        {/* Shared social section */}
        <div className="auth-divider">{t('auth.socialDivider')}</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError(t('auth.googleError'))}
            text={isRegister ? 'signup_with' : 'signin_with'}
            width="100%"
          />
          <button type="button" className="auth-social-btn" onClick={() => {}}>
            <FacebookIcon />
            {t('auth.facebook')}
          </button>
          <button type="button" className="auth-social-btn" onClick={() => {}}>
            <LinkedInIcon />
            {t('auth.linkedin')}
          </button>
        </div>
      </div>

      {showForgotPassword && (
        <ForgotPasswordModal onClose={() => setShowForgotPassword(false)} />
      )}
    </div>
  );
};

export default Auth;
