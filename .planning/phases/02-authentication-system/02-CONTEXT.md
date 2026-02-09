# Phase 2: Authentication System - Context

**Gathered:** 2026-02-08
**Status:** Ready for planning

<domain>
## Phase Boundary

Pro account creation, email verification, and persistent session management. Pros can sign up with email/password or social login (Google, Apple), verify their email optionally, reset forgotten passwords, and maintain sessions that persist across app restarts. Profile details (name, role, bio) are Phase 3.

</domain>

<decisions>
## Implementation Decisions

### Sign-up flow
- Email + password only — no name or profile fields at sign-up (deferred to Phase 3)
- Single screen layout — email, password, and sign-up button all on one screen
- Social login: Google + Apple alongside email/password
- Default landing screen is sign-up (not login) — "Already have an account?" link to login
- Sign-up first makes sense for a new app acquiring founding pros

### Session & logout behavior
- Sessions persist indefinitely — no auto-logout timeout
- Multi-device sessions allowed — no single-device restriction
- Logout accessible from Settings screen only — low prominence
- Logout is immediate — no confirmation dialog

### Verification & recovery
- Email verification is optional with periodic reminder nudges — not required to use the app
- Forgot Password flow included in this phase — standard password reset via email
- Auth errors displayed as toast notifications (not inline below fields)

### Auth screen design
- Dark & premium visual tone — dark background, gold/white accents signaling exclusivity for $100/month founding tier
- Logo + tagline on the auth screen
- Visual password strength meter (color-coded weak/medium/strong)
- Smooth transitions between auth screens — fade in/out with card swipe/movement animations
- After sign-up: single welcome card (logo, welcome message, brief value prop, "Get Started" button)
- Post-welcome destination: into the app (profile setup prompted in Phase 3)

### Claude's Discretion
- Verification method (magic link vs 6-digit code) — pick based on Supabase capabilities and UX
- Social login button placement relative to email fields — pick based on conversion patterns
- Auth screen copy/tagline — write copy fitting dark & premium tone for real estate pros; remember MVR = "Most Valuable Relationships" and it's a routing system
- Exact color values, typography, and spacing within the dark & premium direction
- Welcome card copy and layout

</decisions>

<specifics>
## Specific Ideas

- "MVR = Most Valuable Relationships" — the app is a routing system connecting consumers to the right real estate professional
- Transitions should feel like card swipe/card movement animations, not just standard navigation pushes
- Dark & premium should signal that this is worth $100/month — exclusivity, not just a dark theme
- Sign-up first because most visitors will be new pros joining the waitlist

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-authentication-system*
*Context gathered: 2026-02-08*
