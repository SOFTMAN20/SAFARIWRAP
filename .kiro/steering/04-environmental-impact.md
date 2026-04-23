---
title: Environmental Impact & Tree Planting
inclusion: manual
---

# Environmental Impact Integration

## Overview
SafariWrap connects every experience to environmental conservation through tree planting with GPS-tracked impact.

## Partnership: Green Manjaro
Default partner: https://greenmanjaro.com
- GPS coordinates: -3.3869, 37.3466 (Mount Kilimanjaro region)

## Impact Flow

### 1. Event Completion
```
Guest completes event → Review submitted → Trees assigned → GPS location saved → Impact certificate generated
```

### 2. Tree Allocation Formula
```typescript
function calculateTreesPlanted(event: Event, reviews: Review[]): number {
  const baseTreesPerReview = 1;
  const bonusForPhotos = 0.5;
  const bonusForHighRating = 0.5;
  
  let totalTrees = 0;
  
  reviews.forEach(review => {
    let trees = baseTreesPerReview;
    
    if (review.photos.length > 0) trees += bonusForPhotos;
    if (review.star_rating >= 5) trees += bonusForHighRating;
    
    totalTrees += trees;
  });
  
  return Math.floor(totalTrees);
}
```

## Database Schema

### `tree_activities`
```sql
CREATE TABLE tree_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  trees_planted INTEGER NOT NULL DEFAULT 0,
  planting_date DATE NOT NULL,
  certificate_url TEXT,
  certificate_number TEXT UNIQUE,
  partner_name TEXT DEFAULT 'Green Manjaro',
  partner_url TEXT DEFAULT 'https://greenmanjaro.com',
  status TEXT NOT NULL CHECK (status IN ('pending', 'planted', 'verified')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  verified_at TIMESTAMPTZ
);

CREATE INDEX idx_tree_activities_event_id ON tree_activities(event_id);
CREATE INDEX idx_tree_activities_status ON tree_activities(status);
```

### `gps_locations`
```sql
CREATE TABLE gps_locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tree_activity_id UUID NOT NULL REFERENCES tree_activities(id) ON DELETE CASCADE,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  location_name TEXT,
  region TEXT,
  country TEXT DEFAULT 'Tanzania',
  verified BOOLEAN DEFAULT false,
  verification_photo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_gps_locations_tree_activity_id ON gps_locations(tree_activity_id);
CREATE INDEX idx_gps_locations_coordinates ON gps_locations(latitude, longitude);
```

## API Endpoints

### Create Tree Activity
```typescript
// POST /api/environmental/tree-activity
{
  "event_id": "uuid",
  "trees_planted": 15,
  "planting_date": "2024-06-15",
  "gps_locations": [
    {
      "latitude": -3.3869,
      "longitude": 37.3466,
      "location_name": "Kilimanjaro Forest Reserve"
    }
  ]
}
```

### Get Impact Stats
```typescript
// GET /api/environmental/stats?operator_id=uuid
{
  "total_trees_planted": 1250,
  "total_events": 45,
  "carbon_offset_kg": 625000, // 500kg CO2 per tree
  "locations": [
    {
      "latitude": -3.3869,
      "longitude": 37.3466,
      "trees": 150,
      "location_name": "Kilimanjaro"
    }
  ]
}
```

### Generate Certificate
```typescript
// POST /api/environmental/certificate
{
  "tree_activity_id": "uuid",
  "guest_name": "John Doe",
  "event_title": "Serengeti Safari 2024"
}

// Returns PDF certificate URL
```

## UI Components

### Impact Dashboard Card
```tsx
<ImpactCard>
  <h3>🌳 Environmental Impact</h3>
  <div className="stat">
    <span className="value">{totalTrees}</span>
    <span className="label">Trees Planted</span>
  </div>
  <div className="stat">
    <span className="value">{carbonOffset}kg</span>
    <span className="label">CO₂ Offset</span>
  </div>
  <Button onClick={() => viewMap()}>View Tree Locations</Button>
</ImpactCard>
```

