"use client";

import { emitter, REDIRECT_TO_LOGIN } from "@/app/login/events";
import { useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function UserLogoutHandler({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();

  useEffect(() => {
    const handler = () => {
      queryClient.cancelQueries();
      queryClient.clear();
      if (pathname !== "/login") router.push("/login");
    };
    emitter.on(REDIRECT_TO_LOGIN, handler);
    return () => {
      emitter.off(REDIRECT_TO_LOGIN, handler);
    };
  }, [router, pathname, queryClient]);

  return children;
}
