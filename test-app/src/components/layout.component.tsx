"use client";

import { ReactNode } from "react";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {children}
      <div className="fixed bottom-4 right-4 z-40">
        {/* eslint-disable-next-line @typescript-eslint/no-var-requires */}
        {require("@/components/theme-toggle").ThemeToggle()}
      </div>
    </div>
  );
}


