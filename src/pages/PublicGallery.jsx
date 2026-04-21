import { useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
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
              <div className="lp-hero-kicker">AI-Powered Survey Platform</div>
              <h1>
                Surveys that think.<br />
                <em>Answers that matter.</em>
              </h1>
              <p className="lp-hero-sub">
                Pooly uses AI to help you build smarter surveys, reach the right audience,
                and turn responses into decisions — faster than ever.
              </p>
              <div className="lp-hero-actions">
                <Link to="/register" className="lp-btn-primary">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                  Start for free
                </Link>
                <a href="#how" className="lp-btn-ghost">See how it works</a>
              </div>
              <p className="lp-hero-note">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                No credit card required · Free plan forever
              </p>
            </div>

            <div className="lp-hero-visual lp-fade-up" style={{ transitionDelay: '0.15s' }}>
              <div className="lp-hero-ui">
                <img
                  src="/hero-preview.png"
                  alt="Pooly AI survey insight example"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentNode.style.minHeight = '320px';
                    e.target.parentNode.style.background = '#f5f5f5';
                    e.target.parentNode.style.display = 'flex';
                    e.target.parentNode.style.alignItems = 'center';
                    e.target.parentNode.style.justifyContent = 'center';
                  }}
                />
              </div>

              <div className="lp-float-card lp-float-card-1">
                <div className="lp-fc-avatars">
                  <div className="lp-fc-avatar" style={{ background: 'oklch(55% 0.16 195)' }}>A</div>
                  <div className="lp-fc-avatar" style={{ background: 'oklch(55% 0.18 265)' }}>M</div>
                  <div className="lp-fc-avatar" style={{ background: 'oklch(60% 0.14 30)' }}>J</div>
                </div>
                <div className="lp-fc-value">2,847</div>
                <div className="lp-fc-label">Responses today</div>
                <div className="lp-fc-trend">↑ 18% this week</div>
              </div>

              <div className="lp-float-card lp-float-card-2">
                <div className="lp-fc-value">94<span style={{ fontSize: '18px', color: 'var(--lp-muted)' }}>%</span></div>
                <div className="lp-fc-label">Completion rate</div>
                <div className="lp-fc-trend">↑ vs. industry avg</div>
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
              <span className="lp-eyebrow">AI Survey Builder</span>
              <h2 className="lp-section-title">Go from idea to live survey in seconds</h2>
              <p className="lp-section-body">
                Describe what you want to learn and Pooly's AI engine drafts a complete,
                optimized survey — with smart question logic, branching, and bias detection built in.
              </p>
              <ul className="lp-feature-list">
                <li><span className="lp-feature-check"><CheckIcon /></span>Generate full surveys from a single prompt</li>
                <li><span className="lp-feature-check"><CheckIcon /></span>Auto-detect and fix leading questions</li>
                <li><span className="lp-feature-check"><CheckIcon /></span>Smart skip logic and conditional branching</li>
                <li><span className="lp-feature-check"><CheckIcon /></span>Multilingual support out of the box</li>
              </ul>
              <div className="lp-section-cta">
                <Link to="/register" className="lp-btn-primary">Build your first survey →</Link>
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
              <h3>Ready to hear what your customers really think?</h3>
              <p>Join over 50,000 teams already using Pooly to make smarter decisions.</p>
            </div>
            <Link to="/register" className="lp-btn-primary" style={{ padding: '16px 32px', fontSize: '16px', flexShrink: 0 }}>
              Get started free →
            </Link>
          </div>
        </div>
      </div>

      {/* ─── FEATURE 2 — Analytics (dark) ─────────────────── */}
      <section className="lp-section lp-section-dark">
        <div className="lp-container">
          <div className="lp-feature-grid reverse lp-fade-up">
            <div>
              <span className="lp-eyebrow">Real-time Analytics</span>
              <h2 className="lp-section-title lp-section-title-dark">Responses turn into insights automatically</h2>
              <p className="lp-section-body lp-section-body-dark">
                Watch answers come in live. Pooly's AI surfaces trends, sentiment shifts,
                and key themes as responses roll in — no manual analysis required.
              </p>
              <ul className="lp-feature-list lp-feature-list-dark">
                <li><span className="lp-feature-check"><CheckIcon /></span>Live response dashboard with filters</li>
                <li><span className="lp-feature-check"><CheckIcon /></span>AI-generated summary of open-text responses</li>
                <li><span className="lp-feature-check"><CheckIcon /></span>Exportable reports (CSV, PDF, Notion)</li>
              </ul>
              <div className="lp-section-cta">
                <Link to="/register" className="lp-btn-primary">See analytics demo →</Link>
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
              <div className="lp-stat-label">Teams using Pooly</div>
            </div>
            <div className="lp-stat-item">
              <div className="lp-stat-value">12<span>M</span></div>
              <div className="lp-stat-label">Survey responses collected</div>
            </div>
            <div className="lp-stat-item">
              <div className="lp-stat-value">94<span>%</span></div>
              <div className="lp-stat-label">Average completion rate</div>
            </div>
            <div className="lp-stat-item">
              <div className="lp-stat-value">3<span>×</span></div>
              <div className="lp-stat-label">Faster than building manually</div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── FEATURE 3 — Templates (tint) ─────────────────── */}
      <section className="lp-section lp-section-tint">
        <div className="lp-container">
          <div className="lp-feature-grid lp-fade-up">
            <div>
              <span className="lp-eyebrow">Template Library</span>
              <h2 className="lp-section-title">100+ expert-built templates to get you started</h2>
              <p className="lp-section-body">
                From NPS and CSAT to employee engagement and market research — every template
                is research-backed and ready to customize.
              </p>
              <ul className="lp-feature-list">
                <li><span className="lp-feature-check"><CheckIcon /></span>Categorized by industry and use case</li>
                <li><span className="lp-feature-check"><CheckIcon /></span>Fully customizable branding</li>
                <li><span className="lp-feature-check"><CheckIcon /></span>One-click deploy via link, email, or embed</li>
              </ul>
              <div className="lp-section-cta">
                <Link to="/register" className="lp-btn-primary">Browse templates →</Link>
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
              <span className="lp-eyebrow">Built for teams</span>
              <h2 className="lp-section-title lp-section-title-dark">The whole team, on the same page</h2>
              <p className="lp-section-body lp-section-body-dark">
                Collaborate on surveys, share results with stakeholders, and manage permissions
                — all in one place. Real people, real workflows.
              </p>
              <ul className="lp-feature-list lp-feature-list-dark">
                <li><span className="lp-feature-check"><CheckIcon /></span>Multi-user workspaces with role-based access</li>
                <li><span className="lp-feature-check"><CheckIcon /></span>Shared results and collaborative annotations</li>
                <li><span className="lp-feature-check"><CheckIcon /></span>SSO, audit logs, and enterprise compliance</li>
              </ul>
              <div className="lp-section-cta">
                <a href="#pricing" className="lp-btn-ghost lp-btn-ghost-dark">Explore team features</a>
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
            <span className="lp-eyebrow">How it works</span>
            <h2 className="lp-section-title">Three steps to better answers</h2>
            <p className="lp-section-body" style={{ margin: '0 auto', textAlign: 'center' }}>
              From prompt to published in under two minutes. Pooly handles the hard parts
              so you can focus on the insights.
            </p>
          </div>
          <div className="lp-steps-grid lp-fade-up">
            <div className="lp-step-card">
              <div className="lp-step-number">01</div>
              <div className="lp-step-title">Describe your goal</div>
              <p className="lp-step-body">
                Tell Pooly what you want to learn — in plain English.
                No survey design experience needed.
              </p>
              <div className="lp-step-connector" />
            </div>
            <div className="lp-step-card">
              <div className="lp-step-number">02</div>
              <div className="lp-step-title">Review &amp; customize</div>
              <p className="lp-step-body">
                AI drafts your survey instantly. Edit questions, add your branding,
                and set up distribution logic.
              </p>
              <div className="lp-step-connector" />
            </div>
            <div className="lp-step-card">
              <div className="lp-step-number">03</div>
              <div className="lp-step-title">Share &amp; analyze</div>
              <p className="lp-step-body">
                Send via link, email, or embed. Watch insights surface automatically
                as responses come in.
              </p>
            </div>
          </div>
          <div className="lp-steps-cta">
            <Link to="/register" className="lp-btn-primary" style={{ padding: '16px 40px', fontSize: '16px' }}>
              Try it free →
            </Link>
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ────────────────────────────────── */}
      <section className="lp-section lp-section-light" id="testimonials">
        <div className="lp-container">
          <div className="lp-section-header center lp-fade-up">
            <span className="lp-eyebrow">Customer stories</span>
            <h2 className="lp-section-title">Trusted by people who need real answers</h2>
          </div>
          <div className="lp-testimonials-grid lp-fade-up">
            <div className="lp-testimonial-card">
              <div className="lp-stars">★★★★★</div>
              <p className="lp-testimonial-quote">
                Pooly cut our survey setup time in half. The AI suggestions are genuinely
                good — it caught leading questions we didn't even notice.
              </p>
              <div className="lp-testimonial-author">
                <div className="lp-author-avatar" style={{ background: 'oklch(55% 0.16 195)' }}>S</div>
                <div>
                  <div className="lp-author-name">Sara Velázquez</div>
                  <div className="lp-author-role">Head of Research, Meridian</div>
                </div>
              </div>
            </div>
            <div className="lp-testimonial-card">
              <div className="lp-stars">★★★★★</div>
              <p className="lp-testimonial-quote">
                We ran our first NPS survey within 10 minutes of signing up. The response
                rate was 40% higher than our previous tool — the design really matters.
              </p>
              <div className="lp-testimonial-author">
                <div className="lp-author-avatar" style={{ background: 'oklch(50% 0.18 265)' }}>M</div>
                <div>
                  <div className="lp-author-name">Marcus Chen</div>
                  <div className="lp-author-role">Product Manager, Northvale</div>
                </div>
              </div>
            </div>
            <div className="lp-testimonial-card">
              <div className="lp-stars">★★★★★</div>
              <p className="lp-testimonial-quote">
                The real-time analytics are incredible. I shared a live dashboard with our
                board while the survey was still running — they were blown away.
              </p>
              <div className="lp-testimonial-author">
                <div className="lp-author-avatar" style={{ background: 'oklch(58% 0.15 30)' }}>A</div>
                <div>
                  <div className="lp-author-name">Aisha Okonkwo</div>
                  <div className="lp-author-role">Director of Strategy, Arkon Labs</div>
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
            <span className="lp-eyebrow">Pricing</span>
            <h2 className="lp-section-title lp-section-title-dark">Simple, honest pricing</h2>
            <p className="lp-section-body lp-section-body-dark" style={{ margin: '0 auto', textAlign: 'center' }}>
              Start free. Upgrade when you need more power. No hidden fees.
            </p>
          </div>
          <div className="lp-pricing-grid lp-fade-up">
            {/* Free */}
            <div className="lp-pricing-card">
              <div className="lp-pricing-plan">Free</div>
              <div className="lp-pricing-price">$0</div>
              <div className="lp-pricing-period">forever</div>
              <p className="lp-pricing-desc">Perfect for individuals exploring AI-assisted surveys.</p>
              <hr className="lp-pricing-divider" />
              <ul className="lp-pricing-features">
                <li><PricingCheck />3 active surveys</li>
                <li><PricingCheck />100 responses / month</li>
                <li><PricingCheck />AI survey builder</li>
                <li><PricingCheck />Basic analytics</li>
              </ul>
              <div className="lp-pricing-btn">
                <Link to="/register" className="lp-btn-ghost lp-btn-ghost-dark" style={{ width: '100%', justifyContent: 'center' }}>
                  Get started
                </Link>
              </div>
            </div>
            {/* Pro */}
            <div className="lp-pricing-card featured">
              <div className="lp-pricing-badge">Most popular</div>
              <div className="lp-pricing-plan">Pro</div>
              <div className="lp-pricing-price"><sup>$</sup>29</div>
              <div className="lp-pricing-period">per month</div>
              <p className="lp-pricing-desc">For teams that need unlimited surveys and advanced AI.</p>
              <hr className="lp-pricing-divider" />
              <ul className="lp-pricing-features">
                <li><PricingCheck />Unlimited surveys</li>
                <li><PricingCheck />10,000 responses / month</li>
                <li><PricingCheck />Advanced AI analytics</li>
                <li><PricingCheck />Custom branding</li>
                <li><PricingCheck />CSV & PDF exports</li>
                <li><PricingCheck />Priority support</li>
              </ul>
              <div className="lp-pricing-btn">
                <Link to="/register" className="lp-btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                  Start free trial
                </Link>
              </div>
            </div>
            {/* Enterprise */}
            <div className="lp-pricing-card">
              <div className="lp-pricing-plan">Enterprise</div>
              <div className="lp-pricing-price" style={{ fontSize: '32px' }}>Custom</div>
              <div className="lp-pricing-period">contact us</div>
              <p className="lp-pricing-desc">For large organizations with security and compliance requirements.</p>
              <hr className="lp-pricing-divider" />
              <ul className="lp-pricing-features">
                <li><PricingCheck />Unlimited everything</li>
                <li><PricingCheck />SSO & audit logs</li>
                <li><PricingCheck />Enterprise compliance</li>
                <li><PricingCheck />Dedicated onboarding</li>
                <li><PricingCheck />SLA guarantee</li>
                <li><PricingCheck />Custom integrations</li>
              </ul>
              <div className="lp-pricing-btn">
                <a href="mailto:hello@pooly.app" className="lp-btn-ghost lp-btn-ghost-dark" style={{ width: '100%', justifyContent: 'center' }}>
                  Contact sales
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
            <h2>Start making decisions with confidence.</h2>
            <p>Join 50,000+ teams who run smarter surveys with Pooly.</p>
            <div className="lp-cta-band-actions">
              <Link to="/register" className="lp-btn-primary" style={{ padding: '16px 36px', fontSize: '16px' }}>
                Get started free →
              </Link>
              <Link to="/login" className="lp-btn-ghost lp-btn-ghost-dark">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ─── FOOTER ──────────────────────────────────────── */}
      <footer className="lp-footer">
        <div className="lp-container">
          <div className="lp-footer-top">
            {/* Brand */}
            <div>
              <Link to="/" className="lp-footer-logo">Pool<span>y</span></Link>
              <p className="lp-footer-tagline">
                AI-powered surveys that help teams make better decisions, faster.
              </p>
              <div className="lp-footer-social">
                <a href="#" className="lp-social-btn" aria-label="Twitter">𝕏</a>
                <a href="#" className="lp-social-btn" aria-label="LinkedIn">in</a>
                <a href="#" className="lp-social-btn" aria-label="GitHub">⌥</a>
              </div>
            </div>
            {/* Product */}
            <div>
              <div className="lp-footer-col-title">Product</div>
              <ul className="lp-footer-links">
                <li><Link to="/register">Survey Builder</Link></li>
                <li><a href="#features">Analytics</a></li>
                <li><a href="#features">Templates</a></li>
                <li><a href="#pricing">Pricing</a></li>
              </ul>
            </div>
            {/* Resources */}
            <div>
              <div className="lp-footer-col-title">Resources</div>
              <ul className="lp-footer-links">
                <li><a href="#">Documentation</a></li>
                <li><a href="#">API Reference</a></li>
                <li><a href="#">Integrations</a></li>
                <li><a href="#">Status</a></li>
              </ul>
            </div>
            {/* Learn */}
            <div>
              <div className="lp-footer-col-title">Learn</div>
              <ul className="lp-footer-links">
                <li><a href="#">Blog</a></li>
                <li><a href="#">Survey Guides</a></li>
                <li><a href="#">Case Studies</a></li>
                <li><a href="#">Webinars</a></li>
              </ul>
            </div>
            {/* About */}
            <div>
              <div className="lp-footer-col-title">About</div>
              <ul className="lp-footer-links">
                <li><a href="#">Company</a></li>
                <li><a href="#">Careers</a></li>
                <li><a href="#">Press</a></li>
                <li><a href="mailto:hello@pooly.app">Contact</a></li>
              </ul>
            </div>
          </div>

          <div className="lp-footer-bottom">
            <p className="lp-footer-copy">© 2025 Pooly. All rights reserved.</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
              <div className="lp-footer-legal">
                <a href="#">Privacy Policy</a>
                <a href="#">Terms of Service</a>
                <a href="#">Cookie Settings</a>
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
