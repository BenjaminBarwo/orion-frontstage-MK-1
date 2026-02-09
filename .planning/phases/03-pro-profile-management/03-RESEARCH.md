# Phase 3: Pro Profile Management - Research

**Researched:** 2026-02-09
**Domain:** React Native profile onboarding with image picker, multi-step forms, and Supabase storage
**Confidence:** HIGH

## Summary

Phase 3 implements a required profile onboarding flow for founding pros after authentication. Pros build complete profiles with role selection, name, Houston-area zip code, circular profile photo, and bio through a step-by-step flow with dark premium styling. The research confirms that Expo SDK 54 provides mature solutions for all required capabilities: image selection/cropping (`expo-image-picker`), image manipulation (`expo-image-manipulator`), file uploads to Supabase Storage, multi-step form orchestration with `react-hook-form`, fade transitions with `react-native-reanimated`, and database updates with RLS policies.

The profile management domain requires careful coordination of: multi-step form state management, image picker permissions and native modules, image compression/optimization before upload, Supabase Storage upload API with ArrayBuffer conversion, database trigger for profile creation on user signup, Houston zip code validation, circular image masking, profile completeness gating (blocking app access until complete), and seamless transitions between onboarding steps.

**Primary recommendation:** Use `expo-image-picker` with `allowsEditing: true` for selection + built-in crop, `expo-image-manipulator` for resize/compression, store form state in React Context across steps with `react-hook-form` for per-step validation, upload photo as ArrayBuffer to Supabase Storage `avatars` bucket, save all profile data in single transaction at review screen, use Postgres trigger to auto-create profile row on user signup, implement Houston zip code validation with hardcoded list, and block tab navigation until profile is complete via route guards.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Profile Setup Flow:**
- Step-by-step onboarding after welcome card (not a single form)
- Required before app access — pro must complete all steps
- No progress indicator (no dots, no "step X of Y") — each screen stands alone for premium/immersive feel
- Back button allowed — pro can return to previous steps to edit before completing
- Fade in/out transitions between steps (consistent with auth screen transitions)
- Step order: Role → Name → Location → Photo → Bio
- Final "Review your profile" summary screen before completing onboarding
- Dark premium styling (#0D0D0D background, gold gradient accents) — same as auth screens
- All profile data saved together at the end (not incrementally)

**Role & Location Inputs:**
- 5 role categories: Lender, Real Estate Agent, Attorney, Title/Escrow, Home Inspector
- Single role selection only (one primary role per pro)
- Role UI: tappable cards with text only (no icons), gold gradient border on selected card
- Role screen heading: Claude's discretion on copy
- Name: separate First Name and Last Name fields
- Location: zip code entry field
- Houston-only validation — reject zip codes outside Houston metro with clear message ("MVR is launching in Houston first")
- Zip codes will be used for proximity-based matching on the feed (pro networking first, consumer routing later)

**Profile Photo Handling:**
- Camera roll + take photo options available
- Circle crop UI after selection — pinch/zoom to frame face
- Photo required — no skip option during onboarding
- Large and prominent display on onboarding step (150-200px circle)
- Compress + resize before upload (target ~500x500, JPEG quality 80%)
- Photo uploads at the end with all other profile data (not immediately)
- Photo editable anytime after onboarding (tap to change, same picker + crop flow)
- Placeholder before selection: Claude's discretion (initials circle or generic icon)
- Photo picker UX (bottom sheet vs direct library): Claude's discretion

**Profile Display & Layout:**
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

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope.

</user_constraints>

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `expo-image-picker` | ~16.0.3 | Native image picker with crop | Official Expo module, provides `launchImageLibraryAsync` and `launchCameraAsync` with built-in `allowsEditing` crop UI |
| `expo-image-manipulator` | ~14.0.1 | Image resize and compression | Official Expo module, provides `manipulateAsync` for resize/crop/compress before upload |
| `@supabase/supabase-js` | ^2.95.3 | Profile data + storage upload | Already installed, handles database updates and file uploads to Storage |
| `react-hook-form` | ^7.71.1 | Form state management | Already installed, minimal re-renders, excellent for multi-step forms |
| `zod` | ^4.3.6 | Schema validation | Already installed, TypeScript-first validation for profile fields |
| `react-native-reanimated` | ~4.1.1 | Fade transitions between steps | Already installed, provides `FadeIn`/`FadeOut` for smooth step transitions |
| `expo-file-system` | ~19.0.21 | File URI handling | Already installed, reads image files as ArrayBuffer for Supabase upload |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@hookform/resolvers` | ^5.2.2 | React Hook Form + Zod integration | Already installed, connects Zod schemas to React Hook Form for per-step validation |
| `react-native-toast-message` | ^2.3.3 | Toast notifications | Already installed, for success/error feedback during profile save |
| `expo-image` | ~3.0.11 | Image display component | Already installed, optimized image rendering with caching for profile photos |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `expo-image-picker` with `allowsEditing` | `react-native-image-crop-picker` | Third-party library with more cropping features but adds native dependency complexity. Expo's built-in crop suffices for circular profile photos. |
| `expo-image-manipulator` | `expo-photo-manipulator` | More features (text overlay, watermarks) but overkill for profile photo resize. Stick with official Expo module. |
| `borderRadius` for circular image | `@react-native-masked-view/masked-view` or React Native Skia | Masked views provide advanced masking but add complexity. Simple `borderRadius: width/2` achieves circular shape. |
| Context API for multi-step state | Zustand or Redux | External state library adds dependency. React Context suffices for onboarding flow (5 steps, short-lived state). |
| Single database call per step | Batch all updates at end | Incremental saves risk partial profiles if user abandons flow. Saving at review screen ensures atomic profile creation. |

**Installation:**

```bash
# New packages needed
npx expo install expo-image-picker expo-image-manipulator

# Already installed (verify in package.json)
# expo-file-system, react-hook-form, zod, @hookform/resolvers, react-native-reanimated
```

## Architecture Patterns

### Recommended Project Structure

```
app/
├── (onboarding)/              # Onboarding flow group
│   ├── _layout.tsx            # Stack navigator with headerShown: false
│   ├── role.tsx               # Step 1: Role selection
│   ├── name.tsx               # Step 2: First + Last Name
│   ├── location.tsx           # Step 3: Zip code
│   ├── photo.tsx              # Step 4: Profile photo
│   ├── bio.tsx                # Step 5: Bio with 300 char limit
│   └── review.tsx             # Final review screen, saves profile
components/
├── profile/
│   ├── role-card.tsx          # Tappable role selection card
│   ├── profile-photo-picker.tsx # Camera roll + take photo UI
│   ├── profile-photo-display.tsx # Circular image display
│   └── profile-header.tsx     # Profile view header card
lib/
├── profile-context.tsx        # Context for onboarding form state
├── profile-service.ts         # Supabase profile CRUD operations
└── validation/
    └── profile-schemas.ts     # Zod schemas for profile fields
constants/
└── houston-zips.ts            # Houston metro zip code list
```

### Pattern 1: Multi-Step Onboarding with React Context

**What:** Store form state in React Context, allow forward/back navigation between steps, validate per-step with Zod, save all data at final review screen.

**When to use:** Multi-step flows where data must be collected across multiple screens before submission.

**Example:**

```typescript
// lib/profile-context.tsx
import { createContext, useContext, useState, ReactNode } from 'react';

interface ProfileFormData {
  role: string | null;
  firstName: string;
  lastName: string;
  zipCode: string;
  photoUri: string | null;
  bio: string;
}

interface ProfileContextType {
  formData: ProfileFormData;
  updateFormData: (data: Partial<ProfileFormData>) => void;
  resetFormData: () => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [formData, setFormData] = useState<ProfileFormData>({
    role: null,
    firstName: '',
    lastName: '',
    zipCode: '',
    photoUri: null,
    bio: '',
  });

  const updateFormData = (data: Partial<ProfileFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const resetFormData = () => {
    setFormData({
      role: null,
      firstName: '',
      lastName: '',
      zipCode: '',
      photoUri: null,
      bio: '',
    });
  };

  return (
    <ProfileContext.Provider value={{ formData, updateFormData, resetFormData }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfileForm() {
  const context = useContext(ProfileContext);
  if (!context) throw new Error('useProfileForm must be used within ProfileProvider');
  return context;
}
```

### Pattern 2: Image Upload to Supabase Storage

**What:** Convert image URI to ArrayBuffer, upload to Supabase Storage bucket, save public URL to database.

**When to use:** Uploading images from React Native to Supabase Storage.

**Example:**

```typescript
// lib/profile-service.ts
import { supabase } from './supabase';

export async function uploadProfilePhoto(uri: string, userId: string): Promise<string> {
  // Fetch image as ArrayBuffer
  const response = await fetch(uri);
  const arrayBuffer = await response.arrayBuffer();

  // Extract file extension
  const fileExt = uri.split('.').pop()?.toLowerCase() ?? 'jpeg';
  const fileName = `${userId}-${Date.now()}.${fileExt}`;
  const filePath = `${userId}/${fileName}`;

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from('avatars')
    .upload(filePath, arrayBuffer, {
      contentType: `image/${fileExt}`,
      upsert: true,
    });

  if (error) throw error;

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(data.path);

  return publicUrl;
}
```

### Pattern 3: Image Picker with Compression

**What:** Launch image picker with crop enabled, compress/resize selected image, return optimized URI.

**When to use:** Profile photo selection with circle crop and client-side optimization.

**Example:**

```typescript
// components/profile/profile-photo-picker.tsx
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';

export async function pickProfilePhoto(): Promise<string | null> {
  // Request permissions
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Camera roll permission required');
  }

  // Launch picker with crop enabled
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1], // Square crop for circular display
    quality: 1, // Max quality for manipulation
  });

  if (result.canceled) return null;

  const uri = result.assets[0].uri;

  // Resize and compress
  const manipulated = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 500, height: 500 } }],
    { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
  );

  return manipulated.uri;
}

