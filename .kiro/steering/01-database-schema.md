---
title: Database Schema & Data Models
inclusion: always
---

# Database Schema

## Current Schema (Phase 6 Complete - Safari Focus)

### Database Information
- **Supabase Project**: `uauymnvbsdldfpeuvtxy`
- **Extensions Installed**: uuid-ossp, pgcrypto, pg_stat_statements, pg_graphql, supabase_vault
- **RLS**: Enabled on all public tables
- **Storage Bucket**: `safariwrap-assets` (public)

### Current Tables (5 Total)

#### `public.operators` (0 records)
Safari tour operators who manage trips and guests.
```sql
CREATE TABLE public.operators (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  name TEXT NOT NULL,
  business_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  brand_color_1 TEXT DEFAULT '#1B4D3E',
  brand_color_2 TEXT DEFAULT '#F4C542',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS Policies:
-- - Operators can view/update their own data only
-- - Cannot view other operators
```

**Current Limitations:**
- No subscription tracking
- No plan limits enforcement
- All operators have unlimited access

#### `public.destinations` (10 records - pre-seeded)
Pre-seeded safari locations across Tanzania and Kenya.
```sql
CREATE TABLE public.destinations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'Tanzania',
  fun_fact TEXT,
  area TEXT,
  wildlife_highlight TEXT,
  emoji TEXT DEFAULT '🌍',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Pre-seeded destinations:
-- 1. Serengeti National Park (Tanzania) 🦁
-- 2. Ngorongoro Crater (Tanzania) 🦏
-- 3. Tarangire National Park (Tanzania) 🐘
-- 4. Masai Mara National Reserve (Kenya) 🌊
-- 5. Amboseli National Park (Kenya) 🏔️
-- 6. Lake Manyara National Park (Tanzania) 🦩
-- 7. Ruaha National Park (Tanzania) 🐕
-- 8. Selous Game Reserve (Tanzania) 🚣
-- 9. Samburu National Reserve (Kenya) 🦓
-- 10. Tsavo National Parks (Kenya) 🔴
```

#### `public.trips` (0 records - will become `events`)
Safari expeditions organized by operators.
```sql
CREATE TABLE public.trips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'Upcoming' 
    CHECK (status IN ('Upcoming', 'Completed')),
  review_link TEXT,
  operator_id UUID NOT NULL REFERENCES operators(id),
  destination_ids UUID[] DEFAULT '{}',
  destination_names TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS Policies:
-- - Operators can CRUD their own trips only
-- - Public cannot view trips directly

-- Foreign Keys:
-- - operator_id → operators(id)
-- - Referenced by: reviews(trip_id), safari_wraps(trip_id)
```

**Current Limitations:**
- Safari-only schema (destination arrays)
- No multi-vertical support (no type column)
- No metadata JSONB for extensibility
- Will be migrated to `events` table in Phase 8

#### `public.reviews` (0 records)
Guest feedback and experience data with safari-specific fields.
```sql
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  guest_name TEXT NOT NULL,
  email TEXT,
  star_rating INTEGER NOT NULL CHECK (star_rating >= 1 AND star_rating <= 5),
  review_text TEXT,
  photo_1_url TEXT,
  photo_2_url TEXT,
  photo_3_url TEXT,
  safari_duration TEXT,
  big_five_seen TEXT DEFAULT '',
  other_animals TEXT DEFAULT '',
  best_time TEXT,
  memorable_moment TEXT,
  data_consent BOOLEAN NOT NULL DEFAULT FALSE,
  marketing_consent BOOLEAN NOT NULL DEFAULT FALSE,
  trip_id UUID NOT NULL REFERENCES trips(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS Policies:
-- - Public can INSERT (guest submissions)
-- - Operators can view reviews for their trips
-- - Public can view reviews by trip_id (for wrap display)

-- Foreign Keys:
-- - trip_id → trips(id)
-- - Referenced by: safari_wraps(review_id)
```

**Safari-Specific Fields:**
- `safari_duration`: Text field for trip length
- `big_five_seen`: Comma-separated list (Lion, Elephant, Rhino, Leopard, Buffalo)
- `other_animals`: Comma-separated list (Giraffe, Zebra, Hippo, etc.)
- `best_time`: Best time for wildlife viewing
- `memorable_moment`: Highlight of the safari

**Current Limitations:**
- No metadata JSONB for multi-vertical support
- Safari fields hardcoded in schema
- Will need migration to support marathon/tour data

#### `public.safari_wraps` (0 records)
Generated visual summaries of safari experiences.
```sql
CREATE TABLE public.safari_wraps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  guest_name TEXT NOT NULL,
  wrap_url TEXT,
  tree_gps TEXT DEFAULT '-3.3869, 37.3466',
  review_id UUID NOT NULL REFERENCES reviews(id),
  trip_id UUID NOT NULL REFERENCES trips(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS Policies:
-- - Public can view (shareable wraps)
-- - Auto-created via trigger after review submission

-- Foreign Keys:
-- - review_id → reviews(id)
-- - trip_id → trips(id)
```

