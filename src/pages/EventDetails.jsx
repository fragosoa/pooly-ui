import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

const EventDetails = () => {
    const { eventId } = useParams();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [analyzing, setAnalyzing] = useState(false);
    const [analysisStatus, setAnalysisStatus] = useState('');

    useEffect(() => {
        const fetchEventDetails = async () => {
            try {
                const response = await api.get(`/events/${eventId}/details`);
                // Backend returns { status: "success", data: { ...event, questions: [...] } }
                setEvent(response.data.data);
            } catch (err) {
                console.error('Failed to fetch event details:', err);
                setError('Failed to load event details.');
                // Mock data as fallback
                setEvent({
                    id: eventId,
                    name: 'Urban Mobility 2026',
                    description: 'What do you think about the new bike lanes in the city center?',
                    end: '2026-12-31',
                    questions: [
                        {
                            id: 101,
                            text: 'What is your main mode of transport?',
                            responses: [
                                { id: 1001, text: 'I use the subway everyday.' },
                                { id: 1002, text: 'Mostly bicycle, but it feels unsafe.' }
                            ]
                        },
                        {
                            id: 102,
                            text: 'Are you satisfied with the current bike lanes?',
                            responses: [
                                { id: 2001, text: 'No, they are too narrow.' }
                            ]
                        }
                    ]
                });
            } finally {
                setLoading(false);
            }
        };
        fetchEventDetails();
    }, [eventId]);

    const handleAnalyze = async () => {
        setAnalyzing(true);
        setAnalysisStatus('');
        try {
            await api.post(`/events/${eventId}/analyze`);
            setAnalysisStatus('Analysis triggered successfully!');
        } catch (err) {
            setAnalysisStatus('Failed to trigger analysis. Please try again.');
        } finally {
            setAnalyzing(false);
        }
    };

    if (loading) return <div className="container" style={{ paddingTop: '8rem' }}><p>Loading event details...</p></div>;
    if (!event && error) return <div className="container" style={{ paddingTop: '8rem' }}><p style={{ color: '#ef4444' }}>{error}</p></div>;
    if (!event) return null;

    return (
        <div className="container" style={{ paddingTop: '6rem', paddingBottom: '4rem' }}>
            <header style={{ margin: '3rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <Link to="/admin" style={{ color: 'var(--primary)', marginBottom: '1rem', display: 'inline-block' }}>← Back to Dashboard</Link>
                    <h1 className="page-title" style={{ fontSize: '2.5rem' }}>{event.name}</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>{event.description}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <button
                        onClick={handleAnalyze}
                        className="btn btn-primary"
                        disabled={analyzing}
                        style={{ marginBottom: '0.5rem' }}
                    >
                        {analyzing ? 'Analyzing...' : 'Trigger Analysis'}
                    </button>
                    {analysisStatus && (
                        <p style={{ fontSize: '0.875rem', color: analysisStatus.includes('success') ? 'var(--primary)' : '#ef4444' }}>
                            {analysisStatus}
                        </p>
                    )}
                </div>
            </header>

            {error && !event.questions && (
                <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--glass-border)', padding: '1rem', borderRadius: '8px', marginBottom: '2rem', color: 'var(--text-muted)' }}>
                    {error} (Showing demo data)
                </div>
            )}

            <section style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>
                    <h2 style={{ fontSize: '1.75rem' }}>Questions & Responses</h2>
                    <button
                        className="btn btn-premium"
                        style={{ padding: '0.6rem 1.4rem', fontSize: '0.9rem' }}
                        onClick={() => alert('Report generation will be implemented soon!')}
                    >
                        Generate Report
                    </button>
                </div>

                {event.questions?.map(question => (
                    <div key={question.id} className="glass-card" style={{ overflow: 'hidden' }}>
                        <div style={{ padding: '1.5rem 2rem', background: 'rgba(255, 255, 255, 0.02)', borderBottom: '1px solid var(--glass-border)' }}>
                            <h3 style={{ fontSize: '1.25rem' }}>{question.text}</h3>
                        </div>
                        <div style={{ padding: '1.5rem 2rem' }}>
                            {question.responses?.length === 0 ? (
                                <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No responses yet.</p>
                            ) : (
                                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {question.responses?.map(response => (
                                        <li key={response.id} style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px', borderLeft: '3px solid var(--primary)' }}>
                                            {response.text}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                ))}
            </section>
        </div>
    );
};

export default EventDetails;
