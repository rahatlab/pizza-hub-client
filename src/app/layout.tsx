import type { Metadata } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import { AuthProvider } from "@/components/auth/auth-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

/**
 * Two families, one system:
 *  - Fraunces   → every heading, in BOTH themes (assignment requires a
 *                 consistent heading style across sections)
 *  - Jakarta    → body, labels, UI
 * `display: swap` so text paints before the webfont lands.
 */
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  axes: ["opsz"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: {
    default: "PizzaHub — Hot & fresh pizza delivered",
    template: "%s · PizzaHub",
  },
  description:
    "Discover local pizza shops, browse their menus and order hot, fresh pizza delivered to your door.",
  openGraph: {
    title: "PizzaHub",
    description: "Pizza ordering & delivery platform",
    type: "website",
    siteName: "PizzaHub",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${fraunces.variable} ${jakarta.variable} h-full`}
    >
      <body className="min-h-full flex flex-col antialiased">
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
