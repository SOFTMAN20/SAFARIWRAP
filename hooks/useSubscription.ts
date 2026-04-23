'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getSubscription, 
  canCreateEvent, 
  canGenerateWrap,
  hasEnvironmentalTracking,
  hasCustomBranding,
  type Subscription 
} from '@/lib/subscription';

export function useSubscription() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [permissions, setPermissions] = useState({
    canCreateEvent: { allowed: false, reason: '' },
    canGenerateWrap: { allowed: false, reason: '' },
    hasEnvironmentalTracking: false,
    hasCustomBranding: false,
  });

  useEffect(() => {
    if (user?.id) {
      fetchSubscriptionData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchSubscriptionData = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      
      // Fetch subscription
      const sub = await getSubscription(user.id);
      setSubscription(sub);

      // Check permissions
      const [
        createEventCheck,
        generateWrapCheck,
        envTracking,
        customBrand,
      ] = await Promise.all([
        canCreateEvent(user.id),
        canGenerateWrap(user.id),
        hasEnvironmentalTracking(user.id),
        hasCustomBranding(user.id),
      ]);

      setPermissions({
        canCreateEvent: createEventCheck,
        canGenerateWrap: generateWrapCheck,
        hasEnvironmentalTracking: envTracking,
        hasCustomBranding: customBrand,
      });

    } catch (error) {
      console.error('Failed to fetch subscription data:', error);
    } finally {
      setLoading(false);
    }
  };

  const refresh = () => {
    if (user?.id) {
      fetchSubscriptionData();
    }
  };

  return {
    subscription,
    permissions,
    loading,
    refresh,
    isActive: subscription?.status === 'active',
    isPro: subscription?.plan === 'pro',
    isEnterprise: subscription?.plan === 'enterprise',
    isFree: subscription?.plan === 'free' || !subscription,
  };
}