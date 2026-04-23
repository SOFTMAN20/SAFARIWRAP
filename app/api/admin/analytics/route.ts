import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = createClient();

    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get overview stats
    const [
      { count: totalOperators },
      { count: totalEvents },
      { count: totalReviews },
      { count: totalWraps },
      { data: treeActivities },
      { data: reviews },
    ] = await Promise.all([
      supabase.from('operators').select('*', { count: 'exact', head: true }),
      supabase.from('events').select('*', { count: 'exact', head: true }),
      supabase.from('reviews').select('*', { count: 'exact', head: true }),
      supabase.from('wraps').select('*', { count: 'exact', head: true }),
      supabase.from('tree_activities').select('trees_planted'),
      supabase.from('reviews').select('star_rating'),
    ]);

    const totalTreesPlanted = treeActivities?.reduce((sum, activity) => sum + activity.trees_planted, 0) || 0;
    const avgRating = reviews && reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.star_rating, 0) / reviews.length
      : 0;

    // Get growth stats (this month)
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [
      { count: operatorsThisMonth },
      { count: eventsThisMonth },
      { count: reviewsThisMonth },
      { count: wrapsThisMonth },
    ] = await Promise.all([
      supabase.from('operators').select('*', { count: 'exact', head: true }).gte('created_at', startOfMonth.toISOString()),
      supabase.from('events').select('*', { count: 'exact', head: true }).gte('created_at', startOfMonth.toISOString()),
      supabase.from('reviews').select('*', { count: 'exact', head: true }).gte('created_at', startOfMonth.toISOString()),
      supabase.from('wraps').select('*', { count: 'exact', head: true }).gte('created_at', startOfMonth.toISOString()),
    ]);

    // Get top operators
    const { data: topOperators } = await supabase
      .from('operators')
      .select(`
        id,
        business_name,
        events:events(count),
        reviews:events(reviews(star_rating))
      `)
      .limit(5);

    const topOperatorsFormatted = topOperators?.map(op => {
      const eventsCount = Array.isArray(op.events) ? op.events.length : 0;
      const allReviews = Array.isArray(op.reviews) 
        ? op.reviews.flatMap((e: any) => Array.isArray(e.reviews) ? e.reviews : [])
        : [];
      const reviewsCount = allReviews.length;
      const avgRating = reviewsCount > 0
        ? allReviews.reduce((sum: number, r: any) => sum + (r.star_rating || 0), 0) / reviewsCount
        : 0;

      return {
        id: op.id,
        business_name: op.business_name,
        events_count: eventsCount,
        reviews_count: reviewsCount,
        avg_rating: avgRating,
      };
    }).sort((a, b) => b.events_count - a.events_count) || [];

    // Get events by type
    const { data: eventsByType } = await supabase
      .from('events')
      .select('type');

    const eventTypeCount = {
      safari: eventsByType?.filter(e => e.type === 'safari').length || 0,
      marathon: eventsByType?.filter(e => e.type === 'marathon').length || 0,
      tour: eventsByType?.filter(e => e.type === 'tour').length || 0,
    };

    // Get reviews by rating
    const reviewsByRating = [1, 2, 3, 4, 5].map(rating => ({
      rating,
      count: reviews?.filter(r => r.star_rating === rating).length || 0,
    }));

    return NextResponse.json({
      overview: {
        totalOperators: totalOperators || 0,
        totalEvents: totalEvents || 0,
        totalReviews: totalReviews || 0,
        totalWraps: totalWraps || 0,
        totalTreesPlanted,
        avgRating,
      },
      growth: {
        operatorsThisMonth: operatorsThisMonth || 0,
        eventsThisMonth: eventsThisMonth || 0,
        reviewsThisMonth: reviewsThisMonth || 0,
        wrapsThisMonth: wrapsThisMonth || 0,
      },
      topOperators: topOperatorsFormatted,
      eventsByType: eventTypeCount,
      reviewsByRating,
    });

  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
