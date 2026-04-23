# Implementation Plan: Payment and Platform Features

## Overview

This implementation plan transforms SafariWrap from a safari-focused MVP into a comprehensive Experience Intelligence Platform. The implementation covers payment integration with Snippe.sh, multi-vertical event support (safari, marathon, tour), environmental impact tracking with GPS-verified tree planting, advanced wrap generation with animations, and enhanced QR code functionality with analytics.

The plan follows an incremental approach: database migrations first, then payment infrastructure, multi-vertical support, environmental features, wrap enhancements, QR improvements, and comprehensive property-based testing throughout.

## Tasks

- [ ] 1. Database schema migrations for multi-vertical and payment support
  - [ ] 1.1 Create subscription and payment tables
    - Create `subscriptions` table with plan, status, expires_at, snippesh_subscription_id, snippesh_customer_id
    - Create `payments` table with amount, currency, status, provider, transaction_id, metadata
    - Add indexes on operator_id, status, and transaction_id columns
    - _Requirements: 1.6, 1.7, 1.8, 26.1, 26.2_
  
  - [ ]* 1.2 Write property test for subscription field validation
    - **Property 5: Subscription Plan Field Validation**
    - **Property 6: Subscription Status Field Validation**
    - **Validates: Requirements 1.7, 1.8**
  
  - [ ] 1.3 Migrate trips table to events table
    - Rename `trips` to `events`
    - Add `type` column with CHECK constraint ('safari', 'marathon', 'tour')
    - Add `metadata` JSONB column for type-specific data
    - Migrate existing destination_ids and destination_names to metadata for safari events
    - Update all foreign key references from trips to events
    - _Requirements: 21.1, 21.2, 21.3, 21.4, 21.5, 21.6_
  
  - [ ]* 1.4 Write property test for migration data preservation
    - **Property 12: Migration Data Preservation**
    - **Validates: Requirements 21.6, 23.1**
  
  - [ ] 1.5 Create environmental impact tables
    - Create `tree_activities` table with event_id, trees_planted, planting_date, co2_offset_kg (computed), certificate_url
    - Create `gps_locations` table with tree_activity_id, latitude, longitude, location_name, verified
    - Add CHECK constraints for GPS coordinate ranges (-90 to 90 latitude, -180 to 180 longitude)
    - Add CHECK constraint for trees_planted > 0
    - _Requirements: 9.4, 10.2, 10.4, 12.1_
  
  - [ ]* 1.6 Write property test for GPS coordinate validation
    - **Property 14: GPS Coordinate Validity**
    - **Validates: Requirements 10.2**
  
  - [ ] 1.7 Create QR code and analytics tables
    - Create `qr_codes` table with event_id, short_code (unique, 8 chars), code_url, scans_count, unique_scans_count
    - Create `qr_code_scans` table with qr_code_id, ip_address, user_agent, location_country, location_city, converted_to_review, scanned_at
    - Add unique index on short_code
    - _Requirements: 18.6, 18.7, 19.1, 19.2, 19.3_
  
  - [ ]* 1.8 Write property test for QR code uniqueness
    - **Property 7: QR Code Uniqueness**
    - **Property 15: Short Code Format**
    - **Validates: Requirements 18.7, 18.8**

- [ ] 2. Checkpoint - Verify database migrations
  - Ensure all migrations run successfully, verify data integrity, ask the user if questions arise.

