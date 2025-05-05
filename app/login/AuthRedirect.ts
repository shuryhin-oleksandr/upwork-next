"use client";

import { useAuth } from "@/app/login/auth";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AuthRedirect({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAuth.use.isAuthenticated();

  useEffect(() => {
    if (isAuthenticated === true && pathname === "/login") {
      router.push("/");
    }
    if (isAuthenticated === false && pathname !== "/login") {
      router.push("/login");
    }
  }, [isAuthenticated, router, pathname]);

  return children;
}
