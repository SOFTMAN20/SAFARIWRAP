---
title: Wrap Generation Engine
inclusion: manual
---

# Wrap Generation Engine

## Overview
The wrap generation system transforms event data into shareable visual stories, similar to Spotify Wrapped or Instagram Stories.

## Wrap Structure

### Story Format
Each wrap consists of 6-8 slides:
1. **Intro** - Welcome with event title
2. **Stats** - Key metrics and numbers
3. **Highlights** - Top moments/achievements
4. **Photos** - Best guest photos
5. **Environmental Impact** - Trees planted
6. **Sharing** - Call to action

## Data Aggregation

### Safari Wrap Data
```typescript
interface SafariWrapData {
  event: {
    title: string;
    location: string;
    dates: { start: string; end: string };
    operator: {
      name: string;
      logo: string;
      colors: { primary: string; accent: string };
    };
  };
  stats: {
    totalGuests: number;
    avgRating: number;
    totalPhotos: number;
    totalAnimals: number;
    bigFiveSeen: string[];
    topDestination: string;
  };
  highlights: {
    bestMoment: string;
    topAnimal: string;
    favoriteTime: string;
  };
  photos: {
    featured: string[];
    grid: string[];
  };
  impact: {
    treesPlanted: number;
    carbonOffset: number;
    location: { lat: number; lng: number };
  };
}
```

### Aggregation Logic
```typescript
// lib/wrap-generator.ts
export async function generateWrapData(eventId: string): Promise<SafariWrapData> {
  const event = await getEvent(eventId);
  const reviews = await getReviews(eventId);
  const treeActivity = await getTreeActivity(eventId);
  
  // Calculate stats
  const stats = {
    totalGuests: reviews.length,
    avgRating: calculateAverage(reviews.map(r => r.star_rating)),
    totalPhotos: countPhotos(reviews),
    totalAnimals: countUniqueAnimals(reviews),
    bigFiveSeen: aggregateBigFive(reviews),
    topDestination: getMostMentioned(reviews, 'destination'),
  };
  
  // Extract highlights
  const highlights = {
    bestMoment: selectBestMoment(reviews),
    topAnimal: getMostSeenAnimal(reviews),
    favoriteTime: getMostMentioned(reviews, 'best_time'),
  };
  
  // Select photos
  const photos = {
    featured: selectFeaturedPhotos(reviews, 3),
    grid: selectGridPhotos(reviews, 9),
  };
  
  // Impact data
  const impact = {
    treesPlanted: treeActivity?.trees_planted || 0,
    carbonOffset: treeActivity?.trees_planted * 500 || 0,
    location: treeActivity?.gps_location || DEFAULT_GPS,
  };
  
  return { event, stats, highlights, photos, impact };
}
```

## Photo Selection Algorithm

### Smart Photo Selection
```typescript
function selectFeaturedPhotos(reviews: Review[], count: number): string[] {
  // Score photos based on:
  // 1. Review rating (higher = better)
  // 2. Photo quality (resolution, aspect ratio)
  // 3. Diversity (different animals, scenes)
  
  const scoredPhotos = reviews
    .flatMap(review => 
      [review.photo_1_url, review.photo_2_url, review.photo_3_url]
        .filter(Boolean)
        .map(url => ({
          url,
          score: calculatePhotoScore(url, review)
        }))
    )
    .sort((a, b) => b.score - a.score);
  
  return scoredPhotos.slice(0, count).map(p => p.url);
}

function calculatePhotoScore(url: string, review: Review): number {
  let score = 0;
  
  // Rating bonus
  score += review.star_rating * 10;
  
  // Photo position bonus (first photo usually best)
  if (url === review.photo_1_url) score += 5;
  
  // TODO: Add image analysis
  // - Resolution check
  // - Face detection
  // - Animal detection
  // - Composition analysis
  
  return score;
}
```

## Wrap Slides

### Slide 1: Intro
```tsx
<WrapSlide className="intro" colors={operator.colors}>
  <Logo src={operator.logo} />
  <h1>{event.title}</h1>
  <p>{event.location}</p>
  <p>{formatDateRange(event.dates)}</p>
  <div className="swipe-indicator">Swipe to explore →</div>
</WrapSlide>
```

### Slide 2: Stats
```tsx
<WrapSlide className="stats">
  <h2>By The Numbers</h2>
  <StatGrid>
    <Stat icon="👥" value={stats.totalGuests} label="Adventurers" />
    <Stat icon="⭐" value={stats.avgRating.toFixed(1)} label="Average Rating" />
    <Stat icon="📸" value={stats.totalPhotos} label="Photos Captured" />
    <Stat icon="🦁" value={stats.totalAnimals} label="Species Spotted" />
  </StatGrid>
  <BigFiveDisplay animals={stats.bigFiveSeen} />
</WrapSlide>
```

