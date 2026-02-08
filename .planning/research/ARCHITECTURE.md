# Architecture: Video-First Marketplace Mobile App
## React Native/Expo + Supabase Stack

**Research Focus**: Typical structure and major components for video-first marketplace apps
**Context**: MVR waitlist MVP — real estate professional routing platform with TikTok-style video feed, swipe interactions, subscription billing, and behavioral data collection for future ML/LLM training.

---

## Executive Summary

Video-first marketplace apps built on React Native/Expo + Supabase follow a **layered component architecture** with clear separation between:
1. **Client-side video capture/playback** (native modules)
2. **Upload pipeline** (client-side compression → Supabase Storage)
3. **Server-side processing** (Supabase Edge Functions for transcoding/optimization)
4. **Feed delivery system** (deck-based pagination with local caching)
5. **Behavioral event pipeline** (write-optimized tracking → batch processing)
6. **Auth/billing/data layers** (Supabase Auth, Stripe webhooks, PostgreSQL)

**Key Insight**: The critical architectural decision is **where video processing happens**. For solo developers, favor **client-side compression + Supabase Storage + external transcoding service** over building custom video infrastructure. Decouple the video pipeline from the feed system to allow independent scaling.

---

## Component Architecture

### 1. Video Pipeline
**Purpose**: Capture → Compress → Upload → Transcode → Stream

#### 1.1 Video Capture (Client)
**Component**: `VideoCapture` module
**Tech**: `expo-camera` + `expo-video` (v3.x supports recording)
**Boundaries**:
- **Input**: User tap on record button
- **Output**: Local video file URI (H.264/HEVC)
- **Dependencies**: Device camera permissions, local storage

**Data Flow**:
```
User Action → Camera API → Record → Local File → Compression → Upload Queue
```

**Build Order**: Phase 1 (MVP Critical)
- Start with `expo-image-picker` for upload-from-gallery (simpler, faster)
- Add `expo-camera` recording in Phase 2 after gallery upload is working

**Key Patterns**:
- **Progressive upload**: Start upload while user is still reviewing video
- **Local caching**: Store compressed video locally before upload for retry logic
- **Metadata capture**: Record duration, resolution, orientation at capture time

#### 1.2 Client-Side Compression (Client)
**Component**: `VideoCompressor` service
**Tech**: `react-native-compressor` or `expo-video-thumbnails` + FFmpeg-kit
**Boundaries**:
- **Input**: Local video file URI
- **Output**: Compressed video file (target: 720p, 2-5 Mbps)
- **Dependencies**: Device CPU, local storage

**Data Flow**:
```
Local File → Compression Worker → Compressed File → Upload Service
```

**Build Order**: Phase 2 (Post-MVP optimization)
- Skip compression for MVP (direct upload)
- Add compression when upload times become user friction

**Key Patterns**:
- **Target bitrate**: 2-5 Mbps for 720p (balances quality vs upload time)
- **Background processing**: Use `expo-task-manager` for background compression
- **Progress tracking**: Emit compression progress events for UI feedback

#### 1.3 Upload Service (Client → Supabase)
**Component**: `VideoUploadService`
**Tech**: Supabase Storage client with resumable uploads
**Boundaries**:
- **Input**: Compressed video file + metadata
- **Output**: Supabase Storage URL
- **Dependencies**: Supabase Storage bucket, network connection

**Data Flow**:
```
Compressed File → Supabase Storage API → Bucket → Signed URL → Database Record
```

**Build Order**: Phase 1 (MVP Critical)

**Key Patterns**:
- **Resumable uploads**: Use Supabase Storage's TUS protocol support
- **Upload queue**: Queue multiple videos for background upload
- **Retry logic**: Exponential backoff for network failures
- **Signed uploads**: Generate pre-signed upload URLs server-side for security

