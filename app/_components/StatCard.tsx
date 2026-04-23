'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  value: string | number;
  label: string;
  delay?: number;
  trend?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ 
  icon: Icon, 
  value, 
  label, 
  delay = 0,
  trend
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Card className="hover:shadow-lg transition-shadow">
        <CardContent className="flex items-center space-x-4 p-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-forest/10">
            <Icon className="h-6 w-6 text-forest" />
          </div>
          <div className="flex-1">
            <p className="text-3xl font-extrabold text-forest">{value}</p>
            <p className="text-xs font-bold text-stone uppercase tracking-wider">{label}</p>
            {trend && (
              <p className="text-xs font-bold text-savanna mt-1 flex items-center gap-1">
                {trend}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
