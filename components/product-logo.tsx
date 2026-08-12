"use client";

import Image from "next/image";
import { useState } from "react";
import type { DemoProduct } from "@/lib/product-navigation";

const logoPaths: Record<DemoProduct["id"], string> = {
  milmo: "/logos/milmo.png",
  selmo: "/logos/selmo.png",
  commo: "/commo.logo.png",
};

export function ProductLogo({ product, size = 28 }: { product: DemoProduct; size?: number }) {
  const [imageFailed, setImageFailed] = useState(false);

  if (!imageFailed) {
    return <Image src={logoPaths[product.id]} alt={`${product.name}. ロゴ`} width={size} height={size} className="shrink-0 object-contain" onError={() => setImageFailed(true)} />;
  }

  const colors = product.id === "milmo"
    ? "bg-blue-50 text-[#2563EB]"
    : product.id === "selmo"
      ? "bg-yellow-50 text-yellow-500"
      : "bg-violet-50 text-violet-500";

  return <span aria-label={`${product.name}. 仮アイコン`} className={`flex shrink-0 items-center justify-center rounded-lg ${colors}`} style={{ width: size, height: size }}>
    {product.id === "milmo" && <svg className="h-3/5 w-3/5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 3h6v3l2 3v11H7V9l2-3V3Z" /><path d="M9 6h6M8 11h8" /></svg>}
    {product.id === "selmo" && <svg className="h-3/5 w-3/5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 3a7 7 0 0 0-4 12.7V20l4-2 4 2v-4.3A7 7 0 0 0 12 3Z" /><path d="m9.5 10 1.6 1.6 3.4-3.4" /></svg>}
    {product.id === "commo" && <svg className="h-3/5 w-3/5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 15a4 4 0 0 1-4 4H8l-5 2 1.5-4A6 6 0 0 1 3 13V8a4 4 0 0 1 4-4h9a4 4 0 0 1 4 4v7Z" /><path d="M8 10h8M8 14h5" /></svg>}
  </span>;
}