**Supabase Storage Setup**:
```sql
-- Storage bucket for raw video uploads
CREATE BUCKET IF NOT EXISTS videos (
  public = false,
  file_size_limit = 500MB,
  allowed_mime_types = array['video/mp4', 'video/quicktime', 'video/x-msvideo']
);

-- Row-level security: pros can only upload their own videos
CREATE POLICY "Pros can upload own videos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'videos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

#### 1.4 Transcoding Service (Server)
**Component**: `TranscodingPipeline`
**Tech Options** (in order of solo developer preference):
1. **Mux** (recommended): Managed video infrastructure, handles transcoding + CDN + adaptive streaming
2. **Cloudflare Stream**: Similar to Mux, lower cost, fewer features
3. **AWS MediaConvert + CloudFront**: More control, more complexity
4. **Self-hosted FFmpeg via Supabase Edge Functions**: Maximum control, maximum ops burden

**Boundaries**:
- **Input**: Supabase Storage URL (raw video)
- **Output**: HLS/DASH manifest URL + multiple renditions
- **Dependencies**: External transcoding service, Supabase Edge Functions (webhooks)

**Data Flow**:
```
Supabase Storage → Webhook → Edge Function → Transcoding Service → CDN → HLS URL → Database Update
```

**Build Order**: Phase 2 (Post-MVP)
- For MVP: Serve raw uploaded videos directly from Supabase Storage (add signed URLs)
- Add transcoding when serving multiple bitrates becomes necessary

**Key Patterns**:
- **Webhook-driven**: Supabase Storage trigger → Edge Function → Transcoding job
- **Multiple renditions**: 360p, 720p, 1080p for adaptive streaming
- **Thumbnail generation**: Extract poster frame at 1 second
- **Status tracking**: Update `videos` table with transcoding status

**Supabase Edge Function Example**:
```typescript
// supabase/functions/transcode-video/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const { videoId, storageUrl } = await req.json()

  // Trigger Mux/Cloudflare transcoding job
  const transcodingJob = await fetch('https://api.mux.com/video/v1/uploads', {
    method: 'POST',
    headers: { 'Authorization': `Basic ${MUX_TOKEN}` },
    body: JSON.stringify({ url: storageUrl })
  })

  // Update video record with job ID
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
  await supabase.from('videos').update({
    transcoding_job_id: transcodingJob.id,
    status: 'transcoding'
  }).eq('id', videoId)

  return new Response('Transcoding job started', { status: 200 })
})
```

#### 1.5 Video Playback (Client)
**Component**: `VideoPlayer` component
**Tech**: `expo-video` v3.x (new unified API)
**Boundaries**:
- **Input**: Video URL (HLS manifest or direct MP4)
- **Output**: Video playback with gesture controls
- **Dependencies**: Video CDN, network connection

**Data Flow**:
```
Feed Data → VideoPlayer Component → Video CDN → Device Playback
```

**Build Order**: Phase 1 (MVP Critical)

**Key Patterns**:
- **Autoplay on scroll**: Play video when it enters viewport (use `IntersectionObserver` or scroll events)
- **Preloading**: Preload next 2-3 videos in feed for smooth scrolling
- **Gesture controls**: Tap to pause, swipe up/down to navigate
- **Loop behavior**: Auto-loop videos under 30 seconds

**expo-video Implementation**:
```typescript
import { VideoView, useVideoPlayer } from 'expo-video'

const VideoFeedCard = ({ videoUrl }) => {
  const player = useVideoPlayer(videoUrl, (player) => {
    player.loop = true
    player.muted = false // Unmute on focus
  })

  return (
    <VideoView
      player={player}
      style={{ width: '100%', height: '100%' }}
      contentFit="cover"
      nativeControls={false} // Custom controls for swipe gestures
    />
  )
}
```

---

### 2. Feed System
**Purpose**: Deck-based content delivery with swipe interactions

#### 2.1 Deck Architecture
**Component**: `DeckManager` service
**Boundaries**:
- **Input**: User role filter, geo-location, pagination cursor
- **Output**: Ordered array of video cards by deck
- **Dependencies**: Supabase database, user preferences

**Data Flow**:
```
User Profile → Deck Query → PostgreSQL → Video Cards → Client Cache → Feed UI
```

**Build Order**: Phase 3 (Post-waitlist, consumer launch)
- For MVP waitlist: Single feed, no deck separation
- Add decks when consumer-side launches

**Key Patterns**:
- **Deck structure**: Organize by role category (lender → agent → attorney)
- **Within-deck ordering**: Ranking algorithm (response rate, engagement, recency)
- **Cross-deck navigation**: Scroll past entire deck to skip category
- **Finite content**: Show "You've seen all pros in this category" end state

**Database Schema**:
```sql
-- Deck configuration
CREATE TABLE decks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_category TEXT NOT NULL, -- 'lender', 'agent', 'attorney'
  display_order INT NOT NULL,
  is_active BOOLEAN DEFAULT true
);

-- Video-to-deck mapping
CREATE TABLE deck_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deck_id UUID REFERENCES decks(id),
  video_id UUID REFERENCES videos(id),
  rank_score FLOAT DEFAULT 0, -- For ordering within deck
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- View for feed query
CREATE VIEW feed_videos AS
SELECT
  v.id, v.url, v.thumbnail_url, v.duration,
  p.name, p.role_category, p.location,
  d.display_order AS deck_order,
  dv.rank_score
FROM videos v
JOIN profiles p ON v.profile_id = p.id
JOIN deck_videos dv ON v.id = dv.video_id
JOIN decks d ON dv.deck_id = d.id
WHERE v.status = 'active' AND d.is_active = true
ORDER BY d.display_order, dv.rank_score DESC;
```

#### 2.2 Feed Rendering (Client)
**Component**: `VideoFeed` screen
**Tech**: `react-native-reanimated` + `react-native-gesture-handler`
**Boundaries**:
- **Input**: Deck data, swipe gestures
- **Output**: Smooth vertical scroll + horizontal swipe interactions
- **Dependencies**: VideoPlayer, DeckManager, SwipeHandler

**Data Flow**:
```
Deck Data → FlatList/FlashList → VideoCard → Swipe Gesture → Action Handler → Next Card
```

**Build Order**: Phase 1 (MVP Critical)
- Start with simple vertical FlatList
- Add swipe gestures in Phase 2

**Key Patterns**:
- **Vertical scroll**: Use `FlashList` for performance (better than FlatList for video feeds)
- **Swipe gestures**: Left = skip, right = interested (like Tinder)
- **Card stack**: Render current + next 2 cards for smooth transitions
- **Haptic feedback**: Use `expo-haptics` for swipe confirmation

**FlashList Implementation**:
```typescript
import { FlashList } from '@shopify/flash-list'

