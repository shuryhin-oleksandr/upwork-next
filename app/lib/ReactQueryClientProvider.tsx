"use client";

import { useIsAuthenticated } from "@/app/login/auth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { AxiosError } from "axios";
import React from "react";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount: number, error: Error) => {
        if ((error as AxiosError)?.response?.status === 401) {
          return false;
        }
        return failureCount < 3;
      },
    },
  },
});

export default function ReactQueryClientProvider({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useIsAuthenticated();

  React.useEffect(() => {
    if (isAuthenticated === false) {
      queryClient.resetQueries();
    }
  }, [isAuthenticated]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
