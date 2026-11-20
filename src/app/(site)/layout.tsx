import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

/** Public site shell — navbar + footer wrap every public page (Part 1). */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
