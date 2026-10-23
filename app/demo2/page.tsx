"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { MilmoSimpleSystem } from "@/components/milmo-simple-system";
import { auth } from "@/lib/firebase";

export default function Demo2Page() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    if (!auth) {
      router.replace("/");
      return;
    }
    return onAuthStateChanged(auth, (user) => {
      if (user) setAuthenticated(true);
      else router.replace("/");
    });
  }, [router]);

  if (!authenticated) return <main className="flex min-h-screen items-center justify-center bg-[#f5f7f3]"><p className="text-sm font-bold text-slate-500">ログイン状態を確認しています...</p></main>;
  return <MilmoSimpleSystem />;
}
