# SafariWrap Steering Documentation

This directory contains comprehensive guidance for building the SafariWrap platform - an Experience Intelligence Platform that transforms real-world experiences into shareable digital stories.

## 📚 Documentation Index

### Core Documentation (Auto-Included)

#### [00-project-overview.md](./00-project-overview.md)
**Vision, tech stack, and current status**
- Platform overview and value proposition
- Multi-vertical support (Safari, Marathon, Tours)
- Design system and architecture principles
- Current implementation status (Phase 6 complete)
- Next steps (Phase 7-13)

#### [01-database-schema.md](./01-database-schema.md)
**Complete database design and data models**
- **Current schema** (5 tables, safari-only): operators, destinations, trips, reviews, safari_wraps
- **Planned extensions**: subscriptions, payments, events (multi-vertical), tree_activities, gps_locations, qr_codes
- RLS policies and security
- Migration strategies from trips → events
- Metadata structures for each vertical

#### [07-build-phases.md](./07-build-phases.md)
**Implementation roadmap and priorities**
- Completed phases (0-6): UI, Auth, Database, Dashboard, Reviews, Basic Wraps
- In-progress work (Phase 7): Advanced wrap UI with animations
- Upcoming phases (8-13): Payments, multi-vertical, environmental impact
- Priority order and timelines

#### [08-modern-stack-reference.md](./08-modern-stack-reference.md)
**Modern web stack reference guide**
- Next.js 16, React 19, TailwindCSS 4
- Lucide React icons, Shadcn/ui components
- TanStack Query v5, Supabase integration
- Component patterns and best practices

#### [09-ui-component-standards.md](./09-ui-component-standards.md) ⭐ **ALWAYS ACTIVE**
**UI component standards - CRITICAL RULES**
- **ALWAYS use Shadcn/ui for UI components**
- **ALWAYS use Lucide React for icons**
- Component creation workflow
- Common patterns and examples
- What to do and what NOT to do

### Feature Documentation (Manual Inclusion)

#### [02-payment-integration.md](./02-payment-integration.md)
**Snippe.sh payment system integration**
- Subscription plans (Free, Pro, Enterprise)
- Checkout flow and webhooks
- Feature gating logic
- Database schema for payments

#### [03-multi-vertical-architecture.md](./03-multi-vertical-architecture.md)
**Supporting multiple experience types**
- Safari, Marathon, and Tour verticals
- Database evolution strategy (trips → events)
- Type-safe implementation with metadata JSONB
- Dynamic UI components per vertical

#### [04-environmental-impact.md](./04-environmental-impact.md)
**Tree planting and GPS tracking**
- Partnership with Kilimanjaro Project
- Tree allocation formulas (1-3 trees based on reviews)
- GPS location tracking
- Impact certificates and visualization

#### [05-wrap-generation.md](./05-wrap-generation.md)
**Visual storytelling engine**
- Wrap structure and slides (6-8 slides)
- Data aggregation logic
- Photo selection algorithms
- Animations and transitions with Framer Motion

#### [06-qr-code-system.md](./06-qr-code-system.md)
**Frictionless guest access**
- QR code generation with branding
- Guest review flow
- Mobile-optimized forms
- Photo upload system
- Analytics tracking (scans, conversions)

## 🎯 Quick Start Guide

### For New Features
1. Read `00-project-overview.md` for context
2. Check `07-build-phases.md` for current priorities
3. Review relevant feature documentation
4. Check `01-database-schema.md` for data models

### For Database Changes
1. Review `01-database-schema.md` current schema
2. Check migration strategies for planned extensions
3. Update RLS policies
4. Test with sample data

### For Payment Features
1. Read `02-payment-integration.md`
2. Set up Snippe.sh account
3. Configure environment variables
4. Implement feature gating

### For Multi-Vertical Support
1. Read `03-multi-vertical-architecture.md`
2. Plan database migration (trips → events)
3. Create type-specific components
4. Test with each vertical

## 🏗️ Current Architecture

```
SafariWrap Platform
├── Frontend (Next.js 16 + React 19)
│   ├── App Router
│   ├── TailwindCSS 4
│   └── Framer Motion (planned)
├── Backend (Supabase)
│   ├── Auth (role-based: operators, admin, guests)
│   ├── PostgreSQL Database (5 tables, RLS enabled)
│   └── Storage (safariwrap-assets bucket)
├── Payments (Snippe.sh) - Phase 8
└── Environmental (Kilimanjaro Project) - Phase 10
```

## 📊 Current Status

### ✅ Completed (Phases 0-6 + Schema Upgrade)
- **Phase 0**: UI Design System (Safari theming, TailwindCSS 4)
- **Phase 1**: Authentication & Authorization (Supabase Auth, RLS)
- **Phase 2**: Database Schema (12 tables, multi-vertical ready) ✨ **UPGRADED 2026-04-14**
- **Phase 3**: Operator Dashboard (trip management, stats)
- **Phase 4**: QR Code System (enhanced with analytics) ✨ **UPGRADED**
- **Phase 5**: Guest Review System (safari forms, photo uploads)
- **Phase 6**: Basic Wrap Generation (simple visual summaries)

### 🎉 Recent Schema Upgrade (2026-04-14)
- ✅ Deployed optimized schema (12 tables total)
- ✅ Multi-vertical support (Safari, Marathon, Tour via events table)
- ✅ Payment integration ready (Snippe.sh via subscriptions + payments tables)
- ✅ Environmental impact tracking (tree_activities + gps_locations tables)
- ✅ Advanced QR system with analytics (qr_codes table)
- ✅ Generic wrap generation (wraps table replaces safari_wraps)
- ✅ 28 RLS policies, 6 functions, 4 triggers
- ✅ Backward compatible (legacy trips and safari_wraps preserved)

