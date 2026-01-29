import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const ResponseSubmission = () => {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [responses, setResponses] = useState({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchEventDetails = async () => {
            try {
                const response = await api.get(`/events/${eventId}/details`);
                setEvent(response.data);
            } catch (err) {
                console.error('Failed to fetch event details:', err);
                setError('No se pudieron cargar las preguntas.');
                setEvent({
                    id: eventId,
                    name: 'Movilidad Urbana 2026',
                    description: 'Ayúdanos a mejorar el transporte de la ciudad.',
                    questions: [
                        { id: 101, text: '¿Cuál es tu principal medio de transporte?' },
                        { id: 102, text: '¿Estás satisfecho con las ciclovías actuales?' },
                        { id: 103, text: '¿Qué mejora priorizarías primero?' }
                    ]
                });
            } finally {
                setLoading(false);
            }
        };
        fetchEventDetails();
    }, [eventId]);

    const handleResponseChange = (questionId, text) => {
        setResponses(prev => ({ ...prev, [questionId]: text }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        try {
            const submissionPromises = Object.entries(responses)
                .filter(([_, text]) => text.trim() !== '')
                .map(([questionId, text]) =>
                    api.post('/register_response', {
                        text,
                        question_id: parseInt(questionId),
                        event_id: parseInt(eventId)
                    })
                );

            if (submissionPromises.length === 0) {
                throw new Error('Por favor responde al menos una pregunta.');
            }

            await Promise.all(submissionPromises);
            setSuccess(true);
            setTimeout(() => navigate('/'), 3000);
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Error al enviar las respuestas.');
        } finally {
            setSubmitting(false);
        }
    };

    const answeredCount = Object.values(responses).filter(r => r.trim() !== '').length;
    const totalQuestions = event?.questions?.length || 0;
    const progress = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;

    if (loading) {
        return (
            <div className="submission-container" style={{ paddingTop: '8rem', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-secondary)' }}>Cargando preguntas...</p>
            </div>
        );
    }

    if (success) {
        return (
            <div className="submission-container" style={{ paddingTop: '6rem' }}>
                <div className="card-elevated success-state">
                    <div className="success-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                    </div>
                    <h2>¡Gracias por participar!</h2>
                    <p>Tus respuestas han sido registradas exitosamente. Tu voz importa.</p>
                    <Link to="/" className="btn btn-primary">Volver al inicio</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="submission-container" style={{ paddingTop: '6rem' }}>
            <div className="submission-header">
                <Link to="/" style={{ color: 'var(--primary)', marginBottom: '1rem', display: 'inline-block', fontSize: '0.875rem' }}>
                    ← Salir de la encuesta
                </Link>
                <h1>{event.name}</h1>
                <p>{event.description}</p>
            </div>

            {/* Progress Bar */}
            <div style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                <span>Progreso</span>
                <span>{answeredCount} de {totalQuestions} preguntas</span>
            </div>
            <div className="progress-bar">
                <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
            </div>

            {error && (
                <div className="alert alert-error">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {event.questions.map((question, index) => (
                        <div key={question.id} className="question-card">
                            <h3>
                                <span style={{ color: 'var(--primary)', marginRight: '0.5rem' }}>{index + 1}.</span>
                                {question.text}
                            </h3>
                            <textarea
                                className="input-field"
                                rows="3"
                                placeholder="Escribe tu respuesta aquí..."
                                value={responses[question.id] || ''}
                                onChange={(e) => handleResponseChange(question.id, e.target.value)}
                            />
                        </div>
                    ))}
                </div>

                <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center' }}>
                    <button
                        type="submit"
                        className="btn btn-primary btn-large"
                        disabled={submitting}
                        style={{ minWidth: '200px' }}
                    >
                        {submitting ? 'Enviando...' : 'Enviar respuestas'}
                    </button>
                </div>

                <div className="trust-badges">
                    <span className="trust-badge">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                        </svg>
                        Respuestas anónimas
                    </span>
                    <span className="trust-badge">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                        </svg>
                        Datos seguros
                    </span>
                </div>
            </form>
        </div>
    );
};

export default ResponseSubmission;
