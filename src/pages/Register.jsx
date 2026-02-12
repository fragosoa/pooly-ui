import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { register, login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            return setError('Las contraseñas no coinciden');
        }

        setIsLoading(true);
        setError('');
        try {
            await register(username, password);
        } catch (err) {
            if (err.response?.status === 409) {
                setError('Este usuario ya existe. Intenta con otro nombre de usuario.');
            } else {
                setError(err.response?.data?.message || 'Error en el registro. Inténtalo de nuevo.');
            }
            setIsLoading(false);
            return;
        }

        try {
            await login(username, password);
            navigate('/admin');
        } catch (err) {
            setError('Cuenta creada, pero el inicio de sesión automático falló. Por favor inicia sesión manualmente.');
            console.error('Auto-login error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h1>Crear cuenta</h1>
                <p className="subtitle">Únete a Pooly y comienza a crear encuestas</p>

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
                            placeholder="Elige un nombre de usuario"
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
                    </div>
                    <div className="input-group">
                        <label className="input-label">Confirmar contraseña</label>
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
                        {isLoading ? 'Creando cuenta...' : 'Crear cuenta'}
                    </button>
                </form>

                <p className="auth-footer">
                    ¿Ya tienes cuenta? <Link to="/login">Inicia sesión aquí</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
