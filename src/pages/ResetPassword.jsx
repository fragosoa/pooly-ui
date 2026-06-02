import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const { resetPassword } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError(t('resetPwd.errorInvalid'));
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 8) return setError(t('resetPwd.errorLength'));
    if (password !== confirmPassword) return setError(t('resetPwd.errorMatch'));

    setIsLoading(true);
    setError('');
    try {
      await resetPassword(token, password);
      setSuccess(true);
    } catch (err) {
      const errorType = err.response?.data?.error;
      if (errorType === 'expired') {
        setError(t('resetPwd.errorExpired'));
      } else if (errorType === 'invalid') {
        setError(t('resetPwd.errorInvalid'));
      } else {
        setError(err.response?.data?.message || t('resetPwd.errorGeneric'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        {success ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: 48, height: 48, borderRadius: '50%',
              background: 'var(--primary, #6366F1)', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.5rem', margin: '0 auto 1.25rem',
            }}>
              ✓
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              {t('resetPwd.success')}
            </p>
            <button
              className="btn btn-primary"
              style={{ width: '100%' }}
              onClick={() => navigate('/login')}
            >
              {t('resetPwd.goToLogin')}
            </button>
          </div>
        ) : (
          <>
            <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.25rem', fontWeight: 700 }}>
              {t('resetPwd.title')}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              {t('resetPwd.subtitle')}
            </p>

            {error && (
              <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
                {error}
                {(error === t('resetPwd.errorExpired') || error === t('resetPwd.errorInvalid')) && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <Link to="/login" style={{ color: 'inherit', fontWeight: 600 }}>
                      {t('resetPwd.requestNew')}
                    </Link>
                  </div>
                )}
              </div>
            )}

            {token && !error.includes(t('resetPwd.errorInvalid').slice(0, 10)) && (
              <form onSubmit={handleSubmit}>
                <div className="input-group">
                  <label className="input-label">{t('resetPwd.password')}</label>
                  <input
                    type="password"
                    className="input-field"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    autoFocus
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">{t('resetPwd.confirmPassword')}</label>
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
                  {isLoading ? t('resetPwd.submitting') : t('resetPwd.submit')}
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
