import { useState } from 'react';

const IMPACT = {
  high:   { icon: '🔴', labelES: 'Alto',       labelEN: 'High',        bg: '#FEF2F2', color: '#DC2626' },
  medium: { icon: '🟡', labelES: 'Medio',      labelEN: 'Medium',      bg: '#FFFBEB', color: '#D97706' },
  low:    { icon: '⚪', labelES: 'Bajo',        labelEN: 'Low',         bg: '#F9FAFB', color: '#6B7280' },
};

const URGENCY = {
  immediate:   { icon: '⚠️', labelES: 'Inmediato',   labelEN: 'Immediate'   },
  monitor:     { icon: '📅', labelES: 'Monitorear',  labelEN: 'Monitor'     },
  opportunity: { icon: '💡', labelES: 'Oportunidad', labelEN: 'Opportunity' },
};

export default function RecommendationCard({ recommendation, onFeedback, locale }) {
  const isES = locale === 'es-MX';
  const [feedbackGiven, setFeedbackGiven] = useState(null);

  const impact = IMPACT[recommendation.impact_level] || IMPACT.medium;
  const urgency = URGENCY[recommendation.urgency_level] || URGENCY.monitor;

  const handleFeedback = (helpful) => {
    if (feedbackGiven !== null) return;
    setFeedbackGiven(helpful);
    onFeedback(recommendation.id, helpful);
  };

  return (
    <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Badges row */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
          padding: '0.2rem 0.6rem', borderRadius: '999px',
          fontSize: '0.75rem', fontWeight: '600',
          background: impact.bg, color: impact.color,
        }}>
          {impact.icon} {isES ? impact.labelES : impact.labelEN}
        </span>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
          padding: '0.2rem 0.6rem', borderRadius: '999px',
          fontSize: '0.75rem', fontWeight: '600',
          background: 'var(--bg-secondary)', color: 'var(--text-secondary)',
          border: '1px solid var(--border)',
        }}>
          {urgency.icon} {isES ? urgency.labelES : urgency.labelEN}
        </span>
        {recommendation.type === 'historical' && (
          <span style={{ marginLeft: 'auto', fontSize: '0.7rem', color: 'var(--primary)', fontWeight: '500' }}>
            ↗ {isES ? 'Basado en tendencia' : 'Based on trend'}
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

      {/* Recommendation text */}
      <div style={{
        padding: '0.75rem 1rem',
        background: 'var(--primary-light)',
        borderLeft: '3px solid var(--primary)',
        borderRadius: '0 0.375rem 0.375rem 0',
      }}>
        <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-primary)' }}>
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
          disabled={feedbackGiven !== null}
          style={{
            background: feedbackGiven === true ? 'var(--primary-light)' : 'none',
            border: `1px solid ${feedbackGiven === true ? 'var(--primary)' : 'var(--border)'}`,
            borderRadius: '0.375rem',
            padding: '0.25rem 0.6rem',
            cursor: feedbackGiven !== null ? 'default' : 'pointer',
            fontSize: '0.8rem',
            display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
            color: feedbackGiven === true ? 'var(--primary)' : 'var(--text-secondary)',
            transition: 'all 0.15s',
          }}
        >
          👍{' '}
          {(recommendation.helpful_votes + (feedbackGiven === true ? 1 : 0)) > 0
            ? recommendation.helpful_votes + (feedbackGiven === true ? 1 : 0)
            : ''}
        </button>
        <button
          onClick={() => handleFeedback(false)}
          disabled={feedbackGiven !== null}
          style={{
            background: feedbackGiven === false ? '#FEF2F2' : 'none',
            border: `1px solid ${feedbackGiven === false ? '#DC2626' : 'var(--border)'}`,
            borderRadius: '0.375rem',
            padding: '0.25rem 0.6rem',
            cursor: feedbackGiven !== null ? 'default' : 'pointer',
            fontSize: '0.8rem',
            display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
            color: feedbackGiven === false ? '#DC2626' : 'var(--text-secondary)',
            transition: 'all 0.15s',
          }}
        >
          👎{' '}
          {(recommendation.not_helpful_votes + (feedbackGiven === false ? 1 : 0)) > 0
            ? recommendation.not_helpful_votes + (feedbackGiven === false ? 1 : 0)
            : ''}
        </button>
      </div>
    </div>
  );
}