### Slide 3: Highlights
```tsx
<WrapSlide className="highlights">
  <h2>Top Moments</h2>
  <Highlight icon="🏆">
    <h3>Most Seen Animal</h3>
    <p>{highlights.topAnimal}</p>
  </Highlight>
  <Highlight icon="⏰">
    <h3>Best Time for Wildlife</h3>
    <p>{highlights.favoriteTime}</p>
  </Highlight>
  <Highlight icon="📍">
    <h3>Favorite Destination</h3>
    <p>{stats.topDestination}</p>
  </Highlight>
</WrapSlide>
```

### Slide 4: Photo Gallery
```tsx
<WrapSlide className="photos">
  <h2>Captured Memories</h2>
  <PhotoCarousel photos={photos.featured} />
  <PhotoGrid photos={photos.grid} />
</WrapSlide>
```

### Slide 5: Environmental Impact
```tsx
<WrapSlide className="impact">
  <h2>Your Environmental Impact 🌍</h2>
  <TreeAnimation count={impact.treesPlanted} />
  <ImpactStats>
    <Stat value={impact.treesPlanted} label="Trees Planted" />
    <Stat value={formatCarbon(impact.carbonOffset)} label="CO₂ Offset" />
  </ImpactStats>
  <MiniMap location={impact.location} />
  <Button>Download Certificate</Button>
</WrapSlide>
```

### Slide 6: Sharing
```tsx
<WrapSlide className="sharing">
  <h2>Share Your Adventure</h2>
  <ShareButtons>
    <ShareButton platform="whatsapp" />
    <ShareButton platform="facebook" />
    <ShareButton platform="twitter" />
    <ShareButton platform="instagram" />
  </ShareButtons>
  <CopyLinkButton url={wrapUrl} />
  <PoweredBy operator={operator} />
</WrapSlide>
```

## Animations

### Slide Transitions
```tsx
// Using Framer Motion
import { motion, AnimatePresence } from 'framer-motion';

<AnimatePresence mode="wait">
  <motion.div
    key={currentSlide}
    initial={{ x: 300, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    exit={{ x: -300, opacity: 0 }}
    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
  >
    {slides[currentSlide]}
  </motion.div>
</AnimatePresence>
```

### Number Animations
```tsx
// Counting animation for stats
import { useSpring, animated } from 'react-spring';

function AnimatedStat({ value }: { value: number }) {
  const props = useSpring({ number: value, from: { number: 0 } });
  
  return (
    <animated.span>
      {props.number.to(n => n.toFixed(0))}
    </animated.span>
  );
}
```

### Tree Growth Animation
```tsx
function TreeGrowthAnimation({ count }: { count: number }) {
  return (
    <div className="tree-forest">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className="tree"
          initial={{ scale: 0, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ delay: i * 0.1, duration: 0.5 }}
        >
          🌳
        </motion.div>
      ))}
    </div>
  );
}
```

## API Endpoints

### Generate Wrap
```typescript
// POST /api/wrap/generate
{
  "event_id": "uuid"
}

// Response
{
  "wrap_id": "uuid",
  "url": "/wrap/abc123",
  "data": { /* wrap data */ },
  "generated_at": "2024-06-15T10:30:00Z"
}
```

### Get Wrap
```typescript
// GET /api/wrap/[wrapId]
{
  "id": "uuid",
  "event_id": "uuid",
  "data": { /* wrap data */ },
  "views": 45,
  "shares": 12,
  "created_at": "2024-06-15T10:30:00Z"
}
```

## Storage & Caching

### Wrap Data Storage
```sql
CREATE TABLE wraps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id),
  data JSONB NOT NULL,
  views INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Caching Strategy
```typescript
// Cache wrap data for 1 hour
const wrapData = await cache.get(`wrap:${wrapId}`);
if (!wrapData) {
  const fresh = await generateWrapData(eventId);
  await cache.set(`wrap:${wrapId}`, fresh, 3600);
  return fresh;
}
return wrapData;
```

## OG Image Generation

### Dynamic OG Images
```typescript
// app/wrap/[wrapId]/opengraph-image.tsx
import { ImageResponse } from 'next/og';

export default async function Image({ params }: { params: { wrapId: string } }) {
  const wrap = await getWrap(params.wrapId);
  
  return new ImageResponse(
    (
      <div style={{ /* styles */ }}>
        <h1>{wrap.event.title}</h1>
        <p>{wrap.stats.totalGuests} guests</p>
        <p>{wrap.stats.totalAnimals} animals spotted</p>
        <p>{wrap.impact.treesPlanted} trees planted</p>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
```

## Analytics

### Track Wrap Engagement
```typescript
// Track views
await incrementWrapViews(wrapId);

// Track shares
await incrementWrapShares(wrapId, platform);

// Track slide progression
await trackSlideView(wrapId, slideIndex);
```

## Future Enhancements

1. **AI-Generated Narration**: Text-to-speech for wrap stories
2. **Video Wraps**: Convert slides to video format
3. **Music Integration**: Add background music
4. **Personalization**: Custom wraps per guest
5. **AR Features**: View animals in AR
6. **Multi-Language**: Generate wraps in multiple languages
