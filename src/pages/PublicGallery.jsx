import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import '../styles/landing.css';
import LanguageSwitcher from '../components/LanguageSwitcher';

const CheckIcon = () => (
  <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" width="11" height="11">
    <polyline points="1,6 4,9 11,2" />
  </svg>
);

const PricingCheck = () => (
  <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14">
    <polyline points="1,7 5,11 13,2" />
  </svg>
);

const PublicGallery = () => {
  const { t } = useLanguage();

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
          <div className="lp-hero-inner">
            <div className="lp-hero-content lp-fade-up">
              <div className="lp-hero-kicker">{t('landing.hero.kicker')}</div>
              <h1>
                {t('landing.hero.title1')}<br />
                <em>{t('landing.hero.title2')}</em>
              </h1>
              <p className="lp-hero-sub">{t('landing.hero.sub')}</p>
              <div className="lp-hero-actions">
                <Link to="/register" className="lp-btn-primary">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                  {t('landing.hero.cta1')}
                </Link>
                <a href="#how" className="lp-btn-ghost">{t('landing.hero.cta2')}</a>
              </div>
              <p className="lp-hero-note">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                {t('landing.hero.note')}
              </p>
            </div>

            <div className="lp-hero-visual lp-fade-up" style={{ transitionDelay: '0.15s' }}>
              <div className="lp-hero-ui">
                <img
                  src="/hero-preview.png"
                  alt="Pooly AI survey insight"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentNode.style.minHeight = '320px';
                  }}
                />
              </div>
              <div className="lp-float-card lp-float-card-1">
                <div className="lp-fc-avatars">
                  <div className="lp-fc-avatar" style={{ background: 'oklch(55% 0.16 195)' }}>A</div>
                  <div className="lp-fc-avatar" style={{ background: 'oklch(55% 0.18 265)' }}>M</div>
                  <div className="lp-fc-avatar" style={{ background: 'oklch(60% 0.14 30)' }}>J</div>
                </div>
                <div className="lp-fc-value">{t('landing.hero.stat1.value')}</div>
                <div className="lp-fc-label">{t('landing.hero.stat1.label')}</div>
                <div className="lp-fc-trend">{t('landing.hero.stat1.trend')}</div>
              </div>
              <div className="lp-float-card lp-float-card-2">
                <div className="lp-fc-value">94<span style={{ fontSize: '18px', color: 'var(--lp-muted)' }}>%</span></div>
                <div className="lp-fc-label">{t('landing.hero.stat2.label')}</div>
                <div className="lp-fc-trend">{t('landing.hero.stat2.trend')}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FEATURE 1 — AI Builder (light) ───────────────── */}
      <section id="features" className="lp-section lp-section-light">
        <div className="lp-container">
          <div className="lp-feature-grid lp-fade-up">
            <div>
              <span className="lp-eyebrow">{t('landing.f1.eyebrow')}</span>
              <h2 className="lp-section-title">{t('landing.f1.title')}</h2>
              <p className="lp-section-body">{t('landing.f1.body')}</p>
              <ul className="lp-feature-list">
                <li><span className="lp-feature-check"><CheckIcon /></span>{t('landing.f1.li1')}</li>
                <li><span className="lp-feature-check"><CheckIcon /></span>{t('landing.f1.li2')}</li>
                <li><span className="lp-feature-check"><CheckIcon /></span>{t('landing.f1.li3')}</li>
                <li><span className="lp-feature-check"><CheckIcon /></span>{t('landing.f1.li4')}</li>
              </ul>
              <div className="lp-section-cta">
                <Link to="/register" className="lp-btn-primary">{t('landing.f1.cta')}</Link>
              </div>
            </div>
            <div className="lp-feature-visual">
              <div className="lp-img-placeholder">
                <div className="lp-img-placeholder-label"><span>UI screenshot · AI survey builder</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── MID CTA BAND ─────────────────────────────────── */}
      <div className="lp-mid-cta">
        <div className="lp-container">
          <div className="lp-mid-cta-inner">
            <div>
              <h3>{t('landing.midcta.h3')}</h3>
              <p>{t('landing.midcta.p')}</p>
            </div>
            <Link to="/register" className="lp-btn-primary" style={{ padding: '16px 32px', fontSize: '16px', flexShrink: 0 }}>
              {t('landing.midcta.btn')}
            </Link>
          </div>
        </div>
      </div>

      {/* ─── FEATURE 2 — Analytics (dark) ─────────────────── */}
      <section className="lp-section lp-section-dark">
        <div className="lp-container">
          <div className="lp-feature-grid reverse lp-fade-up">
            <div>
              <span className="lp-eyebrow">{t('landing.f2.eyebrow')}</span>
              <h2 className="lp-section-title lp-section-title-dark">{t('landing.f2.title')}</h2>
              <p className="lp-section-body lp-section-body-dark">{t('landing.f2.body')}</p>
              <ul className="lp-feature-list lp-feature-list-dark">
                <li><span className="lp-feature-check"><CheckIcon /></span>{t('landing.f2.li1')}</li>
                <li><span className="lp-feature-check"><CheckIcon /></span>{t('landing.f2.li2')}</li>
                <li><span className="lp-feature-check"><CheckIcon /></span>{t('landing.f2.li3')}</li>
              </ul>
              <div className="lp-section-cta">
                <Link to="/register" className="lp-btn-primary">{t('landing.f2.cta')}</Link>
              </div>
            </div>
            <div className="lp-feature-visual lp-feature-visual-dark">
              <div className="lp-img-placeholder lp-img-placeholder-dark">
                <div className="lp-img-placeholder-label"><span>Analytics dashboard screenshot</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── STATS BAND ───────────────────────────────────── */}
      <div className="lp-stats-band lp-fade-up">
        <div className="lp-container">
          <div className="lp-stats-grid">
            <div className="lp-stat-item">
              <div className="lp-stat-value">50<span>K+</span></div>
              <div className="lp-stat-label">{t('landing.stats.l1')}</div>
            </div>
            <div className="lp-stat-item">
              <div className="lp-stat-value">12<span>M</span></div>
              <div className="lp-stat-label">{t('landing.stats.l2')}</div>
            </div>
            <div className="lp-stat-item">
              <div className="lp-stat-value">94<span>%</span></div>
              <div className="lp-stat-label">{t('landing.stats.l3')}</div>
            </div>
            <div className="lp-stat-item">
              <div className="lp-stat-value">3<span>×</span></div>
              <div className="lp-stat-label">{t('landing.stats.l4')}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── FEATURE 3 — Templates (tint) ─────────────────── */}
      <section className="lp-section lp-section-tint">
        <div className="lp-container">
          <div className="lp-feature-grid lp-fade-up">
            <div>
              <span className="lp-eyebrow">{t('landing.f3.eyebrow')}</span>
              <h2 className="lp-section-title">{t('landing.f3.title')}</h2>
              <p className="lp-section-body">{t('landing.f3.body')}</p>
              <ul className="lp-feature-list">
                <li><span className="lp-feature-check"><CheckIcon /></span>{t('landing.f3.li1')}</li>
                <li><span className="lp-feature-check"><CheckIcon /></span>{t('landing.f3.li2')}</li>
                <li><span className="lp-feature-check"><CheckIcon /></span>{t('landing.f3.li3')}</li>
              </ul>
              <div className="lp-section-cta">
                <Link to="/register" className="lp-btn-primary">{t('landing.f3.cta')}</Link>
              </div>
            </div>
            <div className="lp-feature-visual">
              <div className="lp-img-placeholder">
                <div className="lp-img-placeholder-label"><span>Template gallery screenshot</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FEATURE 4 — Teams (dark) ─────────────────────── */}
      <section className="lp-section lp-section-dark">
        <div className="lp-container">
          <div className="lp-feature-grid reverse lp-fade-up">
            <div>
              <span className="lp-eyebrow">{t('landing.f4.eyebrow')}</span>
              <h2 className="lp-section-title lp-section-title-dark">{t('landing.f4.title')}</h2>
              <p className="lp-section-body lp-section-body-dark">{t('landing.f4.body')}</p>
              <ul className="lp-feature-list lp-feature-list-dark">
                <li><span className="lp-feature-check"><CheckIcon /></span>{t('landing.f4.li1')}</li>
                <li><span className="lp-feature-check"><CheckIcon /></span>{t('landing.f4.li2')}</li>
                <li><span className="lp-feature-check"><CheckIcon /></span>{t('landing.f4.li3')}</li>
              </ul>
              <div className="lp-section-cta">
                <a href="#pricing" className="lp-btn-ghost lp-btn-ghost-dark">{t('landing.f4.cta')}</a>
              </div>
            </div>
            <div className="lp-feature-visual lp-feature-visual-dark">
              <div className="lp-img-placeholder lp-img-placeholder-dark">
                <div className="lp-img-placeholder-label"><span>Team collaboration screenshot</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ────────────────────────────────── */}
      <section className="lp-section lp-section-tint" id="how">
        <div className="lp-container">
          <div className="lp-section-header center lp-fade-up">
            <span className="lp-eyebrow">{t('landing.hiw.eyebrow')}</span>
            <h2 className="lp-section-title">{t('landing.hiw.title')}</h2>
            <p className="lp-section-body" style={{ margin: '0 auto', textAlign: 'center' }}>
              {t('landing.hiw.body')}
            </p>
          </div>
          <div className="lp-steps-grid lp-fade-up">
            <div className="lp-step-card">
              <div className="lp-step-number">01</div>
              <div className="lp-step-title">{t('landing.hiw.s1.title')}</div>
              <p className="lp-step-body">{t('landing.hiw.s1.body')}</p>
              <div className="lp-step-connector" />
            </div>
            <div className="lp-step-card">
              <div className="lp-step-number">02</div>
              <div className="lp-step-title">{t('landing.hiw.s2.title')}</div>
              <p className="lp-step-body">{t('landing.hiw.s2.body')}</p>
              <div className="lp-step-connector" />
            </div>
            <div className="lp-step-card">
              <div className="lp-step-number">03</div>
              <div className="lp-step-title">{t('landing.hiw.s3.title')}</div>
              <p className="lp-step-body">{t('landing.hiw.s3.body')}</p>
            </div>
          </div>
          <div className="lp-steps-cta">
            <Link to="/register" className="lp-btn-primary" style={{ padding: '16px 40px', fontSize: '16px' }}>
              {t('landing.hiw.cta')}
            </Link>
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ────────────────────────────────── */}
      <section className="lp-section lp-section-light" id="testimonials">
        <div className="lp-container">
          <div className="lp-section-header center lp-fade-up">
            <span className="lp-eyebrow">{t('landing.t.eyebrow')}</span>
            <h2 className="lp-section-title">{t('landing.t.title')}</h2>
          </div>
          <div className="lp-testimonials-grid lp-fade-up">
            <div className="lp-testimonial-card">
              <div className="lp-stars">★★★★★</div>
              <p className="lp-testimonial-quote">{t('landing.t.q1')}</p>
              <div className="lp-testimonial-author">
                <div className="lp-author-avatar" style={{ background: 'oklch(55% 0.16 195)' }}>S</div>
                <div>
                  <div className="lp-author-name">{t('landing.t.n1')}</div>
                  <div className="lp-author-role">{t('landing.t.r1')}</div>
                </div>
              </div>
            </div>
            <div className="lp-testimonial-card">
              <div className="lp-stars">★★★★★</div>
              <p className="lp-testimonial-quote">{t('landing.t.q2')}</p>
              <div className="lp-testimonial-author">
                <div className="lp-author-avatar" style={{ background: 'oklch(50% 0.18 265)' }}>M</div>
                <div>
                  <div className="lp-author-name">{t('landing.t.n2')}</div>
                  <div className="lp-author-role">{t('landing.t.r2')}</div>
                </div>
              </div>
            </div>
            <div className="lp-testimonial-card">
              <div className="lp-stars">★★★★★</div>
              <p className="lp-testimonial-quote">{t('landing.t.q3')}</p>
              <div className="lp-testimonial-author">
                <div className="lp-author-avatar" style={{ background: 'oklch(58% 0.15 30)' }}>A</div>
                <div>
                  <div className="lp-author-name">{t('landing.t.n3')}</div>
                  <div className="lp-author-role">{t('landing.t.r3')}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── PRICING ─────────────────────────────────────── */}
      <section className="lp-section lp-section-dark" id="pricing">
        <div className="lp-container">
          <div className="lp-section-header center lp-fade-up">
            <span className="lp-eyebrow">{t('landing.p.eyebrow')}</span>
            <h2 className="lp-section-title lp-section-title-dark">{t('landing.p.title')}</h2>
            <p className="lp-section-body lp-section-body-dark" style={{ margin: '0 auto', textAlign: 'center' }}>
              {t('landing.p.body')}
            </p>
          </div>
          <div className="lp-pricing-grid lp-fade-up">
            {/* Free */}
            <div className="lp-pricing-card">
              <div className="lp-pricing-plan">{t('landing.p.free.plan')}</div>
              <div className="lp-pricing-price">$0</div>
              <div className="lp-pricing-period">{t('landing.p.free.period')}</div>
              <p className="lp-pricing-desc">{t('landing.p.free.desc')}</p>
              <hr className="lp-pricing-divider" />
              <ul className="lp-pricing-features">
                <li><PricingCheck />{t('landing.p.free.li1')}</li>
                <li><PricingCheck />{t('landing.p.free.li2')}</li>
                <li><PricingCheck />{t('landing.p.free.li3')}</li>
                <li><PricingCheck />{t('landing.p.free.li4')}</li>
              </ul>
              <div className="lp-pricing-btn">
                <Link to="/register" className="lp-btn-ghost lp-btn-ghost-dark" style={{ width: '100%', justifyContent: 'center' }}>
                  {t('landing.p.free.btn')}
                </Link>
              </div>
            </div>
            {/* Pro */}
            <div className="lp-pricing-card featured">
              <div className="lp-pricing-badge">{t('landing.p.pro.badge')}</div>
              <div className="lp-pricing-plan">{t('landing.p.pro.plan')}</div>
              <div className="lp-pricing-price"><sup>$</sup>29</div>
              <div className="lp-pricing-period">{t('landing.p.pro.period')}</div>
              <p className="lp-pricing-desc">{t('landing.p.pro.desc')}</p>
              <hr className="lp-pricing-divider" />
              <ul className="lp-pricing-features">
                <li><PricingCheck />{t('landing.p.pro.li1')}</li>
                <li><PricingCheck />{t('landing.p.pro.li2')}</li>
                <li><PricingCheck />{t('landing.p.pro.li3')}</li>
                <li><PricingCheck />{t('landing.p.pro.li4')}</li>
                <li><PricingCheck />{t('landing.p.pro.li5')}</li>
                <li><PricingCheck />{t('landing.p.pro.li6')}</li>
              </ul>
              <div className="lp-pricing-btn">
                <Link to="/register" className="lp-btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                  {t('landing.p.pro.btn')}
                </Link>
              </div>
            </div>
            {/* Enterprise */}
            <div className="lp-pricing-card">
              <div className="lp-pricing-plan">{t('landing.p.ent.plan')}</div>
              <div className="lp-pricing-price" style={{ fontSize: '32px' }}>{t('landing.p.ent.price')}</div>
              <div className="lp-pricing-period">{t('landing.p.ent.period')}</div>
              <p className="lp-pricing-desc">{t('landing.p.ent.desc')}</p>
              <hr className="lp-pricing-divider" />
              <ul className="lp-pricing-features">
                <li><PricingCheck />{t('landing.p.ent.li1')}</li>
                <li><PricingCheck />{t('landing.p.ent.li2')}</li>
                <li><PricingCheck />{t('landing.p.ent.li3')}</li>
                <li><PricingCheck />{t('landing.p.ent.li4')}</li>
                <li><PricingCheck />{t('landing.p.ent.li5')}</li>
                <li><PricingCheck />{t('landing.p.ent.li6')}</li>
              </ul>
              <div className="lp-pricing-btn">
                <a href="mailto:hello@pooly.app" className="lp-btn-ghost lp-btn-ghost-dark" style={{ width: '100%', justifyContent: 'center' }}>
                  {t('landing.p.ent.btn')}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA BAND ──────────────────────────────── */}
      <div className="lp-cta-band">
        <div className="lp-container">
          <div className="lp-cta-band-inner lp-fade-up">
            <h2>{t('landing.cta.title')}</h2>
            <p>{t('landing.cta.body')}</p>
            <div className="lp-cta-band-actions">
              <Link to="/register" className="lp-btn-primary" style={{ padding: '16px 36px', fontSize: '16px' }}>
                {t('landing.cta.btn1')}
              </Link>
              <Link to="/login" className="lp-btn-ghost lp-btn-ghost-dark">
                {t('landing.cta.btn2')}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ─── FOOTER ──────────────────────────────────────── */}
      <footer className="lp-footer">
        <div className="lp-container">
          <div className="lp-footer-top">
            <div>
              <Link to="/" className="lp-footer-logo">Pool<span>y</span></Link>
              <p className="lp-footer-tagline">{t('landing.footer.tagline')}</p>
              <div className="lp-footer-social">
                <a href="#" className="lp-social-btn" aria-label="Twitter">𝕏</a>
                <a href="#" className="lp-social-btn" aria-label="LinkedIn">in</a>
                <a href="#" className="lp-social-btn" aria-label="GitHub">⌥</a>
              </div>
            </div>
            <div>
              <div className="lp-footer-col-title">{t('landing.footer.col1')}</div>
              <ul className="lp-footer-links">
                <li><Link to="/register">{t('landing.footer.p1')}</Link></li>
                <li><a href="#features">{t('landing.footer.p2')}</a></li>
                <li><a href="#features">{t('landing.footer.p3')}</a></li>
                <li><a href="#pricing">{t('landing.footer.p4')}</a></li>
              </ul>
            </div>
            <div>
              <div className="lp-footer-col-title">{t('landing.footer.col2')}</div>
              <ul className="lp-footer-links">
                <li><a href="#">{t('landing.footer.r1')}</a></li>
                <li><a href="#">{t('landing.footer.r2')}</a></li>
                <li><a href="#">{t('landing.footer.r3')}</a></li>
                <li><a href="#">{t('landing.footer.r4')}</a></li>
              </ul>
            </div>
            <div>
              <div className="lp-footer-col-title">{t('landing.footer.col3')}</div>
              <ul className="lp-footer-links">
                <li><a href="#">{t('landing.footer.l1')}</a></li>
                <li><a href="#">{t('landing.footer.l2')}</a></li>
                <li><a href="#">{t('landing.footer.l3')}</a></li>
                <li><a href="#">{t('landing.footer.l4')}</a></li>
              </ul>
            </div>
            <div>
              <div className="lp-footer-col-title">{t('landing.footer.col4')}</div>
              <ul className="lp-footer-links">
                <li><a href="#">{t('landing.footer.a1')}</a></li>
                <li><a href="#">{t('landing.footer.a2')}</a></li>
                <li><a href="#">{t('landing.footer.a3')}</a></li>
                <li><a href="mailto:hello@pooly.app">{t('landing.footer.a4')}</a></li>
              </ul>
            </div>
          </div>

          <div className="lp-footer-bottom">
            <p className="lp-footer-copy">{t('landing.footer.copy')}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
              <div className="lp-footer-legal">
                <a href="#">{t('landing.footer.privacy')}</a>
                <a href="#">{t('landing.footer.terms')}</a>
                <a href="#">{t('landing.footer.cookies')}</a>
              </div>
              <LanguageSwitcher dark />
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default PublicGallery;
