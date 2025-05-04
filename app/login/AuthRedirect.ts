"use client";

import { useIsAuthenticated } from "@/app/login/auth";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AuthRedirect({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const isAuthenticated = useIsAuthenticated();

  useEffect(() => {
    if (isAuthenticated && pathname === "/login") {
      router.push("/sandbox/profile");
    }
    if (!isAuthenticated && pathname !== "/login") {
      router.push("/login");
    }
  }, [isAuthenticated, router, pathname]);

  return children;
}
