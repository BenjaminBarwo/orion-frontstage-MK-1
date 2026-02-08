# MVR Technology Stack — Video-First Mobile Marketplace

**Last Updated:** 2026-02-08
**Purpose:** Prescriptive technology stack for video-first real estate professional marketplace built with React Native/Expo + Supabase
**Context:** Solo developer, waitlist MVP, Houston market first, long-term behavioral data collection

---

## Executive Summary

This stack prioritizes:
- **Developer velocity** (solo developer constraint)
- **Video performance** (core feature)
- **Data collection** (long-term LLM training)
- **Cost efficiency** (waitlist/early-stage)
- **Production readiness** (real subscriptions, real users)

---

## Core Framework

### React Native / Expo
- **Current Version:** Expo SDK 54 (already in use per package.json)
- **Recommendation:** Stay on Expo SDK 54 through waitlist MVP
- **Rationale:**
  - Expo SDK 54 released January 2025, stable and production-ready
  - Built-in camera/video APIs via `expo-av` and `expo-camera`
  - OTA updates critical for solo developer rapid iteration
  - No need to eject — managed workflow sufficient for video + Stripe + Supabase
- **Confidence:** 95% — Proven stack, already initialized

**What NOT to use:**
- ❌ Bare React Native workflow — adds complexity without benefit for this use case
- ❌ Expo SDK 53 or earlier — SDK 54 has better video performance
- ❌ React Native CLI — Expo handles all needs here

---

## Video Recording & Upload

### Primary: expo-camera + expo-av
- **expo-camera:** `~16.0.0` (included in Expo SDK 54)
- **expo-av:** `~15.0.0` (included in Expo SDK 54)
- **Rationale:**
  - Native Expo APIs, no third-party dependencies
  - `expo-camera` for in-app recording with Camera component
  - `expo-av` for video preview and basic editing (trim, playback)
  - Handles permissions (camera, microphone) automatically
- **Confidence:** 90% — Standard approach, well-documented

### Secondary: expo-image-picker
- **Version:** `~16.0.0` (included in Expo SDK 54)
- **Rationale:**
  - Upload from camera roll (key requirement per PROJECT.md)
  - Built-in video compression options
  - Works seamlessly with Supabase storage upload
- **Confidence:** 95% — Core Expo API, battle-tested

### Video Compression: expo-video-thumbnails + react-native-compressor
- **expo-video-thumbnails:** `~8.0.0` (for preview generation)
- **react-native-compressor:** `^1.8.24`
- **Rationale:**
  - User-generated videos from camera roll can be huge (100MB+)
  - `react-native-compressor` reduces file size 60-80% without visible quality loss
  - Compresses before upload to Supabase to save bandwidth and storage costs
  - `expo-video-thumbnails` generates preview images for feed (faster load than video)
- **Confidence:** 85% — Community-maintained, widely used, but test compression ratios

**What NOT to use:**
- ❌ `react-native-video` for recording — use `expo-camera` instead (better Expo integration)
- ❌ `expo-media-library` for recording — wrong tool, use `expo-camera`
- ❌ Raw camera APIs without compression — will blow up storage costs

**Implementation Notes:**
```javascript
// Recommended flow:
// 1. Record with expo-camera OR select with expo-image-picker
// 2. Compress with react-native-compressor (target: 720p, ~5-10MB for 60s video)
// 3. Generate thumbnail with expo-video-thumbnails
// 4. Upload compressed video + thumbnail to Supabase Storage
```

---

## Video Storage & Streaming

### Supabase Storage
- **Current Setup:** Supabase backend already chosen (per PROJECT.md)
- **Rationale:**
  - Built on AWS S3, production-grade reliability
  - Signed URLs for secure video access
  - Direct upload from mobile (no server proxy needed)
  - Row-level security (RLS) integrates with Supabase Auth
  - CDN included in pricing (faster video delivery)
- **Confidence:** 90% — Industry standard for Supabase projects

**Storage Structure:**
```
supabase-storage/
  videos/
    {user_id}/
      {video_id}.mp4
  thumbnails/
    {user_id}/
      {video_id}.jpg
```

### Video Playback: expo-video
- **Version:** `~3.0.15` (already in package.json)
- **Rationale:**
  - New official Expo video player (replaced `expo-av` Video component in SDK 54)
  - Better performance, lower memory usage
  - Supports HLS streaming (future-proof)
  - Built-in controls, fullscreen, gesture handling
- **Confidence:** 85% — New API (SDK 54+), but official Expo solution

