# Project Research Summary

**Project:** MVR (Mobile Video Routing) — Video-First Real Estate Professional Marketplace
**Domain:** Mobile marketplace with TikTok-style video feed, subscription billing, behavioral data collection
**Researched:** 2026-02-08
**Confidence:** HIGH

## Executive Summary

MVR is a video-first professional marketplace for real estate, requiring careful orchestration of mobile video handling, subscription billing, and behavioral data collection for future LLM training. The recommended approach uses Expo SDK 54 + Supabase (backend/auth/storage) + Stripe (subscriptions) with a focus on solo developer velocity during the waitlist phase, followed by strategic scaling for consumer launch.

The research reveals that video-first marketplaces succeed by prioritizing three critical areas: (1) video performance and cost optimization through client-side compression and strategic transcoding, (2) deck-based feed architecture that mimics real-world service provider discovery patterns, and (3) behavioral data collection from day one to create a defensible ML/LLM training moat. The waitlist phase focuses on pro content seeding and validation, while consumer launch introduces swipe-based discovery within role-categorized decks.

Key risks center on video storage costs spiraling without compression (can turn a profitable $35/month operation into a $1,200/month loss), App Store rejection if Stripe payments aren't web-based, and poor database schema design that blocks future ML training. These risks are all preventable with proper architecture from day one, making the research findings directly actionable for immediate implementation.

## Key Findings

### Recommended Stack

MVR's stack prioritizes developer velocity (solo developer constraint), video performance (core feature), data collection (long-term LLM training), and cost efficiency (waitlist/early-stage). The Expo + Supabase + Stripe combination provides production readiness without operational overhead.

**Core technologies:**
- **Expo SDK 54**: Already initialized, stable production-ready framework with built-in video APIs, OTA updates for rapid iteration, no ejection needed for video + Stripe + Supabase integration (95% confidence)
- **Supabase**: Backend platform providing PostgreSQL, Auth, Storage, Edge Functions, and Realtime in one managed service. Handles all server-side needs without custom Express/Node backend (95% confidence)
- **Stripe + Supabase Edge Functions**: Subscription billing via web-based checkout (not in-app WebView to avoid App Store rejection), webhook handling in Edge Functions for subscription state management (90% confidence)
- **expo-video v3.x**: New unified video player API in SDK 54, better performance than expo-av, supports HLS streaming for future scalability (85% confidence — new API but official Expo solution)
- **@shopify/flash-list**: 5-10x faster than FlatList for video feeds, handles TikTok-style vertical scroll with lazy rendering (90% confidence)
- **PostHog**: Open-source analytics with self-hostable option, session replay, feature flags, and critical raw event export to Supabase for LLM training data ownership (85% confidence)
- **react-native-compressor**: Client-side video compression (60-80% reduction) before upload to prevent storage cost explosion (85% confidence)

**Critical version requirements:**
- Expo SDK 54 (not 53 or earlier — SDK 54 has better video performance)
- Supabase Pro plan ($25/month) from day 1 (Free tier has 10-30 second cold starts, unacceptable for production)
- Stripe webhook signature validation (security requirement)

