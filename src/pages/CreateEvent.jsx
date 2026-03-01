import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const CreateEvent = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        end_date: '',
        questions: ['']
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleQuestionChange = (index, value) => {
        const newQuestions = [...formData.questions];
        newQuestions[index] = value;
        setFormData(prev => ({ ...prev, questions: newQuestions }));
    };

    const addQuestion = () => {
        setFormData(prev => ({ ...prev, questions: [...prev.questions, ''] }));
    };

    const removeQuestion = (index) => {
        if (formData.questions.length === 1) return;
        const newQuestions = formData.questions.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, questions: newQuestions }));
    };

    const handleStep1Submit = (e) => {
        e.preventDefault();
        if (!formData.end_date) {
            setError('Por favor selecciona una fecha de cierre para la encuesta.');
            return;
        }
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (new Date(formData.end_date) < today) {
            setError('La fecha de cierre debe ser una fecha futura.');
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
            const cleanedQuestions = formData.questions.filter(q => q.trim() !== '');
            if (cleanedQuestions.length === 0) {
                throw new Error('Por favor agrega al menos una pregunta.');
            }

            await api.post('/events/new', {
                ...formData,
                questions: cleanedQuestions
            });
            navigate('/admin');
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Error al crear la encuesta.');
        } finally {
            setIsLoading(false);
        }
    };

    // Tips content based on current step
    const getTipsContent = () => {
        if (step === 1) {
            return {
                title: 'Consejos para tu encuesta',
                icon: '💡',
                tips: [
                    {
                        icon: '✏️',
                        title: 'Título claro y específico',
                        description: 'Un buen título ayuda a los participantes a entender el tema. Ej: "Movilidad Urbana 2026" en lugar de "Encuesta".'
                    },
                    {
                        icon: '📝',
                        title: 'Descripción motivadora',
                        description: 'Explica por qué es importante participar y cómo se usarán las respuestas para tomar decisiones.'
                    },
                    {
                        icon: '📅',
                        title: 'Tiempo suficiente',
                        description: 'Da al menos 1-2 semanas para que los participantes puedan responder con calma.'
                    }
                ],
                highlight: {
                    icon: '🎯',
                    text: 'Las encuestas con descripciones claras tienen 40% más participación.'
                }
            };
        }

        return {
            title: 'Crea preguntas efectivas',
            icon: '❓',
            tips: [
                {
                    icon: '🎯',
                    title: 'Preguntas abiertas',
                    description: 'Permiten respuestas detalladas que nuestra IA puede analizar para encontrar patrones y tendencias.'
                },
                {
                    icon: '🚫',
                    title: 'Evita sesgos',
                    description: 'No induzcas respuestas. "¿Qué opinas del transporte?" es mejor que "¿No crees que el transporte es malo?"'
                },
                {
                    icon: '📊',
                    title: 'Una idea por pregunta',
                    description: 'Divide preguntas complejas. Es más fácil analizar "¿Qué medio usas?" y "¿Qué mejorarías?" por separado.'
                }
            ],
            highlight: {
                icon: '🤖',
                text: 'Nuestra IA analiza las respuestas para identificar temas, sentimiento y prioridades automáticamente.'
            },
            examples: {
                title: 'Ejemplos de buenas preguntas',
                items: [
                    '¿Cuál es el principal problema que enfrentas con...?',
                    '¿Qué cambiarías si pudieras...?',
                    '¿Cómo te afecta actualmente...?'
                ]
            }
        };
    };

    const tipsContent = getTipsContent();

    return (
        <div className="container" style={{ paddingTop: '7rem', paddingBottom: '4rem' }}>
            <header style={{ marginBottom: '2rem' }}>
                <Link to="/admin" style={{ color: 'var(--primary)', marginBottom: '1rem', display: 'inline-block', fontSize: '0.875rem' }}>
                    ← Volver al panel
                </Link>
                <h1 className="page-title">Crear nueva encuesta</h1>
                <p style={{ color: 'var(--text-secondary)' }}>
                    Paso {step} de 2: {step === 1 ? 'Detalles de la encuesta' : 'Agregar preguntas'}
                </p>
            </header>

            {/* Progress indicator */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', maxWidth: '900px' }}>
                <div style={{
                    flex: 1,
                    height: '4px',
                    borderRadius: '2px',
                    background: 'var(--primary)'
                }}></div>
                <div style={{
                    flex: 1,
                    height: '4px',
                    borderRadius: '2px',
                    background: step === 2 ? 'var(--primary)' : 'var(--border)'
                }}></div>
            </div>

            {error && (
                <div className="alert alert-error" style={{ maxWidth: '900px' }}>
                    {error}
                </div>
            )}

            {/* Two column layout */}
            <div className="create-event-layout">
                {/* Form Column */}
                <div className="create-event-form">
                    <div className="card" style={{ padding: '2rem' }}>
                        {step === 1 && (
                            <form onSubmit={handleStep1Submit}>
                                <div className="input-group">
                                    <label className="input-label">Nombre de la encuesta</label>
                                    <input
                                        type="text"
                                        name="name"
                                        className="input-field"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="ej. Movilidad Urbana 2026"
                                    />
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Descripción</label>
                                    <textarea
                                        name="description"
                                        className="input-field"
                                        rows="3"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="Describe el propósito de esta encuesta..."
                                    />
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Fecha de cierre</label>
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
                                        Siguiente: Agregar preguntas
                                    </button>
                                </div>
                            </form>
                        )}

                        {step === 2 && (
                            <form onSubmit={handleSubmit}>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label className="input-label" style={{ marginBottom: '1rem', display: 'block' }}>
                                        Preguntas de la encuesta
                                    </label>
                                    <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', marginBottom: '1rem' }}>
                                        Escribe preguntas abiertas para que los participantes puedan responder libremente.
                                    </p>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        {formData.questions.map((question, index) => (
                                            <div key={index} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                                                <span style={{
                                                    width: '28px',
                                                    height: '28px',
                                                    background: 'var(--primary-light)',
                                                    color: 'var(--primary)',
                                                    borderRadius: '50%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '0.875rem',
                                                    fontWeight: '600',
                                                    flexShrink: 0,
                                                    marginTop: '0.5rem'
                                                }}>
                                                    {index + 1}
                                                </span>
                                                <textarea
                                                    className="input-field"
                                                    rows="2"
                                                    value={question}
                                                    onChange={(e) => handleQuestionChange(index, e.target.value)}
                                                    placeholder={`Escribe la pregunta ${index + 1}`}
                                                    style={{ flex: 1 }}
                                                />
                                                {formData.questions.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeQuestion(index)}
                                                        className="btn btn-outline"
                                                        style={{
                                                            padding: '0.5rem',
                                                            color: 'var(--error)',
                                                            borderColor: 'var(--error-light)',
                                                            marginTop: '0.25rem'
                                                        }}
                                                        title="Eliminar pregunta"
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

                                <button
                                    type="button"
                                    onClick={addQuestion}
                                    className="btn btn-outline"
                                    style={{ width: '100%', borderStyle: 'dashed' }}
                                >
                                    + Agregar otra pregunta
                                </button>

                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
                                    <button type="button" onClick={() => setStep(1)} className="btn btn-secondary">
                                        Anterior
                                    </button>
                                    <button type="submit" className="btn btn-primary" disabled={isLoading}>
                                        {isLoading ? 'Creando...' : 'Crear encuesta'}
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
