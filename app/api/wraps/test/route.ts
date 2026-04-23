import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get the latest review without a wrap
    const { data: reviews, error: reviewError } = await supabase
      .from('reviews')
      .select('id, guest_name, event_id, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    if (reviewError) {
      return NextResponse.json(
        { error: 'Failed to fetch reviews', details: reviewError.message },
        { status: 500 }
      );
    }

    // Check which reviews have wraps
    const reviewsWithWrapStatus = await Promise.all(
      (reviews || []).map(async (review) => {
        const { data: wrap } = await supabase
          .from('wraps')
          .select('id, created_at')
          .eq('review_id', review.id)
          .single();

        return {
          ...review,
          has_wrap: !!wrap,
          wrap_id: wrap?.id || null,
        };
      })
    );

    return NextResponse.json({
      success: true,
      reviews: reviewsWithWrapStatus,
      message: 'Latest reviews with wrap status',
    });

  } catch (error: any) {
    console.error('Test endpoint error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
