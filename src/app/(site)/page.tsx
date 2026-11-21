import Link from "next/link";
import { MenuCard, type MenuItem } from "@/components/menu/menu-card";
import { Hero } from "@/components/home/hero";
import { SectionHeading } from "@/components/section-heading";
import { buttonVariants } from "@/components/ui/button";

/** Demo content until the API is wired — shape matches the real payload. */
const FEATURED: MenuItem[] = [
  {
    _id: "1",
    itemName: "Margherita Classica",
    category: "Classic",
    price: 12.5,
    location: "Dhanmondi, Dhaka",
    description: "San Marzano tomato, fior di latte, fresh basil, olive oil.",
    images: [],
    vendor: { businessName: "Forno Vero" },
    ratingAvg: 4.6,
  },
  {
    _id: "2",
    itemName: "Pepperoni Rustico",
    category: "Meat Lovers",
    price: 15.0,
    location: "Gulshan, Dhaka",
    description: "Double pepperoni, aged mozzarella, oregano, chilli oil.",
    images: [],
    vendor: { businessName: "Slice House" },
    ratingAvg: 4.8,
  },
  {
    _id: "3",
    itemName: "Verdure Ortolano",
    category: "Vegetarian",
    price: 13.75,
    location: "Banani, Dhaka",
    description: "Roasted peppers, courgette, artichoke, basil pesto.",
    images: [],
    vendor: { businessName: "Green Oven" },
    ratingAvg: 4.4,
  },
];

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

export default function HomePage() {
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

          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURED.map((item) => (
              <MenuCard key={item._id} item={item} />
            ))}
          </div>
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
