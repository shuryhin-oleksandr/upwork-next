import { create } from "zustand";

interface AuthState {
  accessToken: string | null;
  isAuthenticated: boolean | undefined;
  setLoggedIn: (accessToken: string) => void;
  setLoggedOut: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  accessToken: null,
  isAuthenticated: undefined,
  setLoggedIn: (accessToken) => set({ accessToken, isAuthenticated: true }),
  setLoggedOut: () => set({ accessToken: null, isAuthenticated: false }),
}));

export const useAccessToken = () => useAuth((state) => state.accessToken);
export const useSetLoggedIn = () => useAuth((state) => state.setLoggedIn);
export const useSetLoggedOut = () => useAuth((state) => state.setLoggedOut);

export const useIsAuthenticated = () => useAuth((state) => state.isAuthenticated);

// TODO: fix naming
export const getAuth = () => useAuth.getState();
