/**
 * Snippe.sh Payment API Integration
 * 
 * Documentation: https://documenter.getpostman.com/view/36488510/2sBXViiWAV
 * API Base URL: https://api.snippe.sh
 * 
 * Authentication: Bearer token in Authorization header
 * Payment Types: mobile (USSD), card (redirect), dynamic-qr (QR code)
 */

const SNIPPESH_API_URL = process.env.SNIPPESH_API_URL || 'https://api.snippe.sh';
const SNIPPESH_API_KEY = process.env.SNIPPESH_API_KEY;

interface SnippeshPaymentRequest {
  amount: number; // Amount in smallest currency unit (e.g., cents)
  currency: string; // e.g., "TZS", "USD"
  payment_type: 'mobile' | 'card' | 'dynamic-qr';
  customer_email: string;
  customer_name: string;
  customer_phone?: string; // Required for mobile payments
  description: string;
  reference?: string; // Your internal reference
  metadata?: Record<string, any>;
  callback_url?: string; // Browser redirect after payment (for card/QR)
  webhook_url?: string; // Server-to-server notification
}

interface SnippeshPaymentResponse {
  status: 'success' | 'error';
  data?: {
    payment_id: string;
    status: 'pending' | 'completed' | 'failed';
    payment_url?: string; // For card payments
    qr_code?: string; // For QR payments
    ussd_code?: string; // For mobile payments
    amount: number;
    currency: string;
    created_at: string;
  };
  code?: number;
  error_code?: string;
  message?: string;
}

interface SnippeshWebhookEvent {
  event: 'payment.completed' | 'payment.failed' | 'payment.pending';
  payment_id: string;
  reference?: string;
  amount: number;
  currency: string;
  payment_type: string;
  customer_email: string;
  customer_name: string;
  metadata?: Record<string, any>;
  status: 'completed' | 'failed' | 'pending';
  completed_at?: string;
  created_at: string;
}

/**
 * Create a payment request
 */
export async function createPayment(request: SnippeshPaymentRequest): Promise<SnippeshPaymentResponse> {
  if (!SNIPPESH_API_KEY) {
    throw new Error('SNIPPESH_API_KEY is not configured');
  }

  // Generate idempotency key to prevent duplicate transactions
  const idempotencyKey = `${request.customer_email}-${request.reference || Date.now()}`;

  const response = await fetch(`${SNIPPESH_API_URL}/v1/payments`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SNIPPESH_API_KEY}`,
      'Content-Type': 'application/json',
      'Idempotency-Key': idempotencyKey,
    },
    body: JSON.stringify(request),
  });

  const data = await response.json();

  if (!response.ok || data.status === 'error') {
    throw new Error(data.message || 'Payment creation failed');
  }

  return data;
}

/**
 * Create a subscription checkout session
 * Uses card payment type for redirect-based checkout
 */
export async function createSubscriptionCheckout(params: {
  plan: 'pro' | 'enterprise';
  operatorId: string;
  operatorEmail: string;
  operatorName: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<{ checkoutUrl: string; paymentId: string }> {
  const planPrices = {
    pro: 75000,
    enterprise: 250000,
  };

  const amount = planPrices[params.plan];
  const reference = `sub_${params.operatorId}_${Date.now()}`;

  const payment = await createPayment({
    amount: amount * 100, // Convert to smallest unit
    currency: 'TZS',
    payment_type: 'card', // Card payment returns payment_url for redirect
    customer_email: params.operatorEmail,
    customer_name: params.operatorName,
    description: `SafariWrap ${params.plan.charAt(0).toUpperCase() + params.plan.slice(1)} Plan - Monthly Subscription`,
    reference,
    metadata: {
      operator_id: params.operatorId,
      plan: params.plan,
      subscription_type: 'monthly',
      product: 'safariwrap_subscription',
    },
    callback_url: params.successUrl, // Browser redirect after payment
    webhook_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/snippesh`, // Server notification
  });

  if (!payment.data?.payment_url) {
    throw new Error('No payment URL returned from Snippe.sh');
  }

  return {
    checkoutUrl: payment.data.payment_url,
    paymentId: payment.data.payment_id,
  };
}

/**
 * Verify webhook signature
 * 
 * Snippe.sh sends webhooks with signature verification
 * Check documentation for exact signature header name and verification method
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  if (!signature || !secret) {
    return false;
  }

  // TODO: Implement actual Snippe.sh signature verification
  // This will depend on their specific signing method (HMAC-SHA256, etc.)
  // Check the webhook documentation for the exact implementation
  
  // Placeholder implementation - update with actual method
  const crypto = require('crypto');
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return signature === expectedSignature;
}

/**
 * Parse webhook event
 */
export function parseWebhookEvent(payload: string): SnippeshWebhookEvent {
  try {
    return JSON.parse(payload);
  } catch (error) {
    throw new Error('Invalid webhook payload');
  }
}

/**
 * Get payment status
 */
export async function getPaymentStatus(paymentId: string): Promise<SnippeshPaymentResponse> {
  if (!SNIPPESH_API_KEY) {
    throw new Error('SNIPPESH_API_KEY is not configured');
  }

  const response = await fetch(`${SNIPPESH_API_URL}/v1/payments/${paymentId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${SNIPPESH_API_KEY}`,
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();

  if (!response.ok || data.status === 'error') {
    throw new Error(data.message || 'Failed to get payment status');
  }

  return data;
}

/**
 * Create customer portal URL
 * 
 * Note: Snippe.sh may not have a built-in customer portal
 * This would need to be built in your application
 */
export async function createCustomerPortalUrl(customerId: string, returnUrl: string): Promise<string> {
  // Snippe.sh doesn't appear to have a customer portal feature
  // Return to subscription management page in your app instead
  return `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/subscription?return_url=${encodeURIComponent(returnUrl)}`;
}

/**
 * Cancel subscription
 * 
 * Note: Snippe.sh handles one-time payments
 * Subscription management is handled in your application
 */
export async function cancelSubscription(subscriptionId: string): Promise<void> {
  // Snippe.sh doesn't have built-in subscription management
  // Handle subscription cancellation in your database
  // Just mark the subscription as cancelled in your subscriptions table
  console.log(`Subscription ${subscriptionId} marked for cancellation`);
}

export type { SnippeshPaymentRequest, SnippeshPaymentResponse, SnippeshWebhookEvent };
