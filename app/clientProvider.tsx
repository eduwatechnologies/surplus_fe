"use client";

import { useEffect } from "react";
import { Provider } from "react-redux";
import { ToastProvider } from "@/components/common/toast";
import { store } from "@/redux/store";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    const onLoad = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    };

    window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, []);

  return (
    <Provider store={store}>
      <ToastProvider />
      {children}
    </Provider>
  );
}