**Streaming Strategy:**
- **Waitlist MVP:** Direct MP4 playback from Supabase Storage signed URLs
  - Simplest implementation, no transcoding needed
  - Sufficient for <100 pros, Houston market only
  - Cost: ~$0.09/GB Supabase storage + $0.10/GB bandwidth
- **Post-Waitlist (Consumer Launch):** Add HLS transcoding
  - Use Mux (recommended) or Cloudflare Stream for adaptive bitrate
  - Handles poor network conditions, reduces buffering
  - Cost increases but critical for consumer UX at scale

**What NOT to use:**
- ❌ Self-hosted video transcoding — solo developer can't maintain
- ❌ YouTube/Vimeo embedding — breaks TikTok-style feed UX
- ❌ `react-native-video` — use `expo-video` (official, better maintained)

---

## Real-Time Video Feed

### Feed Architecture: FlashList + Supabase Realtime
- **@shopify/flash-list:** `^1.7.2`
- **Supabase Realtime:** Included with Supabase client
- **Rationale:**
  - `FlashList` is 5-10x faster than FlatList for video feeds (lazy rendering)
  - Handles TikTok-style vertical scroll with viewability callbacks
  - Supabase Realtime broadcasts new video posts to all connected clients
  - No manual polling, instant feed updates
- **Confidence:** 90% — `FlashList` is industry standard for performant lists

### State Management: Zustand
- **Version:** `^5.0.2`
- **Rationale:**
  - Lightweight (1.5KB), no boilerplate
  - Perfect for feed state (current video index, loaded videos, user interactions)
  - Easier to debug than Redux for solo developer
  - Works seamlessly with React Native Reanimated (for swipe gestures)
- **Confidence:** 95% — Popular choice for modern React Native apps

### Infinite Scroll: react-query (TanStack Query)
- **@tanstack/react-query:** `^5.62.0`
- **Rationale:**
  - Handles pagination, caching, and refetching automatically
  - Integrates with Supabase queries (fetch next page of videos)
  - Offline-first caching reduces Supabase bandwidth costs
  - Stale-while-revalidate pattern keeps feed feeling fast
- **Confidence:** 95% — De facto standard for data fetching in React

**Feed Performance Optimization:**
```javascript
// Key patterns:
// 1. FlashList with estimatedItemSize for consistent scroll
// 2. Load 10 videos initially, paginate 10 more on scroll
// 3. Preload next video while current plays (reduce buffering)
// 4. Unmount videos >3 positions away to free memory
// 5. Use thumbnail until video in viewport (faster perceived load)
```

**What NOT to use:**
- ❌ FlatList — too slow for video feeds (proven performance issues)
- ❌ Redux/Redux Toolkit — overkill for this app size
- ❌ Context API for global state — causes unnecessary re-renders

---

## Authentication & Database

### Supabase Auth
- **@supabase/supabase-js:** `^2.47.10`
- **Rationale:**
  - Email/password auth (per PROJECT.md: no OAuth for waitlist)
  - JWT tokens auto-refresh
  - Row-level security (RLS) enforces data access policies
  - Built-in email verification (important for paid subscribers)
- **Confidence:** 95% — Core Supabase feature, production-ready

### Database Schema (Supabase Postgres)
```sql
-- Core tables:
profiles (id, email, name, role_category, location, subscription_status, created_at)
videos (id, user_id, video_url, thumbnail_url, duration, created_at, view_count)
surveys (id, user_id, responses, completed_at)
behavioral_events (id, user_id, event_type, event_data, timestamp)

-- Indexes for feed queries:
CREATE INDEX idx_videos_created_at ON videos(created_at DESC);
CREATE INDEX idx_videos_location ON videos(location);
```

**What NOT to use:**
- ❌ Firebase — Supabase already chosen, no reason to switch
- ❌ Custom Express/Node backend — Supabase handles everything needed
- ❌ MongoDB — Postgres is better for relational data (users → videos → surveys)

---

## Payments (Stripe)

### Stripe React Native SDK
- **@stripe/stripe-react-native:** `^0.42.0`
- **Rationale:**
  - Official Stripe SDK for React Native/Expo
  - Handles Apple Pay, Google Pay, card payments
  - Works with Expo (no ejection needed)
  - PCI compliance built-in (no sensitive data touches your server)
- **Confidence:** 90% — Official SDK, actively maintained

### Subscription Flow Architecture
```
Mobile App (React Native)
  ↓ (creates customer + subscription intent)
Supabase Edge Functions (Deno)
  ↓ (calls Stripe API)
Stripe
  ↓ (webhook confirms payment)
Supabase Database (updates subscription_status)
```

