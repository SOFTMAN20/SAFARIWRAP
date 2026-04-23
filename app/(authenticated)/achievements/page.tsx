'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Star,
  Calendar,
  MapPin,
  Camera,
  Share2,
  Download,
  Eye,
  Heart,
  MessageSquare,
  Award,
  Trophy,
  Zap,
  Target,
  Clock,
  Globe,
  Filter,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';

// Mock analytics data
const mockAnalytics = {
  overview: {
    totalEvents: 47,
    totalGuests: 342,
    totalReviews: 289,
    totalWraps: 267,
    avgRating: 4.8,
    shareRate: 73, // percentage
    conversionRate: 85, // reviews to wraps
    repeatGuests: 23,
  },
  trends: {
    events: { current: 47, previous: 42, change: 11.9 },
    guests: { current: 342, previous: 298, change: 14.8 },
    reviews: { current: 289, previous: 251, change: 15.1 },
    rating: { current: 4.8, previous: 4.6, change: 4.3 },
  },
  monthlyData: [
    { month: 'Oct', events: 5, guests: 38, reviews: 32, wraps: 28 },
    { month: 'Nov', events: 7, guests: 52, reviews: 45, wraps: 41 },
    { month: 'Dec', events: 8, guests: 61, reviews: 58, wraps: 52 },
    { month: 'Jan', events: 6, guests: 44, reviews: 39, wraps: 35 },
    { month: 'Feb', events: 5, guests: 37, reviews: 31, wraps: 29 },
    { month: 'Mar', events: 8, guests: 59, reviews: 48, wraps: 44 },
    { month: 'Apr', events: 8, guests: 51, reviews: 36, wraps: 38 },
  ],
  topDestinations: [
    { name: 'Serengeti National Park', events: 15, rating: 4.9, guests: 127 },
    { name: 'Ngorongoro Crater', events: 12, rating: 4.8, guests: 98 },
    { name: 'Masai Mara', events: 10, rating: 4.7, guests: 76 },
    { name: 'Tarangire', events: 6, rating: 4.6, guests: 41 },
    { name: 'Lake Manyara', events: 4, rating: 4.8, guests: 28 },
  ],
  recentActivity: [
    { type: 'review', guest: 'Emma Wilson', event: 'Serengeti Safari', rating: 5, time: '2 hours ago' },
    { type: 'wrap', guest: 'John Smith', event: 'Ngorongoro Expedition', shares: 12, time: '4 hours ago' },
    { type: 'event', name: 'Masai Mara Adventure', guests: 8, time: '1 day ago' },
    { type: 'review', guest: 'Sarah Johnson', event: 'Tarangire Safari', rating: 5, time: '1 day ago' },
    { type: 'wrap', guest: 'Michael Brown', event: 'Lake Manyara Tour', shares: 8, time: '2 days ago' },
  ],
  achievements: [
    { icon: Star, title: 'Guest Favorite', description: 'Maintain 4.8+ rating over 10 trips', progress: 85, status: 'In Progress', color: 'text-savanna' },
    { icon: Trophy, title: 'Savanna Guide', description: 'Complete 50 unique expeditions', progress: 94, status: 'Almost There!', color: 'text-forest' },
    { icon: Zap, title: 'Memory Maker', description: 'Collect 500+ guest reviews', progress: 58, status: 'Active', color: 'text-amber-500' },
    { icon: Target, title: 'Share Master', description: '80% wrap share rate', progress: 91, status: 'Excellent', color: 'text-blue-600' },
  ]
};

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('events');

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch analytics data
  const { data: analytics, isLoading, error, refetch } = useQuery({
    queryKey: ['analytics', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const response = await fetch(`/api/analytics?operator_id=${user.id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }
      
      return response.json();
    },
    enabled: !!user?.id && mounted,
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  if (!mounted || isLoading) {
    return <AnalyticsSkeleton />;
  }

  if (error || !analytics) {
    return <AnalyticsError error={error} />;
  }

  const mockAnalytics = analytics;

  // Handle export report
  const handleExportReport = () => {
    if (!analytics) return;

    try {
      // Create CSV content
      const csvContent = generateCSVReport(analytics);
      
      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      const fileName = `safariwrap-analytics-${new Date().toISOString().split('T')[0]}.csv`;
      link.setAttribute('href', url);
      link.setAttribute('download', fileName);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      URL.revokeObjectURL(url);
      
      // Show success message
      setTimeout(() => {
        alert(`✅ Report exported successfully!\n\nFile: ${fileName}`);
      }, 100);
    } catch (error) {
      console.error('Export error:', error);
      alert('❌ Failed to export report. Please try again.');
    }
  };

  // Handle export guest data
  const handleExportGuestData = async () => {
    if (!user?.id) return;

    try {
      // Fetch detailed guest data
      const response = await fetch(`/api/analytics/guests?operator_id=${user.id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch guest data');
      }
      
      const data = await response.json();
      
      // Create CSV content
      const csvContent = generateGuestDataCSV(data);
      
      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      const fileName = `safariwrap-guests-${new Date().toISOString().split('T')[0]}.csv`;
      link.setAttribute('href', url);
      link.setAttribute('download', fileName);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      URL.revokeObjectURL(url);
      
      // Show success message
      setTimeout(() => {
        alert(`✅ Guest data exported successfully!\n\nFile: ${fileName}`);
      }, 100);
    } catch (error) {
      console.error('Export error:', error);
      alert('❌ Failed to export guest data. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-parchment to-white">
      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-forest mb-2">
              Analytics Dashboard
            </h1>
            <p className="text-lg text-stone">
              Track your safari business performance and guest satisfaction
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 3 months</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" size="icon">
              <RefreshCw className="w-4 h-4" onClick={() => refetch()} />
            </Button>
            
            <Button onClick={() => handleExportReport()}>
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </motion.div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            icon={<Calendar className="w-6 h-6" />}
            label="Total Events"
            value={mockAnalytics.overview.totalEvents}
            change={mockAnalytics.trends.events.change}
            trend="up"
            color="text-forest"
            bgColor="bg-forest/10"
            delay={0}
          />
          <MetricCard
            icon={<Users className="w-6 h-6" />}
            label="Total Guests"
            value={mockAnalytics.overview.totalGuests}
            change={mockAnalytics.trends.guests.change}
            trend="up"
            color="text-blue-600"
            bgColor="bg-blue-100"
            delay={0.1}
          />
          <MetricCard
            icon={<MessageSquare className="w-6 h-6" />}
            label="Guest Reviews"
            value={mockAnalytics.overview.totalReviews}
            change={mockAnalytics.trends.reviews.change}
            trend="up"
            color="text-savanna"
            bgColor="bg-savanna/10"
            delay={0.2}
          />
          <MetricCard
            icon={<Star className="w-6 h-6" />}
            label="Avg Rating"
            value={mockAnalytics.overview.avgRating}
            change={mockAnalytics.trends.rating.change}
            trend="up"
            color="text-amber-500"
            bgColor="bg-amber-100"
            delay={0.3}
            isRating={true}
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2"
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-forest/10 flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-forest" />
                    </div>
                    <CardTitle>Performance Trends</CardTitle>
                  </div>
                  <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="events">Events</SelectItem>
                      <SelectItem value="guests">Guests</SelectItem>
                      <SelectItem value="reviews">Reviews</SelectItem>
                      <SelectItem value="wraps">Wraps</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <PerformanceChart data={mockAnalytics.monthlyData} metric={selectedMetric} />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-6"
          >
            {/* Conversion Rates */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Conversion Rates</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ConversionMetric
                  label="Reviews to Wraps"
                  value={mockAnalytics.overview.conversionRate}
                  icon={<Camera className="w-4 h-4" />}
                />
                <ConversionMetric
                  label="Wrap Shares"
                  value={mockAnalytics.overview.shareRate}
                  icon={<Share2 className="w-4 h-4" />}
                />
                <ConversionMetric
                  label="Repeat Guests"
                  value={67}
                  icon={<Heart className="w-4 h-4" />}
                />
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Eye className="w-4 h-4 mr-2" />
                  View Detailed Reports
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => handleExportGuestData()}>
                  <Download className="w-4 h-4 mr-2" />
                  Export Guest Data
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Analytics
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Destinations & Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Destinations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-forest/10 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-forest" />
                  </div>
                  <CardTitle>Top Destinations</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockAnalytics.topDestinations.map((destination, i) => (
                    <motion.div
                      key={destination.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + i * 0.1 }}
                      className="flex items-center justify-between p-3 rounded-xl bg-parchment/50 hover:bg-parchment transition-colors"
                    >
                      <div className="flex-1">
                        <p className="font-bold text-ink">{destination.name}</p>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-sm text-stone flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {destination.events} events
                          </span>
                          <span className="text-sm text-stone flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {destination.guests} guests
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                          <span className="font-bold text-ink">{destination.rating}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-forest/10 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-forest" />
                    </div>
                    <CardTitle>Recent Activity</CardTitle>
                  </div>
                  <Button variant="ghost" size="sm">
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockAnalytics.recentActivity.map((activity, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 + i * 0.1 }}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-parchment/30 transition-colors"
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        activity.type === 'review' ? 'bg-amber-100 text-amber-600' :
                        activity.type === 'wrap' ? 'bg-blue-100 text-blue-600' :
                        'bg-green-100 text-green-600'
                      }`}>
                        {activity.type === 'review' && <Star className="w-4 h-4" />}
                        {activity.type === 'wrap' && <Camera className="w-4 h-4" />}
                        {activity.type === 'event' && <Calendar className="w-4 h-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        {activity.type === 'review' && (
                          <>
                            <p className="text-sm font-bold text-ink truncate">
                              {activity.guest} left a {activity.rating}-star review
                            </p>
                            <p className="text-xs text-stone truncate">{activity.event}</p>
                          </>
                        )}
                        {activity.type === 'wrap' && (
                          <>
                            <p className="text-sm font-bold text-ink truncate">
                              {activity.guest}'s wrap shared {activity.shares} times
                            </p>
                            <p className="text-xs text-stone truncate">{activity.event}</p>
                          </>
                        )}
                        {activity.type === 'event' && (
                          <>
                            <p className="text-sm font-bold text-ink truncate">
                              New event: {activity.name}
                            </p>
                            <p className="text-xs text-stone">{activity.guests} guests registered</p>
                          </>
                        )}
                      </div>
                      <span className="text-xs text-stone whitespace-nowrap">{activity.time}</span>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Achievements Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-forest/10 flex items-center justify-center">
                  <Award className="w-5 h-5 text-forest" />
                </div>
                <CardTitle>Achievements & Goals</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {mockAnalytics.achievements.map((achievement: any, i: number) => {
                  const IconComponent = achievement.icon === 'Star' ? Star :
                                       achievement.icon === 'Trophy' ? Trophy :
                                       achievement.icon === 'Zap' ? Zap :
                                       Target;
                  
                  return (
                    <motion.div
                      key={achievement.title}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.9 + i * 0.1 }}
                      className="p-4 rounded-xl bg-parchment/30 hover:bg-parchment/50 transition-colors"
                    >
                      <div className={`w-10 h-10 rounded-xl bg-white flex items-center justify-center mb-3 ${achievement.color}`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <h4 className="font-bold text-ink mb-1">{achievement.title}</h4>
                      <p className="text-xs text-stone mb-3 leading-relaxed">{achievement.description}</p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-stone">{achievement.status}</span>
                          <span className="font-bold text-ink">{achievement.progress}%</span>
                        </div>
                        <Progress value={achievement.progress} className="h-2" />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

// Helper Components
interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  change: number;
  trend: 'up' | 'down';
  color: string;
  bgColor: string;
  delay: number;
  isRating?: boolean;
}

function MetricCard({ icon, label, value, change, trend, color, bgColor, delay, isRating }: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Card className="hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 rounded-xl ${bgColor} flex items-center justify-center ${color}`}>
              {icon}
            </div>
            <div className={`flex items-center gap-1 text-sm font-bold ${
              trend === 'up' ? 'text-green-600' : 'text-red-600'
            }`}>
              {trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              {change}%
            </div>
          </div>
          <p className="text-3xl font-black text-ink mb-1">
            {isRating ? value.toFixed(1) : value.toLocaleString()}
          </p>
          <p className="text-sm text-stone font-bold">{label}</p>
          <p className="text-xs text-stone/60 mt-1">vs last period</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function ConversionMetric({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-parchment flex items-center justify-center text-forest">
          {icon}
        </div>
        <span className="text-sm font-bold text-ink">{label}</span>
      </div>
      <div className="text-right">
        <p className="text-lg font-black text-ink">{value}%</p>
      </div>
    </div>
  );
}

function PerformanceChart({ data, metric }: { data: any[]; metric: string }) {
  const maxValue = Math.max(...data.map(d => d[metric]));
  
  return (
    <div className="h-full flex items-end justify-between gap-2 px-4 pb-8">
      {data.map((item, i) => (
        <div key={item.month} className="flex-1 flex flex-col items-center gap-2">
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: `${(item[metric] / maxValue) * 100}%` }}
            transition={{ delay: 0.5 + i * 0.1, type: 'spring' }}
            className="w-full bg-gradient-to-t from-forest to-forest-light rounded-t-lg relative group cursor-pointer hover:from-savanna hover:to-savanna-light transition-colors min-h-[20px]"
          >
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="bg-forest text-white text-xs font-bold px-2 py-1 rounded whitespace-nowrap">
                {item[metric]} {metric}
              </div>
            </div>
          </motion.div>
          <span className="text-xs font-bold text-stone">{item.month}</span>
        </div>
      ))}
    </div>
  );
}


function AnalyticsSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-parchment to-white">
      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
        <div className="animate-pulse space-y-8">
          <div className="h-12 bg-gray-200 rounded w-1/3" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <Card key={i}>
                <CardContent className="p-6 space-y-4">
                  <div className="h-12 w-12 bg-gray-200 rounded-xl" />
                  <div className="h-8 bg-gray-200 rounded w-20" />
                  <div className="h-4 bg-gray-200 rounded w-32" />
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="p-6">
                  <div className="h-80 bg-gray-200 rounded" />
                </CardContent>
              </Card>
            </div>
            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <div className="h-40 bg-gray-200 rounded" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AnalyticsError({ error }: { error: any }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-parchment to-white">
      <div className="max-w-4xl mx-auto p-4 md:p-8">
        <Card>
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-red-600 mb-2">Failed to Load Analytics</h3>
            <p className="text-stone mb-6">{error?.message || 'An error occurred'}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function generateCSVReport(analytics: any): string {
  const lines: string[] = [];
  
  // Header
  lines.push('SafariWrap Analytics Report');
  lines.push(`Generated: ${new Date().toLocaleString()}`);
  lines.push('');
  
  // Overview Section
  lines.push('OVERVIEW METRICS');
  lines.push('Metric,Value');
  lines.push(`Total Events,${analytics.overview.totalEvents}`);
  lines.push(`Total Guests,${analytics.overview.totalGuests}`);
  lines.push(`Total Reviews,${analytics.overview.totalReviews}`);
  lines.push(`Total Wraps,${analytics.overview.totalWraps}`);
  lines.push(`Average Rating,${analytics.overview.avgRating}`);
  lines.push(`Conversion Rate,${analytics.overview.conversionRate}%`);
  lines.push(`Share Rate,${analytics.overview.shareRate}%`);
  lines.push('');
  
  // Trends Section
  lines.push('TRENDS (Last 30 Days vs Previous 30 Days)');
  lines.push('Metric,Current,Previous,Change (%)');
  lines.push(`Events,${analytics.trends.events.current},${analytics.trends.events.previous},${analytics.trends.events.change > 0 ? '+' : ''}${analytics.trends.events.change}%`);
  lines.push(`Guests,${analytics.trends.guests.current},${analytics.trends.guests.previous},${analytics.trends.guests.change > 0 ? '+' : ''}${analytics.trends.guests.change}%`);
  lines.push(`Reviews,${analytics.trends.reviews.current},${analytics.trends.reviews.previous},${analytics.trends.reviews.change > 0 ? '+' : ''}${analytics.trends.reviews.change}%`);
  lines.push(`Rating,${analytics.trends.rating.current},${analytics.trends.rating.previous},${analytics.trends.rating.change > 0 ? '+' : ''}${analytics.trends.rating.change}%`);
  lines.push('');
  
  // Monthly Data Section
  lines.push('MONTHLY PERFORMANCE (Last 7 Months)');
  lines.push('Month,Events,Guests,Reviews,Wraps');
  analytics.monthlyData.forEach((month: any) => {
    lines.push(`${month.month},${month.events},${month.guests},${month.reviews},${month.wraps}`);
  });
  lines.push('');
  
  // Top Destinations Section
  if (analytics.topDestinations && analytics.topDestinations.length > 0) {
    lines.push('TOP DESTINATIONS');
    lines.push('Destination,Events,Rating,Guests');
    analytics.topDestinations.forEach((dest: any) => {
      lines.push(`"${dest.name}",${dest.events},${dest.rating.toFixed(1)},${dest.guests}`);
    });
    lines.push('');
  }
  
  // Recent Activity Section
  if (analytics.recentActivity && analytics.recentActivity.length > 0) {
    lines.push('RECENT ACTIVITY');
    lines.push('Type,Guest/Event,Details,Time');
    analytics.recentActivity.forEach((activity: any) => {
      if (activity.type === 'review') {
        lines.push(`Review,"${activity.guest}","${activity.event} - ${activity.rating} stars",${activity.time}`);
      } else if (activity.type === 'wrap') {
        lines.push(`Wrap,"${activity.guest}","${activity.event} - ${activity.shares} shares",${activity.time}`);
      } else if (activity.type === 'event') {
        lines.push(`Event,"${activity.name}","${activity.guests} guests",${activity.time}`);
      }
    });
    lines.push('');
  }
  
  // Achievements Section
  if (analytics.achievements && analytics.achievements.length > 0) {
    lines.push('ACHIEVEMENTS & GOALS');
    lines.push('Achievement,Description,Progress (%),Status');
    analytics.achievements.forEach((achievement: any) => {
      lines.push(`"${achievement.title}","${achievement.description}",${achievement.progress},"${achievement.status}"`);
    });
  }
  
  return lines.join('\n');
}

function generateGuestDataCSV(data: any): string {
  const lines: string[] = [];
  
  // Header
  lines.push('SafariWrap Guest Data Export');
  lines.push(`Generated: ${new Date().toLocaleString()}`);
  lines.push('');
  
  // Guest Reviews
  lines.push('GUEST REVIEWS');
  lines.push('Guest Name,Email,Event,Rating,Review Date,Review Text');
  
  if (data.reviews && data.reviews.length > 0) {
    data.reviews.forEach((review: any) => {
      const reviewText = (review.review_text || '').replace(/"/g, '""').replace(/\n/g, ' ');
      const email = review.email || 'N/A';
      const eventTitle = review.event_title || 'Unknown Event';
      const reviewDate = new Date(review.created_at).toLocaleDateString();
      
      lines.push(`"${review.guest_name}","${email}","${eventTitle}",${review.star_rating},"${reviewDate}","${reviewText}"`);
    });
  } else {
    lines.push('No reviews found');
  }
  
  return lines.join('\n');
}