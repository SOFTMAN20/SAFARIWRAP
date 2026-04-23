'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Users, 
  Calendar,
  Star,
  Share2,
  Trees,
  BarChart3,
  PieChart,
  Activity,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AnalyticsData {
  overview: {
    totalOperators: number;
    totalEvents: number;
    totalReviews: number;
    totalWraps: number;
    totalTreesPlanted: number;
    avgRating: number;
  };
  growth: {
    operatorsThisMonth: number;
    eventsThisMonth: number;
    reviewsThisMonth: number;
    wrapsThisMonth: number;
  };
  topOperators: {
    id: string;
    business_name: string;
    events_count: number;
    reviews_count: number;
    avg_rating: number;
  }[];
  eventsByType: {
    safari: number;
    marathon: number;
    tour: number;
  };
  reviewsByRating: {
    rating: number;
    count: number;
  }[];
  recentActivity: {
    date: string;
    events: number;
    reviews: number;
    wraps: number;
  }[];
}

export default function AdminAnalyticsPage() {
  const { data, isLoading } = useQuery<AnalyticsData>({
    queryKey: ['admin-analytics'],
    queryFn: () => fetch('/api/admin/analytics').then(r => r.json()),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-black text-slate-900">Analytics</h1>
          <p className="text-sm text-slate-400 font-bold mt-0.5">Loading platform metrics...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-32 bg-white rounded-2xl border border-slate-200 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const overview = data?.overview || {
    totalOperators: 0,
    totalEvents: 0,
    totalReviews: 0,
    totalWraps: 0,
    totalTreesPlanted: 0,
    avgRating: 0,
  };

  const growth = data?.growth || {
    operatorsThisMonth: 0,
    eventsThisMonth: 0,
    reviewsThisMonth: 0,
    wrapsThisMonth: 0,
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-900 mb-2">Analytics Dashboard</h1>
        <p className="text-sm text-slate-400 font-bold">
          Platform performance and growth metrics
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Users className="w-10 h-10 text-blue-600" />
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-3xl font-extrabold text-blue-700 mb-2">
                {overview.totalOperators}
              </div>
              <div className="text-sm font-semibold text-blue-600">
                Total Operators
              </div>
              <div className="text-xs text-blue-500 mt-2">
                +{growth.operatorsThisMonth} this month
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Calendar className="w-10 h-10 text-green-600" />
                <Activity className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-3xl font-extrabold text-green-700 mb-2">
                {overview.totalEvents}
              </div>
              <div className="text-sm font-semibold text-green-600">
                Total Events
              </div>
              <div className="text-xs text-green-500 mt-2">
                +{growth.eventsThisMonth} this month
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Star className="w-10 h-10 text-amber-600" />
                <BarChart3 className="w-5 h-5 text-amber-600" />
              </div>
              <div className="text-3xl font-extrabold text-amber-700 mb-2">
                {overview.totalReviews}
              </div>
              <div className="text-sm font-semibold text-amber-600">
                Total Reviews
              </div>
              <div className="text-xs text-amber-500 mt-2">
                {overview.avgRating.toFixed(1)} ⭐ avg rating
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Share2 className="w-10 h-10 text-purple-600" />
                <PieChart className="w-5 h-5 text-purple-600" />
              </div>
              <div className="text-3xl font-extrabold text-purple-700 mb-2">
                {overview.totalWraps}
              </div>
              <div className="text-sm font-semibold text-purple-600">
                Wraps Generated
              </div>
              <div className="text-xs text-purple-500 mt-2">
                +{growth.wrapsThisMonth} this month
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Environmental Impact */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mb-8"
      >
        <Card className="bg-gradient-to-br from-emerald-50 to-green-100 border-emerald-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Trees className="w-8 h-8 text-emerald-600" />
                  <h3 className="text-xl font-bold text-emerald-700">
                    Environmental Impact
                  </h3>
                </div>
                <p className="text-sm text-emerald-600 mb-4">
                  Total trees planted through SafariWrap
                </p>
                <div className="text-5xl font-extrabold text-emerald-700">
                  {overview.totalTreesPlanted}
                </div>
                <div className="text-sm text-emerald-600 mt-2">
                  🌳 Trees planted · {overview.totalTreesPlanted * 22} kg CO₂ offset/year
                </div>
              </div>
              <div className="hidden md:block text-8xl opacity-20">
                🌳
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Top Operators & Event Types */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Top Operators */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-forest" />
                Top Operators
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data?.topOperators && data.topOperators.length > 0 ? (
                <div className="space-y-4">
                  {data.topOperators.map((operator, index) => (
                    <div key={operator.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-forest text-white flex items-center justify-center font-bold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-bold text-forest">{operator.business_name}</p>
                          <p className="text-xs text-stone">
                            {operator.events_count} events · {operator.reviews_count} reviews
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-amber-600">
                          {operator.avg_rating.toFixed(1)} ⭐
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-stone py-8">No operators yet</p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Events by Type */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5 text-forest" />
                Events by Type
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data?.eventsByType && (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-forest/10 flex items-center justify-center text-2xl">
                          🦁
                        </div>
                        <div>
                          <p className="font-bold text-forest">Safari</p>
                          <p className="text-xs text-stone">Wildlife experiences</p>
                        </div>
                      </div>
                      <div className="text-2xl font-extrabold text-forest">
                        {data.eventsByType.safari}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-2xl">
                          🏃
                        </div>
                        <div>
                          <p className="font-bold text-blue-600">Marathon</p>
                          <p className="text-xs text-stone">Running events</p>
                        </div>
                      </div>
                      <div className="text-2xl font-extrabold text-blue-600">
                        {data.eventsByType.marathon}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-2xl">
                          🗺️
                        </div>
                        <div>
                          <p className="font-bold text-purple-600">Tour</p>
                          <p className="text-xs text-stone">Cultural tours</p>
                        </div>
                      </div>
                      <div className="text-2xl font-extrabold text-purple-600">
                        {data.eventsByType.tour}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Reviews Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500" />
              Reviews Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data?.reviewsByRating && data.reviewsByRating.length > 0 ? (
              <div className="space-y-3">
                {[5, 4, 3, 2, 1].map((rating) => {
                  const ratingData = data.reviewsByRating.find(r => r.rating === rating);
                  const count = ratingData?.count || 0;
                  const total = data.reviewsByRating.reduce((sum, r) => sum + r.count, 0);
                  const percentage = total > 0 ? (count / total) * 100 : 0;

                  return (
                    <div key={rating} className="flex items-center gap-4">
                      <div className="w-20 text-sm font-bold text-stone">
                        {rating} {'⭐'.repeat(rating)}
                      </div>
                      <div className="flex-1 h-8 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 0.5, delay: 0.1 * (6 - rating) }}
                          className="h-full bg-gradient-to-r from-amber-400 to-amber-500"
                        />
                      </div>
                      <div className="w-16 text-right text-sm font-bold text-forest">
                        {count}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-center text-stone py-8">No reviews yet</p>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
