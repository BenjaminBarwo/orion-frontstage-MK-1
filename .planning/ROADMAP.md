# Roadmap: MVR (Most Valuable Relationships)

## Overview

This roadmap delivers a video-first waitlist MVP for real estate professionals to validate market demand, seed content, and collect behavioral training data before consumer launch. The journey spans from foundation and authentication through video capabilities, feed discovery, monetization, and data infrastructure, culminating in a production-ready app with 100+ paying pros posting content.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Project Foundation** - Environment setup, dependencies, and infrastructure scaffold ✓ 2026-02-08
- [ ] **Phase 2: Authentication System** - Pro account creation and session management
- [ ] **Phase 3: Pro Profile Management** - Profile identity, role categorization, and service areas
- [ ] **Phase 4: Video Upload** - Camera roll upload with compression
- [ ] **Phase 5: Video Recording** - In-app video capture
- [ ] **Phase 6: Video Compression & Optimization** - Client-side compression and performance tuning
- [ ] **Phase 7: Video Feed Discovery** - Browsable vertical video feed
- [ ] **Phase 8: Deck-Based Feed Architecture** - Role category decks and swipe interactions
- [ ] **Phase 9: Subscription & Billing** - Stripe checkout and subscription management
- [ ] **Phase 10: Survey & Validation** - In-app survey at peak intent moment
- [ ] **Phase 11: Notifications** - Push notifications and in-app activity feed
- [ ] **Phase 12: Data Infrastructure for ML** - Behavioral event tracking and ML-ready schema

## Phase Details

### Phase 1: Project Foundation
**Goal**: Production-ready environment with Supabase, Expo SDK 54, error monitoring, and proper secrets management
**Depends on**: Nothing (first phase)
**Requirements**: None (infrastructure)
**Success Criteria** (what must be TRUE):
  1. Expo SDK 54 project builds and runs on iOS/Android
  2. Supabase Pro client initialized with environment variables
  3. Sentry error monitoring captures crashes with user context
  4. PostHog analytics tracks basic app lifecycle events
  5. CI/CD pipeline deploys to TestFlight on merge to main
**Plans**: 2 plans

Plans:
- [x] 01-01-PLAN.md -- Configuration & build infrastructure (app.config.ts, eas.json, CI/CD)
- [x] 01-02-PLAN.md -- Supabase & observability integration (Supabase, Sentry, PostHog)

### Phase 2: Authentication System
**Goal**: Pros can create accounts, verify email, and maintain persistent sessions
**Depends on**: Phase 1
**Requirements**: AUTH-01, AUTH-02, AUTH-03
**Success Criteria** (what must be TRUE):
  1. Pro can create account with email and password
  2. Pro receives email verification link and verifies account
  3. Pro session persists across app restarts without re-login
  4. Pro can log out from any screen
**Plans**: 3 plans

Plans:
- [ ] 02-01-PLAN.md -- Auth infrastructure (deps, SessionProvider, Zod schemas, toast, theme, protected routes)
- [ ] 02-02-PLAN.md -- Auth screens (sign-up, sign-in, forgot-password with dark premium styling)
- [ ] 02-03-PLAN.md -- Welcome card, password reset deep link, settings/logout

### Phase 3: Pro Profile Management
**Goal**: Pros can build complete profiles with identity, role, location, and bio
**Depends on**: Phase 2
**Requirements**: PROF-01, PROF-02, PROF-03, PROF-04
**Success Criteria** (what must be TRUE):
  1. Pro can set display name and upload profile photo
  2. Pro can select role category from dropdown (lender, agent, attorney, etc.)
  3. Pro can set service area with Houston as default location
  4. Pro can write and edit bio/about section
  5. Pro profile displays correctly in feed and profile view
**Plans**: TBD

Plans:
- [ ] TBD during plan-phase

### Phase 4: Video Upload
**Goal**: Pros can upload videos from camera roll with client-side compression before upload
**Depends on**: Phase 3
**Requirements**: VID-02, VID-03
**Success Criteria** (what must be TRUE):
  1. Pro can select video from camera roll via native picker
  2. Video compresses client-side to 720p, 2-5 Mbps before upload
  3. Upload shows progress indicator with ability to cancel
  4. Uploaded video appears in pro's profile within 5 seconds
  5. Upload fails gracefully with retry if network drops
**Plans**: TBD

Plans:
- [ ] TBD during plan-phase

### Phase 5: Video Recording
**Goal**: Pros can record videos directly in-app using camera
**Depends on**: Phase 4
**Requirements**: VID-01
**Success Criteria** (what must be TRUE):
  1. Pro can open in-app camera from video creation screen
  2. Pro can record video up to 60 seconds with countdown timer
  3. Pro can preview recorded video before upload
  4. Pro can retake video if unsatisfied with recording
  5. Recorded video follows same compression and upload flow as camera roll
**Plans**: TBD

Plans:
- [ ] TBD during plan-phase

