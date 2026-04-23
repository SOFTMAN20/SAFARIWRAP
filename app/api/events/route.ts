import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { validateEventMetadata, type EventType } from '@/lib/types/events';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const body = await request.json();

    const {
      operator_id,
      type,
      title,
      location,
      start_date,
      end_date,
      status = 'upcoming',
      metadata = {},
    } = body;

    // Validate required fields
    if (!operator_id || !type || !title || !location || !start_date || !end_date) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate event type
    const validTypes: EventType[] = ['safari', 'marathon', 'tour'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Invalid event type' },
        { status: 400 }
      );
    }

    // Validate type-specific metadata
    if (!validateEventMetadata(type, metadata)) {
      return NextResponse.json(
        { error: `Invalid metadata for ${type} event` },
        { status: 400 }
      );
    }

    // Create event
    const { data: event, error } = await supabase
      .from('events')
      .insert({
        operator_id,
        type,
        title,
        location,
        start_date,
        end_date,
        status,
        metadata,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create event:', error);
      return NextResponse.json(
        { error: 'Failed to create event' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: event,
      message: 'Event created successfully'
    });

  } catch (error) {
    console.error('Event creation error:', error);
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
    
    const operatorId = searchParams.get('operator_id');
    const type = searchParams.get('type');
    const status = searchParams.get('status');

    let query = supabase
      .from('events')
      .select('*')
      .order('start_date', { ascending: false });

    if (operatorId) {
      query = query.eq('operator_id', operatorId);
    }

    if (type) {
      query = query.eq('type', type);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data: events, error } = await query;

    if (error) {
      console.error('Failed to fetch events:', error);
      return NextResponse.json(
        { error: 'Failed to fetch events' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: events,
      count: events?.length || 0,
    });

  } catch (error) {
    console.error('Events fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}