import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * The ONE button used across the whole site — home hero, item details,
 * dashboards and dialogs all render this, so the style never drifts.
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-white shadow-[0_6px_16px_-8px_var(--ph-primary)] hover:bg-primary-strong",
        secondary:
          "bg-secondary text-neutral hover:bg-secondary-strong",
        outline:
          "border border-line-strong bg-transparent text-neutral hover:bg-sunken",
        ghost: "text-neutral hover:bg-sunken",
        inverted:
          "bg-neutral text-surface hover:opacity-90",
        destructive:
          "bg-primary text-white hover:bg-primary-strong",
        premium:
          "bg-gold text-neutral hover:brightness-105",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-9 px-4 text-[0.8125rem]",
        md: "h-11 px-6",
        lg: "h-12 px-8 text-[0.9375rem]",
        icon: "h-10 w-10 rounded-full p-0",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  ),
);
Button.displayName = "Button";

export { buttonVariants };