### 📋 Next Up (Phase 8)
- Snippe.sh payment integration
- Subscription management (Free, Pro, Enterprise)
- Feature gating based on subscription tier

### 🔮 Future (Phases 9-13)
- **Phase 9**: Multi-vertical support (Marathon, Tour)
- **Phase 10**: Environmental impact tracking (tree planting, GPS)
- **Phase 11**: Enhanced QR codes (branding, analytics)
- **Phase 12**: Admin panel enhancements
- **Phase 13**: Advanced features (AI, voice, smart photo selection)

## 🎨 Design System

**Colors:**
- Primary: `#1B4D3E` (Forest Green)
- Accent: `#F4C542` (Savanna Gold)
- Background: `#FCFAF5` (Parchment)

**Typography:**
- Font: Plus Jakarta Sans
- Mobile-first approach
- Safari-themed aesthetics

## 🔐 Security

- Row Level Security (RLS) on all tables
- Role-based access control (operators, admin, guests)
- Secure file uploads to Supabase Storage
- Payment webhook verification (Phase 8)
- Rate limiting on public endpoints

## 📱 Supported Platforms

- **Primary**: Mobile web (iOS Safari, Chrome)
- **Secondary**: Desktop web
- **Future**: Native mobile apps (Phase 13+)

## 🌍 Environmental Impact

Every experience contributes to:
- Tree planting (1-3 trees per event based on reviews)
- GPS-tracked locations (Kilimanjaro Project partnership)
- Carbon offset calculation (22kg CO2 per tree/year)
- Impact certificates for guests

## 🚀 Deployment

- **Hosting**: Vercel
- **Database**: Supabase (hosted) - Project: `uauymnvbsdldfpeuvtxy`
- **Storage**: Supabase Storage (safariwrap-assets bucket)
- **CDN**: Vercel Edge Network

## 📞 Support & Resources

- **PRD**: See root `PRD.md` for full product requirements
- **Specs**: See `.kiro/specs/payment-and-platform-features/` for detailed requirements, design, and tasks
- **Database**: Supabase project `uauymnvbsdldfpeuvtxy`
- **Payment Provider**: Snippe.sh (https://snippe.sh)
- **Conservation Partner**: The Kilimanjaro Project

## 🔄 How to Use These Docs

### Auto-Included Files
These are automatically loaded into context:
- `00-project-overview.md` - Platform vision and status
- `01-database-schema.md` - Complete database design
- `07-build-phases.md` - Implementation roadmap

### Manual Inclusion
Reference these when working on specific features:
```
#[[file:.kiro/steering/02-payment-integration.md]]
#[[file:.kiro/steering/03-multi-vertical-architecture.md]]
#[[file:.kiro/steering/04-environmental-impact.md]]
#[[file:.kiro/steering/05-wrap-generation.md]]
#[[file:.kiro/steering/06-qr-code-system.md]]
```

## 📝 Contributing to Docs

When adding new features:
1. Update relevant steering file
2. Add to `07-build-phases.md` if it's a new phase
3. Update database schema in `01-database-schema.md`
4. Keep `00-project-overview.md` current status updated
5. Update specs in `.kiro/specs/payment-and-platform-features/`

## 🎯 Success Metrics

- **Operator Adoption**: Number of active operators (currently 0)
- **Guest Engagement**: Reviews submitted per event
- **Wrap Sharing**: Share rate of generated wraps
- **Environmental Impact**: Total trees planted
- **Revenue**: MRR from subscriptions (Phase 8+)
- **Retention**: Operator churn rate

## 🗂️ Database Summary

### Current Tables (10) ✨ OPTIMIZED
1. **operators** (0 records) - Tour operators managing events
2. **destinations** (10 records) - Pre-seeded safari locations
3. **reviews** (0 records) - Guest feedback with metadata JSONB for multi-vertical
4. **subscriptions** (0 records) - Operator subscription management (Free, Pro, Enterprise)
5. **payments** (0 records) - Payment transaction audit trail
6. **events** (0 records) - Multi-vertical event management (Safari, Marathon, Tour)
7. **wraps** (0 records) - Generic wrap generation
8. **qr_codes** (0 records) - QR code management with analytics
9. **tree_activities** (0 records) - Tree planting allocation (1-3 trees based on reviews)
10. **gps_locations** (0 records) - GPS coordinates for planted trees

### Removed Tables (Legacy - Cleanup 2026-04-15)
- ~~**trips**~~ → Replaced by **events** (multi-vertical)
- ~~**safari_wraps**~~ → Replaced by **wraps** (generic)

## 🔑 Key Concepts

### Subscription Tiers
- **Free**: 2 events, 10 reviews/event, basic wraps, SafariWrap branding
- **Pro (TZS 75,000/month)**: Unlimited events/reviews, environmental tracking, no branding
- **Enterprise (TZS 250,000/month)**: All Pro + multi-user, API access, white-label

### Event Types (Multi-Vertical)
- **Safari**: Animal sightings, destinations, wildlife tracking
- **Marathon**: Distance, pace, checkpoints, performance metrics
- **Tour**: Locations, cultural highlights, group experiences

### Environmental Impact
- **Tree Allocation**: 1 tree (1-10 reviews), 2 trees (11-25), 3 trees (26+)
- **CO2 Offset**: 22 kg per tree per year
- **GPS Tracking**: Kilimanjaro Project partnership
- **Certificates**: Downloadable PDF and shareable images

---

**Last Updated**: 2024-06-15
**Version**: 1.0.0
**Status**: Active Development (Phase 7)
**Database**: Supabase `uauymnvbsdldfpeuvtxy`
