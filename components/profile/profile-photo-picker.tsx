import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';

/**
 * Launch camera roll picker and return compressed 500x500 JPEG
 * @returns Local URI of compressed image, or null if cancelled
 * @throws Error if permission denied
 */
export async function pickProfilePhoto(): Promise<string | null> {
  // Request media library permissions
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Camera roll permission is required to choose a profile photo');
  }

  // Launch image picker
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: 'images',
    allowsEditing: true,
    aspect: [1, 1],
    quality: 1,
  });

  if (result.canceled) {
    return null;
  }

  // Resize and compress to 500x500 JPEG at 80% quality
  const manipulated = await ImageManipulator.manipulateAsync(
    result.assets[0].uri,
    [{ resize: { width: 500, height: 500 } }],
    {
      compress: 0.8,
      format: ImageManipulator.SaveFormat.JPEG,
    }
  );

  return manipulated.uri;
}

/**
 * Launch camera and return compressed 500x500 JPEG
 * @returns Local URI of compressed image, or null if cancelled
 * @throws Error if permission denied
 */
export async function takeProfilePhoto(): Promise<string | null> {
  // Request camera permissions
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Camera permission is required to take a profile photo');
  }

  // Launch camera
  const result = await ImagePicker.launchCameraAsync({
    allowsEditing: true,
    aspect: [1, 1],
    quality: 1,
  });

  if (result.canceled) {
    return null;
  }

  // Resize and compress to 500x500 JPEG at 80% quality
  const manipulated = await ImageManipulator.manipulateAsync(
    result.assets[0].uri,
    [{ resize: { width: 500, height: 500 } }],
    {
      compress: 0.8,
      format: ImageManipulator.SaveFormat.JPEG,
    }
  );

  return manipulated.uri;
}
