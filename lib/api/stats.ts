import { createClient } from '../supabase/client';

const supabase = createClient();

export const statsApi = {
  async getOperatorStats(operatorId: string) {
    // Updated to use events and wraps tables instead of trips and safari_wraps
    
    const [eventsCount, reviewsCount, wrapsCount] = await Promise.all([
      supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .eq('operator_id', operatorId),
      
      supabase
        .from('reviews')
        .select('*, events!inner(operator_id)', { count: 'exact', head: true })
        .eq('events.operator_id', operatorId),

      supabase
        .from('wraps')
        .select('*, events!inner(operator_id)', { count: 'exact', head: true })
        .eq('events.operator_id', operatorId),
    ]);

    return {
      events: eventsCount.count || 0,
      trips: eventsCount.count || 0, // Backward compatibility alias
      reviews: reviewsCount.count || 0,
      wraps: wrapsCount.count || 0,
    };
  },
};