const VideoFeed = ({ deckVideos }) => {
  const [currentIndex, setCurrentIndex] = useState(0)

  return (
    <FlashList
      data={deckVideos}
      renderItem={({ item }) => <VideoCard video={item} />}
      estimatedItemSize={SCREEN_HEIGHT}
      pagingEnabled
      snapToInterval={SCREEN_HEIGHT}
      decelerationRate="fast"
      onViewableItemsChanged={({ viewableItems }) => {
        // Track which video is visible for analytics
        if (viewableItems[0]) {
          trackVideoView(viewableItems[0].item.id)
        }
      }}
    />
  )
}
```

#### 2.3 Swipe Handler (Client)
**Component**: `SwipeHandler` service
**Tech**: `react-native-gesture-handler` + `react-native-reanimated`
**Boundaries**:
- **Input**: Pan gesture events
- **Output**: Swipe action (left/right), card animation
- **Dependencies**: Behavioral event tracker

**Data Flow**:
```
Pan Gesture → Threshold Check → Animation → Action Callback → Event Log
```

**Build Order**: Phase 2 (Post-MVP)

**Key Patterns**:
- **Swipe threshold**: 50% of screen width or velocity > 0.5
- **Spring animation**: Use `withSpring()` for card snap-back
- **Action callbacks**: Fire event tracking on swipe completion

**Gesture Implementation**:
```typescript
import { GestureDetector, Gesture } from 'react-native-gesture-handler'
import Animated, { useSharedValue, withSpring, runOnJS } from 'react-native-reanimated'

const SwipeableCard = ({ video, onSwipe }) => {
  const translateX = useSharedValue(0)

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = e.translationX
    })
    .onEnd((e) => {
      if (Math.abs(e.translationX) > SWIPE_THRESHOLD) {
        const direction = e.translationX > 0 ? 'right' : 'left'
        runOnJS(onSwipe)(video.id, direction)
        translateX.value = withSpring(0)
      } else {
        translateX.value = withSpring(0)
      }
    })

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={{ transform: [{ translateX }] }}>
        <VideoCard video={video} />
      </Animated.View>
    </GestureDetector>
  )
}
```

#### 2.4 Pagination & Caching (Client)
**Component**: `FeedCache` service
**Boundaries**:
- **Input**: Pagination cursor, cache policy
- **Output**: Next page of videos, cache hit/miss
- **Dependencies**: Supabase query, local storage

**Data Flow**:
```
Scroll Position → Cache Check → Miss → API Query → Cache Update → UI Render
```

**Build Order**: Phase 2 (Post-MVP optimization)

**Key Patterns**:
- **Cursor-based pagination**: Use `created_at` + `id` for stable pagination
- **Prefetch**: Load next page when user is 3 cards from end
- **Cache expiration**: TTL of 5 minutes for feed data
- **Optimistic updates**: Update cache immediately after user swipe

**Supabase Pagination Query**:
```typescript
const fetchDeckPage = async (deckId, cursor, limit = 10) => {
  const query = supabase
    .from('deck_videos')
    .select('*, videos(*), profiles(*)')
    .eq('deck_id', deckId)
    .order('rank_score', { ascending: false })
    .limit(limit)

  if (cursor) {
    query.lt('rank_score', cursor.rankScore)
      .lt('id', cursor.id)
  }

  const { data, error } = await query
  return { videos: data, nextCursor: data[data.length - 1] }
}
```

---

### 3. Authentication & Authorization

#### 3.1 Auth Flow (Client + Supabase)
**Component**: `AuthService`
**Tech**: Supabase Auth (email/password)
**Boundaries**:
- **Input**: Email, password, user role
- **Output**: JWT access token, user session
- **Dependencies**: Supabase Auth API

**Data Flow**:
```
User Credentials → Supabase Auth → JWT Token → Client Storage → API Requests
```

**Build Order**: Phase 1 (MVP Critical)

**Key Patterns**:
- **Email/password only**: Skip OAuth for MVP simplicity
- **Role-based access**: Add `role` column to profiles table (pro vs consumer)
- **Token refresh**: Supabase handles automatic token refresh
- **Persistent sessions**: Use `expo-secure-store` for token storage

**Auth Implementation**:
```typescript
import { createClient } from '@supabase/supabase-js'
import * as SecureStore from 'expo-secure-store'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: {
      getItem: (key) => SecureStore.getItemAsync(key),
      setItem: (key, value) => SecureStore.setItemAsync(key, value),
      removeItem: (key) => SecureStore.deleteItemAsync(key),
    },
  },
})

const signUp = async (email, password, role) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { role } // Store role in user metadata
    }
  })

  // Create profile record
  if (data.user) {
    await supabase.from('profiles').insert({
      id: data.user.id,
      role,
      email
    })
  }

  return { data, error }
}
```

#### 3.2 Row-Level Security (Supabase)
**Component**: RLS policies on tables
**Boundaries**:
- **Input**: Authenticated user JWT
- **Output**: Filtered query results
- **Dependencies**: PostgreSQL, Supabase Auth

**Build Order**: Phase 1 (MVP Critical)

**Key Patterns**:
- **Pro-only content creation**: Pros can only create/edit their own videos
- **Public read for videos**: All authenticated users can view videos (for waitlist peer browsing)
- **Consumer launch**: Tighten policies to role-based access

**RLS Policies**:
```sql
-- Profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles"
ON profiles FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- Videos table
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pros can create own videos"
ON videos FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = profile_id AND (
  SELECT role FROM profiles WHERE id = auth.uid()
) = 'pro');

