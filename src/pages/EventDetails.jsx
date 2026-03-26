import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import Modal from '../components/Modal';

export default function EventDetails() {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisStatus, setAnalysisStatus] = useState('');
  const [copied, setCopied] = useState(false);

  // Modal state
  const [showAnalyzeModal, setShowAnalyzeModal] = useState(false);

  // Tabs state
  const [activeTab, setActiveTab] = useState('responses');

  // Reports state
  const [reports, setReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reportsError, setReportsError] = useState('');

  // Jobs state
  const [jobs, setJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [jobsError, setJobsError] = useState('');

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

  // Fetch reports
  const fetchReports = async () => {
    setReportsLoading(true);
    setReportsError('');
    try {
      const response = await api.get(`/events/${eventId}/reports`);
      if (response.data.status === 'success') {
        setReports(response.data.reports || []);
      } else {
        setReports([]);
      }
    } catch (err) {
      console.error('Failed to fetch reports:', err);
      setReportsError('No se pudieron cargar los reportes.');
      // Mock data para desarrollo
      setReports([
        {
          id: 1,
          event_id: eventId,
          category: 'Transporte público',
          volume: 45,
          percentage: 35.5,
          urgency: 0.8,
          sentiment: -0.2,
          summary: 'Los ciudadanos expresan preocupación por la frecuencia del transporte público y la saturación en horas pico.',
          examples: ['Necesitamos más autobuses', 'El metro siempre está lleno'],
          timestamp: '2026-01-29T10:30:00'
        },
        {
          id: 2,
          event_id: eventId,
          category: 'Ciclovías',
          volume: 30,
          percentage: 23.6,
          urgency: 0.6,
          sentiment: 0.4,
          summary: 'Solicitudes de expansión de la red de ciclovías con enfoque en seguridad y conectividad.',
          examples: ['Más carriles para bicicletas', 'Conectar el centro con los barrios'],
          timestamp: '2026-01-29T10:30:00'
        },
        {
          id: 3,
          event_id: eventId,
          category: 'Estacionamiento',
          volume: 20,
          percentage: 15.7,
          urgency: 0.4,
          sentiment: -0.5,
          summary: 'Quejas sobre la falta de estacionamiento en zonas comerciales y costos elevados.',
          examples: ['No hay donde estacionarse', 'Los parquímetros son muy caros'],
          timestamp: '2026-01-29T10:30:00'
        }
      ]);
    } finally {
      setReportsLoading(false);
    }
  };

  // Fetch reports when tab changes to reports
  useEffect(() => {
    if (activeTab === 'reports' && reports.length === 0 && !reportsLoading) {
      fetchReports();
    }
  }, [activeTab]);

  // Fetch jobs
  const fetchJobs = async () => {
    setJobsLoading(true);
    setJobsError('');
    try {
      const response = await api.get(`/jobs/event/${eventId}`);
      if (response.data.status === 'success') {
        setJobs(response.data.jobs || []);
      } else {
        setJobs([]);
        setJobsError('No es posible recuperar la información en este momento.');
      }
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
      setJobsError('No es posible recuperar la información en este momento.');
      // Mock data para desarrollo
      setJobs([
        {
          id: 1,
          event_id: eventId,
          status: 'COMPLETED',
          created_at: '2026-01-29T10:00:00',
          updated_at: '2026-01-29T10:05:32',
          message: 'Análisis completado exitosamente'
        },
        {
          id: 2,
          event_id: eventId,
          status: 'RUNNING',
          created_at: '2026-01-30T09:15:00',
          updated_at: '2026-01-30T09:15:00',
          message: 'Procesando respuestas...'
        },
        {
          id: 3,
          event_id: eventId,
          status: 'ERROR',
          created_at: '2026-01-28T14:30:00',
          updated_at: '2026-01-28T14:31:15',
          message: 'Error: No hay suficientes respuestas para analizar'
        }
      ]);
    } finally {
      setJobsLoading(false);
    }
  };

  // Fetch jobs when tab changes to status
  useEffect(() => {
    if (activeTab === 'status' && jobs.length === 0 && !jobsLoading) {
      fetchJobs();
    }
  }, [activeTab]);

  // Helper function for job status
  const getJobStatusInfo = (status) => {
    switch (status) {
      case 'COMPLETED':
        return { label: 'Completado', class: 'completed', icon: '✓' };
      case 'RUNNING':
        return { label: 'En proceso', class: 'running', icon: '⟳' };
      case 'ERROR':
        return { label: 'Error', class: 'error', icon: '✕' };
      default:
        return { label: status, class: 'unknown', icon: '?' };
    }
  };

  const handleAnalyzeClick = () => {
    setShowAnalyzeModal(true);
  };

  const handleAnalyzeConfirm = async () => {
    setShowAnalyzeModal(false);
    setAnalyzing(true);
    setAnalysisStatus('');
    try {
      await api.post(`/events/${eventId}/analyze`);
      setAnalysisStatus('¡Análisis iniciado exitosamente! Puedes monitorear el progreso en la sección Status.');
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

  // Helper functions for reports
  const getSentimentLabel = (sentiment) => {
    if (sentiment >= 0.3) return { text: 'Positivo', class: 'positive' };
    if (sentiment <= -0.3) return { text: 'Negativo', class: 'negative' };
    return { text: 'Neutral', class: 'neutral' };
  };

  const getUrgencyLabel = (urgency) => {
    if (urgency >= 0.7) return { text: 'Alta', class: 'high' };
    if (urgency >= 0.4) return { text: 'Media', class: 'medium' };
    return { text: 'Baja', class: 'low' };
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
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              onClick={handleAnalyzeClick}
              disabled={analyzing}
              title="Analizar con IA"
              style={{
                width: '3rem',
                height: '3rem',
                borderRadius: '50%',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: 'none',
                cursor: analyzing ? 'not-allowed' : 'pointer',
                background: analyzing
                  ? 'linear-gradient(135deg, #a78bfa, #818cf8)'
                  : 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                boxShadow: analyzing ? 'none' : '0 0 0 3px rgba(124,58,237,0.2), 0 4px 12px rgba(124,58,237,0.4)',
                transition: 'box-shadow 0.2s, transform 0.15s',
                transform: analyzing ? 'scale(0.95)' : 'scale(1)',
              }}
            >
              {analyzing ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'spin 1s linear infinite' }}>
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                  <path d="M12 2L13.5 10.5L22 12L13.5 13.5L12 22L10.5 13.5L2 12L10.5 10.5Z"/>
                  <path d="M20 2L20.5 4.5L23 5L20.5 5.5L20 8L19.5 5.5L17 5L19.5 4.5Z"/>
                </svg>
              )}
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

      {/* Tabs Navigation */}
      <div className="tabs-container">
        <div className="tabs-nav">
          <button
            className={`tab-btn ${activeTab === 'responses' ? 'active' : ''}`}
            onClick={() => setActiveTab('responses')}
          >
            <span className="tab-icon">💬</span>
            Respuestas
          </button>
          <button
            className={`tab-btn ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            <span className="tab-icon">📊</span>
            Reportes IA
            {reports.length > 0 && (
              <span className="tab-badge">{reports.length}</span>
            )}
          </button>
          <button
            className={`tab-btn ${activeTab === 'status' ? 'active' : ''}`}
            onClick={() => setActiveTab('status')}
          >
            <span className="tab-icon">⚙️</span>
            Status
            {jobs.filter(j => j.status === 'RUNNING').length > 0 && (
              <span className="tab-badge running">{jobs.filter(j => j.status === 'RUNNING').length}</span>
            )}
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {/* Responses Tab */}
          {activeTab === 'responses' && (
            <section>
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
          )}

          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <section>
              {/* Reports Header */}
              <div className="reports-header">
                <div>
                  <h3 className="reports-title">Análisis de Respuestas</h3>
                  <p className="reports-subtitle">
                    {reports.length > 0
                      ? `${reports.length} categorías identificadas por IA`
                      : 'Los reportes aparecerán aquí después del análisis'}
                  </p>
                </div>
                <button
                  onClick={fetchReports}
                  className="btn btn-secondary"
                  disabled={reportsLoading}
                >
                  {reportsLoading ? (
                    <>
                      <span className="btn-spinner"></span>
                      Cargando...
                    </>
                  ) : (
                    <>↻ Actualizar</>
                  )}
                </button>
              </div>

              {reportsError && (
                <div className="alert" style={{ background: 'var(--primary-light)', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                  {reportsError} (Mostrando datos de demostración)
                </div>
              )}

              {/* Loading State */}
              {reportsLoading && reports.length === 0 && (
                <div className="reports-loading">
                  <div className="reports-spinner"></div>
                  <p>Cargando reportes...</p>
                </div>
              )}

              {/* Empty State */}
              {!reportsLoading && reports.length === 0 && (
                <div className="reports-empty">
                  <div style={{
                    width: '4rem',
                    height: '4rem',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.25rem',
                    boxShadow: '0 0 0 6px rgba(124,58,237,0.12), 0 4px 16px rgba(124,58,237,0.3)',
                  }}>
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="white">
                      <path d="M12 2L13.5 10.5L22 12L13.5 13.5L12 22L10.5 13.5L2 12L10.5 10.5Z"/>
                      <path d="M20 2L20.5 4.5L23 5L20.5 5.5L20 8L19.5 5.5L17 5L19.5 4.5Z"/>
                    </svg>
                  </div>
                  <h4>Sin reportes disponibles</h4>
                  <p>Genera un análisis con IA para obtener insights de las respuestas.</p>
                  <button
                    onClick={handleAnalyzeClick}
                    disabled={analyzing}
                    style={{
                      marginTop: '1rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.6rem 1.25rem',
                      borderRadius: '999px',
                      border: 'none',
                      cursor: 'pointer',
                      background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                      color: 'white',
                      fontWeight: '600',
                      fontSize: '0.9rem',
                      boxShadow: '0 4px 12px rgba(124,58,237,0.35)',
                    }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="white">
                      <path d="M12 2L13.5 10.5L22 12L13.5 13.5L12 22L10.5 13.5L2 12L10.5 10.5Z"/>
                      <path d="M20 2L20.5 4.5L23 5L20.5 5.5L20 8L19.5 5.5L17 5L19.5 4.5Z"/>
                    </svg>
                    Analizar con IA
                  </button>
                </div>
              )}

              {/* Reports Grid */}
              {reports.length > 0 && (
                <div className="reports-grid">
                  {reports.map(report => {
                    const sentiment = getSentimentLabel(report.sentiment);
                    const urgency = getUrgencyLabel(report.urgency);

                    return (
                      <div key={report.id} className="report-card">
                        <div className="report-card-header">
                          <h4 className="report-category">{report.category}</h4>
                          <div className="report-badges">
                            <span className={`report-badge sentiment-${sentiment.class}`}>
                              {sentiment.text}
                            </span>
                            <span className={`report-badge urgency-${urgency.class}`}>
                              Urgencia: {urgency.text}
                            </span>
                          </div>
                        </div>

                        <div className="report-stats">
                          <div className="report-stat">
                            <span className="report-stat-value">{report.volume}</span>
                            <span className="report-stat-label">menciones</span>
                          </div>
                          <div className="report-stat">
                            <span className="report-stat-value">{report.percentage.toFixed(1)}%</span>
                            <span className="report-stat-label">del total</span>
                          </div>
                        </div>

                        <p className="report-summary">{report.summary}</p>

                        {report.examples && report.examples.length > 0 && (
                          <div className="report-examples">
                            <span className="report-examples-label">Ejemplos:</span>
                            <ul className="report-examples-list">
                              {report.examples.map((example, idx) => (
                                <li key={idx}>"{example}"</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div className="report-timestamp">
                          Generado: {new Date(report.timestamp).toLocaleString('es-MX')}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {/* Status Tab */}
          {activeTab === 'status' && (
            <section>
              {/* Status Header */}
              <div className="reports-header">
                <div>
                  <h3 className="reports-title">Estado de Análisis</h3>
                  <p className="reports-subtitle">
                    {jobs.length > 0
                      ? `${jobs.length} trabajos registrados`
                      : 'Los trabajos de análisis aparecerán aquí'}
                  </p>
                </div>
                <button
                  onClick={fetchJobs}
                  className="btn btn-secondary"
                  disabled={jobsLoading}
                >
                  {jobsLoading ? (
                    <>
                      <span className="btn-spinner"></span>
                      Cargando...
                    </>
                  ) : (
                    <>↻ Actualizar</>
                  )}
                </button>
              </div>

              {jobsError && !jobs.length && (
                <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
                  {jobsError}
                </div>
              )}

              {/* Loading State */}
              {jobsLoading && jobs.length === 0 && (
                <div className="reports-loading">
                  <div className="reports-spinner"></div>
                  <p>Cargando trabajos...</p>
                </div>
              )}

              {/* Empty State */}
              {!jobsLoading && jobs.length === 0 && !jobsError && (
                <div className="reports-empty">
                  <div className="reports-empty-icon">⚙️</div>
                  <h4>Sin trabajos registrados</h4>
                  <p>Cuando inicies un análisis con IA, podrás ver su progreso aquí.</p>
                </div>
              )}

              {/* Jobs Table */}
              {jobs.length > 0 && (
                <div className="jobs-table-container">
                  <table className="jobs-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Estado</th>
                        <th>Mensaje</th>
                        <th>Iniciado</th>
                        <th>Actualizado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {jobs.map(job => {
                        const statusInfo = getJobStatusInfo(job.status);
                        return (
                          <tr key={job.id}>
                            <td className="jobs-table-id">#{job.id}</td>
                            <td>
                              <span className={`job-status job-status-${statusInfo.class}`}>
                                <span className="job-status-icon">{statusInfo.icon}</span>
                                {statusInfo.label}
                              </span>
                            </td>
                            <td className="jobs-table-message">{job.message || '—'}</td>
                            <td className="jobs-table-date">
                              {new Date(job.created_at).toLocaleString('es-MX', {
                                dateStyle: 'short',
                                timeStyle: 'short'
                              })}
                            </td>
                            <td className="jobs-table-date">
                              {new Date(job.updated_at).toLocaleString('es-MX', {
                                dateStyle: 'short',
                                timeStyle: 'short'
                              })}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}
        </div>
      </div>

      {/* Modal de confirmación para análisis */}
      <Modal
        isOpen={showAnalyzeModal}
        onClose={() => setShowAnalyzeModal(false)}
        title="Iniciar análisis con IA"
        footer={
          <div className="modal-actions">
            <button
              className="btn btn-secondary"
              onClick={() => setShowAnalyzeModal(false)}
            >
              Cancelar
            </button>
            <button
              className="btn btn-primary"
              onClick={handleAnalyzeConfirm}
            >
              Iniciar análisis
            </button>
          </div>
        }
      >
        <div className="modal-confirm-content">
          <div className="modal-icon">🤖</div>
          <p className="modal-message">
            Estás a punto de iniciar un análisis de las respuestas con inteligencia artificial.
          </p>
          <div className="modal-info-box">
            <div className="modal-info-item">
              <span className="modal-info-icon">⏱️</span>
              <span>El proceso puede tardar <strong>unos minutos</strong> dependiendo del volumen de respuestas.</span>
            </div>
            <div className="modal-info-item">
              <span className="modal-info-icon">📊</span>
              <span>Podrás monitorear el progreso en la sección <strong>Status</strong>.</span>
            </div>
            <div className="modal-info-item">
              <span className="modal-info-icon">🔔</span>
              <span>Recibirás los resultados en la pestaña <strong>Reportes IA</strong> cuando termine.</span>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
