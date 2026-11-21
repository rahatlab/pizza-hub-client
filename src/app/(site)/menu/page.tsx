"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Search,
  SlidersHorizontal,
  Star,
  X,
} from "lucide-react";
import { MenuCard } from "@/components/menu/menu-card";
import { SectionHeading } from "@/components/section-heading";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

interface ApiMenuItem {
  id: string;
  itemName: string;
  description: string;
  category: string;
  price: number;
  location: string;
  images: string[];
  ratingAvg: number;
  ratingCount: number;
  reviewCount: number;
}

interface MenuItem {
  _id: string;
  itemName: string;
  description: string;
  category: string;
  price: number;
  location: string;
  images: string[];
  ratingAvg: number;
  ratingCount: number;
  reviewCount: number;
}

interface Category {
  name: string;
  count: number;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "priceAsc", label: "Price: low to high" },
  { value: "priceDesc", label: "Price: high to low" },
  { value: "nameAsc", label: "Name: A–Z" },
  { value: "rating", label: "Top rated" },
];

export default function MenuPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);

  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Debounce the search input so we don't hammer the API on every keystroke.
  useEffect(() => {
    const handle = window.setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => window.clearTimeout(handle);
  }, [search]);

  // Reset to page 1 whenever the filters change.
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, category, minPrice, maxPrice, sort]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const params = new URLSearchParams();
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (category) params.set("category", category);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    params.set("sort", sort);
    params.set("page", String(page));
    params.set("limit", "12");

    api<{ items: ApiMenuItem[]; pagination: Pagination }>(`/api/menu?${params.toString()}`, {
      auth: false,
    })
      .then((data) => {
        if (cancelled) return;
        setItems(data.items.map((item) => ({ ...item, _id: item.id })));
        setPagination(data.pagination);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Could not load the menu");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, category, minPrice, maxPrice, sort, page]);

  useEffect(() => {
    api<Category[]>("/api/menu/categories", { auth: false })
      .then(setCategories)
      .catch(() => undefined);
  }, []);

  const hasFilters =
    Boolean(debouncedSearch || category || minPrice || maxPrice) || sort !== "newest";

  function clearFilters() {
    setSearch("");
    setCategory("");
    setMinPrice("");
    setMaxPrice("");
    setSort("newest");
  }

  const totalLabel = useMemo(() => {
    if (!pagination) return "";
    if (pagination.total === 0) return "No items found";
    const start = (pagination.page - 1) * pagination.limit + 1;
    const end = Math.min(pagination.page * pagination.limit, pagination.total);
    return `Showing ${start}–${end} of ${pagination.total}`;
  }, [pagination]);

  return (
    <div className="ph-section">
      <div className="ph-container space-y-8">
        <SectionHeading
          eyebrow="The menu"
          title="Browse every slice in town"
          description="Search by name, filter by category or price, and sort the way you like. Every item is approved by our team before it goes live."
        />

        {/* Search + sort row */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-faint"
              aria-hidden
            />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search pizzas, sides, drinks…"
              aria-label="Search menu items"
              className="h-11 w-full rounded-full border border-line bg-raised pl-10 pr-4 text-sm text-neutral outline-none transition-colors placeholder:text-faint focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-faint hover:text-neutral"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-muted" aria-hidden />
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              aria-label="Sort menu items"
              className="h-11 rounded-full border border-line bg-raised px-4 text-sm text-neutral outline-none focus:border-primary"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Category chips */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setCategory("")}
            className={cn(
              "shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
              category === ""
                ? "border-primary bg-primary-soft text-primary"
                : "border-line bg-raised text-muted hover:text-neutral",
            )}
          >
            All ({categories.reduce((sum, c) => sum + c.count, 0)})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.name}
              type="button"
              onClick={() => setCategory(cat.name)}
              className={cn(
                "shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                category === cat.name
                  ? "border-primary bg-primary-soft text-primary"
                  : "border-line bg-raised text-muted hover:text-neutral",
              )}
            >
              {cat.name} ({cat.count})
            </button>
          ))}
        </div>

        {/* Price range */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-muted">Price</span>
          <input
            type="number"
            min={0}
            step="0.5"
            value={minPrice}
            onChange={(event) => setMinPrice(event.target.value)}
            placeholder="Min"
            aria-label="Minimum price"
            className="h-10 w-24 rounded-full border border-line bg-raised px-3 text-sm text-neutral outline-none focus:border-primary"
          />
          <span className="text-muted">–</span>
          <input
            type="number"
            min={0}
            step="0.5"
            value={maxPrice}
            onChange={(event) => setMaxPrice(event.target.value)}
            placeholder="Max"
            aria-label="Maximum price"
            className="h-10 w-24 rounded-full border border-line bg-raised px-3 text-sm text-neutral outline-none focus:border-primary"
          />
          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-sm font-medium text-primary hover:underline"
            >
              Clear filters
            </button>
          )}
          <span className="ml-auto text-sm text-muted">{totalLabel}</span>
        </div>

        {/* Results */}
        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="ph-card overflow-hidden">
                <div className="aspect-[4/3] animate-pulse bg-sunken" />
                <div className="space-y-2 p-4">
                  <div className="h-4 w-2/3 animate-pulse rounded bg-sunken" />
                  <div className="h-3 w-1/2 animate-pulse rounded bg-sunken" />
                  <div className="h-4 w-1/3 animate-pulse rounded bg-sunken" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="ph-card p-8 text-center">
            <p className="text-sm text-muted">{error}</p>
            <button
              type="button"
              onClick={() => setPage((p) => p)}
              className="mt-4 text-sm font-medium text-primary hover:underline"
            >
              Try again
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="ph-card flex flex-col items-center justify-center px-6 py-16 text-center">
            <span aria-hidden className="text-4xl">
              🍕
            </span>
            <h2 className="mt-4 font-display text-2xl font-semibold text-neutral">
              Nothing matches
            </h2>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
              Try a different search, widen the price range, or clear the filters.
            </p>
            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-6 inline-flex h-11 items-center rounded-full bg-primary px-6 text-sm font-semibold text-white hover:bg-primary-strong"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((item) => (
              <MenuCard key={item._id} item={item} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <nav
            aria-label="Pagination"
            className="flex items-center justify-center gap-2"
          >
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="grid h-10 w-10 place-items-center rounded-full border border-line bg-raised text-neutral transition-colors hover:border-line-strong disabled:opacity-40"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm text-muted">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={page >= pagination.totalPages}
              className="grid h-10 w-10 place-items-center rounded-full border border-line bg-raised text-neutral transition-colors hover:border-line-strong disabled:opacity-40"
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </nav>
        )}
      </div>
    </div>
  );
}