CREATE POLICY "All users can view active videos"
ON videos FOR SELECT
TO authenticated
USING (status = 'active');
```

---

### 4. Subscription Billing

#### 4.1 Stripe Integration (Server + Client)
**Component**: `BillingService`
**Tech**: Stripe SDK + Supabase Edge Functions
**Boundaries**:
- **Input**: User subscription action (subscribe, cancel, update)
- **Output**: Stripe subscription status, payment confirmation
- **Dependencies**: Stripe API, Supabase database

**Data Flow**:
```
Client Action → Supabase Edge Function → Stripe API → Webhook → Database Update → Client Notification
```

**Build Order**: Phase 1 (MVP Critical)

**Key Patterns**:
- **Stripe Checkout**: Use hosted checkout page for PCI compliance
- **Webhooks**: Listen to `customer.subscription.*` events
- **Subscription status**: Store in `subscriptions` table with foreign key to profiles
- **Trial period**: Offer 7-day trial for founding pros

**Database Schema**:
```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) NOT NULL,
  stripe_subscription_id TEXT UNIQUE NOT NULL,
  stripe_customer_id TEXT NOT NULL,
  status TEXT NOT NULL, -- 'active', 'canceled', 'past_due', 'trialing'
  plan_id TEXT NOT NULL, -- 'founding_pro_100'
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_profile ON subscriptions(profile_id);
CREATE INDEX idx_subscriptions_stripe_id ON subscriptions(stripe_subscription_id);
```

**Edge Function: Create Checkout Session**:
```typescript
// supabase/functions/create-checkout/index.ts
import Stripe from 'https://esm.sh/stripe@13.5.0'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'), {
  apiVersion: '2023-10-16'
})

serve(async (req) => {
  const { profileId } = await req.json()

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL'),
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  )

  // Get or create Stripe customer
  const { data: profile } = await supabase
    .from('profiles')
    .select('email, stripe_customer_id')
    .eq('id', profileId)
    .single()

  let customerId = profile.stripe_customer_id
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: profile.email,
      metadata: { profile_id: profileId }
    })
    customerId = customer.id
    await supabase.from('profiles').update({
      stripe_customer_id: customerId
    }).eq('id', profileId)
  }

  // Create checkout session
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{
      price: Deno.env.get('STRIPE_FOUNDING_PRO_PRICE_ID'),
      quantity: 1
    }],
    subscription_data: {
      trial_period_days: 7
    },
    success_url: 'mvr://subscription-success',
    cancel_url: 'mvr://subscription-cancel',
    metadata: { profile_id: profileId }
  })

  return new Response(JSON.stringify({ url: session.url }), {
    headers: { 'Content-Type': 'application/json' }
  })
})
```

#### 4.2 Webhook Handler (Server)
**Component**: `StripeWebhookHandler`
**Tech**: Supabase Edge Function
**Boundaries**:
- **Input**: Stripe webhook events
- **Output**: Database updates, user notifications
- **Dependencies**: Stripe webhook signature verification, Supabase database

**Data Flow**:
```
Stripe Event → Webhook Endpoint → Signature Verification → Database Update → Push Notification
```

**Build Order**: Phase 1 (MVP Critical)

**Key Patterns**:
- **Event types to handle**:
  - `customer.subscription.created` → Create subscription record
  - `customer.subscription.updated` → Update status (active, canceled, past_due)
  - `customer.subscription.deleted` → Mark as canceled
  - `invoice.payment_failed` → Update status, send notification
- **Idempotency**: Use `event.id` to prevent duplicate processing
- **Error handling**: Retry failed webhook processing with exponential backoff

**Webhook Edge Function**:
```typescript
// supabase/functions/stripe-webhook/index.ts
import Stripe from 'https://esm.sh/stripe@13.5.0'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'))

