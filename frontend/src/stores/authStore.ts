import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { AuthSessionUser } from "../services/authService";

interface AuthState {
  isAuthenticated: boolean;
  user: AuthSessionUser | null;
  hasHydrated: boolean;
  setAuthenticated: (user: AuthSessionUser) => void;
  updateUser: (user: AuthSessionUser) => void;
  clearAuth: () => void;
  setHydrated: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      hasHydrated: false,
      setAuthenticated: (user) => set({ isAuthenticated: true, user }),
      updateUser: (user) => set({ user }),
      clearAuth: () => set({ isAuthenticated: false, user: null }),
      setHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: "orderiq-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);