export async function takeProfilePhoto(): Promise<string | null> {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Camera permission required');
  }

  const result = await ImagePicker.launchCameraAsync({
    allowsEditing: true,
    aspect: [1, 1],
    quality: 1,
  });

  if (result.canceled) return null;

  const uri = result.assets[0].uri;

  const manipulated = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 500, height: 500 } }],
    { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
  );

  return manipulated.uri;
}
```

### Pattern 4: Houston Zip Code Validation

**What:** Hardcode Houston metro zip codes, validate user input against list, reject non-Houston codes.

**When to use:** Geographic restriction for MVP launch area.

**Example:**

```typescript
// constants/houston-zips.ts
// Houston-The Woodlands-Sugar Land Metro Area zip codes
// Includes Harris, Fort Bend, Montgomery, Galveston, Brazoria counties
export const HOUSTON_METRO_ZIPS = new Set([
  // Harris County (partial list)
  '77001', '77002', '77003', '77004', '77005', '77006', '77007', '77008',
  '77009', '77010', '77011', '77012', '77013', '77014', '77015', '77016',
  '77017', '77018', '77019', '77020', '77021', '77022', '77023', '77024',
  '77025', '77026', '77027', '77028', '77029', '77030', '77031', '77032',
  // ... (add all 235 Houston metro zip codes)
  // Fort Bend County
  '77406', '77407', '77459', '77469', '77478', '77479', '77489', '77498',
  // Montgomery County
  '77301', '77302', '77303', '77304', '77316', '77318', '77354', '77356',
  // Galveston County
  '77510', '77517', '77539', '77546', '77565', '77568', '77573', '77590',
  // Add remaining zips...
]);

