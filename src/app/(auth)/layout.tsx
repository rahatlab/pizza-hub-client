import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

/**
 * Auth shell: a brand panel on the left, the form on the right.
 * Dashboards and the marketing site never share this chrome.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <aside className="relative hidden overflow-hidden bg-raised lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,var(--ph-secondary-soft),transparent_55%),radial-gradient(circle_at_80%_75%,var(--ph-primary-soft),transparent_50%)]" />
        <div className="absolute inset-0 bg-[repeating-linear-gradient(135deg,transparent_0_18px,color-mix(in_srgb,var(--ph-border)_55%,transparent)_18px_19px)] opacity-40" />

        <div className="relative flex h-full flex-col justify-between p-12">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <span
              aria-hidden
              className="grid h-10 w-10 place-items-center rounded-full bg-primary text-lg text-white"
            >
              🍕
            </span>
            <span className="font-display text-2xl font-semibold text-neutral">PizzaHub</span>
          </Link>

          <div className="max-w-md">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-line bg-surface/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
              Local pizza, delivered hot
            </p>
            <h1 className="text-balance text-4xl font-semibold leading-tight text-neutral">
              One account. Every slice in your neighbourhood.
            </h1>
            <p className="mt-4 text-base text-muted">
              Order from independent pizzerias, track every step from the oven to your
              door, and keep your favourites one tap away.
            </p>

            <dl className="mt-10 grid grid-cols-3 gap-4">
              {[
                { value: "120+", label: "Pizzerias" },
                { value: "28 min", label: "Avg. delivery" },
                { value: "4.8", label: "Guest rating" },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl border border-line bg-surface/70 p-3">
                  <dt className="text-xs font-medium text-faint">{stat.label}</dt>
                  <dd className="font-display text-xl font-semibold text-neutral">{stat.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <p className="text-sm text-faint">
            © {new Date().getFullYear()} PizzaHub — built for the neighbourhood.
          </p>
        </div>
      </aside>

      <main className="flex flex-col bg-surface">
        <div className="flex items-center justify-between px-5 py-4 sm:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-neutral lg:invisible"
          >
            <span aria-hidden>←</span> Back to site
          </Link>
          <ThemeToggle />
        </div>

        <div className="flex flex-1 items-start justify-center px-5 pb-14 pt-2 sm:px-8 lg:items-center lg:pt-0">
          <div className="w-full max-w-[27rem]">{children}</div>
        </div>
      </main>
    </div>
  );
}
