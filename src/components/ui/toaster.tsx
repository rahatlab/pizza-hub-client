"use client";

import { useTheme } from "next-themes";
import { Toaster as SonnerToaster } from "sonner";

/** Toast host, themed with the rest of the app. */
export function Toaster() {
  const { resolvedTheme } = useTheme();

  return (
    <SonnerToaster
      theme={resolvedTheme === "dark" ? "dark" : "light"}
      position="top-center"
      richColors
      closeButton
      offset={16}
      toastOptions={{
        classNames: {
          toast: "rounded-xl border border-line font-sans",
        },
      }}
    />
  );
}
