# Requirements: MVR

**Defined:** 2026-02-08
**Core Value:** Route consumers to the right real estate professional instantly through a video-first, swipe-driven experience.

## v1 Requirements

Requirements for waitlist MVP launch. Each maps to roadmap phases.

### Authentication

- [ ] **AUTH-01**: Pro can create account with email and password
- [ ] **AUTH-02**: Pro receives email verification after signup
- [ ] **AUTH-03**: Pro session persists across app restarts

### Pro Profile

- [ ] **PROF-01**: Pro can set display name and profile photo
- [ ] **PROF-02**: Pro can select role category (lender, agent, attorney, etc.)
- [ ] **PROF-03**: Pro can set service area / location (Houston first)
- [ ] **PROF-04**: Pro can write a bio / about section

### Video

- [ ] **VID-01**: Pro can record video directly in-app
- [ ] **VID-02**: Pro can upload video from camera roll
- [ ] **VID-03**: Videos are compressed client-side before upload
- [ ] **VID-04**: Pro can view and play videos in the feed

### Feed

- [ ] **FEED-01**: Scrollable vertical video feed showing pro content
- [ ] **FEED-02**: Feed organized as decks by role category (lender, agent, attorney, etc.)
- [ ] **FEED-03**: Pro can swipe left/right within decks to express interest
- [ ] **FEED-04**: Content geo-scoped to pro's local area
- [ ] **FEED-05**: Pro can like / engage with other pros' videos

### Payments

- [ ] **PAY-01**: Pro can subscribe to founding tier ($100/month) via web-based Stripe checkout
- [ ] **PAY-02**: Pro can view subscription status in-app
- [ ] **PAY-03**: Pro can cancel subscription (accessible but not prominent)

### Survey

- [ ] **SURV-01**: Pro completes in-app survey at strategically-placed high-intent moment
- [ ] **SURV-02**: Pro can skip the survey if they choose
- [ ] **SURV-03**: Aggregate survey results viewable in dashboard (for founder/investors)

### Notifications

- [ ] **NOTF-01**: Pro receives push notifications (likes, new pros in area)
- [ ] **NOTF-02**: In-app notification feed showing recent activity

### Data Infrastructure

- [ ] **DATA-01**: Database schema designed ML-ready for future behavioral event collection

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Authentication

- **AUTH-04**: Pro can reset password via email link
- **AUTH-05**: Pro can log in with OAuth / social login

### Data & Analytics

- **DATA-02**: Full behavioral event tracking (swipes, watch time, profile visits)
- **DATA-03**: Pro engagement metrics dashboard (views, likes, engagement rate)
- **DATA-04**: Pro-to-pro interaction and referral network tracking

### Consumer

- **CONS-01**: Consumer can create account and browse pro feed
- **CONS-02**: Consumer sees deck-based feed organized by role category
- **CONS-03**: Consumer can swipe and connect with pros
- **CONS-04**: AI-powered matching/routing algorithm surfaces best pros

### Messaging

- **MSG-01**: In-app messaging between pros and consumers

### Video

- **VID-05**: In-app video editing tools (trim, filters)

### Payments

- **PAY-04**: Multiple payment tiers beyond founding pro

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Web landing page | Mobile-only optimizes for commitment and signals "this is real" |
| Non-real-estate verticals | Real estate only for v1; vertical expansion is post-validation |
| Free trial period | $100/month filters for serious, committed pros |
| Consumer-side features | Pro-only waitlist phase; consumers come after content is seeded |
| Real-time chat | High complexity, not needed during waitlist phase |
| Video editing tools | Keep posting friction low; pros should use existing social content |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | Phase 2 | Pending |
| AUTH-02 | Phase 2 | Pending |
| AUTH-03 | Phase 2 | Pending |
| PROF-01 | Phase 3 | Pending |
| PROF-02 | Phase 3 | Pending |
| PROF-03 | Phase 3 | Pending |
| PROF-04 | Phase 3 | Pending |
| VID-01 | Phase 5 | Pending |
| VID-02 | Phase 4 | Pending |
| VID-03 | Phase 4, Phase 6 | Pending |
| VID-04 | Phase 7 | Pending |
| FEED-01 | Phase 7 | Pending |
| FEED-02 | Phase 8 | Pending |
| FEED-03 | Phase 8 | Pending |
| FEED-04 | Phase 8 | Pending |
| FEED-05 | Phase 7 | Pending |
| PAY-01 | Phase 9 | Pending |
| PAY-02 | Phase 9 | Pending |
| PAY-03 | Phase 9 | Pending |
| SURV-01 | Phase 10 | Pending |
| SURV-02 | Phase 10 | Pending |
| SURV-03 | Phase 10 | Pending |
| NOTF-01 | Phase 11 | Pending |
| NOTF-02 | Phase 11 | Pending |
| DATA-01 | Phase 12 | Pending |

**Coverage:**
- v1 requirements: 25 total
- Mapped to phases: 25
- Unmapped: 0

---
*Requirements defined: 2026-02-08*
*Last updated: 2026-02-08 after roadmap creation*
