import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { useLanguage } from '../context/LanguageContext';

export default function SurveyPreview() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [responses, setResponses] = useState({});
  const [showWelcome, setShowWelcome] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem('survey_preview');
    if (!raw) {
      navigate('/admin/create');
      return;
    }
    const data = JSON.parse(raw);
    // Assign temporary IDs to questions that don't have them
    const questions = (data.questions || []).map((q, idx) => ({
      ...q,
      id: q.id ?? `preview-${idx}`,
    }));
    setEvent({ ...data, questions });
    if (data.welcome_message) setShowWelcome(true);
  }, [navigate]);

  const handleResponseChange = (questionId, text) => {
    setResponses(prev => ({ ...prev, [questionId]: text }));
  };

  const handleClose = () => {
    window.close();
    // Fallback if window.close() is blocked
    navigate('/admin/create');
  };

  const answeredCount = Object.values(responses).filter(r => String(r).trim() !== '').length;
  const totalQuestions = event?.questions?.length || 0;

  if (!event) return null;

  const PreviewBanner = () => (
    <div className="survey-preview-banner">
      <div className="survey-preview-banner-content">
        <span className="survey-preview-banner-label">{t('survey.previewBanner')}</span>
        <span className="survey-preview-banner-desc">{t('survey.previewBannerDesc')}</span>
      </div>
      <button className="survey-preview-banner-close" onClick={handleClose}>
        {t('survey.previewClose')}
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );

  if (showSuccess) {
    const completionMsg = event.completion_message;
    return (
      <div className="survey-page survey-preview-page">
        <PreviewBanner />
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
          <button
            className="btn btn-outline"
            style={{ marginTop: '1.5rem' }}
            onClick={() => setShowSuccess(false)}
          >
            {t('survey.previewClose')}
          </button>
        </div>
      </div>
    );
  }

  if (showWelcome && event.welcome_message) {
    return (
      <div className="survey-page survey-preview-page">
        <PreviewBanner />
        <header className="survey-header">
          <span className="survey-brand">Pooly</span>
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
    <div className="survey-page survey-preview-page">
      <PreviewBanner />

      <header className="survey-header">
        <span className="survey-brand">Pooly</span>
        <div className="survey-progress-badge">
          {t('survey.progressBadge', { answered: answeredCount, total: totalQuestions })}
        </div>
      </header>

      <div className="survey-hero">
        <h1 className="survey-title">{event.name || 'Sin título'}</h1>
        {event.description && <p className="survey-description">{event.description}</p>}
      </div>

      <div className="survey-container">
        <div className="chat-container">
          {event.questions.map((question, index) => (
            <div key={question.id} className="chat-block">
              <div className="chat-message chat-assistant">
                <div className="chat-avatar"><span>P</span></div>
                <div className="chat-bubble">
                  <div className="chat-question-number">{t('survey.question', { num: index + 1 })}</div>
                  <div className="chat-question-text">{question.text || '(Sin texto)'}</div>
                </div>
              </div>

              <div className="chat-message chat-user">
                {question.type === 'multiple' && question.options?.length > 0 ? (
                  <div className="chat-options">
                    {question.options.filter(o => o.trim()).map((option, oIdx) => {
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
                  </div>
                ) : question.type === 'date' ? (
                  <div className="chat-input-container">
                    <input
                      type="date"
                      className="chat-input-single"
                      value={responses[question.id] || ''}
                      onChange={(e) => handleResponseChange(question.id, e.target.value)}
                    />
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
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="survey-footer">
          <div className="survey-footer-info">
            <span className="survey-footer-icon">👁</span>
            <span>{t('survey.previewBannerDesc')}</span>
          </div>
          <button
            type="button"
            className="btn btn-primary btn-large survey-submit"
            onClick={() => setShowSuccess(true)}
          >
            {t('survey.submit')}
          </button>
        </div>
      </div>
    </div>
  );
}
