import React, { createContext, useContext, useState, ReactNode } from 'react';
import { RoleCategory } from '@/constants/roles';

export interface ProfileFormData {
  role: RoleCategory | null;
  firstName: string;
  lastName: string;
  zipCode: string;
  photoUri: string | null;
  bio: string;
}

interface ProfileContextValue {
  formData: ProfileFormData;
  updateFormData: (data: Partial<ProfileFormData>) => void;
  resetFormData: () => void;
}

const ProfileContext = createContext<ProfileContextValue | undefined>(undefined);

const initialFormData: ProfileFormData = {
  role: null,
  firstName: '',
  lastName: '',
  zipCode: '',
  photoUri: null,
  bio: '',
};

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [formData, setFormData] = useState<ProfileFormData>(initialFormData);

  const updateFormData = (data: Partial<ProfileFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const resetFormData = () => {
    setFormData(initialFormData);
  };

  return (
    <ProfileContext.Provider value={{ formData, updateFormData, resetFormData }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfileForm() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfileForm must be used within a ProfileProvider');
  }
  return context;
}