export function isHoustonZip(zip: string): boolean {
  return HOUSTON_METRO_ZIPS.has(zip);
}
```

### Pattern 5: Profile Completeness Gate

**What:** Check if profile is complete on app load, redirect to onboarding if incomplete, block tab navigation.

**When to use:** Required onboarding flows that must complete before app access.

**Example:**

```typescript
// app/_layout.tsx
function RootLayoutNav() {
  const { session, isLoading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!session) return;

    async function loadProfile() {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      setProfile(data);
      setProfileLoading(false);

      // Redirect to onboarding if profile incomplete
      if (!data?.display_name || !data?.role_category || !data?.avatar_url) {
        router.replace('/(onboarding)/role');
      }
    }

    loadProfile();
  }, [session]);

  if (isLoading || profileLoading) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" redirect={!!session} />
      <Stack.Screen name="(onboarding)" redirect={!session || !!profile?.display_name} />
      <Stack.Screen name="(tabs)" redirect={!session || !profile?.display_name} />
    </Stack>
  );
}
```

### Anti-Patterns to Avoid

- **Incremental database saves per step:** Risks partial profiles if user abandons. Save all data atomically at review screen.
- **Uploading full-resolution images:** Wastes bandwidth and storage. Always resize/compress client-side before upload.
- **Progress indicators on multi-step forms:** Creates pressure and counts steps. Let each screen stand alone for premium feel.
- **Nested KeyboardAvoidingView and ScrollView:** Causes scroll conflicts. Use KeyboardAvoidingView with `behavior="padding"` around ScrollView, not inside.
- **Using `base64` for image upload:** Inefficient encoding. Use ArrayBuffer with Supabase Storage `upload()` method.
- **Storing images in database as base64:** Use Supabase Storage buckets, store public URL in database `avatar_url` field.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Image cropping UI | Custom crop overlay with gesture handlers | `expo-image-picker` with `allowsEditing: true` | Built-in crop UI handles pinch/zoom, rotation, native feel. Custom implementation requires complex gesture math. |
| Image compression | Manual canvas resizing and quality reduction | `expo-image-manipulator` with `compress` option | Native modules handle compression efficiently. JavaScript-based compression is slow and unreliable. |
| Houston zip code database | API lookup or geocoding service | Hardcoded `Set` of 235 Houston metro zips | Static list sufficient for MVP. API adds latency, cost, and failure points. |
| File upload with retry logic | Custom fetch with exponential backoff | Supabase Storage SDK with built-in retry | SDK handles network failures, retries, and error states automatically. |
| Multi-step form state | URL params or local storage | React Context with in-memory state | Context persists during onboarding session, clears on completion. URL/storage adds complexity for temporary flow. |
| Profile photo placeholder | Random avatar generator API | Initials in colored circle | Initials are instant, work offline, no external dependency. Colored circle uses gold gradient for premium feel. |

**Key insight:** Image handling in React Native is deceptively complex—permission flows, URI schemes, file formats, compression quality, and upload encoding all have gotchas. Official Expo modules abstract these edge cases with battle-tested native implementations.

## Common Pitfalls

### Pitfall 1: Image Picker Permissions Not Requested

**What goes wrong:** `expo-image-picker` throws error if permissions not granted. Silent failures or permission denial crashes.

**Why it happens:** Developers forget to request permissions before launching picker. Permission status not checked.

**How to avoid:** Always call `requestMediaLibraryPermissionsAsync()` or `requestCameraPermissionsAsync()` before launching picker. Check status and show error if denied.

**Warning signs:** "User denied permissions" errors in Sentry, crashes on first photo selection attempt.

### Pitfall 2: Uploading Images Without Compression

**What goes wrong:** High-resolution photos (4-10MB) uploaded to Supabase Storage, slow uploads, quota exhaustion, poor UX.

**Why it happens:** Developers use raw image URI from picker without resize/compress step.

**How to avoid:** Always use `expo-image-manipulator` to resize to ~500x500 and compress to 0.8 quality (JPEG) before upload. Target 50-200KB file size.

**Warning signs:** Slow profile photo uploads, storage quota warnings, user complaints about loading times.

### Pitfall 3: Supabase Storage Upload with Blob Instead of ArrayBuffer

**What goes wrong:** Supabase `upload()` method expects ArrayBuffer, not Blob. Upload fails with "Invalid type" error.

**Why it happens:** Web patterns use Blob, but React Native uses ArrayBuffer. Fetch API returns ArrayBuffer with `res.arrayBuffer()`.

**How to avoid:** Fetch image URI, call `.arrayBuffer()` on response, pass result to `supabase.storage.from().upload()`.

**Warning signs:** "Invalid type" errors during upload, upload never completes, network requests show 400 errors.

### Pitfall 4: Profile Incomplete State Not Gated

**What goes wrong:** User completes some onboarding steps, force-closes app, returns to main app with partial profile. Causes crashes or broken UI.

**Why it happens:** No profile completeness check in root layout. User can navigate to tabs before profile is saved.

**How to avoid:** Check profile completeness in `_layout.tsx`, redirect to onboarding if `display_name`, `role_category`, or `avatar_url` are null. Block tab navigation until complete.

**Warning signs:** Crashes in Profile tab, missing data in feed, users with partial profiles in database.

### Pitfall 5: Houston Zip Code List Incomplete or Outdated

**What goes wrong:** Valid Houston zip codes rejected, user frustrated, can't complete onboarding.

**Why it happens:** Hardcoded list missing zip codes, especially newer developments or surrounding counties.

**How to avoid:** Use comprehensive Houston-The Woodlands-Sugar Land Metro Area list (235 zip codes). Include Harris, Fort Bend, Montgomery, Galveston, Brazoria counties. Source from official USPS or Census data.

**Warning signs:** User support tickets about zip code rejection, "MVR is launching in Houston first" message shown to Houston residents.

### Pitfall 6: Circular Image Not Rendering Correctly

**What goes wrong:** Image appears square or oval, not circular. `borderRadius` doesn't create circle.

**Why it happens:** `borderRadius` must equal half of width/height. If dimensions change or aspect ratio differs, circle breaks.

**How to avoid:** Use `borderRadius: imageSize / 2` where `imageSize` is constant (e.g., 150). Ensure image container is square (`width === height`). Use `overflow: 'hidden'` on container.

**Warning signs:** Oval or rounded-square images, inconsistent shape across devices, images not filling circle.

## Code Examples

Verified patterns from official sources:

### Launching Image Picker with Crop

```typescript
// Source: https://docs.expo.dev/versions/latest/sdk/imagepicker/
import * as ImagePicker from 'expo-image-picker';

