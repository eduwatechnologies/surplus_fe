"use client";

import { Provider } from "react-redux";
import { ToastProvider } from "@/components/common/toast";
import { store } from "@/redux/store";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <ToastProvider />
      {children}
    </Provider>
  );
}
