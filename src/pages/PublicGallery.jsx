import { Link } from 'react-router-dom';

const PublicGallery = () => {
    return (
        <div>
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-badge">
                    <span className="hero-badge-dot"></span>
                    Plataforma de participación ciudadana
                </div>

                <h1 className="hero-title">
                    Transforma miles de voces en{' '}
                    <span className="hero-title-accent">insights accionables</span>
                </h1>

                <p className="hero-description">
                    Crea encuestas, recolecta opiniones de tu comunidad y obtén análisis
                    automático con IA. Descubre patrones, sentimientos y prioridades
                    sin categorías predefinidas.
                </p>

                <div className="hero-cta">
                    <Link to="/register" className="btn btn-primary btn-large">
                        Comenzar gratis
                    </Link>
                    <Link to="/login" className="btn btn-secondary btn-large">
                        Ya tengo cuenta
                    </Link>
                </div>
            </section>

            {/* How it Works */}
            <section className="section" style={{ background: 'var(--bg-secondary)' }}>
                <div className="container">
                    <div className="section-header">
                        <h2>Cómo funciona</h2>
                        <p>
                            Tres pasos simples para convertir la retroalimentación de tu
                            comunidad en decisiones informadas.
                        </p>
                    </div>

                    <div className="steps-grid">
                        <div className="step-card">
                            <div className="step-number">1</div>
                            <h3>Crea tu encuesta</h3>
                            <p>
                                Define las preguntas abiertas que quieres hacer a tu comunidad.
                                Sin límites de opciones predefinidas.
                            </p>
                        </div>

                        <div className="step-card">
                            <div className="step-number">2</div>
                            <h3>Comparte el enlace</h3>
                            <p>
                                Distribuye el enlace único. Los participantes responden
                                de forma anónima desde cualquier dispositivo.
                            </p>
                        </div>

                        <div className="step-card">
                            <div className="step-number">3</div>
                            <h3>Obtén insights</h3>
                            <p>
                                Nuestra IA agrupa respuestas, identifica temas emergentes
                                y analiza el sentimiento automáticamente.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="section">
                <div className="container">
                    <div className="section-header">
                        <h2>Potenciado por inteligencia artificial</h2>
                        <p>
                            Tecnología avanzada de NLP para entender lo que tu comunidad
                            realmente necesita.
                        </p>
                    </div>

                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
                                </svg>
                            </div>
                            <h3>Descubrimiento automático</h3>
                            <p>
                                Traduce miles de voces individuales en categorías claras
                                sin necesidad de definirlas previamente. La IA encuentra
                                los patrones por ti.
                            </p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                                </svg>
                            </div>
                            <h3>Análisis de prioridades</h3>
                            <p>
                                Clasifica los temas por importancia, sentimiento y urgencia.
                                Toma decisiones basadas en datos reales de tu comunidad.
                            </p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                                </svg>
                            </div>
                            <h3>Multilingüe</h3>
                            <p>
                                Soporte para más de 50 idiomas. Recibe respuestas en cualquier
                                idioma y obtén análisis unificados y coherentes.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Use Cases */}
            <section className="section" style={{ background: 'var(--bg-secondary)' }}>
                <div className="container">
                    <div className="section-header">
                        <h2>Casos de uso</h2>
                        <p>
                            Desde planeación urbana hasta investigación de mercado,
                            Pooly se adapta a tus necesidades.
                        </p>
                    </div>

                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-icon" style={{ background: 'var(--secondary-light)' }}>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ color: 'var(--secondary)' }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
                                </svg>
                            </div>
                            <h3>Planeación urbana</h3>
                            <p>
                                Recolecta retroalimentación ciudadana sobre infraestructura,
                                parques y servicios públicos. Visualiza el futuro de tu ciudad
                                a través de la colaboración comunitaria.
                            </p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon" style={{ background: '#FEF3C7' }}>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ color: 'var(--accent-warm)' }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                                </svg>
                            </div>
                            <h3>Eventos y conferencias</h3>
                            <p>
                                Entiende la satisfacción de los asistentes y recopila
                                sugerencias de mejora. Desde conferencias hasta festivales,
                                clarifica cada voz.
                            </p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon" style={{ background: '#EDE9FE' }}>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ color: 'var(--accent-purple)' }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605" />
                                </svg>
                            </div>
                            <h3>Investigación de producto</h3>
                            <p>
                                Prueba nuevas ideas directamente con tu comunidad e itera
                                rápidamente. Insights que impulsan innovación significativa.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="stats-section">
                <div className="container">
                    <div className="stats-grid">
                        <div className="stat-item">
                            <h3>50+</h3>
                            <p>Idiomas soportados</p>
                        </div>
                        <div className="stat-item">
                            <h3>GPT-4</h3>
                            <p>Análisis inteligente</p>
                        </div>
                        <div className="stat-item">
                            <h3>100%</h3>
                            <p>Anónimo y seguro</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="cta-section">
                <div className="container">
                    <h2>Empieza a escuchar a tu comunidad</h2>
                    <p>
                        Crea tu primera encuesta en minutos. Sin tarjeta de crédito requerida.
                    </p>
                    <Link to="/register" className="btn btn-large">
                        Crear cuenta gratis
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer">
                <div className="container">
                    <p>© 2025 Pooly. Plataforma de participación ciudadana.</p>
                </div>
            </footer>
        </div>
    );
};

export default PublicGallery;
