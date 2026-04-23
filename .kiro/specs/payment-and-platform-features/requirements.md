# Requirements Document: Payment and Platform Features

## Introduction

This specification defines the requirements for extending the SafariWrap platform with payment integration, multi-vertical support, environmental impact tracking, advanced wrap generation, and enhanced QR code functionality. These features transform SafariWrap from a safari-focused MVP into a comprehensive Experience Intelligence Platform supporting multiple experience types (safaris, marathons, tours) with monetization, environmental impact tracking, and viral sharing capabilities.

## Current State Analysis

### Existing Implementation (Completed Phases 0-6)

SafariWrap currently operates as a functional safari-focused platform with the following implemented features:

#### Database Schema (Current)
The platform uses Supabase PostgreSQL with 5 core tables, all with RLS enabled:

1. **operators** - Safari tour operators (0 records currently)
   - Links to auth.users via foreign key
   - Stores business info, branding colors (#1B4D3E, #F4C542)
   - No subscription management yet

2. **destinations** - Pre-seeded safari locations (10 records)
   - Serengeti, Ngorongoro, Masai Mara, etc.
   - Includes fun facts, wildlife highlights, emojis

3. **trips** - Safari expeditions (0 records currently)
   - Safari-specific schema with destination_ids/destination_names arrays
   - Status: 'Upcoming' | 'Completed'
   - Generates review links automatically

4. **reviews** - Guest feedback (0 records currently)
   - Safari-specific fields: big_five_seen, other_animals, safari_duration
   - Supports 3 photo uploads per review
   - Data/marketing consent tracking

5. **safari_wraps** - Generated visual summaries (0 records currently)
   - Links to reviews and trips
   - Includes tree GPS coordinates (default: Kilimanjaro)

#### Current Features
- ✅ **Authentication**: Supabase Auth with role-based access (operators, admin, guests)
- ✅ **Operator Dashboard**: Trip management, stats display, review viewing
- ✅ **Trip Creation**: Safari trip setup with destination selection
- ✅ **QR Code Generation**: Basic review links (format: /review?trip={tripId})
- ✅ **Guest Review System**: Safari-specific forms with photo uploads
- ✅ **Basic Wrap Generation**: Simple visual summaries
- ✅ **File Storage**: Supabase Storage for photos and assets
- ✅ **Mobile-First UI**: TailwindCSS 4, Plus Jakarta Sans, Safari theming
- ✅ **Admin Panel**: System management for operators and trips

#### Current Tech Stack
- **Frontend**: Next.js 16 (App Router), React 19, TailwindCSS 4
- **Backend**: Supabase (Auth, Database, Storage)
- **State Management**: React Query for caching
- **Styling**: Plus Jakarta Sans, Safari color palette
- **Deployment**: Vercel (configured)

#### Current API Endpoints
- `GET/POST /api/admin/trips` - Admin trip management
- `GET/POST /api/admin/reviews` - Admin review management  
- `GET/POST /api/admin/operators` - Admin operator management
- `GET /api/admin/stats` - Dashboard statistics
- Trip creation, review submission, wrap generation (basic)

### Gaps Analysis: Current vs Target State

#### Missing Core Infrastructure
1. **Payment System**: No Snippe.sh integration, subscription management, or feature gating
2. **Multi-Vertical Support**: Schema is safari-only (trips table, not events)
3. **Environmental Impact**: No tree planting, GPS tracking, or impact certificates
4. **Advanced Wraps**: No story-style navigation, animations, or smart photo selection
5. **Enhanced QR Codes**: No analytics, branding, or print templates

#### Schema Migration Required
- **trips → events**: Add type column, metadata JSONB, migrate existing data
- **Add subscription tables**: subscriptions, payments
- **Add environmental tables**: tree_activities, gps_locations  
- **Add QR analytics**: qr_codes, qr_code_scans
- **Extend reviews**: Add metadata JSONB for multi-vertical data

#### Missing Business Logic
- Subscription plan enforcement (Free: 2 events, 10 reviews/event)
- Feature gating based on subscription tier
- Tree allocation formulas (1-3 trees based on review count)
- Carbon offset calculations (22kg CO2 per tree)
- Smart photo selection algorithms
- OG image generation for social sharing

#### Missing UI Components
- Pricing page and subscription management
- Multi-vertical event creation forms
- Story-style wrap navigation with swipe gestures
- Environmental impact dashboard and tree map
- QR code customization and analytics

This requirements document addresses all gaps to transform the current safari-only MVP into a comprehensive multi-vertical Experience Intelligence Platform with full payment integration and environmental impact tracking.

## Glossary

- **Platform**: The SafariWrap Experience Intelligence Platform
- **Operator**: A business user who manages events and guests (safari operators, marathon organizers, tour companies)
- **Guest**: An end-user who participates in an experience and receives a wrap
- **Event**: A scheduled experience (safari trip, marathon race, guided tour)
- **Wrap**: A shareable digital story summarizing a guest's experience
- **Vertical**: A category of experience type (safari, marathon, tour)
- **Subscription**: A paid plan that grants access to platform features
- **Snippe_Payment_Provider**: The payment service provider (Snippe.sh) for subscription management
- **Tree_Activity**: A record of trees planted associated with an event
- **Impact_Certificate**: A digital certificate showing environmental contribution
- **QR_Code**: A scannable code that links guests to review submission forms
- **Slide**: An individual screen within a wrap story
- **Review_Form**: The interface where guests submit feedback and photos
- **Feature_Gate**: Logic that restricts functionality based on subscription tier
- **Webhook**: An HTTP callback from Snippe.sh for payment events
- **RLS_Policy**: Row Level Security policy in the database
- **OG_Image**: Open Graph image for social media sharing previews

## Requirements

### Requirement 1: Subscription Plan Management

**User Story:** As an Operator, I want to subscribe to a paid plan, so that I can access premium features and scale my business.

#### Acceptance Criteria

1. THE Platform SHALL support three subscription tiers: Free, Pro, and Enterprise
2. WHEN an Operator signs up, THE Platform SHALL assign them the Free plan by default
3. THE Free plan SHALL limit Operators to 2 events maximum and 10 reviews per event
4. THE Pro plan SHALL provide unlimited events, unlimited reviews, and environmental impact tracking for $29/month
5. THE Enterprise plan SHALL provide all Pro features plus multi-user accounts and API access for $99/month
6. THE Platform SHALL store subscription data including plan type, status, expiration date, and Snippe_Payment_Provider identifiers
7. FOR ALL subscription records, the plan field SHALL be one of: 'free', 'pro', or 'enterprise'
8. FOR ALL subscription records, the status field SHALL be one of: 'active', 'cancelled', 'expired', or 'trialing'

### Requirement 2: Snippe.sh Checkout Integration

**User Story:** As an Operator, I want to upgrade my subscription through a secure checkout flow, so that I can access premium features.

#### Acceptance Criteria

1. WHEN an Operator selects a paid plan, THE Platform SHALL create a Snippe_Payment_Provider checkout session
2. THE Platform SHALL redirect the Operator to the Snippe_Payment_Provider hosted checkout page
3. THE checkout session SHALL include the selected plan, Operator identifier, success URL, and cancel URL
4. WHEN checkout is successful, THE Snippe_Payment_Provider SHALL redirect to the success URL with session metadata
5. WHEN checkout is cancelled, THE Snippe_Payment_Provider SHALL redirect to the cancel URL
6. THE Platform SHALL store the Snippe_Payment_Provider subscription ID and customer ID after successful checkout
7. THE Platform SHALL handle checkout session creation failures by returning an error message to the Operator

### Requirement 3: Payment Webhook Processing

**User Story:** As the Platform, I want to receive real-time payment events from Snippe.sh, so that I can update subscription status automatically.

#### Acceptance Criteria

1. WHEN the Snippe_Payment_Provider sends a webhook event, THE Platform SHALL verify the webhook signature using the webhook secret
2. IF the webhook signature is invalid, THEN THE Platform SHALL reject the request with a 401 status code
3. WHEN a 'subscription.created' event is received, THE Platform SHALL create or update the subscription record with status 'active'
4. WHEN a 'subscription.cancelled' event is received, THE Platform SHALL update the subscription status to 'cancelled'
5. WHEN a 'subscription.expired' event is received, THE Platform SHALL update the subscription status to 'expired'
6. WHEN a 'payment.succeeded' event is received, THE Platform SHALL create a payment record with status 'completed'
7. WHEN a 'payment.failed' event is received, THE Platform SHALL create a payment record with status 'failed'
8. THE Platform SHALL log all webhook events for audit purposes
9. THE Platform SHALL respond to webhook requests with a 200 status code after successful processing
10. FOR ALL webhook processing, the operation SHALL complete within 5 seconds to avoid timeout

### Requirement 4: Feature Gating Based on Subscription

**User Story:** As the Platform, I want to restrict features based on subscription tier, so that I can enforce the business model.

#### Acceptance Criteria

1. WHEN a Free plan Operator attempts to create a third event, THE Platform SHALL prevent creation and display an upgrade prompt
2. WHEN a Free plan Operator attempts to collect an 11th review for an event, THE Platform SHALL prevent submission and display an upgrade prompt
3. WHEN a Free plan Operator views a wrap, THE Platform SHALL include SafariWrap branding
4. WHEN a Pro or Enterprise Operator views a wrap, THE Platform SHALL exclude SafariWrap branding
5. WHEN an Operator with an expired subscription attempts to create an event, THE Platform SHALL prevent creation and prompt for renewal
6. THE Platform SHALL check subscription status server-side before granting access to gated features
7. THE Platform SHALL display the current subscription tier in the Operator dashboard
8. WHEN an Operator reaches a plan limit, THE Platform SHALL display the specific limit reached and upgrade options

### Requirement 5: Subscription Management Portal

**User Story:** As an Operator, I want to manage my subscription, so that I can update payment methods, view invoices, and cancel if needed.

#### Acceptance Criteria

1. WHEN an Operator clicks "Manage Subscription" in settings, THE Platform SHALL redirect to the Snippe_Payment_Provider customer portal
2. THE customer portal URL SHALL be generated using the Operator's Snippe_Payment_Provider customer ID
3. THE customer portal SHALL allow the Operator to update payment methods, view invoices, and cancel subscriptions
4. WHEN the Operator completes actions in the portal, THE Snippe_Payment_Provider SHALL send webhook events to update the Platform
5. THE Platform SHALL provide a return URL that redirects the Operator back to the dashboard after portal actions

### Requirement 6: Multi-Vertical Event Type Support

**User Story:** As an Operator, I want to create events for different experience types, so that I can use the platform for safaris, marathons, and tours.

#### Acceptance Criteria

1. THE Platform SHALL support three event types: 'safari', 'marathon', and 'tour'
2. WHEN an Operator creates an event, THE Platform SHALL require selection of an event type
3. THE Platform SHALL store event type in the events table type column
4. THE Platform SHALL store type-specific data in a JSONB metadata column
5. FOR safari events, the metadata SHALL include destination_ids and destination_names
6. FOR marathon events, the metadata SHALL include distance, start_location, and route_map_url
7. FOR tour events, the metadata SHALL include locations array and tour_type
8. THE Platform SHALL validate metadata structure based on event type before saving
9. WHEN displaying events, THE Platform SHALL render type-specific UI components based on the event type

### Requirement 7: Dynamic Review Forms Per Vertical

**User Story:** As a Guest, I want to submit feedback appropriate to my experience type, so that my wrap accurately reflects my experience.

#### Acceptance Criteria

1. WHEN a Guest accesses a review form for a safari event, THE Platform SHALL display safari-specific fields (animal sightings, wildlife highlights)
2. WHEN a Guest accesses a review form for a marathon event, THE Platform SHALL display marathon-specific fields (finish time, pace, difficulty rating)
3. WHEN a Guest accesses a review form for a tour event, THE Platform SHALL display tour-specific fields (locations visited, favorite stop, cultural highlights)
4. THE Platform SHALL determine form fields based on the event type associated with the review link
5. THE Platform SHALL validate submitted data against the expected schema for the event type
6. THE Platform SHALL store type-specific review data in a JSONB metadata column
7. FOR ALL review forms, the Platform SHALL include common fields: guest name, email, star rating, review text, and photo uploads

### Requirement 8: Vertical-Specific Wrap Generation

**User Story:** As a Guest, I want to receive a wrap tailored to my experience type, so that the story resonates with my specific adventure.

#### Acceptance Criteria

1. WHEN a wrap is generated for a safari event, THE Platform SHALL create slides featuring animal sightings, wildlife stats, and conservation impact
2. WHEN a wrap is generated for a marathon event, THE Platform SHALL create slides featuring distance, pace, finish time, and performance metrics
3. WHEN a wrap is generated for a tour event, THE Platform SHALL create slides featuring locations visited, cultural highlights, and travel stats
4. THE Platform SHALL select the wrap template based on the event type
5. THE Platform SHALL aggregate data from the review metadata to populate type-specific slides
6. FOR ALL wrap types, the Platform SHALL include common slides: intro, photos, environmental impact, and sharing

### Requirement 9: Tree Planting Integration

**User Story:** As an Operator, I want trees planted for my events, so that I can offer environmental impact to my guests.

#### Acceptance Criteria

1. WHEN a review is submitted for a Pro or Enterprise Operator's event, THE Platform SHALL allocate trees for planting
2. THE Platform SHALL allocate 1 tree for events with 1-10 reviews, 2 trees for 11-25 reviews, and 3 trees for 26+ reviews
3. THE Platform SHALL create a Tree_Activity record with event ID, trees planted count, and planting date
4. THE Platform SHALL store the Tree_Activity in the tree_activities table
5. WHERE an Operator has environmental impact tracking enabled, THE Platform SHALL display tree planting stats in the dashboard
6. THE Platform SHALL prevent tree allocation for Free plan Operators
7. THE Platform SHALL aggregate total trees planted across all events for an Operator

### Requirement 10: GPS Location Tracking for Trees

**User Story:** As a Guest, I want to see where my tree was planted, so that I can connect with the environmental impact.

#### Acceptance Criteria

1. WHEN a Tree_Activity is created, THE Platform SHALL assign GPS coordinates for the planting location
2. THE Platform SHALL store GPS coordinates in the gps_locations table with latitude, longitude, and location name
3. THE GPS coordinates SHALL represent actual planting sites from the Kilimanjaro Project partnership
4. THE Platform SHALL mark GPS locations as verified when confirmed by the planting partner
5. WHEN a Guest views their wrap, THE Platform SHALL display the GPS coordinates of their tree
6. THE Platform SHALL provide a map visualization showing the tree location
7. THE map SHALL be interactive and allow zooming to the specific planting site

### Requirement 11: Impact Certificate Generation

**User Story:** As a Guest, I want to receive a certificate of my environmental contribution, so that I can share my impact.

#### Acceptance Criteria

1. WHEN a wrap is generated with tree planting data, THE Platform SHALL create an Impact_Certificate
2. THE Impact_Certificate SHALL include guest name, event name, trees planted count, planting date, and GPS coordinates
3. THE Platform SHALL generate a unique certificate ID for verification
4. THE Platform SHALL render the certificate as a downloadable PDF
5. THE Platform SHALL render the certificate as a shareable image for social media
6. THE certificate SHALL include SafariWrap branding and Kilimanjaro Project partnership logo
7. WHEN a Guest clicks "Download Certificate" in their wrap, THE Platform SHALL generate and download the PDF

### Requirement 12: Carbon Offset Calculation

**User Story:** As an Operator, I want to display carbon offset metrics, so that I can communicate environmental value to guests.

#### Acceptance Criteria

1. THE Platform SHALL calculate carbon offset based on trees planted using the formula: CO2_offset_kg = trees_planted * 22
2. WHEN displaying environmental impact, THE Platform SHALL show both trees planted and CO2 offset in kilograms
3. THE Platform SHALL aggregate carbon offset across all events for an Operator
4. THE Platform SHALL display carbon offset in the Operator dashboard
5. THE Platform SHALL include carbon offset data in the wrap environmental impact slide
6. THE calculation SHALL assume 22 kg CO2 absorbed per tree per year (industry standard)

### Requirement 13: Story-Style Wrap Navigation

**User Story:** As a Guest, I want to navigate through my wrap like a story, so that I have an engaging mobile experience.

#### Acceptance Criteria

1. THE Platform SHALL render wraps as a series of 6-8 slides
2. WHEN a Guest views a wrap on mobile, THE Platform SHALL support swipe gestures for navigation
3. WHEN a Guest swipes left, THE Platform SHALL transition to the next slide
4. WHEN a Guest swipes right, THE Platform SHALL transition to the previous slide
5. WHEN a Guest views a wrap on desktop, THE Platform SHALL provide arrow buttons for navigation
6. THE Platform SHALL display a progress indicator showing current slide position
7. THE Platform SHALL prevent navigation beyond the first or last slide
8. THE slide transitions SHALL complete within 300 milliseconds

### Requirement 14: Framer Motion Animations

**User Story:** As a Guest, I want smooth animations in my wrap, so that the experience feels premium and polished.

#### Acceptance Criteria

1. WHEN a slide enters view, THE Platform SHALL animate elements with fade-in and slide-up effects
2. THE Platform SHALL stagger animations for multiple elements on a slide with 100ms delays
3. WHEN transitioning between slides, THE Platform SHALL use slide transitions with easing curves
4. THE Platform SHALL animate stat counters with count-up effects
5. THE Platform SHALL animate photo galleries with scale and fade effects
6. THE animations SHALL respect the user's reduced motion preferences
7. IF the user has reduced motion enabled, THEN THE Platform SHALL disable animations and use instant transitions

### Requirement 15: Smart Photo Selection Algorithm

**User Story:** As the Platform, I want to select the best photos for wraps, so that wraps showcase high-quality imagery.

#### Acceptance Criteria

1. WHEN multiple photos are uploaded in a review, THE Platform SHALL analyze each photo for quality
2. THE Platform SHALL score photos based on resolution, with higher resolution receiving higher scores
3. THE Platform SHALL score photos based on file size, preferring sizes between 500KB and 5MB
4. THE Platform SHALL detect faces in photos and prioritize photos with faces for personal slides
5. THE Platform SHALL detect animals in safari photos and prioritize animal photos for wildlife slides
6. THE Platform SHALL select the top 3-5 photos based on combined scores for inclusion in the wrap
7. THE Platform SHALL ensure at least one photo appears in the wrap if any photos were uploaded
8. THE photo selection algorithm SHALL execute within 2 seconds per review

### Requirement 16: Open Graph Image Generation

**User Story:** As a Guest, I want my wrap to display beautifully when shared on social media, so that my friends see an attractive preview.

#### Acceptance Criteria

1. WHEN a wrap URL is shared on social media, THE Platform SHALL generate an OG_Image for the preview
2. THE OG_Image SHALL include the guest name, event name, and a featured photo from the wrap
3. THE OG_Image SHALL be 1200x630 pixels (standard OG image dimensions)
4. THE OG_Image SHALL include SafariWrap branding unless the Operator has a Pro or Enterprise plan
5. THE Platform SHALL cache generated OG_Images to improve performance
6. THE Platform SHALL regenerate OG_Images when wrap data is updated
7. THE OG_Image generation SHALL complete within 3 seconds

### Requirement 17: Mobile Swipe Gesture Support

**User Story:** As a Guest on mobile, I want to swipe through wrap slides naturally, so that navigation feels intuitive.

#### Acceptance Criteria

1. WHEN a Guest touches and drags on a slide, THE Platform SHALL track the drag distance
2. IF the drag distance exceeds 50 pixels, THEN THE Platform SHALL initiate a slide transition
3. IF the drag distance is less than 50 pixels, THEN THE Platform SHALL snap back to the current slide
4. THE Platform SHALL provide visual feedback during drag with partial slide movement
5. THE Platform SHALL support both left and right swipe directions
6. THE Platform SHALL disable swipe gestures during slide transitions to prevent conflicts
7. THE swipe gesture detection SHALL work on touch-enabled devices (iOS, Android)

### Requirement 18: Enhanced QR Code Generation

**User Story:** As an Operator, I want branded QR codes for my events, so that the codes align with my business identity.

#### Acceptance Criteria

1. WHEN an event is created, THE Platform SHALL generate a QR_Code linking to the review form
2. THE QR_Code SHALL include the Operator's brand colors if provided
3. THE QR_Code SHALL include the Operator's logo in the center if provided
4. THE QR_Code SHALL be downloadable as PNG and SVG formats
5. THE QR_Code SHALL be at least 512x512 pixels for print quality
6. THE QR_Code SHALL encode a short URL in the format: safariwrap.com/r/{short_code}
7. THE Platform SHALL generate a unique 8-character short code for each event
8. THE short code SHALL be alphanumeric and case-insensitive for easy manual entry

### Requirement 19: QR Code Analytics Tracking

**User Story:** As an Operator, I want to track QR code scans, so that I can measure guest engagement.

#### Acceptance Criteria

1. WHEN a QR_Code is scanned, THE Platform SHALL record a scan event with timestamp and user agent
2. THE Platform SHALL track total scans per QR_Code
3. THE Platform SHALL track unique scans based on IP address and user agent combination
4. THE Platform SHALL track conversion rate (scans that result in review submissions)
5. THE Platform SHALL display QR code analytics in the event detail view
6. THE Platform SHALL aggregate scan metrics across all events for the Operator dashboard
7. THE Platform SHALL track scan location based on IP geolocation
8. THE analytics tracking SHALL not block or delay the review form loading

### Requirement 20: Print-Ready QR Templates

**User Story:** As an Operator, I want print-ready QR code materials, so that I can easily distribute codes to guests.

#### Acceptance Criteria

1. THE Platform SHALL provide QR code templates in standard print sizes: A4, Letter, and 4x6 inches
2. THE templates SHALL include the QR_Code, event name, and instructions for guests
3. THE templates SHALL use the Operator's brand colors and logo
4. THE templates SHALL be downloadable as high-resolution PDF files (300 DPI minimum)
5. THE Platform SHALL provide templates for table tents, posters, and business cards
6. THE templates SHALL include a fallback short URL for manual entry
7. THE PDF generation SHALL complete within 5 seconds

### Requirement 21: Database Migration for Multi-Vertical

**User Story:** As the Platform, I want to migrate from safari-specific schema to multi-vertical schema, so that I can support multiple experience types without data loss.

#### Acceptance Criteria

1. THE Platform SHALL rename the trips table to events
2. THE Platform SHALL add a type column to the events table with default value 'safari'
3. THE Platform SHALL add a metadata JSONB column to the events table
4. THE Platform SHALL migrate existing destination_ids and destination_names to the metadata column for safari events
5. THE Platform SHALL update all foreign key references from trips to events
6. THE Platform SHALL preserve all existing data during migration
7. THE migration SHALL execute within 30 seconds for databases with up to 10,000 records
8. THE Platform SHALL create a backup before executing the migration
9. IF the migration fails, THEN THE Platform SHALL rollback to the backup automatically

### Requirement 22: Type-Safe Event Metadata Validation

**User Story:** As the Platform, I want to validate event metadata based on type, so that data integrity is maintained across verticals.

#### Acceptance Criteria

1. WHEN an event is created with type 'safari', THE Platform SHALL validate that metadata contains destination_ids array
2. WHEN an event is created with type 'marathon', THE Platform SHALL validate that metadata contains distance and start_location
3. WHEN an event is created with type 'tour', THE Platform SHALL validate that metadata contains locations array
4. IF metadata validation fails, THEN THE Platform SHALL reject the event creation with a descriptive error message
5. THE Platform SHALL use TypeScript type guards to ensure type safety at compile time
6. THE Platform SHALL use JSON schema validation to ensure data integrity at runtime
7. THE validation SHALL execute before database insertion to prevent invalid data storage

### Requirement 23: Backward Compatibility with Safari Data

**User Story:** As the Platform, I want to maintain compatibility with existing safari data, so that current Operators experience no disruption.

#### Acceptance Criteria

1. WHEN the multi-vertical migration is complete, THE Platform SHALL continue to display existing safari events correctly
2. THE Platform SHALL read destination data from the metadata column for migrated safari events
3. THE Platform SHALL support both old and new data structures during a transition period
4. THE Platform SHALL not require Operators to update existing events after migration
5. THE Platform SHALL generate wraps for pre-migration safari events using the same logic
6. THE Platform SHALL preserve all RLS_Policy rules for migrated data
7. THE Platform SHALL maintain API backward compatibility for at least 90 days post-migration

### Requirement 24: Environmental Impact Dashboard

**User Story:** As an Operator, I want to view my environmental impact metrics, so that I can communicate value to stakeholders.

#### Acceptance Criteria

1. THE Platform SHALL display total trees planted across all events in the Operator dashboard
2. THE Platform SHALL display total CO2 offset in kilograms in the Operator dashboard
3. THE Platform SHALL display a timeline chart showing trees planted per month
4. THE Platform SHALL display a map showing all tree planting locations
5. THE Platform SHALL display the number of guests who received impact certificates
6. THE Platform SHALL allow filtering impact metrics by date range
7. THE Platform SHALL allow filtering impact metrics by event
8. THE dashboard SHALL load within 2 seconds with up to 1000 tree activities

### Requirement 25: Interactive Tree Map Visualization

**User Story:** As a Guest, I want to explore tree planting locations on an interactive map, so that I can see the global impact.

#### Acceptance Criteria

1. THE Platform SHALL render an interactive map using Leaflet or Mapbox
2. THE map SHALL display markers for each tree planting location
3. WHEN a Guest clicks a marker, THE Platform SHALL display a popup with location name, trees planted, and planting date
4. THE map SHALL support zooming from world view to street level
5. THE map SHALL support panning to explore different regions
6. THE map SHALL cluster markers when zoomed out to improve performance
7. THE map SHALL load within 3 seconds with up to 500 locations
8. THE map SHALL be responsive and work on mobile devices

### Requirement 26: Payment Record Audit Trail

**User Story:** As the Platform, I want to maintain a complete audit trail of payments, so that I can reconcile transactions and resolve disputes.

#### Acceptance Criteria

1. THE Platform SHALL create a payment record for every transaction attempt
2. THE payment record SHALL include amount, currency, status, provider, transaction ID, and timestamp
3. THE Platform SHALL store payment metadata including Snippe_Payment_Provider event data
4. THE Platform SHALL never delete payment records
5. THE Platform SHALL allow querying payment history by Operator, date range, and status
6. THE Platform SHALL display payment history in the Operator subscription management view
7. THE Platform SHALL export payment records as CSV for accounting purposes
8. THE payment records SHALL be immutable after creation

### Requirement 27: Subscription Status Synchronization

**User Story:** As the Platform, I want to keep subscription status synchronized with Snippe.sh, so that access control is accurate.

#### Acceptance Criteria

1. THE Platform SHALL query the Snippe_Payment_Provider API to verify subscription status on critical operations
2. WHEN an Operator logs in, THE Platform SHALL check if the cached subscription status is older than 1 hour
3. IF the cached status is stale, THEN THE Platform SHALL fetch the current status from Snippe_Payment_Provider
4. THE Platform SHALL update the local subscription record with the fetched status
5. THE Platform SHALL handle API failures gracefully by using cached data and logging the error
6. THE Platform SHALL retry failed synchronization attempts with exponential backoff
7. THE synchronization SHALL complete within 2 seconds under normal conditions

### Requirement 28: Wrap Slide Content Aggregation

**User Story:** As the Platform, I want to aggregate review data into wrap slides, so that wraps tell a compelling story.

#### Acceptance Criteria

1. THE Platform SHALL create an intro slide with guest name, event name, and dates
2. THE Platform SHALL create a stats slide with key metrics (duration, rating, highlights count)
3. THE Platform SHALL create a highlights slide with memorable moments and best experiences
4. THE Platform SHALL create a photo gallery slide with selected photos
5. THE Platform SHALL create an environmental impact slide with trees planted and GPS location
6. THE Platform SHALL create a sharing slide with share buttons and certificate download
7. THE Platform SHALL order slides logically: intro → stats → highlights → photos → impact → sharing
8. THE data aggregation SHALL execute within 1 second per wrap

### Requirement 29: Wrap Sharing Functionality

**User Story:** As a Guest, I want to share my wrap on social media, so that I can showcase my experience to friends.

#### Acceptance Criteria

1. THE Platform SHALL provide share buttons for WhatsApp, Facebook, Twitter, and Instagram
2. WHEN a Guest clicks a share button, THE Platform SHALL open the respective platform's share dialog
3. THE share dialog SHALL include the wrap URL and a pre-filled message
4. THE Platform SHALL provide a "Copy Link" button that copies the wrap URL to clipboard
5. WHEN the link is copied, THE Platform SHALL display a confirmation message
6. THE Platform SHALL track share events for analytics
7. THE Platform SHALL include OG_Image metadata in the wrap page for rich previews
8. THE share functionality SHALL work on both mobile and desktop browsers

### Requirement 30: Subscription Upgrade Flow

**User Story:** As an Operator, I want to upgrade my subscription seamlessly, so that I can access premium features immediately.

#### Acceptance Criteria

1. WHEN a Free plan Operator clicks "Upgrade" in the dashboard, THE Platform SHALL redirect to the pricing page
2. THE pricing page SHALL highlight the recommended plan based on the Operator's usage
3. WHEN an Operator selects a plan, THE Platform SHALL create a checkout session and redirect to Snippe_Payment_Provider
4. WHEN checkout is successful, THE Platform SHALL update the subscription status to 'active' immediately
5. WHEN the Operator returns to the dashboard, THE Platform SHALL display the new plan and unlocked features
6. THE Platform SHALL send a confirmation email with subscription details
7. THE upgrade SHALL take effect within 30 seconds of successful payment

### Requirement 31: Parser for Event Metadata

**User Story:** As the Platform, I want to parse event metadata from JSON, so that I can safely access type-specific fields.

#### Acceptance Criteria

1. WHEN event metadata is retrieved from the database, THE Platform SHALL parse the JSON into a typed object
2. THE Parser SHALL validate the metadata structure against the expected schema for the event type
3. IF parsing fails, THEN THE Platform SHALL return a descriptive error with the validation failure reason
4. THE Platform SHALL provide a Pretty_Printer to format event metadata back to JSON
5. FOR ALL valid event metadata objects, parsing then printing then parsing SHALL produce an equivalent object (round-trip property)
6. THE Parser SHALL handle missing optional fields by providing default values
7. THE Parser SHALL reject metadata with unexpected fields to prevent data corruption

### Requirement 32: Serializer for Subscription Data

**User Story:** As the Platform, I want to serialize subscription data for API responses, so that clients receive consistent data formats.

#### Acceptance Criteria

1. WHEN subscription data is sent to clients, THE Platform SHALL serialize the data to JSON
2. THE Serializer SHALL exclude sensitive fields (Snippe_Payment_Provider API keys, webhook secrets)
3. THE Serializer SHALL format dates as ISO 8601 strings
4. THE Serializer SHALL include computed fields (days_until_expiration, is_active)
5. THE Platform SHALL provide a Deserializer to parse subscription JSON back to objects
6. FOR ALL valid subscription objects, serializing then deserializing SHALL produce an equivalent object (round-trip property)
7. THE Serializer SHALL handle null values consistently across all fields

## Correctness Properties for Property-Based Testing

### Property 1: Subscription Status Consistency
**Category:** Invariant  
**Description:** Subscription status transitions must follow valid state machine rules.  
**Property:** FOR ALL subscription status updates, IF current status is 'active' THEN next status can only be 'cancelled' or 'expired', never 'trialing'.

### Property 2: Feature Gate Enforcement
**Category:** Invariant  
**Description:** Feature access must always respect subscription tier limits.  
**Property:** FOR ALL event creation attempts by Free plan Operators, IF event count >= 2 THEN creation SHALL be rejected.

### Property 3: Payment Amount Calculation
**Category:** Metamorphic  
**Description:** Payment amounts must match subscription plan pricing.  
**Property:** FOR ALL payment records, IF plan is 'pro' THEN amount SHALL equal 29.00, IF plan is 'enterprise' THEN amount SHALL equal 99.00.

### Property 4: Tree Allocation Formula
**Category:** Invariant  
**Description:** Trees allocated must follow the defined formula based on review count.  
**Property:** FOR ALL tree activities, IF review_count <= 10 THEN trees_planted = 1, IF 11 <= review_count <= 25 THEN trees_planted = 2, IF review_count >= 26 THEN trees_planted = 3.

### Property 5: Event Metadata Round-Trip
**Category:** Round Trip  
**Description:** Parsing and printing event metadata must preserve data integrity.  
**Property:** FOR ALL valid event metadata objects, parse(print(metadata)) SHALL equal metadata.

### Property 6: Subscription Data Round-Trip
**Category:** Round Trip  
**Description:** Serializing and deserializing subscription data must preserve data integrity.  
**Property:** FOR ALL valid subscription objects, deserialize(serialize(subscription)) SHALL equal subscription.

### Property 7: QR Code Uniqueness
**Category:** Invariant  
**Description:** Every event must have a unique QR code short code.  
**Property:** FOR ALL events, the short_code SHALL be unique across the entire events table.

### Property 8: Wrap Slide Count
**Category:** Invariant  
**Description:** Generated wraps must contain the correct number of slides.  
**Property:** FOR ALL generated wraps, the slide count SHALL be between 6 and 8 inclusive.

### Property 9: Photo Selection Limit
**Category:** Invariant  
**Description:** Wraps must not exceed the maximum photo count.  
**Property:** FOR ALL wraps, the number of selected photos SHALL be <= 5.

### Property 10: Carbon Offset Calculation
**Category:** Metamorphic  
**Description:** CO2 offset must be proportional to trees planted.  
**Property:** FOR ALL tree activities, co2_offset_kg SHALL equal trees_planted * 22.

### Property 11: Webhook Signature Verification
**Category:** Error Condition  
**Description:** Invalid webhook signatures must be rejected.  
**Property:** FOR ALL webhook requests with invalid signatures, THE Platform SHALL return 401 status code.

### Property 12: Migration Data Preservation
**Category:** Invariant  
**Description:** Database migration must preserve all existing records.  
**Property:** FOR ALL records in trips table before migration, an equivalent record SHALL exist in events table after migration with type='safari'.

### Property 13: Subscription Expiration Logic
**Category:** Invariant  
**Description:** Expired subscriptions must not grant access to paid features.  
**Property:** FOR ALL subscriptions WHERE status='expired', feature gate checks SHALL return false for premium features.

### Property 14: GPS Coordinate Validity
**Category:** Error Condition  
**Description:** GPS coordinates must be within valid ranges.  
**Property:** FOR ALL gps_locations, latitude SHALL be between -90 and 90, AND longitude SHALL be between -180 and 180.

### Property 15: Short Code Format
**Category:** Invariant  
**Description:** QR code short codes must follow the defined format.  
**Property:** FOR ALL generated short codes, the length SHALL equal 8 AND all characters SHALL be alphanumeric.

### Property 16: Swipe Gesture Threshold
**Category:** Invariant  
**Description:** Slide transitions must only occur when swipe distance exceeds threshold.  
**Property:** FOR ALL swipe gestures, IF drag_distance < 50 pixels THEN no slide transition SHALL occur.

### Property 17: OG Image Dimensions
**Category:** Invariant  
**Description:** Generated OG images must have standard dimensions.  
**Property:** FOR ALL generated OG_Images, width SHALL equal 1200 AND height SHALL equal 630.

### Property 18: Payment Record Immutability
**Category:** Invariant  
**Description:** Payment records must never be modified after creation.  
**Property:** FOR ALL payment records, once created, no fields SHALL be updated (only inserts allowed).

### Property 19: Wrap URL Uniqueness
**Category:** Invariant  
**Description:** Every wrap must have a unique URL.  
**Property:** FOR ALL wraps, the wrap_url SHALL be unique across the entire safari_wraps table.

### Property 20: Metadata Validation Rejection
**Category:** Error Condition  
**Description:** Invalid metadata must be rejected before database insertion.  
**Property:** FOR ALL event creation attempts with invalid metadata, THE Platform SHALL reject with error before INSERT operation.
