# MVR Pitfalls Research

**Research Date:** 2026-02-08
**Focus:** Video-first marketplace + Supabase + Stripe + behavioral data collection
**Context:** Solo developer building waitlist MVP for real estate professional marketplace

---

## Executive Summary

This document catalogs critical pitfalls for video-first marketplace applications, with specific emphasis on the MVR tech stack (Expo + Supabase + Stripe) and long-term ML data collection goals. Each pitfall includes warning signs, prevention strategies, and phase mapping.

**Most Critical Risks:**
1. Video storage costs spiraling without transcoding/compression strategy
2. Supabase RLS policies blocking legitimate queries at scale
3. App Store rejection for Stripe subscription implementation
4. Poor video schema design preventing future ML training
5. Solo developer over-engineering during greenfield phase

---

## 1. Video Handling Pitfalls

### 1.1 Storage Cost Explosion

**Description:** Raw video files uploaded directly to Supabase Storage can consume 100-500MB per 1-minute video. At $0.021/GB/month (Supabase pricing), a waitlist with 100 pros posting 3 videos each = ~30GB = $630/month in storage costs alone, before any traffic.

**Warning Signs:**
- Accepting any video format/codec without validation
- No file size limits on upload
- No compression or transcoding pipeline
- Users uploading 4K/1080p raw footage from iPhone
- Storage usage growing faster than user count

**Prevention Strategy:**
- **Client-side:** Set max video duration (30-60 seconds), compress before upload using expo-video compression APIs
- **Server-side:** Reject videos >50MB, enforce max resolution (720p sufficient for mobile feed)
- **Transcoding:** Use Supabase Edge Functions to trigger transcoding via FFmpeg or Cloudflare Stream after upload
- **Alternative:** Use specialized video CDN (Cloudflare Stream, Mux) that handles transcoding/adaptive streaming automatically
- **Quota monitoring:** Set up Supabase storage alerts at 10GB, 25GB, 50GB thresholds

**Phase Mapping:**
- **Phase 1 (MVP):** Client-side compression + file size limits
- **Phase 2 (Post-launch):** Transcoding pipeline + video CDN evaluation
- **Phase 3 (Scale):** Migrate to dedicated video infrastructure if costs exceed $500/month

**Cost Example:**
- Without compression: 100 users × 3 videos × 200MB = 60GB = $1,260/month storage + egress
- With compression: 100 users × 3 videos × 20MB = 6GB = $126/month

---

### 1.2 Mobile Video Performance Degradation

**Description:** Large video files cause stuttering, long load times, and battery drain on mobile devices. Users abandon apps with >2 second video load times.

**Warning Signs:**
- Video feed scroll feels janky or laggy
- Videos take >2 seconds to start playing after swipe
- App crashes when loading multiple videos
- Battery drains rapidly during feed browsing
- High memory usage (>200MB for video player alone)

**Prevention Strategy:**
- **Preloading:** Preload next 2-3 videos in deck while current video plays
- **Lazy loading:** Use expo-video's lazy loading for off-screen videos
- **Adaptive bitrate:** Serve lower quality on slower connections (detect via NetInfo)
- **Video dimensions:** Enforce max 720p resolution (1080p unnecessary for mobile feed)
- **Caching:** Cache played videos locally using expo-file-system
- **Memory management:** Release video players when off-screen (React Native FlatList + removeClippedSubviews)
- **Testing:** Test on low-end Android devices (not just latest iPhone)

**Phase Mapping:**
- **Phase 1 (MVP):** Basic lazy loading + max resolution enforcement
- **Phase 2 (Waitlist):** Preloading + caching strategy
- **Phase 3 (Consumer launch):** Adaptive bitrate + performance monitoring

**Technical Detail:**
```typescript
// BAD: Loading all videos upfront
videos.map(video => <Video source={video.url} />)

// GOOD: FlatList with lazy loading
<FlatList
  data={videos}
  renderItem={({item}) => <VideoPlayer video={item} />}
  removeClippedSubviews={true}
  maxToRenderPerBatch={3}
  windowSize={5}
/>
```

---

### 1.3 iOS/Android Video Format Incompatibility

**Description:** Videos that play on iOS may fail on Android (and vice versa) due to codec/container mismatches. Common issue: HEVC (H.265) works on iOS but not older Android devices.

**Warning Signs:**
- Videos upload successfully but don't play on some devices
- Error logs showing "codec not supported" or "cannot decode video"
- Different behavior between iOS simulator and physical devices
- User complaints about "blank videos" or "loading forever"

**Prevention Strategy:**
- **Standardize codec:** Convert all uploads to H.264 (widely supported) + AAC audio
- **Container format:** Use MP4 (not MOV, AVI, WebM)
- **Validation:** Reject uploads with incompatible codecs at upload time
- **Testing:** Test on physical iOS and Android devices (not just simulators)
- **Fallback:** Provide thumbnail + "video unavailable" message if playback fails

**Phase Mapping:**
- **Phase 1 (MVP):** Enforce MP4 + H.264 at upload (reject others)
- **Phase 2 (Waitlist):** Automated transcoding to ensure compatibility
- **Phase 3 (Scale):** Multi-bitrate encoding with fallback quality levels

---

### 1.4 Video Upload Failure Recovery

**Description:** Large video uploads fail frequently on mobile networks (spotty WiFi, cellular handoffs). Users lose progress and abandon the upload flow.

**Warning Signs:**
- Upload progress bars that reset to 0% unexpectedly
- High drop-off rate between video selection and upload completion
- Users complaining about "upload stuck at 95%"
- No retry mechanism for failed uploads

**Prevention Strategy:**
- **Chunked uploads:** Use Supabase Storage resumable uploads (TUS protocol)
- **Progress persistence:** Save upload state to AsyncStorage
- **Auto-retry:** Automatically retry failed chunks (max 3 attempts)
- **Network awareness:** Pause uploads on weak connections, resume on strong WiFi
- **User feedback:** Clear progress indicator with "Uploading... 2 of 3 videos" messaging
- **Offline queue:** Queue uploads for later if network unavailable

**Phase Mapping:**
- **Phase 1 (MVP):** Basic chunked uploads with progress indicator
- **Phase 2 (Waitlist):** Auto-retry + network-aware pausing
- **Phase 3 (Scale):** Full offline queue with background uploads

