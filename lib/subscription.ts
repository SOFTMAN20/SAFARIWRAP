import { createClient } from './supabase/client';

export interface SubscriptionPlan {
  id: 'free' | 'pro' | 'enterprise';
  name: string;
  price: number;
  currency: string;
  interval: 'month';
  features: string[];
  limits: {
    events: number | null; // null = unlimited
    reviewsPerEvent: number | null;
    environmentalTracking: boolean;
    customBranding: boolean;
    apiAccess: boolean;
    multiUser: boolean;
    prioritySupport: boolean;
  };
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    currency: 'TZS',
    interval: 'month',
    features: [
      '2 events maximum',
      '10 reviews per event',
      'Basic wrap generation',
      'SafariWrap branding',
      'Community support',
    ],
    limits: {
      events: 2,
      reviewsPerEvent: 10,
      environmentalTracking: false,
      customBranding: false,
      apiAccess: false,
      multiUser: false,
      prioritySupport: false,
    },
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 75000,
    currency: 'TZS',
    interval: 'month',
    features: [
      'Unlimited events',
      'Unlimited reviews',
      'Advanced wrap customization',
      'Environmental impact tracking',
      'Remove SafariWrap branding',
      'Priority support',
    ],
    limits: {
      events: null,
      reviewsPerEvent: null,
      environmentalTracking: true,
      customBranding: true,
      apiAccess: false,
      multiUser: false,
      prioritySupport: true,
    },
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 250000,
    currency: 'TZS',
    interval: 'month',
    features: [
      'Everything in Pro',
      'Multi-user accounts',
      'API access',
      'Custom branding',
      'White-label option',
      'Dedicated support',
    ],
    limits: {
      events: null,
      reviewsPerEvent: null,
      environmentalTracking: true,
      customBranding: true,
      apiAccess: true,
      multiUser: true,
      prioritySupport: true,
    },
  },
];

export interface Subscription {
  id: string;
  operator_id: string;
  plan: 'free' | 'pro' | 'enterprise';
  status: 'active' | 'cancelled' | 'expired' | 'trialing';
  expires_at: string | null;
  snippesh_subscription_id: string | null;
  snippesh_customer_id: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Get subscription for an operator
 */
export async function getSubscription(operatorId: string): Promise<Subscription | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('operator_id', operatorId)
    .maybeSingle();
  
  if (error) {
    console.error('Failed to fetch subscription:', {
      error,
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
      operatorId
    });
    return null;
  }
  
  return data;
}

/**
 * Create a free subscription for new operators
 */
export async function createFreeSubscription(operatorId: string): Promise<Subscription | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('subscriptions')
    .insert({
      operator_id: operatorId,
      plan: 'free',
      status: 'active',
    })
    .select()
    .single();
  
  if (error) {
    console.error('Failed to create free subscription:', error);
    return null;
  }
  
  return data;
}

/**
 * Check if operator can create events
 */
export async function canCreateEvent(operatorId: string): Promise<{ allowed: boolean; reason?: string }> {
  const subscription = await getSubscription(operatorId);
  
  if (!subscription || subscription.status !== 'active') {
    return { allowed: false, reason: 'No active subscription' };
  }
  
  const plan = SUBSCRIPTION_PLANS.find(p => p.id === subscription.plan);
  if (!plan) {
    return { allowed: false, reason: 'Invalid subscription plan' };
  }
  
  // Unlimited events for pro/enterprise
  if (plan.limits.events === null) {
    return { allowed: true };
  }
  
  // Check event count for free plan
  const supabase = createClient();
  const { count, error } = await supabase
    .from('events')
    .select('*', { count: 'exact', head: true })
    .eq('operator_id', operatorId);
  
  if (error) {
    console.error('Failed to count events:', error);
    return { allowed: false, reason: 'Failed to check event limit' };
  }
  
  const eventCount = count || 0;
  const allowed = eventCount < plan.limits.events;
  
  return {
    allowed,
    reason: allowed ? undefined : `Event limit reached (${eventCount}/${plan.limits.events})`
  };
}

/**
 * Check if operator can generate wraps
 */
export async function canGenerateWrap(operatorId: string): Promise<{ allowed: boolean; reason?: string }> {
  const subscription = await getSubscription(operatorId);
  
  if (!subscription) {
    return { allowed: false, reason: 'No subscription found' };
  }
  
  if (subscription.status !== 'active') {
    return { allowed: false, reason: 'Subscription not active' };
  }
  
  return { allowed: true };
}

/**
 * Check if operator has environmental tracking
 */
export async function hasEnvironmentalTracking(operatorId: string): Promise<boolean> {
  const subscription = await getSubscription(operatorId);
  
  if (!subscription || subscription.status !== 'active') {
    return false;
  }
  
  const plan = SUBSCRIPTION_PLANS.find(p => p.id === subscription.plan);
  return plan?.limits.environmentalTracking || false;
}

/**
 * Check if operator can remove branding
 */
export async function hasCustomBranding(operatorId: string): Promise<boolean> {
  const subscription = await getSubscription(operatorId);
  
  if (!subscription || subscription.status !== 'active') {
    return false;
  }
  
  const plan = SUBSCRIPTION_PLANS.find(p => p.id === subscription.plan);
  return plan?.limits.customBranding || false;
}

/**
 * Get plan details
 */
export function getPlanDetails(planId: 'free' | 'pro' | 'enterprise'): SubscriptionPlan | null {
  return SUBSCRIPTION_PLANS.find(p => p.id === planId) || null;
}

/**
 * Check if subscription is expired
 */
export function isSubscriptionExpired(subscription: Subscription): boolean {
  if (!subscription.expires_at) {
    return false; // No expiration date means it doesn't expire
  }
  
  return new Date(subscription.expires_at) < new Date();
}

/**
 * Get subscription status with expiration check
 */
export function getSubscriptionStatus(subscription: Subscription): 'active' | 'expired' | 'cancelled' | 'trialing' {
  if (subscription.status === 'active' && isSubscriptionExpired(subscription)) {
    return 'expired';
  }
  
  return subscription.status;
}

/**
 * Format price for display
 */
export function formatPrice(price: number, currency: string = 'TZS'): string {
  if (price === 0) {
    return 'Free';
  }
  
  return new Intl.NumberFormat('sw-TZ', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}