serve(async (req) => {
  const signature = req.headers.get('stripe-signature')
  const body = await req.text()

  // Verify webhook signature
  let event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      Deno.env.get('STRIPE_WEBHOOK_SECRET')
    )
  } catch (err) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL'),
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  )

  // Handle event
  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const subscription = event.data.object
      await supabase.from('subscriptions').upsert({
        stripe_subscription_id: subscription.id,
        profile_id: subscription.metadata.profile_id,
        stripe_customer_id: subscription.customer,
        status: subscription.status,
        plan_id: subscription.items.data[0].price.id,
        current_period_start: new Date(subscription.current_period_start * 1000),
        current_period_end: new Date(subscription.current_period_end * 1000),
        cancel_at: subscription.cancel_at ? new Date(subscription.cancel_at * 1000) : null,
        updated_at: new Date()
      }, {
        onConflict: 'stripe_subscription_id'
      })
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object
      await supabase.from('subscriptions').update({
        status: 'canceled',
        updated_at: new Date()
      }).eq('stripe_subscription_id', subscription.id)
      break
    }
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 })
})
```

---

### 5. Behavioral Event Tracking

#### 5.1 Event Collection (Client)
**Component**: `AnalyticsService`
**Boundaries**:
- **Input**: User actions (video views, swipes, scrolls, time-on-video)
- **Output**: Event batch sent to Supabase
- **Dependencies**: Local event queue, Supabase database

**Data Flow**:
```
User Action → Event Creation → Local Queue → Batch Upload (every 30s or 50 events) → Supabase Table
```

**Build Order**: Phase 1 (MVP Critical for LLM training data)

**Key Patterns**:
- **Event batching**: Collect events locally, send in batches to reduce API calls
- **Offline support**: Queue events when offline, sync when reconnected
- **Event schema**: Standardized structure with `event_type`, `user_id`, `properties`, `timestamp`
- **High-volume writes**: Use dedicated `events` table with partitioning for scale

**Event Types to Track**:
```
- video_view: { video_id, deck_id, scroll_position, watch_duration }
- video_swipe: { video_id, direction, watch_duration, swipe_velocity }
- video_pause: { video_id, timestamp_in_video }
- feed_scroll: { deck_id, scroll_depth, videos_viewed }
- profile_view: { profile_id, source }
- signup_start: { role }
- signup_complete: { role, time_to_complete }
- video_upload_start: { file_size, duration }
- video_upload_complete: { video_id, upload_duration }
- subscription_start: { plan_id }
- subscription_complete: { plan_id, trial_used }
```

**Event Schema**:
```sql
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  user_id UUID REFERENCES profiles(id),
  session_id UUID NOT NULL,
  properties JSONB, -- Flexible schema for event-specific data
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Partition by month for performance
CREATE INDEX idx_events_user_time ON events(user_id, timestamp DESC);
CREATE INDEX idx_events_type_time ON events(event_type, timestamp DESC);
CREATE INDEX idx_events_properties ON events USING GIN (properties);

-- Consider time-series partitioning for scale
-- CREATE TABLE events_2026_02 PARTITION OF events
-- FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');
```

**Client Implementation**:
```typescript
class AnalyticsService {
  private eventQueue: Event[] = []
  private readonly BATCH_SIZE = 50
  private readonly BATCH_INTERVAL = 30000 // 30 seconds

  constructor(private supabase: SupabaseClient) {
    // Flush queue periodically
    setInterval(() => this.flush(), this.BATCH_INTERVAL)
  }

  track(eventType: string, properties: Record<string, any>) {
    const event = {
      event_type: eventType,
      user_id: this.supabase.auth.user()?.id,
      session_id: this.sessionId,
      properties,
      timestamp: new Date().toISOString()
    }

    this.eventQueue.push(event)

    if (this.eventQueue.length >= this.BATCH_SIZE) {
      this.flush()
    }
  }

  async flush() {
    if (this.eventQueue.length === 0) return

    const batch = [...this.eventQueue]
    this.eventQueue = []

    try {
      await this.supabase.from('events').insert(batch)
    } catch (error) {
      // Re-queue failed events
      this.eventQueue.unshift(...batch)
      console.error('Failed to send events:', error)
    }
  }
}

// Usage in VideoFeed component
const analytics = useAnalytics()

const handleVideoView = (videoId: string) => {
  analytics.track('video_view', {
    video_id: videoId,
    deck_id: currentDeck.id,
    scroll_position: scrollY
  })
}
```

#### 5.2 Event Processing (Server)
**Component**: `EventProcessor`
**Tech**: Supabase Database Functions (triggers) or scheduled Edge Functions
**Boundaries**:
- **Input**: Raw events from `events` table
- **Output**: Aggregated metrics, ML training datasets
- **Dependencies**: PostgreSQL, Supabase Edge Functions

**Data Flow**:
```
Raw Events → Batch Processor → Aggregations → Metrics Tables → ML Pipeline
```

**Build Order**: Phase 3 (Post-launch optimization)

**Key Patterns**:
- **Real-time aggregations**: Use PostgreSQL triggers for hot metrics (video view counts)
- **Batch processing**: Scheduled Edge Functions for cold metrics (weekly engagement scores)
- **ML training data**: Export events to S3/GCS for future LLM training

**Example Aggregation (PostgreSQL Function)**:
```sql
-- Aggregate video view metrics
CREATE OR REPLACE FUNCTION update_video_metrics()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.event_type = 'video_view' THEN
    INSERT INTO video_metrics (video_id, view_count, total_watch_time)
    VALUES (
      (NEW.properties->>'video_id')::UUID,
      1,
      (NEW.properties->>'watch_duration')::INT
    )
    ON CONFLICT (video_id)
    DO UPDATE SET
      view_count = video_metrics.view_count + 1,
      total_watch_time = video_metrics.total_watch_time + (NEW.properties->>'watch_duration')::INT,
      updated_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_video_metrics
