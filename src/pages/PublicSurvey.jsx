import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
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
  const [showWelcome, setShowWelcome] = useState(false);
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
        if (data.welcome_message) setShowWelcome(true);
      } catch (err) {
        const status = err.response?.status;
        const errorCode = err.response?.data?.error;
        if (status === 423 || errorCode === 'survey_paused') {
          setIsPaused(true);
        } else {
          console.error('Failed to fetch event:', err);
          setError(t('survey.errorLoad'));
          const fallbackQuestions = [
              { id: 101, text: '¿Cuál es tu principal medio de transporte?', type: 'multiple', options: ['Metro', 'Bicicleta', 'Auto particular', 'Transporte público', 'A pie'], item_type: 'question', position: 0 },
              { id: 102, text: '¿Qué opinas sobre las ciclovías actuales en la ciudad?', type: 'open', options: [], item_type: 'question', position: 10 },
              { id: 103, text: '¿Cuántas veces por semana usas el transporte público?', type: 'numeric', options: [], item_type: 'question', position: 20 },
              { id: 104, text: '¿Cuándo fue tu último viaje en transporte público?', type: 'date', options: [], item_type: 'question', position: 30 }
            ];
          setEvent({
            public_id: publicId,
            name: 'Movilidad Urbana 2026',
            description: 'Ayúdanos a mejorar el transporte de nuestra ciudad. Tu opinión es importante para nosotros.',
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const answeredQuestions = Object.entries(responses).filter(([_, val]) =>
        Array.isArray(val) ? val.length > 0 : val.trim() !== ''
      );

      if (answeredQuestions.length === 0) {
        throw new Error(t('survey.errorAtLeastOne'));
      }

      const toNums = (pairs) =>
        pairs.map(([id]) => event.questions.findIndex(q => q.id === parseInt(id)) + 1).join(', ');

      const allQuestions = (event.items || []).filter(i => i.item_type === 'question');
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

  const answeredCount = Object.values(responses).filter(r =>
    Array.isArray(r) ? r.length > 0 : r.trim() !== ''
  ).length;
  const totalQuestions = (event?.items || []).filter(i => i.item_type === 'question').length;

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
        <div className="survey-success">
          <div className="survey-success-icon">✓</div>
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
    );
  }

  if (isPaused) {
    return (
      <div className="survey-page">
        <header className="survey-header">
          <Link to="/" className="survey-brand">Pooly</Link>
        </header>
        <div className="survey-error">
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏸</div>
          <h1>{t('survey.pausedTitle')}</h1>
          <p>{t('survey.pausedDesc')}</p>
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

  if (showWelcome && event.welcome_message) {
    return (
      <div className="survey-page">
        <header className="survey-header">
          <Link to="/" className="survey-brand">Pooly</Link>
        </header>
        <div className="survey-welcome">
          <div className="survey-welcome-content">
            <div className="survey-welcome-markdown">
              <ReactMarkdown>{event.welcome_message}</ReactMarkdown>
            </div>
            <button
              className="btn btn-primary btn-large"
              style={{ marginTop: '2rem' }}
              onClick={() => setShowWelcome(false)}
            >
              {t('survey.welcomeStart')}
            </button>
          </div>
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
            borderRadius: 0,
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
            {(() => {
              let questionNum = 0;
              return (event.items || []).map((item, index) => {
              if (item.item_type === 'text_block') {
                return (
                  <div key={`tb-${item.id ?? index}`} className="chat-text-block" style={{
                    padding: '1rem 1.25rem', margin: '0.5rem 0',
                    background: 'var(--bg-secondary)', borderLeft: '3px solid var(--primary)',
                  }}>
                    <ReactMarkdown>{item.content}</ReactMarkdown>
                  </div>
                );
              }
              questionNum++;
              const question = item;
              const qNum = questionNum;
              return (
              <div key={question.id} className="chat-block">
                <div className="chat-message chat-assistant">
                  <div className="chat-avatar">
                    <span>P</span>
                  </div>
                  <div className="chat-bubble">
                    <div className="chat-question-number">{t('survey.question', { num: qNum })}</div>
                    <div className="chat-question-text">{question.text}</div>
                  </div>
                </div>

                <div className="chat-message chat-user">
                  {question.type === 'multiple' && question.options?.length > 0 ? (
                    <div className="chat-options">
                      {question.options.map((option, oIdx) => {
                        const isMulti = question.multi_select;
                        const current = responses[question.id];
                        const isSelected = isMulti
                          ? (Array.isArray(current) ? current.includes(option) : false)
                          : current === option;
                        return (
                          <label key={oIdx} className={`chat-option ${isSelected ? 'is-selected' : ''}`}>
                            <input
                              type={isMulti ? 'checkbox' : 'radio'}
                              name={`q-${question.id}`}
                              value={option}
                              checked={isSelected}
                              onChange={() => {
                                if (isMulti) {
                                  setResponses(prev => {
                                    const arr = Array.isArray(prev[question.id]) ? prev[question.id] : [];
                                    const next = arr.includes(option)
                                      ? arr.filter(o => o !== option)
                                      : [...arr, option];
                                    return { ...prev, [question.id]: next };
                                  });
                                } else {
                                  handleResponseChange(question.id, option);
                                }
                              }}
                              style={{ display: 'none' }}
                            />
                            <span className={isMulti ? 'chat-option-check' : 'chat-option-dot'} />
                            <span className="chat-option-text">{option}</span>
                          </label>
                        );
                      })}
                      {(Array.isArray(responses[question.id]) ? responses[question.id].length > 0 : responses[question.id]) && (
                        <div className="chat-options-done"><span>✓</span></div>
                      )}
                    </div>
                  ) : question.type === 'numeric' ? (
                    <div className="chat-input-container">
                      <input
                        type="number"
                        className="chat-input-single"
                        placeholder={t('survey.placeholderNumeric')}
                        value={responses[question.id] || ''}
                        onChange={(e) => handleResponseChange(question.id, e.target.value)}
                      />
                      {responses[question.id]?.trim() && (
                        <div className="chat-input-status">✓</div>
                      )}
                    </div>
                  ) : question.type === 'date' ? (
                    <div className="chat-input-container">
                      <input
                        type="date"
                        className="chat-input-single"
                        value={responses[question.id] || ''}
                        onChange={(e) => handleResponseChange(question.id, e.target.value)}
                      />
                      {responses[question.id]?.trim() && (
                        <div className="chat-input-status">✓</div>
                      )}
                    </div>
                  ) : (
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
                  )}
                </div>
              </div>
              );
              });
            })()}
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
