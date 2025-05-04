import { create } from "zustand";

interface AuthState {
  accessToken: string | null;
  setAccessToken: (setAccessToken: string) => void;
  resetAccessToken: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  accessToken: null,
  setAccessToken: (accessToken) => set({ accessToken }),
  resetAccessToken: () => set({ accessToken: null }),
}));

export const useAccessToken = () => useAuth((state) => state.accessToken);
export const useIsAuthenticated = () => useAuth((state) => !!state.accessToken);

export const useSetAccessToken = () => useAuth((state) => state.setAccessToken);
export const useResetAccessToken = () => useAuth((state) => state.resetAccessToken);
