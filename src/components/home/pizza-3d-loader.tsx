"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * WebGL cannot render during SSR, so the canvas is loaded client-only.
 * The skeleton keeps the hero from collapsing while it downloads.
 */
export const Pizza3D = dynamic(
  () => import("./pizza-3d").then((mod) => mod.Pizza3D),
  {
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative aspect-square w-4/5">
          <Skeleton className="absolute inset-0 rounded-full" />
        </div>
      </div>
    ),
  },
);