---

## 2. Supabase-Specific Pitfalls

### 2.1 Row-Level Security (RLS) Policy Blocking Legitimate Queries

**Description:** Supabase RLS policies that are too restrictive will block legitimate queries, causing "permission denied" errors that are hard to debug. This is the #1 Supabase beginner mistake.

**Warning Signs:**
- Queries work in Supabase Studio but fail in app
- "permission denied for table" errors in logs
- RLS policies with complex joins or subqueries
- Queries returning empty results when data exists
- Different behavior when RLS is enabled vs disabled

**Prevention Strategy:**
- **Start permissive:** Begin with simple policies, add restrictions incrementally
- **Test with RLS enabled:** Always test queries with RLS on (Supabase Studio defaults to RLS off)
- **Use policy helpers:** Use `auth.uid()` and `auth.role()` correctly (common mistake: comparing UUIDs as strings)
- **Avoid complex policies:** Don't use subqueries or joins in RLS policies (slow + brittle)
- **Policy naming:** Name policies descriptively ("pros_can_read_own_videos" not "policy_1")
- **Debug mode:** Add logging to track which policy is blocking queries
- **Performance:** RLS policies add query overhead — keep them simple

**Phase Mapping:**
- **Phase 1 (MVP):** Simple RLS policies (authenticated users can CRUD their own data)
- **Phase 2 (Waitlist):** Add role-based policies (pros vs consumers)
- **Phase 3 (Scale):** Optimize policies for performance (add indexes, denormalize if needed)

**Example Bad Policy:**
```sql
-- BAD: Complex join in RLS policy (slow, brittle)
CREATE POLICY "pros_can_view_videos" ON videos
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'pro'
    AND profiles.location = videos.location
  )
);

-- GOOD: Simple, fast policy
CREATE POLICY "pros_can_view_videos" ON videos
FOR SELECT USING (auth.role() = 'authenticated');
```

---

### 2.2 Supabase Storage 100GB Limit on Pro Plan

**Description:** Supabase Pro plan ($25/month) includes only 100GB storage. After that, it's $0.021/GB/month. Video apps hit this limit fast.

**Warning Signs:**
- Approaching 80GB+ storage usage
- Rapid storage growth (>10GB/month)
- No storage cleanup strategy for deleted accounts
- Uploading raw, uncompressed videos

**Prevention Strategy:**
- **Compression first:** Always compress videos before upload (see 1.1)
- **Storage quotas:** Limit pros to 10 videos max during waitlist phase
- **Cleanup policy:** Delete videos when pros churn/delete accounts
- **Archive old content:** Move inactive videos to cold storage (Cloudflare R2, AWS S3 Glacier)
- **CDN migration:** Plan to migrate to dedicated video CDN if storage >50GB
- **Monitor growth:** Set up alerts at 50GB, 75GB, 90GB thresholds

**Phase Mapping:**
- **Phase 1 (MVP):** Compression + 10 video limit per pro
- **Phase 2 (Waitlist):** Storage monitoring + cleanup policy
- **Phase 3 (Scale):** Migrate to video CDN if storage costs >$200/month

**Cost Projection:**
- 500 pros × 5 videos × 20MB (compressed) = 50GB = $525/year
- 500 pros × 5 videos × 200MB (uncompressed) = 500GB = $10,500/year

---

### 2.3 Supabase Real-Time Scaling Issues

**Description:** Supabase real-time (Postgres LISTEN/NOTIFY) has channel limits: 100 concurrent connections on Free, 500 on Pro. For live feed updates, this scales poorly.

**Warning Signs:**
- "Too many connections" errors in Supabase logs
- Real-time updates stop working as user count grows
- WebSocket connections staying open unnecessarily
- Polling fallback never implemented
- Connection leaks (not closing channels on unmount)

**Prevention Strategy:**
- **Avoid real-time for waitlist:** Don't use real-time subscriptions during waitlist phase (unnecessary)
- **Polling for updates:** Use standard queries with pull-to-refresh instead
- **Real-time sparingly:** Only subscribe to critical updates (new matches, messages — not feed refresh)
- **Connection pooling:** Close real-time channels when component unmounts
- **Alternative:** Use Supabase Edge Functions + webhooks for async updates
- **Scaling plan:** Plan to migrate to dedicated WebSocket service if >500 concurrent users

**Phase Mapping:**
- **Phase 1 (MVP):** No real-time subscriptions (pull-to-refresh only)
- **Phase 2 (Waitlist):** Add real-time only for critical updates (if needed)
- **Phase 3 (Consumer launch):** Evaluate dedicated real-time infrastructure

---

### 2.4 Supabase Postgres Connection Pool Exhaustion

**Description:** Supabase Pro plan has 60 direct Postgres connections (90 with connection pooler). Mobile apps that don't close connections properly can exhaust the pool.

**Warning Signs:**
- "remaining connection slots reserved" errors
- Queries timing out or failing intermittently
- Connection count growing over time (not resetting)
- Long-lived connections from mobile clients

**Prevention Strategy:**
- **Use Supabase client:** Always use official Supabase JS client (handles pooling)
- **Avoid direct Postgres:** Don't connect directly to Postgres from mobile app
- **Connection cleanup:** Ensure Supabase client is properly initialized/disposed
- **Edge Functions for heavy queries:** Move complex queries to Edge Functions (server-side pooling)
- **Monitor connections:** Track connection count in Supabase dashboard

**Phase Mapping:**
- **Phase 1-3:** Use Supabase JS client exclusively (no direct Postgres access from mobile)

---

### 2.5 Supabase Cold Start Latency (Free Tier)

**Description:** Supabase Free tier databases pause after 1 hour of inactivity. First query after pause takes 10-30 seconds (cold start).

**Warning Signs:**
- First app load after inactivity is extremely slow
- Users complaining about "app not loading" in the morning
- Queries timing out on first request
- Using Supabase Free tier for production waitlist

**Prevention Strategy:**
- **Upgrade to Pro:** Supabase Pro plan ($25/month) = no cold starts
- **Cron keepalive:** If using Free tier, set up cron job to ping database every 30 minutes
- **Loading state:** Show clear loading indicator for cold start delays
- **Alternative:** Use Supabase Pro from day 1 (cost is trivial vs user experience)

