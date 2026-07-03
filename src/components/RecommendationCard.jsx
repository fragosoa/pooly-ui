import Icon from './Icon';

const IMPACT = {
  high:   { icon: 'flame',          labelES: 'Alto',   labelEN: 'High',   bg: 'var(--danger-soft)', color: 'var(--danger)' },
  medium: { icon: 'alert-triangle', labelES: 'Medio',  labelEN: 'Medium', bg: 'var(--warning-soft)', color: 'var(--warning)' },
  low:    { icon: 'arrow-down',     labelES: 'Bajo',   labelEN: 'Low',    bg: 'var(--bg-secondary)', color: 'var(--text-secondary)' },
};

const URGENCY = {
  immediate:   { icon: 'zap',       labelES: 'Inmediato',   labelEN: 'Immediate' },
  monitor:     { icon: 'clock',     labelES: 'Monitorear',  labelEN: 'Monitor' },
  opportunity: { icon: 'lightbulb', labelES: 'Oportunidad', labelEN: 'Opportunity' },
};

export default function RecommendationCard({ recommendation, onFeedback, locale }) {
  const isES = locale === 'es-MX';
  const userVote = recommendation.user_vote ?? null;

  const impact = IMPACT[recommendation.impact_level] || IMPACT.medium;
  const urgency = URGENCY[recommendation.urgency_level] || URGENCY.monitor;

  const handleFeedback = (helpful) => {
    if (userVote !== null) return;
    onFeedback(recommendation.id, helpful);
  };

  return (
    <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Badges row */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
          padding: '0.25rem 0.625rem', borderRadius: 'var(--radius-pill)',
          fontSize: '0.75rem', fontWeight: '600',
          background: impact.bg, color: impact.color,
        }}>
          <Icon name={impact.icon} size={12} />
          {isES ? impact.labelES : impact.labelEN}
        </span>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
          padding: '0.25rem 0.625rem', borderRadius: 'var(--radius-pill)',
          fontSize: '0.75rem', fontWeight: '600',
          background: 'var(--bg-secondary)', color: 'var(--text-secondary)',
          border: '1px solid var(--border)',
        }}>
          <Icon name={urgency.icon} size={12} />
          {isES ? urgency.labelES : urgency.labelEN}
        </span>
        {recommendation.type === 'historical' && (
          <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.7rem', color: 'var(--primary)', fontWeight: '500' }}>
            <Icon name="trending-up" size={12} />
            {isES ? 'Basado en tendencia' : 'Based on trend'}
          </span>
        )}
      </div>

      {/* Title */}
      <h4 style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-primary)', margin: 0, lineHeight: 1.4 }}>
        {recommendation.title}
      </h4>

      {/* Evidence */}
      {recommendation.evidence?.length > 0 && (
        <ul style={{ margin: 0, padding: '0 0 0 1.1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {recommendation.evidence.slice(0, 3).map((e, i) => (
            <li key={i} style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>{e}</li>
          ))}
        </ul>
      )}

      {/* Recommendation text — acción recomendada, spec de ReportCard.jsx */}
      <div style={{
        display: 'flex', gap: '0.625rem', alignItems: 'flex-start',
        padding: '0.75rem 0.875rem',
        background: 'var(--accent-light)',
        border: '1px solid var(--accent-light)',
        borderRadius: 'var(--radius-md)',
      }}>
        <span style={{ fontSize: '0.6875rem', fontWeight: '800', color: 'var(--accent-hover)', textTransform: 'uppercase', letterSpacing: '0.05em', flexShrink: 0, marginTop: '0.1rem' }}>
          {isES ? 'Acción' : 'Action'}
        </span>
        <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
          {recommendation.recommendation_text}
        </p>
      </div>

      {/* Feedback row */}
      <div style={{
        display: 'flex', gap: '0.5rem', alignItems: 'center',
        paddingTop: '0.5rem', borderTop: '1px solid var(--border)',
      }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginRight: 'auto' }}>
          {isES ? '¿Fue útil?' : 'Was this helpful?'}
        </span>
        <button
          onClick={() => handleFeedback(true)}
          disabled={userVote !== null}
          style={{
            background: userVote === 'helpful' ? 'var(--primary-light)' : 'none',
            border: `1px solid ${userVote === 'helpful' ? 'var(--primary)' : 'var(--border)'}`,
            borderRadius: 'var(--radius-sm)',
            padding: '0.25rem 0.6rem',
            cursor: userVote !== null ? 'default' : 'pointer',
            fontSize: '0.8rem',
            display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
            color: userVote === 'helpful' ? 'var(--primary)' : 'var(--text-secondary)',
            transition: 'var(--transition-control)',
          }}
        >
          <Icon name="thumbs-up" size={14} />
          {recommendation.helpful_votes > 0 ? recommendation.helpful_votes : ''}
        </button>
        <button
          onClick={() => handleFeedback(false)}
          disabled={userVote !== null}
          style={{
            background: userVote === 'not_helpful' ? 'var(--danger-soft)' : 'none',
            border: `1px solid ${userVote === 'not_helpful' ? 'var(--danger)' : 'var(--border)'}`,
            borderRadius: 'var(--radius-sm)',
            padding: '0.25rem 0.6rem',
            cursor: userVote !== null ? 'default' : 'pointer',
            fontSize: '0.8rem',
            display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
            color: userVote === 'not_helpful' ? 'var(--danger)' : 'var(--text-secondary)',
            transition: 'var(--transition-control)',
          }}
        >
          <Icon name="thumbs-down" size={14} />
          {recommendation.not_helpful_votes > 0 ? recommendation.not_helpful_votes : ''}
        </button>
      </div>
    </div>
  );
}