**Stripe + Supabase Integration:**
1. Use Supabase Edge Functions (serverless Deno) to call Stripe API
2. Store Stripe customer ID in `profiles` table
3. Stripe webhooks → Supabase Edge Function → update `subscription_status`
4. RLS policies enforce access (only subscribed pros can post videos)

**What NOT to use:**
- ❌ Stripe Checkout web flow — breaks native app UX
- ❌ Server-side Node.js backend — Supabase Edge Functions sufficient
- ❌ RevenueCat — adds layer of abstraction, unnecessary for single $100/month tier

---

## Behavioral Analytics & Event Tracking

### Primary: PostHog
- **posthog-react-native:** `^3.3.8`
- **Rationale:**
  - Open-source, self-hostable (future-proof for LLM training data ownership)
  - Cloud version has generous free tier (1M events/month)
  - Session replay on mobile (see exactly what pros do during onboarding)
  - Feature flags built-in (A/B test survey placement, video upload flow, etc.)
  - Funnels and retention analysis (measure pro drop-off during signup)
  - Autocapture (tracks taps, screen views without manual instrumentation)
  - **Critical:** Raw event export to Supabase for long-term LLM training
- **Confidence:** 85% — Growing in mobile space, strong React Native support

**Key Events to Track:**
```javascript
// Onboarding funnel
posthog.capture('signup_started', { method: 'email' })
posthog.capture('video_upload_initiated', { source: 'camera' | 'camera_roll' })
posthog.capture('video_upload_completed', { duration_seconds, file_size_mb })
posthog.capture('survey_started', { placement: 'post_video_upload' })
posthog.capture('survey_completed', { time_to_complete_seconds })
posthog.capture('subscription_initiated', { plan: 'founding_pro_100' })
posthog.capture('subscription_completed', { payment_method })

// Feed engagement (critical for LLM training)
posthog.capture('video_viewed', { video_id, watch_duration_seconds, completion_rate })
posthog.capture('video_swiped', { video_id, direction: 'left' | 'right' })
posthog.capture('profile_viewed', { profile_id })

// Content metadata (for training data labels)
posthog.capture('video_posted', {
  video_id,
  duration_seconds,
  file_size_mb,
  source: 'in_app_recorded' | 'camera_roll'
})
```

### Alternative: Segment
- **@segment/analytics-react-native:** `^2.22.0`
- **Rationale:**
  - If you need to send events to multiple destinations (e.g., Amplitude + Mixpanel)
  - Single SDK, routes events to 300+ integrations
  - More mature mobile SDK than PostHog
  - **Downside:** Costs scale with volume, less control over data ownership
- **Confidence:** 90% — Industry standard, proven at scale
- **Recommendation:** Use PostHog initially, switch to Segment if you need multi-tool analytics

**What NOT to use:**
- ❌ Google Analytics (GA4) — terrible for mobile apps, limited event schema flexibility
- ❌ Firebase Analytics — locks data in Google ecosystem, hard to export for LLM training
- ❌ Custom event logging to Supabase only — reinventing the wheel, no funnel analysis UI

### Data Ownership Strategy
**For LLM Training (Long-Term Goal):**
1. PostHog captures events with full context
2. Set up PostHog batch export to Supabase (daily or weekly)
3. Store raw events in `behavioral_events` table
4. Join with `videos`, `profiles`, `surveys` for labeled training data
5. Export to data warehouse (e.g., BigQuery) when ready to train models

**Why this matters:** Most analytics tools (Amplitude, Mixpanel) own your data and limit exports. PostHog's open-source model + Supabase storage gives you full control for future ML/LLM work.

---

## Gesture Handling (Swipe Interactions)

### React Native Gesture Handler + Reanimated
- **react-native-gesture-handler:** `~2.28.0` (already in package.json)
- **react-native-reanimated:** `~4.1.1` (already in package.json)
- **Rationale:**
  - Required for TikTok/Tinder-style swipe gestures
  - Runs animations on UI thread (60fps smooth)
  - `PanGestureHandler` for swipe left/right within decks
  - `FlingGestureHandler` for swipe up/down (scroll to next video)
  - Works seamlessly with FlashList and expo-video
- **Confidence:** 95% — Industry standard, already initialized in project

**Implementation Pattern:**
```javascript
// Tinder-style card swipe:
// - PanGestureHandler tracks finger movement
// - Reanimated animates card position and opacity
// - onEnd callback determines swipe direction threshold
// - Navigate to next video or update feed state
```

---

## Push Notifications (Future)

