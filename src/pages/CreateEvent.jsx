import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext';

const emptyQuestion = () => ({ text: '', optional: false, type: 'open', options: ['', ''] });

const CreateEvent = () => {
    const navigate = useNavigate();
    const { t, locale } = useLanguage();
    const isES = locale === 'es-MX';
    const [step, setStep] = useState(1);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        end_date: '',
        questions: [emptyQuestion()]
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

    const handleQuestionTypeChange = (index, type) => {
        const newQuestions = [...formData.questions];
        newQuestions[index] = { ...newQuestions[index], type };
        setFormData(prev => ({ ...prev, questions: newQuestions }));
    };

    const handleOptionChange = (qIndex, oIndex, value) => {
        const newQuestions = [...formData.questions];
        const newOptions = [...newQuestions[qIndex].options];
        newOptions[oIndex] = value;
        newQuestions[qIndex] = { ...newQuestions[qIndex], options: newOptions };
        setFormData(prev => ({ ...prev, questions: newQuestions }));
    };

    const addOption = (qIndex) => {
        const newQuestions = [...formData.questions];
        newQuestions[qIndex] = { ...newQuestions[qIndex], options: [...newQuestions[qIndex].options, ''] };
        setFormData(prev => ({ ...prev, questions: newQuestions }));
    };

    const removeOption = (qIndex, oIndex) => {
        const newQuestions = [...formData.questions];
        if (newQuestions[qIndex].options.length <= 2) return;
        const newOptions = newQuestions[qIndex].options.filter((_, i) => i !== oIndex);
        newQuestions[qIndex] = { ...newQuestions[qIndex], options: newOptions };
        setFormData(prev => ({ ...prev, questions: newQuestions }));
    };

    const addQuestion = () => {
        setFormData(prev => ({ ...prev, questions: [...prev.questions, emptyQuestion()] }));
    };

    const removeQuestion = (index) => {
        if (formData.questions.length === 1) return;
        setFormData(prev => ({ ...prev, questions: prev.questions.filter((_, i) => i !== index) }));
    };

    const handleStep1Submit = (e) => {
        e.preventDefault();
        if (!formData.end_date) { setError(t('create.errorNoDate')); return; }
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (new Date(formData.end_date) < today) { setError(t('create.errorPastDate')); return; }
        setError('');
        setStep(2);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            const cleanedQuestions = formData.questions
                .filter(q => q.text.trim() !== '')
                .map(q => ({
                    text: q.text.trim(),
                    optional: q.optional,
                    type: q.type,
                    options: q.type === 'multiple'
                        ? q.options.map(o => o.trim()).filter(Boolean)
                        : [],
                }));

            if (cleanedQuestions.length === 0) throw new Error(t('create.errorNoQuestions'));

            const badMultiple = cleanedQuestions.find(
                q => q.type === 'multiple' && q.options.length < 2
            );
            if (badMultiple) throw new Error(t('create.errorMultipleOptions'));

            await api.post('/events/new', { ...formData, questions: cleanedQuestions });
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
                <div style={{ flex: 1, height: '4px', borderRadius: 0, background: 'var(--primary)' }}></div>
                <div style={{ flex: 1, height: '4px', borderRadius: 0, background: step === 2 ? 'var(--primary)' : 'var(--border)' }}></div>
            </div>

            {error && (
                <div className="alert alert-error" style={{ maxWidth: '900px' }}>{error}</div>
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

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                        {formData.questions.map((question, qIndex) => (
                                            <div key={qIndex} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                                                {/* Number badge */}
                                                <span style={{
                                                    width: '28px', height: '28px',
                                                    background: 'var(--primary-light)', color: 'var(--primary)',
                                                    borderRadius: '50%', display: 'flex', alignItems: 'center',
                                                    justifyContent: 'center', fontSize: '0.875rem',
                                                    fontWeight: '600', flexShrink: 0, marginTop: '0.5rem'
                                                }}>
                                                    {qIndex + 1}
                                                </span>

                                                {/* Question body */}
                                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                    {/* Question text */}
                                                    <textarea
                                                        className="input-field"
                                                        rows="2"
                                                        value={question.text}
                                                        onChange={(e) => handleQuestionChange(qIndex, e.target.value)}
                                                        placeholder={t('create.questionPlaceholder', { num: qIndex + 1 })}
                                                        style={{ margin: 0 }}
                                                    />

                                                    {/* Type + required selectors */}
                                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                        <select
                                                            className="input-field"
                                                            value={question.type}
                                                            onChange={(e) => handleQuestionTypeChange(qIndex, e.target.value)}
                                                            style={{ margin: 0, fontSize: '0.8rem', padding: '0.35rem 0.6rem', cursor: 'pointer', flex: 1 }}
                                                        >
                                                            <option value="open">{t('create.questionTypeOpen')}</option>
                                                            <option value="multiple">{t('create.questionTypeMultiple')}</option>
                                                            <option value="numeric">{t('create.questionTypeNumeric')}</option>
                                                            <option value="date">{t('create.questionTypeDate')}</option>
                                                        </select>
                                                        <select
                                                            className="input-field"
                                                            value={question.optional ? 'optional' : 'required'}
                                                            onChange={(e) => handleQuestionOptionalChange(qIndex, e.target.value === 'optional')}
                                                            style={{ margin: 0, fontSize: '0.8rem', padding: '0.35rem 0.6rem', cursor: 'pointer', flex: 1 }}
                                                        >
                                                            <option value="required">{t('create.questionRequired')}</option>
                                                            <option value="optional">{t('create.questionOptional')}</option>
                                                        </select>
                                                    </div>

                                                    {/* Multiple choice options */}
                                                    {question.type === 'multiple' && (
                                                        <div style={{
                                                            display: 'flex', flexDirection: 'column', gap: '0.4rem',
                                                            padding: '0.75rem',
                                                            background: 'var(--bg-secondary, #F9FAFB)',
                                                            border: '1px solid var(--border)',
                                                        }}>
                                                            {question.options.map((opt, oIndex) => (
                                                                <div key={oIndex} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                                    <span style={{
                                                                        width: '18px', height: '18px', flexShrink: 0,
                                                                        border: '2px solid var(--border)',
                                                                        borderRadius: '50%', display: 'inline-block',
                                                                    }} />
                                                                    <input
                                                                        type="text"
                                                                        className="input-field"
                                                                        value={opt}
                                                                        onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                                                                        placeholder={t('create.optionPlaceholder', { num: oIndex + 1 })}
                                                                        style={{ margin: 0, padding: '0.3rem 0.6rem', fontSize: '0.875rem' }}
                                                                    />
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => removeOption(qIndex, oIndex)}
                                                                        disabled={question.options.length <= 2}
                                                                        style={{
                                                                            background: 'none', border: 'none', cursor: question.options.length <= 2 ? 'default' : 'pointer',
                                                                            color: question.options.length <= 2 ? 'var(--border)' : 'var(--text-secondary)',
                                                                            padding: '0.2rem', flexShrink: 0, lineHeight: 1,
                                                                            fontSize: '1rem', fontWeight: '600',
                                                                        }}
                                                                        title="Eliminar opción"
                                                                    >
                                                                        ×
                                                                    </button>
                                                                </div>
                                                            ))}
                                                            <button
                                                                type="button"
                                                                onClick={() => addOption(qIndex)}
                                                                style={{
                                                                    background: 'none', border: 'none', cursor: 'pointer',
                                                                    color: 'var(--primary)', fontSize: '0.8rem',
                                                                    fontWeight: '600', textAlign: 'left', padding: '0.2rem 0',
                                                                    marginTop: '0.1rem',
                                                                }}
                                                            >
                                                                {t('create.addOption')}
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Remove question */}
                                                {formData.questions.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeQuestion(qIndex)}
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

                        {step === 2 && (
                            <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border)' }}>
                                <h4 style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
                                    {isES ? 'Tipos de respuesta' : 'Response types'}
                                </h4>
                                {[
                                    { icon: '💬', label: t('create.questionTypeOpen'),    desc: isES ? 'Opiniones libres → análisis de temas y sentimiento'      : 'Free opinions → topic & sentiment analysis' },
                                    { icon: '☑️', label: t('create.questionTypeMultiple'), desc: isES ? 'Categorías o escalas → distribución de respuestas'         : 'Fixed categories or scales → distribution' },
                                    { icon: '🔢', label: t('create.questionTypeNumeric'),  desc: isES ? 'Edades, salarios, puntajes → estadísticas y promedios'     : 'Ages, salaries, scores → statistics' },
                                    { icon: '📅', label: t('create.questionTypeDate'),     desc: isES ? 'Eventos y plazos → análisis de tendencias temporales'      : 'Events & deadlines → time trend analysis' },
                                ].map(({ icon, label, desc }) => (
                                    <div key={label} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.6rem', alignItems: 'flex-start' }}>
                                        <span style={{ fontSize: '0.9rem', flexShrink: 0, marginTop: '0.05rem' }}>{icon}</span>
                                        <div>
                                            <span style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-primary)' }}>{label}</span>
                                            <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', display: 'block', lineHeight: 1.4 }}>{desc}</span>
                                        </div>
                                    </div>
                                ))}
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
