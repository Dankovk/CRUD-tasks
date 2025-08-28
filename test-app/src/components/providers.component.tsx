"use client";

import { PropsWithChildren, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";

export function Providers({ children }: PropsWithChildren) {
  const [client] = useState(() => new QueryClient());
  return (
    <ThemeProvider>
      <QueryClientProvider client={client}>
        {children}
        <Toaster position="top-right" richColors closeButton duration={3000} />
        {/* <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" /> */}
      </QueryClientProvider>
    </ThemeProvider>
  );
}


