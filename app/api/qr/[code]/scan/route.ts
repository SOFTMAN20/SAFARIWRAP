import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const supabase = createClient();
    const { code } = params;

    // Get client IP for unique scan tracking
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown';

    // Increment scan count
    const { data: qrCode, error: updateError } = await supabase
      .from('qr_codes')
      .update({
        scans_count: supabase.raw('scans_count + 1')
      })
      .eq('short_code', code)
      .select()
      .single();

    if (updateError) {
      console.error('Scan tracking error:', updateError);
      return NextResponse.json(
        { error: 'Failed to track scan' },
        { status: 500 }
      );
    }

    // For unique scans, we could implement IP tracking in a separate table
    // For now, we'll just increment unique_scans_count as well
    await supabase
      .from('qr_codes')
      .update({
        unique_scans_count: supabase.raw('unique_scans_count + 1')
      })
      .eq('short_code', code);

    return NextResponse.json({ 
      data: { 
        scans_count: qrCode.scans_count,
        message: 'Scan tracked successfully' 
      } 
    });
  } catch (error) {
    console.error('Scan tracking error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}