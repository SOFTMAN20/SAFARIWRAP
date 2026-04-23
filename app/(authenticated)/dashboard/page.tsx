'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  Map, 
  Plus,
  MessageSquare,
  Compass,
  Sparkles,
  TrendingUp,
  Calendar,
  Users,
  Camera,
  Share2,
  BarChart3,
  Clock,
  Star,
  ArrowRight,
  Eye,
  Download,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

const supabase = createClient();

// Query keys for better cache management
const queryKeys = {
  dashboard: ['dashboard'] as const,
  dashboardStats: (userId: string) => [...queryKeys.dashboard, 'stats', userId] as const,
  upcomingEvents: (userId: string) => [...queryKeys.dashboard, 'upcoming', userId] as const,
  recentActivity: (userId: string) => [...queryKeys.dashboard, 'activity', userId] as const,
};

// Animation presets for consistent performance
const animationPresets = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.2 },
  },
  slideUp: {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    transition: { duration: 0.3, ease: "easeOut" },
  },
  staggerChildren: {
    animate: {
      transition: {
        staggerChildren: 0.05,
      },
    },
  },
};

export default function DashboardPage() {
  const { user, operator, profile } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Memoized user name for performance
  const firstName = useMemo(() => {
    return operator?.business_name?.split(' ')[0] || 
           profile?.full_name?.split(' ')[0] || 
           'Friend';
  }, [operator?.business_name, profile?.full_name]);

  // Optimized stats query with single database call
  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: queryKeys.dashboardStats(user?.id || ''),
    queryFn: async () => {
      if (!user?.id) return null;

      // Single optimized query to get all stats
      const [
        { count: totalEvents },
        { count: activeEvents },
        { data: allEvents },
      ] = await Promise.all([
        supabase
          .from('events')
          .select('*', { count: 'exact', head: true })
          .eq('operator_id', user.id),
        supabase
          .from('events')
          .select('*', { count: 'exact', head: true })
          .eq('operator_id', user.id)
          .eq('status', 'upcoming'),
        supabase
          .from('events')
          .select('id')
          .eq('operator_id', user.id),
      ]);
      
      const eventIds = allEvents?.map(e => e.id) || [];
      
      if (eventIds.length === 0) {
        return {
          totalEvents: totalEvents || 0,
          activeEvents: activeEvents || 0,
          totalReviews: 0,
          avgRating: 0,
          totalWraps: 0,
          shareRate: 0,
          thisMonth: { events: 0, reviews: 0, wraps: 0 }
        };
      }

      // Get reviews and wraps data in parallel
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const [
        { data: reviews },
        { count: totalWraps },
        { count: monthEvents },
        { data: monthReviews },
        { count: monthWraps },
      ] = await Promise.all([
        supabase
          .from('reviews')
          .select('star_rating, event_id')
          .in('event_id', eventIds),
        supabase
          .from('wraps')
          .select('*', { count: 'exact', head: true })
          .in('event_id', eventIds),
        supabase
          .from('events')
          .select('*', { count: 'exact', head: true })
          .eq('operator_id', user.id)
          .gte('created_at', startOfMonth.toISOString()),
        supabase
          .from('reviews')
          .select('id, event_id')
          .gte('created_at', startOfMonth.toISOString())
          .in('event_id', eventIds),
        supabase
          .from('wraps')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', startOfMonth.toISOString())
          .in('event_id', eventIds),
      ]);

      const totalReviews = reviews?.length || 0;
      const avgRating = reviews && reviews.length > 0
        ? (reviews.reduce((sum, r) => sum + r.star_rating, 0) / reviews.length)
        : 0;

      return {
        totalEvents: totalEvents || 0,
        activeEvents: activeEvents || 0,
        totalReviews,
        avgRating: parseFloat(avgRating.toFixed(1)),
        totalWraps: totalWraps || 0,
        shareRate: 85, // TODO: Calculate from actual share data
        thisMonth: {
          events: monthEvents || 0,
          reviews: monthReviews?.length || 0,
          wraps: monthWraps || 0,
        }
      };
    },
    enabled: !!user?.id,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Optimized upcoming events query
  const { data: upcomingEvents, isLoading: eventsLoading } = useQuery({
    queryKey: queryKeys.upcomingEvents(user?.id || ''),
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('events')
        .select('id, title, location, start_date, status, metadata')
        .eq('operator_id', user.id)
        .eq('status', 'upcoming')
        .order('start_date', { ascending: true })
        .limit(3);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Optimized recent activity query
  const { data: recentActivity, isLoading: activityLoading } = useQuery({
    queryKey: queryKeys.recentActivity(user?.id || ''),
    queryFn: async () => {
      if (!user?.id) return [];

      // Get user's event IDs first
      const { data: userEvents } = await supabase
        .from('events')
        .select('id')
        .eq('operator_id', user.id);
      
      const eventIds = userEvents?.map(e => e.id) || [];
      
      if (eventIds.length === 0) return [];

      // Get recent reviews and wraps in parallel
      const [
        { data: reviews },
        { data: wraps }
      ] = await Promise.all([
        supabase
          .from('reviews')
          .select('id, guest_name, star_rating, created_at, event_id, events!inner(title)')
          .in('event_id', eventIds)
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('wraps')
          .select('id, guest_name, created_at, event_id, events!inner(title)')
          .in('event_id', eventIds)
          .order('created_at', { ascending: false })
          .limit(5)
      ]);

      // Combine and sort activities
      const activities = [
        ...(reviews || []).map(r => ({
          id: `review-${r.id}`,
          type: 'review' as const,
          title: `New review from ${r.guest_name}`,
          description: `${(r as any).events?.title || 'Safari'} - ${r.star_rating} stars`,
          time: formatTimeAgo(new Date(r.created_at)),
          icon: Star,
          color: 'text-savanna',
          timestamp: new Date(r.created_at).getTime(),
        })),
        ...(wraps || []).map(w => ({
          id: `wrap-${w.id}`,
          type: 'wrap' as const,
          title: 'Wrap generated',
          description: `${(w as any).events?.title || 'Safari'} wrap is ready`,
          time: formatTimeAgo(new Date(w.created_at)),
          icon: Camera,
          color: 'text-forest',
          timestamp: new Date(w.created_at).getTime(),
        })),
      ]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 4);

      return activities;
    },
    enabled: !!user?.id,
    staleTime: 1 * 60 * 1000, // 1 minute for activity
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  // Memoized helper function
  const formatTimeAgo = useCallback((date: Date): string => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
    return date.toLocaleDateString();
  }, []);

  // Memoized stats with fallback
  const mockStats = useMemo(() => stats || {
    totalEvents: 0,
    activeEvents: 0,
    totalReviews: 0,
    avgRating: 0,
    totalWraps: 0,
    shareRate: 0,
    thisMonth: { events: 0, reviews: 0, wraps: 0 }
  }, [stats]);

  // Optimized navigation handlers
  const handleCreateEvent = useCallback(() => {
    router.push('/create-trip');
  }, [router]);

  const handleViewEvent = useCallback((eventId: string) => {
    router.push(`/trip/${eventId}`);
  }, [router]);

  // Prefetch critical pages
  useEffect(() => {
    if (mounted) {
      queryClient.prefetchQuery({
        queryKey: ['events', user?.id],
        queryFn: () => fetch('/api/events').then(res => res.json()),
        staleTime: 5 * 60 * 1000,
      });
    }
  }, [mounted, queryClient, user?.id]);

  if (!mounted) {
    return null; // Prevent hydration mismatch
  }

  if (statsError) {
    return <DashboardError error={statsError} />;
  }

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-12 bg-parchment min-h-screen">
      {/* Welcome Section */}
      <motion.div
        {...animationPresets.fadeIn}
        className="mb-8"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
          <div>
            <h1 className="text-3xl lg:text-5xl font-extrabold text-forest mb-2">
              Jambo, {firstName}! 👋
            </h1>
            <p className="text-stone font-semibold flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Here's what's happening with your safaris
            </p>
          </div>
          <Button 
            onClick={handleCreateEvent}
            size="lg"
            className="bg-forest hover:bg-forest-light text-white"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Event
          </Button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div 
        {...animationPresets.staggerChildren}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8"
      >
        {statsLoading ? (
          <DashboardSkeleton />
        ) : (
          [
            {
              label: 'Total Events',
              value: mockStats.totalEvents,
              change: `+${mockStats.thisMonth.events} this month`,
              icon: Map,
              color: 'from-forest to-forest-light',
              delay: 0,
            },
            {
              label: 'Guest Reviews',
              value: mockStats.totalReviews,
              change: `${mockStats.avgRating} avg rating`,
              icon: MessageSquare,
              color: 'from-blue-500 to-blue-600',
              delay: 0.05,
            },
            {
              label: 'Wraps Created',
              value: mockStats.totalWraps,
              change: `${mockStats.shareRate}% share rate`,
              icon: Camera,
              color: 'from-savanna to-savanna-dark',
              delay: 0.1,
            },
            {
              label: 'Active Events',
              value: mockStats.activeEvents,
              change: 'In progress',
              icon: TrendingUp,
              color: 'from-green-500 to-green-600',
              delay: 0.15,
            },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              {...animationPresets.slideUp}
              transition={{ delay: stat.delay }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {stat.change}
                    </Badge>
                  </div>
                  <p className="text-3xl font-extrabold text-forest mb-1">{stat.value}</p>
                  <p className="text-sm text-stone font-semibold">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-forest" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activityLoading ? (
                <div className="space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-start gap-4 p-4 rounded-lg animate-pulse">
                      <div className="w-10 h-10 rounded-full bg-gray-200" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                        <div className="h-3 bg-gray-200 rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentActivity && recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {recentActivity.map((activity, i) => (
                    <motion.div
                      key={activity.id}
                      initial={mounted ? { opacity: 0, x: -20 } : false}
                      animate={mounted ? { opacity: 1, x: 0 } : false}
                      transition={mounted ? { delay: i * 0.1 } : undefined}
                      className="flex items-start gap-4 p-4 rounded-lg hover:bg-parchment-dark transition-colors"
                    >
                      <div className={`w-10 h-10 rounded-full bg-${activity.color}/10 flex items-center justify-center flex-shrink-0`}>
                        <activity.icon className={`w-5 h-5 ${activity.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-ink">{activity.title}</p>
                        <p className="text-sm text-stone">{activity.description}</p>
                        <p className="text-xs text-stone mt-1">{activity.time}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-forest/10 flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-8 h-8 text-forest/40" />
                  </div>
                  <p className="text-stone font-semibold mb-2">No recent activity</p>
                  <p className="text-sm text-stone">Activity will appear here as guests review your events</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-savanna" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                className="w-full justify-start bg-forest hover:bg-forest-light text-white"
                onClick={() => router.push('/create-trip')}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create New Event
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start border-forest text-forest hover:bg-forest hover:text-white"
                onClick={() => router.push('/trips')}
              >
                <Map className="w-4 h-4 mr-2" />
                View All Events
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => router.push('/achievements')}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                View Analytics
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => router.push('/settings')}
              >
                <Users className="w-4 h-4 mr-2" />
                Manage Profile
              </Button>
            </CardContent>
          </Card>

          {/* This Month Progress */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-sm">This Month's Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-stone">Events</span>
                  <span className="font-bold text-forest">{mockStats.thisMonth.events}/5</span>
                </div>
                <Progress value={(mockStats.thisMonth.events / 5) * 100} className="[&>div]:bg-forest" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-stone">Reviews</span>
                  <span className="font-bold text-forest">{mockStats.thisMonth.reviews}/30</span>
                </div>
                <Progress value={(mockStats.thisMonth.reviews / 30) * 100} className="[&>div]:bg-blue-500" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-stone">Wraps</span>
                  <span className="font-bold text-forest">{mockStats.thisMonth.wraps}/10</span>
                </div>
                <Progress value={(mockStats.thisMonth.wraps / 10) * 100} className="[&>div]:bg-savanna" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Upcoming Events */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-forest" />
              Upcoming Events
            </CardTitle>
            <Link href="/trips">
              <Button variant="ghost" size="sm">
                View All
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {eventsLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <Card>
                    <CardContent className="p-4 space-y-3">
                      <div className="h-6 bg-gray-200 rounded w-20" />
                      <div className="h-5 bg-gray-200 rounded w-full" />
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                        <div className="h-4 bg-gray-200 rounded w-1/2" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          ) : upcomingEvents && upcomingEvents.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcomingEvents.map((event, i) => (
                <motion.div
                  key={event.id}
                  initial={mounted ? { opacity: 0, y: 20 } : false}
                  animate={mounted ? { opacity: 1, y: 0 } : false}
                  transition={mounted ? { delay: i * 0.1 } : undefined}
                >
                  <Card className="hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer" onClick={() => handleViewEvent(event.id)}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <Badge variant="secondary" className="bg-green-100 text-green-700">
                          Upcoming
                        </Badge>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-8 w-8" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewEvent(event.id);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                      <h3 className="font-bold text-forest mb-2 line-clamp-2">{event.title}</h3>
                      <div className="space-y-2 text-sm text-stone">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(event.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Map className="w-4 h-4" />
                          <span>{event.metadata?.destination_names?.[0] || event.location}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-forest/10 flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-forest/40" />
              </div>
              <p className="text-stone font-semibold mb-4">No upcoming events</p>
              <Button onClick={handleCreateEvent}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Event
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Optimized skeleton component
function DashboardSkeleton() {
  return (
    <>
      {[...Array(4)].map((_, i) => (
        <motion.div key={i} {...animationPresets.slideUp} transition={{ delay: i * 0.05 }}>
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6 animate-pulse">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gray-200" />
                <div className="h-5 w-20 bg-gray-200 rounded" />
              </div>
              <div className="h-8 w-16 bg-gray-200 rounded mb-1" />
              <div className="h-4 w-24 bg-gray-200 rounded" />
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </>
  );
}

// Error component
function DashboardError({ error }: { error: any }) {
  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-12 bg-parchment min-h-screen">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-red-600 mb-2">Failed to Load Dashboard</h3>
            <p className="text-stone mb-6">{error.message}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
