"use server"

import { db } from "@/lib/firebase"
import { CryptoMethod, BankMethod } from "@/components/deposit-methods-management"

export async function addCryptoMethod(method: CryptoMethod) {
  await db.collection("cryptoMethods").add(method)
}

export async function addBankMethod(method: BankMethod) {
  await db.collection("bankMethods").add(method)
}

export async function deleteMethod(id: string, type: "crypto" | "bank") {
  const collection = type === "crypto" ? "cryptoMethods" : "bankMethods"
  await db.collection(collection).doc(id).delete()
}

