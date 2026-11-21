import * as React from "react";
import { cn } from "@/lib/utils";

type Tone = "primary" | "secondary" | "tertiary" | "neutral" | "gold" | "outline";

const TONES: Record<Tone, string> = {
  primary: "bg-primary-soft text-primary border-primary/20",
  secondary: "bg-secondary-soft text-secondary-strong border-secondary/25",
  tertiary: "bg-tertiary-soft text-tertiary border-tertiary/25",
  neutral: "bg-sunken text-muted border-line",
  gold: "bg-gold/15 text-gold border-gold/30",
  outline: "bg-transparent text-neutral border-line-strong",
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

export function Badge({ className, tone = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        TONES[tone],
        className,
      )}
      {...props}
    />
  );
}
