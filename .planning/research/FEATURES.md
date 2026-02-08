# Features Research: Video-First Professional Marketplace

**Research Date:** 2026-02-08
**Context:** MVR waitlist MVP for real estate professionals in Houston
**Phase:** Waitlist/early-access focus + full-launch consumer experience considerations

---

## Executive Summary

Video-first professional marketplaces (TikTok-style feeds for service providers) require a careful balance of content discovery, trust signals, and engagement mechanics. For MVR's waitlist phase, the focus is on pro onboarding, content seeding, and validation. For full launch, the consumer experience centers on efficient matching through swipeable video decks.

This document categorizes features into:
- **Table Stakes**: Must-have features or users leave
- **Differentiators**: Competitive advantages that set MVR apart
- **Anti-Features**: Things to deliberately NOT build to maintain focus and quality

---

## Table Stakes Features

### 1. Professional Onboarding & Profile

**Description:** Basic account creation, profile setup, and verification flow for professionals.

**Components:**
- Email/password authentication
- Profile creation (name, role category, service area, bio)
- Role categorization (lender, agent, attorney, etc.)
- Service area/geo-scope selection
- Profile photo upload
- Basic verification (email, phone optional)

**Complexity:** Low-Medium
- Auth: Low (Supabase handles this)
- Profile CRUD: Low
- Verification: Low (email), Medium (phone/identity)

**Why Table Stakes:** Without reliable pro identity and categorization, the marketplace cannot function. Consumers need to know who they're connecting with and trust their credentials.

**Dependencies:**
- Supabase auth setup
- Profile database schema
- Basic form validation

**Waitlist Phase Priority:** Critical - needed immediately

---

### 2. Video Upload/Recording

**Description:** Allow pros to create and post video content either by recording in-app or uploading from camera roll.

**Components:**
- In-app camera access (Expo Camera)
- Video recording with start/stop controls
- Camera roll/gallery upload (Expo ImagePicker)
- Video preview before posting
- Basic video metadata capture (duration, file size)
- Upload to cloud storage (Supabase Storage)
- Progress indicator during upload

**Complexity:** Medium
- Camera integration: Medium (Expo Camera API)
- Upload: Low-Medium (Supabase Storage)
- Video compression/optimization: Medium-High (important for performance)

**Why Table Stakes:** The core value proposition is video-first discovery. Without video posting, there is no product.

**Dependencies:**
- Supabase Storage configuration
- File size/format validation
- Network handling for uploads

**Waitlist Phase Priority:** Critical - pros need to post content immediately

---

### 3. Video Feed/Discovery

**Description:** Browse video content in a feed format. For waitlist: pro-to-pro browsing. For launch: consumer-facing swipeable decks.

**Components:**
- Scrollable video feed
- Video player with play/pause controls
- Auto-play on scroll (TikTok-style)
- Mute/unmute toggle
- Video looping
- Loading states and error handling
- Smooth scrolling performance optimization

**Complexity:** Medium-High
- Video player: Medium (Expo AV)
- Feed rendering: Medium (FlatList optimization)
- Auto-play logic: Medium
- Performance: High (battery drain, memory leaks)

**Why Table Stakes:** Discovery is the core user experience. Poor feed performance = immediate churn.

**Dependencies:**
- Video storage/CDN
- Feed data fetching (pagination)
- Video player library

**Waitlist Phase Priority:** High - needed for pros to preview content and validate experience

---

### 4. Swipe Interactions (Consumer Launch)

**Description:** Left/right swipe gestures within role-category decks to express interest or pass.

**Components:**
- Pan gesture recognizer (react-native-gesture-handler)
- Swipe animations (card movement, fade, spring)
- Swipe direction detection (left = pass, right = interest)
- Visual feedback (overlay icons, haptics)
- Undo last swipe (1-action buffer)
- Deck progression tracking

**Complexity:** Medium-High
- Gesture handling: Medium (react-native-gesture-handler)
- Animations: Medium-High (react-native-reanimated)
- State management: Medium (tracking swipes, deck state)

