import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { wrapId: string } }
) {
  try {
    const supabase = createClient();
    const { wrapId } = params;

    // Get wrap with event and operator details
    const { data: wrap, error } = await supabase
      .from('wraps')
      .select(`
        *,
        events (
          id,
          title,
          type,
          location,
          start_date,
          end_date,
          operators (
            business_name,
            brand_color_1,
            brand_color_2,
            logo_url
          )
        )
      `)
      .eq('id', wrapId)
      .maybeSingle();

    if (error) {
      console.error('Wrap fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch wrap' },
        { status: 500 }
      );
    }

    if (!wrap) {
      return NextResponse.json(
        { error: 'Wrap not found' },
        { status: 404 }
      );
    }

    // Flatten the structure for easier access
    const wrapData = {
      ...wrap,
      event: wrap.events,
      operator: wrap.events?.operators,
    };
    delete wrapData.events;

    return NextResponse.json({ data: wrapData });

  } catch (error) {
    console.error('Wrap fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { wrapId: string } }
) {
  try {
    const supabase = createClient();
    const { wrapId } = params;

    // Check authentication
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get wrap to verify ownership
    const { data: wrap } = await supabase
      .from('wraps')
      .select(`
        *,
        events (
          operator_id
        )
      `)
      .eq('id', wrapId)
      .maybeSingle();

    if (!wrap) {
      return NextResponse.json(
        { error: 'Wrap not found' },
        { status: 404 }
      );
    }

    // Check if user is the operator or admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    const isAdmin = profile?.role === 'admin';
    const isOwner = wrap.events?.operator_id === session.user.id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Delete wrap
    const { error: deleteError } = await supabase
      .from('wraps')
      .delete()
      .eq('id', wrapId);

    if (deleteError) {
      console.error('Wrap delete error:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete wrap' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Wrap deleted successfully'
    });

  } catch (error) {
    console.error('Wrap delete error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}