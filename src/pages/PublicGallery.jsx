import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import '../styles/landing.css';
import Icon from '../components/Icon';
import DemoModal from '../components/DemoModal';
import ChatPanel from '../components/ChatPanel';

const HOW_STEPS = ['s1', 's2', 's3'];
const FAQ_ITEMS = ['q1', 'q2', 'q3', 'q4', 'q5'];
const PLATFORM_LOGOS = ['Shopify', 'Mercado Libre', 'VTEX', 'WooCommerce'];
const PRICING_TIERS = [
  { id: 'starter', liCount: 3 },
  { id: 'growth', liCount: 4, popular: true },
  { id: 'business', liCount: 3 },
  { id: 'enterprise', liCount: 4 },
];

const PHYSICAL_PAINS = [
  { icon: 'store', bg: '#ffedd5', color: '#c2410c' },
  { icon: 'map-pin', bg: '#fce7f3', color: '#be185d' },
  { icon: 'star', bg: '#dcfce7', color: '#15803d' },
];
const ECOMMERCE_PAINS = [
  { icon: 'shopping-cart', bg: '#ede9fe', color: '#7c3aed' },
  { icon: 'star', bg: '#dbeafe', color: '#1d4ed8' },
  { icon: 'inbox', bg: '#fce7f3', color: '#be185d' },
];

const FIT_COL1_ITEMS = [1, 2, 3, 4];
const FIT_COL2_ITEMS = [1, 2, 3, 4];

const DashboardPreview = () => (
  <div className="lp-dash">
    <div className="lp-dash-nav">
      <span className="lp-dash-logo">Pool<span>y</span></span>
      <div className="lp-dash-tabs">
        <span className="active">Panel</span>
        <span>Respuestas</span>
        <span>Insights</span>
      </div>
      <div className="lp-dash-nav-right">
        <span className="lp-dash-new-btn">+ Nueva encuesta</span>
        <span className="lp-dash-avatar">AR</span>
      </div>
    </div>
    <div className="lp-dash-body">
      <div className="lp-dash-greeting">
        <h3>Hola, Ana</h3>
        <p>Esto es lo que tus clientes están diciendo hoy.</p>
      </div>
      <div className="lp-dash-stats">
        <div className="lp-dash-stat">
          <span className="lp-dash-stat-icon" style={{ background: 'var(--lp-accent-light)', color: 'var(--lp-accent)' }}>
            <Icon name="clipboard" size={16} />
          </span>
          <div><strong>12</strong><span>Encuestas</span></div>
        </div>
        <div className="lp-dash-stat">
          <span className="lp-dash-stat-icon" style={{ background: '#dcfce7', color: '#15803d' }}>
            <Icon name="message" size={16} />
          </span>
          <div><strong>8,420</strong><span>Respuestas</span></div>
        </div>
        <div className="lp-dash-stat">
          <span className="lp-dash-stat-icon" style={{ background: '#e0e7ff', color: '#4f46e5' }}>
            <Icon name="activity" size={16} />
          </span>
          <div><strong>4</strong><span>Activas</span></div>
        </div>
        <div className="lp-dash-stat">
          <span className="lp-dash-stat-icon" style={{ background: '#fef9c3', color: '#a16207' }}>
            <Icon name="timer" size={16} />
          </span>
          <div><strong>1.4k</strong><span>Prom. respuestas</span></div>
        </div>
      </div>
      <div className="lp-dash-action">
        <span className="lp-dash-action-icon"><Icon name="zap" size={16} /></span>
        <div>
          <div className="lp-dash-action-label">Acción sugerida</div>
          <p>El tiempo de entrega es la queja #1 esta semana (31% de las menciones).</p>
        </div>
        <span className="lp-dash-action-btn">Ver tema →</span>
      </div>
      <div className="lp-dash-surveys">
        <div className="lp-dash-surveys-head">Tus encuestas</div>
        <div className="lp-dash-survey-row">
          <div>
            <div className="lp-dash-survey-title">Feedback post-compra — Marzo</div>
            <div className="lp-dash-survey-meta">1,284 respuestas · 6 días restantes</div>
          </div>
          <span className="lp-dash-badge active">Activa</span>
        </div>
        <div className="lp-dash-survey-row">
          <div>
            <div className="lp-dash-survey-title">¿Por qué nos devolviste?</div>
            <div className="lp-dash-survey-meta">318 respuestas · 1 día restante</div>
          </div>
          <span className="lp-dash-badge urgent">Urgente</span>
        </div>
      </div>
    </div>
  </div>
);

