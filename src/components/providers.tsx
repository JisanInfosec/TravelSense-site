"use client";

import { SWRConfig } from "swr";
import { AuthProvider } from "@/lib/auth";
import { fetcher } from "@/lib/api";
import { ToastProvider } from "./ui/toast";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig value={{ fetcher, revalidateOnFocus: false, shouldRetryOnError: false }}>
      <AuthProvider>
        <ToastProvider>{children}</ToastProvider>
      </AuthProvider>
    </SWRConfig>
  );
}
