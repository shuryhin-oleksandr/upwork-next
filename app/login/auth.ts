import { create } from "zustand";

interface Tokens {
  accessToken: string;
  refreshToken: string;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  // TODO: Remove unuesd code
  // setAccessToken: (token: string) => void;
  // setRefreshToken: (token: string) => void;
  setTokens: (tokens: Tokens) => void;
  resetTokens: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  accessToken: null,
  refreshToken: null,
  // TODO: Remove unuesd code
  // setAccessToken: (token: string) => set({ accessToken: token }),
  // setRefreshToken: (token: string) => set({ refreshToken: token }),
  setTokens: (tokens: Tokens) => set(tokens),
  resetTokens: () => set({ accessToken: null, refreshToken: null }),
}));

// TODO: rationalise
export const useAccessToken = () => useAuth((state) => state.accessToken);
export const useRefreshToken = () => useAuth((state) => state.refreshToken);
export const useIsAuthenticated = () =>
  useAuth((state) => !!state.accessToken && !!state.refreshToken);

export const useSetTokens = () => useAuth((state) => state.setTokens);
export const useResetTokens = () => useAuth((state) => state.resetTokens);

export const auth = useAuth.getState();
