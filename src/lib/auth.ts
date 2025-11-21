"use server"

import { db } from "@/lib/firebase";
import { rolePermissions } from "@/lib/permissions";
import { User } from "types";

export async function getUser(uid: string): Promise<User | null> {
  const userRef = db.collection("users").doc(uid);
  const userDoc = await userRef.get();

  if (!userDoc.exists) {
    return null;
  }

  return userDoc.data() as User;
}

export async function hasPermission(
  uid: string,
  featureName: string
): Promise<boolean> {
  const user = await getUser(uid);

  if (!user || !user.role) {
    return false;
  }

  const permissions = rolePermissions[user.role];

  if (!permissions) {
    return false;
  }

  return permissions.includes(featureName);
}
