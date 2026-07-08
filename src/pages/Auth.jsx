import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import Modal from '../components/Modal';


const ForgotPasswordModal = ({ onClose }) => {
  const { t } = useLanguage();
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await forgotPassword(email);
      setSent(true);
    } catch {
      setError(t('forgotPwd.error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title={t('forgotPwd.title')}>
      {!sent ? (
        <>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            {t('forgotPwd.description')}
          </p>
          {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}
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
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={isLoading}>
                {isLoading ? t('register.send_verification_submitting') : t('forgotPwd.send')}
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
  const [searchParams] = useSearchParams();
  const isRegister = location.pathname === '/register';

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [allowNotifications, setAllowNotifications] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  // Registration flow state
  const [emailSent, setEmailSent] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState(null);
  const [verificationToken, setVerificationToken] = useState(null);
  const [tokenLoading, setTokenLoading] = useState(false);

  const { login, register, loginWithGoogle, updateUser, requestEmailVerification, verifyEmailToken } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  // When landing on /register?token=XXX, verify the token and get the email back
  useEffect(() => {
    if (!isRegister) return;
    const token = searchParams.get('token');
    if (!token) return;

    setVerificationToken(token);
    setTokenLoading(true);
    verifyEmailToken(token)
      .then((resolvedEmail) => {
        setVerifiedEmail(resolvedEmail);
        setError('');
      })
      .catch((err) => {
        const errorType = err.response?.data?.error;
        setError(errorType === 'expired' ? t('register.token_expired') : t('register.token_invalid'));
      })
      .finally(() => setTokenLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const switchTab = (tab) => {
    setError('');
    setUsername('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setEmailSent(false);
    setVerifiedEmail(null);
    setVerificationToken(null);
    navigate(tab === 'login' ? '/login' : '/register');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await login(email, password);
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.msg || err.response?.data?.message || t('login.error'));
    } finally {
      setIsLoading(false);
    }
  };

  // Step 1: user submits just their email to receive the verification link
  const handleRequestVerification = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await requestEmailVerification(email);
      setEmailSent(true);
    } catch (err) {
      if (err.response?.status === 409) {
        setError(t('register.errorEmailExists'));
      } else {
        setError(err.response?.data?.message || t('register.errorGeneric'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: user completes registration after email is verified
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 8) {
      return setError(t('register.errorPasswordLength'));
    }
    if (password !== confirmPassword) {
      return setError(t('register.errorPasswordMatch'));
    }
    setIsLoading(true);
    setError('');
    try {
      await register(username, password, verifiedEmail, allowNotifications, verificationToken);
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
      await login(verifiedEmail, password);
      updateUser({ allow_notifications: allowNotifications });
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
        {/* Google access — independent of tabs */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError(t('auth.googleError'))}
            text="continue_with"
          />
        </div>

        <div className="auth-divider">{t('auth.emailDivider')}</div>

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
              <label className="input-label">{t('login.email')}</label>
              <input
                type="email"
                className="input-field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder={t('login.emailPlaceholder')}
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

        {/* Register section */}
        {isRegister && (
          <>
            {tokenLoading ? (
              /* Verifying token from URL */
              <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                {t('register.token_verifying')}
              </p>
            ) : verifiedEmail ? (
              /* Step 2: Complete registration */
              <form onSubmit={handleRegisterSubmit}>
                <div className="input-group">
                  <label className="input-label">{t('register.verified_email_label')}</label>
                  <input
                    type="email"
                    className="input-field"
                    value={verifiedEmail}
                    readOnly
                    style={{ background: 'var(--bg-secondary, #F9FAFB)', cursor: 'default', color: 'var(--text-secondary)' }}
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">{t('register.name')}</label>
                  <input
                    type="text"
                    className="input-field"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    placeholder={t('register.namePlaceholder')}
                    autoFocus
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
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem', margin: '1rem 0 0.25rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={allowNotifications}
                    onChange={(e) => setAllowNotifications(e.target.checked)}
                    style={{ marginTop: '0.15rem', flexShrink: 0, accentColor: 'var(--primary)' }}
                  />
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                    {t('register.notifications')}
                  </span>
                </label>
                <button
                  type="submit"
                  className="btn btn-action"
                  style={{ width: '100%', marginTop: '0.75rem' }}
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
            ) : emailSent ? (
              /* Confirmation: email was sent */
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: 48, height: 48, borderRadius: '50%',
                  background: 'var(--primary)', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.5rem', margin: '0 auto 1.25rem',
                }}>
                  ✓
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1rem' }}>
                  {t('register.check_email_sent_to', { email })}
                </p>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6 }}>
                  {t('register.check_email')}
                </p>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ marginTop: '1.5rem', width: '100%' }}
                  onClick={() => { setEmailSent(false); setEmail(''); setError(''); }}
                >
                  {t('register.request_new_link')}
                </button>
              </div>
            ) : (
              /* Step 1: email input */
              <form onSubmit={handleRequestVerification}>
                <div className="input-group">
                  <label className="input-label">{t('register.email')}</label>
                  <input
                    type="email"
                    className="input-field"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder={t('register.emailPlaceholder')}
                    autoFocus
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-action"
                  style={{ width: '100%', marginTop: '0.5rem' }}
                  disabled={isLoading}
                >
                  {isLoading ? t('register.send_verification_submitting') : t('register.send_verification')}
                </button>
              </form>
            )}
          </>
        )}

      </div>

      {showForgotPassword && (
        <ForgotPasswordModal onClose={() => setShowForgotPassword(false)} />
      )}
    </div>
  );
};

export default Auth;