async function selectPhoto() {
  // Request permissions first
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    alert('Sorry, we need camera roll permissions to make this work!');
    return;
  }

  // Launch picker with crop enabled
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true, // Enables crop UI
    aspect: [1, 1], // Square crop for circular display
    quality: 1, // Max quality for subsequent manipulation
  });

  if (!result.canceled) {
    const uri = result.assets[0].uri;
    // Process uri...
  }
}
```

### Resizing and Compressing Image

```typescript
// Source: https://docs.expo.dev/versions/latest/sdk/imagemanipulator/
import * as ImageManipulator from 'expo-image-manipulator';

async function optimizeImage(uri: string) {
  const manipulatedImage = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 500, height: 500 } }],
    {
      compress: 0.8,
      format: ImageManipulator.SaveFormat.JPEG,
    }
  );

  return manipulatedImage.uri;
}
```

### Uploading Image to Supabase Storage

```typescript
// Source: https://supabase.com/docs/guides/getting-started/tutorials/with-expo-react-native
import { supabase } from './supabase';

async function uploadAvatar(uri: string, userId: string) {
  // Convert URI to ArrayBuffer
  const response = await fetch(uri);
  const arrayBuffer = await response.arrayBuffer();

  // Generate file path
  const fileExt = uri.split('.').pop()?.toLowerCase() ?? 'jpeg';
  const fileName = `${userId}-${Date.now()}.${fileExt}`;
  const filePath = `${userId}/${fileName}`;

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from('avatars')
    .upload(filePath, arrayBuffer, {
      contentType: `image/${fileExt}`,
      upsert: true,
    });

  if (error) throw error;

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(data.path);

  return publicUrl;
}
```

### Profile Update with RLS

```typescript
// Update profile with Row Level Security
async function updateProfile(userId: string, profileData: ProfileData) {
  const { error } = await supabase
    .from('profiles')
    .update({
      display_name: profileData.displayName,
      role_category: profileData.role,
      service_area: profileData.zipCode,
      bio: profileData.bio,
      avatar_url: profileData.avatarUrl,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (error) throw error;
}
```

### Bio Text Input with Character Counter

```typescript
// Source: React Native TextInput docs
import { useState } from 'react';
import { TextInput, Text, View } from 'react-native';

function BioInput() {
  const [bio, setBio] = useState('');
  const MAX_LENGTH = 300;

  return (
    <View>
      <TextInput
        value={bio}
        onChangeText={setBio}
        maxLength={MAX_LENGTH}
        multiline
        numberOfLines={4}
        placeholder="Tell other pros about yourself..."
        style={{ height: 120 }}
      />
      <Text style={{ color: '#9A9A9A', fontSize: 13 }}>
        {bio.length} / {MAX_LENGTH}
      </Text>
    </View>
  );
}
```

### Circular Image Display

```typescript
// Simple borderRadius approach for circular profile photo
import { Image, View } from 'react-native';

function CircularAvatar({ uri, size = 150 }: { uri: string; size?: number }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        overflow: 'hidden',
      }}
    >
      <Image
        source={{ uri }}
        style={{ width: size, height: size }}
        resizeMode="cover"
      />
    </View>
  );
}
```

### Fade Transition Between Steps

```typescript
// Source: https://docs.swmansion.com/react-native-reanimated/
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