**Current Implementation:**
- Basic wrap generation
- Hardcoded tree GPS (Kilimanjaro: -3.3869, 37.3466)
- No actual tree planting integration
- No environmental impact tracking


## Planned Schema Extensions (Phase 8-10)

### Payment & Subscription Tables (NEW - Phase 8)

#### `subscriptions`
Operator subscription management for Snippe.sh integration.
```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  operator_id UUID NOT NULL REFERENCES operators(id) ON DELETE CASCADE,
  plan TEXT NOT NULL CHECK (plan IN ('free', 'pro', 'enterprise')) DEFAULT 'free',
  status TEXT NOT NULL CHECK (status IN ('active', 'cancelled', 'expired', 'trialing')) DEFAULT 'active',
  expires_at TIMESTAMPTZ,
  snippesh_subscription_id TEXT UNIQUE,
  snippesh_customer_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_operator_id ON subscriptions(operator_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

-- RLS Policies:
-- - Operators can view their own subscription only
-- - Admin can view all subscriptions
```

**Subscription Plans:**
- **Free**: 2 events max, 10 reviews/event, basic wraps, SafariWrap branding
- **Pro (TZS 75,000/month)**: Unlimited events/reviews, environmental tracking, no branding
- **Enterprise (TZS 250,000/month)**: All Pro + multi-user, API access, white-label

#### `payments`
Payment transaction audit trail for Snippe.sh.
```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  operator_id UUID NOT NULL REFERENCES operators(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id),
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'TZS',
  status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  provider TEXT NOT NULL DEFAULT 'snippesh',
  transaction_id TEXT UNIQUE,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payments_operator_id ON payments(operator_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_transaction_id ON payments(transaction_id);

-- RLS Policies:
-- - Operators can view their own payments only
-- - Payments are immutable (no updates/deletes)
```

### Multi-Vertical Extensions (NEW - Phase 8-9)

#### `events` (replaces `trips`)
Multi-vertical event management supporting safari, marathon, and tour experiences.
```sql
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  operator_id UUID NOT NULL REFERENCES operators(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('safari', 'marathon', 'tour')),
  title TEXT NOT NULL,
  location TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'upcoming' 
    CHECK (status IN ('upcoming', 'active', 'completed', 'cancelled')),
  metadata JSONB NOT NULL DEFAULT '{}',
  review_link TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_events_operator_id ON events(operator_id);
CREATE INDEX idx_events_type ON events(type);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_metadata ON events USING GIN (metadata);

-- RLS Policies:
-- - Operators can CRUD their own events only
-- - Public cannot view events directly
```

**Metadata Structure by Type:**

**Safari Events:**
```json
{
  "destination_ids": ["uuid1", "uuid2"],
  "destination_names": ["Serengeti", "Ngorongoro"],
  "duration_days": 7,
  "group_size": 12
}
```

**Marathon Events:**
```json
{
  "distance": 42.195,
  "start_location": "Kilimanjaro Base",
  "route_map_url": "https://...",
  "elevation_gain": 5895,
  "time_limit": 720
}
```

**Tour Events:**
```json
{
  "locations": ["Stone Town", "Spice Farms", "Jozani Forest"],
  "tour_type": "cultural",
  "duration_hours": 8,
  "max_participants": 20
}
```

**Migration Strategy from `trips` to `events`:**
```sql
-- Step 1: Create events table
-- Step 2: Migrate existing trips data
INSERT INTO events (id, operator_id, type, title, location, start_date, end_date, status, metadata, review_link, created_at)
SELECT 
  id,
  operator_id,
  'safari' as type,
  trip_name as title,
  COALESCE(destination_names[1], 'Safari Location') as location,
  start_date,
  end_date,
  LOWER(status) as status,
  jsonb_build_object(
    'destination_ids', destination_ids,
    'destination_names', destination_names
  ) as metadata,
  review_link,
  created_at
FROM trips;

-- Step 3: Update foreign keys in reviews and safari_wraps
ALTER TABLE reviews RENAME COLUMN trip_id TO event_id;
ALTER TABLE safari_wraps RENAME COLUMN trip_id TO event_id;

-- Step 4: Drop old trips table after verification
DROP TABLE trips;
```

#### `qr_codes` (NEW - Phase 11)
Enhanced QR code management with analytics.
```sql
CREATE TABLE qr_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  short_code TEXT NOT NULL UNIQUE,
  code_url TEXT NOT NULL,
  scans_count INTEGER NOT NULL DEFAULT 0,
  unique_scans_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_qr_codes_event_id ON qr_codes(event_id);
CREATE INDEX idx_qr_codes_short_code ON qr_codes(short_code);

-- Short code format: 8 alphanumeric characters (e.g., "A7K9M2X5")
-- URL format: safariwrap.com/r/{short_code}
```

