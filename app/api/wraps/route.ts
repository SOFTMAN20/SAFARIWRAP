import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event_id');

    if (!eventId) {
      return NextResponse.json(
        { error: 'event_id is required' },
        { status: 400 }
      );
    }

    // Fetch all wraps for the event
    const { data: wraps, error } = await supabase
      .from('wraps')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch wraps:', error);
      return NextResponse.json(
        { error: 'Failed to fetch wraps' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: wraps,
      count: wraps?.length || 0,
    });

  } catch (error) {
    console.error('Wraps list error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
