import { DashboardLayout } from "@/components/layout/dashboard-layout";

/** Dashboard shell — wraps every dashboard page with sidebar + navbar. */
export default function DashboardLayoutRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