**Phase Mapping:**
- **Phase 1 (MVP):** Use Supabase Pro from day 1 ($25/month is negligible)
- **Not recommended:** Don't use Free tier for any user-facing app

---

## 3. Stripe Subscription Pitfalls (Mobile)

### 3.1 App Store Rejection for Stripe Direct Payments

**Description:** Apple requires in-app purchases (IAP) for digital goods/services consumed within the app. Using Stripe directly in the app violates App Store guidelines and leads to rejection.

**Warning Signs:**
- Payment flow entirely within mobile app
- No web-based checkout fallback
- "Subscribe" button leads to Stripe Checkout in WebView
- App provides access to features after Stripe payment (no IAP)

**Prevention Strategy:**
- **Web-based checkout:** Redirect to Safari/external browser for Stripe Checkout (use expo-web-browser)
- **Don't use WebView:** In-app browser = still violation
- **Alternative flows:**
  - Option 1: Web checkout → redirect back to app after payment
  - Option 2: Use Apple IAP for iOS, Stripe for Android/web
  - Option 3: "Subscribe on web" button that opens browser
- **Submit carefully:** Be explicit in App Store review notes about payment flow
- **Read guidelines:** Apple App Store Review Guidelines 3.1.1 (In-App Purchase)

**Phase Mapping:**
- **Phase 1 (MVP):** Web-based Stripe Checkout (expo-web-browser) from day 1
- **Phase 2 (Waitlist):** Ensure flow works smoothly (deep link back to app after payment)
- **Phase 3 (Scale):** Consider dual implementation (IAP for iOS, Stripe for Android) if App Store pushback

**Technical Detail:**
```typescript
// BAD: Stripe Checkout in WebView (App Store violation)
<WebView source={{ uri: stripeCheckoutUrl }} />

// GOOD: Open in external browser
import * as WebBrowser from 'expo-web-browser';
await WebBrowser.openBrowserAsync(stripeCheckoutUrl);
```

---

### 3.2 Stripe Subscription Webhook Reliability

**Description:** Stripe webhooks are critical for subscription state changes (payment succeeded, failed, canceled). If webhooks fail or are missed, subscription state gets out of sync.

**Warning Signs:**
- Users paying but not getting access (webhook not received)
- Subscriptions showing "active" in Stripe but "inactive" in database
- No webhook retry logic
- Webhook endpoint returning errors (4xx/5xx)
- Webhook secret not validated (security risk)

**Prevention Strategy:**
- **Use Supabase Edge Functions:** Host webhook endpoint in Supabase Edge Function (always available)
- **Validate webhook signature:** Always verify `stripe-signature` header (prevents fake webhooks)
- **Idempotency:** Handle duplicate webhooks gracefully (Stripe retries failed webhooks)
- **Fast response:** Respond with 200 immediately, process async (Stripe expects <5 second response)
- **Retry logic:** Manually retry failed webhooks (Stripe retries for 3 days but not guaranteed)
- **Monitoring:** Set up alerts for webhook failures (Stripe dashboard + your logs)
- **Test webhooks:** Use Stripe CLI to test webhook locally before production

**Phase Mapping:**
- **Phase 1 (MVP):** Basic webhook handler (validate signature, update database)
- **Phase 2 (Waitlist):** Add idempotency + monitoring
- **Phase 3 (Scale):** Async processing + retry queue for failed webhooks

**Critical Events to Handle:**
- `customer.subscription.created` → Grant access
- `customer.subscription.updated` → Update subscription details
- `customer.subscription.deleted` → Revoke access
- `invoice.payment_failed` → Notify user, grace period
- `invoice.payment_succeeded` → Confirm payment

---

### 3.3 Stripe Test Mode vs Production Mode Confusion

**Description:** Developers accidentally use Stripe test keys in production or mix test/production data, causing payment failures and data corruption.

**Warning Signs:**
- Real users seeing "Test Mode" in payment UI
- Payments not actually processing (test mode active)
- Test subscriptions mixed with real subscriptions in database
- API keys hardcoded in app code (not environment variables)

**Prevention Strategy:**
- **Environment variables:** Store Stripe keys in `.env.local` (never hardcode)
- **Key naming:** Prefix keys clearly (`STRIPE_PUBLISHABLE_KEY_TEST`, `STRIPE_PUBLISHABLE_KEY_LIVE`)
- **Visual indicator:** Show "TEST MODE" banner when using test keys
- **Separate databases:** Use different Supabase projects for test/production
- **Pre-launch checklist:** Verify production keys are active before launch
- **Key rotation:** Rotate keys periodically (every 90 days)

**Phase Mapping:**
- **Phase 1-3:** Always use environment variables, never hardcode keys

---

### 3.4 Subscription State Sync Failures

**Description:** User subscription state in your database drifts from Stripe state (user cancels in Stripe, but database still shows "active").

**Warning Signs:**
- Users complaining they canceled but are still charged
- Users reporting "can't access" but Stripe shows active subscription
- Manual database updates required to fix sync issues
- No periodic reconciliation between Stripe and database

**Prevention Strategy:**
- **Webhooks as source of truth:** Always update database based on Stripe webhooks (not manual changes)
- **Periodic sync:** Run daily cron job to reconcile Stripe subscriptions with database
- **Grace period:** Don't immediately revoke access on payment failure (give 3-7 days)
- **User-facing status:** Show subscription status from Stripe API (not just database)
- **Admin tools:** Build admin panel to manually trigger sync for debugging

**Phase Mapping:**
- **Phase 1 (MVP):** Webhook-based updates only
- **Phase 2 (Waitlist):** Add daily reconciliation cron job
- **Phase 3 (Scale):** Real-time sync checks on critical actions (posting video, etc.)

---

### 3.5 Stripe Subscription Metadata Loss

**Description:** Not storing enough metadata in Stripe subscriptions makes debugging and analytics impossible. You can't answer "which pro is this payment for?" without metadata.

**Warning Signs:**
- Stripe dashboard shows subscriptions with no user info
- Can't identify which user a webhook event belongs to
- No way to filter subscriptions by pro role or location
- Metadata not passed to Stripe on subscription creation

**Prevention Strategy:**
- **Store metadata on creation:** Pass user ID, email, role, location to Stripe metadata
- **Consistent keys:** Use standard metadata keys (`user_id`, `email`, `role`, `location`)
- **Update metadata:** Update Stripe metadata when user profile changes
- **Search by metadata:** Use Stripe dashboard filters to find subscriptions
- **Analytics:** Pull metadata for subscription analytics (revenue by location, role, etc.)

