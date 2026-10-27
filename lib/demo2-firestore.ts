import { doc, getDoc, runTransaction, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

const demo2StateRef = () => {
  if (!db) throw new Error("Firebase is not configured");
  return doc(db, "demo2", "shared-state");
};

export type Demo2FirestoreState = {
  customers?: unknown[];
  products?: unknown[];
  contracts?: Record<string, unknown[]>;
  billing?: {
    paidAt?: Record<string, string>;
    invoiceTotals?: Record<string, number>;
    snapshots?: Record<string, unknown>;
  };
  settings?: Record<string, unknown>;
  customerMeta?: Record<string, Record<string, unknown>>;
  contractHistory?: Record<string, unknown[]>;
  pausedDeliveries?: Record<string, string[]>;
  spotSales?: Record<string, unknown[]>;
  deliveryActuals?: Record<string, Record<string, { completedAt: string; quantities: Record<string, number> }>>;
};

export type Demo2BillingRecord = {
  key: string;
  paidAt?: string;
  total: number;
  snapshot: unknown;
};

export async function loadDemo2State(): Promise<Demo2FirestoreState | null> {
  const snapshot = await getDoc(demo2StateRef());
  return snapshot.exists() ? snapshot.data() as Demo2FirestoreState : null;
}

export async function saveDemo2Field(field: keyof Demo2FirestoreState, value: unknown) {
  await setDoc(demo2StateRef(), { [field]: value, updatedAt: serverTimestamp() }, { merge: true });
}

export async function saveDemo2RecordChanges(
  field: "customers" | "products",
  upserts: Array<Record<string, unknown>>,
  deletedIds: string[],
  idField: "id" | "code",
) {
  if (!db || (!upserts.length && !deletedIds.length)) return;
  await runTransaction(db, async (transaction) => {
    const ref = demo2StateRef();
    const snapshot = await transaction.get(ref);
    const current = snapshot.exists() && Array.isArray(snapshot.data()[field]) ? snapshot.data()[field] as Array<Record<string, unknown>> : [];
    const byId = new Map(current.map((item) => [String(item[idField]), item]));
    deletedIds.forEach((id) => byId.delete(id));
    upserts.forEach((item) => byId.set(String(item[idField]), item));
    transaction.set(ref, { [field]: [...byId.values()], updatedAt: serverTimestamp() }, { merge: true });
  });
}

export async function saveDemo2Contract(customerId: string, contracts: unknown[]) {
  await setDoc(demo2StateRef(), {
    contracts: { [customerId]: contracts },
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

export async function saveDemo2NestedField(
  field: "customerMeta" | "contractHistory" | "pausedDeliveries" | "spotSales" | "deliveryActuals",
  key: string,
  value: unknown,
) {
  await setDoc(demo2StateRef(), {
    [field]: { [key]: value },
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

export async function saveDemo2BillingMonth(month: string, records: Demo2BillingRecord[]) {
  if (!db || !records.length) return;
  await runTransaction(db, async (transaction) => {
    const ref = demo2StateRef();
    const snapshot = await transaction.get(ref);
    const billing = snapshot.exists() ? snapshot.data().billing ?? {} : {};
    const paidAt = { ...(billing.paidAt ?? {}) } as Record<string, string>;
    const invoiceTotals = { ...(billing.invoiceTotals ?? {}) } as Record<string, number>;
    const snapshots = { ...(billing.snapshots ?? {}) } as Record<string, unknown>;
    const currentMonth = new Date().toISOString().slice(0, 7);

    records.forEach((record) => {
      if (record.paidAt) paidAt[record.key] = record.paidAt;
      else delete paidAt[record.key];
      invoiceTotals[record.key] = record.total;
      if (month >= currentMonth || snapshots[record.key] === undefined) snapshots[record.key] = record.snapshot;
    });

    transaction.set(ref, {
      billing: { paidAt, invoiceTotals, snapshots },
      updatedAt: serverTimestamp(),
    }, { merge: true });
  });
}
