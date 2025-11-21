"use server"

import { db } from "@/lib/firebase"
import { Subscription } from "../components/subscriptions-management"

export async function addSubscription(subscription: Omit<Subscription, "id">) {
  await db.collection("subscriptions").add(subscription)
}

export async function updateSubscription(id: string, updatedData: Partial<Subscription>) {
  await db.collection("subscriptions").doc(id).update(updatedData)
}

export async function deleteSubscription(id: string) {
  await db.collection("subscriptions").doc(id).delete()
}

