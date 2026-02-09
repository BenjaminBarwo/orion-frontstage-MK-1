/**
 * Typed event system for behavioral_events table.
 * Mirrors PostgreSQL enums and provides compile-time event_data validation.
 */

// ---------------------------------------------------------------------------
// PostgreSQL enum mirrors
// ---------------------------------------------------------------------------

export type RoleCategory =
  | 'lender'
  | 'agent'
  | 'attorney'
  | 'title'
  | 'inspector'
  | 'appraiser'
  | 'other';

export type DevicePlatform = 'ios' | 'android' | 'web';

export type EventType =
  // Auth
  | 'signup'
  | 'login'
  | 'logout'
  | 'session_start'
  | 'session_end'
  | 'email_verified'
  // Profile
  | 'profile_update'
  | 'profile_view'
  // Video
  | 'video_upload'
  | 'video_record'
  // Feed
  | 'video_view'
  | 'video_like'
  | 'video_unlike'
  | 'feed_scroll'
  // Deck
  | 'video_swipe_left'
  | 'video_swipe_right'
  | 'deck_change'
  // Billing
  | 'subscription_start'
  | 'subscription_cancel'
  | 'subscription_renewed'
  // Survey
  | 'survey_start'
  | 'survey_complete'
  | 'survey_skip'
  // Notifications
  | 'notification_received'
  | 'notification_tapped'
  // Lifecycle
  | 'app_open'
  | 'app_close'
  | 'app_background';

// ---------------------------------------------------------------------------
// Per-event-type data interfaces
// ---------------------------------------------------------------------------

/** Auth events */
export interface SignupEventData {
  method: 'email' | 'google' | 'apple';
}

export interface LoginEventData {
  method: 'email' | 'google' | 'apple';
}

export interface LogoutEventData {
  reason?: 'user_initiated' | 'session_expired' | 'forced';
}

export interface SessionStartEventData {
  referrer?: string;
}

export interface SessionEndEventData {
  duration_seconds: number;
}

export interface EmailVerifiedEventData {
  method: 'link' | 'otp';
}

/** Profile events */
export interface ProfileUpdateEventData {
  fields_changed: string[];
}

export interface ProfileViewEventData {
  viewed_profile_id: string;
}

/** Video events */
export interface VideoUploadEventData {
  video_id: string;
  duration_seconds: number;
  file_size_bytes: number;
  resolution: string;
}

export interface VideoRecordEventData {
  duration_seconds: number;
  camera: 'front' | 'back';
}

/** Feed events */
export interface VideoViewEventData {
  video_id: string;
  watch_duration_seconds: number;
  completion_percent: number;
}

export interface VideoLikeEventData {
  video_id: string;
}

export interface VideoUnlikeEventData {
  video_id: string;
}

export interface FeedScrollEventData {
  videos_seen: number;
  scroll_depth: number;
}

/** Deck events */
export interface VideoSwipeLeftEventData {
  video_id: string;
  watch_duration_seconds: number;
}

export interface VideoSwipeRightEventData {
  video_id: string;
  watch_duration_seconds: number;
}

export interface DeckChangeEventData {
  from_deck?: string;
  to_deck: string;
}

/** Billing events */
export interface SubscriptionStartEventData {
  plan_id: string;
  amount_cents: number;
}

export interface SubscriptionCancelEventData {
  reason?: string;
  plan_id: string;
}

export interface SubscriptionRenewedEventData {
  plan_id: string;
  amount_cents: number;
}

/** Survey events */
export interface SurveyStartEventData {
  survey_id: string;
}

export interface SurveyCompleteEventData {
  survey_id: string;
  responses: Record<string, unknown>;
}

export interface SurveySkipEventData {
  survey_id: string;
  question_index?: number;
}

/** Notification events */
export interface NotificationReceivedEventData {
  notification_type: string;
  notification_id: string;
}

export interface NotificationTappedEventData {
  notification_type: string;
  notification_id: string;
}

/** Lifecycle events */
export interface AppOpenEventData {
  cold_start: boolean;
}

export interface AppCloseEventData {
  session_duration_seconds: number;
}

export interface AppBackgroundEventData {
  reason?: 'home_button' | 'app_switch' | 'notification';
}

// ---------------------------------------------------------------------------
// Event type → data shape mapping
// ---------------------------------------------------------------------------

export interface EventDataMap {
  signup: SignupEventData;
  login: LoginEventData;
  logout: LogoutEventData;
  session_start: SessionStartEventData;
  session_end: SessionEndEventData;
  email_verified: EmailVerifiedEventData;
  profile_update: ProfileUpdateEventData;
  profile_view: ProfileViewEventData;
  video_upload: VideoUploadEventData;
  video_record: VideoRecordEventData;
  video_view: VideoViewEventData;
  video_like: VideoLikeEventData;
  video_unlike: VideoUnlikeEventData;
  feed_scroll: FeedScrollEventData;
  video_swipe_left: VideoSwipeLeftEventData;
  video_swipe_right: VideoSwipeRightEventData;
  deck_change: DeckChangeEventData;
  subscription_start: SubscriptionStartEventData;
  subscription_cancel: SubscriptionCancelEventData;
  subscription_renewed: SubscriptionRenewedEventData;
  survey_start: SurveyStartEventData;
  survey_complete: SurveyCompleteEventData;
  survey_skip: SurveySkipEventData;
  notification_received: NotificationReceivedEventData;
  notification_tapped: NotificationTappedEventData;
  app_open: AppOpenEventData;
  app_close: AppCloseEventData;
  app_background: AppBackgroundEventData;
}

// ---------------------------------------------------------------------------
// Type-safe event insertion helper
// ---------------------------------------------------------------------------

export interface BehavioralEventInsert<T extends EventType> {
  user_id: string;
  session_id?: string;
  event_type: T;
  event_data: EventDataMap[T];
  device_platform?: DevicePlatform;
  device_os_version?: string;
  app_version?: string;
  geo_area?: string;
}
