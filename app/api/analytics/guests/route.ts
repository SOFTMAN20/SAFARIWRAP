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
      .select('id, title, type')
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
        reviews: [],
      });
    }

    // Get reviews with event details
    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select('id, guest_name, email, star_rating, review_text, created_at, event_id')
      .in('event_id', eventIds)
      .order('created_at', { ascending: false });

    if (reviewsError) {
      console.error('Reviews error:', reviewsError);
      return NextResponse.json(
        { error: 'Failed to fetch reviews' },
        { status: 500 }
      );
    }

    // Enrich reviews with event titles
    const enrichedReviews = reviews?.map(review => {
      const event = events?.find(e => e.id === review.event_id);
      return {
        ...review,
        event_title: event?.title || 'Unknown Event',
        event_type: event?.type || 'unknown',
      };
    }) || [];

    return NextResponse.json({
      reviews: enrichedReviews,
    });

  } catch (error) {
    console.error('Guest data error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