**Why Table Stakes:** The swipe mechanic IS the consumer interaction model. Without it, the Tinder-for-professionals metaphor breaks down.

**Dependencies:**
- Gesture handler library
- Animation library (reanimated)
- Deck data structure

**Waitlist Phase Priority:** Low - not needed until consumer launch
**Consumer Launch Priority:** Critical

---

### 5. Role-Based Deck Organization (Consumer Launch)

**Description:** Videos organized into horizontal-scrollable decks by professional role category (lender → agent → attorney).

**Components:**
- Deck navigation (horizontal scroll between decks)
- Deck labels/headers (role category names)
- Visual deck boundaries (clear separation)
- "Skip deck" gesture (scroll past entire category)
- Deck completion states (end of deck indicator)
- Return to previous deck

**Complexity:** Medium
- UI layout: Low-Medium (horizontal + vertical scrolling)
- Navigation: Medium (nested scroll handling)
- State tracking: Medium (which deck, position in deck)

**Why Table Stakes:** Consumers need different professionals for different roles. Forcing linear browsing through all pros would create terrible UX.

**Dependencies:**
- Feed architecture
- Professional role taxonomy
- Navigation state management

**Waitlist Phase Priority:** None - consumer feature only
**Consumer Launch Priority:** Critical

---

### 6. Geo-Scoping/Location Filtering

**Description:** Show only professionals who serve the consumer's area. For pros: specify service areas.

**Components:**
- Location permission request (on consumer side)
- Geo-coding user location
- Service area definition for pros (city, zip codes, radius)
- Filtering logic (show only local pros)
- Location display on profiles

**Complexity:** Medium
- Location API: Low (Expo Location)
- Geo-filtering: Medium (database queries, distance calculation)
- Service area definition: Medium (UI complexity, multiple formats)

**Why Table Stakes:** Real estate is hyper-local. Showing out-of-area pros wastes everyone's time and destroys trust.

**Dependencies:**
- Location permissions
- Geocoding service
- Database spatial queries or filtering logic

**Waitlist Phase Priority:** Medium - pros need to set service areas
**Consumer Launch Priority:** Critical

---

### 7. Payment/Subscription (Pro Side)

**Description:** $100/month subscription for founding pros via Stripe.

**Components:**
- Stripe integration (react-native-stripe-sdk or web redirect)
- Subscription plan setup (monthly recurring)
- Payment form (card entry)
- Subscription status tracking (active, expired, canceled)
- Payment confirmation screen
- Subscription management (cancel, update card)

**Complexity:** Medium
- Stripe integration: Medium (API setup, webhooks)
- Payment UI: Low-Medium
- Subscription state: Medium (sync with backend)

**Why Table Stakes:** Subscription revenue validates demand and funds development. Without payment, pros don't have "skin in the game."

**Dependencies:**
- Stripe account setup
- Backend webhook handling (Supabase Edge Functions)
- Database subscription status tracking

**Waitlist Phase Priority:** Critical - needed for validation

---

### 8. Push Notifications (Post-Waitlist)

**Description:** Notify consumers when matched pros respond. Notify pros when consumers express interest.

**Components:**
- Push token registration (Expo Notifications)
- Notification sending (backend trigger)
- Notification display (banner, badge count)
- Notification tap handling (deep linking to conversation)
- Notification preferences (opt-in/out)

**Complexity:** Medium
- Expo notifications: Medium (setup, permissions)
- Backend triggers: Medium (when to send)
- Deep linking: Medium (navigate to specific screen)

**Why Table Stakes:** Without notifications, response rates plummet. Real-time communication expectation in 2026.

**Dependencies:**
- Expo notification service
- Backend notification queue
- Deep linking configuration

**Waitlist Phase Priority:** None - no matching yet
**Consumer Launch Priority:** High (needed shortly after launch)

---

### 9. Basic Analytics/Behavioral Data Capture

