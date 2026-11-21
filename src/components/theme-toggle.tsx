"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

type Mode = "light" | "dark" | "system";

const ORDER: Mode[] = ["light", "dark", "system"];

const LABEL: Record<Mode, string> = {
  light: "Light",
  dark: "Dark",
  system: "System",
};

/**
 * Server HTML must be deterministic, so everything derived from
 * next-themes (the resolved mode, the icon, the aria-label) is rendered
 * only AFTER mount. Until then the button shows a neutral label — this is
 * what keeps React from reporting a hydration mismatch.
 */
export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const current = (theme ?? "system") as Mode;
  const next = ORDER[(ORDER.indexOf(current) + 1) % ORDER.length]!;

  const label = mounted ? `Switch theme, currently ${LABEL[current]}` : "Switch theme";
  const title = mounted ? `Theme: ${LABEL[current]} — click for ${LABEL[next]}` : "Switch theme";

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      aria-label={label}
      title={title}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-line bg-raised text-neutral transition-colors hover:bg-sunken"
    >
      {mounted ? (
        <ThemeIcon mode={current} resolved={resolvedTheme ?? "light"} />
      ) : (
        <span className="h-4 w-4" aria-hidden />
      )}
    </button>
  );
}

function ThemeIcon({ mode, resolved }: { mode: Mode; resolved: string }) {
  const active = mode === "system" ? resolved : mode;

  if (active === "dark") {
    return (
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}
