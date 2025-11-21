"use server"

import { db } from "@/lib/firebase"
import { Role, User } from "types"

export async function createUser(user: Partial<User>) {
  const userRef = db.collection("users").doc(user.uid!)

  const newUser: Partial<User> = {
    ...user,
    role: "user" as Role,
  }

  await userRef.set(newUser)
}

export async function updateUser(uid: string, data: Partial<User>) {
  await db.collection("users").doc(uid).update(data)
}
