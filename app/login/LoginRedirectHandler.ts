"use client";

import { emitter, REDIRECT_TO_LOGIN } from "@/app/login/events";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginRedirectHandler({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  useEffect(() => {
    const handler = () => router.push("/login");
    emitter.on(REDIRECT_TO_LOGIN, handler);
    return () => {
      emitter.off(REDIRECT_TO_LOGIN, handler);
    };
  }, [router]);

  return children;
}
