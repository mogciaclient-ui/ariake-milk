import { notFound } from "next/navigation";
import { ProductDemoScreen } from "@/components/product-demo-screen";
import { getDemoScreen } from "@/lib/product-navigation";

export default async function MilmoScreenPage({ params }: { params: Promise<{ screen: string }> }) {
  const { screen } = await params;
  const definition = getDemoScreen("milmo", screen);
  if (!definition) notFound();
  return <ProductDemoScreen {...definition} />;
}
