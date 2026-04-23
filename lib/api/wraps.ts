import { createClient } from '../supabase/client';
import { Wrap } from '../types';

const supabase = createClient();

export const wrapsApi = {
  async createWrap(wrapData: {
    guest_name: string;
    event_id: string;
    data?: Record<string, any>;
    appBaseUrl: string;
  }) {
    const { appBaseUrl, ...dataToInsert } = wrapData;
    
    // Ensure data field exists
    const insertData = {
      ...dataToInsert,
      data: dataToInsert.data || {}
    };
    
    const { data, error } = await supabase
      .from('wraps')
      .insert(insertData)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('Failed to retrieve created wrap.');

    const wrapUrl = `${appBaseUrl}/wrap/${data.id}`;
    
    const { data: updatedData, error: updateError } = await supabase
      .from('wraps')
      .update({ wrap_url: wrapUrl })
      .eq('id', data.id)
      .select()
      .maybeSingle();

    if (updateError) throw updateError;
    if (!updatedData) throw new Error('Failed to retrieve updated wrap.');
    return updatedData as Wrap;
  },

  async getWrap(wrapId: string) {
    const { data, error } = await supabase
      .from('wraps')
      .select('*, reviews(*), events(*, operators(*))')
      .eq('id', wrapId)
      .maybeSingle();

    if (error) throw error;
    
    // Reconstruct animal_sightings array from metadata for safari events
    if (data?.reviews && data?.events?.type === 'safari') {
      const review = data.reviews;
      const metadata = review.metadata || {};
      data.reviews = {
        ...review,
        animal_sightings: [
          ...(metadata.big_five_seen ? metadata.big_five_seen.split(',').filter(Boolean) : []),
          ...(metadata.other_animals ? metadata.other_animals.split(',').filter(Boolean) : []),
        ],
      };
    }
    
    return data;
  },

  // Backward compatibility aliases
  createSafariWrap: async function(wrapData: {
    guest_name: string;
    review_id: string;
    trip_id: string;
    appBaseUrl: string;
  }) {
    // Convert old format to new format
    return this.createWrap({
      guest_name: wrapData.guest_name,
      event_id: wrapData.trip_id,
      data: { review_id: wrapData.review_id },
      appBaseUrl: wrapData.appBaseUrl
    });
  },

  getSafariWrap: function(wrapId: string) {
    return this.getWrap(wrapId);
  }
};