### Interactive Map
```tsx
// components/TreeMap.tsx
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

export function TreeMap({ locations }: { locations: GPSLocation[] }) {
  return (
    <MapContainer center={[-3.3869, 37.3466]} zoom={8}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {locations.map(loc => (
        <Marker key={loc.id} position={[loc.latitude, loc.longitude]}>
          <Popup>
            <div>
              <h4>{loc.location_name}</h4>
              <p>{loc.trees} trees planted</p>
              {loc.verified && <span>✓ Verified</span>}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
```

### Impact Certificate
```tsx
// components/ImpactCertificate.tsx
export function ImpactCertificate({ activity }: { activity: TreeActivity }) {
  return (
    <div className="certificate">
      <h1>Certificate of Environmental Impact</h1>
      <p>This certifies that</p>
      <h2>{activity.guest_name}</h2>
      <p>has contributed to planting</p>
      <h3>{activity.trees_planted} trees</h3>
      <p>in partnership with {activity.partner_name}</p>
      <p>Location: {activity.location_name}</p>
      <p>Date: {formatDate(activity.planting_date)}</p>
      <QRCode value={activity.certificate_url} />
      <p>Certificate #{activity.certificate_number}</p>
    </div>
  );
}
```

## Wrap Integration

### Include Impact in Wrap
```typescript
// In wrap generation
const wrapData = {
  // ... other wrap data
  environmental_impact: {
    trees_planted: 12,
    carbon_offset: 6000, // kg
    location: "Mount Kilimanjaro, Tanzania",
    gps: { lat: -3.3869, lng: 37.3466 },
    certificate_url: "/certificates/abc123"
  }
};
```

### Impact Slide in Wrap
```tsx
// Slide 5: Environmental Impact
<WrapSlide>
  <h2>Your Environmental Impact 🌍</h2>
  <div className="tree-animation">
    <TreeGrowthAnimation count={treesPlanted} />
  </div>
  <p>You helped plant {treesPlanted} trees</p>
  <p>Offsetting {carbonOffset}kg of CO₂</p>
  <MiniMap location={gpsLocation} />
  <Button>Download Certificate</Button>
</WrapSlide>
```

## Subscription Gating

### Free Plan
- See total trees planted (aggregate)
- No GPS tracking
- No certificates

### Pro Plan
- GPS-tracked tree locations
- Interactive map
- Digital certificates
- Impact dashboard

### Enterprise Plan
- Everything in Pro
- Custom conservation partners
- Branded certificates
- API access to impact data

## Verification Process

### Manual Verification
1. Partner plants trees
2. Takes GPS-tagged photos
3. Uploads to platform
4. Admin verifies and marks as verified

### Automated Verification (Future)
- Satellite imagery analysis
- Drone verification
- Blockchain-based tracking

## Carbon Offset Calculation

```typescript
const CO2_PER_TREE_KG = 500; // Average over 10 years

function calculateCarbonOffset(trees: number): number {
  return trees * CO2_PER_TREE_KG;
}

function formatCarbonOffset(kg: number): string {
  if (kg >= 1000) {
    return `${(kg / 1000).toFixed(1)} tonnes`;
  }
  return `${kg}kg`;
}
```

## Marketing & Sharing

### Social Media Templates
```tsx
// Auto-generate shareable impact cards
<ImpactShareCard>
  <h3>I helped plant {trees} trees! 🌳</h3>
  <p>Through my safari with {operatorName}</p>
  <p>Location: {location}</p>
  <img src={mapSnapshot} />
  <p>#SafariWrap #Conservation #TreePlanting</p>
</ImpactShareCard>
```

## Analytics

### Track Impact Metrics
- Total trees planted per operator
- Trees per event type
- Geographic distribution
- Verification rate
- Certificate downloads
- Social shares of impact

## Future Enhancements

1. **Blockchain Integration**: Immutable tree planting records
2. **NFT Certificates**: Collectible impact certificates
3. **Live Tracking**: Real-time tree growth updates
4. **Multiple Partners**: Support various conservation organizations
5. **Species Selection**: Let guests choose tree species
6. **Impact Leaderboard**: Gamify conservation efforts
