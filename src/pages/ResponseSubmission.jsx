import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const ResponseSubmission = () => {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [responses, setResponses] = useState({}); // { questionId: text }
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchEventDetails = async () => {
            try {
                const response = await api.get(`/events/${eventId}/details`);
                setEvent(response.data);
            } catch (err) {
                console.error('Failed to fetch event details:', err);
                setError('Failed to load event questions.');
                // Mock fallback
                setEvent({
                    id: eventId,
                    name: 'Urban Mobility 2026',
                    description: 'Help us improve the city transportation.',
                    questions: [
                        { id: 101, text: 'What is your main mode of transport?' },
                        { id: 102, text: 'Are you satisfied with the current bike lanes?' },
                        { id: 103, text: 'What improvement would you prioritize first?' }
                    ]
                });
            } finally {
                setLoading(false);
            }
        };
        fetchEventDetails();
    }, [eventId]);

    const handleResponseChange = (questionId, text) => {
        setResponses(prev => ({ ...prev, [questionId]: text }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        try {
            // Requirements: POST /register_response (text, question_id, event_id)
            const submissionPromises = Object.entries(responses)
                .filter(([_, text]) => text.trim() !== '')
                .map(([questionId, text]) =>
                    api.post('/register_response', {
                        text,
                        question_id: parseInt(questionId),
                        event_id: parseInt(eventId)
                    })
                );

            if (submissionPromises.length === 0) {
                throw new Error('Please answer at least one question.');
            }

            await Promise.all(submissionPromises);
            setSuccess(true);
            setTimeout(() => navigate('/'), 3000);
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to submit responses.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="container"><p>Loading questions...</p></div>;

    if (success) {
        return (
            <div className="container" style={{ display: 'flex', justifyContent: 'center', padding: '4rem 1rem' }}>
                <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', maxWidth: '500px' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
                    <h2 className="page-title" style={{ fontSize: '2rem' }}>Thank You!</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Your responses have been recorded successfully. Your voice matters!</p>
                    <Link to="/" className="btn btn-primary">Back to Gallery</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container" style={{ paddingBottom: '4rem' }}>
            <header style={{ margin: '3rem 0' }}>
                <Link to="/" style={{ color: 'var(--primary)', marginBottom: '1rem', display: 'inline-block' }}>← Back to Gallery</Link>
                <h1 className="page-title">{event.name}</h1>
                <p style={{ color: 'var(--text-muted)' }}>{event.description}</p>
            </header>

            {error && (
                <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '1rem', borderRadius: '8px', marginBottom: '2rem' }}>
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {event.questions.map(question => (
                        <div key={question.id} className="glass-card" style={{ padding: '2rem' }}>
                            <label className="input-label" style={{ fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '1rem' }}>
                                {question.text}
                            </label>
                            <textarea
                                className="input-field"
                                rows="4"
                                placeholder="Share your thoughts..."
                                value={responses[question.id] || ''}
                                onChange={(e) => handleResponseChange(question.id, e.target.value)}
                                style={{ resize: 'vertical' }}
                            />
                        </div>
                    ))}
                </div>

                <div style={{ marginTop: '3rem', display: 'flex', justifyContent: 'center' }}>
                    <button type="submit" className="btn btn-primary" style={{ padding: '1rem 3rem', fontSize: '1.1rem' }} disabled={submitting}>
                        {submitting ? 'Submitting...' : 'Submit All Responses'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ResponseSubmission;
