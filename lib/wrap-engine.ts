import { createClient } from './supabase/client';
import { type EventType } from './types/events';

export interface WrapData {
  // Event Info
  event_id: string;
  event_type: EventType;
  event_title: string;
  event_location: string;
  event_dates: {
    start: string;
    end: string;
  };
  
  // Guest Info
  guest_name: string;
  guest_rating: number;
  guest_review: string;
  guest_photos: string[];
  
  // Aggregated Stats
  stats: {
    total_reviews: number;
    average_rating: number;
    total_photos: number;
    total_guests: number;
  };
  
  // Type-Specific Data
  safari_data?: {
    top_animal: string;
    total_species: number;
    big_five_count: number;
    big_five_seen: string[];
    other_animals: string[];
    species_breakdown: { name: string; count: number }[];
  };
  
  marathon_data?: {
    average_time: string;
    fastest_time: string;
    total_distance: number;
    average_pace: string;
  };
  
  tour_data?: {
    locations_visited: string[];
    top_highlight: string;
    average_guide_rating: number;
  };
  
  // Highlights
  highlights: {
    best_photo: string | null;
    memorable_moment: string | null;
    top_rated_aspect: string;
  };
  
  // Operator Branding
  operator: {
    business_name: string;
    brand_color_1: string;
    brand_color_2: string;
    logo_url: string | null;
  };
  
  // Environmental Impact
  environmental_impact: {
    trees_planted: number;
    co2_offset_kg: number;
  };
}

/**
 * Generate comprehensive wrap data from event and reviews
 */
export async function generateWrapData(
  eventId: string,
  guestName: string,
  reviewId?: string
): Promise<{ success: boolean; data?: WrapData; error?: string }> {
  try {
    const supabase = createClient();
    
    // 1. Get event details with operator
    const { data: event, error: eventError } = await supabase
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
    
    if (eventError || !event) {
      return { success: false, error: 'Event not found' };
    }
    
    // 2. Get all reviews for this event
    const { data: allReviews, error: reviewsError } = await supabase
      .from('reviews')
      .select('*')
      .eq('event_id', eventId);
    
    if (reviewsError) {
      return { success: false, error: 'Failed to fetch reviews' };
    }
    
    // 3. Get specific guest review
    let guestReview = null;
    if (reviewId) {
      const { data: review } = await supabase
        .from('reviews')
        .select('*')
        .eq('id', reviewId)
        .maybeSingle();
      guestReview = review;
    } else {
      // Find by guest name
      guestReview = allReviews?.find(r => r.guest_name === guestName) || null;
    }
    
    // 4. Calculate aggregated stats
    const totalReviews = allReviews?.length || 0;
    const averageRating = totalReviews > 0
      ? allReviews.reduce((sum, r) => sum + r.star_rating, 0) / totalReviews
      : 0;
    
    const totalPhotos = allReviews?.reduce((count, r) => {
      return count + [r.photo_1_url, r.photo_2_url, r.photo_3_url].filter(Boolean).length;
    }, 0) || 0;
    
    const uniqueGuests = new Set(allReviews?.map(r => r.guest_name) || []).size;
    
    // 5. Collect guest photos
    const guestPhotos = guestReview
      ? [guestReview.photo_1_url, guestReview.photo_2_url, guestReview.photo_3_url].filter(Boolean)
      : [];
    
    // 6. Generate type-specific data
    let typeSpecificData: any = {};
    
    if (event.type === 'safari') {
      typeSpecificData = await generateSafariData(allReviews || []);
    } else if (event.type === 'marathon') {
      typeSpecificData = await generateMarathonData(allReviews || []);
    } else if (event.type === 'tour') {
      typeSpecificData = await generateTourData(allReviews || []);
    }
    
    // 7. Find best photo (most common or first available)
    const allPhotos = allReviews?.flatMap(r => 
      [r.photo_1_url, r.photo_2_url, r.photo_3_url].filter(Boolean)
    ) || [];
    const bestPhoto = guestPhotos[0] || allPhotos[0] || null;
    
    // 8. Calculate environmental impact
    let treesPlanted = 1; // Default
    if (totalReviews >= 26) treesPlanted = 3;
    else if (totalReviews >= 11) treesPlanted = 2;
    
    const co2OffsetKg = treesPlanted * 22; // 22kg CO2 per tree per year
    
    // 9. Build wrap data
    const wrapData: WrapData = {
      event_id: eventId,
      event_type: event.type,
      event_title: event.title,
      event_location: event.location,
      event_dates: {
        start: event.start_date,
        end: event.end_date,
      },
      guest_name: guestName,
      guest_rating: guestReview?.star_rating || 0,
      guest_review: guestReview?.review_text || '',
      guest_photos: guestPhotos,
      stats: {
        total_reviews: totalReviews,
        average_rating: parseFloat(averageRating.toFixed(1)),
        total_photos: totalPhotos,
        total_guests: uniqueGuests,
      },
      ...typeSpecificData,
      highlights: {
        best_photo: bestPhoto,
        memorable_moment: guestReview?.memorable_moment || null,
        top_rated_aspect: averageRating >= 4.5 ? 'Exceptional Experience' : 'Great Experience',
      },
      operator: {
        business_name: event.operators.business_name,
        brand_color_1: event.operators.brand_color_1,
        brand_color_2: event.operators.brand_color_2,
        logo_url: event.operators.logo_url,
      },
      environmental_impact: {
        trees_planted: treesPlanted,
        co2_offset_kg: co2OffsetKg,
      },
    };
    
    return { success: true, data: wrapData };
    
  } catch (error) {
    console.error('Wrap generation error:', error);
    return { success: false, error: 'Failed to generate wrap data' };
  }
}

