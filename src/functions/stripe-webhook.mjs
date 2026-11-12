// ---------- Stripe events (src/functions/stripe-webhook.mjs) ----------
// Stripe → Developers → Webhooks sends invoice.paid, invoice.payment_failed, customer.subscription.updated and
// customer.subscription.deleted here. Member emails: welcome, order received, cancellation confirmed or undone,
// membership ended. Team alerts: new member, failed card, past due, cancellations ("refund due" inside 30 days).
export default async (req) => JachiBilling.webhook(req);

export const config = {
  path: '/api/stripe/webhook',
};