**Phase Mapping:**
- **Phase 1 (MVP):** Store minimal metadata (user_id, email)
- **Phase 2 (Waitlist):** Add role, location, signup_date
- **Phase 3 (Scale):** Add custom metadata for ML training (engagement_score, video_count, etc.)

**Example:**
```typescript
const subscription = await stripe.subscriptions.create({
  customer: customerId,
  items: [{ price: priceId }],
  metadata: {
    user_id: user.id,
    email: user.email,
    role: user.role,
    location: user.location,
    signup_date: new Date().toISOString(),
  },
});
```

---

## 4. Waitlist/Early-Access Launch Pitfalls

### 4.1 No Clear Activation Criteria

**Description:** Launching a waitlist without clear criteria for "when do we activate users?" leads to confusion and missed opportunities. Users sign up, forget about the app, and never return.

**Warning Signs:**
- Waitlist users sitting indefinitely with no communication
- No plan for "how many users before we activate?"
- No activation email sequence prepared
- Users asking "when can I use this?" with no answer

**Prevention Strategy:**
- **Define activation goal:** Set clear target (e.g., "100 pros + 50 videos posted")
- **Milestone communication:** Email users at milestones ("50 pros joined, launch in 2 weeks")
- **Activation sequence:** Prepare 3-email sequence (invitation, onboarding, first action prompt)
- **Urgency:** Add incentive for early action ("Founding pro rate expires in 30 days")
- **Rollout plan:** Staggered activation (10% → 50% → 100%) to catch bugs early

**Phase Mapping:**
- **Phase 1 (MVP):** Define activation criteria before launch
- **Phase 2 (Waitlist):** Track progress toward goal, communicate milestones
- **Phase 3 (Activation):** Execute rollout plan

---

### 4.2 Survey Timing and Placement

**Description:** Placing the survey too early (before commitment) or too late (after payment) results in low-quality responses or poor completion rates.

**Warning Signs:**
- Survey completion rate <50%
- Survey responses are generic or low-effort
- Users abandon flow at survey step
- Survey comes before user is invested in product

