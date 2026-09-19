# MVR — Most Valuable Relationships

A video-first mobile marketplace that routes consumers to local real estate professionals — lenders, agents, and closing attorneys — through a swipeable, geo-scoped feed. Professionals surface on performance, not on how much they paid.

Built solo: mobile client, backend, payments, and the infrastructure it runs on.

**Status:** waitlist MVP, pre-launch. Development paused. The code, architecture and planning artefacts are public as a record of how it was built.

---

## The problem it was built against

Incumbent real estate portals sell consumer intent to whichever professional pays most for the zip code. The consumer believes they're reaching the agent attached to the listing; they're reaching whoever bought the lead. The professional who did the work is bypassed, and the consumer gets matched on ad spend rather than competence.

MVR inverts the allocation. Professionals are surfaced by response rate, engagement, and peer validation. Payment buys a seat in the market — flat, uniform, capped per area — and cannot influence who gets routed to whom. No fees tied to closings, which keeps the model clear of RESPA Section 8 referral-fee exposure.

---

## Stack

| Layer | Technology |
|---|---|
| Mobile client | React Native via Expo, file-based routing, iOS + Android |
| Language | TypeScript |
| Auth, database, storage | Supabase (PostgreSQL, PLpgSQL functions and migrations) |
| Payments | Stripe subscriptions |
| CI | GitHub Actions |
| Orchestration | Coolify (self-hosted PaaS) |
| Hosting | Hetzner bare metal, Hostinger KVM VPS |

---

## Infrastructure

Everything runs on infrastructure provisioned and administered by hand, not on a managed platform.

- **Hetzner** bare metal for the high-memory backend workload
- **Hostinger KVM VPS** for general application hosting and the deployment stack
- **Coolify** as a self-hosted PaaS sitting on top of those instances, managing containerised services, databases, and background agentic workflows
- Servers provisioned and maintained directly over **SSH**

This was a deliberate choice rather than a constraint. Running the stack without Vercel or AWS meant owning container orchestration, database lifecycle, and deployment plumbing directly — which is the part managed platforms hide.

---

## Repository layout

```
app/                  Expo Router screens — file-based routing
components/           Shared UI components
hooks/                React hooks
lib/                  Clients, helpers, domain logic
constants/            Shared configuration values
scripts/              Tooling and maintenance scripts
assets/images/        Static assets
supabase/             Schema, migrations, PLpgSQL functions
.github/workflows/    CI pipelines
.planning/            Development protocol — see below
```

---

## How it was built: the `.planning` protocol

This repository was developed with AI coding agents as the primary implementation method, which required a system for holding context across sessions. `.planning/` is that system, and it is version-controlled alongside the code.

```
PROJECT.md         What the product is, core value, scope boundaries
REQUIREMENTS.md    Validated / active / out-of-scope requirements
ROADMAP.md         Sequenced delivery plan
STATE.md           Current state of the build, carried between sessions
phases/            Per-phase specifications and outcomes
research/          Investigation notes feeding design decisions
codebase/          Structural notes on the codebase itself
config.json        Workflow configuration
```

The pattern: specify before implementing, keep requirements explicitly scoped in and out, record state so an agent resuming cold can pick up without re-deriving context, and treat handoff between sessions as an artefact rather than something held in the developer's head.

`WHITE_SCREEN_HANDOFF_FOR_PLAN_MODE.md` is an example — a structured handoff written so a debugging session could resume without losing prior findings.

Scope discipline was enforced the same way. Consumer-side matching, web, OAuth, in-app messaging and additional verticals were all written down as explicitly out of scope so they couldn't quietly creep into the MVP.

---

## Running locally

```bash
npm install
npx expo start
```

From there, open in a development build, an Android emulator, an iOS simulator, or Expo Go.

Requires Supabase and Stripe credentials — see `.env.example`.

---

## Notes for reviewers

This is an MVP built by one person, and it reads like one. The planning layer is more disciplined than the implementation layer.

Worth looking at:

- `.planning/` — the development protocol, which is the most transferable thing here
- `supabase/` — schema and PLpgSQL functions
- `lib/` and `hooks/` — application logic and state handling

Built and maintained by [Benjamin Barwo](https://github.com/BenjaminBarwo).
