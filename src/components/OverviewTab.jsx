import { useState } from 'react';
import RecommendationCard from './RecommendationCard';
import Icon from './Icon';

function InfoTooltip({ text }) {
  const [visible, setVisible] = useState(false);
  return (
    <div style={{ position: 'relative', display: 'inline-flex', flexShrink: 0, alignSelf: 'center' }}>
      <span
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        style={{
          width: '17px', height: '17px', borderRadius: '50%',
          background: '#F59E0B', color: 'white',
          fontSize: '0.6rem', fontWeight: '800',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'default', userSelect: 'none', flexShrink: 0,
        }}
      >i</span>
      {visible && (
        <div style={{
          position: 'absolute', top: '22px', right: 0,
          background: '#1F2937', color: 'white',
          fontSize: '0.75rem', lineHeight: 1.45,
          padding: '0.45rem 0.65rem', borderRadius: '0.375rem',
          whiteSpace: 'nowrap', boxShadow: '0 4px 12px rgba(0,0,0,0.18)',
          zIndex: 50, pointerEvents: 'none',
        }}>
          {text}
        </div>
      )}
    </div>
  );
}

export default function OverviewTab({
  recommendations,
  recommendationsLoading,
  reports,
  locale,
  onFeedback,
  onAnalyzeClick,
  analyzing,
  summaryMode,
  onSummaryModeChange,
  selectedTimestamp,
  runTimestamps,
  onTimestampChange,
  globalSummary,
  globalSummaryLoading,
  onFetchGlobalSummary,
}) {
  const isES = locale === 'es-MX';
  const [showAllRecs, setShowAllRecs] = useState(false);
  const [showAllGlobal, setShowAllGlobal] = useState(false);

  const openReports = reports.filter(r => !r.question_type || r.question_type === 'open');
  const totalVolume = openReports.reduce((sum, r) => sum + (r.volume || 0), 0);
  const avgSentiment = openReports.length > 0 && totalVolume > 0
    ? openReports.reduce((sum, r) => sum + r.sentiment * (r.volume || 0), 0) / totalVolume
    : null;

  const topComplaint = openReports.length > 0
    ? [...openReports].sort((a, b) => b.urgency - a.urgency)[0]
    : null;

  const highAlerts = recommendations.filter(r => r.impact_level === 'high').length;
  const topRec = recommendations.find(r => r.impact_level === 'high') || recommendations[0];
  const displayRecs = showAllRecs ? recommendations : recommendations.slice(0, 6);
  const displayGlobal = showAllGlobal ? globalSummary : globalSummary.slice(0, 6);

  const getSentimentDisplay = (s) => {
    if (s === null) return { text: '—', color: 'var(--text-muted)' };
    if (s >= 0.3) return { text: isES ? 'Positivo' : 'Positive', color: '#10B981' };
    if (s <= -0.3) return { text: isES ? 'Negativo' : 'Negative', color: '#EF4444' };
    return { text: 'Neutral', color: '#6366F1' };
  };

  const selectedLabel = selectedTimestamp
    ? new Date(selectedTimestamp).toLocaleString(locale, { dateStyle: 'medium', timeStyle: 'short' })
    : null;

  const infoText = isES
    ? 'Nuevo: Resumen por fecha con IA · alertas de tendencias globales'
    : 'New: Per-date AI summary · global trend alerts';

  // ── Mode toggle buttons (top-right) ──────────────────────────────────────
  const modeToggle = (
    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexShrink: 0 }}>
      <InfoTooltip text={infoText} />
      <button
        onClick={() => onSummaryModeChange('global')}
        style={{
          padding: '0.4rem 0.9rem', borderRadius: '999px', fontSize: '0.82rem', fontWeight: '600',
          border: '1.5px solid var(--primary)',
          background: summaryMode === 'global' ? 'var(--primary)' : 'transparent',
          color: summaryMode === 'global' ? 'white' : 'var(--primary)',
          cursor: 'pointer', transition: 'all 0.15s',
        }}
      >
        {isES ? 'Resumen global' : 'Global summary'}
      </button>
      <button
        onClick={() => onSummaryModeChange('run')}
        style={{
          padding: '0.4rem 0.9rem', borderRadius: '999px', fontSize: '0.82rem', fontWeight: '600',
          border: '1.5px solid var(--primary)',
          background: summaryMode === 'run' ? 'var(--primary)' : 'transparent',
          color: summaryMode === 'run' ? 'white' : 'var(--primary)',
          cursor: 'pointer', transition: 'all 0.15s',
        }}
      >
        {isES ? 'Por fecha' : 'By date'}
      </button>
    </div>
  );

  // ── Global summary mode ───────────────────────────────────────────────────
  if (summaryMode === 'global') {
    return (
      <section style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>
              {isES ? 'Resumen global' : 'Global summary'}
            </h3>
            {(runTimestamps || []).length > 1 && (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.2rem 0 0' }}>
                {isES
                  ? `Basado en la evolución entre ${(runTimestamps || []).length} análisis`
                  : `Based on evolution across ${(runTimestamps || []).length} analyses`}
              </p>
            )}
          </div>
          {modeToggle}
        </div>

        {/* No data yet */}
        {!globalSummaryLoading && globalSummary.length === 0 && (
          <div className="reports-empty">
            <div style={{
              width: '4rem', height: '4rem', background: 'var(--primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.25rem',
            }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="white">
                <path d="M12 2L13.5 10.5L22 12L13.5 13.5L12 22L10.5 13.5L2 12L10.5 10.5Z"/>
                <path d="M20 2L20.5 4.5L23 5L20.5 5.5L20 8L19.5 5.5L17 5L19.5 4.5Z"/>
              </svg>
            </div>
            <h4>{isES ? 'Sin resumen global aún' : 'No global summary yet'}</h4>
            <p style={{ maxWidth: '28rem' }}>
              {(runTimestamps || []).length < 2
                ? (isES ? 'Ejecuta al menos 2 análisis para generar un resumen global de tendencias.' : 'Run at least 2 analyses to generate a global trend summary.')
                : (isES ? 'El resumen global se generará automáticamente en el próximo análisis.' : 'The global summary will be generated automatically on the next analysis run.')}
            </p>
          </div>
        )}

        {globalSummaryLoading && (
          <div className="reports-loading">
            <div className="reports-spinner" />
            <p>{isES ? 'Cargando resumen global...' : 'Loading global summary...'}</p>
          </div>
        )}

        {!globalSummaryLoading && globalSummary.length > 0 && (
          <>
            {/* High-impact alerts banner */}
            {globalSummary.some(r => r.impact_level === 'high') && (
              <div style={{
                padding: '0.75rem 1rem',
                background: 'var(--danger-soft)', border: '1px solid var(--danger-soft)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.85rem', color: 'var(--danger)',
                display: 'flex', alignItems: 'center', gap: '0.5rem',
              }}>
                <Icon name="alert-triangle" size={17} style={{ flexShrink: 0 }} />
                <span>
                  {globalSummary.filter(r => r.impact_level === 'high').length}{' '}
                  {isES ? 'alerta(s) de alto impacto detectada(s) en las tendencias.' : 'high-impact alert(s) detected in trends.'}
                </span>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
              {displayGlobal.map(rec => (
                <RecommendationCard
                  key={rec.id}
                  recommendation={rec}
                  onFeedback={onFeedback}
                  locale={locale}
                />
              ))}
            </div>
            {globalSummary.length > 6 && (
              <button
                onClick={() => setShowAllGlobal(prev => !prev)}
                style={{ marginTop: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', fontSize: '0.875rem', fontWeight: '600', padding: 0 }}
              >
                {showAllGlobal
                  ? (isES ? '▲ Ver menos' : '▲ Show less')
                  : (isES ? `▼ Ver todas (${globalSummary.length})` : `▼ View all (${globalSummary.length})`)}
              </button>
            )}
          </>
        )}
      </section>
    );
  }

  // ── Per-run mode ──────────────────────────────────────────────────────────
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

      {/* Header: date selector + mode toggle */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          {/* Date indicator */}
          {selectedLabel && (
            <div style={{
              fontSize: '0.82rem', color: 'var(--text-secondary)',
              padding: '0.35rem 0.75rem',
              background: 'var(--bg-secondary)', border: '1px solid var(--border)',
              borderRadius: '0.375rem', marginBottom: '0.5rem',
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
            }}>
              <Icon name="clipboard" size={13} />
              <span>
                {isES ? 'Análisis del' : 'Analysis from'}{' '}
                <strong>{selectedLabel}</strong>
              </span>
            </div>
          )}
          {/* Date selector */}
          {(runTimestamps || []).length > 1 && (
            <div>
              <select
                value={selectedTimestamp || ''}
                onChange={e => onTimestampChange(e.target.value)}
                className="input-field"
                style={{ padding: '0.3rem 0.6rem', fontSize: '0.82rem', width: 'auto', margin: 0 }}
              >
                {(runTimestamps || []).map(ts => (
                  <option key={ts} value={ts}>
                    {new Date(ts).toLocaleString(locale, { dateStyle: 'medium', timeStyle: 'short' })}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
        {modeToggle}
      </div>

      {/* A. Hero Summary */}
      {topRec && !recommendationsLoading && (
        <div style={{
          padding: '1.5rem',
          background: 'linear-gradient(135deg, var(--primary-light) 0%, var(--bg-secondary) 100%)',
          border: '1px solid var(--primary)',
          borderRadius: 'var(--radius-xl)',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
            <span style={{ flexShrink: 0, color: 'var(--primary)', display: 'flex' }}><Icon name="alert-triangle" size={26} /></span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.75rem', lineHeight: 1.4 }}>
                {topRec.title}
              </h3>
              {topRec.evidence?.slice(0, 3).map((e, i) => (
                <p key={i} style={{
                  fontSize: '0.85rem', color: 'var(--text-secondary)',
                  margin: '0 0 0.35rem',
                  paddingLeft: '0.75rem',
                  borderLeft: '2px solid var(--primary)',
                }}>
                  {e}
                </p>
              ))}
              {topRec.recommendation_text && (
                <div style={{
                  marginTop: '1rem', padding: '0.75rem 1rem',
                  background: 'var(--accent-light)', borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--accent-light)',
                }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                    fontSize: '0.7rem', fontWeight: '700',
                    color: 'var(--accent-hover)', textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}>
                    <Icon name="lightbulb" size={12} /> {isES ? 'Recomendación' : 'Recommendation'}
                  </span>
                  <p style={{ margin: '0.25rem 0 0', fontSize: '0.9rem', fontWeight: '500', color: 'var(--text-primary)' }}>
                    {topRec.recommendation_text}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* B. Key Metrics */}
      {(reports.length > 0 || recommendations.length > 0) && !recommendationsLoading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
          {avgSentiment !== null && (() => {
            const s = getSentimentDisplay(avgSentiment);
            return (
              <div className="card" style={{ padding: '1rem', textAlign: 'center' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: '700', color: s.color }}>{s.text}</span>
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {isES ? 'Sentimiento general' : 'Overall sentiment'}
                </p>
              </div>
            );
          })()}
          {topComplaint && (
            <div className="card" style={{ padding: '1rem', textAlign: 'center' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: '700', color: 'var(--text-primary)', lineHeight: 1.3, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {topComplaint.category}
              </span>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {isES ? 'Tema principal' : 'Top complaint'}
              </p>
            </div>
          )}
          {totalVolume > 0 && (
            <div className="card" style={{ padding: '1rem', textAlign: 'center' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-primary)' }}>{totalVolume}</span>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {isES ? 'Menciones analizadas' : 'Mentions analyzed'}
              </p>
            </div>
          )}
          <div className="card" style={{ padding: '1rem', textAlign: 'center' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: '700', color: highAlerts > 0 ? '#DC2626' : 'var(--text-primary)' }}>
              {highAlerts}
            </span>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {isES ? 'Alertas críticas' : 'Critical alerts'}
            </p>
          </div>
        </div>
      )}

      {/* C. Recommendations Grid */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>
            {isES ? 'Recomendaciones' : 'Recommendations'}
            {recommendations.length > 0 && (
              <span style={{
                marginLeft: '0.5rem',
                padding: '0.1rem 0.5rem',
                background: 'var(--primary-light)', color: 'var(--primary)',
                borderRadius: '999px', fontSize: '0.75rem', fontWeight: '600',
              }}>
                {recommendations.length}
              </span>
            )}
          </h3>
          <button
            onClick={onAnalyzeClick}
            disabled={analyzing}
            className="btn btn-action"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}
          >
            {analyzing ? (
              <><span className="btn-spinner" />{isES ? 'Analizando...' : 'Analyzing...'}</>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L13.5 10.5L22 12L13.5 13.5L12 22L10.5 13.5L2 12L10.5 10.5Z"/>
                  <path d="M20 2L20.5 4.5L23 5L20.5 5.5L20 8L19.5 5.5L17 5L19.5 4.5Z"/>
                </svg>
                {isES ? 'Analizar con IA' : 'Analyze with AI'}
              </>
            )}
          </button>
        </div>

        {recommendationsLoading && (
          <div className="reports-loading">
            <div className="reports-spinner" />
            <p>{isES ? 'Cargando recomendaciones...' : 'Loading recommendations...'}</p>
          </div>
        )}

        {!recommendationsLoading && recommendations.length === 0 && (
          <div className="reports-empty">
            <div style={{
              width: '4rem', height: '4rem', background: 'var(--primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.25rem',
            }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="white">
                <path d="M12 2L13.5 10.5L22 12L13.5 13.5L12 22L10.5 13.5L2 12L10.5 10.5Z"/>
                <path d="M20 2L20.5 4.5L23 5L20.5 5.5L20 8L19.5 5.5L17 5L19.5 4.5Z"/>
              </svg>
            </div>
            <h4>{isES ? 'Sin recomendaciones aún' : 'No recommendations yet'}</h4>
            <p>{isES
              ? 'Las recomendaciones se generan una vez hay problemas localizados'
              : 'Generate an AI analysis to get actionable recommendations.'}
            </p>
          </div>
        )}

        {!recommendationsLoading && recommendations.length > 0 && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
              {displayRecs.map(rec => (
                <RecommendationCard
                  key={rec.id}
                  recommendation={rec}
                  onFeedback={onFeedback}
                  locale={locale}
                />
              ))}
            </div>
            {recommendations.length > 6 && (
              <button
                onClick={() => setShowAllRecs(prev => !prev)}
                style={{
                  marginTop: '1rem', background: 'none', border: 'none',
                  cursor: 'pointer', color: 'var(--primary)',
                  fontSize: '0.875rem', fontWeight: '600', padding: 0,
                }}
              >
                {showAllRecs
                  ? (isES ? '▲ Ver menos' : '▲ Show less')
                  : (isES ? `▼ Ver todas (${recommendations.length})` : `▼ View all (${recommendations.length})`)}
              </button>
            )}
          </>
        )}
      </div>

      {/* D. Supporting Evidence */}
      {!recommendationsLoading && topRec?.evidence?.length > 0 && (
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '1rem' }}>
            {isES ? 'Evidencia de respaldo' : 'Supporting Evidence'}
          </h3>
          <div className="card" style={{ padding: '1.25rem' }}>
            <p style={{
              fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)',
              textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem',
            }}>
              {isES
                ? 'Comentarios relacionados con la recomendación principal'
                : 'Comments related to top recommendation'}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {topRec.evidence.map((e, i) => (
                <div key={i} style={{
                  padding: '0.6rem 0.875rem',
                  background: 'var(--bg-secondary)',
                  borderLeft: '2px solid var(--primary)',
                  fontSize: '0.85rem', color: 'var(--text-secondary)', fontStyle: 'italic',
                }}>
                  "{e}"
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </section>
  );
}