- [ ] 3. TypeScript type definitions and validation
  - [ ] 3.1 Create event type definitions
    - Define EventType union type ('safari' | 'marathon' | 'tour')
    - Create BaseEvent, SafariEvent, MarathonEvent, TourEvent interfaces
    - Define metadata structures for each event type
    - _Requirements: 6.1, 6.5, 6.6, 6.7_
  
  - [ ] 3.2 Create subscription type definitions
    - Define SubscriptionPlan and SubscriptionStatus types
    - Create Subscription and Payment interfaces
    - Define CheckoutSession and WebhookEvent types
    - _Requirements: 1.1, 1.6, 2.1, 3.1_
  
  - [ ] 3.3 Create environmental impact type definitions
    - Define TreeActivity, GPSLocation, ImpactMetrics interfaces
    - Create Certificate type for impact certificates
    - _Requirements: 9.3, 10.1, 11.2, 12.1_
  
  - [ ] 3.4 Implement JSON schema validators for event metadata
    - Create SafariMetadataSchema, MarathonMetadataSchema, TourMetadataSchema
    - Implement EventMetadataParser class with parse() and serialize() methods
    - Add type guards: isSafariEvent(), isMarathonEvent(), isTourEvent()
    - _Requirements: 6.8, 22.1, 22.2, 22.3, 31.1, 31.2_
  
  - [ ]* 3.5 Write property tests for metadata validation
    - **Property 21: Safari Metadata Validation**
    - **Property 22: Marathon Metadata Validation**
    - **Property 23: Tour Metadata Validation**
    - **Property 24: Metadata Schema Validation**
    - **Property 28: Metadata Round-Trip Integrity**
    - **Validates: Requirements 6.5, 6.6, 6.7, 6.8, 31.5**
  
  - [ ] 3.6 Implement subscription data serializer
    - Create SubscriptionSerializer class with serialize() and deserialize() methods
    - Exclude sensitive fields (API keys, webhook secrets)
    - Format dates as ISO 8601 strings
    - Include computed fields (days_until_expiration, is_active)
    - _Requirements: 32.1, 32.2, 32.3, 32.4_
  
  - [ ]* 3.7 Write property tests for subscription serialization
    - **Property 35: Subscription Round-Trip Integrity**
    - **Property 36: Null Value Consistency**
    - **Validates: Requirements 32.6, 32.7**

- [ ] 4. Snippe.sh payment integration
  - [ ] 4.1 Set up Snippe.sh environment configuration
    - Add SNIPESH_API_KEY, SNIPESH_WEBHOOK_SECRET, NEXT_PUBLIC_SNIPESH_PUBLISHABLE_KEY to .env.local
    - Create lib/snippesh/config.ts with environment variable validation
    - _Requirements: 2.1_
  
  - [ ] 4.2 Implement checkout session creation
    - Create lib/snippesh/checkout.ts with createCheckoutSession() function
    - Accept plan, operatorId, successUrl, cancelUrl parameters
    - Call Snippe.sh API to create checkout session
    - Return checkout URL for redirect
    - _Requirements: 2.1, 2.2, 2.3, 2.4_
  
  - [ ]* 4.3 Write property test for checkout session data completeness
    - **Property 7: Checkout Session Data Completeness**
    - **Validates: Requirements 2.3**
  
  - [ ] 4.4 Create API route for checkout session creation
    - Create app/api/subscriptions/create-checkout/route.ts
    - Validate operator authentication
    - Call createCheckoutSession() and return URL
    - Handle errors with descriptive messages
    - _Requirements: 2.1, 2.7_
  
  - [ ] 4.5 Implement webhook signature verification
    - Create lib/snippesh/webhook-verifier.ts with WebhookVerifier class
    - Implement verify() method using HMAC SHA-256
    - Use timing-safe comparison for signature validation
    - _Requirements: 3.1, 3.2_
  
  - [ ]* 4.6 Write property tests for webhook security
    - **Property 9: Webhook Signature Verification**
    - **Property 10: Invalid Webhook Signature Rejection**
    - **Property 11: Webhook Event Logging**
    - **Property 12: Successful Webhook Response**
    - **Validates: Requirements 3.1, 3.2, 3.8, 3.9**
  
  - [ ] 4.7 Create webhook handler API route
    - Create app/api/webhooks/snippesh/route.ts
    - Verify webhook signature before processing
    - Handle subscription.created, subscription.cancelled, subscription.expired events
    - Handle payment.succeeded, payment.failed events
    - Update subscription and payment records in database
    - Log all webhook events for audit
    - Return 200 on success, 401 on invalid signature
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9_
  
  - [ ]* 4.8 Write property test for payment amount calculation
    - **Property 3: Payment Amount Calculation**
    - **Validates: Requirements 1.4, 1.5**
  
  - [ ] 4.9 Implement customer portal URL generation
    - Create lib/snippesh/portal.ts with generatePortalUrl() function
    - Accept customerId and returnUrl parameters
    - Call Snippe.sh API to generate portal URL
    - _Requirements: 5.1, 5.2, 5.3_
  
  - [ ] 4.10 Create API route for customer portal
    - Create app/api/subscriptions/portal/route.ts
    - Validate operator authentication
    - Generate portal URL and redirect
    - _Requirements: 5.1, 5.5_

