import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const CreateEvent = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Form State
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            // Clean up empty questions
            const cleanedQuestions = formData.questions.filter(q => q.trim() !== '');
            if (cleanedQuestions.length === 0) {
                throw new Error('Please add at least one question.');
            }

            await api.post('/events/new', {
                ...formData,
                questions: cleanedQuestions
            });
            navigate('/admin');
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to create event.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container" style={{ paddingBottom: '4rem' }}>
            <header style={{ margin: '3rem 0' }}>
                <Link to="/admin" style={{ color: 'var(--primary)', marginBottom: '1rem', display: 'inline-block' }}>← Back to Dashboard</Link>
                <h1 className="page-title">Create New Event</h1>
                <p style={{ color: 'var(--text-muted)' }}>Step {step} of 2: {step === 1 ? 'Event Details' : 'Add Questions'}</p>
            </header>

            {error && (
                <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '1rem', borderRadius: '8px', marginBottom: '2rem' }}>
                    {error}
                </div>
            )}

            <div className="glass-card" style={{ padding: '3rem', maxWidth: '800px', margin: '0 auto' }}>
                {step === 1 && (
                    <form onSubmit={(e) => { e.preventDefault(); setStep(2); }}>
                        <div className="input-group">
                            <label className="input-label">Event Name</label>
                            <input
                                type="text"
                                name="name"
                                className="input-field"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                                placeholder="e.g., Urban Mobility 2026"
                            />
                        </div>
                        <div className="input-group">
                            <label className="input-label">Description</label>
                            <textarea
                                name="description"
                                className="input-field"
                                rows="4"
                                value={formData.description}
                                onChange={handleInputChange}
                                required
                                placeholder="Describe the purpose of this event..."
                                style={{ resize: 'vertical' }}
                            />
                        </div>
                        <div className="input-group">
                            <label className="input-label">End Date</label>
                            <input
                                type="date"
                                name="end_date"
                                className="input-field"
                                value={formData.end_date}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
                            <button type="submit" className="btn btn-primary">Next: Add Questions →</button>
                        </div>
                    </form>
                )}

                {step === 2 && (
                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <label className="input-label">Questions</label>
                            {formData.questions.map((question, index) => (
                                <div key={index} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                                    <textarea
                                        className="input-field"
                                        rows="2"
                                        value={question}
                                        onChange={(e) => handleQuestionChange(index, e.target.value)}
                                        placeholder={`Question ${index + 1}`}
                                        style={{ resize: 'vertical' }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeQuestion(index)}
                                        className="btn btn-outline"
                                        style={{ padding: '0.75rem', borderColor: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }}
                                        title="Remove question"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>

                        <button
                            type="button"
                            onClick={addQuestion}
                            className="btn btn-outline"
                            style={{ width: '100%', marginTop: '1.5rem', borderStyle: 'dashed' }}
                        >
                            + Add Another Question
                        </button>

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3rem' }}>
                            <button type="button" onClick={() => setStep(1)} className="btn btn-outline">← Back to Details</button>
                            <button type="submit" className="btn btn-primary" disabled={isLoading}>
                                {isLoading ? 'Creating Event...' : 'Launch Event 🚀'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default CreateEvent;
