import { notFound } from "next/navigation";
import { ProductDemoScreen } from "@/components/product-demo-screen";
import { getDemoScreen } from "@/lib/product-navigation";

export default async function SelmoScreenPage({ params }: { params: Promise<{ screen: string }> }) {
  const { screen } = await params;
  const definition = getDemoScreen("selmo", screen);
  if (!definition) notFound();
  return <ProductDemoScreen {...definition} />;
}