AFTER INSERT ON events
FOR EACH ROW
EXECUTE FUNCTION update_video_metrics();
```

---

### 6. Data Schema for ML/LLM Training

#### 6.1 Training Data Structure
**Purpose**: Structure data for future LLM training on buying intent and sales optimization

**Key Datasets**:
1. **Video engagement signals**: Video ID + user swipes + watch duration + completion rate
2. **Pro performance signals**: Pro ID + response rate + consumer conversion rate + video style
3. **Consumer intent signals**: Swipe patterns + time-on-video + deck navigation + message content
4. **Routing outcomes**: Match ID + response time + conversion outcome

**Schema Design Principles**:
- **Immutable events**: Never delete events, only append
- **Rich context**: Capture as much context as possible (device, location, time, session)
- **Labeled outcomes**: Track final outcomes (did consumer convert? did pro respond?)
- **Temporal features**: Time-series data for behavior over time

**Training Tables**:
```sql
-- Pro performance metrics (labels for LLM training)
CREATE TABLE pro_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id),
  response_rate FLOAT, -- % of consumer inquiries responded to within 1 hour
  conversion_rate FLOAT, -- % of conversations that led to closed deals
  avg_response_time_minutes INT,
  engagement_score FLOAT, -- Consumer swipe-right rate on their videos
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Video content features (for content-based recommendations)
CREATE TABLE video_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID REFERENCES videos(id),
  duration_seconds INT,
  has_captions BOOLEAN,
  dominant_colors JSONB, -- For visual similarity
  transcription TEXT, -- For semantic search
  embedding VECTOR(1536), -- For vector similarity (pgvector extension)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Consumer journey (for intent prediction)
CREATE TABLE consumer_journeys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consumer_id UUID REFERENCES profiles(id),
  session_id UUID NOT NULL,
  videos_viewed UUID[], -- Array of video IDs
  swipe_right_videos UUID[], -- Videos they were interested in
  swipe_left_videos UUID[],
  decks_completed TEXT[], -- Which role categories they completed
  conversion_outcome TEXT, -- 'contacted_pro', 'no_action', 'closed_deal'
  time_to_conversion_minutes INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 6.2 ML Pipeline (Future)
**Build Order**: Phase 4 (Post-launch, after data collection)

**Components**:
1. **Data export pipeline**: Supabase → S3/GCS (Parquet format)
2. **Feature engineering**: Transform raw events into ML features
3. **Model training**: Fine-tune LLM on video content + engagement outcomes
4. **Inference API**: Supabase Edge Function serving model predictions

**Future Use Cases**:
- **Intent prediction**: Predict which consumers are likely to convert based on swipe patterns
- **Pro ranking**: Rank pros by predicted conversion rate for each consumer
- **Content optimization**: Recommend video styles/scripts that drive engagement
- **Response prediction**: Predict which pros will respond fastest

---

## Component Boundaries Summary

```
┌─────────────────────────────────────────────────────────────┐
│                         Client App                          │
├─────────────────────────────────────────────────────────────┤
│  ┌───────────────┐  ┌───────────────┐  ┌────────────────┐  │
│  │ VideoCapture  │  │   VideoFeed   │  │  AuthService   │  │
│  │   Component   │  │    Screen     │  │                │  │
│  └───────┬───────┘  └───────┬───────┘  └────────┬───────┘  │
│          │                  │                   │          │
│  ┌───────▼───────┐  ┌───────▼───────┐  ┌────────▼───────┐  │
│  │VideoUploadSvc │  │  DeckManager  │  │AnalyticsSvc    │  │
│  └───────┬───────┘  └───────┬───────┘  └────────┬───────┘  │
└──────────┼──────────────────┼─────────────────────┼─────────┘
           │                  │                     │
           │  HTTPS           │  HTTPS              │  HTTPS
           │                  │                     │
┌──────────▼──────────────────▼─────────────────────▼─────────┐
│                      Supabase Backend                        │
├─────────────────────────────────────────────────────────────┤
│  ┌────────────┐  ┌───────────────┐  ┌──────────────────┐   │
│  │   Storage  │  │   PostgreSQL  │  │   Edge Functions │   │
│  │  (Videos)  │  │   (Database)  │  │   (Serverless)   │   │
│  └─────┬──────┘  └───────┬───────┘  └────────┬─────────┘   │
│        │                 │                   │              │
│  ┌─────▼──────┐  ┌───────▼───────┐  ┌────────▼─────────┐   │
│  │  CDN/Sign  │  │  RLS Policies │  │  Webhook Handler │   │
│  │    URLs    │  │               │  │   (Stripe)       │   │
│  └─────┬──────┘  └───────┬───────┘  └────────┬─────────┘   │
└────────┼──────────────────┼─────────────────────┼───────────┘
         │                  │                     │
         │  Webhook         │                     │  Webhook
         │                  │                     │
┌────────▼─────────┐  ┌─────▼──────┐  ┌──────────▼──────────┐
│  Transcoding     │  │  Supabase  │  │   Stripe API        │
│  Service (Mux)   │  │  Realtime  │  │   (Billing)         │
└──────────────────┘  └────────────┘  └─────────────────────┘
```

---

## Data Flow Summary

### Upload Flow
```
User Records Video
  → expo-camera captures video
  → Local file saved
  → (Optional) Client-side compression
  → Upload to Supabase Storage
  → Storage webhook triggers Edge Function
  → Edge Function calls Mux/Cloudflare for transcoding
  → Transcoding complete webhook updates database
  → Video marked as "active" and appears in feed
```

### Feed Delivery Flow
```
User Opens Feed
  → Client queries Supabase (filtered by role/geo)
  → Database returns paginated video list with signed URLs
  → Client caches videos + prefetches next page
  → VideoPlayer component loads HLS manifest
  → CDN streams video to device
  → User swipes → Analytics event logged
  → Client fetches next page when nearing end
```

