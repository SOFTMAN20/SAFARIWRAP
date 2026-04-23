'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { 
  Menu, 
  Search, 
  Bell, 
  Plus,
  MessageSquare,
  Star,
  Calendar,
  X,
  HelpCircle,
  ChevronLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';

const supabase = createClient();

interface DashboardHeaderProps {
  onMenuClick: () => void;
  title?: string;
}

interface Notification {
  id: string;
  type: 'review' | 'wrap' | 'event' | 'system';
  title: string;
  message: string;
  event_id?: string;
  event_title?: string;
  read: boolean;
  created_at: string;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ 
  onMenuClick, 
  title = "Dashboard" 
}) => {
  const router = useRouter();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Fetch real notifications from recent activity
  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      // Get recent reviews (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: reviews } = await supabase
        .from('reviews')
        .select('id, guest_name, star_rating, created_at, event_id, events(title)')
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(10);

      // Get recent wraps
      const { data: wraps } = await supabase
        .from('wraps')
        .select('id, guest_name, created_at, event_id, events(title)')
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(10);

      // Get upcoming events (next 7 days)
      const sevenDaysLater = new Date();
      sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);

      const { data: upcomingEvents } = await supabase
        .from('events')
        .select('id, title, start_date, type')
        .eq('operator_id', user.id)
        .eq('status', 'upcoming')
        .gte('start_date', new Date().toISOString().split('T')[0])
        .lte('start_date', sevenDaysLater.toISOString().split('T')[0])
        .order('start_date', { ascending: true })
        .limit(5);

      // Transform to notifications
      const notificationsList: Notification[] = [];

      // Add review notifications
      reviews?.forEach((review: any) => {
        notificationsList.push({
          id: `review-${review.id}`,
          type: 'review',
          title: 'New Review Received',
          message: `${review.guest_name} left a ${review.star_rating}-star review`,
          event_id: review.event_id,
          event_title: review.events?.title,
          read: false,
          created_at: review.created_at,
        });
      });

      // Add wrap notifications
      wraps?.forEach((wrap: any) => {
        notificationsList.push({
          id: `wrap-${wrap.id}`,
          type: 'wrap',
          title: 'Wrap Generated',
          message: `Wrap created for ${wrap.guest_name}`,
          event_id: wrap.event_id,
          event_title: wrap.events?.title,
          read: false,
          created_at: wrap.created_at,
        });
      });

      // Add upcoming event notifications
      upcomingEvents?.forEach((event: any) => {
        const daysUntil = Math.ceil((new Date(event.start_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        notificationsList.push({
          id: `event-${event.id}`,
          type: 'event',
          title: 'Upcoming Event',
          message: `${event.title} starts in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}`,
          event_id: event.id,
          event_title: event.title,
          read: false,
          created_at: event.start_date,
        });
      });

      // Sort by date
      return notificationsList.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: !!user?.id,
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  // Real-time search functionality
  const { data: searchData } = useQuery({
    queryKey: ['search', searchQuery, user?.id],
    queryFn: async () => {
      if (!searchQuery.trim() || !user?.id) return { events: [], reviews: [], wraps: [] };

      const query = searchQuery.toLowerCase();

      // Search events
      const { data: events } = await supabase
        .from('events')
        .select('id, title, type, start_date, status')
        .eq('operator_id', user.id)
        .or(`title.ilike.%${query}%,location.ilike.%${query}%`)
        .limit(5);

      // Search reviews by guest name
      const { data: reviews } = await supabase
        .from('reviews')
        .select('id, guest_name, star_rating, created_at, event_id, events(title)')
        .ilike('guest_name', `%${query}%`)
        .limit(5);

      // Search wraps
      const { data: wraps } = await supabase
        .from('wraps')
        .select('id, guest_name, created_at, event_id, events(title)')
        .ilike('guest_name', `%${query}%`)
        .limit(5);

      return {
        events: events || [],
        reviews: reviews || [],
        wraps: wraps || [],
      };
    },
    enabled: searchQuery.trim().length > 0 && !!user?.id,
    staleTime: 30 * 1000, // 30 seconds
  });

  // Update search results when data changes
  useEffect(() => {
    if (searchData) {
      const results = [
        ...searchData.events.map((e: any) => ({ ...e, resultType: 'event' })),
        ...searchData.reviews.map((r: any) => ({ ...r, resultType: 'review' })),
        ...searchData.wraps.map((w: any) => ({ ...w, resultType: 'wrap' })),
      ];
      setSearchResults(results);
      setShowSearchResults(results.length > 0 && searchQuery.trim().length > 0);
    }
  }, [searchData, searchQuery]);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (value.trim().length === 0) {
      setShowSearchResults(false);
      setSearchResults([]);
    }
  };

  // Handle search result click
  const handleSearchResultClick = (result: any) => {
    setShowSearchResults(false);
    setSearchQuery('');
    
    if (result.resultType === 'event') {
      router.push(`/trip/${result.id}`);
    } else if (result.resultType === 'review') {
      router.push(`/trip/${result.event_id}`);
    } else if (result.resultType === 'wrap') {
      router.push(`/wrap/${result.id}`);
    }
  };

  // Handle notification click
  const handleNotificationClick = (notification: Notification) => {
    if (notification.event_id) {
      router.push(`/trip/${notification.event_id}`);
    }
  };

  // Get notification icon
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'review':
        return <MessageSquare className="w-4 h-4 text-forest" />;
      case 'wrap':
        return <Star className="w-4 h-4 text-accent" />;
      case 'event':
        return <Calendar className="w-4 h-4 text-blue-500" />;
      default:
        return <Bell className="w-4 h-4 text-stone" />;
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-dust bg-white/80 backdrop-blur-xl">
      <div className="flex h-16 items-center gap-4 px-4 sm:px-6 lg:px-8">
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuClick}
        >
          <Menu className="w-5 h-5" />
        </Button>

        {/* Back Button (Mobile) */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden text-stone hover:text-forest"
          onClick={() => router.back()}
          title="Go back"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>

        {/* Back Button (Desktop) */}
        <Button
          variant="ghost"
          size="icon"
          className="hidden lg:flex text-stone hover:text-forest"
          onClick={() => router.back()}
          title="Go back"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>

        {/* Page Title (Mobile) */}
        <h1 className="text-lg font-bold text-forest lg:hidden">{title}</h1>

        {/* Search Bar (Desktop) */}
        <div className="hidden lg:flex flex-1 max-w-md relative">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone" />
            <Input
              type="search"
              placeholder="Search events, guests, wraps..."
              className="pl-10 bg-parchment border-dust focus:border-forest"
              value={searchQuery}
              onChange={handleSearchChange}
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                onClick={() => {
                  setSearchQuery('');
                  setShowSearchResults(false);
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Search Results Dropdown */}
          {showSearchResults && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-dust rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">
              {searchResults.length === 0 ? (
                <div className="p-4 text-center text-stone">
                  No results found for "{searchQuery}"
                </div>
              ) : (
                <div className="py-2">
                  {searchResults.map((result, index) => (
                    <button
                      key={`${result.resultType}-${result.id}`}
                      className="w-full px-4 py-3 hover:bg-parchment text-left flex items-start gap-3 transition-colors"
                      onClick={() => handleSearchResultClick(result)}
                    >
                      <div className="mt-1">
                        {result.resultType === 'event' && <Calendar className="w-4 h-4 text-forest" />}
                        {result.resultType === 'review' && <MessageSquare className="w-4 h-4 text-blue-500" />}
                        {result.resultType === 'wrap' && <Star className="w-4 h-4 text-accent" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-ink truncate">
                          {result.title || result.guest_name}
                        </p>
                        <p className="text-xs text-stone truncate">
                          {result.resultType === 'event' && `${result.type} • ${result.status}`}
                          {result.resultType === 'review' && `Review • ${result.star_rating} stars`}
                          {result.resultType === 'wrap' && `Wrap • ${result.events?.title || 'Event'}`}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Actions */}
        <div className="ml-auto flex items-center gap-2">
          {/* Search Button (Mobile) */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => router.push('/search')}
          >
            <Search className="w-5 h-5" />
          </Button>

          {/* Help */}
          <Button
            variant="ghost"
            size="icon"
            className="hidden sm:flex"
            onClick={() => router.push('/help')}
          >
            <HelpCircle className="w-5 h-5" />
          </Button>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs">
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel className="flex items-center justify-between">
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <Badge variant="secondary">{unreadCount} new</Badge>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-stone">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No notifications yet</p>
                </div>
              ) : (
                <>
                  {notifications.slice(0, 5).map((notification) => (
                    <DropdownMenuItem 
                      key={notification.id} 
                      className="flex items-start gap-3 p-3 cursor-pointer"
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${!notification.read ? 'font-semibold' : ''}`}>
                          {notification.title}
                        </p>
                        <p className="text-xs text-stone truncate">
                          {notification.message}
                        </p>
                        <p className="text-xs text-stone mt-1">
                          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 rounded-full bg-forest flex-shrink-0 mt-2" />
                      )}
                    </DropdownMenuItem>
                  ))}
                  
                  {notifications.length > 5 && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-center text-sm text-forest font-semibold justify-center"
                        onClick={() => router.push('/notifications')}
                      >
                        View all {notifications.length} notifications
                      </DropdownMenuItem>
                    </>
                  )}
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Create Event Button */}
          <Button 
            className="bg-forest hover:bg-forest/90 text-white hidden sm:flex"
            onClick={() => router.push('/create-trip')}
          >
            <Plus className="w-4 h-4 mr-2" />
            <span className="hidden md:inline">Create Event</span>
            <span className="md:hidden">New</span>
          </Button>

          {/* Mobile Create Button */}
          <Button 
            size="icon"
            className="sm:hidden bg-forest hover:bg-forest/90 text-white"
            onClick={() => router.push('/create-trip')}
          >
            <Plus className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};