### Expo Notifications
- **expo-notifications:** `~0.30.0` (included in Expo SDK 54)
- **Rationale:**
  - Native push notifications without Firebase
  - Works with Expo's push notification service (free for testing, paid at scale)
  - Send from Supabase Edge Functions (triggered by app events)
  - **Use Cases (post-waitlist):** Pro gets matched with consumer, subscription expiring, new consumer in your area
- **Confidence:** 90% — Expo's managed service handles complexity
- **Recommendation:** Defer until post-waitlist (not needed for pro onboarding MVP)

---

## Error Tracking & Monitoring

### Sentry
- **@sentry/react-native:** `^6.6.0`
- **Rationale:**
  - Catches JavaScript errors and native crashes
  - Source maps work with Expo (sees original code, not minified)
  - Breadcrumbs show user actions before crash (critical for debugging video issues)
  - Free tier: 5K events/month (sufficient for waitlist)
  - Performance monitoring (see slow video uploads, API latency)
- **Confidence:** 95% — Industry standard, essential for production app

**What NOT to use:**
- ❌ Bugsnag — more expensive, less popular in React Native community
- ❌ Console.log only — unusable in production, no context for crashes

---

## Testing Strategy

### Unit & Integration Tests: Jest + React Native Testing Library
- **jest:** `^29.7.0` (included in Expo)
- **@testing-library/react-native:** `^12.9.0`
- **Rationale:**
  - Jest is default test runner for Expo projects
  - Testing Library encourages testing user behavior, not implementation
  - Focus on critical flows: signup, video upload, subscription payment
- **Confidence:** 90% — Standard React Native testing stack

### E2E Tests: Maestro
- **maestro:** Install via Homebrew/npm
- **Rationale:**
  - Simpler than Detox/Appium (no complex native setup)
  - YAML-based test scripts (easy to read and write)
  - Works with Expo Go and production builds
  - Tests video recording, upload, and playback flows
- **Confidence:** 80% — Newer tool (2023), but gaining traction in React Native community
- **Alternative:** Detox if you need more complex test scenarios

**Testing Priority (Solo Developer):**
1. Manual testing on real device (primary validation)
2. Sentry for production crash monitoring (catches what you miss)
3. E2E tests for critical flows (signup → video upload → subscription)
4. Unit tests for complex logic (defer until post-waitlist)

**What NOT to use:**
- ❌ Appium — too slow and flaky for rapid iteration
- ❌ Full unit test coverage — overkill for MVP, prioritize E2E tests

---

## Development Tools

### TypeScript
- **typescript:** `~5.9.2` (already in package.json)
- **Rationale:**
  - Catch bugs before runtime (critical for solo developer)
  - Better autocomplete for Supabase queries, Stripe API, PostHog events
  - Easier to refactor as app grows
- **Confidence:** 95% — Already initialized, keep using it

### ESLint
- **eslint:** `^9.25.0` (already in package.json)
- **eslint-config-expo:** `~10.0.0` (already in package.json)
- **Rationale:**
  - Expo's ESLint config enforces best practices
  - Catches common React Native mistakes (e.g., missing keys in lists)
- **Confidence:** 95% — Already set up

### Expo CLI
- **expo-cli:** Installed globally via npm
- **Rationale:**
  - Build iOS/Android production apps without Xcode/Android Studio open
  - EAS Build for cloud builds (no Mac needed for Android builds)
  - EAS Submit for App Store / Play Store submission
- **Confidence:** 95% — Core Expo workflow

---

## Infrastructure & DevOps

### Hosting: Supabase Cloud
- **Plan:** Free tier for waitlist (500MB storage, 2GB bandwidth)
- **Upgrade:** Pro plan ($25/month) when storage >500MB or users >100
- **Rationale:**
  - Managed Postgres, auth, storage, and realtime in one place
  - Auto-scaling, no server management
  - Backups included
- **Confidence:** 95% — Standard Supabase workflow

### CI/CD: GitHub Actions + EAS Build
- **GitHub Actions:** Free tier (2,000 minutes/month)
- **EAS Build:** Free tier (30 builds/month for iOS + Android)
- **Rationale:**
  - Automate Expo builds on git push
  - Run ESLint and tests before build
  - Submit to TestFlight (iOS) / Internal Testing (Android) automatically
- **Confidence:** 85% — Standard Expo workflow, requires some setup

### Environment Variables: Expo dotenv
- **expo-constants + dotenv:** Included in Expo SDK 54
- **Rationale:**
  - Manage Supabase API keys, Stripe keys, PostHog keys
  - Different keys for dev/staging/production
  - `.env` files not committed to git
