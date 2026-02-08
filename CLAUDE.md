# MVR (Most Valuable Relationships)

> Video-first real estate professional routing platform. Waitlist MVP where founding pros sign up, post video content, complete a validation survey, and subscribe at $100/month.

## Quick Facts

- **Stack**: React Native, Expo SDK 54, TypeScript, Supabase, Stripe
- **Test Command**: `npx expo test`
- **Lint Command**: `npx expo lint`
- **Build Command**: `npx eas build`
- **Start Command**: `npx expo start`

## Key Directories

- `app/` - Expo Router screens (file-based routing)
- `components/` - Reusable React Native components
- `components/ui/` - Base UI primitives
- `hooks/` - Custom React hooks
- `constants/` - Theme, config, constants
- `assets/` - Images, fonts, static files
- `.planning/` - GSD project planning artifacts

## Code Style

- TypeScript strict mode enabled
- Prefer `interface` over `type` (except unions/intersections)
- No `any` - use `unknown` instead
- Use early returns, avoid nested conditionals
- Prefer composition over inheritance
- Use `kebab-case` for file names (e.g., `themed-text.tsx`)
- Use Expo Router for all navigation (file-based routing in `app/`)

## Git Conventions

- **Commit format**: Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`, etc.)
- **PR titles**: Same as commit format
- **Branch naming**: `feat/description` or `fix/description`

## Critical Rules

### Error Handling
- NEVER swallow errors silently
- Always show user feedback for errors (Toast, Alert, or inline)
- Log errors to Sentry in production
- Handle network failures gracefully (offline-aware)

### UI States
- Always handle: loading, error, empty, success states
- Show loading ONLY when no data exists
- Every list needs an empty state
- Use skeleton loaders over spinners where possible

### Video
- ALWAYS compress videos client-side before upload
- Target 720p, 2-5 Mbps for uploads
- Enforce 50MB max file size
- Use `expo-video` for playback, `expo-camera` for recording

### Mutations
- Disable buttons during async operations
- Show loading indicator on buttons
- Always have onError handler with user feedback

### Payments
- Stripe checkout MUST be web-based (external browser), NOT in-app WebView
- App Store will reject in-app Stripe payment flows

### Data
- Design all database tables with future ML/behavioral tracking in mind
- Use event-based schema patterns (immutable event log)
- Always include: user_id, session_id, timestamp, device context

## Supabase

- Use Row Level Security (RLS) on ALL tables
- Test queries with RLS enabled, never bypass in production
- Use Supabase Edge Functions for server-side logic (webhooks, Stripe)
- Store videos in Supabase Storage with organized bucket paths

## Testing

- Test behavior, not implementation
- Use factory pattern: `getMockX(overrides)` for test data
- Run tests before committing

## Common Commands

```bash
# Development
npx expo start          # Start dev server
npx expo start --ios    # Start on iOS simulator
npx expo start --android # Start on Android emulator
npx expo lint           # Run linter

# Build
npx eas build --platform ios      # iOS build
npx eas build --platform android  # Android build

# Supabase
npx supabase start      # Local Supabase
npx supabase db push    # Push migrations
npx supabase gen types typescript --local > types/supabase.ts  # Generate types

# GSD
# /gsd:progress         # Check project status
# /gsd:plan-phase N     # Plan next phase
# /gsd:execute-phase N  # Execute phase
```
