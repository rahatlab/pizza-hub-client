"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

/**
 * Class-based dark mode. Mounted in the root layout with
 * `attribute="class"` and `suppressHydrationWarning` on <html>.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
