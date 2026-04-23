import { createClient } from '../supabase/client';
import { Review } from '../types';

const supabase = createClient();

export const reviewsApi = {
  async getTripReviews(tripId: string) {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('trip_id', tripId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Reconstruct animal_sightings array from big_five_seen and other_animals
    const reviews = (data || []).map(review => ({
      ...review,
      animal_sightings: [
        ...(review.big_five_seen ? review.big_five_seen.split(',').filter(Boolean) : []),
        ...(review.other_animals ? review.other_animals.split(',').filter(Boolean) : []),
      ],
    }));
    
    return reviews as Review[];
  },

  async createReview(reviewData: Partial<Review>) {
    const { data, error } = await supabase
      .from('reviews')
      .insert(reviewData)
      .select()
      .maybeSingle();
    if (error) throw error;
    if (!data) throw new Error('Failed to retrieve created review.');
    return data as Review;
  },

  async uploadReviewPhoto(file: File, reviewId: string, photoIndex: number) {
    const fileExt = file.name.split('.').pop();
    const fileName = `reviews/${reviewId}/photo_${photoIndex}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('safariwrap-assets')
      .upload(fileName, file, {
        upsert: true, // Allow overwrite if exists
      });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('safariwrap-assets')
      .getPublicUrl(fileName);

    return publicUrl;
  },
};