### Phase 6: Video Compression & Optimization
**Goal**: Videos load fast, storage costs stay low, and playback is smooth
**Depends on**: Phase 5
**Requirements**: VID-03 (enhancement)
**Success Criteria** (what must be TRUE):
  1. Videos compress to target 20MB or less per video
  2. Compression happens in background without blocking UI
  3. Upload enforces 50MB file size limit with clear error message
  4. Videos over 720p resolution are rejected at upload with guidance
  5. Storage monitoring alerts fire at 50GB, 75GB, 90GB thresholds
**Plans**: TBD

Plans:
- [ ] TBD during plan-phase

### Phase 7: Video Feed Discovery
**Goal**: Pros can browse vertical video feed with auto-play and engagement
**Depends on**: Phase 6
**Requirements**: VID-04, FEED-01, FEED-05
**Success Criteria** (what must be TRUE):
  1. Pro sees scrollable vertical video feed showing all pro content
  2. Videos auto-play when scrolled into view and pause when scrolled out
  3. Pro can like other pros' videos with heart icon
  4. Feed loads next page automatically as pro scrolls
  5. Videos preload next 2-3 videos for smooth playback
**Plans**: TBD

Plans:
- [ ] TBD during plan-phase

### Phase 8: Deck-Based Feed Architecture
**Goal**: Feed organized by role category with swipe-based navigation and geo-scoping
**Depends on**: Phase 7
**Requirements**: FEED-02, FEED-03, FEED-04
**Success Criteria** (what must be TRUE):
  1. Feed organized as separate decks by role category (lender, agent, attorney)
  2. Pro can swipe left/right within decks to navigate between videos
  3. Pro can scroll past entire decks to skip unneeded categories
  4. Content geo-scoped to pro's local area (Houston first)
  5. End-of-deck UI shows when pro has seen all videos in category
**Plans**: TBD

Plans:
- [ ] TBD during plan-phase

### Phase 9: Subscription & Billing
**Goal**: Pros can subscribe to $100/month founding tier via Stripe and manage subscription status
**Depends on**: Phase 8
**Requirements**: PAY-01, PAY-02, PAY-03
**Success Criteria** (what must be TRUE):
  1. Pro can initiate subscription via web-based Stripe checkout (not WebView)
  2. Stripe checkout opens in external browser and redirects back to app
  3. Pro subscription status appears in profile within 10 seconds of payment
  4. Pro can view subscription status (active, canceled, failed) in settings
  5. Pro can cancel subscription via settings (accessible but not prominent)
**Plans**: TBD

Plans:
- [ ] TBD during plan-phase

### Phase 10: Survey & Validation
**Goal**: Pros complete validation survey at high-intent moment with results viewable in dashboard
**Depends on**: Phase 9
**Requirements**: SURV-01, SURV-02, SURV-03
**Success Criteria** (what must be TRUE):
  1. Pro sees survey prompt after first video upload (high-intent moment)
  2. Survey captures key validation questions for investors
  3. Pro can skip survey and return later if desired
  4. Survey responses save to database with timestamp and pro_id
  5. Aggregate survey results viewable in admin dashboard (founder access)
**Plans**: TBD

Plans:
- [ ] TBD during plan-phase

### Phase 11: Notifications
**Goal**: Pros receive push notifications for engagement and see in-app activity feed
**Depends on**: Phase 10
**Requirements**: NOTF-01, NOTF-02
**Success Criteria** (what must be TRUE):
  1. Pro receives push notification when another pro likes their video
  2. Pro receives push notification when new pros join their area
  3. Pro can view in-app notification feed showing recent activity
  4. Pro can tap notification to navigate to relevant content
  5. Notification preferences can be toggled in settings
**Plans**: TBD

Plans:
- [ ] TBD during plan-phase

### Phase 12: Data Infrastructure for ML
**Goal**: Behavioral event tracking with ML-ready schema for future LLM training
**Depends on**: Phase 11
**Requirements**: DATA-01
**Success Criteria** (what must be TRUE):
  1. Database schema designed with event-based structure (not aggregates)
  2. All key user actions tracked as events (signup, video_upload, video_view, like, swipe)
  3. Events include rich context (user_id, session_id, timestamp, device, location)
  4. Video metadata captured (duration, resolution, upload_source)
  5. Engagement metrics calculated (views, watch_time, completion_rate)
**Plans**: TBD

Plans:
- [ ] TBD during plan-phase

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10 → 11 → 12

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Project Foundation | 2/2 | ✓ Complete | 2026-02-08 |
| 2. Authentication System | 0/TBD | Not started | - |
| 3. Pro Profile Management | 0/TBD | Not started | - |
| 4. Video Upload | 0/TBD | Not started | - |
| 5. Video Recording | 0/TBD | Not started | - |
| 6. Video Compression & Optimization | 0/TBD | Not started | - |
| 7. Video Feed Discovery | 0/TBD | Not started | - |
| 8. Deck-Based Feed Architecture | 0/TBD | Not started | - |
| 9. Subscription & Billing | 0/TBD | Not started | - |
| 10. Survey & Validation | 0/TBD | Not started | - |
| 11. Notifications | 0/TBD | Not started | - |
| 12. Data Infrastructure for ML | 0/TBD | Not started | - |

---
*Roadmap created: 2026-02-08*
*Last updated: 2026-02-08 — Phase 1 complete*