**Description:** Track user actions (video posts, swipes, profile views, survey responses) for LLM training and performance optimization.

**Components:**
- Event tracking system (custom or Segment/Mixpanel)
- Event types (video_posted, video_viewed, profile_viewed, swipe_right, swipe_left, survey_started, survey_completed, subscription_started)
- User ID association
- Timestamp and session tracking
- Data storage (Supabase, separate analytics DB)

**Complexity:** Medium
- Event tracking: Low-Medium (simple logging)
- Data modeling: Medium (event schema design)
- Privacy/compliance: Medium (user consent, data retention)

**Why Table Stakes:** The long-term business model depends on behavioral data for LLM training. Without tracking from day one, you lose critical early-stage data.

**Dependencies:**
- Event schema design
- Database storage for events
- User consent flow

**Waitlist Phase Priority:** High - start collecting from day one

---

### 10. In-App Survey (Waitlist)

**Description:** Survey pros at peak intent moment to capture validation data for investors.

**Components:**
- Survey form (multi-step or single page)
- Question types (multiple choice, text, rating scales)
- Survey placement logic (when to show)
- Survey skip/dismiss
- Response storage
- Survey analytics dashboard (admin)

**Complexity:** Low-Medium
- Form UI: Low
- Survey logic: Low
- Data storage: Low
- Analytics: Medium

**Why Table Stakes:** Survey data proves market demand to investors. Without validation data, fundraising is harder.

**Dependencies:**
- Form library (react-hook-form)
- Database survey response schema

**Waitlist Phase Priority:** Critical - needed for validation

---

## Differentiators

### 1. Deck-Based Feed Architecture (vs Linear Feed)

**Description:** Videos organized as swipeable decks by role category, not a single infinite scroll.

**Why Differentiating:**
- Most video marketplaces use linear feeds (Thumbtack, Angi, Bark). MVR's deck system allows consumers to quickly navigate between professional types without scrolling through irrelevant content.
- Mimics real-world process: "I need a lender first, then an agent, then maybe an attorney."
- Creates finite, manageable content pools per deck (reduces overwhelm).

**Complexity:** Medium
- Unique UI pattern requires custom navigation
- State management across decks

**Dependencies:**
- Swipe mechanics
- Role categorization

**Trade-offs:**
- More complex than linear feed
- May confuse users initially (needs onboarding)

---

### 2. Import Social Media Videos (Content Seeding)

**Description:** Encourage pros to import existing videos from Instagram, TikTok, or camera roll rather than requiring new recordings.

**Why Differentiating:**
- Reduces friction for pros with existing social presence
- Content is "socially approved" (already performed well)
- Faster content seeding during waitlist
- Differentiates from platforms requiring platform-specific content

**Complexity:** Low-Medium
- Upload from camera roll: Low (Expo ImagePicker)
- Social import: High (API access, TikTok/IG APIs restricted)
- Likely implementation: "Download your video and upload here" guidance

