import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { XIcon, FacebookIcon, InstagramIcon } from "./social-icons";
import { Logo } from "./logo";

const shopLinks = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Browse Menu" },
  { href: "/sign-in", label: "Sign In" },
  { href: "/sign-up", label: "Sign Up" },
];

const accountLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/profile", label: "Profile Settings" },
];

const socials = [
  { href: "https://x.com", label: "X (formerly Twitter)", Icon: XIcon },
  { href: "https://facebook.com", label: "Facebook", Icon: FacebookIcon },
  { href: "https://instagram.com", label: "Instagram", Icon: InstagramIcon },
];

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-card">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="max-w-xs">
          <Logo />
          <p className="mt-4 text-body-sm text-muted-foreground">
            Hot &amp; fresh wood-fired pizza, made with real dough and delivered
            to your door. Order in seconds, track every slice.
          </p>
        </div>

        <nav aria-label="Shop links">
          <h2 className="text-label text-muted-foreground">Shop</h2>
          <ul className="mt-4 space-y-2">
            {shopLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-body-sm text-foreground/80 hover:text-primary"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Account links">
          <h2 className="text-label text-muted-foreground">Account</h2>
          <ul className="mt-4 space-y-2">
            {accountLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-body-sm text-foreground/80 hover:text-primary"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <h2 className="mt-6 text-label text-muted-foreground">Follow us</h2>
          <ul className="mt-3 flex gap-3">
            {socials.map(({ href, label, Icon }) => (
              <li key={label}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  <Icon className="h-4 w-4" />
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="text-label text-muted-foreground">Contact</h2>
          <ul className="mt-4 space-y-3 text-body-sm text-foreground/80">
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
              <span>House 12, Road 5, Dhanmondi, Dhaka 1205</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 shrink-0 text-primary" aria-hidden />
              <a href="tel:+8801700000000" className="hover:text-primary">
                +880 1700-000000
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 shrink-0 text-primary" aria-hidden />
              <a href="mailto:hello@pizzahub.com" className="hover:text-primary">
                hello@pizzahub.com
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border py-5">
        <p className="mx-auto max-w-7xl px-4 text-center text-body-sm text-muted-foreground sm:px-6">
          © {new Date().getFullYear()} PizzaHub. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