#### `qr_code_scans` (NEW - Phase 11)
QR code analytics and conversion tracking.
```sql
CREATE TABLE qr_code_scans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  qr_code_id UUID NOT NULL REFERENCES qr_codes(id) ON DELETE CASCADE,
  ip_address INET,
  user_agent TEXT,
  location_country TEXT,
  location_city TEXT,
  converted_to_review BOOLEAN DEFAULT FALSE,
  scanned_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_qr_scans_qr_code_id ON qr_code_scans(qr_code_id);
CREATE INDEX idx_qr_scans_scanned_at ON qr_code_scans(scanned_at);
CREATE INDEX idx_qr_scans_converted ON qr_code_scans(converted_to_review);
```

### Environmental Impact Tables (NEW - Phase 10)

#### `tree_activities`
Tree planting allocation and tracking per event.
```sql
CREATE TABLE tree_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  trees_planted INTEGER NOT NULL CHECK (trees_planted > 0),
  planting_date DATE NOT NULL DEFAULT CURRENT_DATE,
  co2_offset_kg DECIMAL(10, 2) GENERATED ALWAYS AS (trees_planted * 22) STORED,
  certificate_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tree_activities_event_id ON tree_activities(event_id);

-- Tree allocation formula:
-- - 1-10 reviews: 1 tree
-- - 11-25 reviews: 2 trees
-- - 26+ reviews: 3 trees
-- - CO2 offset: 22 kg per tree per year (industry standard)
```

#### `gps_locations`
GPS coordinates for tree planting locations (Kilimanjaro Project partnership).
```sql
CREATE TABLE gps_locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tree_activity_id UUID NOT NULL REFERENCES tree_activities(id) ON DELETE CASCADE,
  latitude DECIMAL(10, 8) NOT NULL CHECK (latitude >= -90 AND latitude <= 90),
  longitude DECIMAL(11, 8) NOT NULL CHECK (longitude >= -180 AND longitude <= 180),
  location_name TEXT NOT NULL,
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_gps_locations_tree_activity_id ON gps_locations(tree_activity_id);
CREATE INDEX idx_gps_locations_coords ON gps_locations(latitude, longitude);
```

### Extended Reviews Table (Phase 8-9)

Add metadata column to support multi-vertical review data:
```sql
-- Add metadata column to existing reviews table
ALTER TABLE reviews ADD COLUMN metadata JSONB DEFAULT '{}';
CREATE INDEX idx_reviews_metadata ON reviews USING GIN (metadata);

-- Migrate existing safari-specific fields to metadata
UPDATE reviews SET metadata = jsonb_build_object(
  'safari_duration', safari_duration,
  'big_five_seen', big_five_seen,
  'other_animals', other_animals,
  'best_time', best_time,
  'memorable_moment', memorable_moment
) WHERE safari_duration IS NOT NULL OR big_five_seen IS NOT NULL;

-- Keep original columns for backward compatibility during transition
-- Can be dropped after full migration to metadata approach
```

**Review Metadata by Event Type:**

**Safari Reviews:**
```json
{
  "safari_duration": "7 days",
  "big_five_seen": "Lion,Elephant,Rhino",
  "other_animals": "Giraffe,Zebra,Hippo",
  "best_time": "Early morning (5-8am)",
  "memorable_moment": "Witnessed the great migration"
}
```

**Marathon Reviews:**
```json
{
  "finish_time": "04:32:15",
  "pace_per_km": "06:27",
  "difficulty_rating": 4,
  "checkpoints_reached": 8,
  "personal_best": true
}
```

**Tour Reviews:**
```json
{
  "locations_visited": ["Stone Town", "Spice Farms"],
  "favorite_stop": "Spice Farms",
  "cultural_highlights": "Traditional cooking class",
  "guide_rating": 5
}
```

## Row Level Security (RLS)

All tables have RLS enabled with policies:

### Operators
- Can view/update their own data
- Cannot view other operators

### Trips/Events
- Operators can CRUD their own trips
- Public cannot view trips directly

### Reviews
- Public can INSERT (guest submissions)
- Operators can view reviews for their trips
- Public can view reviews by trip_id (for wrap display)

### Safari Wraps
- Public can view (shareable)
- Auto-created via trigger after review submission

## Storage Buckets

### `safariwrap-assets`
- Public bucket for photos and logos
- Folders:
  - `/logos/` - Operator branding
  - `/reviews/` - Guest photos
  - `/wraps/` - Generated wrap images

## Migration Strategy

When extending to multi-vertical:
1. Rename `trips` → `events`
2. Add `type` column with default 'safari'
3. Move type-specific fields to `metadata` JSONB
4. Update all foreign keys
5. Migrate existing data
6. Update application code