**Dependencies:**
- Video upload infrastructure
- Content guidelines (what's acceptable)

**Trade-offs:**
- Content may not be optimized for platform
- Risk of off-brand or promotional content

---

### 3. Peer Quality Signals (Pro-to-Pro Browsing During Waitlist)

**Description:** During waitlist, pros can see each other's content and react/engage, creating pre-labeled quality signals.

**Why Differentiating:**
- Generates training data before consumers arrive
- Pros who get peer engagement may be better performers
- Creates community/competitive dynamic during waitlist
- Unique dataset: professional peer validation of service providers

**Complexity:** Medium
- Engagement mechanics (likes, saves, comments)
- Data modeling (engagement graph)
- Privacy considerations (should engagement be public?)

**Dependencies:**
- Feed infrastructure
- Engagement tracking

**Trade-offs:**
- Could create cliques or favoritism
- May not correlate with consumer preferences

---

### 4. Behavioral Data for LLM Training (Long-Term Play)

**Description:** Collect granular behavioral data (swipes, watch time, message response rates, conversion) to train LLMs on buying intent detection.

**Why Differentiating:**
- Most marketplaces use behavioral data for recommendations, not LLM training
- Creates defensible moat: proprietary training data
- Enables future AI-powered features (auto-match, intent prediction, lead scoring)

**Complexity:** High
- Data infrastructure: High (scale, privacy, compliance)
- LLM training: Very High (ML expertise, compute)
- Feature engineering: High (what signals matter?)

**Dependencies:**
- Analytics infrastructure
- Data science/ML team (future)
- Legal/privacy framework

**Trade-offs:**
- Long payoff timeline
- Requires massive scale to be useful
- Privacy risks if mishandled

---

### 5. Finite, Geo-Scoped Content (vs Infinite Scroll)

**Description:** Consumers see a finite number of pros per category per area. When deck ends, they're done (no infinite scroll).

**Why Differentiating:**
- Reduces decision paralysis (paradox of choice)
- Creates urgency: "These are YOUR local pros, pick one"
- Differentiates from infinite-scroll fatigue (TikTok, Instagram)
- Pros know they're competing with a finite set of locals

**Complexity:** Low
- Natural consequence of geo-scoping
- End-of-deck UI needed

**Dependencies:**
- Geo-filtering
- Deck architecture

**Trade-offs:**
- In small markets, decks may be too thin (3-5 pros per category)
- Consumers may want "see more" option

---

### 6. Subscription Before Consumer Access (Signal Quality)

**Description:** Pros pay $100/month before consumers arrive, proving commitment.

**Why Differentiating:**
- Filters out low-commitment pros
- Creates revenue before product-market fit
- Pro subscription marketplaces often wait until proven demand
- High price point signals premium positioning

**Complexity:** Low (already planned)

**Dependencies:**
- Payment infrastructure

**Trade-offs:**
- May limit waitlist size
- High barrier to entry could slow content seeding

---

### 7. Survey at Peak Intent (Strategic Placement)

**Description:** Place validation survey AFTER pros have invested time (uploaded video, filled profile) but BEFORE payment, when commitment is highest.

**Why Differentiating:**
- Higher quality responses than "survey on entry"
- Psychological momentum: "I've come this far, might as well complete the survey"
- Captures data at moment of highest engagement

**Complexity:** Low
- Survey placement logic: Low

**Dependencies:**
- Onboarding flow design

**Trade-offs:**
- May feel like a barrier if survey is too long
- Could cause drop-off if survey is frustrating

---

## Anti-Features (Deliberately NOT Building)

### 1. In-App Messaging/Chat

**Why NOT Building:**
- Waitlist phase: No consumer-to-pro communication yet
- Consumer launch: Routing should lead to phone/email, not in-app chat
- Complexity: High (real-time messaging, notifications, moderation)
- Trade-off: Reduces control of conversation, creates support burden

**Alternative:** Route consumers to pro's phone/email directly after match.

**Revisit:** Post-launch if data shows consumers want in-app communication.

---

### 2. Web Landing Page / Web App

**Why NOT Building:**
- Mobile-only optimizes for commitment (app download = real intent)
- Web app increases surface area for bugs, testing
- Solo developer: doubling platforms doubles work

**Alternative:** Simple redirect page ("Download our app") for SEO.

**Revisit:** If web traffic is significant and conversion is high.

---

### 3. OAuth/Social Login (Google, Apple, Facebook)

**Why NOT Building:**
- Waitlist phase: Email/password sufficient
- Complexity: Medium (OAuth flows, token management, account linking)
- Trust: Real estate pros may prefer email/password (perceived control)

**Alternative:** Email/password only.

**Revisit:** Post-launch if user feedback indicates demand.

---

### 4. Pro-to-Consumer Direct Reach-Out

**Why NOT Building:**
- Creates spam risk (pros messaging all consumers)
- Undermines routing algorithm (pros bypass system)
- Requires moderation/abuse prevention

**Alternative:** System-controlled routing only.

**Revisit:** Only if power users demand it AND abuse can be controlled.

---

### 5. Multiple Payment Tiers (Freemium, Basic, Premium)

**Why NOT Building:**
- Waitlist phase: Single $100/month tier simplifies everything
- Complexity: Tier management, feature gating, upgrade flows
- Positioning: Premium-only signals quality

**Alternative:** Single founding pro tier.

**Revisit:** Post-launch if market segmentation is clear (e.g., premium tier for priority routing).

---

### 6. Consumer Account Creation (Waitlist Phase)

**Why NOT Building:**
- Waitlist is pro-only
- Consumer features come after content seeding
- Premature: No value for consumers yet

**Alternative:** No consumer accounts until launch.

**Revisit:** Immediately post-waitlist validation.

---

### 7. Public Ratings/Reviews (Star Ratings, Written Reviews)

**Why NOT Building:**
- Complexity: Moderation, fake reviews, disputes
- UX: TikTok-style feeds don't have ratings (video IS the review)
- Differentiation: Swipe-based interest replaces ratings
- Legal risk: Negative reviews can create liability in professional services

**Alternative:** Implicit signals (swipes, response rates, conversions) replace explicit ratings.

**Revisit:** Only if consumers demand trust signals beyond video.

---

### 8. Non-Real Estate Verticals

**Why NOT Building:**
- Focus: Real estate only for v1
- Complexity: Each vertical has unique needs (licensing, matching logic, trust signals)
- Market risk: Diluting focus before PMF

**Alternative:** Houston real estate only.

**Revisit:** After achieving PMF and scale in real estate.

---

### 9. AI-Powered Matching (Launch Phase)

**Why NOT Building:**
- Waitlist: Not needed (no consumers yet)
- Consumer launch: Let users swipe manually first to collect training data
- Complexity: High (ML models, feature engineering, testing)
- Risk: Bad matches early will kill trust

**Alternative:** Manual swipe-based discovery first. Algorithm optimizes deck ORDER (high-performers first), not matching.

**Revisit:** After 6-12 months of consumer data collection.

---

### 10. Video Editing Tools (Filters, Trim, Text Overlays)

**Why NOT Building:**
- Complexity: High (video editing SDKs, export, rendering)
- User expectation: Pros already have editing tools (CapCut, InShot, native apps)
- Feature creep: MVR is discovery platform, not editing platform

**Alternative:** Upload/record only. Edit externally.

**Revisit:** Only if data shows pros abandoning uploads due to lack of editing.

---

## Feature Complexity Matrix

| Feature | Complexity | Dependencies | Waitlist Priority | Consumer Launch Priority |
|---------|-----------|--------------|-------------------|-------------------------|
| Pro onboarding/profile | Low-Medium | Supabase auth, DB schema | Critical | — |
| Video upload/record | Medium | Supabase Storage, Expo Camera | Critical | — |
| Video feed (pro browsing) | Medium-High | Video storage, FlatList | High | — |
| Swipe interactions | Medium-High | Gesture handler, animations | None | Critical |
| Deck organization | Medium | Feed architecture, role taxonomy | None | Critical |
| Geo-scoping | Medium | Location API, spatial queries | Medium | Critical |
| Payment/subscription | Medium | Stripe, webhooks | Critical | — |
| Push notifications | Medium | Expo Notifications, deep linking | None | High |
| Behavioral analytics | Medium | Event schema, DB storage | High | High |
| In-app survey | Low-Medium | Form library, DB schema | Critical | — |
| Import social videos | Low-Medium | Camera roll upload | Medium | — |
| Peer quality signals | Medium | Engagement mechanics | Medium | None |
| Finite content (end of deck) | Low | Geo-filtering, deck UI | None | Medium |

---

## Feature Dependencies Graph

```
Pro Onboarding (Supabase Auth)
  ├─> Profile Setup (DB Schema)
  │     ├─> Role Categorization
  │     └─> Service Area (Geo-Scoping)
  ├─> Video Upload (Supabase Storage)
  │     └─> Video Feed (Pro Browsing)
  │           └─> Peer Quality Signals (Engagement)
  ├─> In-App Survey (Form + DB)
  └─> Payment/Subscription (Stripe)
        └─> Subscription Status Tracking

Consumer Launch:
  Geo-Scoping (Location API)
  ├─> Deck Organization (Role Categories)
  │     └─> Swipe Interactions (Gestures)
  │           └─> Behavioral Analytics
  │                 └─> LLM Training Data (Long-term)
  └─> Finite Content (End of Deck UI)

Post-Launch:
  Swipe Interactions
    └─> Push Notifications (Match events)
          └─> Deep Linking (Open conversation)
```

---

## Implementation Phasing

### Phase 1: Waitlist MVP (Now)
**Goal:** Onboard founding pros, collect content, validate demand, generate revenue

**Must-Have:**
1. Pro onboarding/auth (Supabase)
2. Profile creation (name, role, area)
3. Video upload/record
4. Video feed (pro browsing)
5. In-app survey
6. Payment/subscription ($100/month)
7. Behavioral analytics (basic events)

**Should-Have:**
8. Import social videos (camera roll)
9. Peer quality signals (likes/saves)

**Could-Have:**
10. Geo-scoping (for pros to set service area)

---

### Phase 2: Consumer Launch (Post-Waitlist)
**Goal:** Launch consumer-facing swipeable feed, enable matching, route consumers to pros

**Must-Have:**
1. Consumer account creation (lightweight)
2. Deck organization (role categories)
3. Swipe interactions (left/right)
4. Geo-scoping (filter pros by consumer location)
5. End-of-deck UI (finite content)
6. Match recording (swipe-right = interest)
7. Routing logic (show high-performers first)
8. Push notifications (match alerts)

**Should-Have:**
9. Deep linking (notification -> profile)
10. Enhanced behavioral analytics (watch time, swipe patterns)

**Could-Have:**
11. Undo swipe (1-action buffer)
12. Pro response rate tracking

---

### Phase 3: Post-Launch Optimization (3-6 Months)
**Goal:** Improve matching, optimize routing, collect data for LLM training

**Must-Have:**
1. Pro response rate tracking
2. Consumer conversion tracking (did they hire the pro?)
3. Algorithm optimization (rank pros by performance)
4. Data pipeline for LLM training

**Should-Have:**
5. Enhanced notifications (response reminders, engagement nudges)
6. Pro analytics dashboard (show performance metrics)
7. Consumer feedback loop (was the match good?)

**Could-Have:**
8. A/B testing framework (test deck order, swipe mechanics)
9. Referral system (consumer refers consumer, pro refers pro)

---

## Quality Gates

- [x] Categories are clear (table stakes vs differentiators vs anti-features)
- [x] Complexity noted for each feature
- [x] Dependencies between features identified
- [x] Waitlist vs consumer launch priorities separated
- [x] Implementation phasing outlined
- [x] Anti-features justified with "why NOT" rationale

---

## Key Takeaways

1. **Table Stakes Focus:** Pro onboarding, video upload, feed, payment, and survey are critical for waitlist. Swipe interactions, deck organization, and geo-scoping are critical for consumer launch.

2. **Differentiators Prioritize:** Deck-based feed (vs linear), importing social videos, peer quality signals, and finite geo-scoped content are competitive advantages.

3. **Anti-Features Protect Scope:** Avoid in-app chat, web app, OAuth, ratings/reviews, and video editing tools to maintain focus and velocity.

4. **Complexity Management:** Most features are Low-Medium complexity. High-complexity features (LLM training, AI matching) are long-term plays, not MVP blockers.

5. **Dependency Awareness:** Geo-scoping, role categorization, and behavioral analytics underpin multiple features. Build these early.

6. **Data-First Strategy:** Start collecting behavioral data on day one. It's the long-term moat.

---

*Research completed: 2026-02-08*
*Feeds into: Requirements definition, roadmap planning, engineering estimates*
