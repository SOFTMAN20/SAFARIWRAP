'use client';

import { ReactNode } from 'react';
import { type Subscription, SUBSCRIPTION_PLANS } from '@/lib/subscription';
import UpgradePrompt from './UpgradePrompt';

interface FeatureGateProps {
  subscription: Subscription | null;
  feature: 'events' | 'environmentalTracking' | 'customBranding' | 'apiAccess' | 'multiUser';
  children: ReactNode;
  fallback?: ReactNode;
  upgradePrompt?: {
    title: string;
    message: string;
  };
}

export default function FeatureGate({
  subscription,
  feature,
  children,
  fallback,
  upgradePrompt,
}: FeatureGateProps) {
  // Check if user has access to the feature
  const hasAccess = checkFeatureAccess(subscription, feature);

  if (hasAccess) {
    return <>{children}</>;
  }

  // Show custom fallback if provided
  if (fallback) {
    return <>{fallback}</>;
  }

  // Show upgrade prompt if configured
  if (upgradePrompt) {
    return (
      <UpgradePrompt
        title={upgradePrompt.title}
        message={upgradePrompt.message}
        feature={feature}
      />
    );
  }

  // Default: don't render anything
  return null;
}

function checkFeatureAccess(
  subscription: Subscription | null,
  feature: string
): boolean {
  if (!subscription || subscription.status !== 'active') {
    return false;
  }

  const plan = SUBSCRIPTION_PLANS.find(p => p.id === subscription.plan);
  if (!plan) {
    return false;
  }

  switch (feature) {
    case 'events':
      return plan.limits.events === null; // null means unlimited
    case 'environmentalTracking':
      return plan.limits.environmentalTracking;
    case 'customBranding':
      return plan.limits.customBranding;
    case 'apiAccess':
      return plan.limits.apiAccess;
    case 'multiUser':
      return plan.limits.multiUser;
    default:
      return false;
  }
}