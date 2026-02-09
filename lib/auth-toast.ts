import Toast from 'react-native-toast-message';

/**
 * Show error toast for authentication failures
 */
export function showAuthError(error: Error) {
  Toast.show({
    type: 'error',
    position: 'top',
    text1: 'Authentication Error',
    text2: error.message,
    visibilityTime: 4000,
  });
}

/**
 * Show success toast for authentication actions
 */
export function showAuthSuccess(message: string) {
  Toast.show({
    type: 'success',
    position: 'top',
    text1: 'Success',
    text2: message,
    visibilityTime: 3000,
  });
}
