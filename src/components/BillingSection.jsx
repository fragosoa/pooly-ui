import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { billingApi } from '../services/billing';
import '../styles/billing.css';

const ERROR_KEYS = {
    billing_disabled: 'disabled',
    checkout_already_open: 'checkoutOpen',
    subscription_already_exists: 'alreadySubscribed',
    checkout_not_open: 'expired',
    checkout_not_found: 'expired',
    billing_email_required: 'emailRequired',
    payment_provider_unavailable: 'provider',
    stripe_price_mismatch: 'unavailable',
};

function redirectToStripe(url) {
    const destination = new URL(url);
    if (destination.protocol !== 'https:' || !['checkout.stripe.com', 'billing.stripe.com'].includes(destination.hostname)) {
        throw new Error('Invalid payment destination');
    }
    window.location.assign(destination.href);
}

export default function BillingSection() {
    const { t, locale } = useLanguage();
    const [searchParams, setSearchParams] = useSearchParams();
    const returnStatus = searchParams.get('billing');
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [busy, setBusy] = useState(false);
    const [notice, setNotice] = useState(null);
    const [confirmCancel, setConfirmCancel] = useState(false);
    const inFlight = useRef(false);

    const load = useCallback(async (signal) => {
        const result = await billingApi.load(signal);
        if (!signal?.aborted) {
            setData(result);
            setError(null);
        }
        return result;
    }, []);

    useEffect(() => {
        const controller = new AbortController();
        let timer;
        let attempts = 0;
        async function refresh() {
            try {
                const result = await load(controller.signal);
                if (returnStatus === 'success' && result.mode === 'stripe' && result.subscription?.status !== 'active' && attempts++ < 5) {
                    timer = window.setTimeout(refresh, 2000);
                }
            } catch (err) {
                if (!controller.signal.aborted && err.code !== 'ERR_CANCELED') setError('load');
            }
        }
        refresh();
        return () => {
            controller.abort();
            window.clearTimeout(timer);
        };
    }, [load, returnStatus]);

    const run = async (action) => {
        if (inFlight.current) return;
        inFlight.current = true;
        setBusy(true);
        setError(null);
        setNotice(null);
        try {
            await action();
        } catch (err) {
            setError(ERROR_KEYS[err.response?.data?.error] || 'generic');
        } finally {
            setBusy(false);
            inFlight.current = false;
        }
    };

    const choosePlan = (planId) => run(async () => {
        const checkout = await billingApi.checkout(planId);
        if (checkout.simulated) {
            await load();
        } else {
            redirectToStripe(checkout.url);
        }
    });

    const completeMock = (outcome) => run(async () => {
        const result = await billingApi.completeMock(data.pending_checkout.checkout_id, outcome);
        await load();
        setNotice(result.status);
    });

    const manageSubscription = () => run(async () => {
        const portal = await billingApi.portal();
        if (portal.simulated) setConfirmCancel(true);
        else redirectToStripe(portal.url);
    });

    const cancelSubscription = () => run(async () => {
        await billingApi.cancelMock();
        await load();
        setConfirmCancel(false);
        setNotice('cancelScheduled');
    });

    const dismissReturn = () => {
        const next = new URLSearchParams(searchParams);
        next.delete('billing');
        setSearchParams(next, { replace: true });
    };

    const formatDate = (timestamp) => new Date(timestamp * 1000).toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' });
    const subscription = data?.subscription;
    const mock = data?.mode === 'mock';
    const pending = data?.pending_checkout;
    const pendingPlan = data?.plans.find(plan => plan.id === pending?.plan_id);
    const currentPlan = data?.plans.find(plan => plan.id === subscription?.plan_id);
    const expiredMock = mock && subscription && subscription.period_end <= Date.now() / 1000;
    const hasSubscription = subscription && !['canceled', 'incomplete_expired'].includes(subscription.status) && !expiredMock;
    const price = (plan) => `${new Intl.NumberFormat(locale, { style: 'currency', currency: plan.currency.toUpperCase(), currencyDisplay: 'narrowSymbol', maximumFractionDigits: 0 }).format(plan.amount / 100)} USD`;
    const statusKey = expiredMock ? 'expired' : subscription?.status;

    return (
        <section className="card billing-section" aria-labelledby="billing-heading" aria-busy={busy}>
            <div className="billing-header">
                <div>
                    <h2 id="billing-heading">{t('billing.title')}</h2>
                    <p>{t('billing.subtitle')}</p>
                </div>
                {mock && <span className="billing-badge">{t('billing.mockBadge')}</span>}
            </div>

            {error && <div className="billing-message billing-message-error" role="alert">
                <p>{t(`billing.error.${error}`)}</p>
                <button className="btn btn-secondary" disabled={busy} onClick={() => run(() => load())}>{t('billing.refresh')}</button>
            </div>}
            {!data && !error && <p role="status">{t('billing.loading')}</p>}
            {data?.mode === 'disabled' && <p>{t('billing.disabled')}</p>}

            {data && data.mode !== 'disabled' && <>
                {mock && <div className="billing-message billing-message-mock">
                    <strong>{t('billing.mockTitle')}</strong>
                    <p>{t('billing.mockDescription')}</p>
                </div>}
                {returnStatus && <div className="billing-message" role="status">
                    <p>{t(returnStatus === 'success'
                        ? (subscription?.status === 'active' ? 'billing.returnConfirmed' : 'billing.returnPending')
                        : 'billing.returnCancelled')}</p>
                    <div className="billing-actions">
                        <button className="btn btn-secondary" disabled={busy} onClick={() => run(() => load())}>{t('billing.refresh')}</button>
                        <button className="btn btn-secondary" onClick={dismissReturn}>{t('billing.dismiss')}</button>
                    </div>
                </div>}
                {notice && <p className={`billing-message ${notice === 'declined' ? 'billing-message-error' : ''}`} role="status">{t(`billing.notice.${notice}`)}</p>}

                {data.temporary_access && <p className="billing-access">
                    {data.temporary_access_expires_at
                        ? t('billing.temporaryUntil', { date: formatDate(data.temporary_access_expires_at) })
                        : t('billing.temporaryAccess')}
                </p>}

                {subscription ? <div className="billing-current">
                    <div className="billing-summary">
                        <div><span>{t('billing.currentPlan')}</span><h3>{currentPlan?.name || subscription.plan_id}</h3></div>
                        <span className="billing-status">{t(`billing.status.${statusKey}`)}</span>
                    </div>
                    {hasSubscription && <p>{t(subscription.cancel_at_period_end ? 'billing.endsOn' : 'billing.periodEnds', { date: formatDate(subscription.period_end) })}</p>}
                    {hasSubscription && (!mock || !subscription.cancel_at_period_end) && <button className="btn btn-secondary" disabled={busy} onClick={manageSubscription}>{t('billing.manage')}</button>}
                    {confirmCancel && <div className="billing-confirm">
                        <p>{t('billing.cancelConfirmation', { date: formatDate(subscription.period_end) })}</p>
                        <div className="billing-actions">
                            <button className="btn btn-secondary" disabled={busy} onClick={() => setConfirmCancel(false)}>{t('billing.keepSubscription')}</button>
                            <button className="btn btn-primary" disabled={busy} onClick={cancelSubscription}>{t('billing.confirmCancellation')}</button>
                        </div>
                    </div>}
                </div> : <p className="billing-empty">{t('billing.noSubscription')}</p>}

                {mock && pending && <div className="billing-mock-checkout" aria-labelledby="mock-checkout-heading">
                    <h3 id="mock-checkout-heading">{t('billing.checkoutTitle', { plan: pendingPlan?.name || pending.plan_id })}</h3>
                    {pendingPlan && <p className="billing-price">{price(pendingPlan)} <small>{t('billing.perMonth')}</small></p>}
                    <p>{t('billing.checkoutDescription')}</p>
                    <div className="billing-actions">
                        <button className="btn btn-primary" disabled={busy} onClick={() => completeMock('paid')}>{t('billing.approve')}</button>
                        <button className="btn btn-secondary" disabled={busy} onClick={() => completeMock('declined')}>{t('billing.decline')}</button>
                        <button className="btn btn-secondary" disabled={busy} onClick={() => completeMock('cancelled')}>{t('billing.abandon')}</button>
                    </div>
                </div>}

                {!hasSubscription && <div className="billing-plans">
                    {data.plans.map(plan => <article key={plan.id} className="billing-plan">
                        <h3>{plan.name}</h3>
                        <p className="billing-price">{price(plan)} <small>{t('billing.perMonth')}</small></p>
                        <ul>
                            <li>{plan.analyses === null ? t('billing.unlimitedAnalyses') : t('billing.analyses', { count: plan.analyses })}</li>
                            <li>{plan.responses_per_analysis === null ? t('billing.unlimitedResponses') : t('billing.responses', { count: plan.responses_per_analysis.toLocaleString(locale) })}</li>
                        </ul>
                        <button className="btn btn-primary" disabled={busy || (mock && Boolean(pending))} onClick={() => choosePlan(plan.id)}>
                            {t(!mock && pending?.plan_id === plan.id ? 'billing.resume' : mock ? 'billing.testPlan' : 'billing.subscribe', { plan: plan.name })}
                        </button>
                    </article>)}
                </div>}
                {busy && <p role="status">{t('billing.processing')}</p>}
                <p className="billing-footnote">{t('billing.monthlyNote')}</p>
            </>}
        </section>
    );
}
