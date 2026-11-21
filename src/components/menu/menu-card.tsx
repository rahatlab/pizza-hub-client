import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn, formatPrice } from "@/lib/utils";

export interface MenuItem {
  _id: string;
  itemName: string;
  category: string;
  price: number;
  location: string;
  description?: string;
  images: string[];
  status?: "pending" | "approved" | "rejected" | "inactive";
  vendor?: { businessName?: string; name?: string };
  ratingAvg?: number;
  ratingCount?: number;
}

interface Props {
  item: MenuItem;
  className?: string;
}

/**
 * The single card used on Home, Browse Menu and vendor dashboards.
 * Equal height (h-full + flex-col) and a fixed image ratio so a grid of
 * these always lines up — an explicit assignment requirement.
 */
export function MenuCard({ item, className }: Props) {
  const image = item.images?.[0];
  const vendorName = item.vendor?.businessName || item.vendor?.name || "Local pizzeria";

  return (
    <article
      className={cn(
        "ph-card group flex h-full flex-col overflow-hidden transition-all duration-200",
        "hover:-translate-y-1 hover:shadow-lifted",
        className,
      )}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-sunken">
        {image ? (
          <Image
            src={image}
            alt={item.itemName}
            fill
            sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl" aria-hidden>
            🍕
          </div>
        )}

        <div className="absolute left-3 top-3 flex gap-2">
          <Badge tone="primary">{item.category}</Badge>
        </div>

        {typeof item.ratingAvg === "number" && item.ratingAvg > 0 && (
          <Badge tone="gold" className="absolute right-3 top-3">
            ★ {item.ratingAvg.toFixed(1)}
          </Badge>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <h3 className="line-clamp-1 text-base font-semibold">{item.itemName}</h3>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
            <PinIcon />
            <span className="line-clamp-1">{item.location}</span>
          </p>
        </div>

        {item.description && (
          <p className="line-clamp-2 text-sm">{item.description}</p>
        )}

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-line pt-4">
          <div>
            <p className="truncate text-xs text-faint">{vendorName}</p>
            <p className="font-display text-xl font-semibold text-primary">
              {formatPrice(item.price)}
            </p>
          </div>
          <Link
            href={`/menu/${item._id}`}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            View details
          </Link>
        </div>
      </div>
    </article>
  );
}

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}