### Subscription Flow
```
User Taps "Subscribe"
  → Client calls Edge Function: create-checkout
  → Edge Function creates Stripe Checkout Session
  → Client opens Stripe hosted page (in-app browser)
  → User completes payment
  → Stripe redirects to success URL
  → Stripe sends webhook to Edge Function
  → Edge Function verifies signature + updates subscriptions table
  → Client polls subscription status or listens to Realtime updates
  → UI updates to show "Active Subscription"
```

### Analytics Flow
```
User Views Video
  → Client logs "video_view" event to local queue
  → Queue fills to 50 events or 30 seconds passes
  → Client sends batch to Supabase events table
  → PostgreSQL trigger updates video_metrics table (view count)
  → (Future) Scheduled Edge Function exports events to S3 for ML training
```

---

## Suggested Build Order

### Phase 1: Waitlist MVP (Weeks 1-4)
**Goal**: Pros can sign up, upload videos, browse feed, subscribe

1. **Auth System** (Week 1)
   - Supabase Auth setup (email/password)
   - Sign up / sign in screens
   - Profile creation with role field
   - RLS policies on profiles table

2. **Video Upload** (Week 1-2)
   - Gallery picker (`expo-image-picker`)
   - Direct upload to Supabase Storage (no compression yet)
   - Videos table + RLS policies
   - Upload progress UI

3. **Video Feed** (Week 2)
   - Simple vertical FlatList
   - Video playback with `expo-video`
   - Autoplay on scroll
   - Basic pagination (cursor-based)

4. **Stripe Subscription** (Week 3)
   - Stripe account setup + test mode
   - Edge Function: create-checkout
   - Edge Function: stripe-webhook
   - Subscriptions table + RLS
   - Subscribe button + success/cancel screens

5. **Survey** (Week 3-4)
   - Simple form (role, location, experience level)
   - Responses table
   - Place survey after video upload or before subscription

6. **Basic Analytics** (Week 4)
   - Event batching service
   - Track: signup, video_upload, video_view, subscription
   - Events table

**Dependencies**: Auth → Video Upload → Feed → Subscription

---

### Phase 2: Optimization (Weeks 5-6)
**Goal**: Improve performance, add polish

1. **Video Compression** (Week 5)
   - Client-side compression with FFmpeg-kit
   - Target 720p, 2-5 Mbps
   - Background processing

2. **Swipe Gestures** (Week 5)
   - Pan gesture handler
   - Card animations
   - Haptic feedback

3. **Feed Polish** (Week 6)
   - Replace FlatList with FlashList
   - Video preloading (next 2-3 videos)
   - Cache layer for feed data
   - End-of-feed state

4. **Enhanced Analytics** (Week 6)
   - Track: swipes, watch_duration, scroll patterns
   - Video metrics aggregation (trigger-based)

**Dependencies**: Phase 1 complete → Compression + Gestures + Feed optimization can happen in parallel

---

### Phase 3: Consumer Launch (Weeks 7-10)
**Goal**: Launch consumer-side features, enable routing

1. **Deck Architecture** (Week 7)
   - Decks table + deck_videos mapping
   - Multi-deck feed UI (role categories)
   - Cross-deck navigation

2. **Pro Ranking** (Week 8)
   - Ranking algorithm (response rate, engagement, recency)
   - rank_score calculation
   - Periodic re-ranking job

3. **Routing System** (Week 9)
   - Match table (consumer ↔ pro)
   - Swipe-right → create match
   - Notification system

4. **Video Transcoding** (Week 10)
   - Mux/Cloudflare integration
   - Webhook handling for transcoding complete
   - HLS adaptive streaming
   - Thumbnail generation

**Dependencies**: Deck Architecture → Pro Ranking → Routing System

---

### Phase 4: ML/LLM Training (Weeks 11+)
**Goal**: Prepare data for future ML models

1. **Data Export Pipeline** (Week 11)
   - Scheduled Edge Function to export events to S3/GCS
   - Parquet format for efficiency

2. **Feature Engineering** (Week 12)
   - Transform events → training features
   - Label outcomes (conversions, response times)

3. **Model Training** (Week 13+)
   - Fine-tune LLM on video content + engagement
   - Train ranking models
   - A/B test model-driven ranking vs rule-based

**Dependencies**: Phase 3 live + sufficient data collected

---

## Critical Decision Points

### 1. Video Transcoding: Build vs Buy
**Decision**: Use Mux or Cloudflare Stream (buy)
**Rationale**:
- Building custom transcoding is 2-3 weeks of work + ongoing ops burden
- Mux handles transcoding + CDN + adaptive streaming for ~$0.005/minute watched
- Solo developer time is better spent on core product features

**Alternative**: Skip transcoding for MVP, serve raw MP4s from Supabase Storage
- Pros: Faster to ship, zero cost
- Cons: Larger file sizes, no adaptive streaming, poor mobile experience
- **Recommendation**: Skip for waitlist MVP, add Mux for consumer launch

---

### 2. Feed Pagination: Offset vs Cursor
**Decision**: Cursor-based pagination
**Rationale**:
- Offset pagination (`LIMIT 10 OFFSET 20`) breaks when new content is inserted
- Cursor pagination (`WHERE id < cursor ORDER BY rank_score DESC LIMIT 10`) is stable
- Critical for video feeds where content is constantly being added

**Implementation**: Use `(rank_score, id)` as compound cursor

---

