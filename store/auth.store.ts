import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  fullName: string;
  username?: string;
  mobileNumber?: string;
  gender?: string;
  address?: string;
  socialLinks?: string[];
  preferences?: string[];
  workingAt?: string;
  onboardingCompleted?: boolean;
  provider?: string;
  createdAt?: string;
  avatarUrl?: string;
  emailVerified: boolean;
  roles: any[];
  permissions: string[];
  bio?: string;
  linkedinUrl?: string;
  githubUrl?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  status: AuthStatus;
  setAuth: (user: User, accessToken: string) => void;
  updateUser: (user: Partial<User>) => void;
  clearAuth: () => void;
  setStatus: (status: AuthStatus) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      status: 'loading',
      setAuth: (user, accessToken) =>
        set({ user, accessToken, status: 'authenticated' }),
      updateUser: (updatedUser) =>
        set((state) => ({ user: state.user ? { ...state.user, ...updatedUser } : null })),
      clearAuth: () =>
        set({ user: null, accessToken: null, status: 'unauthenticated' }),
      setStatus: (status) => set({ status }),
    }),
    {
      name: 'arcade-auth-storage',
      partialize: (state) => ({ user: state.user, accessToken: state.accessToken }),
    }
  )
);
