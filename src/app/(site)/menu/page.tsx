"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

type MenuItem = {
  _id: string;
  itemName: string;
  category: string;
  description: string;
  price: number;
  location: string;
  images: string[];
  vendorId: string;
};

export default function BrowseMenuPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [sort, setSort] = useState("price_asc");

  const categories = [
    "Classic Pizzas",
    "Vegetarian",
    "Meat Lovers",
    "Specialty/Gourmet",
    "Sides & Appetizers",
    "Beverages & Desserts",
  ];

  useEffect(() => {
    loadItems();
  }, [search, category, location, sort]);

  async function loadItems() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (category) params.set("category", category);
      if (location) params.set("location", location);
      params.set("sort", sort);
      params.set("limit", "50");

      const data = await api.get<{ items: MenuItem[] }>(
        `/api/menu?${params.toString()}`
      );
      setItems(data.items ?? []);
    } catch (err) {
      toast.error("Failed to load menu");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-80 rounded-2xl" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="flex flex-col lg:flex-row gap-6 items-end mb-8">
        <div className="flex-1 lg:w-1/2 space-y-2">
          <Input
            placeholder="Search pizzas…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="w-full lg:w-1/4 space-y-2">
          <Select
            value={category}
            onValueChange={(v) => setCategory(v ?? "")}
          >
            <Select.Trigger>
              <Select.Value placeholder="Category" />
            </Select.Trigger>
            <Select.Content>
              {categories.map((c) => (
                <Select.Item key={c} value={c}>
                  {c}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
        </div>
        <div className="w-full lg:w-1/4 space-y-2">
          <Select value={sort} onValueChange={(v) => setSort(v ?? "price_asc")}>
            <Select.Trigger>
              <Select.Value placeholder="Sort by price" />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="price_asc">Price: Low → High</Select.Item>
              <Select.Item value="price_desc">Price: High → Low</Select.Item>
            </Select.Content>
          </Select>
        </div>
        <div className="w-full lg:w-1/4 space-y-2">
          <Input
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-body-lg text-muted-foreground">
            No menu items found. Try adjusting your search or filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <MenuCard key={item._id} item={item} />
          ))}
        </div>
      )}
    </section>
  );
}

function MenuCard({ item }: { item: MenuItem }) {
  return (
    <Card className="card-shape h-full flex flex-col overflow-hidden border-border hover:shadow-md transition-shadow">
      <div className="relative h-48 overflow-hidden">
        <img
          src={item.images?.[0] || "/placeholder.svg"}
          alt={item.itemName}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="p-4 flex flex-col flex-1">
        <div className="flex justify-between items-start">
          <h3 className="text-h3 font-semibold">{item.itemName}</h3>
          <span className="text-label font-semibold text-primary">
            ৳{item.price}
          </span>
        </div>
        <p className="text-body-sm text-muted-foreground mt-2 line-clamp-2">
          {item.description}
        </p>
        <div className="mt-4 flex items-center gap-2 text-body-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="h-3 w-3 rounded-full bg-primary" /> {item.category}
          </span>
          <span>•</span>
          <span>{item.location}</span>
        </div>
      </div>
    </Card>
  );
}
