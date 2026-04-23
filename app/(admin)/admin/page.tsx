'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Users, Map, MessageSquare, Layout, TrendingUp, Star, ArrowRight, UserCog, Shield, MapPin, Settings as SettingsIcon, Sparkles, Activity } from 'lucide-react';
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';

interface AdminStats {
  operators: number;
  trips: number;
  reviews: number;
  wraps: number;
  recentOperators: { id: string; name: string; business_name: string; email: string; created_at: string }[];
  recentReviews: {
    id: string;
    guest_name: string;
    star_rating: number;
    created_at: string;
    trips: { trip_name: string; operators: { business_name: string } } | { trip_name: string; operators: { business_name: string } }[] | null;
  }[];
}

export default function AdminOverviewPage() {
  const { data, isLoading } = useQuery<AdminStats>({
    queryKey: ['admin-stats'],
    queryFn: () => fetch('/api/admin/stats').then(r => r.json()),
    staleTime: 1000 * 60,
  });

  if (isLoading) return <PageShell loading />;

  const stats = data ?? { operators: 0, trips: 0, reviews: 0, wraps: 0, recentOperators: [], recentReviews: [] };

  const cards = [
    { 
      label: 'Total Operators', 
      value: stats.operators, 
      icon: Users, 
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-50 to-blue-100',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-600',
      href: '/admin/operators' 
    },
    { 
      label: 'Total Trips', 
      value: stats.trips, 
      icon: Map, 
      gradient: 'from-emerald-500 to-emerald-600',
      bgGradient: 'from-emerald-50 to-emerald-100',
      borderColor: 'border-emerald-200',
      textColor: 'text-emerald-600',
      href: '/admin/trips' 
    },
    { 
      label: 'Guest Reviews', 
      value: stats.reviews, 
      icon: MessageSquare, 
      gradient: 'from-amber-500 to-amber-600',
      bgGradient: 'from-amber-50 to-amber-100',
      borderColor: 'border-amber-200',
      textColor: 'text-amber-600',
      href: '/admin/reviews' 
    },
    { 
      label: 'SafariWraps', 
      value: stats.wraps, 
      icon: Layout, 
      gradient: 'from-purple-500 to-purple-600',
      bgGradient: 'from-purple-50 to-purple-100',
      borderColor: 'border-purple-200',
      textColor: 'text-purple-600',
      href: '/admin/operators' 
    },
  ];

  return (
    <PageShell>
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden bg-gradient-to-br from-forest via-forest/90 to-[#0F3A2E] rounded-3xl p-8 mb-8 shadow-xl"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-savanna" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white">Admin Dashboard</h1>
              <p className="text-white/80 text-sm font-semibold">Welcome back! Here's your platform overview</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map(({ label, value, icon: Icon, gradient, bgGradient, borderColor, textColor, href }, index) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
          >
            <a href={href} className="block group">
              <Card className={`bg-gradient-to-br ${bgGradient} ${borderColor} border-2 hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <TrendingUp className={`w-5 h-5 ${textColor} opacity-60`} />
                  </div>
                  <p className={`text-4xl font-black ${textColor} mb-2`}>{value}</p>
                  <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">{label}</p>
                  <div className={`flex items-center gap-1 mt-3 text-xs font-bold ${textColor} group-hover:gap-2 transition-all`}>
                    <span>View all</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </CardContent>
              </Card>
            </a>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Recent Operators */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-black text-slate-900">Recent Operators</h3>
              </div>
              <a href="/admin/operators" className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 group">
                <span>View all</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
            {(stats.recentOperators?.length ?? 0) === 0 ? (
              <div className="py-16 text-center">
                <div className="h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-slate-400 text-sm font-bold">No operators yet</p>
                <p className="text-slate-300 text-xs mt-1">New operators will appear here</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {(stats.recentOperators ?? []).map((op, index) => (
                  <motion.a
                    key={op.id}
                    href={`/admin/operators/${op.id}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.05 }}
                    className="flex items-center gap-4 px-6 py-4 hover:bg-gradient-to-r hover:from-blue-50 hover:to-transparent transition-all duration-200 group"
                  >
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-lg flex-shrink-0 font-black text-white shadow-md group-hover:scale-110 transition-transform">
                      {op.business_name[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-800 truncate group-hover:text-blue-600 transition-colors">{op.business_name}</p>
                      <p className="text-xs text-slate-400 truncate">{op.email}</p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <p className="text-xs font-bold text-slate-400">{format(new Date(op.created_at), 'MMM d')}</p>
                      <Activity className="w-3 h-3 text-emerald-500 mx-auto mt-1" />
                    </div>
                  </motion.a>
                ))}
              </div>
            )}
          </Card>
        </motion.div>

        {/* Recent Reviews */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-amber-50 to-white">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-md">
                  <Star className="w-5 h-5 text-white" fill="white" />
                </div>
                <h3 className="font-black text-slate-900">Recent Reviews</h3>
              </div>
              <a href="/admin/reviews" className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 group">
                <span>View all</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
            {(stats.recentReviews?.length ?? 0) === 0 ? (
              <div className="py-16 text-center">
                <div className="h-16 w-16 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-amber-400" />
                </div>
                <p className="text-slate-400 text-sm font-bold">No reviews yet</p>
                <p className="text-slate-300 text-xs mt-1">Guest reviews will appear here</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {(stats.recentReviews ?? []).map((review, index) => {
                  const trip = Array.isArray(review.trips) ? review.trips[0] : review.trips;
                  const operator = trip ? (Array.isArray((trip as any).operators) ? (trip as any).operators[0] : (trip as any).operators) : null;
                  return (
                    <motion.div
                      key={review.id}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + index * 0.05 }}
                      className="flex items-center gap-4 px-6 py-4 hover:bg-gradient-to-r hover:from-amber-50 hover:to-transparent transition-all duration-200"
                    >
                      <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center flex-shrink-0 shadow-md">
                        <Star className="w-6 h-6 text-white" fill="white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-800 truncate">{review.guest_name}</p>
                        <p className="text-xs text-slate-400 truncate">
                          {trip?.trip_name ?? '—'}{operator ? ` · ${operator.business_name}` : ''}
                        </p>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <p className="text-amber-500 text-base font-bold leading-none">{'★'.repeat(review.star_rating)}</p>
                        <p className="text-[10px] text-slate-400 mt-1 font-semibold">{format(new Date(review.created_at), 'MMM d')}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </Card>
        </motion.div>
      </div>

      {/* Quick actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.4 }}
        className="mt-6"
      >
        <Card className="shadow-lg">
          <div className="p-6">
            <h3 className="font-black text-slate-900 mb-5 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-savanna" />
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { href: '/admin/operators', icon: UserCog, label: 'Manage Operators', gradient: 'from-blue-500 to-blue-600' },
                { href: '/admin/reviews', icon: Shield, label: 'Moderate Reviews', gradient: 'from-emerald-500 to-emerald-600' },
                { href: '/admin/destinations', icon: MapPin, label: 'Edit Destinations', gradient: 'from-amber-500 to-amber-600' },
                { href: '/admin/system', icon: SettingsIcon, label: 'System Health', gradient: 'from-purple-500 to-purple-600' },
              ].map(({ href, icon: Icon, label, gradient }) => (
                <a 
                  key={href} 
                  href={href} 
                  className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="relative z-10 flex flex-col items-center text-center">
                    <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="h-7 w-7 text-white" />
                    </div>
                    <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900 transition-colors">{label}</span>
                  </div>
                  {/* Hover effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </a>
              ))}
            </div>
          </div>
        </Card>
      </motion.div>
    </PageShell>
  );
}

function PageShell({ children, loading }: {
  children?: React.ReactNode;
  loading?: boolean;
}) {
  return (
    <div className="p-6 lg:p-8 bg-gradient-to-br from-slate-50 to-white min-h-screen">
      {loading ? (
        <div className="flex items-center justify-center py-32">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-4"
          >
            <div className="h-16 w-16 rounded-3xl bg-gradient-to-br from-forest to-forest/80 animate-pulse mx-auto shadow-xl" />
            <p className="text-slate-600 text-sm font-bold">Loading dashboard...</p>
          </motion.div>
        </div>
      ) : (
        children
      )}
    </div>
  );
}
