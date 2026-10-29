import { collection, getDocs, serverTimestamp, writeBatch, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { ImportedCustomer } from "@/lib/customer-csv";

const collectionName = "milmoCustomers";

function customersCollection() {
  if (!db) throw new Error("Firebase is not configured");
  return collection(db, collectionName);
}

function isCustomer(value: unknown): value is ImportedCustomer {
  if (!value || typeof value !== "object") return false;
  const customer = value as Record<string, unknown>;
  return typeof customer.id === "string" && typeof customer.name === "string";
}

export async function loadCustomers(): Promise<ImportedCustomer[]> {
  const snapshot = await getDocs(customersCollection());
  return snapshot.docs
    .map((item) => item.data())
    .filter(isCustomer)
    .map((customer) => ({
      id: customer.id,
      name: customer.name,
      kana: customer.kana ?? "",
      delivery: customer.delivery ?? "",
      payment: customer.payment ?? "未設定",
      started: customer.started ?? "—",
      birthday: customer.birthday ?? "—",
      products: customer.products ?? "",
      address: customer.address ?? "",
      phone: customer.phone ?? "",
    }))
    .sort((left, right) => left.id.localeCompare(right.id, "ja"));
}

export async function saveCustomers(customers: ImportedCustomer[]) {
  if (!db) throw new Error("Firebase is not configured");
  const firestore = db;
  const groups: ImportedCustomer[][] = [];
  for (let index = 0; index < customers.length; index += 450) groups.push(customers.slice(index, index + 450));

  for (const group of groups) {
    const batch = writeBatch(firestore);
    group.forEach((customer) => {
      batch.set(doc(firestore, collectionName, customer.id), {
        ...customer,
        updatedAt: serverTimestamp(),
      }, { merge: true });
    });
    await batch.commit();
  }
}
