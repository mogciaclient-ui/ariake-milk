import { notFound } from "next/navigation";
import { ContractPerformanceScreen } from "@/components/contract-performance-screen";
import { MilmoOperationsScreen } from "@/components/milmo-operations-screen";
import { getDemoScreen } from "@/lib/product-navigation";

export default async function MilmoScreenPage({ params }: { params: Promise<{ screen: string }> }) {
  const { screen } = await params;
  const definition = getDemoScreen("milmo", screen);
  if (!definition) notFound();
  if (screen === "contract-performance") return <ContractPerformanceScreen />;
  return <MilmoOperationsScreen screen={definition.screen} />;
}
