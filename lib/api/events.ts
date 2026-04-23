import { createClient } from '../supabase/client';
import { Event } from '../types';

const supabase = createClient();

export const eventsApi = {
  async getOperatorEvents(operatorId: string) {
    const { data, error } = await supabase
      .from('events')
      .select('id, type, title, location, start_date, end_date, status, review_link, operator_id, metadata, created_at, updated_at')
      .eq('operator_id', operatorId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Event[];
  },

  async getEventById(eventId: string) {
    const { data, error } = await supabase
      .from('events')
      .select('id, type, title, location, start_date, end_date, status, review_link, operator_id, metadata, created_at, updated_at, operators(id, name, business_name, email, logo_url, brand_color_1, brand_color_2)')
      .eq('id', eventId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async createEvent(eventData: {
    type: 'safari' | 'marathon' | 'tour';
    title: string;
    location: string;
    start_date: string;
    end_date: string;
    operator_id: string;
    metadata?: Record<string, any>;
    appBaseUrl: string;
  }) {
    const { appBaseUrl, ...dataToInsert } = eventData;

    // Ensure metadata exists
    const insertData = {
      ...dataToInsert,
      metadata: dataToInsert.metadata || {}
    };

    const { data, error } = await supabase
      .from('events')
      .insert(insertData)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('Failed to retrieve created event.');

    // Review link is auto-generated via QR code system
    // But we can still set a fallback review link
    const reviewLink = `${appBaseUrl}/review?event=${data.id}`;

    const { data: updatedData, error: updateError } = await supabase
      .from('events')
      .update({ review_link: reviewLink })
      .eq('id', data.id)
      .select()
      .maybeSingle();

    if (updateError) throw updateError;
    if (!updatedData) throw new Error('Failed to retrieve updated event.');
    return updatedData as Event;
  },

  async markEventComplete(eventId: string) {
    const { data, error } = await supabase
      .from('events')
      .update({ status: 'completed' })
      .eq('id', eventId)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('Failed to retrieve completed event.');
    return data as Event;
  },

  async updateEvent(eventId: string, updates: Partial<Event>) {
    const { data, error } = await supabase
      .from('events')
      .update(updates)
      .eq('id', eventId)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('Failed to retrieve updated event.');
    return data as Event;
  },

  async deleteEvent(eventId: string) {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId);

    if (error) throw error;
  },

  // Backward compatibility: alias for old trip methods
  getOperatorTrips: function(operatorId: string) {
    return this.getOperatorEvents(operatorId);
  },
  
  getTripById: function(tripId: string) {
    return this.getEventById(tripId);
  },
  
  createTrip: async function(tripData: {
    trip_name: string;
    start_date: string;
    end_date: string;
    operator_id: string;
    destination_ids?: string[];
    destination_names?: string[];
    appBaseUrl: string;
  }) {
    // Convert old trip format to new event format
    return this.createEvent({
      type: 'safari',
      title: tripData.trip_name,
      location: tripData.destination_names?.[0] || 'Safari Location',
      start_date: tripData.start_date,
      end_date: tripData.end_date,
      operator_id: tripData.operator_id,
      metadata: {
        destination_ids: tripData.destination_ids || [],
        destination_names: tripData.destination_names || []
      },
      appBaseUrl: tripData.appBaseUrl
    });
  },
  
  markTripComplete: function(tripId: string) {
    return this.markEventComplete(tripId);
  }
};

// Export backward compatible alias
export const tripsApi = eventsApi;
