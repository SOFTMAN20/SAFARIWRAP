// User roles
export type UserRole = 'operator' | 'admin' | 'guest';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Operator {
  id: string;
  business_name: string;
  logo_url: string | null;
  brand_color_1: string;
  brand_color_2: string;
  website_url: string | null;
  phone: string | null;
  address: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
  
  // Joined from profile
  profile?: Profile;
}

export interface Destination {
  id: string;
  name: string;
  country: string;
  fun_fact?: string;
  area?: string;
  wildlife_highlight?: string;
  emoji: string;
  created_at: string;
}

export interface Trip {
  id: string;
  trip_name: string;
  start_date: string;
  end_date: string;
  status: 'Upcoming' | 'Completed';
  review_link: string | null;
  operator_id: string;
  destination_ids: string[];
  destination_names: string[];
  created_at: string;
}

export interface Review {
  id: string;
  guest_name: string;
  email: string | null;
  star_rating: number;
  review_text: string | null;
  big_five_seen: string;
  other_animals: string;
  photo_1_url: string | null;
  photo_2_url: string | null;
  photo_3_url: string | null;
  safari_duration: string;
  best_time: string | null;
  memorable_moment: string | null;
  data_consent: boolean;
  marketing_consent: boolean;
  trip_id: string;
  created_at: string;
  // Computed field (not in database)
  animal_sightings?: string[];
}

export interface SafariWrap {
  id: string;
  guest_name: string;
  wrap_url: string | null;
  tree_gps: string;
  review_id: string;
  trip_id: string;
  created_at: string;
}
