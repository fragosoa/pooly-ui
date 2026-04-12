import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import Modal from '../components/Modal';

const ForgotPasswordModal = ({ onClose }) => {
    const { t } = useLanguage();
    const [email, setEmail] = useState('');
    const [sent, setSent] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        // Placeholder: backend logic for password reset not yet implemented
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

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const { login } = useAuth();
    const { t } = useLanguage();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            await login(username, password);
            navigate('/admin');
        } catch (err) {
            setError(err.response?.data?.message || t('login.error'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h1>{t('login.title')}</h1>
                <p className="subtitle">{t('login.subtitle')}</p>

                {error && (
                    <div className="alert alert-error">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
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

                <p className="auth-footer">
                    {t('login.noAccount')} <Link to="/register">{t('login.registerLink')}</Link>
                </p>
            </div>

            {showForgotPassword && (
                <ForgotPasswordModal onClose={() => setShowForgotPassword(false)} />
            )}
        </div>
    );
};

export default Login;