/**
 * Generate Safari-specific wrap data
 */
async function generateSafariData(reviews: any[]) {
  // Aggregate all animal sightings
  const animalCounts: { [key: string]: number } = {};
  const bigFiveSet = new Set<string>();
  const allAnimals = new Set<string>();
  
  reviews.forEach(review => {
    // Big Five
    const bigFive = review.big_five_seen?.split(',').map((a: string) => a.trim()).filter(Boolean) || [];
    bigFive.forEach((animal: string) => {
      bigFiveSet.add(animal);
      allAnimals.add(animal);
      animalCounts[animal] = (animalCounts[animal] || 0) + 1;
    });
    
    // Other animals
    const others = review.other_animals?.split(',').map((a: string) => a.trim()).filter(Boolean) || [];
    others.forEach((animal: string) => {
      allAnimals.add(animal);
      animalCounts[animal] = (animalCounts[animal] || 0) + 1;
    });
  });
  
  // Find top animal
  const sortedAnimals = Object.entries(animalCounts)
    .sort(([, a], [, b]) => b - a);
  
  const topAnimal = sortedAnimals[0]?.[0] || 'Wildlife';
  
  // Species breakdown (top 10)
  const speciesBreakdown = sortedAnimals
    .slice(0, 10)
    .map(([name, count]) => ({ name, count }));
  
  return {
    safari_data: {
      top_animal: topAnimal,
      total_species: allAnimals.size,
      big_five_count: bigFiveSet.size,
      big_five_seen: Array.from(bigFiveSet),
      other_animals: Array.from(allAnimals).filter(a => !bigFiveSet.has(a)),
      species_breakdown: speciesBreakdown,
    },
  };
}

/**
 * Generate Marathon-specific wrap data
 */
async function generateMarathonData(reviews: any[]) {
  const marathonReviews = reviews.filter(r => r.metadata?.marathon_data);
  
  if (marathonReviews.length === 0) {
    return {
      marathon_data: {
        average_time: 'N/A',
        fastest_time: 'N/A',
        total_distance: 0,
        average_pace: 'N/A',
      },
    };
  }
  
  const times = marathonReviews
    .map(r => r.metadata.marathon_data.time)
    .filter(Boolean);
  
  const distances = marathonReviews
    .map(r => parseFloat(r.metadata.marathon_data.distance))
    .filter(d => !isNaN(d));
  
  const totalDistance = distances.reduce((sum, d) => sum + d, 0);
  
  return {
    marathon_data: {
      average_time: times.length > 0 ? 'Calculated' : 'N/A',
      fastest_time: times.length > 0 ? times[0] : 'N/A',
      total_distance: totalDistance,
      average_pace: 'Calculated',
    },
  };
}

/**
 * Generate Tour-specific wrap data
 */
async function generateTourData(reviews: any[]) {
  const tourReviews = reviews.filter(r => r.metadata?.tour_data);
  
  if (tourReviews.length === 0) {
    return {
      tour_data: {
        locations_visited: [],
        top_highlight: 'Amazing Tour',
        average_guide_rating: 0,
      },
    };
  }
  
  const allLocations = new Set<string>();
  let totalGuideRating = 0;
  let guideRatingCount = 0;
  
  tourReviews.forEach(r => {
    const locations = r.metadata.tour_data.locations_visited || [];
    locations.forEach((loc: string) => allLocations.add(loc));
    
    if (r.metadata.tour_data.guide_rating) {
      totalGuideRating += r.metadata.tour_data.guide_rating;
      guideRatingCount++;
    }
  });
  
  const averageGuideRating = guideRatingCount > 0
    ? totalGuideRating / guideRatingCount
    : 0;
  
  return {
    tour_data: {
      locations_visited: Array.from(allLocations),
      top_highlight: 'Cultural Experience',
      average_guide_rating: parseFloat(averageGuideRating.toFixed(1)),
    },
  };
}

/**
 * Save wrap data to database
 */
export async function saveWrapData(
  eventId: string,
  guestName: string,
  wrapData: WrapData
): Promise<{ success: boolean; wrapId?: string; error?: string }> {
  try {
    const supabase = createClient();
    
    const wrapUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://safariwrap.com'}/wrap/pending`;
    
    const { data: wrap, error } = await supabase
      .from('wraps')
      .insert({
        event_id: eventId,
        guest_name: guestName,
        data: wrapData,
        wrap_url: wrapUrl,
      })
      .select()
      .single();
    
    if (error) {
      console.error('Wrap save error:', error);
      return { success: false, error: 'Failed to save wrap' };
    }
    
    // Update wrap URL with actual ID
    const finalWrapUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://safariwrap.com'}/wrap/${wrap.id}`;
    
    await supabase
      .from('wraps')
      .update({ wrap_url: finalWrapUrl })
      .eq('id', wrap.id);
    
    return { success: true, wrapId: wrap.id };
    
  } catch (error) {
    console.error('Wrap save error:', error);
    return { success: false, error: 'Failed to save wrap' };
  }
}