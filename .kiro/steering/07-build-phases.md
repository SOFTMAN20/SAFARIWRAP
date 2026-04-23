---
title: Build Phases & Implementation Order
inclusion: auto
---

# Build Phases & Implementation Order

## Current Status: Phase 0-6 Complete ✅

### ✅ Phase 0: Frontend UI Design
- Design system established
- Safari-themed colors (#1B4D3E, #F4C542)
- Plus Jakarta Sans typography
- Core pages built (Landing, Dashboard, Review, Wrap)

### ✅ Phase 1: Authentication
- Supabase Auth integrated
- Role-based access (Operator, Admin, Guest)
- Protected routes via middleware
- Signup/Login flows complete

### ✅ Phase 2: Database Design
- Core schema implemented (operators, destinations, trips, reviews, safari_wraps)
- RLS policies configured
- Storage bucket for assets
- 10 destinations pre-seeded

### ✅ Phase 3: Operator Dashboard
- Event management (create, view, edit)
- Review viewing
- Stats display
- Branding customization

### ✅ Phase 4: QR Code System (Partial)
- Review links generated per trip
- Dynamic routes for guest access
- Basic QR flow working

### ✅ Phase 5: Guest Experience
- Review submission form
- Photo uploads (Supabase Storage)
- Animal sightings tracking
- Mobile-optimized UI

### ✅ Phase 6: Wrap Generation Engine (Basic)
- Data aggregation logic
- Wrap data structure
- Basic wrap display
- Auto-generation after review

---

## 🚧 Phase 7: Advanced Wrap UI (IN PROGRESS)

### Goals
Transform basic wrap into Instagram/Spotify-style story experience.

### Tasks
- [ ] Implement slide-based navigation
- [ ] Add Framer Motion animations
- [ ] Create 6-8 distinct slides:
  - Intro slide
  - Stats slide
  - Highlights slide
  - Photo gallery slide
  - Environmental impact slide
  - Sharing slide
- [ ] Mobile swipe gestures
- [ ] Progress indicators
- [ ] Share functionality

### Files to Create/Modify
- `app/wrap/[wrapId]/page.tsx` - Main wrap display
- `components/WrapSlide.tsx` - Individual slide component
- `components/WrapNavigation.tsx` - Slide navigation
- `lib/wrap-animations.ts` - Animation configurations

---

## 📋 Phase 8: Payment System (Snipe.sh)

### Goals
Implement subscription paywall with Snipe.sh integration.

### Tasks
- [ ] Create subscription plans (Free, Pro, Enterprise)
- [ ] Build pricing page
- [ ] Integrate Snipe.sh checkout
- [ ] Implement webhook handler
- [ ] Add feature gating logic
- [ ] Create subscription management UI
- [ ] Add upgrade prompts

### Database Changes
```sql
-- Add subscriptions table
-- Add payments table
```

### Files to Create
- `app/pricing/page.tsx`
- `app/api/subscriptions/create-checkout/route.ts`
- `app/api/subscriptions/portal/route.ts`
- `app/api/webhooks/snipesh/route.ts`
- `lib/subscription.ts` - Feature gating logic
- `components/UpgradePrompt.tsx`
- `components/SubscriptionBadge.tsx`

### Environment Variables
```env
SNIPESH_API_KEY=
SNIPESH_WEBHOOK_SECRET=
NEXT_PUBLIC_SNIPESH_PUBLISHABLE_KEY=
```

---

## 🔄 Phase 9: Multi-Vertical Support

### Goals
Extend platform to support Marathon and Tour events.

### Tasks
- [ ] Rename `trips` table to `events`
- [ ] Add `type` column (safari | marathon | tour)
- [ ] Create type-specific metadata schemas
- [ ] Build dynamic form components
- [ ] Create vertical-specific wrap templates
- [ ] Update all API routes
- [ ] Migrate existing data

### Database Migration
```sql
ALTER TABLE trips RENAME TO events;
ALTER TABLE events ADD COLUMN type TEXT DEFAULT 'safari';
ALTER TABLE events ADD COLUMN metadata JSONB DEFAULT '{}';
```

### Files to Create/Modify
- `lib/types.ts` - Add Event types
- `components/EventForm.tsx` - Dynamic form
- `components/wraps/SafariWrap.tsx`
- `components/wraps/MarathonWrap.tsx`
- `components/wraps/TourWrap.tsx`

---

## 🌱 Phase 10: Green Impact Integration

### Goals
Connect events to tree planting with GPS tracking.

### Tasks
- [ ] Create tree_activities table
- [ ] Create gps_locations table
- [ ] Build impact dashboard
- [ ] Integrate map component (Leaflet/Mapbox)
- [ ] Generate impact certificates
- [ ] Add impact slide to wraps
- [ ] Partner integration (Kilimanjaro Project)

### Files to Create
- `app/api/environmental/tree-activity/route.ts`
- `app/api/environmental/stats/route.ts`
- `app/api/environmental/certificate/route.ts`
- `components/TreeMap.tsx`
- `components/ImpactCertificate.tsx`
- `components/ImpactDashboard.tsx`

### Dependencies
```bash
npm install leaflet react-leaflet
npm install @types/leaflet
```

---

## 📤 Phase 11: Sharing System

### Goals
Make wraps viral with seamless sharing.

### Tasks
- [ ] WhatsApp share integration
- [ ] Facebook/Twitter/Instagram share
- [ ] Copy link functionality
- [ ] Generate OG images for wraps
- [ ] Track share analytics
- [ ] Add share incentives

### Files to Create/Modify
- `app/wrap/[wrapId]/opengraph-image.tsx`
- `components/ShareButtons.tsx`
- `lib/share-utils.ts`

---

## 🛠️ Phase 12: Admin Panel

### Goals
System-wide management and analytics.

### Tasks
- [ ] Build admin dashboard
- [ ] Operator management (suspend, delete)
- [ ] Event moderation
- [ ] Analytics dashboard
- [ ] System health monitoring
- [ ] Payment reconciliation

### Files to Create
- `app/(admin)/admin/analytics/page.tsx`
- `app/(admin)/admin/moderation/page.tsx`
- `app/api/admin/analytics/route.ts`
- `components/AdminAnalytics.tsx`

---

## ⚡ Phase 13: Advanced Features

### AI-Generated Story
- [ ] Integrate OpenAI/Anthropic API
- [ ] Generate narrative from review data
- [ ] Add to wrap slides

### Voice Narration
- [ ] Text-to-speech integration
- [ ] Audio player in wrap
- [ ] Multiple language support

### Smart Photo Selection
- [ ] Image quality analysis
- [ ] Face detection
- [ ] Animal detection (Computer Vision)
- [ ] Composition scoring

### Video Wraps
- [ ] Convert slides to video
- [ ] Add transitions and music
- [ ] Export as MP4

---

## Priority Order (Next Steps)

### Immediate (This Week)
1. **Complete Phase 7**: Advanced Wrap UI
   - Implement slide navigation
   - Add animations
   - Polish mobile experience

### Short Term (Next 2 Weeks)
2. **Phase 8**: Payment Integration
   - Set up Snipe.sh account
   - Build pricing page
   - Implement checkout flow
   - Add feature gating

### Medium Term (Next Month)
3. **Phase 10**: Environmental Impact
   - Create tree tracking tables
   - Build impact dashboard
   - Integrate map component
   - Generate certificates

4. **Phase 11**: Sharing System
   - Add share buttons
   - Generate OG images
   - Track analytics

### Long Term (Next Quarter)
5. **Phase 9**: Multi-Vertical Support
   - Database migration
   - Marathon vertical
   - Tour vertical

6. **Phase 12**: Admin Panel
   - Analytics dashboard
   - Moderation tools

7. **Phase 13**: Advanced Features
   - AI integration
   - Video wraps
   - Computer vision

---

## Testing Strategy

### Per Phase
- Unit tests for business logic
- Integration tests for API routes
- E2E tests for critical flows
- Manual QA on mobile devices

### Key Flows to Test
1. Operator signup → Create event → Generate QR
2. Guest scan QR → Submit review → View wrap
3. Payment flow → Feature unlock
4. Wrap generation → Sharing
5. Environmental impact tracking

---

## Deployment Strategy

### Staging Environment
- Deploy each phase to staging first
- Test with real users
- Gather feedback
- Fix bugs

### Production Rollout
- Feature flags for gradual rollout
- Monitor error rates
- Track performance metrics
- Rollback plan ready

### Database Migrations
- Test migrations on staging
- Backup production database
- Run migrations during low traffic
- Verify data integrity
