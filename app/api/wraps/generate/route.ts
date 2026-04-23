import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { review_id } = await request.json();

    console.log('🎨 Wrap generation started for review:', review_id);

    if (!review_id) {
      return NextResponse.json(
        { error: 'review_id is required' },
        { status: 400 }
      );
    }

    // Create Supabase client
    const supabase = await createClient();

    // Fetch review with event and operator data
    console.log('📊 Fetching review data...');
    const { data: review, error: reviewError } = await supabase
      .from('reviews')
      .select(`
        *,
        events (
          id,
          title,
          location,
          type,
          start_date,
          end_date,
          metadata,
          operators (
            id,
            business_name,
            logo_url,
            brand_color_1,
            brand_color_2
          )
        )
      `)
      .eq('id', review_id)
      .single();

    if (reviewError || !review) {
      console.error('❌ Review not found:', reviewError);
      return NextResponse.json(
        { error: 'Review not found', details: reviewError?.message },
        { status: 404 }
      );
    }

    console.log('✅ Review found:', {
      guest_name: review.guest_name,
      event_id: review.event_id,
      event_type: review.events?.type,
    });

    // Calculate environmental impact based on review count
    console.log('🌳 Calculating environmental impact...');
    const { data: reviewCount } = await supabase
      .from('reviews')
      .select('id', { count: 'exact', head: true })
      .eq('event_id', review.event_id);

    const totalReviews = reviewCount || 0;
    let treesPlanted = 1;
    if (totalReviews >= 26) treesPlanted = 3;
    else if (totalReviews >= 11) treesPlanted = 2;

    const co2OffsetKg = treesPlanted * 22; // 22kg CO2 per tree per year

    console.log('🌳 Environmental impact:', {
      totalReviews,
      treesPlanted,
      co2OffsetKg,
    });

    // Prepare wrap data
    const wrapData = {
      guest_name: review.guest_name,
      event_title: review.events?.title || 'Experience',
      event_location: review.events?.location || 'Location',
      event_type: review.events?.type || 'safari',
      guest_rating: review.rating || review.star_rating || 5,
      guest_review: review.comment || review.review_text || '',
      memorable_moment: review.memorable_moment || '',
      guest_photos: review.photo_urls || [],
      operator: {
        business_name: review.events?.operators?.business_name || 'SafariWrap',
        logo_url: review.events?.operators?.logo_url || null,
        brand_color_1: review.events?.operators?.brand_color_1 || '#1B4D3E',
        brand_color_2: review.events?.operators?.brand_color_2 || '#F4C542',
      },
      safari_data: review.events?.type === 'safari' ? {
        big_five_seen: review.big_five_seen?.split(',').map((s: string) => s.trim()).filter(Boolean) || [],
        other_animals: review.other_animals?.split(',').map((s: string) => s.trim()).filter(Boolean) || [],
        total_species: (() => {
          const bigFive = review.big_five_seen?.split(',').filter(Boolean).length || 0;
          const others = review.other_animals?.split(',').filter(Boolean).length || 0;
          return bigFive + others;
        })(),
        best_time: review.best_time || '',
      } : null,
      marathon_data: review.events?.type === 'marathon' ? {
        finish_time: review.metadata?.finish_time || '',
        pace_per_km: review.metadata?.pace_per_km || '',
        difficulty_rating: review.metadata?.difficulty_rating || 3,
      } : null,
      tour_data: review.events?.type === 'tour' ? {
        favorite_location: review.metadata?.favorite_location || '',
        guide_rating: review.metadata?.guide_rating || 5,
      } : null,
      environmental_impact: {
        trees_planted: treesPlanted,
        co2_offset_kg: co2OffsetKg,
        gps_location: '1.2858° S, 36.8219° E', // Kilimanjaro region
      },
      stats: {
        total_photos: review.photo_urls?.length || 0,
      },
    };

    // Create wrap in database
    console.log('💾 Creating wrap in database...');
    const { data: wrap, error: wrapError } = await supabase
      .from('wraps')
      .insert({
        review_id: review.id,
        event_id: review.event_id,
        guest_name: review.guest_name,
        data: wrapData,
      })
      .select()
      .single();

    if (wrapError) {
      console.error('❌ Failed to create wrap:', {
        error: wrapError,
        code: wrapError.code,
        message: wrapError.message,
        details: wrapError.details,
      });
      return NextResponse.json(
        { error: 'Failed to create wrap', details: wrapError.message },
        { status: 500 }
      );
    }

    console.log('✅ Wrap created successfully:', {
      id: wrap.id,
      share_token: wrap.share_token,
      guest_name: wrap.guest_name,
    });

    return NextResponse.json({
      success: true,
      data: wrap,
      message: 'Wrap generated successfully',
    });

  } catch (error: any) {
    console.error('❌ Wrap generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