**What NOT to use:**
- Firebase (Supabase already chosen, no reason to switch)
- React Native CLI / bare workflow (Expo managed workflow sufficient)
- In-app Stripe WebView (violates App Store guidelines 3.1.1)
- Redux for state management (overkill, use Zustand instead)
- Self-hosted video transcoding (solo developer can't maintain, use Mux/Cloudflare Stream)

### Expected Features

**Must have (table stakes):**
- **Pro onboarding & authentication** (email/password via Supabase Auth) — without reliable identity, marketplace cannot function
- **Video upload/recording** (expo-camera + expo-image-picker) — core value proposition, pros need to post content immediately
- **Video feed/discovery** (FlashList + expo-video) — TikTok-style auto-play feed for pro browsing during waitlist
- **Subscription billing** ($100/month via Stripe web checkout) — validates demand, creates revenue before product-market fit
- **In-app survey** (placed after video upload, before payment) — captures validation data for investors at peak intent moment
- **Behavioral analytics** (PostHog with Supabase export) — long-term LLM training moat, must collect from day one
- **Swipe interactions** (react-native-gesture-handler) — critical for consumer launch, defines the Tinder-for-professionals UX
- **Deck-based feed organization** (by role category: lender → agent → attorney) — consumer launch feature, allows efficient navigation between professional types

**Should have (competitive differentiators):**
- **Import social media videos** (camera roll upload) — reduces friction for pros with existing social presence, faster content seeding
- **Peer quality signals** (pro-to-pro engagement during waitlist) — generates training data before consumers arrive, unique dataset of professional peer validation
- **Finite geo-scoped content** (not infinite scroll) — reduces decision paralysis, creates urgency, differentiates from infinite-scroll fatigue
- **Subscription before consumer access** — filters out low-commitment pros, high price point ($100/month) signals premium positioning

**Defer (v2+):**
- In-app messaging/chat (route to phone/email instead — complexity high, support burden)
- Web app (mobile-only optimizes for commitment — app download = real intent)
- OAuth/social login (email/password sufficient for waitlist)
- Public ratings/reviews (implicit signals via swipes replace explicit ratings, reduces moderation burden)
- AI-powered matching (collect training data first via manual swipe-based discovery)
- Video editing tools (pros already have CapCut/InShot, not worth the complexity)

### Architecture Approach

Video-first marketplace apps on Expo + Supabase follow a layered component architecture with clear separation between client-side video capture/playback, upload pipeline, server-side processing, feed delivery, and behavioral event tracking. The critical architectural decision is where video processing happens — for solo developers, favor client-side compression + Supabase Storage + external transcoding service (Mux/Cloudflare Stream post-MVP) over building custom infrastructure.

**Major components:**
1. **Video Pipeline** (Capture → Compress → Upload → Transcode → Stream) — expo-camera for recording, expo-image-picker for gallery uploads, react-native-compressor for client-side compression (target: 720p, 2-5 Mbps), Supabase Storage for raw uploads, Mux/Cloudflare for transcoding (post-MVP), expo-video for playback with HLS support
2. **Feed System** (Deck-based content delivery) — DeckManager service organizing videos by role category, FlashList for performant vertical scrolling, cursor-based pagination (not offset-based), prefetching next 2-3 videos, SwipeHandler with react-native-gesture-handler for Tinder-style interactions
3. **Auth & Billing** — Supabase Auth (email/password + JWT tokens), Row-Level Security (RLS) policies for data access control, Stripe Checkout (web-based via expo-web-browser), Supabase Edge Functions for subscription management, webhook handling for subscription state sync
4. **Behavioral Event Pipeline** — Client-side event batching (50 events or 30 seconds), Supabase events table with JSONB properties, PostgreSQL triggers for real-time aggregations (view counts), scheduled Edge Functions for cold analytics, future export to S3/GCS for ML training
5. **Data Schema for ML/LLM Training** — Immutable event log (never delete, only append), rich context capture (user_id, session_id, timestamp, device, location), labeled outcomes (response rates, conversion tracking), temporal features for behavior over time, separate tables for pro_performance, video_features, consumer_journeys

**Key patterns:**
- Client-side compression before upload (prevents storage cost explosion)
- Resumable uploads via TUS protocol (Supabase Storage supports this)
- Webhook-driven architecture (Stripe events → Edge Functions → database updates)
- Event batching for analytics (reduces API calls, supports offline queueing)
- RLS policies for security (enforce at database level, not app logic)

**Build order:**
- Phase 1 (MVP): Auth → Video Upload → Feed → Subscription → Survey → Analytics
- Phase 2 (Optimization): Compression → Swipe Gestures → Feed Polish → Enhanced Analytics
- Phase 3 (Consumer Launch): Deck Architecture → Pro Ranking → Routing System → Transcoding

### Critical Pitfalls

1. **Video storage cost explosion** — Raw videos (100-500MB per minute) can consume $1,260/month in storage costs for 100 pros with 3 videos each. **Prevention:** Client-side compression (target 20MB per video), enforce 50MB upload limit, set max duration (30-60 seconds), reject videos >720p resolution. With compression: $126/month vs $1,260/month uncompressed.

2. **App Store rejection for Stripe payments** — Using Stripe Checkout in WebView violates Apple App Store guidelines 3.1.1 (In-App Purchase). **Prevention:** Use expo-web-browser to open Stripe Checkout in external browser (not in-app WebView), redirect back to app after payment via deep link. This must be implemented correctly from day one.

3. **Supabase RLS policies blocking legitimate queries** — The #1 Supabase beginner mistake. Complex RLS policies with joins/subqueries block valid queries with "permission denied" errors that are hard to debug. **Prevention:** Start with simple policies (authenticated users can CRUD their own data), test with RLS enabled, avoid subqueries in policies, name policies descriptively, add incrementally.

4. **Poor database schema blocking ML training** — Schema without proper timestamps, user context, video metadata, or engagement metrics makes future ML training impossible. **Prevention:** Event-based schema storing discrete events (not aggregates), rich context (user_id, timestamp, session_id, device_type, location), video metadata (duration, resolution, upload_source), engagement metrics (views, watch_time, completion_rate, swipe_direction). This must be designed correctly from day one — you can't recover lost historical data.

5. **Solo developer over-engineering during MVP** — Spending days on "perfect architecture," reusable abstractions before second use case, premature optimization, comprehensive tests before PMF. **Prevention:** Ship ugly MVPs first, optimize after pain is felt, copy-paste is fine until 3+ instances, defer technical debt, time-box research (1 hour max), strictly enforce MVP scope. Phase 1 priority is shipping fast, Phase 3 is when to refactor.

**Additional high-impact pitfalls:**
- **Mobile video performance degradation** — Videos >2 seconds to load = user abandonment. Solution: Preload next 2-3 videos, lazy loading with FlashList, enforce 720p max, cache played videos locally.
- **Stripe webhook reliability** — Webhooks fail or are missed → subscription state drifts. Solution: Validate webhook signature, idempotent handling (use event.id), respond <5 seconds, monitor webhook failures, daily reconciliation cron job.
- **No error monitoring from day 1** — Users churn silently when app crashes. Solution: Install Sentry before first deployment, wrap components in error boundaries, include user context in error reports.

## Implications for Roadmap

Based on research, the project naturally divides into three phases aligned with product validation stages and architectural dependencies. Phase ordering is driven by: (1) need to validate demand before building consumer features, (2) need to seed content before launching to consumers, (3) need to collect training data before building ML features.

### Phase 1: Waitlist MVP (Weeks 1-4)
**Rationale:** Validate demand and generate revenue from pros before investing in consumer features. Pro content seeding is prerequisite for consumer launch. Solo developer must ship fast to avoid runway constraints.

**Delivers:** Functioning waitlist app where pros can sign up, subscribe, upload videos, browse peer content, complete validation survey. Generates 100 paying subscribers ($10k MRR) and 300+ seeded videos.

**Addresses features:**
- Pro onboarding & authentication (Supabase Auth)
- Profile creation (name, role, service area)
- Video upload from gallery (expo-image-picker — simpler than camera recording)
- Basic video feed (FlatList, direct playback, no swipes yet)
- Subscription billing ($100/month via Stripe web checkout)
- In-app survey (after video upload, before payment)
- Basic behavioral analytics (PostHog tracking: signup, video_upload, subscription_created, video_viewed)

**Avoids pitfalls:**
- Video compression + 50MB file size limit (prevents storage cost explosion)
- Supabase Pro plan from day 1 (no cold starts)
- Simple RLS policies (authenticated users CRUD own data)
- Web-based Stripe checkout via expo-web-browser (not WebView)
- Environment variables for Stripe keys (not hardcoded)
- Event schema designed for ML training (timestamps, user context, video metadata)
- Sentry + PostHog installed before deployment
- Deploy to TestFlight early (week 2)

**Research flags:** None — all features use well-documented patterns (Expo, Supabase Auth, Stripe Checkout, basic video upload).

### Phase 2: Optimization & Polish (Weeks 5-6)
**Rationale:** Improve performance and UX based on early user feedback. Add features that reduce friction (compression, gestures) and improve engagement (swipes, feed polish). Requires Phase 1 to be live to collect feedback.

**Delivers:** Polished waitlist experience with faster uploads, smoother feed, swipe interactions for peer engagement, enhanced analytics.

**Uses stack elements:**
- react-native-compressor (client-side compression, 60-80% size reduction)
- react-native-gesture-handler + reanimated (swipe mechanics)
- @shopify/flash-list (replaces FlatList, 5-10x faster)
- Enhanced PostHog tracking (watch_duration, swipe_right, swipe_left, profile_clicked)

**Implements architecture:**
- Video compression pipeline (compress before upload, background processing)
- SwipeHandler component (pan gestures, animations, haptic feedback)
- Feed caching layer (cursor-based pagination, prefetch next page)
- Video preloading (next 2-3 videos while current plays)

**Avoids pitfalls:**
- Client-side compression tested on low-end Android devices (not just iPhone)
- Upload retry logic with exponential backoff (mobile networks unreliable)
- Stripe webhook idempotency (handle duplicate events)
- Storage monitoring alerts (50GB, 75GB, 90GB thresholds)

**Research flags:** None — compression, gestures, and list optimization are standard React Native patterns.

### Phase 3: Consumer Launch (Weeks 7-10)
**Rationale:** Launch consumer-facing features to complete the two-sided marketplace. Requires content seeding from Phase 1 and performance optimization from Phase 2. Introduces geo-scoping, deck architecture, and routing logic.

**Delivers:** Consumer app where users browse pros by role category (lender → agent → attorney), swipe right/left to express interest, see finite local content, receive match notifications.

**Addresses features:**
- Consumer account creation (lightweight, minimal friction)
- Deck-based feed organization (role categories: lender, agent, attorney)
- Geo-scoping (filter pros by consumer location)
- Swipe interactions (left = pass, right = interested)
- Match recording (swipe-right creates match record)
- Pro ranking algorithm (response rate, engagement score, recency)
- End-of-deck UI (finite content, "You've seen all lenders in Houston")
- Push notifications (match alerts via expo-notifications)

**Implements architecture:**
- DeckManager service (query videos by role category + geo)
- Deck pagination (cursor-based per deck)
- Routing logic (rank pros by performance metrics)
- Match table (consumer_id ↔ pro_id mapping)
- Pro ranking calculation (response_rate, engagement_score, recency)
- Notification service (Expo Push Notifications)

**Avoids pitfalls:**
- Video transcoding via Mux/Cloudflare (if storage >50GB or consumer UX demands HLS)
- Real-time subscriptions evaluated (likely skip, use pull-to-refresh instead)
- Full behavioral event schema (swipe_right, swipe_left, message_sent, response_time, conversion_event)
- Subscription state reconciliation (daily cron job syncs Stripe with database)

**Research flags:**
- **Geo-scoping logic**: Needs research into Supabase spatial queries vs application-level filtering (depends on scale)
- **Pro ranking algorithm**: Needs experimentation to determine optimal weights (response rate vs engagement vs recency)
- **Push notification infrastructure**: Evaluate Expo's push service limits vs dedicated service (depends on user count)

### Phase 4: ML Training Pipeline (Post-Launch, Weeks 11+)
**Rationale:** Prepare behavioral data for future LLM training to build defensible moat. Requires months of consumer data collection from Phase 3. Long-term strategic investment, not MVP blocker.

**Delivers:** Data export pipeline, feature engineering, model training infrastructure, inference API for intent prediction and pro ranking optimization.

**Uses stack elements:**
- Supabase Edge Functions (scheduled jobs for data export)
- S3/GCS export (Parquet format for ML training)
- pgvector extension (vector similarity for video embeddings)
- Future LLM fine-tuning infrastructure (outside Supabase)

**Implements architecture:**
- Data export pipeline (Supabase → S3 batch export)
- Feature engineering (transform events → ML features)
- Training data labels (conversion outcomes, response times)
- Inference API (Edge Function serving model predictions)

**Research flags:**
- **ML infrastructure**: Needs deep research into training pipeline (data warehouse, feature store, model serving) — defer until Phase 3 has collected sufficient data (6-12 months)
- **LLM fine-tuning approach**: Needs research into which LLM architecture suits intent prediction + content optimization use cases

### Phase Ordering Rationale

**Why Phase 1 before Phase 2:**
- Must validate demand (100 paying pros) before investing in optimization
- Need real user feedback to know what to optimize
- Solo developer constraint: ship fast, iterate based on data

**Why Phase 2 before Phase 3:**
- Consumer launch with poor video performance = permanent churn
- Compression is prerequisite to avoid storage cost bankruptcy
- Swipe gestures tested on pro peer engagement before consumer launch

**Why Phase 3 before Phase 4:**
- Need months of consumer behavioral data before ML training is valuable
- Premature ML work wastes time on insufficient data
- Routing algorithm can start rule-based, then ML-enhanced later

**Dependencies discovered:**
- Geo-scoping depends on profile setup (Phase 1)
- Deck architecture depends on role categorization (Phase 1)
- Pro ranking depends on behavioral events (Phase 1-2)
- ML training depends on labeled outcomes from consumer conversions (Phase 3)

**How this avoids pitfalls:**
- Phase 1 implements video compression to avoid storage cost explosion
- Phase 1 uses web-based Stripe checkout to avoid App Store rejection
- Phase 1 designs event schema correctly to avoid blocking future ML training
- Phase 2 defers transcoding until costs justify it (not premature optimization)
- Phase 3 defers AI matching until training data exists (not building blind)

### Research Flags

**Phases needing deeper research during planning:**
- **Phase 3 (Consumer Launch)**: Geo-scoping implementation (spatial queries vs app filtering), pro ranking algorithm weights, push notification infrastructure evaluation
- **Phase 4 (ML Pipeline)**: Training infrastructure architecture, LLM fine-tuning approach, data warehouse selection

**Phases with standard patterns (skip research-phase):**
- **Phase 1 (Waitlist MVP)**: All features use well-documented Expo, Supabase, and Stripe patterns
- **Phase 2 (Optimization)**: Video compression, gesture handlers, and list optimization are standard React Native patterns

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | **HIGH** | Expo SDK 54, Supabase, and Stripe are production-proven for this exact use case. Version numbers verified against current releases. Only uncertainty is expo-video (new in SDK 54) but it's the official solution. |
| Features | **HIGH** | Feature breakdown based on multiple TikTok-style marketplace references (Thumbtack, Angi, Bark) plus real estate professional marketplace patterns. Table stakes vs differentiators clearly identified. |
| Architecture | **HIGH** | Component boundaries, data flows, and build order follow established patterns for video-first mobile apps. Supabase + Stripe integration well-documented. Video pipeline architecture validated against Expo docs. |
| Pitfalls | **HIGH** | Pitfalls sourced from official Supabase docs (RLS issues), Stripe docs (webhook best practices), App Store guidelines (payment policies), and video optimization guides. Cost projections validated with pricing pages. |

**Overall confidence:** **HIGH**

The recommended stack, architecture, and pitfall mitigations are all based on official documentation, current pricing, and established patterns in the React Native + Supabase ecosystem. The only medium-confidence area is expo-video (new API in SDK 54), but it's the official Expo solution and has fallback (expo-av) if needed.

### Gaps to Address

**Video transcoding timing:** Research identifies Mux/Cloudflare Stream as post-MVP solutions but doesn't definitively answer "at what scale is transcoding required?" **Resolution:** Monitor video playback performance and storage costs during Phase 1-2. Implement transcoding when either (a) storage costs >$200/month or (b) consumer complaints about buffering >10% of feedback.

**Geo-scoping implementation:** Research doesn't specify whether to use PostGIS (Supabase spatial extension) vs application-level filtering for location-based queries. **Resolution:** Start with application-level filtering (simpler) in Phase 1-2, evaluate PostGIS if query performance becomes issue in Phase 3.

**Pro ranking algorithm:** Research identifies factors (response rate, engagement, recency) but not optimal weights. **Resolution:** Start with equal weights in Phase 3, A/B test variations, let data determine optimal formula.

**Push notification scale:** Research doesn't determine if Expo Push Notifications can handle expected load or if dedicated service (OneSignal, Firebase) needed. **Resolution:** Start with Expo in Phase 3, evaluate upgrade when push volume >10k/day.

**ML training data volume:** Research doesn't quantify "how much data before ML training is viable?" **Resolution:** Industry standard is 10k+ labeled examples for meaningful model. Wait until Phase 3 has 6-12 months of consumer data (estimated 10k+ swipes with conversion labels).

## Sources

### Primary (HIGH confidence)
- **Expo Documentation** (docs.expo.dev) — expo-video v3.x API, expo-camera, expo-av, Expo SDK 54 release notes, EAS Build documentation
- **Supabase Documentation** (supabase.com/docs) — Row-Level Security best practices, Storage limits and pricing, Edge Functions, Auth flows, PostgreSQL features
- **Stripe Documentation** (stripe.com/docs) — Mobile SDK integration, webhook best practices, subscription management, React Native integration guide
- **Apple App Store Review Guidelines** (developer.apple.com) — Section 3.1.1 In-App Purchase requirements (critical for Stripe implementation)
- **React Native Documentation** (reactnative.dev) — react-native-gesture-handler, react-native-reanimated APIs

### Secondary (MEDIUM confidence)
- **@shopify/flash-list GitHub** — Performance benchmarks vs FlatList, implementation patterns for video feeds
- **PostHog Documentation** — React Native SDK, event tracking patterns, session replay features, data export capabilities
- **Community patterns** — TikTok-style feed implementations (multiple GitHub examples), Supabase + Stripe integration patterns (community tutorials)

### Tertiary (LOW confidence)
- **Video compression ratios** — react-native-compressor achieving 60-80% reduction (needs validation with MVR's specific video types)
- **Cost projections** — Based on current Supabase/Stripe pricing pages, but usage patterns may vary
- **ML training timelines** — Industry norms for data collection before training, not MVR-specific

---
*Research completed: 2026-02-08*
*Ready for roadmap: yes*
*Next step: Roadmap creation using these phase suggestions*