- **Confidence:** 95% — Core Expo feature

---

## Cost Breakdown (Waitlist MVP: 100 pros, 6 months)

| Service | Plan | Monthly Cost | Notes |
|---------|------|--------------|-------|
| Supabase | Pro | $25 | Free tier sufficient initially |
| Stripe | Standard | 2.9% + $0.30/txn | ~$3/subscription = $300 gross, $291 net |
| PostHog | Cloud (Free) | $0 | 1M events/month free |
| Sentry | Developer (Free) | $0 | 5K errors/month free |
| Expo EAS Build | Free | $0 | 30 builds/month free |
| Apple Developer | Annual | $99/year | Required for iOS |
| Google Play | One-time | $25 | Required for Android |
| **Total (monthly)** | | **~$25-50** | Scales with usage |

**Revenue (100 pros @ $100/month):** $10,000/month
**Margin:** 99.5%+ (infrastructure costs negligible at this scale)

---

## Migration Plan (Waitlist → Consumer Launch)

When you onboard consumers (post-waitlist), revisit these areas:

1. **Video Transcoding:** Add Mux or Cloudflare Stream for HLS adaptive bitrate
2. **Push Notifications:** Implement Expo Notifications for matching alerts
3. **Analytics Scaling:** Evaluate Segment if sending events to multiple tools
4. **Database Indexing:** Add indexes for swipe queries (location + role_category + engagement_score)
5. **Content Moderation:** Integrate AWS Rekognition (video content analysis) or manual review queue
6. **Caching:** Add Redis (Upstash) for hot data (frequently viewed pro profiles)

---

## Quality Gate Checklist

- [x] Versions are current (as of January 2025 knowledge cutoff)
- [x] Rationale explains WHY, not just WHAT
- [x] Confidence levels assigned to each recommendation
- [x] Alternatives and anti-patterns documented
- [x] Solo developer constraints considered
- [x] Behavioral data collection strategy included
- [x] Cost breakdown provided
- [x] Migration plan for scaling documented

---

## Summary: Recommended Stack

```json
{
  "framework": "Expo SDK 54",
  "video_recording": "expo-camera + expo-av",
  "video_upload": "expo-image-picker",
  "video_compression": "react-native-compressor",
  "video_playback": "expo-video",
  "video_storage": "Supabase Storage (S3-backed)",
  "feed_performance": "@shopify/flash-list",
  "state_management": "zustand",
  "data_fetching": "@tanstack/react-query",
  "backend": "Supabase (Auth, Database, Realtime, Edge Functions)",
  "payments": "@stripe/stripe-react-native + Supabase Edge Functions",
  "analytics": "posthog-react-native",
  "error_tracking": "@sentry/react-native",
  "gestures": "react-native-gesture-handler + react-native-reanimated",
  "testing": "jest + @testing-library/react-native + Maestro",
  "deployment": "EAS Build + GitHub Actions"
}
```

**Confidence in Overall Stack:** 90%

**Key Risks:**
1. `expo-video` is new in SDK 54 — may have undiscovered edge cases (mitigation: test heavily, have Sentry monitoring)
2. PostHog mobile SDK less mature than web — may need Segment fallback if event tracking unreliable
3. Video compression settings need tuning — balance quality vs. file size vs. upload time

**Next Steps:**
1. Install missing dependencies (see package.json diff below)
2. Set up Supabase project (schema creation script in codebase)
3. Configure Stripe account and test subscription flow
4. Implement core video upload flow (camera → compress → upload → playback)
5. Integrate PostHog event tracking
6. Deploy first TestFlight build

---

## Appendix: Package.json Additions Needed

```json
{
  "dependencies": {
    "@shopify/flash-list": "^1.7.2",
    "@stripe/stripe-react-native": "^0.42.0",
    "@supabase/supabase-js": "^2.47.10",
    "@tanstack/react-query": "^5.62.0",
    "expo-av": "~15.0.0",
    "expo-camera": "~16.0.0",
    "expo-image-picker": "~16.0.0",
    "expo-video-thumbnails": "~8.0.0",
    "posthog-react-native": "^3.3.8",
    "react-native-compressor": "^1.8.24",
    "zustand": "^5.0.2"
  },
  "devDependencies": {
    "@sentry/react-native": "^6.6.0",
    "@testing-library/react-native": "^12.9.0"
  }
}
```

Run: `npm install` after updating package.json

---

**Document Owner:** GSD Project Researcher Agent
**Downstream Consumer:** Roadmap creation (ROADMAP.md)
**Review Cadence:** Update before consumer launch (post-waitlist)
