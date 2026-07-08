import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import api from '../services/api';
import Icon from '../components/Icon';
import { useLanguage } from '../context/LanguageContext';

export default function PublicSurvey() {
  const { publicId } = useParams();
  const { t } = useLanguage();
  const [event, setEvent] = useState(null);
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [started, setStarted] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [error, setError] = useState('');
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await api.get(`/events/public/${publicId}`);
        const data = response.data.data;
        // Build merged items list sorted by position
        const questions = (data.questions || []).map(q => ({ ...q, item_type: 'question' }));
        const textBlocks = (data.text_blocks || []).map(tb => ({ ...tb, item_type: 'text_block' }));
        const items = [...questions, ...textBlocks].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
        setEvent({ ...data, items });
      } catch (err) {
        const status = err.response?.status;
        const errorCode = err.response?.data?.error;
        if (status === 423 || errorCode === 'survey_paused') {
          setIsPaused(true);
        } else {
          console.error('Failed to fetch event:', err);
          setError(t('survey.errorLoad'));
          const fallbackQuestions = [
              { id: 101, text: '¿Cómo descubriste nuestra tienda?', type: 'multiple', options: ['Redes sociales', 'Recomendación', 'Búsqueda en Google', 'Publicidad', 'Otro'], item_type: 'question', position: 0 },
              { id: 102, text: '¿Qué te hizo dudar antes de completar tu compra?', type: 'open', options: [], item_type: 'question', position: 10 },
              { id: 103, text: 'Del 1 al 10, ¿qué tan probable es que nos recomiendes?', type: 'numeric', options: [], item_type: 'question', position: 20 },
              { id: 104, text: '¿Cuándo recibiste tu pedido?', type: 'date', options: [], item_type: 'question', position: 30 }
            ];
          setEvent({
            public_id: publicId,
            name: 'Cuéntanos de tu compra',
            description: 'Tu opinión define decisiones reales de la marca. Solo te tomará un minuto.',
            items: fallbackQuestions,
          });
        }
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [publicId]);

  const handleResponseChange = (questionId, text) => {
    setResponses(prev => ({ ...prev, [questionId]: text }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');

    try {
      const answeredQuestions = Object.entries(responses).filter(([, val]) =>
        Array.isArray(val) ? val.length > 0 : val.trim() !== ''
      );

      if (answeredQuestions.length === 0) {
        throw new Error(t('survey.errorAtLeastOne'));
      }

      const allQuestions = (event.items || []).filter(i => i.item_type === 'question');
      const toNums = (pairs) =>
        pairs.map(([id]) => allQuestions.findIndex(q => q.id === parseInt(id)) + 1).join(', ');

      const tooLongList = answeredQuestions.filter(([questionId, text]) => {
        const q = allQuestions.find(q => q.id === parseInt(questionId));
        return !['multiple', 'numeric', 'date'].includes(q?.type) && text.trim().length > 500;
      });
      if (tooLongList.length > 0) {
        throw new Error(t('survey.errorMaxChars', { nums: toNums(tooLongList) }));
      }

      const payload = {
        public_id: publicId,
        responses: answeredQuestions.map(([questionId, val]) => ({
          text: Array.isArray(val) ? val.join(', ') : val.trim(),
          question_id: parseInt(questionId)
        }))
      };

      await api.post(`/events/public/${publicId}/respond`, payload);
      setSuccess(true);
    } catch (err) {
      const status = err.response?.status;
      if (status === 422) {
        setError(err.response?.data?.message || err.message || t('survey.errorMaxChars', { nums: '?' }));
      } else {
        setError(err.message || t('survey.errorSubmit'));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const steps = event?.items || [];
  const totalQuestions = steps.filter(i => i.item_type === 'question').length;
  const currentItem = steps[stepIndex];
  const isLastStep = stepIndex >= steps.length - 1;
  const questionsSoFar = Math.max(1, steps.slice(0, stepIndex + 1).filter(i => i.item_type === 'question').length);
  const estimatedMinutes = Math.max(1, Math.round(totalQuestions / 3));

  const canContinue = (item) => {
    if (!item) return false;
    if (item.item_type === 'text_block') return true;
    if (item.optional) return true;
    const val = responses[item.id];
    return Array.isArray(val) ? val.length > 0 : !!(val && val.trim());
  };

  const goNext = () => {
    if (isLastStep) {
      handleSubmit();
      return;
    }
    setStepIndex(i => i + 1);
  };

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
    const completionMsg = event?.completion_message;
    return (
      <div className="survey-page">
        <div className="survey-stage">
          <div className="survey-success" style={{ flex: 1 }}>
            <div className="survey-success-icon"><Icon name="check" size={40} /></div>
            {completionMsg ? (
              <div className="survey-success-markdown">
                <ReactMarkdown>{completionMsg}</ReactMarkdown>
              </div>
            ) : (
              <>
                <h1>{t('survey.successTitle')}</h1>
                <p>{t('survey.successDesc')}</p>
                <p className="survey-success-note">{t('survey.successNote')}</p>
              </>
            )}
            <Link to="/" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>
              {t('survey.goToPooly')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isPaused) {
    return (
      <div className="survey-page">
        <div className="survey-stage">
          <header className="survey-header">
            <Link to="/" className="survey-brand">Pool<span style={{ color: 'var(--primary)' }}>y</span></Link>
          </header>
          <div className="survey-error" style={{ flex: 1 }}>
            <Icon name="pause" size={40} style={{ marginBottom: '1rem', color: 'var(--text-muted)' }} />
            <h1>{t('survey.pausedTitle')}</h1>
            <p>{t('survey.pausedDesc')}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="survey-page">
        <div className="survey-stage">
          <div className="survey-error" style={{ flex: 1 }}>
            <h1>{t('survey.notFound')}</h1>
            <p>{t('survey.notFoundDesc')}</p>
            <Link to="/" className="btn btn-primary" style={{ marginTop: '1rem' }}>
              {t('survey.goToPooly')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="survey-page">
      <div className="survey-stage">
        <header className="survey-header">
          <Link to="/" className="survey-brand">Pool<span style={{ color: 'var(--primary)' }}>y</span></Link>
          {started && (
            <>
              <div className="survey-header-progress">
                <div
                  className="survey-header-progress-fill"
                  style={{ width: totalQuestions > 0 ? `${(questionsSoFar / totalQuestions) * 100}%` : 0 }}
                />
              </div>
              <span className="survey-header-counter">
                {t('survey.stepCounter', { step: questionsSoFar, total: totalQuestions })}
              </span>
            </>
          )}
        </header>

        {error && (
          <div
            style={{
              position: 'fixed',
              bottom: '1.5rem',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 1000,
              background: 'var(--error-light)',
              color: 'var(--error)',
              border: '1px solid #FCA5A5',
              borderRadius: 'var(--radius)',
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

        {!started ? (
          <div className="survey-intro">
            <div className="survey-intro-icon">
              <Icon name="shopping-bag" size={28} />
            </div>
            <h1 className="survey-intro-title">{event.name}</h1>
            {event.welcome_message ? (
              <div className="survey-welcome-markdown" style={{ marginBottom: '1.75rem' }}>
                <ReactMarkdown>{event.welcome_message}</ReactMarkdown>
              </div>
            ) : (
              <p className="survey-intro-desc">
                {event.description || t('survey.introDefaultDesc', { count: totalQuestions })}
              </p>
            )}
            <button className="btn btn-primary btn-large" onClick={() => setStarted(true)}>
              {t('survey.introCta', { min: estimatedMinutes })}
              <Icon name="arrow-right" size={17} />
            </button>
            <div className="survey-intro-trust">
              <span><Icon name="lock" size={13} /> {t('survey.trustAnonymous')}</span>
              <span><Icon name="zap" size={13} /> {t('survey.trustNoAccount')}</span>
            </div>
          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '1.5rem 1.25rem' }}>
            {currentItem?.item_type === 'text_block' ? (
              <div className="chat-message chat-assistant">
                <div className="chat-avatar"><Icon name="message" size={18} color="#fff" /></div>
                <div className="chat-bubble" style={{ flex: 1 }}>
                  <ReactMarkdown>{currentItem.content}</ReactMarkdown>
                </div>
              </div>
            ) : (
              <>
                <div className="chat-message chat-assistant">
                  <div className="chat-avatar"><Icon name="message" size={18} color="#fff" /></div>
                  <div className="chat-bubble">
                    <div className="chat-question-number">{t('survey.question', { num: questionsSoFar })}</div>
                    <div className="chat-question-text">{currentItem.text}</div>
                  </div>
                </div>

                <div className="chat-message chat-user" style={{ flex: 1 }}>
                  {currentItem.type === 'multiple' && currentItem.options?.length > 0 ? (
                    <div className="chat-options">
                      {currentItem.options.map((option, oIdx) => {
                        const isMulti = currentItem.multi_select;
                        const current = responses[currentItem.id];
                        const isSelected = isMulti
                          ? (Array.isArray(current) ? current.includes(option) : false)
                          : current === option;
                        return (
                          <label key={oIdx} className={`chat-option ${isSelected ? 'is-selected' : ''}`}>
                            <input
                              type={isMulti ? 'checkbox' : 'radio'}
                              name={`q-${currentItem.id}`}
                              value={option}
                              checked={isSelected}
                              onChange={() => {
                                if (isMulti) {
                                  setResponses(prev => {
                                    const arr = Array.isArray(prev[currentItem.id]) ? prev[currentItem.id] : [];
                                    const next = arr.includes(option)
                                      ? arr.filter(o => o !== option)
                                      : [...arr, option];
                                    return { ...prev, [currentItem.id]: next };
                                  });
                                } else {
                                  handleResponseChange(currentItem.id, option);
                                }
                              }}
                              style={{ display: 'none' }}
                            />
                            <span className={isMulti ? 'chat-option-check' : 'chat-option-dot'} />
                            <span className="chat-option-text">{option}</span>
                          </label>
                        );
                      })}
                    </div>
                  ) : currentItem.type === 'numeric' ? (
                    <div className="chat-input-container">
                      <input
                        type="number"
                        className="chat-input-single"
                        placeholder={t('survey.placeholderNumeric')}
                        value={responses[currentItem.id] || ''}
                        onChange={(e) => handleResponseChange(currentItem.id, e.target.value)}
                        autoFocus
                      />
                    </div>
                  ) : currentItem.type === 'date' ? (
                    <div className="chat-input-container">
                      <input
                        type="date"
                        className="chat-input-single"
                        value={responses[currentItem.id] || ''}
                        onChange={(e) => handleResponseChange(currentItem.id, e.target.value)}
                        autoFocus
                      />
                    </div>
                  ) : (
                    <div className="chat-input-container">
                      <textarea
                        className="chat-textarea"
                        placeholder={t('survey.placeholder')}
                        value={responses[currentItem.id] || ''}
                        onChange={(e) => handleResponseChange(currentItem.id, e.target.value)}
                        rows={4}
                        autoFocus
                      />
                    </div>
                  )}
                </div>
              </>
            )}

            <div className="survey-footer" style={{ marginTop: '1.5rem' }}>
              <div className="survey-footer-info">
                <span className="survey-footer-icon"><Icon name="lock" size={14} /></span>
                <span>{t('survey.anonymous')}</span>
              </div>
              <button
                type="button"
                className="btn btn-primary"
                disabled={submitting || !canContinue(currentItem)}
                onClick={goNext}
              >
                {submitting
                  ? t('survey.submitting')
                  : currentItem?.item_type === 'text_block'
                    ? t('survey.continueBlock')
                    : isLastStep ? t('survey.submit') : t('survey.next')}
                <Icon name={isLastStep && currentItem?.item_type !== 'text_block' ? 'check' : 'arrow-right'} size={15} />
              </button>
            </div>
          </div>
        )}

        <div className="survey-powered-by">
          {t('survey.poweredBy')} <strong style={{ color: 'var(--text-secondary)' }}>Pool<span style={{ color: 'var(--primary)' }}>y</span></strong>
        </div>
      </div>
    </div>
  );
}
