"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import type { DemoUser } from "@/lib/demo";
import { clearDemoSession, getDemoSession } from "@/lib/demo-session";
import {
  DemoOfficeContext,
  demoOffices,
  type DemoOfficeId,
} from "@/lib/demo-office";
import { demoProducts } from "@/lib/product-navigation";
import { ProductLogo } from "@/components/product-logo";
import { MilmoLoadingScreen } from "@/components/milmo-loading-screen";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<DemoUser | null>(null);
  const [ready, setReady] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [officeId, setOfficeId] = useState<DemoOfficeId>("all");
  const [openProduct, setOpenProduct] = useState("");
  const office =
    demoOffices.find((item) => item.id === officeId) ?? demoOffices[0];
  const isSelmo = pathname.startsWith("/selmo/");
  const isCommo = pathname.startsWith("/commo/");

  useEffect(() => {
    const session = getDemoSession();
    if (!session) {
      router.replace("/");
      return;
    }
    const timer = window.setTimeout(() => {
      setUser(session);
      setReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [router]);

  function logout() {
    clearDemoSession();
    router.push("/");
  }

  if (!ready || !user) {
    return <MilmoLoadingScreen message="管理画面を準備中..." />;
  }

  return (
    <DemoOfficeContext.Provider value={{ office, setOfficeId }}>
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A]">
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-[#E5E7EB] bg-white transition-transform lg:translate-x-0 ${menuOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="relative flex h-20 items-center justify-center border-b border-[#E5E7EB] px-4">
          <Image src="/milmo.png" alt="" width={38} height={38} className="absolute left-6 rounded-xl" priority />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap font-logo text-[1.875rem] font-normal leading-none text-[#2563EB]">milmo<span className="text-[#EF4444]">.</span></span>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-3 py-5">
          <p className="px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">プロダクト</p>
          <nav className="mt-3 space-y-2">
            {demoProducts.map((product) => {
              const expanded = openProduct === product.id;
              const activeProduct = pathname.startsWith(`/${product.id}/`) || (product.id === "milmo" && pathname === "/dashboard");
              return <div key={product.id} className="overflow-hidden">
                <button onClick={() => setOpenProduct(expanded ? "" : product.id)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition ${activeProduct ? product.id === "selmo" ? "bg-yellow-50" : product.id === "commo" ? "bg-violet-50" : "bg-blue-50" : "hover:bg-slate-100"}`}>
                  {product.id === "selmo" ? <Image src="/selmo-logo.png" alt="selmo. ロゴ" width={24} height={24} className="h-6 w-6 shrink-0 object-contain" /> : product.id === "commo" ? <Image src="/commo.logo.png" alt="commo. ロゴ" width={24} height={24} className="h-6 w-6 shrink-0 object-contain" /> : <ProductLogo product={product} size={24} />}
                  <span className="whitespace-nowrap font-logo text-xs font-normal text-[#0F172A]">{product.name}<span className={product.dotColor}>.</span>{product.id !== "milmo" && `-${product.description}`}</span>
                  <svg className={`ml-auto h-4 w-4 shrink-0 text-slate-400 transition ${expanded ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6" /></svg>
                </button>
                {expanded && <div className="px-2 pb-3 pt-2">
                  {product.id === "milmo" && <div className="mb-3 space-y-0.5">{[["/dashboard", "ダッシュボード"], ["/customers", "顧客管理"], ["/orders", "注文管理"], ["/deliveries", "配送管理"]].map(([href, label]) => <Link key={href} href={href} onClick={() => setMenuOpen(false)} className={`block rounded-lg px-3 py-2 text-xs font-semibold transition ${pathname === href ? "bg-[#2563EB] text-white" : "text-slate-600 hover:bg-slate-100 hover:text-[#0F172A]"}`}>{label}</Link>)}</div>}
                  {product.groups.map((group, groupIndex) => <div key={`${group.label}-${groupIndex}`} className={["", "AIロープレ", "商談・テレアポ分析"].includes(group.label) ? "mt-0" : "mt-3 first:mt-1"}>{group.label && !["AIロープレ", "商談・テレアポ分析"].includes(group.label) && <p className="px-2 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">{group.label}</p>}<div className="space-y-0.5">{group.items.filter((item) => !["speaker-separation", "meeting-analysis", "roleplay-session", "scenarios", "roleplay-results"].includes(item.slug)).map((item) => {
                    const href = `/${product.id}/${item.slug}`;
                    const active = pathname === href;
                    return <Link key={item.slug} href={href} onClick={() => setMenuOpen(false)} className={`block rounded-lg px-3 py-2 text-xs font-semibold transition ${active ? product.id === "selmo" ? "bg-yellow-300 text-yellow-950" : product.id === "commo" ? "bg-violet-600 text-white" : "bg-[#2563EB] text-white" : "text-slate-600 hover:bg-slate-100 hover:text-[#0F172A]"}`}>{item.label}</Link>;
                  })}</div></div>)}
                </div>}
              </div>;
            })}
          </nav>
        </div>
        <div className="shrink-0 border-t border-[#E5E7EB] p-3">
          <div className="rounded-2xl bg-[#F8FAFC] p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2563EB]/10 text-sm font-bold text-[#2563EB]">{user.name.slice(0, 1)}</div>
              <div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{user.name}</p><p className="truncate text-xs text-slate-500">{user.roleLabel}・{user.office}</p></div>
            </div>
            <button onClick={logout} className="mt-3 w-full rounded-lg border border-[#E5E7EB] bg-white py-2 text-xs font-semibold text-slate-600 hover:border-[#EF4444]/30 hover:text-[#EF4444]">ログアウト</button>
          </div>
        </div>
      </aside>
      {menuOpen && <button aria-label="メニューを閉じる" className="fixed inset-0 z-30 bg-slate-900/30 lg:hidden" onClick={() => setMenuOpen(false)} />}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-[#E5E7EB] bg-white/95 px-5 backdrop-blur sm:px-8">
          <button aria-label="メニューを開く" onClick={() => setMenuOpen(true)} className="rounded-lg border border-[#E5E7EB] p-2 text-slate-600 lg:hidden"><svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 7h16M4 12h16M4 17h16" /></svg></button>
          <div className="hidden sm:block"><p className="text-xs font-semibold text-slate-400">{office.name}</p><p className="mt-1 text-sm font-bold">{isCommo ? "LINE顧客マーケティング" : isSelmo ? "AI営業支援" : "配送・営業・顧客管理システム"}</p></div>
          <div className="flex items-center gap-2 sm:gap-3">{isSelmo && <div className="hidden w-40 rounded-xl border border-yellow-200 bg-yellow-50/70 px-3 py-2 md:block"><div className="flex items-center justify-between text-[10px] font-bold"><span className="text-yellow-800">AI利用回数</span><span className="text-slate-700">20 / 100回</span></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white"><div className="h-full rounded-full bg-yellow-400" style={{ width: "20%" }} /></div></div>}<label className="hidden items-center gap-2 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] px-3 py-2 sm:flex"><span className="text-xs font-bold text-slate-400">表示</span><select aria-label="表示する営業所" value={officeId} onChange={(event) => setOfficeId(event.target.value as DemoOfficeId)} className="bg-transparent text-sm font-bold outline-none">{demoOffices.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><span className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700">デモ</span><button aria-label="通知" className="relative rounded-full border border-[#E5E7EB] p-2.5 text-slate-500"><span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-[#EF4444]" /><svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4" /></svg></button></div>
        </header>
        <main className="p-5 sm:p-8">{children}</main>
      </div>
    </div>
    </DemoOfficeContext.Provider>
  );
}
