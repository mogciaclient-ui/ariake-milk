import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

const demo2StateRef = () => {
  if (!db) throw new Error("Firebase is not configured");
  return doc(db, "demo2", "shared-state");
};

export type Demo2FirestoreState = {
  customers?: unknown[];
  products?: unknown[];
  contracts?: Record<string, unknown[]>;
};

export async function loadDemo2State(): Promise<Demo2FirestoreState | null> {
  const snapshot = await getDoc(demo2StateRef());
  return snapshot.exists() ? snapshot.data() as Demo2FirestoreState : null;
}

export async function saveDemo2Field(field: keyof Demo2FirestoreState, value: unknown) {
  await setDoc(demo2StateRef(), { [field]: value, updatedAt: serverTimestamp() }, { merge: true });
}

export async function saveDemo2Contract(customerId: string, contracts: unknown[]) {
  await setDoc(demo2StateRef(), {
    contracts: { [customerId]: contracts },
    updatedAt: serverTimestamp(),
  }, { merge: true });
}
