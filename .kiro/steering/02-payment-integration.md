---
title: Payment Integration with Snippe.sh
inclusion: manual
---

# Payment Integration - Snippe.sh

## Overview
SafariWrap uses **Snippe.sh** as the payment provider for subscription management.

## Subscription Plans

### Free Plan
- **Price**: $0/month
- **Limits**:
  - 2 events maximum
  - 10 reviews per event
  - Basic wrap generation
  - No environmental impact tracking
  - SafariWrap branding on wraps

### Pro Plan
- **Price**: TZS 75,000/month
- **Features**:
  - Unlimited events
  - Unlimited reviews
  - Advanced wrap customization
  - Environmental impact tracking
  - Remove SafariWrap branding
  - Priority support

### Enterprise Plan
- **Price**: TZS 250,000/month
- **Features**:
  - Everything in Pro
  - Multi-user accounts
  - API access
  - Custom branding
  - Dedicated support
  - White-label option

## Implementation Flow

### 1. Signup Flow
```
User signs up → Create operator record → Redirect to /pricing → Select plan
```

### 2. Checkout Flow
```typescript
// When user selects a plan
const checkoutUrl = await createSnippeshCheckout({
  plan: 'pro',
  operatorId: user.id,
  successUrl: `${baseUrl}/dashboard?payment=success`,
  cancelUrl: `${baseUrl}/pricing?payment=cancelled`
});

// Redirect to Snippe.sh
window.location.href = checkoutUrl;
```

### 3. Webhook Handler
```typescript
// app/api/webhooks/snippesh/route.ts
export async function POST(request: Request) {
  const event = await request.json();
  
  switch (event.type) {
    case 'subscription.created':
      await activateSubscription(event.data);
      break;
    case 'subscription.cancelled':
      await deactivateSubscription(event.data);
      break;
    case 'payment.succeeded':
      await recordPayment(event.data);
      break;
  }
  
  return Response.json({ received: true });
}
```

### 4. Feature Gating
```typescript
// lib/subscription.ts
export function canCreateEvent(operator: Operator) {
  if (operator.subscription?.plan === 'free') {
    const eventCount = await getEventCount(operator.id);
    return eventCount < 2;
  }
  return true;
}

export function canGenerateWrap(operator: Operator) {
  return operator.subscription?.status === 'active';
}

export function hasEnvironmentalTracking(operator: Operator) {
  return ['pro', 'enterprise'].includes(operator.subscription?.plan);
}
```

## Database Schema

### subscriptions table
```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  operator_id UUID NOT NULL REFERENCES operators(id) ON DELETE CASCADE,
  plan TEXT NOT NULL CHECK (plan IN ('free', 'pro', 'enterprise')),
  status TEXT NOT NULL CHECK (status IN ('active', 'cancelled', 'expired', 'trialing')),
  expires_at TIMESTAMPTZ,
  snippesh_subscription_id TEXT UNIQUE,
  snippesh_customer_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_operator_id ON subscriptions(operator_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
```

### payments table
```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  operator_id UUID NOT NULL REFERENCES operators(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id),
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'TZS',
  status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  provider TEXT NOT NULL DEFAULT 'snippesh',
  transaction_id TEXT UNIQUE,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payments_operator_id ON payments(operator_id);
CREATE INDEX idx_payments_status ON payments(status);
```

## Environment Variables

Add to `.env.local`:
```env
# Snippe.sh Configuration
SNIPPESH_API_KEY=your_api_key_here
SNIPPESH_WEBHOOK_SECRET=your_webhook_secret_here
NEXT_PUBLIC_SNIPPESH_PUBLISHABLE_KEY=your_publishable_key_here
```

## API Routes to Create

### `/api/subscriptions/create-checkout`
Creates a Snippe.sh checkout session.

### `/api/subscriptions/portal`
Redirects to Snippe.sh customer portal for managing subscription.

### `/api/webhooks/snippesh`
Handles Snippe.sh webhook events.

### `/api/subscriptions/status`
Returns current subscription status for operator.

## UI Components

### Pricing Page (`/pricing`)
- Display all plans
- Highlight recommended plan
- Feature comparison table
- CTA buttons for each plan

### Subscription Badge (Dashboard)
```tsx
<div className="subscription-badge">
  {plan === 'free' && '🆓 Free Plan'}
  {plan === 'pro' && '⭐ Pro Plan'}
  {plan === 'enterprise' && '💎 Enterprise'}
</div>
```

### Upgrade Prompts
Show when user hits limits:
```tsx
{!canCreateEvent && (
  <UpgradePrompt
    title="Event Limit Reached"
    message="Upgrade to Pro for unlimited events"
    ctaUrl="/pricing"
  />
)}
```

## Testing

### Test Mode
Use Snippe.sh test mode during development:
```typescript
const isTestMode = process.env.NODE_ENV !== 'production';
```

### Test Cards
- Success: 4242 4242 4242 4242
- Decline: 4000 0000 0000 0002

## Security Considerations

1. **Verify webhook signatures** using Snippe.sh webhook secret
2. **Never trust client-side** subscription status
3. **Always check server-side** before granting access
4. **Log all payment events** for audit trail
5. **Handle failed payments** gracefully with retry logic