- [ ] 5. Checkpoint - Test payment integration
  - Ensure checkout flow works, webhooks process correctly, ask the user if questions arise.

- [ ] 6. Feature gating implementation
  - [ ] 6.1 Create FeatureGate utility class
    - Implement checkAccess() method to verify subscription status server-side
    - Implement enforceLimit() method for resource limits (events, reviews)
    - Define plan features and limits (Free: 2 events, 10 reviews; Pro/Enterprise: unlimited)
    - _Requirements: 4.1, 4.2, 4.5, 4.6_
  
  - [ ]* 6.2 Write property tests for feature gating
    - **Property 1: Default Plan Assignment**
    - **Property 2: Free Plan Event Limit Enforcement**
    - **Property 3: Free Plan Review Limit Enforcement**
    - **Property 13: Subscription Expiration Logic**
    - **Property 16: Server-Side Feature Gate Validation**
    - **Validates: Requirements 1.2, 1.3, 4.1, 4.2, 4.5, 4.6**
  
  - [ ] 6.3 Create withFeatureGate middleware
    - Implement middleware to protect API routes
    - Check subscription status before allowing access
    - Return 403 for insufficient permissions
    - _Requirements: 4.6_
  
  - [ ] 6.4 Apply feature gates to event creation
    - Add feature gate check to POST /api/events
    - Enforce Free plan limit of 2 events
    - Display upgrade prompt when limit reached
    - _Requirements: 4.1, 4.8_
  
  - [ ] 6.5 Apply feature gates to review submission
    - Add feature gate check to POST /api/reviews
    - Enforce Free plan limit of 10 reviews per event
    - Display upgrade prompt when limit reached
    - _Requirements: 4.2, 4.8_
  
  - [ ] 6.6 Implement branding control in wraps
    - Add logic to include/exclude SafariWrap branding based on subscription plan
    - Free plan: include branding
    - Pro/Enterprise: exclude branding
    - _Requirements: 4.3, 4.4_
  
  - [ ]* 6.7 Write property tests for branding control
    - **Property 13: Free Plan Branding Inclusion**
    - **Property 14: Paid Plan Branding Exclusion**
    - **Validates: Requirements 4.3, 4.4**

- [ ] 7. Multi-vertical event management
  - [ ] 7.1 Create event creation API with type support
    - Update POST /api/events to accept type parameter
    - Validate metadata based on event type using EventMetadataParser
    - Store event with type and metadata in events table
    - _Requirements: 6.2, 6.3, 6.4, 6.8_
  
  - [ ]* 7.2 Write property tests for event type handling
    - **Property 18: Event Type Requirement**
    - **Property 19: Event Type Storage**
    - **Property 20: Type-Specific Metadata Storage**
    - **Validates: Requirements 6.2, 6.3, 6.4**
  
  - [ ] 7.3 Create dynamic review form components
    - Create components/reviews/SafariReviewForm.tsx with safari-specific fields
    - Create components/reviews/MarathonReviewForm.tsx with marathon-specific fields
    - Create components/reviews/TourReviewForm.tsx with tour-specific fields
    - Implement form field selection based on event type
    - _Requirements: 7.1, 7.2, 7.3, 7.4_
  
  - [ ] 7.4 Update review submission API for multi-vertical
    - Update POST /api/reviews to accept type-specific metadata
    - Validate review data against event type schema
    - Store type-specific data in metadata JSONB column
    - _Requirements: 7.5, 7.6, 7.7_
  
  - [ ] 7.5 Create vertical-specific wrap templates
    - Create lib/wraps/templates/safari-template.ts
    - Create lib/wraps/templates/marathon-template.ts
    - Create lib/wraps/templates/tour-template.ts
    - Implement template selection based on event type
    - _Requirements: 8.1, 8.2, 8.3, 8.4_
  
  - [ ] 7.6 Implement backward compatibility for safari data
    - Add migration logic to read destination data from metadata
    - Support both old and new data structures during transition
    - Ensure existing safari events display correctly
    - _Requirements: 23.1, 23.2, 23.3, 23.4, 23.5_