**Prevention Strategy:**
- **Survey at peak intent:** Place survey AFTER video upload but BEFORE payment (user is invested but hasn't paid yet)
- **Keep it short:** 5-7 questions max (anything more = drop-off)
- **Progress indicator:** Show "2 of 5" progress to reduce abandonment
- **Optional fields:** Make most questions optional (required = barrier)
- **Skip option:** Allow "Skip for now" with reminder to complete later
- **Incentive:** "Complete survey to unlock founding pro rate"

**Phase Mapping:**
- **Phase 1 (MVP):** Survey after video upload, before payment
- **Phase 2 (Waitlist):** A/B test survey placement (after upload vs after profile completion)
- **Phase 3 (Optimization):** Analyze completion rates, optimize question wording

---

### 4.3 No Early Churn Detection

**Description:** Early users churn silently — they sign up, never post videos, or post once and disappear. Without churn detection, you can't intervene.

**Warning Signs:**
- Users sign up but never upload videos
- Users upload 1 video then go inactive
- No re-engagement strategy for inactive users
- No definition of "active" vs "churned" user

**Prevention Strategy:**
- **Define activation:** "Active pro" = uploaded 2+ videos + logged in within 7 days
- **Track engagement:** Monitor days since last login, videos posted, feed browsing
- **Re-engagement triggers:** Email/push notification if user inactive for 3 days
- **Exit survey:** If user deletes account, ask why (1-question survey)
- **Grace period:** Don't immediately cancel subscription on first payment failure (email first)

**Phase Mapping:**
- **Phase 1 (MVP):** Track basic engagement (login, video uploads)
- **Phase 2 (Waitlist):** Add re-engagement emails for inactive users
- **Phase 3 (Scale):** Automated churn prediction (ML model) + proactive outreach

---

### 4.4 Overpromising in Waitlist Messaging

**Description:** Waitlist messaging that overpromises features or timeline leads to disappointed users and early churn when reality doesn't match expectations.

**Warning Signs:**
- Messaging says "launching next month" with no development plan
- Promising features that aren't in roadmap ("AI-powered matching coming soon")
- Users asking "where is [feature]?" that was never planned
- Vague language ("revolutionary," "game-changing") without substance

**Prevention Strategy:**
- **Be specific:** "Join 100 founding pros" not "Join the revolution"
- **Underpromise:** Launch date ranges ("launching Q2 2026") not exact dates
- **Feature clarity:** Only mention features in current scope (no speculative features)
- **Beta language:** Frame as "early access beta" to set expectations
- **Transparency:** Share progress updates ("25 pros joined, 60 videos posted")

**Phase Mapping:**
- **Phase 1-3:** Review all messaging before launch, remove overpromises

---

### 4.5 No Founder-to-User Communication Channel

**Description:** During waitlist phase, there's no direct way for founder to communicate with early users (no email list, no push notifications, no in-app messaging). Users forget about the app.

**Warning Signs:**
- No way to announce new features or updates
- No email collection during signup
- Push notifications not implemented
- Users saying "I forgot about this app"

**Prevention Strategy:**
- **Email collection:** Collect email at signup (required field)
- **Push notifications:** Implement push notifications on day 1 (expo-notifications)
- **In-app announcements:** Banner for new features or updates
- **Email sequence:** 3-email sequence (welcome, milestone update, activation)
- **Response channels:** Monitor app store reviews and respond

**Phase Mapping:**
- **Phase 1 (MVP):** Email collection + basic push notifications
- **Phase 2 (Waitlist):** Email sequence + in-app announcements
- **Phase 3 (Scale):** Segmented communication (by role, location, engagement level)

---

## 5. Behavioral Data Collection Pitfalls

### 5.1 Schema Design That Blocks ML Training

**Description:** Database schema that doesn't capture the right behavioral signals or makes data extraction for ML training difficult/impossible. This is critical since ML training is your long-term moat.

**Warning Signs:**
- No timestamps on events (can't analyze time-series patterns)
- No user context stored with events (can't segment by pro type)
- Events stored as unstructured JSON (hard to query)
- No video metadata (duration, resolution, upload source)
- No engagement metrics (video views, swipes, watch time)
- No A/B test tracking (can't attribute behavior to experiments)

**Prevention Strategy:**
- **Event-based schema:** Store discrete events (video_viewed, swipe_right, profile_clicked) not aggregates
- **Rich context:** Every event includes user_id, timestamp, session_id, device_type, location
- **Video metadata:** Store duration, resolution, file_size, upload_source (camera vs library), thumbnail_url
- **Engagement metrics:** Track video_views, avg_watch_time, completion_rate, swipe_direction
- **Normalization:** Separate tables for events, users, videos (not everything in one table)
- **Indexing:** Index on user_id, timestamp, event_type for fast queries
- **Schema versioning:** Version your schema so future changes don't break past data

**Phase Mapping:**
- **Phase 1 (MVP):** Basic event schema (video_uploaded, user_signup, subscription_created)
- **Phase 2 (Waitlist):** Add engagement events (video_viewed, profile_clicked, feed_scrolled)
- **Phase 3 (Consumer launch):** Full behavioral tracking (swipe_right, message_sent, response_time, conversion_event)

**Critical Events to Track (Waitlist Phase):**
- `user_signup` → email, role, location, signup_source, device_type
- `video_uploaded` → video_id, duration, file_size, upload_source, thumbnail_generated
- `video_viewed` → video_id, viewer_id, watch_duration, completion_rate
- `subscription_created` → user_id, plan, amount, payment_method
- `profile_updated` → user_id, fields_changed, timestamp

**Critical Events to Track (Consumer Phase):**
- `swipe_right` → consumer_id, pro_id, video_id, deck_position, timestamp
- `swipe_left` → same as above
- `message_sent` → consumer_id, pro_id, response_time, message_length
- `profile_clicked` → consumer_id, pro_id, time_on_profile
- `conversion` → consumer_id, pro_id, conversion_type (call, meeting, hire)

---

### 5.2 No Data Retention Policy

**Description:** Storing all events forever leads to massive database bloat, slow queries, and GDPR/privacy compliance issues. You need a retention policy from day 1.

**Warning Signs:**
- Database size growing linearly with time (no pruning)
- Queries slowing down as data accumulates
- No plan for GDPR "right to be forgotten" requests
- Storing sensitive data (PII) indefinitely

**Prevention Strategy:**
- **Define retention:** Event data kept for 2 years, aggregates forever
- **Archive old data:** Move events >1 year to cold storage (S3 Glacier, Cloudflare R2)
- **Aggregate over time:** Roll up hourly events into daily/monthly summaries
- **Delete on request:** Automate user data deletion for GDPR compliance
- **Separate PII:** Store PII separately from behavioral data (easier to delete)
- **Anonymize old data:** After 1 year, anonymize user_id in events (keep behavioral patterns, drop identity)

**Phase Mapping:**
- **Phase 1 (MVP):** Define retention policy (document in privacy policy)
- **Phase 2 (Waitlist):** Implement data deletion on user request
- **Phase 3 (Scale):** Automated archival + aggregation (cron job runs monthly)

---

### 5.3 Missing Event Context for ML Labels

**Description:** Events are captured but lack the context needed to label data for ML training. Example: you know a user swiped right, but you don't know what made that pro appealing (video content, profile, location, timing?).

**Warning Signs:**
- Events have minimal fields (just user_id + timestamp)
- No session tracking (can't reconstruct user journey)
- No A/B test variant tracking (can't attribute behavior)
- No video content features (length, topic, quality) stored with events
- No negative signals captured (skipped videos, abandoned flows)

**Prevention Strategy:**
- **Session tracking:** Generate session_id on app open, include in all events
- **Video features:** Store video metadata (duration, thumbnail quality score, audio/video ratio)
- **Profile features:** Store pro features (role, location, years_experience, rating)
- **Contextual signals:** Time of day, day of week, device type, network quality
- **Negative signals:** Track skips, swipe-lefts, abandoned sessions (not just positive actions)
- **A/B tests:** Track experiment variant in every event

**Phase Mapping:**
- **Phase 1 (MVP):** Basic context (user_id, timestamp, session_id)
- **Phase 2 (Waitlist):** Add video/profile features
- **Phase 3 (Consumer launch):** Full context for ML training (all features + negative signals)

**Example Event Schema:**
```json
{
  "event_type": "swipe_right",
  "user_id": "uuid",
  "session_id": "uuid",
  "timestamp": "2026-02-08T12:34:56Z",
  "video_id": "uuid",
  "pro_id": "uuid",
  "video_features": {
    "duration_seconds": 30,
    "resolution": "720p",
    "has_audio": true,
    "thumbnail_quality_score": 0.85
  },
  "pro_features": {
    "role": "lender",
    "location": "Houston",
    "years_experience": 5,
    "video_count": 3
  },
  "context": {
    "deck_position": 2,
    "time_of_day": "evening",
    "day_of_week": "Friday",
    "device_type": "iOS",
    "network_quality": "wifi"
  }
}
```

---

### 5.4 Privacy and Consent Pitfalls

**Description:** Collecting behavioral data without proper consent or privacy policies leads to legal risk, App Store rejection, and user distrust.

**Warning Signs:**
- No privacy policy or terms of service
- No consent flow during onboarding
- Collecting data not disclosed in privacy policy
- No opt-out mechanism for data collection
- Sharing data with third parties without disclosure

**Prevention Strategy:**
- **Privacy policy first:** Write privacy policy BEFORE collecting any data
- **Consent on signup:** Require users to accept terms + privacy policy
- **Granular consent:** Allow opt-out of non-essential data collection (analytics, ML training)
- **Transparency:** Explain why you're collecting data ("to improve matching accuracy")
- **Data minimization:** Only collect data you'll actually use
- **Security:** Encrypt sensitive data at rest and in transit
- **Third-party disclosure:** If sharing with ML partners, disclose in privacy policy

**Phase Mapping:**
- **Phase 1 (MVP):** Privacy policy + consent flow before launch
- **Phase 2 (Waitlist):** Review data collection practices, ensure compliance
- **Phase 3 (Scale):** Implement opt-out mechanisms, periodic privacy audits

**Apple App Store Requirements:**
- App Privacy section in App Store Connect (declare all data collected)
- Consent before tracking (iOS 14+ requires explicit permission for tracking)
- Privacy Manifest (iOS 17+) for third-party SDKs

---

### 5.5 Data Quality Issues (Garbage In, Garbage Out)

**Description:** ML models trained on low-quality data produce low-quality predictions. Bad data includes: bots, test accounts, duplicate events, missing fields, incorrect timestamps.

**Warning Signs:**
- Events with null/missing required fields
- Duplicate events (same event inserted multiple times)
- Bot traffic inflating metrics
- Test accounts mixed with real users
- Timestamps in wrong timezone or format
- Events from deleted users still in database

**Prevention Strategy:**
- **Schema validation:** Enforce required fields at database level (NOT NULL constraints)
- **Deduplication:** Use idempotency keys (event_id) to prevent duplicate inserts
- **Bot detection:** Filter out bot traffic (user-agent, rate limiting)
- **Separate test data:** Use separate Supabase project for testing (never mix test + prod data)
- **Timestamp standards:** Use ISO 8601 format (UTC) for all timestamps
- **Data cleanup:** Run periodic cleanup jobs to remove orphaned data
- **Monitoring:** Alert on anomalies (spike in events, unusual patterns)

**Phase Mapping:**
- **Phase 1 (MVP):** Basic validation (required fields, timestamp format)
- **Phase 2 (Waitlist):** Deduplication + bot filtering
- **Phase 3 (Scale):** Automated data quality monitoring + cleanup

---

## 6. Solo Developer Traps

### 6.1 Over-Engineering Early Features

**Description:** Solo developers, especially those with strong engineering backgrounds, tend to over-engineer early features (perfect abstractions, premature optimization, complex architectures) instead of shipping fast.

**Warning Signs:**
- Spending days on "the perfect component architecture"
- Building reusable abstractions before second use case exists
- Implementing caching/optimization before performance issues exist
- Writing comprehensive tests before product-market fit
- Researching "best practices" for days instead of coding
- Building features not in MVP scope "because I'll need it later"

**Prevention Strategy:**
- **Ship ugly MVPs:** First version should be embarrassingly simple
- **Optimize after pain:** Don't optimize until you feel the pain
- **Copy-paste is OK:** Duplicate code is fine until you have 3+ instances
- **Defer technical debt:** Track debt in comments (// TODO: refactor this) but don't fix until it blocks you
- **Time-box research:** Max 1 hour research, then code with what you know
- **Feature freeze:** Strictly enforce MVP scope (write "out of scope" list)

**Phase Mapping:**
- **Phase 1 (MVP):** Ship fast, ugly code is fine
- **Phase 2 (Waitlist):** Refactor only what's actually painful
- **Phase 3 (Scale):** Now is the time to refactor and optimize

**Example:**
```typescript
// BAD: Over-engineered video player abstraction (too early)
interface VideoPlayerStrategy {
  play(): void;
  pause(): void;
  seek(time: number): void;
}
class ExpoVideoPlayer implements VideoPlayerStrategy { /* ... */ }
class CustomVideoPlayer implements VideoPlayerStrategy { /* ... */ }
const videoPlayerFactory = new VideoPlayerFactory();

// GOOD: Just use expo-video directly (can refactor later if needed)
<Video source={videoUrl} shouldPlay />
```

---

### 6.2 Premature Optimization

**Description:** Optimizing for scale before you have users is a waste of time. Solo developers should optimize for development speed, not runtime performance (until performance becomes an issue).

**Warning Signs:**
- Implementing complex caching before latency issues exist
- Worrying about database indexes before slow queries exist
- Building microservices architecture for 10 users
- Optimizing bundle size before it's >10MB
- Setting up Kubernetes/Docker for app with 0 users

**Prevention Strategy:**
- **Measure first:** Use profiler to find actual bottlenecks (don't guess)
- **Optimize top 1%:** 80/20 rule — optimize the slowest 1% of code, ignore the rest
- **Ship first, optimize later:** Get to 100 paying users before worrying about scale
- **Use managed services:** Supabase, Expo, Stripe = less to optimize
- **Trust the platform:** Expo, Supabase, React Native are already optimized

**Phase Mapping:**
- **Phase 1 (MVP):** No optimization, just ship
- **Phase 2 (Waitlist):** Optimize only what users complain about
- **Phase 3 (Scale):** Now is the time for performance optimization

---

### 6.3 Not Using Boilerplate/Templates

**Description:** Solo developers building everything from scratch instead of using starter templates or boilerplate code. This wastes weeks on auth, navigation, styling.

**Warning Signs:**
- Building auth flow from scratch (instead of using Supabase auth)
- Creating custom navigation (instead of Expo Router)
- Writing CSS-in-JS utilities (instead of using NativeWind/Tailwind)
- Building form validation (instead of React Hook Form)

**Prevention Strategy:**
- **Use Expo templates:** Start with `npx create-expo-app` (not blank project)
- **Use Supabase auth:** Don't build custom auth (use Supabase auth helpers)
- **Copy UI components:** Use Shadcn, NativeBase, or copy from working apps
- **Steal liberally:** Copy code from docs, Stack Overflow, GitHub (attribute if necessary)

**Phase Mapping:**
- **Phase 1-3:** Always prefer existing solutions over custom code

---

### 6.4 No Deployment/Release Strategy

**Description:** Solo developers often build locally, then panic when it's time to deploy. No deployment plan, no testing strategy, no rollback plan.

**Warning Signs:**
- Never deployed to TestFlight/Google Play Beta
- No staging environment (testing in production)
- No version numbering strategy
- No rollback plan if release breaks
- No gradual rollout (100% of users get new version immediately)

**Prevention Strategy:**
- **Deploy early:** Deploy to TestFlight/Google Play Beta in Phase 1
- **Staging environment:** Use separate Supabase project for staging
- **Version numbering:** Semantic versioning (1.0.0 → 1.1.0 → 2.0.0)
- **Gradual rollout:** Release to 10% → 50% → 100% (catch bugs early)
- **Rollback ready:** Keep previous version available (OTA updates via Expo)
- **Release checklist:** Document deployment steps (prevents mistakes)

**Phase Mapping:**
- **Phase 1 (MVP):** Deploy to TestFlight/Beta before any users sign up
- **Phase 2 (Waitlist):** Gradual rollout + monitoring
- **Phase 3 (Scale):** Automated CI/CD + rollback automation

---

### 6.5 Working in Isolation (No Feedback Loop)

**Description:** Solo developers building in a vacuum without user feedback, leading to features nobody wants or UX nobody understands.

**Warning Signs:**
- No user testing before launch
- No feedback mechanism in app
- Building features based on assumptions (not user requests)
- No analytics to see what users actually do
- Surprised by user behavior after launch

**Prevention Strategy:**
- **Early user testing:** Show app to 5 people before launch (not family/friends — target users)
- **Feedback button:** In-app "Send Feedback" button (Supabase Edge Function → email)
- **Analytics from day 1:** Track basic events (signups, video uploads, subscription created)
- **Weekly user interviews:** Talk to 1-2 users per week during waitlist phase
- **Join communities:** Engage in real estate forums, Houston RE groups
- **Watch users:** Screen-share sessions where you watch users use the app (don't guide them)

**Phase Mapping:**
- **Phase 1 (MVP):** User test with 5 people before launch
- **Phase 2 (Waitlist):** Weekly user interviews + analytics review
- **Phase 3 (Scale):** Automated feedback loops + cohort analysis

---

## 7. Cross-Cutting Concerns

### 7.1 No Error Monitoring from Day 1

**Description:** Shipping without error monitoring means you don't know when the app crashes or fails. Users churn silently.

**Warning Signs:**
- No crash reporting (Sentry, BugSnag, etc.)
- JavaScript errors failing silently
- Users reporting bugs you can't reproduce
- No way to see error rates over time

**Prevention Strategy:**
- **Sentry from day 1:** Install Sentry (free tier sufficient for MVP)
- **Error boundaries:** Wrap components in error boundaries (catch React errors)
- **Global error handler:** Catch unhandled promise rejections
- **User-facing errors:** Show user-friendly error messages (not raw error text)
- **Context logging:** Include user_id, session_id in error reports

**Phase Mapping:**
- **Phase 1 (MVP):** Install Sentry before first deployment
- **Phase 2-3:** Monitor error rates, fix high-frequency errors

---

### 7.2 No Analytics from Day 1

**Description:** Shipping without analytics means you can't answer basic questions like "how many users signed up today?" or "how many videos were uploaded?"

**Warning Signs:**
- Manually querying database to count users
- No visibility into user behavior
- Can't answer investor questions with data
- No funnels or conversion tracking

**Prevention Strategy:**
- **PostHog or Mixpanel:** Install analytics from day 1 (PostHog has generous free tier)
- **Track key events:** signup, video_upload, subscription_created, video_viewed
- **Funnels:** Track signup → video upload → subscription conversion
- **Dashboards:** Build basic dashboard for key metrics
- **Avoid over-tracking:** Only track events you'll actually review weekly

**Phase Mapping:**
- **Phase 1 (MVP):** Install PostHog, track 5-10 key events
- **Phase 2 (Waitlist):** Build dashboards, review metrics weekly
- **Phase 3 (Scale):** Cohort analysis, funnel optimization

---

### 7.3 No Backup Strategy

**Description:** Relying on Supabase backups without testing restore, or having no backup strategy for critical data (videos, user profiles).

**Warning Signs:**
- Never tested restoring from backup
- No backup of Supabase Storage (videos)
- Assuming Supabase auto-backup is sufficient
- No documentation for backup/restore process

**Prevention Strategy:**
- **Verify Supabase backups:** Supabase Pro has daily backups (but test restoring)
- **Backup Storage:** Supabase Storage is NOT backed up by default (use S3 sync or Cloudflare R2 mirror)
- **Export critical data:** Weekly export of users, profiles, subscriptions to S3
- **Disaster recovery plan:** Document how to recover if Supabase fails
- **Test restores:** Quarterly test of backup restore process

**Phase Mapping:**
- **Phase 1 (MVP):** Verify Supabase backups are enabled
- **Phase 2 (Waitlist):** Add Storage backup (S3 sync)
- **Phase 3 (Scale):** Automated backups + disaster recovery testing

---

### 7.4 Ignoring App Store Review Guidelines

**Description:** Building features that violate App Store or Google Play policies, leading to rejection and wasted time.

**Warning Signs:**
- Stripe payments entirely in-app (see 3.1)
- Collecting data without privacy policy
- Using push notifications without user permission
- External links without proper disclosure
- Adult content or misleading screenshots

**Prevention Strategy:**
- **Read guidelines:** Apple App Store Review Guidelines + Google Play Developer Policy
- **Key sections for MVR:**
  - 3.1.1 In-App Purchase (Stripe payments)
  - 2.1 App Completeness (no placeholder content)
  - 5.1.1 Privacy Policy (required before collecting data)
  - 3.2.1 Subscriptions (auto-renewal disclosure)
- **Review before launch:** Self-review app against guidelines checklist
- **App Store Connect:** Fill out App Privacy section accurately
- **Screenshots:** Show actual app content (no mockups)

**Phase Mapping:**
- **Phase 1 (MVP):** Review guidelines before building payment flow
- **Phase 2 (Waitlist):** Self-review before submitting to App Store
- **Phase 3 (Scale):** Periodic reviews as features are added

---

## Priority Matrix: Which Pitfalls to Address When

### Phase 1 (MVP Build — Week 1-4)
**Critical (must address before launch):**
- 1.1 Video compression/file size limits
- 2.1 RLS policies (start simple)
- 2.5 Supabase Pro plan (no cold starts)
- 3.1 Stripe payment flow (web-based, not in-app)
- 3.3 Environment variables for Stripe keys
- 5.4 Privacy policy + consent flow
- 6.4 Deploy to TestFlight early
- 7.1 Error monitoring (Sentry)
- 7.2 Analytics (PostHog)

**Important (should address but not blocking):**
- 1.2 Basic video lazy loading
- 4.1 Define activation criteria
- 4.5 Email collection + push notifications
- 5.1 Basic event schema design

**Defer to Phase 2:**
- 1.4 Advanced upload recovery
- 2.2 Storage monitoring
- 3.2 Webhook idempotency
- 5.2 Data retention policy

---

### Phase 2 (Waitlist Operation — Month 1-3)
**Critical:**
- 2.2 Monitor Supabase storage usage
- 3.2 Webhook reliability + monitoring
- 4.2 Survey placement optimization
- 4.3 Churn detection + re-engagement
- 5.1 Expand event schema (engagement events)
- 5.5 Data quality monitoring

**Important:**
- 1.2 Video preloading + caching
- 1.4 Upload retry logic
- 3.4 Subscription state reconciliation
- 4.5 Email sequence + in-app announcements
- 6.5 Weekly user interviews

**Defer to Phase 3:**
- 1.1 Video CDN migration (unless costs high)
- 2.3 Real-time subscriptions (not needed yet)
- 5.2 Data archival automation

---

### Phase 3 (Consumer Launch — Month 4+)
**Critical:**
- 1.1 Video CDN migration (if storage >50GB)
- 1.2 Full performance optimization (preloading, adaptive bitrate)
- 2.3 Real-time infrastructure evaluation
- 5.1 Full behavioral event schema (swipes, conversions)
- 5.3 ML-ready event context
- 7.3 Disaster recovery testing

**Important:**
- 2.4 Connection pool monitoring
- 3.5 Stripe metadata expansion
- 5.2 Data retention automation
- 6.1 Technical debt refactoring
- 6.2 Performance optimization (now that you have scale)

---

## Cost Projections (Avoiding Financial Pitfalls)

### Waitlist Phase (100 pros, 3 videos each)

**Optimized approach:**
- Supabase Pro: $25/month
- Video storage (compressed): ~6GB = $1.50/month
- Sentry (free tier): $0
- PostHog (free tier): $0
- Stripe fees (100 × $100): $300 revenue, $9 fees
- **Total: ~$35/month operating costs, $91 net revenue per month**

**Unoptimized approach (common pitfalls):**
- Supabase Pro: $25/month
- Video storage (uncompressed): ~60GB = $1,260/month
- Real-time subscriptions (not needed): included but slowing down
- Stripe fees: $9/month
- **Total: ~$1,294/month operating costs, NEGATIVE $1,203 per month**

**Key takeaway:** Video compression alone is the difference between profitability and losing $1,200/month.

---

## Emergency Response: When Things Go Wrong

### Video Storage Costs Spiraling
1. Immediately implement file size upload limits (50MB max)
2. Delete test videos and duplicates
3. Compress existing videos retroactively (batch job)
4. Evaluate video CDN migration (Cloudflare Stream, Mux)

### Stripe Payments Failing
1. Check webhook endpoint is responding (200 status)
2. Verify Stripe signature validation is correct
3. Check webhook logs in Stripe dashboard
4. Manually reconcile subscription states
5. Re-sync subscriptions via Stripe API

### App Store Rejection
1. If payment-related: Implement web-based checkout
2. If privacy-related: Add privacy policy + consent flow
3. If content-related: Review screenshots, remove placeholders
4. Appeal with explanation of changes made

### Supabase Database Slow
1. Check RLS policies (simplify complex policies)
2. Add indexes on frequently queried columns (user_id, timestamp)
3. Check connection pool usage (shouldn't hit limits)
4. Review slow query logs in Supabase dashboard

### Users Churning Silently
1. Add churn tracking (days since last login)
2. Implement re-engagement email sequence
3. Interview churned users (why did you leave?)
4. Check analytics for drop-off points in funnel

---

## Validation Checklist (Before Launch)

**Video handling:**
- [ ] File size limit enforced (<50MB)
- [ ] Client-side compression implemented
- [ ] Video duration limit enforced (<60 seconds)
- [ ] Format validation (MP4 + H.264 only)
- [ ] Upload progress indicator working
- [ ] Tested on physical iOS and Android devices

**Supabase:**
- [ ] Using Supabase Pro plan ($25/month)
- [ ] RLS policies enabled and tested
- [ ] Storage quota monitoring set up
- [ ] Backups verified (auto-backup enabled)

**Stripe:**
- [ ] Payment flow uses web-based checkout (not in-app)
- [ ] Webhook endpoint set up and tested
- [ ] Webhook signature validation implemented
- [ ] Environment variables for API keys (not hardcoded)
- [ ] Test mode vs production mode clearly separated
- [ ] Subscription metadata includes user_id, email

**Waitlist:**
- [ ] Activation criteria defined (X pros + Y videos)
- [ ] Survey placed at optimal moment (after video upload)
- [ ] Email collection at signup
- [ ] Push notifications enabled
- [ ] Churn tracking implemented

**Data collection:**
- [ ] Event schema designed for ML training
- [ ] Privacy policy published
- [ ] Consent flow implemented
- [ ] Basic events tracked (signup, video upload, subscription)
- [ ] Test data separated from production data

**Solo developer:**
- [ ] Deployed to TestFlight/Google Play Beta
- [ ] Error monitoring installed (Sentry)
- [ ] Analytics installed (PostHog)
- [ ] User feedback mechanism in place
- [ ] 5 user tests completed before launch

**App Store:**
- [ ] Read App Store Review Guidelines 3.1.1 (payments)
- [ ] App Privacy section filled out in App Store Connect
- [ ] Privacy policy linked in app and App Store listing
- [ ] Screenshots show actual app content (no mockups)

---

## Further Reading

**Video optimization:**
- FFmpeg compression guide: https://trac.ffmpeg.org/wiki/Encode/H.264
- Expo Video documentation: https://docs.expo.dev/versions/latest/sdk/video/
- Cloudflare Stream pricing: https://www.cloudflare.com/products/cloudflare-stream/

**Supabase best practices:**
- RLS performance guide: https://supabase.com/docs/guides/database/postgres/row-level-security
- Storage limits: https://supabase.com/docs/guides/storage
- Connection pooling: https://supabase.com/docs/guides/database/connecting-to-postgres

**Stripe mobile integration:**
- App Store guidelines 3.1.1: https://developer.apple.com/app-store/review/guidelines/#in-app-purchase
- Stripe webhook best practices: https://stripe.com/docs/webhooks/best-practices
- Stripe mobile SDK: https://stripe.com/docs/mobile/payments

**ML data collection:**
- Event schema design: https://segment.com/academy/collecting-data/naming-conventions-for-clean-data/
- GDPR compliance: https://gdpr.eu/compliance/
- Privacy engineering: https://www.privacypatterns.org/

---

*Last updated: 2026-02-08*
*Next review: Before Phase 2 (waitlist activation)*
