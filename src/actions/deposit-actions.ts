"use client";

import { db } from "@/lib/firebase";

export async function approveDeposit(
  id: string,
  amount: number,
  type: string,
  userid: string
) {
  // get the balance or subscription balance if type is subscription
  let balance = 0;

  const snapshot = await db.collection("users").doc(userid).get();
  if (snapshot.exists) {
    const data = snapshot.data();
    if (data) {
      balance =parseFloat(data.balance);
    }
  }
  db.collection("users")
    .doc(userid)
    .update({
      balance: balance + amount,
    });
  await db.collection("deposits").doc(id).update({
    status: "approved",
  });
}

export async function rejectDeposit(id: string) {
  await db.collection("deposits").doc(id).update({
    status: "rejected",
  });
}
