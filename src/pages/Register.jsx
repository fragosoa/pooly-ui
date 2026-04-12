import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { register, login } = useAuth();
    const { t } = useLanguage();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
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

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h1>{t('register.title')}</h1>
                <p className="subtitle">{t('register.subtitle')}</p>

                {error && (
                    <div className="alert alert-error">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
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
                </form>

                <p className="auth-footer">
                    {t('register.hasAccount')} <Link to="/login">{t('register.loginLink')}</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
