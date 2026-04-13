import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext';

const CreateEvent = () => {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const [step, setStep] = useState(1);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        end_date: '',
        questions: [{ text: '', optional: false }]
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleQuestionChange = (index, value) => {
        const newQuestions = [...formData.questions];
        newQuestions[index] = { ...newQuestions[index], text: value };
        setFormData(prev => ({ ...prev, questions: newQuestions }));
    };

    const handleQuestionOptionalChange = (index, optional) => {
        const newQuestions = [...formData.questions];
        newQuestions[index] = { ...newQuestions[index], optional };
        setFormData(prev => ({ ...prev, questions: newQuestions }));
    };

    const addQuestion = () => {
        setFormData(prev => ({ ...prev, questions: [...prev.questions, { text: '', optional: false }] }));
    };

    const removeQuestion = (index) => {
        if (formData.questions.length === 1) return;
        const newQuestions = formData.questions.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, questions: newQuestions }));
    };

    const handleStep1Submit = (e) => {
        e.preventDefault();
        if (!formData.end_date) {
            setError(t('create.errorNoDate'));
            return;
        }
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (new Date(formData.end_date) < today) {
            setError(t('create.errorPastDate'));
            return;
        }
        setError('');
        setStep(2);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            const cleanedQuestions = formData.questions.filter(q => q.text.trim() !== '');
            if (cleanedQuestions.length === 0) {
                throw new Error(t('create.errorNoQuestions'));
            }

            await api.post('/events/new', {
                ...formData,
                questions: cleanedQuestions.map(q => q.text.trim()),
            });
            navigate('/admin');
        } catch (err) {
            setError(err.response?.data?.message || err.message || t('create.errorGeneric'));
        } finally {
            setIsLoading(false);
        }
    };

    const getTipsContent = () => {
        if (step === 1) {
            return {
                title: t('tips.step1.title'),
                icon: '💡',
                tips: [
                    { icon: '✏️', title: t('tips.step1.tip1.title'), description: t('tips.step1.tip1.desc') },
                    { icon: '📝', title: t('tips.step1.tip2.title'), description: t('tips.step1.tip2.desc') },
                    { icon: '📅', title: t('tips.step1.tip3.title'), description: t('tips.step1.tip3.desc') },
                ],
                highlight: { icon: '🎯', text: t('tips.step1.highlight') }
            };
        }

        return {
            title: t('tips.step2.title'),
            icon: '❓',
            tips: [
                { icon: '🎯', title: t('tips.step2.tip1.title'), description: t('tips.step2.tip1.desc') },
                { icon: '🚫', title: t('tips.step2.tip2.title'), description: t('tips.step2.tip2.desc') },
                { icon: '📊', title: t('tips.step2.tip3.title'), description: t('tips.step2.tip3.desc') },
            ],
            highlight: { icon: '🤖', text: t('tips.step2.highlight') },
            examples: {
                title: t('tips.examples.title'),
                items: [t('tips.examples.item1'), t('tips.examples.item2'), t('tips.examples.item3')]
            }
        };
    };

    const tipsContent = getTipsContent();

    return (
        <div className="container" style={{ paddingTop: '7rem', paddingBottom: '4rem' }}>
            <header style={{ marginBottom: '2rem' }}>
                <Link to="/admin" style={{ color: 'var(--primary)', marginBottom: '1rem', display: 'inline-block', fontSize: '0.875rem' }}>
                    {t('create.back')}
                </Link>
                <h1 className="page-title">{t('create.title')}</h1>
                <p style={{ color: 'var(--text-secondary)' }}>
                    {t('create.step', { step })}: {step === 1 ? t('create.step1Label') : t('create.step2Label')}
                </p>
            </header>

            {/* Progress indicator */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', maxWidth: '900px' }}>
                <div style={{ flex: 1, height: '4px', borderRadius: '2px', background: 'var(--primary)' }}></div>
                <div style={{ flex: 1, height: '4px', borderRadius: '2px', background: step === 2 ? 'var(--primary)' : 'var(--border)' }}></div>
            </div>

            {error && (
                <div className="alert alert-error" style={{ maxWidth: '900px' }}>
                    {error}
                </div>
            )}

            <div className="create-event-layout">
                {/* Form Column */}
                <div className="create-event-form">
                    <div className="card" style={{ padding: '2rem' }}>
                        {step === 1 && (
                            <form onSubmit={handleStep1Submit}>
                                <div className="input-group">
                                    <label className="input-label">{t('create.name')}</label>
                                    <input
                                        type="text"
                                        name="name"
                                        className="input-field"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                        placeholder={t('create.namePlaceholder')}
                                    />
                                </div>
                                <div className="input-group">
                                    <label className="input-label">{t('create.description')}</label>
                                    <textarea
                                        name="description"
                                        className="input-field"
                                        rows="3"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        required
                                        placeholder={t('create.descPlaceholder')}
                                    />
                                </div>
                                <div className="input-group">
                                    <label className="input-label">{t('create.endDate')}</label>
                                    <input
                                        type="date"
                                        name="end_date"
                                        className="input-field"
                                        value={formData.end_date}
                                        onChange={handleInputChange}
                                        required
                                        min={new Date().toISOString().split('T')[0]}
                                    />
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                                    <button type="submit" className="btn btn-primary">
                                        {t('create.next')}
                                    </button>
                                </div>
                            </form>
                        )}

                        {step === 2 && (
                            <form onSubmit={handleSubmit}>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label className="input-label" style={{ marginBottom: '1rem', display: 'block' }}>
                                        {t('create.questionsLabel')}
                                    </label>
                                    <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', marginBottom: '1rem' }}>
                                        {t('create.questionsHint')}
                                    </p>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        {formData.questions.map((question, index) => (
                                            <div key={index} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                                                <span style={{
                                                    width: '28px', height: '28px',
                                                    background: 'var(--primary-light)', color: 'var(--primary)',
                                                    borderRadius: '50%', display: 'flex', alignItems: 'center',
                                                    justifyContent: 'center', fontSize: '0.875rem',
                                                    fontWeight: '600', flexShrink: 0, marginTop: '0.5rem'
                                                }}>
                                                    {index + 1}
                                                </span>
                                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                    <textarea
                                                        className="input-field"
                                                        rows="2"
                                                        value={question.text}
                                                        onChange={(e) => handleQuestionChange(index, e.target.value)}
                                                        placeholder={t('create.questionPlaceholder', { num: index + 1 })}
                                                        style={{ margin: 0 }}
                                                    />
                                                    <select
                                                        className="input-field"
                                                        value={question.optional ? 'optional' : 'required'}
                                                        onChange={(e) => handleQuestionOptionalChange(index, e.target.value === 'optional')}
                                                        style={{ margin: 0, fontSize: '0.8rem', padding: '0.35rem 0.6rem', cursor: 'pointer' }}
                                                    >
                                                        <option value="required">{t('create.questionRequired')}</option>
                                                        <option value="optional">{t('create.questionOptional')}</option>
                                                    </select>
                                                </div>
                                                {formData.questions.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeQuestion(index)}
                                                        className="btn btn-outline"
                                                        style={{ padding: '0.5rem', color: 'var(--error)', borderColor: 'var(--error-light)', marginTop: '0.25rem' }}
                                                        title={t('admin.delete')}
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <button type="button" onClick={addQuestion} className="btn btn-outline" style={{ width: '100%', borderStyle: 'dashed' }}>
                                    {t('create.addQuestion')}
                                </button>

                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
                                    <button type="button" onClick={() => setStep(1)} className="btn btn-secondary">
                                        {t('create.prev')}
                                    </button>
                                    <button type="submit" className="btn btn-primary" disabled={isLoading}>
                                        {isLoading ? t('create.submitting') : t('create.submit')}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>

                {/* Tips Column */}
                <div className="create-event-tips">
                    <div className="tips-panel">
                        <div className="tips-header">
                            <span className="tips-header-icon">{tipsContent.icon}</span>
                            <h3 className="tips-title">{tipsContent.title}</h3>
                        </div>

                        <div className="tips-list">
                            {tipsContent.tips.map((tip, index) => (
                                <div key={index} className="tip-item">
                                    <span className="tip-icon">{tip.icon}</span>
                                    <div>
                                        <h4 className="tip-title">{tip.title}</h4>
                                        <p className="tip-description">{tip.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {tipsContent.examples && (
                            <div className="tips-examples">
                                <h4 className="tips-examples-title">{tipsContent.examples.title}</h4>
                                <ul className="tips-examples-list">
                                    {tipsContent.examples.items.map((item, index) => (
                                        <li key={index}>{item}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div className="tips-highlight">
                            <span className="tips-highlight-icon">{tipsContent.highlight.icon}</span>
                            <p>{tipsContent.highlight.text}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateEvent;
