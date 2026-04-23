---
title: SafariWrap Platform Overview
inclusion: always
---

# SafariWrap Platform - Project Overview

## Vision
SafariWrap is an **Experience Intelligence Platform** that transforms real-world experiences (safaris, marathons, tours) into shareable digital "wrap" stories, similar to Spotify Wrapped.

## Core Value Proposition
- **For Operators**: Collect guest feedback, generate shareable content, track environmental impact
- **For Guests**: Relive experiences through beautiful visual stories, see environmental contribution
- **For the Planet**: Every experience contributes to tree planting with GPS-tracked impact

## Current Status (Phase 6 Complete + Schema Upgrade)

### ✅ Implemented Features
- **Authentication & Authorization**: Supabase Auth with role-based access (operators, admin, guests)
- **Operator Dashboard**: Trip management, statistics display, review overview
- **Safari Trip Management**: Create trips with destination selection, status tracking
- **Guest Review System**: QR-based access, safari-specific forms, photo uploads (3 per review)
- **Basic Wrap Generation**: Simple visual summaries with tree GPS coordinates
- **Admin Panel**: System management for operators, trips, and reviews
- **File Storage**: Supabase Storage for photos, logos, and assets
- **Mobile-First UI**: TailwindCSS 4, Plus Jakarta Sans, Safari theming

### 📊 Current Database (✨ OPTIMIZED 2026-04-15)
- **10 tables** with RLS enabled: operators, destinations, reviews, subscriptions, payments, events, wraps, qr_codes, tree_activities, gps_locations
- **Multi-vertical ready**: Events table supports Safari, Marathon, Tour types
- **Payment integration ready**: Subscriptions and payments tables for Snippe.sh
- **Environmental tracking**: Tree activities and GPS locations tables
- **Advanced QR system**: QR codes table with analytics (scans, conversions)
- **28 RLS policies**: Comprehensive security across all tables
- **6 functions + 4 triggers**: Automated QR generation, tree allocation, wrap creation
- **10 pre-seeded destinations**: Serengeti, Ngorongoro, Masai Mara, etc.
- **0 active records**: Ready for operator onboarding
- **Legacy tables removed**: trips and safari_wraps cleaned up (2026-04-15)

### 🔧 Current Tech Stack
- **Frontend**: Next.js 16 (App Router), React 19, TailwindCSS 4
- **Backend**: Supabase (Auth, Database, Storage)
- **State Management**: React Query for caching
- **Styling**: Plus Jakarta Sans, Safari color palette (#1B4D3E, #F4C542, #FCFAF5)
- **Deployment**: Vercel (configured)

## Multi-Vertical Support (Planned)

The platform is designed to support multiple experience types:

### 1. Safari (Current Focus - Implemented)
- Animal sightings tracking
- Photo uploads
- Destination highlights
- Conservation impact

### 2. Marathon (Phase 8-9)
- Distance tracking
- Pace metrics
- Checkpoint data
- Performance stats

### 3. Tours (Phase 8-9)
- Location visits
- Cultural highlights
- Group experiences

## Payment Integration (Phase 8)

### Subscription Plans (Snippe.sh)
- **Free**: 2 events, 10 reviews/event, basic wraps, SafariWrap branding
- **Pro (TZS 75,000/month)**: Unlimited events/reviews, environmental tracking, no branding
- **Enterprise (TZS 250,000/month)**: All Pro features + multi-user, API access, white-label

### Current Limitations
- No payment system implemented
- No subscription management
- No feature gating
- All features currently free and unlimited

## Environmental Impact (Phase 10)

### Tree Planting Partnership (Green Manjaro)
- 1 tree for 1-10 reviews
- 2 trees for 11-25 reviews  
- 3 trees for 26+ reviews
- GPS-tracked planting locations
- Impact certificates for guests

### Current Implementation
- Basic tree GPS coordinates (hardcoded: Kilimanjaro)
- No actual tree allocation or tracking
- No environmental dashboard

## Advanced Features (Phase 7, 11-13)

### Story-Style Wraps
- 6-8 slides with animations
- Mobile swipe navigation
- Smart photo selection
- Social sharing with OG images

### Enhanced QR Codes
- Branded codes with operator colors/logos
- Analytics tracking (scans, conversions)
- Print-ready templates

### Current Limitations
- Basic wrap generation without animations
- Simple QR links without branding or analytics
- No advanced photo selection

## Design System
- **Primary**: #1B4D3E (Forest Green)
- **Accent**: #F4C542 (Savanna Gold)
- **Background**: #FCFAF5 (Parchment)
- **Font**: Plus Jakarta Sans

## Architecture Principles
1. **Mobile-first**: Guest experience optimized for mobile
2. **Scalable**: Multi-tenant with operator isolation
3. **Secure**: RLS policies, role-based access
4. **Fast**: React Query caching, optimistic updates
5. **Beautiful**: Premium UI with animations

## Next Steps (Phase 7-8)
1. **Advanced Wrap UI**: Story-style navigation with Framer Motion animations
2. **Snippe.sh Integration**: Payment system, subscription management, feature gating
3. **Multi-Vertical Migration**: trips → events table, metadata JSONB, type-specific forms
4. **Environmental Tracking**: Tree allocation, GPS locations, impact certificates

## Success Metrics
- **Operator Adoption**: Number of active operators (currently 0)
- **Guest Engagement**: Reviews submitted per event
- **Wrap Sharing**: Share rate of generated wraps
- **Environmental Impact**: Total trees planted
- **Revenue**: MRR from subscriptions (Phase 8+)
- **Retention**: Operator churn rate
