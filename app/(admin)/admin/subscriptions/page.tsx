'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  CreditCard,
  TrendingUp,
  Users,
  DollarSign,
  Search,
  Filter,
  Crown,
  Zap,
  Gift,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface Subscription {
  id: string;
  operator_id: string;
  plan: 'free' | 'pro' | 'enterprise';
  status: 'active' | 'cancelled' | 'expired' | 'trialing';
  expires_at: string | null;
  created_at: string;
  operators: {
    id: string;
    business_name: string;
    profiles: {
      email: string;
    } | null;
  };
}

interface SubscriptionsData {
  subscriptions: Subscription[];
  stats: {
    total: number;
    active: number;
    free: number;
    pro: number;
    enterprise: number;
    cancelled: number;
    expired: number;
    trialing: number;
  };
  mrr: number;
  arr: number;
}

export default function AdminSubscriptionsPage() {
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data, isLoading } = useQuery<SubscriptionsData>({
    queryKey: ['admin-subscriptions'],
    queryFn: async () => {
      const res = await fetch('/api/admin/subscriptions');
      if (!res.ok) throw new Error('Failed to fetch subscriptions');
      return res.json();
    },
    staleTime: 1000 * 60,
  });

  const subscriptions = data?.subscriptions ?? [];
  const stats = data?.stats ?? { total: 0, active: 0, free: 0, pro: 0, enterprise: 0, cancelled: 0, expired: 0, trialing: 0 };
  const mrr = data?.mrr ?? 0;
  const arr = data?.arr ?? 0;

  const filtered = subscriptions.filter(sub => {
    const matchesSearch = !search ||
      sub.operators.business_name.toLowerCase().includes(search.toLowerCase()) ||
      (sub.operators.profiles?.email ?? '').toLowerCase().includes(search.toLowerCase());
    const matchesPlan = planFilter === 'all' || sub.plan === planFilter;
    const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;
    return matchesSearch && matchesPlan && matchesStatus;
  });

  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case 'free': return <Gift className="w-4 h-4" />;
      case 'pro': return <Zap className="w-4 h-4" />;
      case 'enterprise': return <Crown className="w-4 h-4" />;
      default: return <Gift className="w-4 h-4" />;
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'free': return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'pro': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'enterprise': return 'bg-purple-100 text-purple-700 border-purple-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle2 className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      case 'expired': return <AlertCircle className="w-4 h-4" />;
      case 'trialing': return <Clock className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
      case 'expired': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'trialing': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="p-6 lg:p-8 bg-gradient-to-br from-slate-50 to-white min-h-screen">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 mb-2">Subscriptions & Revenue</h1>
        <p className="text-sm text-slate-500 font-semibold">Track operator subscriptions and recurring revenue</p>
      </motion.div>

      {/* Revenue Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
          <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-emerald-600 mb-1">MRR</p>
                  <p className="text-3xl font-black text-emerald-700">TZS {mrr.toLocaleString('sw-TZ')}</p>
                  <p className="text-xs text-emerald-600 mt-1">Monthly Recurring</p>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-blue-600 mb-1">ARR</p>
                  <p className="text-3xl font-black text-blue-700">TZS {arr.toLocaleString('sw-TZ')}</p>
                  <p className="text-xs text-blue-600 mt-1">Annual Recurring</p>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}>
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-purple-600 mb-1">Active Subs</p>
                  <p className="text-3xl font-black text-purple-700">{stats.active}</p>
                  <p className="text-xs text-purple-600 mt-1">Paying Customers</p>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}>
          <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-amber-600 mb-1">Total Subs</p>
                  <p className="text-3xl font-black text-amber-700">{stats.total}</p>
                  <p className="text-xs text-amber-600 mt-1">All Subscriptions</p>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Plan Distribution */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mb-8">
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <h3 className="font-black text-slate-900 mb-4">Plan Distribution</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-2xl bg-slate-50 border-2 border-slate-100">
                <Gift className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-2xl font-black text-slate-900">{stats.free}</p>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Free</p>
              </div>
              <div className="text-center p-4 rounded-2xl bg-blue-50 border-2 border-blue-100">
                <Zap className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-black text-blue-700">{stats.pro}</p>
                <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">Pro (TZS 75,000/mo)</p>
              </div>
              <div className="text-center p-4 rounded-2xl bg-purple-50 border-2 border-purple-100">
                <Crown className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <p className="text-2xl font-black text-purple-700">{stats.enterprise}</p>
                <p className="text-xs font-bold text-purple-600 uppercase tracking-wider">Enterprise (TZS 250,000/mo)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by operator or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border-2 border-slate-200 rounded-2xl text-sm font-semibold placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all outline-none"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Filter className="w-5 h-5 text-slate-400 self-center" />
          <select
            value={planFilter}
            onChange={e => setPlanFilter(e.target.value)}
            className="px-4 py-2.5 bg-white border-2 border-slate-200 rounded-2xl text-sm font-bold text-slate-700 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none"
          >
            <option value="all">All Plans</option>
            <option value="free">Free</option>
            <option value="pro">Pro</option>
            <option value="enterprise">Enterprise</option>
          </select>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 bg-white border-2 border-slate-200 rounded-2xl text-sm font-bold text-slate-700 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="trialing">Trialing</option>
            <option value="cancelled">Cancelled</option>
            <option value="expired">Expired</option>
          </select>
        </div>
      </motion.div>

      {/* Subscriptions List */}
      {isLoading ? (
        <Card className="shadow-xl">
          <div className="p-6 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-20 bg-slate-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        </Card>
      ) : filtered.length === 0 ? (
        <Card className="shadow-xl">
          <div className="p-20 text-center">
            <CreditCard className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h4 className="font-black text-xl text-slate-900 mb-2">No Subscriptions Found</h4>
            <p className="text-slate-500 text-sm font-medium">
              {search ? `No results for "${search}"` : 'No subscriptions match the selected filters.'}
            </p>
          </div>
        </Card>
      ) : (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
          <Card className="shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                    <th className="text-left px-6 py-4 text-xs font-black text-slate-600 uppercase tracking-wider">Operator</th>
                    <th className="text-center px-4 py-4 text-xs font-black text-slate-600 uppercase tracking-wider">Plan</th>
                    <th className="text-center px-4 py-4 text-xs font-black text-slate-600 uppercase tracking-wider">Status</th>
                    <th className="text-left px-4 py-4 text-xs font-black text-slate-600 uppercase tracking-wider hidden lg:table-cell">Started</th>
                    <th className="text-left px-4 py-4 text-xs font-black text-slate-600 uppercase tracking-wider hidden lg:table-cell">Expires</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((sub, index) => (
                    <motion.tr
                      key={sub.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 * index }}
                      className="hover:bg-gradient-to-r hover:from-slate-50 hover:to-transparent transition-all"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-bold text-slate-900">{sub.operators.business_name}</p>
                          <p className="text-xs text-slate-500 font-medium">{sub.operators.profiles?.email ?? 'No email'}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <Badge className={`${getPlanColor(sub.plan)} border-2 font-black uppercase text-xs`}>
                          <span className="flex items-center gap-1.5">
                            {getPlanIcon(sub.plan)}
                            {sub.plan}
                          </span>
                        </Badge>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <Badge className={`${getStatusColor(sub.status)} border-2 font-black uppercase text-xs`}>
                          <span className="flex items-center gap-1.5">
                            {getStatusIcon(sub.status)}
                            {sub.status}
                          </span>
                        </Badge>
                      </td>
                      <td className="px-4 py-4 hidden lg:table-cell">
                        <span className="text-xs text-slate-500 font-semibold">{format(new Date(sub.created_at), 'MMM d, yyyy')}</span>
                      </td>
                      <td className="px-4 py-4 hidden lg:table-cell">
                        <span className="text-xs text-slate-500 font-semibold">
                          {sub.expires_at ? format(new Date(sub.expires_at), 'MMM d, yyyy') : 'Never'}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
