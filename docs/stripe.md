# Stripe setup

## Webhook endpoint
- `https://horizonsvc.com/api/auth/callback/stripe`

## Required events
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`

## Optional events
- `checkout.session.completed`

## Environment variables
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_ID_PRO`
- `STRIPE_SUCCESS_URL`
- `STRIPE_CANCEL_URL`
- `STRIPE_PORTAL_RETURN_URL`
