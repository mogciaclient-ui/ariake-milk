import { notFound } from "next/navigation";
import { CommoOperationsScreen } from "@/components/commo-operations-screen";
import { getDemoScreen } from "@/lib/product-navigation";

export default async function CommoScreenPage({ params }: { params: Promise<{ screen: string }> }) {
  const { screen } = await params;
  const definition = getDemoScreen("commo", screen);
  if (!definition) notFound();
  return <CommoOperationsScreen screen={definition.screen} />;
}
