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
  platformRoles?: { id: string; code: string; name: string }[];
  channelMemberships?: { channelId: string; channelName: string; channelType: string; roles: { id: string; code: string; name: string }[] }[];
  // `enrolledCourses` was removed from this type and from the backend `ProfileResponse` (SEC-3).
  // The learner's own enrollments are private learning state, not identity — read them with
  // `useMyEnrollmentsQuery` / `useMyEnrollmentForResourceQuery` from `@/domains/enrollment`.
  // Do not re-add it here: a cached copy on the auth store cannot be invalidated when an
  // enrollment changes, which is exactly why My Learning used to need a full page reload.
  // "Body of work" — content the user authored (backend: ProfileResponse.CourseDto/RoadmapDto/AuthoredWorkshopDto/CertificateDto)
  courses?: { id: string; title: string; description?: string; coverImageUrl?: string; status?: string; createdAt?: string }[];
  roadmaps?: { id: string; title: string; description?: string; status?: string; createdAt?: string }[];
  workshops?: { id: string; title: string; description?: string; coverImageUrl?: string; status?: string; createdAt?: string }[];
  certificates?: { name: string; issuer?: string; date?: string; idCode?: string }[];
  // Legacy fields (kept for fallback)
  roles?: any[];
  permissions?: string[];
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
