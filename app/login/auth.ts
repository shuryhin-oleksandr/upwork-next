import { create } from "zustand";

interface AuthState {
  accessToken: string | null;
  isAuthenticated: boolean | undefined;
  setAccessToken: (setAccessToken: string) => void;
  resetAccessToken: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  accessToken: null,
  isAuthenticated: undefined,
  setAccessToken: (accessToken) => set({ accessToken, isAuthenticated: true }),
  resetAccessToken: () => set({ accessToken: null, isAuthenticated: false }),
}));

export const useAccessToken = () => useAuth((state) => state.accessToken);
export const useSetAccessToken = () => useAuth((state) => state.setAccessToken);
export const useResetAccessToken = () => useAuth((state) => state.resetAccessToken);

export const useIsAuthenticated = () => useAuth((state) => state.isAuthenticated);

// TODO: fix naming
export const getAuth = () => useAuth.getState();