function OnboardingStep({ children }: { children: React.ReactNode }) {
  return (
    <Animated.View
      entering={FadeIn.duration(400)}
      exiting={FadeOut.duration(300)}
      style={{ flex: 1 }}
    >
      {children}
    </Animated.View>
  );
}
```

### Role Selection Card

```typescript
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

function RoleCard({ role, selected, onPress }: RoleCardProps) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      {selected ? (
        <LinearGradient
          colors={['#DFBD69', '#B5943A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.border}
        >
          <View style={styles.innerCard}>
            <Text style={styles.roleText}>{role}</Text>
          </View>
        </LinearGradient>
      ) : (
        <View style={[styles.border, styles.unselectedBorder]}>
          <View style={styles.innerCard}>
            <Text style={styles.roleText}>{role}</Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `ImagePicker.showImagePicker()` (deprecated) | `ImagePicker.launchImageLibraryAsync()` | ~2020 | New API provides better async/await support, clearer permission handling |
| Manual crop with `react-native-image-crop-picker` | `allowsEditing: true` in `expo-image-picker` | ~2021 | Built-in crop UI reduces dependencies, native feel |
| Base64 encoding for uploads | ArrayBuffer with `fetch()` | ~2022 | ArrayBuffer is more efficient, Supabase SDK expects binary data |
| Individual field updates to database | Batch update at review screen | ~2023 | Atomic profile creation prevents partial profiles, better UX |
| URL params for multi-step state | React Context for in-memory state | ~2024 | Context avoids URL clutter, simpler implementation for temporary flows |
| `AsyncStorage` for form state | React Context with no persistence | ~2025 | Onboarding flow is short-lived, no need to persist state across app restarts |

**Deprecated/outdated:**

- **`ImagePicker.showImagePicker()`:** Replaced by `launchImageLibraryAsync()` and `launchCameraAsync()` in expo-image-picker v9+
- **`expo-image-manipulator` `manipulate()`:** Synchronous method removed, use `manipulateAsync()` only
- **Storing images in database as base64:** Use Supabase Storage buckets with RLS policies, store public URLs in database
- **Custom multi-step form libraries:** React Context + Expo Router file-based routing suffices for most multi-step flows

## Open Questions

1. **Houston Metro Zip Code Completeness**
   - What we know: Houston-The Woodlands-Sugar Land MSA has 235 zip codes across 13 counties
   - What's unclear: Which zip codes should be included for "Houston metro" vs strict city limits? User might live in Katy (Fort Bend County) but serve Houston.
   - Recommendation: Use full 235 zip codes from metro area for MVP. Allow all Houston-area pros, optimize for network density over strict geography.

2. **Profile Photo Storage Bucket Policies**
   - What we know: Supabase Storage requires RLS policies on buckets. Authenticated users can upload.
   - What's unclear: Should profile photos be publicly readable or auth-only? Do pros need ability to delete old photos?
   - Recommendation: Make `avatars` bucket publicly readable (photos display in feed to all pros), restrict upload to authenticated users only, implement cascading delete when user deletes account.

3. **Profile Completeness Edge Case: Social Login**
   - What we know: Social login (Google/Apple) may provide name and photo from OAuth provider
   - What's unclear: Should we pre-fill name fields from OAuth? Should we skip photo step if OAuth provides one?
   - Recommendation: Pre-fill name fields from OAuth but allow editing. Always show photo step—let pro choose to keep OAuth photo or upload new one. This ensures consistency and gives pro control.

4. **Database Trigger vs Client-Side Profile Creation**
   - What we know: Supabase can auto-create profile row on user signup with Postgres trigger
   - What's unclear: Should we create empty profile row on signup or create entire profile on onboarding completion?
   - Recommendation: Use trigger to create empty profile row on signup (id, email, created_at). Update row on onboarding completion. This ensures profile row exists for RLS policies referencing `profiles` table.

## Sources

### Primary (HIGH confidence)

- [Expo ImagePicker Documentation](https://docs.expo.dev/versions/latest/sdk/imagepicker/) - Official API reference, crop configuration
- [Expo ImageManipulator Documentation](https://docs.expo.dev/versions/latest/sdk/imagemanipulator/) - Resize, compress, and format operations
- [Supabase User Management Tutorial](https://supabase.com/docs/guides/getting-started/tutorials/with-expo-react-native) - Profile photo upload pattern with ArrayBuffer
- [React Native TextInput Documentation](https://reactnative.dev/docs/textinput) - maxLength, character counter patterns
- [React Native Reanimated Entering/Exiting Animations](https://docs.swmansion.com/react-native-reanimated/docs/layout-animations/entering-exiting-animations/) - FadeIn/FadeOut for step transitions

### Secondary (MEDIUM confidence)

- [LogRocket: Building Multi-Step Form with React Hook Form and Zod](https://blog.logrocket.com/building-reusable-multi-step-form-react-hook-form-zod/) - Multi-step form patterns, Context usage
- [Supabase Row Level Security Best Practices](https://supabase.com/docs/guides/troubleshooting/rls-performance-and-best-practices-Z5Jjwv) - RLS policy patterns, performance optimization
- [Supabase User Management Documentation](https://supabase.com/docs/guides/auth/managing-user-data) - Postgres trigger for profile creation
- [Expo Keyboard Handling Guide](https://docs.expo.dev/guides/keyboard-handling/) - KeyboardAvoidingView best practices
- [City of Houston Zip Codes](https://www.houstontx.gov/zipcodes.html) - Official Houston zip code list
- [Houston Metro Area Zip Codes](https://www.bestplaces.net/find/zip.aspx?st=tx&msa=26420) - 235 zip codes in Houston-The Woodlands-Sugar Land MSA

### Tertiary (LOW confidence)

- [React Native Image Picker Community Patterns](https://dev.to/aaronksaunders/react-native-expo-image-picker-and-firebase-file-upload-2lg8) - Image picker patterns (not Firebase-specific, transferable to Supabase)
- [React Native Keyboard Controller](https://kirillzyusko.github.io/react-native-keyboard-controller/docs/api/components/keyboard-avoiding-view) - Modern keyboard handling library (optional enhancement)

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH - All libraries are official Expo modules or already installed in project
- Architecture: HIGH - Multi-step form pattern verified with official docs, Supabase Storage upload pattern from official tutorial
- Pitfalls: MEDIUM - Based on community experience and GitHub issues, not all documented in official guides
- Houston zip codes: MEDIUM - List sourced from official city website and metro area data, but exact boundaries may vary

**Research date:** 2026-02-09
**Valid until:** ~30 days (stable domain, mature libraries, unlikely to change rapidly)
