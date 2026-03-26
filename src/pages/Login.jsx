import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';

const ForgotPasswordModal = ({ onClose }) => {
    const [email, setEmail] = useState('');
    const [sent, setSent] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        // Placeholder: backend logic for password reset not yet implemented
        setSent(true);
    };

    return (
        <Modal isOpen={true} onClose={onClose} title="Recuperar contraseña">
            {!sent ? (
                <>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                        Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
                    </p>
                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            <label className="input-label">Correo electrónico</label>
                            <input
                                type="email"
                                className="input-field"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="tu@correo.com"
                                autoFocus
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                            <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>
                                Cancelar
                            </button>
                            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                                Enviar enlace
                            </button>
                        </div>
                    </form>
                </>
            ) : (
                <>
                    <div className="alert alert-success" style={{ marginBottom: '1rem' }}>
                        Si existe una cuenta con ese correo, recibirás un enlace en breve.
                    </div>
                    <button className="btn btn-primary" style={{ width: '100%' }} onClick={onClose}>
                        Cerrar
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
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            await login(username, password);
            navigate('/admin');
        } catch (err) {
            setError(err.response?.data?.message || 'Error al iniciar sesión. Verifica tus credenciales.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h1>Bienvenido de nuevo</h1>
                <p className="subtitle">Inicia sesión para gestionar tus encuestas</p>

                {error && (
                    <div className="alert alert-error">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label className="input-label">Usuario</label>
                        <input
                            type="text"
                            className="input-field"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            placeholder="Tu nombre de usuario"
                        />
                    </div>
                    <div className="input-group">
                        <label className="input-label">Contraseña</label>
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
                                ¿Olvidaste tu contraseña?
                            </button>
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%', marginTop: '0.5rem' }}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
                    </button>
                </form>

                <p className="auth-footer">
                    ¿No tienes cuenta? <Link to="/register">Regístrate aquí</Link>
                </p>
            </div>

            {showForgotPassword && (
                <ForgotPasswordModal onClose={() => setShowForgotPassword(false)} />
            )}
        </div>
    );
};

export default Login;
