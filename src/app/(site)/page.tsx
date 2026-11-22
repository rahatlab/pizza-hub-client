import Link from "next/link";
import { MenuCard, type MenuItem } from "@/components/menu/menu-card";
import { Hero } from "@/components/home/hero";
import { Reveal } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/section-heading";
import { buttonVariants } from "@/components/ui/button";

async function getFeatured(): Promise<MenuItem[]> {
  const base = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000";
  try {
    const res = await fetch(`${base}/api/menu?limit=6&sort=newest`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const data = (await res.json()) as { data?: { items?: MenuItem[] } };
    return data?.data?.items ?? [];
  } catch {
    return [];
  }
}

const CATEGORIES = [
  { name: "Classic Pizzas", emoji: "🍕", count: 18 },
  { name: "Vegetarian", emoji: "🥗", count: 12 },
  { name: "Meat Lovers", emoji: "🥓", count: 14 },
  { name: "Specialty / Gourmet", emoji: "👨‍🍳", count: 9 },
  { name: "Sides & Appetizers", emoji: "🧀", count: 11 },
  { name: "Beverages & Desserts", emoji: "🥤", count: 8 },
];

const WHY = [
  {
    title: "Wood-fired in 90 seconds",
    body: "Every pizzeria on PizzaHub runs a 450°C oven, so the base arrives crisp rather than steamed in the box.",
    icon: "🔥",
  },
  {
    title: "Only independent shops",
    body: "No chains. You order from the neighbourhood place that has been shaping dough by hand for years.",
    icon: "🏠",
  },
  {
    title: "Live order tracking",
    body: "Watch your order move from placed to accepted to on its way, with the timestamps to prove it.",
    icon: "📍",
  },
  {
    title: "Prices with no surprises",
    body: "The price on the card is the price you pay. Delivery fees are shown before you confirm.",
    icon: "💳",
  },
];

const STEPS = [
  { step: "Find your pizzeria", body: "Search by name, filter by area and browse only what is approved and open." },
  { step: "Build your order", body: "Pick a delivery date, add an address and any special instructions." },
  { step: "Track it to the door", body: "The shop accepts, and you follow every status change in real time." },
];

export default async function HomePage() {
  const featured = await getFeatured();
  return (
    <>
      <Hero />

      {/* ---- Featured ---- */}
      <section className="ph-section bg-surface">
        <div className="ph-container">
          <SectionHeading
            title="Curated artisan pizzas"
            description="Approved and active menus from pizzerias near you, updated live."
            action={
              <Link href="/menu" className={buttonVariants({ variant: "outline" })}>
                Browse all
              </Link>
            }
          />

          <Reveal>
            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.length === 0 ? (
              <p className="col-span-full text-center text-sm text-muted">
                No approved menu items yet — check back soon.
              </p>
            ) : (
              featured.map((item) => <MenuCard key={item._id} item={item} />)
            )}
          </div>
          </Reveal>
        </div>
      </section>

      {/* ---- Categories ---- */}
      <section className="ph-section bg-sunken">
        <div className="ph-container">
          <SectionHeading
            title="Explore by category"
            description="Six ways in — from a plain margherita to a full dessert spread."
          />

          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {CATEGORIES.map((category) => (
              <Link
                key={category.name}
                href={`/menu?category=${encodeURIComponent(category.name)}`}
                className="ph-card group flex flex-col items-center gap-3 p-6 text-center transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lifted"
              >
                <span className="text-3xl" aria-hidden>
                  {category.emoji}
                </span>
                <span className="text-sm font-semibold leading-snug text-neutral">
                  {category.name}
                </span>
                <span className="text-xs text-faint">{category.count} items</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Why choose (required) ---- */}
      <section className="ph-section bg-surface">
        <div className="ph-container">
          <SectionHeading
            title="Why order through PizzaHub"
            description="Four things we refuse to compromise on."
          />

          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {WHY.map((item) => (
              <div key={item.title} className="ph-card p-6">
                <span className="text-2xl" aria-hidden>
                  {item.icon}
                </span>
                <h3 className="mt-4 text-base">{item.title}</h3>
                <p className="mt-2 text-sm">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- How it works (one optional section) ---- */}
      <section className="ph-section bg-sunken">
        <div className="ph-container">
          <SectionHeading title="How PizzaHub works" description="Three steps, start to finish." />

          <ol className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
            {STEPS.map((step, index) => (
              <li key={step.step} className="ph-card relative p-6">
                <span className="font-display text-5xl font-semibold text-primary/25">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 text-base">{step.step}</h3>
                <p className="mt-2 text-sm">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}
