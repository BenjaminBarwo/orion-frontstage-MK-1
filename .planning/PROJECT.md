# MVR (Most Valuable Relationships)

## What This Is

MVR is a real estate professional routing platform that connects consumers with high-performing local pros through a swipeable video feed. Think TikTok meets Tinder for finding your lender, agent, and attorney. The current build is a waitlist MVP targeting real estate professionals — founding pros sign up, post video content, complete a validation survey, and subscribe at $100/month for priority routing when consumers launch.

## Core Value

Route consumers to the right real estate professional instantly — the one who responds fast and people genuinely connect with — through a video-first, swipe-driven experience.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Pro account creation and authentication (Supabase)
- [ ] Video posting — record in-app or upload from camera roll (encourage importing socially-approved content from other platforms)
- [ ] Video feed — pros can browse and see each other's content during waitlist phase
- [ ] In-app survey — strategically placed at peak intent/commitment moment in the flow
- [ ] Stripe subscription — $100/month founding pro tier
- [ ] Pro profile — name, role category (lender, agent, attorney, etc.), location/area served
- [ ] Geo-scoping — content and pros scoped to local area (Houston first)
- [ ] Behavioral data capture — pro posting patterns, engagement, content metadata, onboarding behavior

### Out of Scope

- Consumer-side features — no consumer accounts, matching, or routing until post-waitlist launch
- Web landing page — mobile-only to optimize for commitment and signal "this is real"
- OAuth/social login — email/password sufficient for waitlist
- In-app messaging/chat — no pro-to-consumer interaction yet
- Payment tiers beyond founding pro — single $100/month tier for now
- Non-real-estate verticals — real estate only for v1

## Context

**Market:** Houston real estate community. There is a well-connected contact in the Houston RE space who can drive pro signups and fill the waitlist.

**Waitlist strategy:** The waitlist serves three purposes:
1. Market validation — survey data + paying subscribers prove demand to investors
2. Content seeding — pros post video content before consumers arrive so the feed isn't empty at launch
3. Training data foundation — pro content, posting behavior, and peer engagement create the first layer of labeled data for future LLM training

**Data strategy:** The long-term play is collecting behavioral data at scale to train LLMs on buying intent detection and sales optimization. Consumer-side data (swipes, watch time, messages, conversions) is the primary goldmine. Pro-side waitlist data provides pre-labeled training data — video content styles that later correlate with consumer engagement, pro-to-pro peer quality signals, and posting behavior that predicts reliability.

**Brand philosophy:** Creating a space where Most Valuable Relationships are sustained and created. Modern Angie's List energy — trustworthy, community-driven, but with a fresh, app-native feel.

**Full launch vision (post-waitlist):**
- Consumer feed organized as decks by role category (lender → agent → attorney, etc.)
- Swipe left/right within each deck (Tinder-style) to express interest
- Scroll past entire decks to skip unneeded categories (e.g., skip attorneys)
- Geo-scoped — only local pros, finite content per area
- System routes high-performing pros (high response rates, high engagement/"love") to the top

## Constraints

- **Tech stack**: React Native / Expo (existing codebase), Supabase (auth, database, storage), Stripe (payments)
- **Solo developer**: One person building — decisions should favor simplicity and speed over architectural perfection
- **Mobile only**: No web app or landing page — iOS/Android via Expo
- **Houston first**: Geo-scope to Houston market initially
- **Waitlist before consumers**: Pros must be onboarded and posting content before any consumer features are built

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Mobile-only (no web landing page) | Optimizes for commitment; app download signals real intent; makes the product feel real, not vaporware | — Pending |
| Supabase for backend | Auth, database, storage, and real-time capabilities in one platform; good fit for solo developer velocity | — Pending |
| Stripe for subscriptions | Industry standard for recurring billing; clean API; handles founding pro $100/month tier | — Pending |
| Pro-first launch (waitlist) | Seed content before consumers arrive; validate demand with paying subscribers; collect first layer of training data | — Pending |
| Survey at peak intent moment | Higher quality responses when commitment is already high; better signal for investor validation | — Pending |
| Encourage importing social media videos | Reduces friction for pros; content is already "socially approved"; faster content seeding | — Pending |

---
*Last updated: 2026-02-08 after initialization*
