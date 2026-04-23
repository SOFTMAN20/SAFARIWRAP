'use client';

import { Crown, Star, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { type Subscription } from '@/lib/subscription';

interface SubscriptionBadgeProps {
  subscription: Subscription | null;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export default function SubscriptionBadge({ 
  subscription, 
  size = 'md',
  showIcon = true 
}: SubscriptionBadgeProps) {
  if (!subscription) {
    return (
      <Badge variant="outline" className="text-stone">
        {showIcon && <Zap className="w-3 h-3 mr-1" />}
        No Plan
      </Badge>
    );
  }

  const planConfig = {
    free: {
      label: 'Free',
      icon: Zap,
      className: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    },
    pro: {
      label: 'Pro',
      icon: Star,
      className: 'bg-forest text-white hover:bg-forest-light',
    },
    enterprise: {
      label: 'Enterprise',
      icon: Crown,
      className: 'bg-purple-600 text-white hover:bg-purple-700',
    },
  };

  const config = planConfig[subscription.plan];
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2',
  };

  return (
    <Badge className={`${config.className} ${sizeClasses[size]}`}>
      {showIcon && <Icon className="w-3 h-3 mr-1" />}
      {config.label}
      {subscription.status !== 'active' && (
        <span className="ml-1 opacity-75">
          ({subscription.status})
        </span>
      )}
    </Badge>
  );
}