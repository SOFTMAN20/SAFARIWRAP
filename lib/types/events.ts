// Event Types and Interfaces

export type EventType = 'safari' | 'marathon' | 'tour';
export type EventStatus = 'upcoming' | 'active' | 'completed' | 'cancelled';

// Base Event Interface
export interface BaseEvent {
  id: string;
  operator_id: string;
  type: EventType;
  title: string;
  location: string;
  start_date: string;
  end_date: string;
  status: EventStatus;
  review_link: string | null;
  created_at: string;
  updated_at: string;
}

// Safari Event
export interface SafariMetadata {
  destinations?: string[];
  big_five_tracking?: boolean;
  conservation_partner?: string;
  safari_type?: 'game_drive' | 'walking' | 'balloon' | 'night_safari';
  accommodation?: string;
}

export interface SafariEvent extends BaseEvent {
  type: 'safari';
  metadata: SafariMetadata;
}

// Marathon Event
export interface MarathonMetadata {
  distance: number; // in km
  route: string;
  checkpoints: number;
  elevation_gain?: number; // in meters
  start_time?: string;
  category?: 'full' | 'half' | '10k' | '5k';
  terrain?: 'road' | 'trail' | 'mixed';
}

export interface MarathonEvent extends BaseEvent {
  type: 'marathon';
  metadata: MarathonMetadata;
}

// Tour Event
export interface TourMetadata {
  locations: string[];
  duration_hours: number;
  tour_type: 'walking' | 'bus' | 'bike' | 'boat' | 'mixed';
  language: string;
  max_group_size?: number;
  difficulty?: 'easy' | 'moderate' | 'challenging';
  includes_meals?: boolean;
}

export interface TourEvent extends BaseEvent {
  type: 'tour';
  metadata: TourMetadata;
}

// Union Type
export type Event = SafariEvent | MarathonEvent | TourEvent;

// Type Guards
export function isSafariEvent(event: BaseEvent): event is SafariEvent {
  return event.type === 'safari';
}

export function isMarathonEvent(event: BaseEvent): event is MarathonEvent {
  return event.type === 'marathon';
}

export function isTourEvent(event: BaseEvent): event is TourEvent {
  return event.type === 'tour';
}

// Review Metadata Types
export interface SafariReviewMetadata {
  big_five_seen?: string[];
  other_animals?: string[];
  safari_duration?: string;
  best_time?: string;
  memorable_moment?: string;
}

export interface MarathonReviewMetadata {
  finish_time?: string;
  pace?: string; // min/km
  checkpoints_reached?: number[];
  difficulty_rating?: number; // 1-5
  weather_conditions?: string;
  personal_best?: boolean;
}

export interface TourReviewMetadata {
  locations_visited?: string[];
  favorite_location?: string;
  guide_rating?: number; // 1-5
  group_size?: number;
  learned_something_new?: boolean;
}

// Event Configuration
export interface EventTypeConfig {
  id: EventType;
  name: string;
  icon: string;
  color: string;
  description: string;
  enabled: boolean;
}

export const EVENT_TYPES: EventTypeConfig[] = [
  {
    id: 'safari',
    name: 'Safari',
    icon: '🦁',
    color: '#1B4D3E',
    description: 'Wildlife safaris and nature experiences',
    enabled: true,
  },
  {
    id: 'marathon',
    name: 'Marathon',
    icon: '🏃',
    color: '#E74C3C',
    description: 'Running events and races',
    enabled: true,
  },
  {
    id: 'tour',
    name: 'Tour',
    icon: '🗺️',
    color: '#3498DB',
    description: 'Guided tours and cultural experiences',
    enabled: true,
  },
];

// Helper Functions
export function getEventTypeConfig(type: EventType): EventTypeConfig | undefined {
  return EVENT_TYPES.find(t => t.id === type);
}

export function getEnabledEventTypes(): EventTypeConfig[] {
  return EVENT_TYPES.filter(t => t.enabled);
}

export function validateEventMetadata(type: EventType, metadata: any): boolean {
  switch (type) {
    case 'safari':
      return true; // Safari metadata is optional
    case 'marathon':
      return typeof metadata.distance === 'number' && typeof metadata.route === 'string';
    case 'tour':
      return Array.isArray(metadata.locations) && metadata.locations.length > 0;
    default:
      return false;
  }
}