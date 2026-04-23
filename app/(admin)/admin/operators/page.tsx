'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronRight, UserX, UserCheck, RotateCcw, Trash2, AlertTriangle, Key, Users, Calendar, Star, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';

interface OperatorRow {
  id: string;
  business_name: string;
  email: string;
  logo_url: string | null;
  brand_color_1: string;
  created_at: string;
  trips_count: number;
  reviews_count: number;
  is_suspended: boolean;
}

export default function AdminOperatorsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'suspended'>('all');
  const [resetTarget, setResetTarget] = useState<OperatorRow | null>(null);
  const [resetDone, setResetDone] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<OperatorRow | null>(null);

  const { data: operators = [], isLoading } = useQuery<OperatorRow[]>({
    queryKey: ['admin-operators'],
    queryFn: async () => {
      const res = await fetch('/api/admin/operators');
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
    staleTime: 1000 * 60,
  });

  const suspendMutation = useMutation({
    mutationFn: ({ id, suspend }: { id: string; suspend: boolean }) =>
      fetch(`/api/admin/operators/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ suspend }),
      }).then(r => r.json()),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-operators'] }),
  });

  const resetMutation = useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/admin/operators/${id}/reset-password`, { method: 'POST' }).then(r => r.json()),
    onSuccess: () => { setResetDone(true); setTimeout(() => { setResetTarget(null); setResetDone(false); }, 2000); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/admin/operators/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-operators'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      setDeleteTarget(null);
    },
  });

  const filtered = (operators ?? []).filter(op => {
    const matchesSearch = !search ||
      op.business_name.toLowerCase().includes(search.toLowerCase()) ||
      op.email.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filter === 'all' ||
      (filter === 'active' && !op.is_suspended) ||
      (filter === 'suspended' && op.is_suspended);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-6 lg:p-8 bg-gradient-to-br from-slate-50 to-white min-h-screen">
      {/* Header with Stats */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-black text-slate-900 mb-2">Operators</h1>
            <p className="text-sm text-slate-500 font-semibold">Manage tour operator accounts and permissions</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-blue-600 mb-1">Total Operators</p>
                    <p className="text-3xl font-black text-blue-700">{operators?.length ?? 0}</p>
                  </div>
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-emerald-600 mb-1">Active</p>
                    <p className="text-3xl font-black text-emerald-700">
                      {(operators ?? []).filter(o => !o.is_suspended).length}
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg">
                    <UserCheck className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-red-600 mb-1">Suspended</p>
                    <p className="text-3xl font-black text-red-700">
                      {(operators ?? []).filter(o => o.is_suspended).length}
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg">
                    <UserX className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>

      {/* Toolbar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6"
      >
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border-2 border-slate-200 rounded-2xl text-sm font-semibold placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          {(['all', 'active', 'suspended'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-5 py-3 rounded-2xl font-bold text-sm capitalize transition-all ${
                filter === f
                  ? 'bg-gradient-to-r from-slate-900 to-slate-700 text-white shadow-lg shadow-slate-900/20'
                  : 'bg-white border-2 border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900'
              }`}
            >
              {f}
              {f === 'suspended' && (operators ?? []).filter(o => o.is_suspended).length > 0 && (
                <span className="ml-2 bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                  {(operators ?? []).filter(o => o.is_suspended).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </motion.div>

      {isLoading ? (
        <LoadingSkeleton rows={5} />
      ) : filtered.length === 0 ? (
        <EmptyState icon="🏢" title="No operators found" body={search ? `No results for "${search}"` : 'No operators registered yet.'} />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                    <th className="text-left px-6 py-4 text-xs font-black text-slate-600 uppercase tracking-wider">Operator</th>
                    <th className="text-center px-4 py-4 text-xs font-black text-slate-600 uppercase tracking-wider">Events</th>
                    <th className="text-center px-4 py-4 text-xs font-black text-slate-600 uppercase tracking-wider">Reviews</th>
                    <th className="text-left px-4 py-4 text-xs font-black text-slate-600 uppercase tracking-wider hidden lg:table-cell">Joined</th>
                    <th className="text-left px-4 py-4 text-xs font-black text-slate-600 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-4 text-xs font-black text-slate-600 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((op, index) => (
                    <motion.tr
                      key={op.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 * index }}
                      className="hover:bg-gradient-to-r hover:from-slate-50 hover:to-transparent transition-all group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div
                            className="h-12 w-12 rounded-2xl flex items-center justify-center text-white text-base font-black flex-shrink-0 overflow-hidden shadow-md group-hover:scale-110 transition-transform"
                            style={{ backgroundColor: op.brand_color_1 }}
                          >
                            {op.logo_url
                              ? <img src={op.logo_url} className="h-full w-full object-cover" alt="" />
                              : op.business_name[0].toUpperCase()
                            }
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">{op.business_name}</p>
                            <p className="text-xs text-slate-500 truncate font-medium">{op.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-xl">
                          <Calendar className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-black text-blue-700">{op.trips_count}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 rounded-xl">
                          <Star className="w-4 h-4 text-amber-600" />
                          <span className="text-sm font-black text-amber-700">{op.reviews_count}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 hidden lg:table-cell">
                        <span className="text-xs text-slate-500 font-semibold">{format(new Date(op.created_at), 'MMM d, yyyy')}</span>
                      </td>
                      <td className="px-4 py-4">
                        {op.is_suspended ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider bg-red-100 text-red-700 px-3 py-1.5 rounded-xl">
                            <UserX className="w-3 h-3" />
                            Suspended
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-xl">
                            <UserCheck className="w-3 h-3" />
                            Active
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {/* Suspend / Reactivate */}
                          <button
                            onClick={() => suspendMutation.mutate({ id: op.id, suspend: !op.is_suspended })}
                            disabled={suspendMutation.isPending}
                            title={op.is_suspended ? 'Reactivate account' : 'Suspend account'}
                            className={`p-2.5 rounded-xl text-sm transition-all hover:scale-110 ${
                              op.is_suspended
                                ? 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200'
                                : 'bg-red-100 text-red-600 hover:bg-red-200'
                            }`}
                          >
                            {op.is_suspended ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                          </button>
                          {/* Password reset */}
                          <button
                            onClick={() => setResetTarget(op)}
                            title="Send password reset"
                            className="p-2.5 rounded-xl bg-blue-100 text-blue-600 hover:bg-blue-200 transition-all hover:scale-110"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                          {/* Delete account */}
                          <button
                            onClick={() => setDeleteTarget(op)}
                            title="Delete account permanently"
                            className="p-2.5 rounded-xl bg-red-100 text-red-600 hover:bg-red-200 transition-all hover:scale-110"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          {/* View detail */}
                          <a
                            href={`/admin/operators/${op.id}`}
                            className="p-2.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all hover:scale-110"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </a>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Delete account confirmation modal */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setDeleteTarget(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-8 text-center"
            >
              <div className="h-16 w-16 rounded-3xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center mx-auto mb-5 shadow-lg">
                <AlertTriangle className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">Delete Account?</h3>
              <p className="text-sm text-slate-600 mb-2 font-medium">
                You are about to permanently delete <strong className="text-slate-900">{deleteTarget.business_name}</strong>.
              </p>
              <p className="text-xs text-red-600 font-bold mb-8 bg-red-50 p-3 rounded-xl">
                ⚠️ This will erase all their events, reviews, wraps, and auth credentials. This cannot be undone.
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="flex-1 py-3 rounded-2xl font-bold text-sm border-2 border-slate-200 text-slate-600 hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteMutation.mutate(deleteTarget.id)}
                  disabled={deleteMutation.isPending}
                  className="flex-1 py-3 rounded-2xl font-bold text-sm bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 disabled:opacity-50 shadow-lg shadow-red-500/30 transition-all"
                >
                  {deleteMutation.isPending ? 'Deleting...' : 'Delete Forever'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Password reset confirmation modal */}
      <AnimatePresence>
        {resetTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => !resetDone && setResetTarget(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-8 text-center"
            >
              <div className={`h-16 w-16 rounded-3xl bg-gradient-to-br ${resetDone ? 'from-emerald-500 to-emerald-600' : 'from-blue-500 to-blue-600'} flex items-center justify-center mx-auto mb-5 shadow-lg`}>
                <Key className="h-8 w-8 text-white" />
              </div>
              {resetDone ? (
                <>
                  <h3 className="text-2xl font-black text-slate-900 mb-2">Email Sent!</h3>
                  <p className="text-sm text-slate-600 font-medium">
                    Password reset sent to <strong className="text-slate-900">{resetTarget.email}</strong>
                  </p>
                </>
              ) : (
                <>
                  <h3 className="text-2xl font-black text-slate-900 mb-2">Reset Password?</h3>
                  <p className="text-sm text-slate-600 mb-8 font-medium">
                    Send a password reset email to <strong className="text-slate-900">{resetTarget.email}</strong>?
                  </p>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setResetTarget(null)}
                      className="flex-1 py-3 rounded-2xl font-bold text-sm border-2 border-slate-200 text-slate-600 hover:bg-slate-50 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => resetMutation.mutate(resetTarget.id)}
                      disabled={resetMutation.isPending}
                      className="flex-1 py-3 rounded-2xl font-bold text-sm bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 shadow-lg shadow-blue-500/30 transition-all"
                    >
                      {resetMutation.isPending ? 'Sending...' : 'Send Reset'}
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function LoadingSkeleton({ rows }: { rows: number }) {
  return (
    <Card className="shadow-xl">
      <div className="p-6 space-y-4">
        {Array.from({ length: rows }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-4"
          >
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-slate-200 to-slate-300 animate-pulse flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-slate-200 rounded-lg animate-pulse w-48" />
              <div className="h-3 bg-slate-100 rounded-lg animate-pulse w-32" />
            </div>
            <div className="h-8 w-20 bg-slate-100 rounded-xl animate-pulse" />
          </motion.div>
        ))}
      </div>
    </Card>
  );
}

function EmptyState({ icon, title, body }: { icon: string; title: string; body: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <Card className="shadow-xl">
        <div className="p-20 flex flex-col items-center text-center">
          <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-4xl mb-6">
            {icon}
          </div>
          <h4 className="font-black text-xl text-slate-900 mb-2">{title}</h4>
          <p className="text-slate-500 text-sm font-medium max-w-sm">{body}</p>
        </div>
      </Card>
    </motion.div>
  );
}
