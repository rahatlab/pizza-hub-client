"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PizzaHeroSlider } from "@/components/home/pizza-hero-slider";
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

export default function HomePage() {
  const [featured, setFeatured] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeatured();
  }, []);

  async function loadFeatured() {
    try {
      const params = new URLSearchParams({ status: "approved", limit: "6" });
      const data = await api.get<{ items: MenuItem[] }>(`/api/menu?${params}`);
      setFeatured(data.items ?? []);
    } catch {
      /* featured optional */
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-16"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-label text-primary mb-4">
              Hot &amp; fresh, every time
            </p>
            <h1 className="text-display mb-6">
              Pizza, delivered the way it should be.
            </h1>
            <p className="text-body-lg mb-8 max-w-xl">
              Wood-fired dough, real cheese and toppings you can see. Browse
              the menu, order in seconds and track your pizza from oven to
              doorstep.
            </p>
            <Button asChild className="w-auto btn-pill">
              <Link href="/menu">Explore Pizza Menu</Link>
            </Button>
          </div>
          <div className="relative h-[400px] w-full lg:w-[400px]">
            <PizzaHeroSlider />
          </div>
        </div>
      </motion.div>

      {/* Featured */}
      <section className="mb-16">
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-h2">Featured This Week</h2>
          <Link href="/menu" className="text-body-sm text-primary hover:underline">
            View all →
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-80 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((item) => (
              <Card key={item._id} className="card-shape h-full overflow-hidden">
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={item.images?.[0] || "/placeholder.svg"}
                    alt={item.itemName}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-h3 font-semibold">{item.itemName}</h3>
                  <p className="text-body-sm text-muted-foreground line-clamp-2">
                    {item.description}
                  </p>
                  <div className="mt-4 flex justify-between items-center">
                    <span className="text-label font-semibold text-primary">
                      ৳{item.price}
                    </span>
                    <Link href={`/menu/${item._id}`} className="text-body-sm hover:underline">
                      View Details
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Why Choose PizzaHub */}
      <section className="mb-16">
        <h2 className="text-h2 mb-8">Why Choose PizzaHub?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: Pizza,
              title: "Wood-Fired Dough",
              desc: "Fresh dough baked in wood-fired ovens for authentic taste.",
            },
            {
              icon: Star,
              title: "Top Quality",
              desc: "Real cheese and premium toppings on every pizza.",
            },
            {
              icon: Bike,
              title: "Fast Delivery",
              desc: "Hot pizza delivered to your door in minutes.",
            },
          ].map((feature) => (
            <Card key={feature.title} className="card-shape p-6">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <feature.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-h3 font-semibold mb-2">{feature.title}</h3>
              <p className="text-body-sm text-muted-foreground">{feature.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section>
        <h2 className="text-h2 mb-8">How PizzaHub Works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { step: "1", title: "Browse Menu", desc: "Explore our wood-fired pizzas and sides." },
            { step: "2", title: "Place Order", desc: "Choose delivery date, address and confirm." },
            { step: "3", title: "Track &amp; Enjoy", desc: "Watch your order status and rate every slice." },
          ].map((step) => (
            <Card key={step.title} className="card-shape p-6">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center mb-4">
                <span className="font-semibold">{step.step}</span>
              </div>
              <h3 className="text-h3 font-semibold mb-2">{step.title}</h3>
              <p className="text-body-sm text-muted-foreground">{step.desc}</p>
            </Card>
          ))}
        </div>
      </section>
    </section>
  );
}
