import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext';

export default function PublicSurvey() {
  const { publicId } = useParams();
  const { t } = useLanguage();
  const [event, setEvent] = useState(null);
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await api.get(`/events/public/${publicId}`);
        setEvent(response.data.data);
      } catch (err) {
        console.error('Failed to fetch event:', err);
        setError(t('survey.errorLoad'));
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
      const answeredQuestions = Object.entries(responses).filter(([_, text]) => text.trim() !== '');

      if (answeredQuestions.length === 0) {
        throw new Error(t('survey.errorAtLeastOne'));
      }

      const toNums = (pairs) =>
        pairs.map(([id]) => event.questions.findIndex(q => q.id === parseInt(id)) + 1).join(', ');

      const tooShortList = answeredQuestions.filter(([_, text]) => text.trim().length < 5);
      if (tooShortList.length > 0) {
        throw new Error(t('survey.errorMinChars', { nums: toNums(tooShortList) }));
      }

      const tooLongList = answeredQuestions.filter(([_, text]) => text.trim().length > 500);
      if (tooLongList.length > 0) {
        throw new Error(t('survey.errorMaxChars', { nums: toNums(tooLongList) }));
      }

      const payload = {
        public_id: publicId,
        responses: answeredQuestions.map(([questionId, text]) => ({
          text: text.trim(),
          question_id: parseInt(questionId)
        }))
      };

      await api.post(`/events/public/${publicId}/respond`, payload);
      setSuccess(true);
    } catch (err) {
      const status = err.response?.status;
      if (status === 400) {
        setError(err.message || t('survey.errorMinChars', { num: '?' }));
      } else if (status === 422) {
        setError(err.message || t('survey.errorMaxChars', { num: '?' }));
      } else {
        setError(err.message || t('survey.errorSubmit'));
      }
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
          <p>{t('survey.loading')}</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="survey-page">
        <div className="survey-success">
          <div className="survey-success-icon">✓</div>
          <h1>{t('survey.successTitle')}</h1>
          <p>{t('survey.successDesc')}</p>
          <p className="survey-success-note">{t('survey.successNote')}</p>
          <Link to="/" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>
            {t('survey.goToPooly')}
          </Link>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="survey-page">
        <div className="survey-error">
          <h1>{t('survey.notFound')}</h1>
          <p>{t('survey.notFoundDesc')}</p>
          <Link to="/" className="btn btn-primary" style={{ marginTop: '1rem' }}>
            {t('survey.goToPooly')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="survey-page">
      <header className="survey-header">
        <Link to="/" className="survey-brand">Pooly</Link>
        <div className="survey-progress-badge">
          {t('survey.progressBadge', { answered: answeredCount, total: totalQuestions })}
        </div>
      </header>

      <div className="survey-hero">
        <h1 className="survey-title">{event.name}</h1>
        <p className="survey-description">{event.description}</p>
      </div>

      {error && (
        <div
          style={{
            position: 'fixed',
            bottom: '1.5rem',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1000,
            background: '#fee2e2',
            color: '#991b1b',
            border: '1px solid #fca5a5',
            borderRadius: '0.75rem',
            padding: '0.875rem 1.25rem',
            boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
            maxWidth: 'min(90vw, 480px)',
            width: '100%',
            textAlign: 'center',
            fontSize: '0.9rem',
            fontWeight: '500',
          }}
        >
          {error}
        </div>
      )}

      <div className="survey-container">

        <form onSubmit={handleSubmit}>
          <div className="chat-container">
            {event.questions.map((question, index) => (
              <div key={question.id} className="chat-block">
                <div className="chat-message chat-assistant">
                  <div className="chat-avatar">
                    <span>P</span>
                  </div>
                  <div className="chat-bubble">
                    <div className="chat-question-number">{t('survey.question', { num: index + 1 })}</div>
                    <div className="chat-question-text">{question.text}</div>
                  </div>
                </div>

                <div className="chat-message chat-user">
                  <div className="chat-input-container">
                    <textarea
                      className="chat-textarea"
                      placeholder={t('survey.placeholder')}
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

          <div className="survey-footer">
            <div className="survey-footer-info">
              <span className="survey-footer-icon">🔒</span>
              <span>{t('survey.anonymous')}</span>
            </div>
            <button
              type="submit"
              className="btn btn-primary btn-large survey-submit"
              disabled={submitting || answeredCount === 0}
            >
              {submitting
                ? t('survey.submitting')
                : `${t('survey.submit')}${answeredCount > 0 ? ` (${answeredCount})` : ''}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
