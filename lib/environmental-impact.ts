import { createClient } from './supabase/client';

// Constants
export const CO2_PER_TREE_KG = 22; // kg CO2 per tree per year
export const DEFAULT_PARTNER = {
  name: 'Green Manjaro',
  url: 'https://greenmanjaro.com',
  location: {
    latitude: -3.3869,
    longitude: 37.3466,
    name: 'Mount Kilimanjaro, Tanzania',
  },
};

export interface TreeActivity {
  id: string;
  event_id: string;
  trees_planted: number;
  planting_date: string;
  co2_offset_kg: number;
  certificate_url: string | null;
  created_at: string;
}

export interface GPSLocation {
  id: string;
  tree_activity_id: string;
  latitude: number;
  longitude: number;
  location_name: string;
  verified: boolean;
  created_at: string;
}

export interface ImpactStats {
  total_trees_planted: number;
  total_events: number;
  carbon_offset_kg: number;
  locations: {
    latitude: number;
    longitude: number;
    trees: number;
    location_name: string;
  }[];
}

/**
 * Calculate trees to plant based on review count
 * Formula: 1-10 reviews = 1 tree, 11-25 = 2 trees, 26+ = 3 trees
 */
export function calculateTreesFromReviews(reviewCount: number): number {
  if (reviewCount >= 26) return 3;
  if (reviewCount >= 11) return 2;
  return 1;
}

/**
 * Calculate carbon offset from trees
 */
export function calculateCarbonOffset(trees: number): number {
  return trees * CO2_PER_TREE_KG;
}

/**
 * Format carbon offset for display
 */
export function formatCarbonOffset(kg: number): string {
  if (kg >= 1000) {
    return `${(kg / 1000).toFixed(1)} tonnes`;
  }
  return `${kg} kg`;
}

/**
 * Create tree activity record
 */
export async function createTreeActivity(
  eventId: string,
  treesPlanted: number
): Promise<{ success: boolean; data?: TreeActivity; error?: string }> {
  try {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('tree_activities')
      .insert({
        event_id: eventId,
        trees_planted: treesPlanted,
        planting_date: new Date().toISOString().split('T')[0],
      })
      .select()
      .single();
    
    if (error) {
      console.error('Failed to create tree activity:', error);
      return { success: false, error: 'Failed to create tree activity' };
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('Tree activity creation error:', error);
    return { success: false, error: 'Internal error' };
  }
}

/**
 * Add GPS location for tree activity
 */
export async function addGPSLocation(
  treeActivityId: string,
  latitude: number,
  longitude: number,
  locationName: string
): Promise<{ success: boolean; data?: GPSLocation; error?: string }> {
  try {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('gps_locations')
      .insert({
        tree_activity_id: treeActivityId,
        latitude,
        longitude,
        location_name: locationName,
        verified: false,
      })
      .select()
      .single();
    
    if (error) {
      console.error('Failed to add GPS location:', error);
      return { success: false, error: 'Failed to add GPS location' };
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('GPS location creation error:', error);
    return { success: false, error: 'Internal error' };
  }
}

/**
 * Get impact stats for an operator
 */
export async function getOperatorImpactStats(
  operatorId: string
): Promise<{ success: boolean; data?: ImpactStats; error?: string }> {
  try {
    const supabase = createClient();
    
    // Get all events for operator
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('id')
      .eq('operator_id', operatorId);
    
    if (eventsError) {
      return { success: false, error: 'Failed to fetch events' };
    }
    
    if (!events || events.length === 0) {
      return {
        success: true,
        data: {
          total_trees_planted: 0,
          total_events: 0,
          carbon_offset_kg: 0,
          locations: [],
        },
      };
    }
    
    const eventIds = events.map(e => e.id);
    
    // Get tree activities for these events
    const { data: activities, error: activitiesError } = await supabase
      .from('tree_activities')
      .select(`
        *,
        gps_locations (*)
      `)
      .in('event_id', eventIds);
    
    if (activitiesError) {
      return { success: false, error: 'Failed to fetch tree activities' };
    }
    
    // Calculate totals
    const totalTrees = activities?.reduce((sum, a) => sum + a.trees_planted, 0) || 0;
    const carbonOffset = calculateCarbonOffset(totalTrees);
    
    // Aggregate GPS locations
    const locationMap = new Map<string, { lat: number; lng: number; trees: number; name: string }>();
    
    activities?.forEach(activity => {
      activity.gps_locations?.forEach((loc: any) => {
        const key = `${loc.latitude},${loc.longitude}`;
        const existing = locationMap.get(key);
        
        if (existing) {
          existing.trees += activity.trees_planted;
        } else {
          locationMap.set(key, {
            lat: loc.latitude,
            lng: loc.longitude,
            trees: activity.trees_planted,
            name: loc.location_name,
          });
        }
      });
    });
    
    const locations = Array.from(locationMap.values()).map(loc => ({
      latitude: loc.lat,
      longitude: loc.lng,
      trees: loc.trees,
      location_name: loc.name,
    }));
    
    return {
      success: true,
      data: {
        total_trees_planted: totalTrees,
        total_events: events.length,
        carbon_offset_kg: carbonOffset,
        locations,
      },
    };
  } catch (error) {
    console.error('Impact stats error:', error);
    return { success: false, error: 'Internal error' };
  }
}

/**
 * Get tree activities for an event
 */
export async function getEventTreeActivities(
  eventId: string
): Promise<{ success: boolean; data?: TreeActivity[]; error?: string }> {
  try {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('tree_activities')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Failed to fetch tree activities:', error);
      return { success: false, error: 'Failed to fetch tree activities' };
    }
    
    return { success: true, data: data || [] };
  } catch (error) {
    console.error('Tree activities fetch error:', error);
    return { success: false, error: 'Internal error' };
  }
}

/**
 * Check if operator has environmental tracking enabled
 */
export async function hasEnvironmentalTracking(operatorId: string): Promise<boolean> {
  try {
    const supabase = createClient();
    
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('plan')
      .eq('operator_id', operatorId)
      .single();
    
    // Environmental tracking available for Pro and Enterprise
    return ['pro', 'enterprise'].includes(subscription?.plan || '');
  } catch (error) {
    return false;
  }
}