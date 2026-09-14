import { notFound } from "next/navigation";
import { ContractPerformanceScreen } from "@/components/contract-performance-screen";
import { MilmoOperationsScreen } from "@/components/milmo-operations-screen";
import { MilmoCoreScreen } from "@/components/milmo-core-screens";
import { getDemoScreen } from "@/lib/product-navigation";

export default async function MilmoScreenPage({ params }: { params: Promise<{ screen: string }> }) {
  const { screen } = await params;
  const definition = getDemoScreen("milmo", screen);
  if (!definition) notFound();
  if (screen === "contract-performance") return <ContractPerformanceScreen />;
  if (["customers", "master-products", "invoice-management", "barcode-payment", "daily-reports", "route-staff", "unpaid", "bank-transfer", "master-closing-date", "master-contracted-bank", "document-settings"].includes(screen)) return <MilmoCoreScreen screen={screen} />;
  return <MilmoOperationsScreen screen={definition.screen} />;
}
