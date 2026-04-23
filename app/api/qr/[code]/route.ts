import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const supabase = createClient();
    const { code } = params;

    // Look up QR code by short_code
    const { data: qrCode, error } = await supabase
      .from('qr_codes')
      .select(`
        *,
        events (
          id,
          title,
          type,
          location,
          start_date,
          end_date,
          status,
          metadata,
          operators (
            business_name,
            brand_color_1,
            brand_color_2,
            logo_url
          )
        )
      `)
      .eq('short_code', code)
      .maybeSingle();

    if (error) {
      console.error('QR lookup error:', error);
      return NextResponse.json(
        { error: 'Failed to lookup QR code' },
        { status: 500 }
      );
    }

    if (!qrCode) {
      return NextResponse.json(
        { error: 'QR code not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: qrCode });
  } catch (error) {
    console.error('QR lookup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}