import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";

/**
 * Public site chrome — navbar on top, footer at the bottom.
 * Route group `(site)` keeps it off /dashboard, /admin and the auth pages,
 * which supply their own chrome.
 */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
