import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

export default function PublicSurvey() {
  const { publicId } = useParams();
  const [event, setEvent] = useState(null);
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        // Usa el endpoint público con public_id
        const response = await api.get(`/events/public/${publicId}`);
        setEvent(response.data.data);
      } catch (err) {
        console.error('Failed to fetch event:', err);
        setError('No se pudo cargar la encuesta.');
        // Mock data para desarrollo
        setEvent({
          public_id: publicId,
          name: 'Movilidad Urbana 2026',
          description: 'Ayúdanos a mejorar el transporte de nuestra ciudad. Tu opinión es importante para nosotros.',
          questions: [
            { id: 101, text: '¿Cuál es tu principal medio de transporte para ir al trabajo o escuela?' },
            { id: 102, text: '¿Qué opinas sobre las ciclovías actuales en la ciudad?' },
            { id: 103, text: '¿Qué mejora priorizarías para el transporte público?' }
          ]
        });
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [publicId]);

  const handleResponseChange = (questionId, text) => {
    setResponses(prev => ({ ...prev, [questionId]: text }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const answeredQuestions = Object.entries(responses)
        .filter(([_, text]) => text.trim() !== '');

      if (answeredQuestions.length === 0) {
        throw new Error('Por favor responde al menos una pregunta.');
      }

      // Construir payload con todas las respuestas
      const payload = {
        public_id: publicId,
        responses: answeredQuestions.map(([questionId, text]) => ({
          text: text.trim(),
          question_id: parseInt(questionId)
        }))
      };

      // Una sola llamada al backend
      await api.post(`/events/public/${publicId}/respond`, payload);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error al enviar las respuestas.');
    } finally {
      setSubmitting(false);
    }
  };

  const answeredCount = Object.values(responses).filter(r => r.trim() !== '').length;
  const totalQuestions = event?.questions?.length || 0;

  if (loading) {
    return (
      <div className="survey-page">
        <div className="survey-loading">
          <div className="survey-loading-spinner"></div>
          <p>Cargando encuesta...</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="survey-page">
        <div className="survey-success">
          <div className="survey-success-icon">✓</div>
          <h1>¡Gracias por participar!</h1>
          <p>Tus respuestas han sido registradas exitosamente.</p>
          <p className="survey-success-note">Tu opinión es valiosa y nos ayuda a tomar mejores decisiones.</p>
          <Link to="/" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>
            Ir a Pooly
          </Link>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="survey-page">
        <div className="survey-error">
          <h1>Encuesta no encontrada</h1>
          <p>El enlace que seguiste no es válido o la encuesta ya no está disponible.</p>
          <Link to="/" className="btn btn-primary" style={{ marginTop: '1rem' }}>
            Ir a Pooly
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="survey-page">
      {/* Header minimalista */}
      <header className="survey-header">
        <Link to="/" className="survey-brand">Pooly</Link>
        <div className="survey-progress-badge">
          {answeredCount} de {totalQuestions}
        </div>
      </header>

      {/* Hero del evento */}
      <div className="survey-hero">
        <h1 className="survey-title">{event.name}</h1>
        <p className="survey-description">{event.description}</p>
      </div>

      {/* Contenedor principal tipo chat */}
      <div className="survey-container">
        {error && (
          <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="chat-container">
            {event.questions.map((question, index) => (
              <div key={question.id} className="chat-block">
                {/* Mensaje del "asistente" (pregunta) */}
                <div className="chat-message chat-assistant">
                  <div className="chat-avatar">
                    <span>P</span>
                  </div>
                  <div className="chat-bubble">
                    <div className="chat-question-number">Pregunta {index + 1}</div>
                    <div className="chat-question-text">{question.text}</div>
                  </div>
                </div>

                {/* Área de respuesta del usuario */}
                <div className="chat-message chat-user">
                  <div className="chat-input-container">
                    <textarea
                      className="chat-textarea"
                      placeholder="Escribe tu respuesta aquí..."
                      value={responses[question.id] || ''}
                      onChange={(e) => handleResponseChange(question.id, e.target.value)}
                      rows={3}
                    />
                    {responses[question.id]?.trim() && (
                      <div className="chat-input-status">✓</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer con botón de envío */}
          <div className="survey-footer">
            <div className="survey-footer-info">
              <span className="survey-footer-icon">🔒</span>
              <span>Tus respuestas son anónimas y seguras</span>
            </div>
            <button
              type="submit"
              className="btn btn-primary btn-large survey-submit"
              disabled={submitting || answeredCount === 0}
            >
              {submitting ? 'Enviando...' : `Enviar ${answeredCount > 0 ? `(${answeredCount})` : ''}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