- [ ] 8. Environmental impact tracking
  - [ ] 8.1 Implement tree allocation logic
    - Create lib/environmental/tree-allocator.ts
    - Implement allocateTrees() function with formula: 1-10 reviews = 1 tree, 11-25 = 2 trees, 26+ = 3 trees
    - Create TreeActivity record after review submission
    - Only allocate for Pro/Enterprise operators
    - _Requirements: 9.1, 9.2, 9.3, 9.6_
  
  - [ ]* 8.2 Write property test for tree allocation formula
    - **Property 4: Tree Allocation Formula**
    - **Validates: Requirements 9.2**
  
  - [ ] 8.3 Implement GPS location assignment
    - Create lib/environmental/gps-manager.ts
    - Implement assignGPSLocation() function
    - Use predefined Kilimanjaro Project planting site coordinates
    - Store GPS coordinates in gps_locations table
    - _Requirements: 10.1, 10.2, 10.3, 10.4_
  
  - [ ] 8.4 Implement carbon offset calculation
    - Create lib/environmental/carbon-calculator.ts
    - Implement calculateCarbonOffset() function: CO2_offset_kg = trees_planted * 22
    - Store as computed column in tree_activities table
    - _Requirements: 12.1, 12.2, 12.6_
  
  - [ ]* 8.5 Write property test for carbon offset calculation
    - **Property 10: Carbon Offset Calculation**
    - **Validates: Requirements 12.1**
  
  - [ ] 8.6 Create impact certificate generator
    - Create lib/environmental/certificate-generator.ts
    - Generate PDF certificate with guest name, event name, trees planted, GPS coordinates
    - Generate shareable image for social media
    - Include unique certificate ID for verification
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7_
  
  - [ ] 8.7 Create environmental impact dashboard
    - Create components/dashboard/EnvironmentalImpact.tsx
    - Display total trees planted, CO2 offset, timeline chart
    - Show interactive map with tree planting locations
    - Allow filtering by date range and event
    - _Requirements: 24.1, 24.2, 24.3, 24.4, 24.5, 24.6, 24.7_
  
  - [ ] 8.8 Implement interactive tree map visualization
    - Create components/maps/TreeMap.tsx using Leaflet or Mapbox
    - Display markers for each planting location
    - Implement marker clustering for performance
    - Add popups with location details on marker click
    - _Requirements: 25.1, 25.2, 25.3, 25.4, 25.5, 25.6, 25.7, 25.8_

- [ ] 9. Checkpoint - Verify environmental features
  - Ensure tree allocation works, GPS tracking functions, certificates generate, ask the user if questions arise.

- [ ] 10. Advanced wrap generation
  - [ ] 10.1 Implement photo selection algorithm
    - Create lib/wraps/photo-selector.ts with PhotoSelector class
    - Score photos based on resolution, file size, face detection, animal detection
    - Select top 3-5 photos based on combined scores
    - Cache photo analysis results in Redis
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 15.6, 15.7, 15.8_
  
  - [ ]* 10.2 Write property test for photo selection limit
    - **Property 9: Photo Selection Limit**
    - **Validates: Requirements 15.6**
  
  - [ ] 10.2 Create wrap slide generation system
    - Create lib/wraps/slide-generator.ts with WrapGenerator class
    - Implement generateIntroSlide(), generateStatsSlide(), generatePhotoSlides()
    - Implement generateImpactSlide(), generateSharingSlide()
    - Aggregate data from review and event for each slide
    - _Requirements: 28.1, 28.2, 28.3, 28.4, 28.5, 28.6, 28.7, 28.8_
  
  - [ ]* 10.3 Write property test for wrap slide count
    - **Property 8: Wrap Slide Count**
    - **Validates: Requirements 28.7**
  
  - [ ] 10.4 Implement story-style navigation
    - Create components/wraps/WrapViewer.tsx with slide navigation
    - Support swipe gestures on mobile (left/right)
    - Add arrow buttons for desktop navigation
    - Display progress indicator
    - Prevent navigation beyond first/last slide
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6, 13.7, 13.8_
  
  - [ ]* 10.5 Write property test for swipe gesture threshold
    - **Property 16: Swipe Gesture Threshold**
    - **Validates: Requirements 17.2, 17.3**
  
  - [ ] 10.6 Add Framer Motion animations
    - Install framer-motion dependency
    - Implement fade-in and slide-up animations for slide elements
    - Add stagger animations with 100ms delays
    - Implement slide transitions with easing curves
    - Add count-up animations for stats
    - Respect user's reduced motion preferences
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5, 14.6, 14.7_
  
  - [ ] 10.7 Implement mobile swipe gesture support
    - Create lib/gestures/swipe-detector.ts
    - Track touch drag distance
    - Trigger slide transition if drag > 50 pixels
    - Snap back if drag < 50 pixels
    - Provide visual feedback during drag
    - Disable gestures during transitions
    - _Requirements: 17.1, 17.2, 17.3, 17.4, 17.5, 17.6, 17.7_
  
  - [ ] 10.8 Create Open Graph image generator
    - Create lib/wraps/og-image-generator.ts
    - Generate 1200x630 pixel OG images
    - Include guest name, event name, featured photo
    - Include/exclude branding based on subscription plan
    - Cache generated images
    - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.5, 16.6, 16.7_
  
  - [ ]* 10.9 Write property test for OG image dimensions
    - **Property 17: OG Image Dimensions**
    - **Validates: Requirements 16.3**
  
  - [ ] 10.10 Implement wrap sharing functionality
    - Create components/wraps/ShareButtons.tsx
    - Add share buttons for WhatsApp, Facebook, Twitter, Instagram
    - Implement "Copy Link" button with clipboard API
    - Track share events for analytics
    - Include OG metadata in wrap page
    - _Requirements: 29.1, 29.2, 29.3, 29.4, 29.5, 29.6, 29.7, 29.8_

