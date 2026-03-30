"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

const IdleLogout = ({ children }: { children: React.ReactNode }) => {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const logoutDelay = 10 * 60 * 1000; // 10 minutes
  // const logoutDelay = 10 * 1000; // 10 seconds

  const router = useRouter();

  const logout = () => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("userToken");
      if (token) {
        localStorage.removeItem("userToken");
        router.push("/auth/signin");
      }
    }
  };

  const resetTimer = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(logout, logoutDelay);
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];

    events.forEach((event) => window.addEventListener(event, resetTimer));

    resetTimer();

    return () => {
      events.forEach((event) => window.removeEventListener(event, resetTimer));
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return <>{children}</>;
};

export default IdleLogout;
