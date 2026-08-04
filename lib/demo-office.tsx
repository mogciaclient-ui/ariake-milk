"use client";

import { createContext, useContext } from "react";

export type DemoOfficeId = "all" | "head-office" | "yoshinogari";

export type DemoOffice = {
  id: DemoOfficeId;
  name: string;
  shortName: string;
};

export const demoOffices: DemoOffice[] = [
  { id: "all", name: "全営業所", shortName: "全体" },
  { id: "head-office", name: "本社営業所", shortName: "本社" },
  { id: "yoshinogari", name: "吉野ヶ里営業所", shortName: "吉野ヶ里" },
];

export const DemoOfficeContext = createContext<{
  office: DemoOffice;
  setOfficeId: (id: DemoOfficeId) => void;
}>({
  office: demoOffices[0],
  setOfficeId: () => undefined,
});

export function useDemoOffice() {
  return useContext(DemoOfficeContext);
}
