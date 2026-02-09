# Phase 3: Pro Profile Management - Context

**Gathered:** 2026-02-09
**Status:** Ready for planning

<domain>
## Phase Boundary

Pros can build complete profiles with identity, role categorization, service area, and bio through a step-by-step onboarding flow after authentication. Profile is required before accessing the main app. A dedicated Profile tab displays the pro's identity and allows editing. This phase does NOT include video content, feed integration, or connecting with other pros.

</domain>

<decisions>
## Implementation Decisions

### Profile Setup Flow
- Step-by-step onboarding after welcome card (not a single form)
- Required before app access — pro must complete all steps
- No progress indicator (no dots, no "step X of Y") — each screen stands alone for premium/immersive feel
- Back button allowed — pro can return to previous steps to edit before completing
- Fade in/out transitions between steps (consistent with auth screen transitions)
- Step order: Role → Name → Location → Photo → Bio
- Final "Review your profile" summary screen before completing onboarding
- Dark premium styling (#0D0D0D background, gold gradient accents) — same as auth screens
- All profile data saved together at the end (not incrementally)

### Role & Location Inputs
- 5 role categories: Lender, Real Estate Agent, Attorney, Title/Escrow, Home Inspector
- Single role selection only (one primary role per pro)
- Role UI: tappable cards with text only (no icons), gold gradient border on selected card
- Role screen heading: Claude's discretion on copy
- Name: separate First Name and Last Name fields
- Location: zip code entry field
- Houston-only validation — reject zip codes outside Houston metro with clear message ("MVR is launching in Houston first")
- Zip codes will be used for proximity-based matching on the feed (pro networking first, consumer routing later)

### Profile Photo Handling
- Camera roll + take photo options available
- Circle crop UI after selection — pinch/zoom to frame face
- Photo required — no skip option during onboarding
- Large and prominent display on onboarding step (150-200px circle)
- Compress + resize before upload (target ~500x500, JPEG quality 80%)
- Photo uploads at the end with all other profile data (not immediately)
- Photo editable anytime after onboarding (tap to change, same picker + crop flow)
- Placeholder before selection: Claude's discretion (initials circle or generic icon)
- Photo picker UX (bottom sheet vs direct library): Claude's discretion

### Profile Display & Layout
- Dedicated Profile tab in bottom navigation (new tab)
- Tab order: Claude's discretion
- Profile view shows all profile info (photo, name, role, location, bio)
- Profile layout design: Claude's discretion (recommend header card + future video grid area)
- Edit flow: Claude's discretion (recommend edit button → separate edit screen)
- Bio character limit: 300 characters
- Account info (email, verification status) stays in Settings only — not on Profile tab
- Public profile view (other pros viewing) is more content-focused (emphasizes videos/content grid with smaller profile header)
- Owner profile view is info-focused with edit capabilities

### Claude's Discretion
- Role screen heading copy
- Profile photo placeholder design (initials or generic icon)
- Photo picker UX pattern (bottom sheet or direct library)
- Profile tab ordering in bottom navigation
- Profile view layout design
- Edit flow pattern (edit button → edit screen recommended)
- Loading/error states during profile save
- Exact spacing, typography, and card design details

</decisions>

<specifics>
## Specific Ideas

- Zip code is foundational for future proximity matching — "on the feed, we're going to match pros according to who's the closest"
- The platform starts as a pro networking space, transitions to a consumer routing system later — profile data should support both use cases
- Role tappable cards should feel premium — text-only with gold gradient border selection state, consistent with the existing gradient gold button aesthetic
- Profile photo is required because "this is a video platform — real faces build trust"

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 03-pro-profile-management*
*Context gathered: 2026-02-09*
