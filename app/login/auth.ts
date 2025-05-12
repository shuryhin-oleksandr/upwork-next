import { create, StoreApi, UseBoundStore } from "zustand";

interface AuthState {
  accessToken: string | null;
  isAuthenticated: boolean | undefined;
}

interface AuthAction {
  setLoggedIn: (accessToken: string) => void;
  setLoggedOut: () => void;
}


type WithSelectors<S> = S extends { getState: () => infer T }
  ? S & { use: { [K in keyof T]: () => T[K] } }
  : never;

const createSelectors = <S extends UseBoundStore<StoreApi<object>>>(_store: S) => {
  const store = _store as WithSelectors<typeof _store>;
  store.use = {};
  for (const k of Object.keys(store.getState())) {
    (store.use as any)[k] = () => store((s) => s[k as keyof typeof s]);
  }

  return store;
};

export const useAuthStoreBase = create<AuthState & AuthAction>((set) => ({
  accessToken: null,
  isAuthenticated: undefined,
  setLoggedIn: (accessToken) => set({ accessToken, isAuthenticated: true }),
  setLoggedOut: () => set({ accessToken: null, isAuthenticated: false }),
}));

export const useAuthStore = createSelectors(useAuthStoreBase);

export const getAuthState = () => useAuthStore.getState();
