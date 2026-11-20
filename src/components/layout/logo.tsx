import Link from "next/link";
import { Pizza } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  /** Hide the wordmark (used where only the icon fits). */
  iconOnly?: boolean;
}

/** Single source of truth for the brand mark — navbar & footer share it. */
export function Logo({ className, iconOnly = false }: LogoProps) {
  return (
    <Link
      href="/"
      aria-label="PizzaHub home"
      className={cn(
        "flex items-center gap-2 font-heading text-xl font-extrabold tracking-tight text-foreground",
        className
      )}
    >
      <span
        aria-hidden
        className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground"
      >
        <Pizza className="h-5 w-5" />
      </span>
      {!iconOnly && (
        <span>
          Pizza<span className="text-primary">Hub</span>
        </span>
      )}
    </Link>
  );
}
