import { supabase } from '@/lib/supabase';
import { RoleCategory } from '@/constants/roles';
import type { Database } from '@/types/supabase';

// Use Supabase generated type as base, extending with new fields
export type Profile = Database['public']['Tables']['profiles']['Row'] & {
  first_name?: string | null;
  last_name?: string | null;
  zip_code?: string | null;
  onboarding_completed?: boolean;
};

/**
 * Fetch a user's profile from Supabase
 * @param userId - User's UUID from auth.users
 * @returns Profile object or null if not found
 */
export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows found - profile doesn't exist yet
      return null;
    }
    throw new Error(`Failed to fetch profile: ${error.message}`);
  }

  return data;
}

/**
 * Upload profile photo to Supabase Storage
 * @param uri - Local file URI from expo-image-picker
 * @param userId - User's UUID (used for folder path)
 * @returns Public URL of uploaded image
 */
export async function uploadProfilePhoto(uri: string, userId: string): Promise<string> {
  try {
    // Convert local URI to ArrayBuffer
    const response = await fetch(uri);
    if (!response.ok) {
      throw new Error('Failed to read image file');
    }
    const arrayBuffer = await response.arrayBuffer();

    // Generate unique file path: {userId}/{userId}-{timestamp}.jpeg
    const fileName = `${userId}-${Date.now()}.jpeg`;
    const filePath = `${userId}/${fileName}`;

    // Upload to avatars bucket
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, arrayBuffer, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (uploadError) {
      throw new Error(`Failed to upload photo: ${uploadError.message}`);
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to upload profile photo');
  }
}

/**
 * Save complete profile data (called at end of onboarding)
 * @param userId - User's UUID
 * @param data - Profile data including photo URI
 */
export async function saveProfile(
  userId: string,
  data: {
    firstName: string;
    lastName: string;
    role: RoleCategory;
    zipCode: string;
    bio: string;
    photoUri: string;
  }
): Promise<void> {
  try {
    // Upload photo first to get URL
    const avatarUrl = await uploadProfilePhoto(data.photoUri, userId);

    // Update profile with all data
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        first_name: data.firstName,
        last_name: data.lastName,
        display_name: `${data.firstName} ${data.lastName}`,
        role_category: data.role,
        zip_code: data.zipCode,
        bio: data.bio,
        avatar_url: avatarUrl,
        onboarding_completed: true,
      })
      .eq('id', userId);

    if (updateError) {
      throw new Error(`Failed to save profile: ${updateError.message}`);
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to save profile');
  }
}

/**
 * Update specific profile fields (post-onboarding edits)
 * @param userId - User's UUID
 * @param updates - Partial profile data to update
 */
export async function updateProfile(
  userId: string,
  updates: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>
): Promise<void> {
  const { error } = await supabase.from('profiles').update(updates).eq('id', userId);

  if (error) {
    throw new Error(`Failed to update profile: ${error.message}`);
  }
}
