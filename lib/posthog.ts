import { usePostHog } from 'posthog-react-native';

export const useAnalytics = () => {
  const posthog = usePostHog();

  const identifyUser = (userId: string, traits?: Record<string, string | number | boolean | null>): void => {
    posthog.identify(userId, traits);
  };

  const trackEvent = (eventName: string, properties?: Record<string, string | number | boolean | null>): void => {
    posthog.capture(eventName, properties);
  };

  const resetUser = (): void => {
    posthog.reset();
  };

  return { identifyUser, trackEvent, resetUser };
};
