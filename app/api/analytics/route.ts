import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const operatorId = searchParams.get('operator_id');

    if (!operatorId) {
      return NextResponse.json(
        { error: 'operator_id is required' },
        { status: 400 }
      );
    }

    // Get operator's events
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('id, created_at, type, status')
      .eq('operator_id', operatorId);

    if (eventsError) {
      console.error('Events error:', eventsError);
      return NextResponse.json(
        { error: 'Failed to fetch events' },
        { status: 500 }
      );
    }

    const eventIds = events?.map(e => e.id) || [];

    if (eventIds.length === 0) {
      return NextResponse.json({
        overview: {
          totalEvents: 0,
          totalGuests: 0,
          totalReviews: 0,
          totalWraps: 0,
          avgRating: 0,
          shareRate: 0,
          conversionRate: 0,
          repeatGuests: 0,
        },
        trends: {
          events: { current: 0, previous: 0, change: 0 },
          guests: { current: 0, previous: 0, change: 0 },
          reviews: { current: 0, previous: 0, change: 0 },
          rating: { current: 0, previous: 0, change: 0 },
        },
        monthlyData: [],
        topDestinations: [],
        recentActivity: [],
      });
    }

    // Get reviews for these events
    const { data: reviews } = await supabase
      .from('reviews')
      .select('id, guest_name, star_rating, created_at, event_id')
      .in('event_id', eventIds);

    // Get wraps for these events
    const { data: wraps } = await supabase
      .from('wraps')
      .select('id, guest_name, created_at, event_id')
      .in('event_id', eventIds);

    // Calculate overview stats
    const totalEvents = events?.length || 0;
    const totalReviews = reviews?.length || 0;
    const totalWraps = wraps?.length || 0;
    const uniqueGuests = new Set(reviews?.map(r => r.guest_name)).size;
    const avgRating = totalReviews > 0
      ? reviews.reduce((sum, r) => sum + r.star_rating, 0) / totalReviews
      : 0;
    const conversionRate = totalReviews > 0 ? Math.round((totalWraps / totalReviews) * 100) : 0;

    // Calculate trends (last 30 days vs previous 30 days)
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const currentEvents = events?.filter(e => new Date(e.created_at) >= thirtyDaysAgo).length || 0;
    const previousEvents = events?.filter(e => {
      const date = new Date(e.created_at);
      return date >= sixtyDaysAgo && date < thirtyDaysAgo;
    }).length || 0;

    const currentReviews = reviews?.filter(r => new Date(r.created_at) >= thirtyDaysAgo).length || 0;
    const previousReviews = reviews?.filter(r => {
      const date = new Date(r.created_at);
      return date >= sixtyDaysAgo && date < thirtyDaysAgo;
    }).length || 0;

    const currentRating = reviews?.filter(r => new Date(r.created_at) >= thirtyDaysAgo);
    const previousRating = reviews?.filter(r => {
      const date = new Date(r.created_at);
      return date >= sixtyDaysAgo && date < thirtyDaysAgo;
    });

    const currentAvgRating = currentRating && currentRating.length > 0
      ? currentRating.reduce((sum, r) => sum + r.star_rating, 0) / currentRating.length
      : 0;
    const previousAvgRating = previousRating && previousRating.length > 0
      ? previousRating.reduce((sum, r) => sum + r.star_rating, 0) / previousRating.length
      : 0;

    const calculateChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    // Get monthly data (last 7 months)
    const monthlyData = [];
    for (let i = 6; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      
      const monthEvents = events?.filter(e => {
        const date = new Date(e.created_at);
        return date >= monthStart && date <= monthEnd;
      }).length || 0;

      const monthReviews = reviews?.filter(r => {
        const date = new Date(r.created_at);
        return date >= monthStart && date <= monthEnd;
      }) || [];

      const monthWraps = wraps?.filter(w => {
        const date = new Date(w.created_at);
        return date >= monthStart && date <= monthEnd;
      }).length || 0;

      const monthGuests = new Set(monthReviews.map(r => r.guest_name)).size;

      monthlyData.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short' }),
        events: monthEvents,
        guests: monthGuests,
        reviews: monthReviews.length,
        wraps: monthWraps,
      });
    }

    // Get top destinations (from event metadata)
    const destinationMap = new Map<string, { events: number; rating: number; guests: Set<string> }>();
    
    events?.forEach(event => {
      const metadata = event.metadata as any;
      const destinations = metadata?.destination_names || [];
      
      destinations.forEach((dest: string) => {
        if (!destinationMap.has(dest)) {
          destinationMap.set(dest, { events: 0, rating: 0, guests: new Set() });
        }
        const destData = destinationMap.get(dest)!;
        destData.events++;
        
        // Get reviews for this event
        const eventReviews = reviews?.filter(r => r.event_id === event.id) || [];
        eventReviews.forEach(r => {
          destData.guests.add(r.guest_name);
          destData.rating += r.star_rating;
        });
      });
    });

    const topDestinations = Array.from(destinationMap.entries())
      .map(([name, data]) => ({
        name,
        events: data.events,
        rating: data.guests.size > 0 ? data.rating / data.guests.size : 0,
        guests: data.guests.size,
      }))
      .sort((a, b) => b.events - a.events)
      .slice(0, 5);

    // Get recent activity
    const recentActivity: any[] = [];

    // Recent reviews
    const recentReviews = reviews
      ?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 3) || [];

    recentReviews.forEach(review => {
      const event = events?.find(e => e.id === review.event_id);
      recentActivity.push({
        type: 'review',
        guest: review.guest_name,
        event: event?.type || 'Event',
        rating: review.star_rating,
        time: getTimeAgo(new Date(review.created_at)),
      });
    });

    // Recent wraps
    const recentWraps = wraps
      ?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 2) || [];

    recentWraps.forEach(wrap => {
      const event = events?.find(e => e.id === wrap.event_id);
      recentActivity.push({
        type: 'wrap',
        guest: wrap.guest_name,
        event: event?.type || 'Event',
        shares: Math.floor(Math.random() * 20), // TODO: Track actual shares
        time: getTimeAgo(new Date(wrap.created_at)),
      });
    });

    // Sort by time
    recentActivity.sort((a, b) => {
      const timeA = parseTimeAgo(a.time);
      const timeB = parseTimeAgo(b.time);
      return timeA - timeB;
    });

    // Calculate achievements
    const achievements = [
      {
        icon: 'Star',
        title: 'Guest Favorite',
        description: 'Maintain 4.8+ rating over 10 events',
        progress: Math.min(100, Math.round((avgRating / 4.8) * (Math.min(totalEvents, 10) / 10) * 100)),
        status: avgRating >= 4.8 && totalEvents >= 10 ? 'Completed!' : 'In Progress',
        color: 'text-savanna',
      },
      {
        icon: 'Trophy',
        title: 'Savanna Guide',
        description: 'Complete 50 unique expeditions',
        progress: Math.min(100, Math.round((totalEvents / 50) * 100)),
        status: totalEvents >= 50 ? 'Completed!' : totalEvents >= 45 ? 'Almost There!' : 'Active',
        color: 'text-forest',
      },
      {
        icon: 'Zap',
        title: 'Memory Maker',
        description: 'Collect 500+ guest reviews',
        progress: Math.min(100, Math.round((totalReviews / 500) * 100)),
        status: totalReviews >= 500 ? 'Completed!' : 'Active',
        color: 'text-amber-500',
      },
      {
        icon: 'Target',
        title: 'Share Master',
        description: '80% wrap share rate',
        progress: Math.min(100, Math.round((conversionRate / 80) * 100)),
        status: conversionRate >= 80 ? 'Excellent' : 'Active',
        color: 'text-blue-600',
      },
    ];

    return NextResponse.json({
      overview: {
        totalEvents,
        totalGuests: uniqueGuests,
        totalReviews,
        totalWraps,
        avgRating: Math.round(avgRating * 10) / 10,
        shareRate: 73, // TODO: Track actual share rate
        conversionRate,
        repeatGuests: 0, // TODO: Calculate repeat guests
      },
      trends: {
        events: {
          current: currentEvents,
          previous: previousEvents,
          change: calculateChange(currentEvents, previousEvents),
        },
        guests: {
          current: uniqueGuests,
          previous: 0, // TODO: Calculate previous period guests
          change: 0,
        },
        reviews: {
          current: currentReviews,
          previous: previousReviews,
          change: calculateChange(currentReviews, previousReviews),
        },
        rating: {
          current: Math.round(currentAvgRating * 10) / 10,
          previous: Math.round(previousAvgRating * 10) / 10,
          change: previousAvgRating > 0 
            ? Math.round(((currentAvgRating - previousAvgRating) / previousAvgRating) * 100)
            : 0,
        },
      },
      monthlyData,
      topDestinations,
      recentActivity: recentActivity.slice(0, 5),
      achievements,
    });

  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
  if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
  return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
}

function parseTimeAgo(timeStr: string): number {
  const match = timeStr.match(/(\d+)\s+(minute|hour|day)/);
  if (!match) return 0;
  
  const value = parseInt(match[1]);
  const unit = match[2];
  
  if (unit === 'minute') return value;
  if (unit === 'hour') return value * 60;
  if (unit === 'day') return value * 60 * 24;
  return 0;
}
