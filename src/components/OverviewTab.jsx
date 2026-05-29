import { useState } from 'react';
import RecommendationCard from './RecommendationCard';

export default function OverviewTab({
  recommendations,
  recommendationsLoading,
  reports,
  locale,
  onFeedback,
  onAnalyzeClick,
  analyzing,
}) {
  const isES = locale === 'es-MX';
  const [showAllRecs, setShowAllRecs] = useState(false);

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

  const getSentimentDisplay = (s) => {
    if (s === null) return { text: '—', color: 'var(--text-muted)' };
    if (s >= 0.3) return { text: isES ? 'Positivo' : 'Positive', color: '#10B981' };
    if (s <= -0.3) return { text: isES ? 'Negativo' : 'Negative', color: '#EF4444' };
    return { text: 'Neutral', color: '#6366F1' };
  };

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

      {/* A. Hero Summary */}
      {topRec && !recommendationsLoading && (
        <div style={{
          padding: '1.5rem',
          background: 'linear-gradient(135deg, var(--primary-light) 0%, var(--bg-secondary) 100%)',
          border: '1px solid var(--primary)',
          borderRadius: '0.5rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
            <span style={{ fontSize: '1.75rem', lineHeight: 1, flexShrink: 0 }}>⚠️</span>
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
                  background: 'white', borderRadius: '0.375rem',
                  border: '1px solid var(--border)',
                }}>
                  <span style={{
                    fontSize: '0.7rem', fontWeight: '600',
                    color: 'var(--primary)', textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}>
                    💡 {isES ? 'Recomendación' : 'Recommendation'}
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
            className="btn btn-primary"
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
              ? 'Genera un análisis con IA para obtener recomendaciones accionables.'
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
