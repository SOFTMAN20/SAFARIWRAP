'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { Trash2, Search, Filter, Star, MessageSquare, TrendingUp, Award } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface ReviewRow {
  id: string;
  guest_name: string;
  email: string | null;
  star_rating: number;
  review_text: string | null;
  created_at: string;
  events: { title: string; operators: { business_name: string } | { business_name: string }[] } | null;
}

const STAR_COLORS = ['', 'bg-red-100 text-red-700', 'bg-orange-100 text-orange-700', 'bg-yellow-100 text-yellow-700', 'bg-blue-100 text-blue-700', 'bg-emerald-100 text-emerald-700'];

export default function AdminReviewsPage() {
  const queryClient = useQueryClient();
  const [ratingFilter, setRatingFilter] = useState(0);
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<ReviewRow | null>(null);

  const { data: reviews = [], isLoading } = useQuery<ReviewRow[]>({
    queryKey: ['admin-reviews'],
    queryFn: async () => {
      const res = await fetch('/api/admin/reviews');
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
    staleTime: 1000 * 60,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/admin/reviews/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      setDeleteTarget(null);
    },
  });

  const filtered = (reviews ?? []).filter(r => {
    const matchesRating = ratingFilter === 0 || r.star_rating === ratingFilter;
    const matchesSearch = !search ||
      r.guest_name.toLowerCase().includes(search.toLowerCase()) ||
      (r.review_text ?? '').toLowerCase().includes(search.toLowerCase());
    return matchesRating && matchesSearch;
  });

  const avgRating = (reviews ?? []).length > 0
    ? ((reviews ?? []).reduce((s, r) => s + r.star_rating, 0) / (reviews ?? []).length).toFixed(1)
    : '0.0';

  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: (reviews ?? []).filter(r => r.star_rating === rating).length,
  }));

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
            <h1 className="text-3xl font-black text-slate-900 mb-2">Reviews</h1>
            <p className="text-sm text-slate-500 font-semibold">Manage guest feedback and ratings</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-amber-600 mb-1">Total Reviews</p>
                    <p className="text-3xl font-black text-amber-700">{reviews?.length ?? 0}</p>
                  </div>
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg">
                    <MessageSquare className="w-6 h-6 text-white" />
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
                    <p className="text-sm font-semibold text-emerald-600 mb-1">Average Rating</p>
                    <p className="text-3xl font-black text-emerald-700">{avgRating}</p>
                  </div>
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg">
                    <Star className="w-6 h-6 text-white" fill="white" />
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
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-blue-600 mb-1">5-Star Reviews</p>
                    <p className="text-3xl font-black text-blue-700">
                      {(reviews ?? []).filter(r => r.star_rating === 5).length}
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                    <Award className="w-6 h-6 text-white" />
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
        className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 mb-6"
      >
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search guest or review text..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border-2 border-slate-200 rounded-2xl text-sm font-semibold placeholder:text-slate-400 focus:border-amber-500 focus:ring-4 focus:ring-amber-100 transition-all outline-none"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-slate-400" />
          <button
            onClick={() => setRatingFilter(0)}
            className={`px-4 py-2.5 rounded-2xl font-bold text-sm transition-all ${ratingFilter === 0 ? 'bg-gradient-to-r from-slate-900 to-slate-700 text-white shadow-lg' : 'bg-white border-2 border-slate-200 text-slate-600 hover:border-slate-300'}`}
          >
            All
          </button>
          {[5, 4, 3, 2, 1].map(n => (
            <button
              key={n}
              onClick={() => setRatingFilter(n)}
              className={`px-4 py-2.5 rounded-2xl font-bold text-sm transition-all ${ratingFilter === n ? STAR_COLORS[n] + ' border-2 border-current/30 shadow-lg' : 'bg-white border-2 border-slate-200 text-slate-600 hover:border-slate-300'}`}
            >
              {'★'.repeat(n)}
              <span className="ml-1.5 opacity-70">({(reviews ?? []).filter(r => r.star_rating === n).length})</span>
            </button>
          ))}
        </div>
      </motion.div>

      {isLoading ? (
        <LoadingSkeleton />
      ) : filtered.length === 0 ? (
        <EmptyState search={search} />
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
                    <th className="text-left px-6 py-4 text-xs font-black text-slate-600 uppercase tracking-wider">Guest</th>
                    <th className="text-left px-6 py-4 text-xs font-black text-slate-600 uppercase tracking-wider hidden md:table-cell">Event · Operator</th>
                    <th className="text-left px-6 py-4 text-xs font-black text-slate-600 uppercase tracking-wider hidden lg:table-cell">Review</th>
                    <th className="text-center px-4 py-4 text-xs font-black text-slate-600 uppercase tracking-wider">Rating</th>
                    <th className="text-left px-4 py-4 text-xs font-black text-slate-600 uppercase tracking-wider hidden sm:table-cell">Date</th>
                    <th className="px-4 py-4" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((review, index) => {
                    const event = Array.isArray(review.events) ? review.events[0] : review.events;
                    const operator = event ? (Array.isArray((event as any).operators) ? (event as any).operators[0] : (event as any).operators) : null;
                    return (
                      <motion.tr
                        key={review.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 * index }}
                        className="hover:bg-gradient-to-r hover:from-slate-50 hover:to-transparent transition-all group"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center text-white font-black shadow-md">
                              {review.guest_name[0].toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">{review.guest_name}</p>
                              {review.email && <p className="text-xs text-slate-500 font-medium">{review.email}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 hidden md:table-cell">
                          <p className="text-sm font-bold text-slate-700 truncate max-w-[200px]">{event?.title ?? '—'}</p>
                          {operator && <p className="text-xs text-slate-500 font-medium">{operator.business_name}</p>}
                        </td>
                        <td className="px-6 py-4 hidden lg:table-cell max-w-[250px]">
                          <p className="text-xs text-slate-600 line-clamp-2 font-medium">
                            {review.review_text ?? <span className="italic text-slate-400">No text provided</span>}
                          </p>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-sm font-black ${STAR_COLORS[review.star_rating]} shadow-sm`}>
                            <Star className="w-3 h-3" fill="currentColor" />
                            {review.star_rating}
                          </span>
                        </td>
                        <td className="px-4 py-4 hidden sm:table-cell">
                          <span className="text-xs text-slate-500 font-semibold">{format(new Date(review.created_at), 'MMM d, yyyy')}</span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <button
                            onClick={() => setDeleteTarget(review)}
                            title="Delete review"
                            className="p-2.5 rounded-xl bg-red-100 text-red-600 hover:bg-red-200 transition-all opacity-0 group-hover:opacity-100 hover:scale-110"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Delete confirm */}
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
                <Trash2 className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">Delete Review?</h3>
              <p className="text-sm text-slate-600 mb-2 font-medium">
                Review by <strong className="text-slate-900">{deleteTarget.guest_name}</strong>
              </p>
              <p className="text-xs text-red-600 font-bold mb-8 bg-red-50 p-3 rounded-xl">
                ⚠️ This will also delete the associated wrap. This action cannot be undone.
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
                  {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <Card className="shadow-xl">
      <div className="p-6 space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-4"
          >
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-slate-200 to-slate-300 animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-slate-200 rounded-lg animate-pulse w-48" />
              <div className="h-3 bg-slate-100 rounded-lg animate-pulse w-32" />
            </div>
            <div className="h-8 w-16 bg-slate-100 rounded-xl animate-pulse" />
          </motion.div>
        ))}
      </div>
    </Card>
  );
}

function EmptyState({ search }: { search: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <Card className="shadow-xl">
        <div className="p-20 flex flex-col items-center text-center">
          <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center text-4xl mb-6">
            <Star className="w-10 h-10 text-amber-500" />
          </div>
          <h4 className="font-black text-xl text-slate-900 mb-2">No Reviews Found</h4>
          <p className="text-slate-500 text-sm font-medium max-w-sm">
            {search ? `No results for "${search}"` : 'No reviews match the selected filter.'}
          </p>
        </div>
      </Card>
    </motion.div>
  );
}
