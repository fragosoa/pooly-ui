import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

export default function EventDetails() {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisStatus, setAnalysisStatus] = useState('');
  const [copied, setCopied] = useState(false);

  // El enlace usa el public_id del evento
  const shareUrl = event?.public_id
    ? `${window.location.origin}/encuesta/${event.public_id}`
    : '';

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const response = await api.get(`/events/${eventId}/details`);
        setEvent(response.data.data);
      } catch (err) {
        console.error('Failed to fetch event details:', err);
        setError('No se pudieron cargar los detalles del evento.');
        // Mock data con public_id para desarrollo
        setEvent({
          id: eventId,
          public_id: 'demo-abc123',
          name: 'Movilidad Urbana 2026',
          description: '¿Qué opinas sobre las nuevas ciclovías en el centro de la ciudad?',
          end: '2026-12-31',
          questions: [
            {
              id: 101,
              text: '¿Cuál es tu principal medio de transporte?',
              responses: [
                { id: 1001, text: 'Uso el metro todos los días.' },
                { id: 1002, text: 'Principalmente bicicleta, pero me siento inseguro.' }
              ]
            },
            {
              id: 102,
              text: '¿Estás satisfecho con las ciclovías actuales?',
              responses: [
                { id: 2001, text: 'No, son demasiado angostas.' }
              ]
            }
          ]
        });
      } finally {
        setLoading(false);
      }
    };
    fetchEventDetails();
  }, [eventId]);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    setAnalysisStatus('');
    try {
      await api.post(`/events/${eventId}/analyze`);
      setAnalysisStatus('¡Análisis iniciado exitosamente!');
    } catch (err) {
      setAnalysisStatus('Error al iniciar el análisis. Intenta de nuevo.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleCopyLink = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const totalResponses = event?.questions?.reduce(
    (sum, q) => sum + (q.responses?.length || 0), 0
  ) || 0;

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: '6rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Cargando detalles del evento...</p>
      </div>
    );
  }

  if (!event && error) {
    return (
      <div className="container" style={{ paddingTop: '6rem' }}>
        <div className="alert alert-error">{error}</div>
      </div>
    );
  }

  if (!event) return null;

  return (
    <div className="container" style={{ paddingTop: '5rem', paddingBottom: '4rem' }}>
      <header style={{ marginBottom: '2rem' }}>
        <Link to="/admin" className="back-link">← Volver al panel</Link>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="page-title">{event.name}</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>{event.description}</p>
            <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              <span>Finaliza: {new Date(event.end).toLocaleDateString('es-MX')}</span>
              <span>{totalResponses} respuestas totales</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              onClick={handleAnalyze}
              className="btn btn-primary"
              disabled={analyzing}
            >
              {analyzing ? 'Analizando...' : 'Analizar con IA'}
            </button>
          </div>
        </div>

        {analysisStatus && (
          <div className={`alert ${analysisStatus.includes('exitosamente') ? 'alert-success' : 'alert-error'}`} style={{ marginTop: '1rem' }}>
            {analysisStatus}
          </div>
        )}
      </header>

      {/* Share Link Card - Destacado */}
      <div className="share-card">
        <div className="share-card-header">
          <div className="share-card-icon">🔗</div>
          <div>
            <h3 className="share-card-title">Enlace para compartir</h3>
            <p className="share-card-subtitle">Comparte este enlace con los participantes</p>
          </div>
        </div>
        <div className="share-card-url">
          <input
            type="text"
            readOnly
            value={shareUrl || 'Generando enlace...'}
            className="share-card-input"
          />
          <button
            onClick={handleCopyLink}
            className={`share-card-btn ${copied ? 'copied' : ''}`}
            disabled={!shareUrl}
          >
            {copied ? '✓ Copiado' : 'Copiar'}
          </button>
        </div>
        <p className="share-card-hint">
          Las respuestas son completamente anónimas. Los participantes no necesitan crear cuenta.
        </p>
      </div>

      {error && event.questions && (
        <div className="alert" style={{ background: 'var(--primary-light)', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          {error} (Mostrando datos de demostración)
        </div>
      )}

      <section>
        <h2 className="section-title" style={{ marginBottom: '1.5rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)' }}>
          Preguntas y Respuestas
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {event.questions?.map((question, index) => (
            <div key={question.id} className="card" style={{ overflow: 'hidden', padding: 0 }}>
              <div style={{
                padding: '1rem 1.25rem',
                background: 'var(--bg-secondary)',
                borderBottom: '1px solid var(--border)'
              }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                  <span style={{ color: 'var(--primary)', marginRight: '0.5rem' }}>{index + 1}.</span>
                  {question.text}
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {question.responses?.length || 0} respuestas
                </span>
              </div>
              <div style={{ padding: '1rem 1.25rem' }}>
                {question.responses?.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    Sin respuestas aún.
                  </p>
                ) : (
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {question.responses?.map(response => (
                      <li key={response.id} className="response-item">
                        {response.text}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
