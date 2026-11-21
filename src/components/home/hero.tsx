import Link from "next/link";
import { Pizza3D } from "@/components/home/pizza-3d-loader";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";

const STATS = [
  { value: "4.2/5", label: "average rating" },
  { value: "28 min", label: "average delivery" },
  { value: "120+", label: "local pizzerias" },
];

/**
 * Hero — the single bold moment on the page. Left column carries the
 * headline and one CTA; right column is reserved for the 3D pizza.
 * Deliberately NOT a stat-bar-plus-gradient hero.
 */
export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-line bg-surface">
      {/* warm radial glow behind the pizza */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 top-0 h-[36rem] w-[36rem] rounded-full opacity-60 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, color-mix(in srgb, var(--ph-secondary) 38%, transparent) 0%, transparent 68%)",
        }}
      />

      <div className="ph-container relative grid items-center gap-12 py-16 md:py-24 lg:grid-cols-[1.05fr_1fr]">
        <div>
          <Badge tone="secondary" className="mb-5">
            Wood-fired, delivered hot
          </Badge>

          <h1>
            Hot &amp; fresh pizza,
            <br />
            at your door in 28 minutes
          </h1>

          <p className="mt-6 text-lg">
            Browse menus from independent pizzerias near you, compare prices, and
            order the pie you actually want — no phone calls, no waiting on hold.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/menu" className={buttonVariants({ size: "lg" })}>
              Explore the menu
            </Link>
            <Link href="/sign-up" className={buttonVariants({ variant: "outline", size: "lg" })}>
              Sell your pizza
            </Link>
          </div>

          <dl className="mt-12 flex flex-wrap gap-x-10 gap-y-6 border-t border-line pt-8">
            {STATS.map((stat) => (
              <div key={stat.label}>
                <dt className="order-2 text-sm text-muted">{stat.label}</dt>
                <dd className="font-display text-3xl font-semibold text-neutral">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* 3D pizza — the one bold moment on the page */}
        <div className="relative aspect-square w-full max-w-xl justify-self-center">
          <Pizza3D className="absolute inset-0" />
        </div>
      </div>
    </section>
  );
}
