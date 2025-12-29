"use server"

import firebase from "firebase/compat/app"

export async function updateUserBalance(uid: string, amount: number) {

//   await db.collection("users").doc(uid).update({

    balance: firebase.firestore.FieldValue.increment(amount)

  })

}



export async function updateUserRole(uid: string, role: string) {

//   await db.collection("users").doc(uid).update({

    role

  })

}



export async function migrateUsers() {

//   const usersRef = db.collection("users")

  const snapshot = await usersRef.get()



  const updates = snapshot.docs.map(async (doc) => {
    const user = doc.data()
    if (!user.role) {
      await doc.ref.update({ role: "user" })
    }
  })

  await Promise.all(updates)
}