const PublicGallery = () => {
  const { t } = useLanguage();
  const [demoOpen, setDemoOpen] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('visible');
        });
      },
      { threshold: 0.1 }
    );
    document.querySelectorAll('.lp-fade-up').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="landing-page">

      {/* ─── HERO ─────────────────────────────────────────── */}
      <section className="lp-hero">
        <div className="lp-container">
          <h1>
            {t('landing.hero.title1')} <em>{t('landing.hero.title2')}</em>
          </h1>
          <p className="lp-hero-sub">{t('landing.hero.sub')}</p>
          <div className="lp-hero-actions">
            <button onClick={() => setDemoOpen(true)} className="lp-btn-primary">
              {t('landing.hero.cta')}
              <Icon name="arrow-right" size={16} />
            </button>
            <p className="lp-hero-note">{t('landing.hero.note')}</p>
          </div>
          <div className="lp-shot-wrap lp-fade-up">
            <div className="lp-shot">
              <div className="lp-shot-bar"><i /><i /><i /></div>
              <DashboardPreview />
            </div>
          </div>
        </div>
      </section>

      {/* ─── PROBLEM ──────────────────────────────────────── */}
      <section className="lp-section lp-section-tint">
        <div className="lp-container">
          <div className="lp-section-header center lp-fade-up">
            <span className="lp-eyebrow">{t('landing.problem.eyebrow')}</span>
            <h2 className="lp-section-title">{t('landing.problem.title')}</h2>
            <p className="lp-section-body lp-problem-subtitle" style={{ textAlign: 'center' }}>
              {t('landing.problem.subtitle')}
            </p>
          </div>
          <div className="lp-problem-cols lp-fade-up">
            <div className="lp-problem-col">
              <div className="lp-problem-col-head">
                <span className="lp-problem-dot" style={{ background: 'var(--lp-accent)' }} />
                {t('landing.problem.physical.label')}
              </div>
              {PHYSICAL_PAINS.map((pain, i) => (
                <div className="lp-problem-item" key={pain.icon + i}>
                  <span className="lp-problem-item-icon" style={{ background: pain.bg, color: pain.color }}>
                    <Icon name={pain.icon} size={17} />
                  </span>
                  <div>
                    <h3>{t(`landing.problem.physical.p${i + 1}.title`)}</h3>
                    <p>{t(`landing.problem.physical.p${i + 1}.body`)}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="lp-problem-col">
              <div className="lp-problem-col-head">
                <span className="lp-problem-dot" style={{ background: '#7c3aed' }} />
                {t('landing.problem.ecommerce.label')}
              </div>
              {ECOMMERCE_PAINS.map((pain, i) => (
                <div className="lp-problem-item" key={pain.icon + i}>
                  <span className="lp-problem-item-icon" style={{ background: pain.bg, color: pain.color }}>
                    <Icon name={pain.icon} size={17} />
                  </span>
                  <div>
                    <h3>{t(`landing.problem.ecommerce.p${i + 1}.title`)}</h3>
                    <p>{t(`landing.problem.ecommerce.p${i + 1}.body`)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── FIT / QUALIFIER ─────────────────────────────── */}
      <section className="lp-section lp-section-light">
        <div className="lp-container">
          <div className="lp-section-header center lp-fade-up">
            <span className="lp-eyebrow">{t('landing.fit.eyebrow')}</span>
            <h2 className="lp-section-title">{t('landing.fit.title')}</h2>
            <p className="lp-section-body lp-fit-subtitle" style={{ textAlign: 'center' }}>
              {t('landing.fit.subtitle')}
            </p>
          </div>
          <div className="lp-fit-grid lp-fade-up">
            <div className="lp-fit-card blue">
              <span className="lp-fit-icon"><Icon name="store" size={18} /></span>
              <div className="lp-fit-card-title">
                <Icon name="check" size={16} />
                {t('landing.fit.col1.title')}
              </div>
              <div className="lp-fit-card-subtitle">{t('landing.fit.col1.subtitle')}</div>
              <hr className="lp-fit-divider" />
              <ul className="lp-fit-list">
                {FIT_COL1_ITEMS.map((n) => (
                  <li key={n}><Icon name="check" size={15} />{t(`landing.fit.col1.li${n}`)}</li>
                ))}
              </ul>
            </div>
            <div className="lp-fit-card purple">
              <span className="lp-fit-icon"><Icon name="shopping-bag" size={18} /></span>
              <div className="lp-fit-card-title">
                <Icon name="check" size={16} />
                {t('landing.fit.col2.title')}
              </div>
              <div className="lp-fit-card-subtitle">{t('landing.fit.col2.subtitle')}</div>
              <hr className="lp-fit-divider" />
              <ul className="lp-fit-list">
                {FIT_COL2_ITEMS.map((n) => (
                  <li key={n}><Icon name="check" size={15} />{t(`landing.fit.col2.li${n}`)}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="lp-fit-scroll-cue">
            <span><Icon name="chevron-down" size={18} /></span>
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ────────────────────────────────── */}
      <section className="lp-section lp-section-light" id="como">
        <div className="lp-container">
          <div className="lp-section-header center lp-fade-up">
            <span className="lp-eyebrow">{t('landing.hiw.eyebrow')}</span>
            <h2 className="lp-section-title">{t('landing.hiw.title')}</h2>
          </div>
          <div className="lp-how lp-fade-up">
            <div>
              {HOW_STEPS.map((s, i) => (
                <div className="lp-step" key={s}>
                  <span className="lp-step-n">{String(i + 1).padStart(2, '0')}</span>
                  <div>
                    <div className="lp-step-title">{t(`landing.hiw.${s}.title`)}</div>
                    <p className="lp-step-body">{t(`landing.hiw.${s}.body`)}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="lp-shot">
              <div className="lp-shot-bar"><i /><i /><i /></div>
              <DashboardPreview />
            </div>
          </div>
        </div>
      </section>

      {/* ─── PLATFORMS / TRUST ───────────────────────────── */}
      <section className="lp-platforms">
        <div className="lp-container" style={{ textAlign: 'center' }}>
          <span className="lp-eyebrow">{t('landing.platforms.eyebrow')}</span>
          <h2 className="lp-section-title" style={{ fontSize: 26 }}>{t('landing.platforms.title')}</h2>
          <div className="lp-platform-logos">
            {PLATFORM_LOGOS.map((logo) => (
              <span className="lp-platform-logo" key={logo}>{logo}</span>
            ))}
            <span className="lp-platform-other">{t('landing.platforms.other')}</span>
          </div>
          <p className="lp-section-body" style={{ fontSize: 15.5 }}>{t('landing.platforms.body')}</p>
        </div>
      </section>

      {/* ─── PRICING ─────────────────────────────────────── */}
      <section className="lp-section lp-section-tint" id="precios">
        <div className="lp-container" style={{ textAlign: 'center' }}>
          <span className="lp-eyebrow">{t('landing.pricing.eyebrow')}</span>
          <h2 className="lp-section-title">{t('landing.pricing.title')}</h2>
          <div className="lp-pricing-grid lp-fade-up">
            {PRICING_TIERS.map((tier) => (
              <div className={`lp-pricing-card${tier.popular ? ' popular' : ''}`} key={tier.id}>
                {tier.popular && (
                  <span className="lp-pricing-badge">{t('landing.pricing.badgePopular')}</span>
                )}
                <div className="lp-pricing-tier-name">{t(`landing.pricing.${tier.id}.name`)}</div>
                {tier.id === 'enterprise' && (
                  <div className="lp-pricing-price-prefix">{t('landing.pricing.enterprise.pricePrefix')}</div>
                )}
                <div className="lp-pricing-price-row">
                  <span className="amount">{t(`landing.pricing.${tier.id}.price`)}</span>
                  <span className="suffix">{t('landing.pricing.priceSuffix')}</span>
                </div>
                <div className="lp-pricing-annual">{t(`landing.pricing.${tier.id}.annual`)}</div>
                <ul className="lp-pricing-features">
                  {Array.from({ length: tier.liCount }, (_, i) => (
                    <li key={i}>
                      <Icon name="check" size={15} />
                      {t(`landing.pricing.${tier.id}.li${i + 1}`)}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="lp-pricing-cta lp-fade-up">
            <button onClick={() => setDemoOpen(true)} className="lp-btn-primary">
              {t('landing.pricing.btn')}
              <Icon name="arrow-right" size={16} />
            </button>
            <p className="lp-pricing-note">{t('landing.pricing.note')}</p>
          </div>
        </div>
      </section>

      {/* ─── FAQ ─────────────────────────────────────────── */}
      <section className="lp-section lp-section-light" id="faq">
        <div className="lp-container">
          <div className="lp-section-header center lp-fade-up">
            <span className="lp-eyebrow">{t('landing.faq.eyebrow')}</span>
            <h2 className="lp-section-title">{t('landing.faq.title')}</h2>
          </div>
          <div className="lp-faq lp-fade-up">
            {FAQ_ITEMS.map((q, i) => (
              <details key={q} open={i === 0}>
                <summary>{t(`landing.faq.${q}`)}</summary>
                <p>{t(`landing.faq.a${i + 1}`)}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ───────────────────────────────────── */}
      <div className="lp-cta-band" id="agendar-demo">
        <div className="lp-container lp-fade-up">
          <h2>{t('landing.finalcta.title')}</h2>
          <p>{t('landing.finalcta.body')}</p>
          <button onClick={() => setDemoOpen(true)} className="lp-btn-primary">
            <Icon name="calendar" size={16} />
            {t('landing.finalcta.btn')}
          </button>
        </div>
      </div>

      {/* ─── FOOTER ──────────────────────────────────────── */}
      <footer className="lp-footer">
        <div className="lp-container lp-footer-grid">
          <div>
            <Link to="/" className="lp-footer-logo">Pool<span>y</span></Link>
            <p className="lp-footer-tagline">{t('landing.footer.tagline')}</p>
            <div className="lp-footer-copy">{t('landing.footer.copy')}</div>
          </div>
          <div className="lp-footer-links">
            <Link to="/login">{t('landing.footer.login')}</Link>
            <Link to="/privacy_notice">{t('landing.footer.privacy')}</Link>
            <Link to="/terms_of_use">{t('landing.footer.terms')}</Link>
          </div>
        </div>
      </footer>

      <DemoModal isOpen={demoOpen} onClose={() => setDemoOpen(false)} />
      <ChatPanel />

    </div>
  );
};

export default PublicGallery;
