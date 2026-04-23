'use client';

import { motion } from 'framer-motion';
import { Crown, ArrowRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';

interface UpgradePromptProps {
  title: string;
  message: string;
  feature?: string;
  ctaText?: string;
  ctaUrl?: string;
  onClose?: () => void;
  variant?: 'banner' | 'modal' | 'inline';
}

export default function UpgradePrompt({
  title,
  message,
  feature,
  ctaText = 'Upgrade Now',
  ctaUrl = '/pricing',
  onClose,
  variant = 'inline',
}: UpgradePromptProps) {
  const content = (
    <div className="flex items-center gap-4">
      <div className="flex-shrink-0">
        <div className="w-12 h-12 bg-gradient-to-r from-forest to-forest-light rounded-full flex items-center justify-center">
          <Crown className="w-6 h-6 text-white" />
        </div>
      </div>
      
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-forest mb-1">{title}</h3>
        <p className="text-sm text-stone">{message}</p>
        {feature && (
          <p className="text-xs text-stone/70 mt-1">
            Available in Pro and Enterprise plans
          </p>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        <Link href={ctaUrl}>
          <Button size="sm" className="bg-forest hover:bg-forest-light text-white">
            {ctaText}
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
        
        {onClose && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-stone hover:text-forest"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );

  if (variant === 'banner') {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="bg-gradient-to-r from-accent/10 to-accent/5 border border-accent/20 rounded-lg p-4 mb-6"
      >
        {content}
      </motion.div>
    );
  }

  if (variant === 'modal') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      >
        <Card className="max-w-md w-full">
          <CardContent className="p-6">
            {content}
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
    >
      <Card className="border-accent/20 bg-gradient-to-r from-accent/5 to-transparent">
        <CardContent className="p-4">
          {content}
        </CardContent>
      </Card>
    </motion.div>
  );
}