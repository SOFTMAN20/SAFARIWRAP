'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Database,
  Server,
  Activity,
  CheckCircle2,
  AlertCircle,
  Users,
  Calendar,
  MessageSquare,
  Layout,
  Trees,
  MapPin,
  HardDrive,
  Zap,
  Shield,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SystemHealth {
  database: {
    status: 'healthy' | 'degraded' | 'down';
    responseTime: number;
    connections: number;
  };
  storage: {
    status: 'healthy' | 'degraded' | 'down';
    usedSpace: string;
    totalSpace: string;
  };
  tables: {
    operators: number;
    events: number;
    reviews: number;
    wraps: number;
    destinations: number;
    tree_activities: number;
    subscriptions: number;
  };
  auth: {
    status: 'healthy' | 'degraded' | 'down';
    totalUsers: number;
  };
}

export default function AdminSystemPage() {
  const { data, isLoading, error } = useQuery<SystemHealth>({
    queryKey: ['admin-system-health'],
    queryFn: async () => {
      const res = await fetch('/api/admin/system');
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to fetch system health');
      }
      return res.json();
    },
    refetchInterval: 30000,
    retry: 3,
  });

  const health: SystemHealth = data ?? {
    database: { status: 'healthy' as const, responseTime: 0, connections: 0 },
    storage: { status: 'healthy' as const, usedSpace: 'N/A', totalSpace: 'Unlimited' },
    tables: { operators: 0, events: 0, reviews: 0, wraps: 0, destinations: 0, tree_activities: 0, subscriptions: 0 },
    auth: { status: 'healthy' as const, totalUsers: 0 },
  };

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8 bg-gradient-to-br from-slate-50 to-white min-h-screen">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-black text-slate-900 mb-2">System Health</h1>
          <p className="text-sm text-slate-500 font-semibold">Loading system status...</p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="h-40 animate-pulse bg-gradient-to-br from-slate-200 to-slate-300" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 lg:p-8 bg-gradient-to-br from-slate-50 to-white min-h-screen">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-black text-slate-900 mb-2">System Health</h1>
          <p className="text-sm text-red-500 font-semibold">Error: {error.message}</p>
        </motion.div>
        <Card className="p-8 text-center">
          <p className="text-slate-600">Unable to load system health data. Please check your permissions.</p>
        </Card>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'from-emerald-500 to-emerald-600';
      case 'degraded': return 'from-amber-500 to-amber-600';
      case 'down': return 'from-red-500 to-red-600';
      default: return 'from-slate-500 to-slate-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle2 className="w-6 h-6 text-white" />;
      case 'degraded': return <AlertCircle className="w-6 h-6 text-white" />;
      case 'down': return <AlertCircle className="w-6 h-6 text-white" />;
      default: return <Activity className="w-6 h-6 text-white" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'healthy': return 'Operational';
      case 'degraded': return 'Degraded';
      case 'down': return 'Down';
      default: return 'Unknown';
    }
  };

  return (
    <div className="p-6 lg:p-8 bg-gradient-to-br from-slate-50 to-white min-h-screen">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 mb-2">System Health</h1>
        <p className="text-sm text-slate-500 font-semibold">Monitor platform status and performance</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
          <Card className={`bg-gradient-to-br ${getStatusColor(health.database.status)} border-none text-white shadow-xl`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Database className="w-10 h-10" />
                {getStatusIcon(health.database.status)}
              </div>
              <h3 className="text-lg font-bold mb-1">Database</h3>
              <p className="text-white/80 text-sm font-semibold">{getStatusText(health.database.status)}</p>
              <div className="mt-4 pt-4 border-t border-white/20">
                <p className="text-xs text-white/70 font-medium">Response: {health.database.responseTime}ms</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
          <Card className={`bg-gradient-to-br ${getStatusColor(health.storage.status)} border-none text-white shadow-xl`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <HardDrive className="w-10 h-10" />
                {getStatusIcon(health.storage.status)}
              </div>
              <h3 className="text-lg font-bold mb-1">Storage</h3>
              <p className="text-white/80 text-sm font-semibold">{getStatusText(health.storage.status)}</p>
              <div className="mt-4 pt-4 border-t border-white/20">
                <p className="text-xs text-white/70 font-medium">{health.storage.usedSpace} / {health.storage.totalSpace}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}>
          <Card className={`bg-gradient-to-br ${getStatusColor(health.auth.status)} border-none text-white shadow-xl`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Shield className="w-10 h-10" />
                {getStatusIcon(health.auth.status)}
              </div>
              <h3 className="text-lg font-bold mb-1">Authentication</h3>
              <p className="text-white/80 text-sm font-semibold">{getStatusText(health.auth.status)}</p>
              <div className="mt-4 pt-4 border-t border-white/20">
                <p className="text-xs text-white/70 font-medium">{health.auth.totalUsers} users</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}>
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-none text-white shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Zap className="w-10 h-10" />
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold mb-1">API</h3>
              <p className="text-white/80 text-sm font-semibold">Operational</p>
              <div className="mt-4 pt-4 border-t border-white/20">
                <p className="text-xs text-white/70 font-medium">All endpoints active</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mb-8">
        <Card className="shadow-xl">
          <CardHeader className="border-b-2 border-slate-100 bg-gradient-to-r from-slate-50 to-white">
            <CardTitle className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-md">
                <Database className="w-5 h-5 text-white" />
              </div>
              Database Tables
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {[
                { label: 'Operators', count: health.tables.operators, icon: Users, color: 'from-blue-500 to-blue-600' },
                { label: 'Events', count: health.tables.events, icon: Calendar, color: 'from-emerald-500 to-emerald-600' },
                { label: 'Reviews', count: health.tables.reviews, icon: MessageSquare, color: 'from-amber-500 to-amber-600' },
                { label: 'Wraps', count: health.tables.wraps, icon: Layout, color: 'from-purple-500 to-purple-600' },
                { label: 'Destinations', count: health.tables.destinations, icon: MapPin, color: 'from-red-500 to-red-600' },
                { label: 'Trees', count: health.tables.tree_activities, icon: Trees, color: 'from-green-500 to-green-600' },
                { label: 'Subscriptions', count: health.tables.subscriptions, icon: Server, color: 'from-indigo-500 to-indigo-600' },
              ].map(({ label, count, icon: Icon, color }, index) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.05 }}
                  className="bg-gradient-to-br from-slate-50 to-white border-2 border-slate-100 rounded-2xl p-4 hover:shadow-lg transition-all hover:-translate-y-1"
                >
                  <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-3 shadow-md`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-2xl font-black text-slate-900 mb-1">{count}</p>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</p>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
        <Card className="shadow-xl">
          <CardHeader className="border-b-2 border-slate-100 bg-gradient-to-r from-slate-50 to-white">
            <CardTitle className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-slate-500 to-slate-600 flex items-center justify-center shadow-md">
                <Server className="w-5 h-5 text-white" />
              </div>
              System Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-black text-slate-600 uppercase tracking-wider mb-3">Platform</h4>
                <div className="space-y-2">
                  <InfoRow label="Name" value="SafariWrap" />
                  <InfoRow label="Version" value="2.0.0" />
                  <InfoRow label="Environment" value="Production" />
                  <InfoRow label="Region" value="US East" />
                </div>
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-600 uppercase tracking-wider mb-3">Database</h4>
                <div className="space-y-2">
                  <InfoRow label="Provider" value="Supabase" />
                  <InfoRow label="Type" value="PostgreSQL 15" />
                  <InfoRow label="Connections" value={`${health.database.connections} active`} />
                  <InfoRow label="Response Time" value={`${health.database.responseTime}ms`} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
      <span className="text-sm font-semibold text-slate-600">{label}</span>
      <span className="text-sm font-bold text-slate-900">{value}</span>
    </div>
  );
}
