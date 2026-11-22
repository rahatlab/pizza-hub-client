import { redirect } from "next/navigation";

export default function DashboardUsersPage() {
  redirect("/admin/users");
}