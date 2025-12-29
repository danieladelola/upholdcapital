"use server"

import { Pool } from "@/components/staking-options-management"

export async function addPool(pool: Omit<Pool, "id">) {
//   await db.collection("stakingPools").add(pool)
}

export async function updatePool(id: string, updatedData: Partial<Pool>) {
//   await db.collection("stakingPools").doc(id).update(updatedData)
}

export async function deletePool(id: string) {
//   await db.collection("stakingPools").doc(id).delete()
}

