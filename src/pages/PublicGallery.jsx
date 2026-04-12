import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const PublicGallery = () => {
    const { t } = useLanguage();

    return (
        <div>
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-badge">
                    <span className="hero-badge-dot"></span>
                    {t('gallery.badge')}
                </div>

                <h1 className="hero-title">
                    {t('gallery.heroTitle1')}{' '}
                    <span className="hero-title-accent">{t('gallery.heroTitle2')}</span>
                </h1>

                <p className="hero-description">{t('gallery.heroDesc')}</p>

                <div className="hero-cta">
                    <Link to="/register" className="btn btn-primary btn-large">
                        {t('gallery.ctaStart')}
                    </Link>
                    <Link to="/login" className="btn btn-secondary btn-large">
                        {t('gallery.ctaLogin')}
                    </Link>
                </div>
            </section>

            {/* How it Works */}
            <section className="section" style={{ background: 'var(--bg-secondary)' }}>
                <div className="container">
                    <div className="section-header">
                        <h2>{t('gallery.howTitle')}</h2>
                        <p>{t('gallery.howDesc')}</p>
                    </div>

                    <div className="steps-grid">
                        <div className="step-card">
                            <div className="step-number">1</div>
                            <h3>{t('gallery.step1Title')}</h3>
                            <p>{t('gallery.step1Desc')}</p>
                        </div>

                        <div className="step-card">
                            <div className="step-number">2</div>
                            <h3>{t('gallery.step2Title')}</h3>
                            <p>{t('gallery.step2Desc')}</p>
                        </div>

                        <div className="step-card">
                            <div className="step-number">3</div>
                            <h3>{t('gallery.step3Title')}</h3>
                            <p>{t('gallery.step3Desc')}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="section">
                <div className="container">
                    <div className="section-header">
                        <h2>{t('gallery.aiTitle')}</h2>
                        <p>{t('gallery.aiDesc')}</p>
                    </div>

                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-icon">
                                <span style={{ fontSize: '1.5rem' }}>✨</span>
                            </div>
                            <h3>{t('gallery.feature1Title')}</h3>
                            <p>{t('gallery.feature1Desc')}</p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon">
                                <span style={{ fontSize: '1.5rem' }}>📊</span>
                            </div>
                            <h3>{t('gallery.feature2Title')}</h3>
                            <p>{t('gallery.feature2Desc')}</p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon">
                                <span style={{ fontSize: '1.5rem' }}>🌍</span>
                            </div>
                            <h3>{t('gallery.feature3Title')}</h3>
                            <p>{t('gallery.feature3Desc')}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Use Cases */}
            <section className="section" style={{ background: 'var(--bg-secondary)' }}>
                <div className="container">
                    <div className="section-header">
                        <h2>{t('gallery.useCasesTitle')}</h2>
                        <p>{t('gallery.useCasesDesc')}</p>
                    </div>

                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-icon" style={{ background: 'var(--secondary-light)' }}>
                                <span style={{ fontSize: '1.5rem' }}>🏙️</span>
                            </div>
                            <h3>{t('gallery.useCase1Title')}</h3>
                            <p>{t('gallery.useCase1Desc')}</p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon" style={{ background: '#FEF3C7' }}>
                                <span style={{ fontSize: '1.5rem' }}>🎪</span>
                            </div>
                            <h3>{t('gallery.useCase2Title')}</h3>
                            <p>{t('gallery.useCase2Desc')}</p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon" style={{ background: '#EDE9FE' }}>
                                <span style={{ fontSize: '1.5rem' }}>🚀</span>
                            </div>
                            <h3>{t('gallery.useCase3Title')}</h3>
                            <p>{t('gallery.useCase3Desc')}</p>
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
                            <p>{t('gallery.statLang')}</p>
                        </div>
                        <div className="stat-item">
                            <h3>GPT-4</h3>
                            <p>{t('gallery.statAi')}</p>
                        </div>
                        <div className="stat-item">
                            <h3>100%</h3>
                            <p>{t('gallery.statAnon')}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="cta-section">
                <div className="container">
                    <h2>{t('gallery.ctaTitle')}</h2>
                    <p>{t('gallery.ctaDesc')}</p>
                    <Link to="/register" className="btn btn-large">
                        {t('gallery.ctaBtn')}
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer">
                <div className="container">
                    <p>{t('gallery.footer')}</p>
                </div>
            </footer>
        </div>
    );
};

export default PublicGallery;
