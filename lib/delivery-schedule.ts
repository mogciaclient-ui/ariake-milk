export type DeliveryPattern = "weekly" | "biweekly" | "nth-weeks";

export type DeliverySchedule = {
  start: string;
  days: number[];
  deliveryPattern?: DeliveryPattern;
  nthWeeks?: number[];
};

const toLocalDate = (value: string) => {
  const [year, month, day] = value.replaceAll("/", "-").split("-").map(Number);
  return new Date(year, month - 1, day, 12);
};

export function isScheduledDelivery(contract: DeliverySchedule, isoDate: string) {
  const date = toLocalDate(isoDate);
  const start = toLocalDate(contract.start);
  if (date < start || !contract.days[date.getDay()]) return false;

  const pattern = contract.deliveryPattern ?? "weekly";
  if (pattern === "weekly") return true;
  if (pattern === "nth-weeks") {
    const weekOfMonth = Math.floor((date.getDate() - 1) / 7) + 1;
    return (contract.nthWeeks ?? []).includes(weekOfMonth);
  }

  const startWeek = new Date(start);
  startWeek.setDate(start.getDate() - start.getDay());
  const targetWeek = new Date(date);
  targetWeek.setDate(date.getDate() - date.getDay());
  const weekDifference = Math.round((targetWeek.getTime() - startWeek.getTime()) / 604_800_000);
  return weekDifference % 2 === 0;
}

export function deliveryPatternLabel(contract: DeliverySchedule) {
  if (contract.deliveryPattern === "biweekly") return "隔週";
  if (contract.deliveryPattern === "nth-weeks") return `第${(contract.nthWeeks ?? []).join("・")}週`;
  return "毎週";
}
