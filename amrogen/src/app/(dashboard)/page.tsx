import type { Metadata } from "next";
import { DashboardScreen } from "@/components/dashboard/dashboard-screen";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Revenue Command Center",
  description: "Monitor and launch AmroGen autonomous sales campaigns in real time.",
};

export default function DashboardPage() {
  return <DashboardScreen />;
}

