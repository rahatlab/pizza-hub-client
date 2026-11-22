import Link from "next/link";

const SOCIAL = [
  { href: "https://x.com/pizzahub", label: "X (Twitter)", icon: "𝕏" },
  { href: "https://facebook.com/pizzahub", label: "Facebook", icon: "f" },
  { href: "https://instagram.com/pizzahub", label: "Instagram", icon: "◎" },
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
          <div className="mt-5 flex items-center gap-3">
            {SOCIAL.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="grid h-9 w-9 place-items-center rounded-full border border-line bg-raised text-sm font-bold text-neutral transition-colors hover:border-primary hover:text-primary"
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>

        <nav aria-label="Order">
          <h3 className="text-sm font-semibold text-neutral">Order</h3>
          <ul className="mt-4 space-y-2.5">
            <li><Link href="/menu" className="text-sm text-muted transition-colors hover:text-neutral">Browse menu</Link></li>
            <li><Link href="/menu?sort=price-asc" className="text-sm text-muted transition-colors hover:text-neutral">Offers</Link></li>
            <li><Link href="/orders" className="text-sm text-muted transition-colors hover:text-neutral">My orders</Link></li>
          </ul>
        </nav>

        <nav aria-label="For pizzerias">
          <h3 className="text-sm font-semibold text-neutral">For pizzerias</h3>
          <ul className="mt-4 space-y-2.5">
            <li><Link href="/sign-up" className="text-sm text-muted transition-colors hover:text-neutral">Start selling</Link></li>
            <li><Link href="/dashboard/upgrade" className="text-sm text-muted transition-colors hover:text-neutral">Plans &amp; pricing</Link></li>
            <li><Link href="/sign-up" className="text-sm text-muted transition-colors hover:text-neutral">How it works</Link></li>
          </ul>
        </nav>

        <div>
          <h3 className="text-sm font-semibold text-neutral">Contact</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-muted">
            <li>support@pizzahub.com</li>
            <li>+880 1700 000000</li>
            <li>Dhanmondi, Dhaka, Bangladesh</li>
          </ul>
        </div>
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