- [ ] 11. Enhanced QR code functionality
  - [ ] 11.1 Implement branded QR code generation
    - Create lib/qr/qr-generator.ts
    - Generate QR codes with operator brand colors
    - Include operator logo in center if provided
    - Support PNG and SVG formats
    - Generate at 512x512 pixels minimum
    - _Requirements: 18.1, 18.2, 18.3, 18.4, 18.5_
  
  - [ ] 11.2 Implement short code generation
    - Create lib/qr/short-code-generator.ts
    - Generate unique 8-character alphanumeric codes
    - Ensure case-insensitive uniqueness
    - Format: safariwrap.com/r/{short_code}
    - _Requirements: 18.6, 18.7, 18.8_
  
  - [ ] 11.3 Create QR code analytics tracking
    - Create app/api/qr/scan/route.ts to handle QR code scans
    - Record scan events with timestamp, user agent, IP address
    - Track unique scans based on IP + user agent
    - Track conversion rate (scans → reviews)
    - Implement IP geolocation for scan location
    - _Requirements: 19.1, 19.2, 19.3, 19.4, 19.7, 19.8_
  
  - [ ] 11.4 Create QR code analytics dashboard
    - Create components/qr/QRAnalytics.tsx
    - Display total scans, unique scans, conversion rate
    - Show scan location map
    - Aggregate metrics across events
    - _Requirements: 19.5, 19.6_
  
  - [ ] 11.5 Create print-ready QR templates
    - Create lib/qr/template-generator.ts
    - Generate templates in A4, Letter, 4x6 inch sizes
    - Include QR code, event name, guest instructions
    - Use operator branding (colors, logo)
    - Generate high-resolution PDFs (300 DPI)
    - Include fallback short URL
    - _Requirements: 20.1, 20.2, 20.3, 20.4, 20.5, 20.6, 20.7_

- [ ] 12. Subscription management UI
  - [ ] 12.1 Create pricing page
    - Create app/(authenticated)/pricing/page.tsx
    - Display all three plans (Free, Pro, Enterprise)
    - Show feature comparison table
    - Highlight recommended plan based on usage
    - Add CTA buttons for each plan
    - _Requirements: 30.1, 30.2_
  
  - [ ] 12.2 Create subscription upgrade flow
    - Implement upgrade button in dashboard
    - Redirect to pricing page with usage-based recommendation
    - Handle checkout session creation and redirect
    - Update subscription status after successful payment
    - Display new plan and unlocked features
    - Send confirmation email
    - _Requirements: 30.1, 30.2, 30.3, 30.4, 30.5, 30.6, 30.7_
  
  - [ ] 12.3 Create subscription management UI
    - Create components/settings/SubscriptionManager.tsx
    - Display current plan and status
    - Show "Manage Subscription" button linking to customer portal
    - Display payment history
    - _Requirements: 4.7, 5.1, 26.7_
  
  - [ ] 12.4 Create upgrade prompts
    - Create components/prompts/UpgradePrompt.tsx
    - Display when user hits plan limits
    - Show specific limit reached and upgrade options
    - Link to pricing page
    - _Requirements: 4.8_

