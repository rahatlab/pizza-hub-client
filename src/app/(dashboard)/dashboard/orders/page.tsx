import { redirect } from "next/navigation";

/** Vendor/admin order management lives on the shared orders page. */
export default function DashboardOrdersRedirect() {
  redirect("/orders");
}
