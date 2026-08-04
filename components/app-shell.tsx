"use client";

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

function NavIcon({ name }: { name: string }) {
  const paths: Record<string, ReactNode> = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
    truck: <><path d="M3 6h11v11H3zM14 10h4l3 3v4h-7z" /><circle cx="7" cy="18" r="2" /><circle cx="18" cy="18" r="2" /></>,
    bag: <><path d="M6 8h12l1 13H5L6 8Z" /><path d="M9 10V6a3 3 0 0 1 6 0v4" /></>,
    chart: <><path d="M4 19V9M10 19V5M16 19v-7M22 19H2" /></>,
    message: <path d="M21 15a4 4 0 0 1-4 4H8l-5 3 1.5-5A7 7 0 0 1 3 13V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8Z" />,
    checklist: <><path d="M9 6h11M9 12h11M9 18h11" /><path d="m3 6 1 1 2-2M3 12l1 1 2-2M3 18l1 1 2-2" /></>,
  };
  return <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<DemoUser | null>(null);
  const [ready, setReady] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [officeId, setOfficeId] = useState<DemoOfficeId>("all");
  const currentProduct = pathname.split("/")[1];
  const [openProduct, setOpenProduct] = useState(
    ["milmo", "selmo", "commo"].includes(currentProduct)
      ? currentProduct
      : "milmo",
  );
  const office =
    demoOffices.find((item) => item.id === officeId) ?? demoOffices[0];

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
    return <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC]"><span className="h-8 w-8 animate-spin rounded-full border-2 border-[#2563EB]/20 border-t-[#2563EB]" /></div>;
  }

  return (
    <DemoOfficeContext.Provider value={{ office, setOfficeId }}>
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A]">
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-[#E5E7EB] bg-white transition-transform lg:translate-x-0 ${menuOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-20 items-center border-b border-[#E5E7EB] px-6">
          <span className="font-logo text-[2rem] font-bold tracking-[-0.03em] text-[#2563EB]">milmo<span className="text-[#EF4444]">.</span></span>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-3 py-5">
          <p className="px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">プロダクト</p>
          <nav className="mt-3 space-y-2">
            {demoProducts.map((product) => {
              const expanded = openProduct === product.id;
              const activeProduct = pathname.startsWith(`/${product.id}/`) || (product.id === "milmo" && pathname === "/dashboard");
              return <div key={product.id} className="overflow-hidden">
                <button onClick={() => setOpenProduct(expanded ? "" : product.id)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition ${activeProduct ? "bg-blue-50" : "hover:bg-slate-100"}`}>
                  <ProductLogo product={product} size={24} />
                  <span className={`whitespace-nowrap font-logo ${product.id === "milmo" ? "text-xl font-bold text-[#2563EB]" : "text-xs font-normal text-[#0F172A]"}`}>{product.name}<span className={product.dotColor}>.</span>{product.id !== "milmo" && `-${product.description}`}</span>
                  <svg className={`ml-auto h-4 w-4 shrink-0 text-slate-400 transition ${expanded ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6" /></svg>
                </button>
                {expanded && <div className="px-2 pb-3 pt-2">
                  {product.id === "milmo" && <Link href="/dashboard" onClick={() => setMenuOpen(false)} className={`mb-2 block rounded-lg px-3 py-2 text-xs font-semibold transition ${pathname === "/dashboard" ? "bg-[#2563EB] text-white" : "text-slate-600 hover:bg-slate-100 hover:text-[#0F172A]"}`}>ダッシュボード</Link>}
                  {product.groups.map((group) => <div key={group.label} className="mt-3 first:mt-1"><p className="px-2 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">{group.label}</p><div className="space-y-0.5">{group.items.map((item) => {
                    const href = `/${product.id}/${item.slug}`;
                    const active = pathname === href;
                    return <Link key={item.slug} href={href} onClick={() => setMenuOpen(false)} className={`block rounded-lg px-3 py-2 text-xs font-semibold transition ${active ? "bg-[#2563EB] text-white" : "text-slate-600 hover:bg-slate-100 hover:text-[#0F172A]"}`}>{item.label}</Link>;
                  })}</div></div>)}
                </div>}
              </div>;
            })}
            <Link href="/feature-review" onClick={() => setMenuOpen(false)} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-xs font-semibold transition ${pathname === "/feature-review" ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-100"}`}><NavIcon name="checklist" />検討結果メモ</Link>
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
          <div className="hidden sm:block"><p className="text-xs font-semibold text-slate-400">{office.name}</p><p className="mt-1 text-sm font-bold">配送・営業・顧客管理システム</p></div>
          <div className="flex items-center gap-2 sm:gap-3"><label className="hidden items-center gap-2 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] px-3 py-2 sm:flex"><span className="text-xs font-bold text-slate-400">表示</span><select aria-label="表示する営業所" value={officeId} onChange={(event) => setOfficeId(event.target.value as DemoOfficeId)} className="bg-transparent text-sm font-bold outline-none">{demoOffices.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><span className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700">デモ</span><button aria-label="通知" className="relative rounded-full border border-[#E5E7EB] p-2.5 text-slate-500"><span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-[#EF4444]" /><svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4" /></svg></button></div>
        </header>
        <main className="p-5 sm:p-8">{children}</main>
      </div>
    </div>
    </DemoOfficeContext.Provider>
  );
}