### 3. Analytics: Real-Time vs Batch
**Decision**: Batch on client, real-time aggregation on server
**Rationale**:
- Client-side batching reduces API calls (50 events → 1 request)
- Server-side triggers provide real-time metrics (view counts)
- Scheduled jobs handle cold analytics (weekly engagement scores)

**Tradeoff**: Slight delay in analytics dashboard, but better client performance

---

### 4. Auth: Email/Password vs OAuth
**Decision**: Email/password for MVP, add OAuth later
**Rationale**:
- OAuth adds 1 week of integration work (Apple, Google)
- Email/password is sufficient for waitlist validation
- Add OAuth for consumer launch (reduces friction)

---

### 5. Data Schema: Normalized vs Denormalized
**Decision**: Start normalized, selectively denormalize
**Rationale**:
- Normalized schema (separate tables for profiles, videos, decks) is easier to reason about
- Denormalize hot paths (e.g., embed profile data in feed query) for performance
- Use PostgreSQL views for complex joins

**Example Denormalization**:
```sql
-- Materialized view for feed query (refreshed every 5 minutes)
CREATE MATERIALIZED VIEW feed_cache AS
SELECT
  v.id, v.url, v.thumbnail_url,
  p.name, p.role_category,
  dv.rank_score
FROM videos v
JOIN profiles p ON v.profile_id = p.id
JOIN deck_videos dv ON v.id = dv.video_id;

CREATE INDEX idx_feed_cache_rank ON feed_cache(rank_score DESC);
```

---

## Technology Choices

### Client-Side
- **Framework**: React Native 0.81 + Expo SDK 54
- **Navigation**: Expo Router (file-based routing)
- **Video**: expo-video v3.x (unified API, replaces expo-av)
- **Gestures**: react-native-gesture-handler + react-native-reanimated
- **State**: React Context + local state (avoid Redux complexity for MVP)
- **HTTP**: Supabase JS client (handles auth + API + realtime)
- **Storage**: expo-secure-store (JWT tokens), AsyncStorage (cache)

### Server-Side
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Edge Functions + Realtime)
- **Video Storage**: Supabase Storage (raw uploads) → Mux/Cloudflare (transcoding + CDN)
- **Payments**: Stripe (subscriptions + webhooks)
- **Analytics**: Supabase PostgreSQL (events table) → S3 export (future ML training)
- **Push Notifications**: Expo Push Notifications (future)

### DevOps
- **Hosting**: Supabase Cloud (managed PostgreSQL + Edge Functions)
- **CI/CD**: GitHub Actions + EAS Build (Expo Application Services)
- **Monitoring**: Sentry (error tracking), Supabase Logs (server-side)
- **Feature Flags**: Simple database table (future: LaunchDarkly)

---

## Risks & Mitigations

### Risk 1: Video Upload Failures
**Likelihood**: High (mobile networks are unreliable)
**Impact**: High (user frustration, incomplete content)
**Mitigation**:
- Implement resumable uploads (TUS protocol via Supabase Storage)
- Show upload progress + retry button
- Queue failed uploads for background retry

### Risk 2: Video Playback Performance
**Likelihood**: Medium (large video files + slow networks)
**Impact**: High (core UX failure)
**Mitigation**:
- Use adaptive streaming (HLS) via Mux/Cloudflare
- Preload next 2-3 videos in feed
- Show loading skeleton while buffering

### Risk 3: Stripe Webhook Failures
**Likelihood**: Medium (network issues, race conditions)
**Impact**: High (subscription status out of sync)
**Mitigation**:
- Implement idempotent webhook handling (use `event.id`)
- Add retry logic with exponential backoff
- Monitor webhook failures in Stripe dashboard

### Risk 4: Event Data Loss
**Likelihood**: Low (client crashes, offline mode)
**Impact**: Medium (incomplete training data)
**Mitigation**:
- Persist event queue to AsyncStorage
- Sync events on app resume
- Add server-side validation (detect missing events by session gaps)

### Risk 5: Database Query Performance
**Likelihood**: Medium (complex joins, large tables)
**Impact**: High (slow feed loading)
**Mitigation**:
- Add indexes on `(user_id, timestamp)`, `(video_id, rank_score)`
- Use materialized views for complex feed queries
- Implement caching layer (Redis in future)

---

## Success Metrics

### Waitlist MVP (Phase 1)
- **Primary**: 100 paying pro subscribers ($10k MRR)
- **Secondary**: 500 videos uploaded, 80% subscription conversion rate (signups → subscribers)

### Consumer Launch (Phase 3)
- **Primary**: 1,000 consumer signups, 50% swipe-right rate, 10% match → conversation rate
- **Secondary**: 90% video completion rate, <2s feed load time

### ML Training (Phase 4)
- **Primary**: 1M+ behavioral events collected, 10k+ labeled conversion outcomes
- **Secondary**: Model-driven ranking outperforms rule-based by 20% (measured by conversion rate)

---

## Next Steps

1. **Review with stakeholders**: Confirm architecture aligns with business goals
2. **Set up Supabase project**: Create database, configure Storage, deploy Edge Functions
3. **Begin Phase 1 build**: Start with Auth → Video Upload → Feed → Subscription
4. **Establish monitoring**: Set up Sentry, Supabase Logs, analytics dashboard
5. **Plan Houston launch**: Coordinate with real estate contact for pro signups

---

**Last Updated**: 2026-02-08
**Author**: Project Research Agent
**Status**: Initial Draft for Review
