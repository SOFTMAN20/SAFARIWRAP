'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { use } from 'react';
import { ArrowLeft, Map, MessageSquare, Layout, Star, UserX, UserCheck, RotateCcw, Mail, Trash2, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

interface OperatorDetail {
  operator: {
    id: string;
    business_name: string;
    email: string;
    full_name: string | null;
    logo_url: string | null;
    brand_color_1: string;
    brand_color_2: string;
    created_at: string;
    is_suspended: boolean;
  };
  trips: {
    id: string;
    trip_name: string;
    start_date: string;
    end_date: string;
    status: string;
    destination_names: string[];
  }[];
  reviews: {
    id: string;
    guest_name: string;
    star_rating: number;
    review_text: string | null;
    created_at: string;
  }[];
  wraps_count: number;
}

export default function AdminOperatorDetailPage({ params }: { params: Promise<{ operatorId: string }> }) {
  const { operatorId } = use(params);
  const queryClient = useQueryClient();
  const router = useRouter();
  const [resetSent, setResetSent] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { data, isLoading } = useQuery<OperatorDetail>({
    queryKey: ['admin-operator', operatorId],
    queryFn: () => fetch(`/api/admin/operators/${operatorId}`).then(r => r.json()),
  });

  const suspendMutation = useMutation({
    mutationFn: (suspend: boolean) =>
      fetch(`/api/admin/operators/${operatorId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ suspend }),
      }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-operator', operatorId] });
      queryClient.invalidateQueries({ queryKey: ['admin-operators'] });
    },
  });

  const resetMutation = useMutation({
    mutationFn: () =>
      fetch(`/api/admin/operators/${operatorId}/reset-password`, { method: 'POST' }).then(r => r.json()),
    onSuccess: () => { setResetSent(true); setTimeout(() => setResetSent(false), 4000); },
  });

  const deleteMutation = useMutation({
    mutationFn: () => fetch(`/api/admin/operators/${operatorId}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-operators'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      router.push('/admin/operators');
    },
  });

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="h-5 w-32 bg-slate-100 rounded animate-pulse mb-8" />
        <div className="bg-white rounded-2xl border border-slate-200 p-6 animate-pulse h-48 mb-6" />
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 h-64 animate-pulse" />
          <div className="bg-white rounded-2xl border border-slate-200 h-64 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!data?.operator) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center h-64">
        <p className="font-bold text-slate-400">Operator not found</p>
      </div>
    );
  }

  const { operator, trips, reviews, wraps_count } = data;
  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.star_rating, 0) / reviews.length).toFixed(1)
    : '—';

  return (
    <div className="p-6 lg:p-8">
      {/* Back */}
      <a href="/admin/operators" className="inline-flex items-center space-x-1.5 text-slate-400 hover:text-slate-700 font-bold text-sm transition-colors mb-6 group">
        <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
        <span>All Operators</span>
      </a>

      {/* Header card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row items-start gap-5">
          {/* Avatar */}
          <div
            className="h-16 w-16 rounded-2xl flex items-center justify-center text-white text-xl font-black flex-shrink-0 overflow-hidden shadow-md"
            style={{ backgroundColor: operator.brand_color_1 }}
          >
            {operator.logo_url
              ? <img src={operator.logo_url} className="h-full w-full object-cover" alt="" />
              : operator.business_name[0].toUpperCase()
            }
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-black text-slate-900">{operator.business_name}</h2>
                  {operator.is_suspended ? (
                    <span className="text-[10px] font-black uppercase tracking-wider bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Suspended</span>
                  ) : (
                    <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">Active</span>
                  )}
                </div>
                {operator.full_name && (
                  <p className="text-sm font-bold text-slate-500 mt-0.5">{operator.full_name}</p>
                )}
                <div className="flex items-center space-x-1.5 mt-0.5">
                  <Mail size={12} className="text-slate-400" />
                  <p className="text-sm text-slate-400">{operator.email}</p>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Joined {format(new Date(operator.created_at), 'MMMM d, yyyy')}
                </p>
                <div className="flex items-center space-x-2 mt-2">
                  <div className="h-4 w-4 rounded-full ring-2 ring-white shadow" style={{ backgroundColor: operator.brand_color_1 }} />
                  <div className="h-4 w-4 rounded-full ring-2 ring-white shadow" style={{ backgroundColor: operator.brand_color_2 }} />
                  <span className="text-xs text-slate-400 font-bold">Brand palette</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                {resetSent ? (
                  <div className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm font-bold">
                    <Mail size={14} />
                    <span>Reset email sent!</span>
                  </div>
                ) : (
                  <button
                    onClick={() => resetMutation.mutate()}
                    disabled={resetMutation.isPending}
                    className="flex items-center space-x-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-sm font-bold transition-colors disabled:opacity-50"
                  >
                    <RotateCcw size={13} className={resetMutation.isPending ? 'animate-spin' : ''} />
                    <span>Reset Password</span>
                  </button>
                )}
                <button
                  onClick={() => suspendMutation.mutate(!operator.is_suspended)}
                  disabled={suspendMutation.isPending}
                  className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-colors disabled:opacity-50 ${
                    operator.is_suspended
                      ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                      : 'bg-red-50 hover:bg-red-100 text-red-600'
                  }`}
                >
                  {operator.is_suspended ? <UserCheck size={13} /> : <UserX size={13} />}
                  <span>{operator.is_suspended ? 'Reactivate Account' : 'Suspend Account'}</span>
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-sm font-bold bg-red-600 text-white hover:bg-red-700 transition-colors"
                >
                  <Trash2 size={13} />
                  <span>Delete Account</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-100">
          {[
            { label: 'Trips', value: trips.length, icon: Map, color: 'text-emerald-500' },
            { label: 'Reviews', value: reviews.length, icon: MessageSquare, color: 'text-amber-500' },
            { label: 'SafariWraps', value: wraps_count, icon: Layout, color: 'text-purple-500' },
            { label: 'Avg Rating', value: avgRating, icon: Star, color: 'text-amber-500' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-slate-50 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-1">
                <Icon size={14} className={color} />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{label}</span>
              </div>
              <p className="text-2xl font-black text-slate-900">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Suspended banner */}
      {operator.is_suspended && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-3.5 mb-6 flex items-center space-x-3">
          <UserX size={16} className="text-red-500 flex-shrink-0" />
          <p className="text-sm font-bold text-red-700">
            This account is suspended. The operator cannot log in until reactivated.
          </p>
        </div>
      )}

      {/* Delete confirm modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center">
            <div className="h-14 w-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="h-7 w-7 text-red-600" />
            </div>
            <h3 className="text-lg font-black text-slate-900 mb-1">Delete this account?</h3>
            <p className="text-sm text-slate-500 mb-1">
              <strong>{operator.business_name}</strong> will be permanently removed.
            </p>
            <p className="text-xs text-red-500 font-bold mb-6">
              All trips, reviews, wraps, and login credentials will be erased. This cannot be undone.
            </p>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 rounded-xl font-bold text-sm border border-slate-200 text-slate-500 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteMutation.mutate()}
                disabled={deleteMutation.isPending}
                className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-red-500 text-white hover:bg-red-600 disabled:opacity-50"
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete Forever'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Trips */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="font-black text-slate-900 text-sm">Trips ({trips.length})</h3>
          </div>
          {trips.length === 0 ? (
            <p className="text-slate-400 font-bold text-sm text-center py-10">No trips yet</p>
          ) : (
            <div className="divide-y divide-slate-50">
              {trips.map(trip => (
                <div key={trip.id} className="px-6 py-4">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-bold text-sm text-slate-900 truncate pr-3">{trip.trip_name}</p>
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full flex-shrink-0 ${
                      trip.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {trip.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-bold">
                    {format(new Date(trip.start_date), 'MMM d')} – {format(new Date(trip.end_date), 'MMM d, yyyy')}
                  </p>
                  {trip.destination_names?.length > 0 && (
                    <p className="text-xs text-slate-400 mt-0.5">📍 {trip.destination_names.join(', ')}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reviews */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="font-black text-slate-900 text-sm">Recent Reviews ({reviews.length})</h3>
          </div>
          {reviews.length === 0 ? (
            <p className="text-slate-400 font-bold text-sm text-center py-10">No reviews yet</p>
          ) : (
            <div className="divide-y divide-slate-50">
              {reviews.slice(0, 10).map(review => (
                <div key={review.id} className="px-6 py-4">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-bold text-sm text-slate-900">{review.guest_name}</p>
                    <span className="text-amber-500 text-sm leading-none">{'★'.repeat(review.star_rating)}</span>
                  </div>
                  {review.review_text && (
                    <p className="text-xs text-slate-500 line-clamp-2">{review.review_text}</p>
                  )}
                  <p className="text-[10px] text-slate-400 mt-1">{format(new Date(review.created_at), 'MMM d, yyyy')}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
