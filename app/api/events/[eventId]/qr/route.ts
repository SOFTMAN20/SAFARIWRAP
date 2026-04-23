import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateQRCodeForEvent, generateQRImageUrl } from '@/lib/qr-generator';

export async function GET(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const supabase = createClient();
    const { eventId } = params;

    // Check authentication
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify user owns this event
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('operator_id')
      .eq('id', eventId)
      .maybeSingle();

    if (eventError || !event) {
      return NextResponse.json(
        { error: 'Event not found' },
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
    const isOwner = event.operator_id === session.user.id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Get or generate QR code
    const { data: existingQR } = await supabase
      .from('qr_codes')
      .select('*')
      .eq('event_id', eventId)
      .maybeSingle();

    let qrCode = existingQR;

    if (!qrCode) {
      const result = await generateQRCodeForEvent(eventId);
      if (!result.success) {
        return NextResponse.json(
          { error: result.error },
          { status: 500 }
        );
      }
      qrCode = result.data;
    }

    // Generate QR image URL
    const imageUrl = generateQRImageUrl(qrCode.code_url);

    return NextResponse.json({
      data: {
        qrCode,
        imageUrl,
        reviewUrl: qrCode.code_url
      }
    });

  } catch (error) {
    console.error('QR generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const supabase = createClient();
    const { eventId } = params;

    // Check authentication
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify user owns this event
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('operator_id')
      .eq('id', eventId)
      .maybeSingle();

    if (eventError || !event) {
      return NextResponse.json(
        { error: 'Event not found' },
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
    const isOwner = event.operator_id === session.user.id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Force regenerate QR code
    const result = await generateQRCodeForEvent(eventId);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    const imageUrl = generateQRImageUrl(result.data.code_url);

    return NextResponse.json({
      data: {
        qrCode: result.data,
        imageUrl,
        reviewUrl: result.data.code_url
      }
    });

  } catch (error) {
    console.error('QR regeneration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}