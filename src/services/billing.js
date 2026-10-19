import api from './api';

export const billingApi = {
    async load(signal) {
        const [plans, subscription] = await Promise.all([
            api.get('/billing/plans', { signal }),
            api.get('/billing/subscription', { signal }),
        ]);
        return { plans: plans.data.plans, ...subscription.data };
    },
    async checkout(planId) {
        return (await api.post('/billing/checkout', { plan_id: planId })).data;
    },
    async completeMock(checkoutId, outcome) {
        return (await api.post(`/billing/mock/checkouts/${checkoutId}/complete`, { outcome })).data;
    },
    async portal() {
        return (await api.post('/billing/portal')).data;
    },
    async cancelMock() {
        return (await api.post('/billing/mock/subscription/cancel')).data;
    },
};
