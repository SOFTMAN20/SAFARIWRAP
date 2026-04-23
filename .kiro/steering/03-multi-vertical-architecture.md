---
title: Multi-Vertical Architecture
inclusion: manual
---

# Multi-Vertical Architecture

## Overview
SafariWrap is designed to support multiple experience types (verticals) from a single codebase.

## Supported Verticals

### 1. Safari (Current)
**Data Model:**
```typescript
interface SafariEvent {
  type: 'safari';
  destinations: string[];
  big_five_tracking: boolean;
  animal_list: string[];
  conservation_partner?: string;
}

interface SafariReview {
  big_five_seen: string[];
  other_animals: string[];
  safari_duration: string;
  best_time: string;
  memorable_moment: string;
  photos: string[];
}
```

### 2. Marathon (Planned)
**Data Model:**
```typescript
interface MarathonEvent {
  type: 'marathon';
  distance: number; // in km
  route: string;
  checkpoints: number;
  elevation_gain: number;
  start_time: string;
}

interface MarathonReview {
  finish_time: string;
  pace: string; // min/km
  checkpoints_reached: number[];
  difficulty_rating: number;
  weather_conditions: string;
  photos: string[];
}
```

### 3. Tour (Planned)
**Data Model:**
```typescript
interface TourEvent {
  type: 'tour';
  locations: string[];
  duration_hours: number;
  tour_type: 'walking' | 'bus' | 'bike' | 'boat';
  language: string;
}

interface TourReview {
  locations_visited: string[];
  favorite_location: string;
  guide_rating: number;
  group_size: number;
  photos: string[];
}
```

## Database Schema Evolution

### Current: `trips` table
```sql
CREATE TABLE trips (
  id UUID PRIMARY KEY,
  trip_name TEXT,
  operator_id UUID,
  destination_ids UUID[],
  -- Safari-specific fields
);
```

### Future: `events` table
```sql
CREATE TABLE events (
  id UUID PRIMARY KEY,
  operator_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('safari', 'marathon', 'tour')),
  title TEXT NOT NULL,
  location TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL,
  
  -- Type-specific data stored as JSONB
  metadata JSONB NOT NULL DEFAULT '{}',
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Example metadata for safari:
{
  "destinations": ["serengeti", "ngorongoro"],
  "big_five_tracking": true,
  "conservation_partner": "Kilimanjaro Project"
}

-- Example metadata for marathon:
{
  "distance": 42.2,
  "route": "City Center Loop",
  "checkpoints": 8,
  "elevation_gain": 450
}
```

## Migration Strategy

### Phase 1: Add Type Column
```sql
ALTER TABLE trips ADD COLUMN type TEXT DEFAULT 'safari';
ALTER TABLE trips ADD COLUMN metadata JSONB DEFAULT '{}';
```

### Phase 2: Migrate Data
```sql
-- Move safari-specific fields to metadata
UPDATE trips SET metadata = jsonb_build_object(
  'destinations', destination_ids,
  'destination_names', destination_names
);
```

### Phase 3: Rename Table
```sql
ALTER TABLE trips RENAME TO events;
```

### Phase 4: Update Application Code
- Update all imports: `Trip` → `Event`
- Update API routes: `/api/trips` → `/api/events`
- Update UI components

## Type-Safe Implementation

### TypeScript Types
```typescript
// lib/types.ts
export type EventType = 'safari' | 'marathon' | 'tour';

export interface BaseEvent {
  id: string;
  operator_id: string;
  type: EventType;
  title: string;
  location: string;
  start_date: string;
  end_date: string;
  status: 'upcoming' | 'completed';
  created_at: string;
}

export interface SafariEvent extends BaseEvent {
  type: 'safari';
  metadata: {
    destinations: string[];
    big_five_tracking: boolean;
    conservation_partner?: string;
  };
}

export interface MarathonEvent extends BaseEvent {
  type: 'marathon';
  metadata: {
    distance: number;
    route: string;
    checkpoints: number;
    elevation_gain: number;
  };
}

export type Event = SafariEvent | MarathonEvent | TourEvent;
```

### Type Guards
```typescript
export function isSafariEvent(event: Event): event is SafariEvent {
  return event.type === 'safari';
}

export function isMarathonEvent(event: Event): event is MarathonEvent {
  return event.type === 'marathon';
}
```

## UI Components

### Dynamic Form Rendering
```tsx
// components/EventForm.tsx
export function EventForm({ type }: { type: EventType }) {
  return (
    <form>
      {/* Common fields */}
      <Input name="title" label="Event Title" />
      <Input name="location" label="Location" />
      
      {/* Type-specific fields */}
      {type === 'safari' && <SafariFields />}
      {type === 'marathon' && <MarathonFields />}
      {type === 'tour' && <TourFields />}
    </form>
  );
}
```

### Dynamic Wrap Generation
```tsx
// components/WrapDisplay.tsx
export function WrapDisplay({ event }: { event: Event }) {
  if (isSafariEvent(event)) {
    return <SafariWrap event={event} />;
  }
  if (isMarathonEvent(event)) {
    return <MarathonWrap event={event} />;
  }
  return <TourWrap event={event} />;
}
```

## API Design

### Create Event
```typescript
// POST /api/events
{
  "type": "marathon",
  "title": "City Marathon 2024",
  "location": "Nairobi",
  "start_date": "2024-06-15",
  "metadata": {
    "distance": 42.2,
    "route": "City Loop",
    "checkpoints": 8
  }
}
```

### Get Events (with filtering)
```typescript
// GET /api/events?type=safari
// GET /api/events?type=marathon
// GET /api/events (all types)
```

## Wrap Generation Logic

### Safari Wrap
```typescript
function generateSafariWrap(event: SafariEvent, reviews: Review[]) {
  return {
    totalAnimals: countUniqueAnimals(reviews),
    bigFiveSeen: aggregateBigFive(reviews),
    topDestination: getMostMentioned(reviews),
    photoHighlights: selectBestPhotos(reviews, 5),
    conservationImpact: calculateTreesPlanted(reviews.length)
  };
}
```

### Marathon Wrap
```typescript
function generateMarathonWrap(event: MarathonEvent, reviews: Review[]) {
  return {
    totalRunners: reviews.length,
    averagePace: calculateAveragePace(reviews),
    fastestTime: getFastestTime(reviews),
    completionRate: calculateCompletionRate(reviews),
    photoHighlights: selectBestPhotos(reviews, 5)
  };
}
```

## Feature Flags

Use feature flags to gradually roll out new verticals:

```typescript
// lib/features.ts
export const FEATURES = {
  SAFARI: true,
  MARATHON: process.env.NEXT_PUBLIC_ENABLE_MARATHON === 'true',
  TOUR: process.env.NEXT_PUBLIC_ENABLE_TOUR === 'true',
};

// In UI
{FEATURES.MARATHON && (
  <Button onClick={() => createEvent('marathon')}>
    Create Marathon Event
  </Button>
)}
```

## Testing Strategy

### Unit Tests
- Test type guards
- Test metadata validation
- Test wrap generation for each type

### Integration Tests
- Test event creation for each type
- Test review submission for each type
- Test wrap generation end-to-end

### E2E Tests
- Complete flow for safari
- Complete flow for marathon
- Switching between event types
