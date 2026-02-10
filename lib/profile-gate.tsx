import { createContext, useContext } from 'react';

const ProfileGateContext = createContext<{ markProfileComplete: () => void }>({
  markProfileComplete: () => {},
});

export const ProfileGateProvider = ProfileGateContext.Provider;

export function useProfileGate() {
  return useContext(ProfileGateContext);
}