- [ ] 13. Checkpoint - Test complete feature set
  - Ensure all features work end-to-end, verify integrations, ask the user if questions arise.

- [ ] 14. Performance optimizations
  - [ ] 14.1 Implement database query optimizations
    - Create indexes: idx_reviews_event_created, idx_tree_activities_event
    - Create materialized view operator_metrics for dashboard
    - Optimize wrap generation queries
    - _Requirements: 24.8, 28.8_
  
  - [ ] 14.2 Implement multi-level caching
    - Create lib/cache/cache-manager.ts
    - Implement L1 memory cache and L2 Redis cache
    - Cache photo analysis results
    - Cache OG images
    - Cache subscription status (1 hour TTL)
    - _Requirements: 15.8, 16.5, 27.1, 27.2, 27.3_
  
  - [ ] 14.3 Implement subscription status synchronization
    - Create lib/subscriptions/sync.ts
    - Query Snippe.sh API to verify subscription status
    - Check cached status age on login (refresh if > 1 hour)
    - Implement retry logic with exponential backoff
    - Handle API failures gracefully
    - _Requirements: 27.1, 27.2, 27.3, 27.4, 27.5, 27.6, 27.7_

- [ ] 15. Property-based testing implementation
  - [ ]* 15.1 Set up fast-check testing framework
    - Install fast-check library
    - Configure test runner for property-based tests
    - Create custom generators for domain types (UUIDs, dates, metadata)
    - Set minimum 100 iterations per property test
  
  - [ ]* 15.2 Implement remaining property tests for payment features
    - **Property 8: Payment Provider Data Storage**
    - **Property 15: Expired Subscription Access Control**
    - **Property 17: Customer Portal URL Generation**
    - **Property 18: Payment Record Immutability**
    - **Validates: Requirements 2.6, 4.5, 5.2, 26.5**
  
  - [ ]* 15.3 Implement property tests for wrap generation
    - **Property 19: Wrap URL Uniqueness**
    - **Validates: Requirements 28.8**
  
  - [ ]* 15.4 Implement property tests for error handling
    - **Property 20: Metadata Validation Rejection**
    - **Property 27: Parse Error Handling**
    - **Property 30: Unexpected Field Rejection**
    - **Validates: Requirements 22.4, 31.3, 31.7**
  
  - [ ]* 15.5 Implement property tests for serialization
    - **Property 31: Subscription Serialization**
    - **Property 32: Sensitive Field Exclusion**
    - **Property 33: Date Format Standardization**
    - **Property 34: Computed Field Inclusion**
    - **Validates: Requirements 32.1, 32.2, 32.3, 32.4**
  
  - [ ]* 15.6 Implement property tests for event parsing
    - **Property 25: Event Metadata Parsing**
    - **Property 26: Metadata Schema Validation on Parse**
    - **Property 29: Optional Field Default Handling**
    - **Validates: Requirements 31.1, 31.2, 31.6**

- [ ] 16. Final checkpoint - Complete testing and verification
  - Ensure all tests pass (unit, integration, property-based), verify production readiness, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional property-based testing tasks and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation throughout implementation
- Property tests validate universal correctness properties with 100+ iterations each
- The implementation uses TypeScript throughout for type safety
- Database migrations must be tested with backup and rollback procedures
- Payment integration should use Snippe.sh test mode during development
- Environmental impact features require Pro or Enterprise subscription
- All API routes must implement proper authentication and authorization
- Feature gates must be enforced server-side for security
- Caching strategy uses multi-level approach (memory + Redis) for performance
- Photo selection algorithm uses scoring system for quality assessment
- Wrap generation creates 6-8 slides with smooth animations
- QR codes support branding customization and analytics tracking
- Subscription synchronization ensures accurate access control
