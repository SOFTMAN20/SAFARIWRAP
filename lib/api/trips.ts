import { createClient } from '../supabase/client';
import { Trip } from '../types';

const supabase = createClient();

export const tripsApi = {
  async getOperatorTrips(operatorId: string) {
    // Use events table instead of trips
    const { data, error } = await supabase
      .from('events')
      .select('id, title, start_date, end_date, status, review_link, operator_id, location, type, metadata, created_at')
      .eq('operator_id', operatorId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Map events to Trip structure for backward compatibility
    return (data || []).map(event => ({
      id: event.id,
      trip_name: event.title,
      start_date: event.start_date,
      end_date: event.end_date,
      status: event.status === 'completed' ? 'Completed' : 'Upcoming',
      review_link: event.review_link,
      operator_id: event.operator_id,
      destination_ids: [],
      destination_names: event.metadata?.destinations || [],
      created_at: event.created_at,
    })) as Trip[];
  },

  async getTripById(tripId: string) {
    // Use events table instead of trips
    const { data, error } = await supabase
      .from('events')
      .select('id, title, start_date, end_date, status, review_link, operator_id, location, type, metadata, created_at, operators(id, business_name, logo_url, brand_color_1, brand_color_2, profiles(email))')
      .eq('id', tripId)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;
    
    // Map event to Trip structure
    return {
      id: data.id,
      trip_name: data.title,
      start_date: data.start_date,
      end_date: data.end_date,
      status: data.status === 'completed' ? 'Completed' : 'Upcoming',
      review_link: data.review_link,
      operator_id: data.operator_id,
      destination_ids: [],
      destination_names: data.metadata?.destinations || [],
      created_at: data.created_at,
      operators: data.operators ? {
        id: (data.operators as any).id,
        business_name: (data.operators as any).business_name,
        email: (data.operators as any).profiles?.email || 'N/A',
        logo_url: (data.operators as any).logo_url,
        brand_color_1: (data.operators as any).brand_color_1,
        brand_color_2: (data.operators as any).brand_color_2,
      } : undefined
    };
  },

  async createTrip(tripData: {
    trip_name: string;
    start_date: string;
    end_date: string;
    operator_id: string;
    destination_ids?: string[];
    destination_names?: string[];
    appBaseUrl: string;
  }) {
    const { appBaseUrl, trip_name, destination_names, ...rest } = tripData;

    // Create event instead of trip
    const eventData = {
      operator_id: rest.operator_id,
      type: 'safari',
      title: trip_name,
      location: destination_names?.[0] || 'Safari',
      start_date: rest.start_date,
      end_date: rest.end_date,
      status: 'upcoming',
      metadata: {
        destinations: destination_names || [],
      }
    };

    const { data, error } = await supabase
      .from('events')
      .insert(eventData)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('Failed to retrieve created event.');

    // Generate review link: {baseUrl}/review?trip={eventId}
    const reviewLink = `${appBaseUrl}/review?trip=${data.id}`;

    const { data: updatedData, error: updateError } = await supabase
      .from('events')
      .update({ review_link: reviewLink })
      .eq('id', data.id)
      .select()
      .maybeSingle();

    if (updateError) throw updateError;
    if (!updatedData) throw new Error('Failed to retrieve updated event.');
    
    // Map to Trip structure
    return {
      id: updatedData.id,
      trip_name: updatedData.title,
      start_date: updatedData.start_date,
      end_date: updatedData.end_date,
      status: 'Upcoming',
      review_link: updatedData.review_link,
      operator_id: updatedData.operator_id,
      destination_ids: [],
      destination_names: updatedData.metadata?.destinations || [],
      created_at: updatedData.created_at,
    } as Trip;
  },

  async markTripComplete(tripId: string) {
    // Update event status
    const { data, error } = await supabase
      .from('events')
      .update({ status: 'completed' })
      .eq('id', tripId)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('Failed to retrieve completed event.');
    
    // Map to Trip structure
    return {
      id: data.id,
      trip_name: data.title,
      start_date: data.start_date,
      end_date: data.end_date,
      status: 'Completed',
      review_link: data.review_link,
      operator_id: data.operator_id,
      destination_ids: [],
      destination_names: data.metadata?.destinations || [],
      created_at: data.created_at,
    } as Trip;
  },
};
