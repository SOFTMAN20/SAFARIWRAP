import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const body = await request.json();

    const {
      event_id,
      guest_name,
      email,
      star_rating,
      review_text,
      photo_urls, // Array of photo URLs (correct column name)
      big_five_seen,
      other_animals,
      safari_duration,
      best_time,
      memorable_moment,
      data_consent,
      marketing_consent,
      metadata = {}
    } = body;

    // Validate required fields
    if (!event_id || !guest_name || !star_rating) {
      return NextResponse.json(
        { error: 'Missing required fields: event_id, guest_name, star_rating' },
        { status: 400 }
      );
    }

    // Verify event exists
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, type')
      .eq('id', event_id)
      .maybeSingle();

    if (eventError || !event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Prepare metadata based on event type
    const reviewMetadata = {
      ...metadata,
      event_type: event.type,
    };

    // Add type-specific data to metadata
    if (event.type === 'safari') {
      reviewMetadata.safari_data = {
        big_five_seen,
        other_animals,
        safari_duration,
        best_time,
        memorable_moment,
      };
    } else if (event.type === 'marathon') {
      reviewMetadata.marathon_data = {
        distance: metadata.distance,
        time: metadata.time,
        pace: metadata.pace,
        checkpoints: metadata.checkpoints,
      };
    } else if (event.type === 'tour') {
      reviewMetadata.tour_data = {
        locations_visited: metadata.locations_visited,
        highlights: metadata.highlights,
        guide_rating: metadata.guide_rating,
      };
    }

    // Insert review
    const { data: review, error: insertError } = await supabase
      .from('reviews')
      .insert({
        event_id,
        guest_name,
        email,
        star_rating,
        review_text,
        photo_urls: photo_urls || [], // Array of photo URLs (correct column name)
        big_five_seen: big_five_seen || '',
        other_animals: other_animals || '',
        safari_duration,
        best_time,
        memorable_moment,
        data_consent: data_consent || false,
        marketing_consent: marketing_consent || false,
        metadata: reviewMetadata,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Review insert error:', insertError);
      return NextResponse.json(
        { error: 'Failed to create review' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      data: review,
      message: 'Review submitted successfully' 
    });

  } catch (error) {
    console.error('Review submission error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event_id');

    let query = supabase
      .from('reviews')
      .select(`
        *,
        events (
          id,
          title,
          type,
          location
        )
      `)
      .order('created_at', { ascending: false });

    if (eventId) {
      query = query.eq('event_id', eventId);
    }

    const { data: reviews, error } = await query;

    if (error) {
      console.error('Reviews fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch reviews' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: reviews });

  } catch (error) {
    console.error('Reviews fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}