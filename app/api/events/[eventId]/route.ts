import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const supabase = createClient();
    const { eventId } = params;

    // Get event with operator details
    const { data: event, error } = await supabase
      .from('events')
      .select(`
        *,
        operators (
          business_name,
          brand_color_1,
          brand_color_2,
          logo_url
        )
      `)
      .eq('id', eventId)
      .maybeSingle();

    if (error) {
      console.error('Event lookup error:', error);
      return NextResponse.json(
        { error: 'Failed to lookup event' },
        { status: 500 }
      );
    }

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Flatten operator data
    const eventWithOperator = {
      ...event,
      operator: event.operators
    };
    delete eventWithOperator.operators;

    return NextResponse.json({ data: eventWithOperator });
  } catch (error) {
    console.error('Event lookup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}