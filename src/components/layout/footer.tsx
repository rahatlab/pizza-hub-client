import Link from "next/link";

const COLUMNS = [
  {
    title: "Order",
    links: [
      { href: "/menu", label: "Browse menu" },
      { href: "/menu?sort=price-asc", label: "Offers" },
      { href: "/track", label: "Track an order" },
    ],
  },
  {
    title: "For pizzerias",
    links: [
      { href: "/sign-up", label: "Start selling" },
      { href: "/pricing", label: "Plans & pricing" },
      { href: "/about", label: "How it works" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/contact", label: "Contact" },
      { href: "/privacy", label: "Privacy" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-line bg-sunken">
      <div className="ph-container grid gap-10 py-14 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <Link href="/" className="flex items-center gap-2">
            <span
              aria-hidden
              className="grid h-9 w-9 place-items-center rounded-full bg-primary text-lg leading-none text-white"
            >
              🍕
            </span>
            <span className="font-display text-xl font-semibold text-neutral">PizzaHub</span>
          </Link>
          <p className="mt-4 text-sm">
            Independent pizzerias, one platform. Order wood-fired pizza from the
            shop around the corner and follow it to your door.
          </p>
        </div>

        {COLUMNS.map((column) => (
          <nav key={column.title} aria-label={column.title}>
            <h3 className="text-sm font-semibold text-neutral">{column.title}</h3>
            <ul className="mt-4 space-y-2.5">
              {column.links.map((link) => (
                <li key={link.href + link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted transition-colors hover:text-neutral"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="border-t border-line">
        <div className="ph-container flex flex-col items-center justify-between gap-2 py-5 text-xs text-faint sm:flex-row">
          <p>© {new Date().getFullYear()} PizzaHub. All rights reserved.</p>
          <p>Made for Assignment 9 — Category 009.</p>
        </div>
      </div>
    </footer>
  );
}
