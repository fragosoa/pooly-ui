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
                            Tecnología avanzada de Procesamiento de Lenguaje para entender lo que tu comunidad
                            realmente necesita.
                        </p>
                    </div>

                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-icon">
                                <span style={{ fontSize: '1.5rem' }}>✨</span>
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
                                <span style={{ fontSize: '1.5rem' }}>📊</span>
                            </div>
                            <h3>Análisis de prioridades</h3>
                            <p>
                                Clasifica los temas por importancia, sentimiento y urgencia.
                                Toma decisiones basadas en datos reales de tu comunidad.
                            </p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon">
                                <span style={{ fontSize: '1.5rem' }}>🌍</span>
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
                                <span style={{ fontSize: '1.5rem' }}>🏙️</span>
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
                                <span style={{ fontSize: '1.5rem' }}>🎪</span>
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
                                <span style={{ fontSize: '1.5rem' }}>🚀</span>
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
