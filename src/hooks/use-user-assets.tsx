"use client"

import { useEffect, useState, useCallback } from "react"

type UserAsset = {
  symbol: string
  amount: number
}

// Hook: subscribe to a user's asset collection and provide helpers
export function useUserAssets(uid?: string | null) {
  const [userAssets, setUserAssets] = useState<UserAsset[]>([])

  // useEffect(() => {
  //   if (!uid) return
  //   const unsubscribe = db.collection('users').doc(uid).collection('assets')
  //     .onSnapshot((snapshot) => {
  //       const assets = snapshot.docs.map((doc) => ({
  //         symbol: doc.id,
  //         amount: Number(doc.data().amount ?? 0)
  //       }))
  //       setUserAssets(assets)
  //     })

  //   return () => unsubscribe()
  // }, [uid])

  const getAmount = useCallback((symbol: string) => {
    const a = userAssets.find((ua) => ua.symbol === symbol)
    return a ? a.amount : 0
  }, [userAssets])

  // Update asset amount by delta (positive or negative). Uses Firestore increment.
  const updateAmount = useCallback(async (symbol: string, delta: number) => {
    if (!uid) throw new Error('Missing uid')
//     const ref = db.collection('users').doc(uid).collection('assets').doc(symbol)
//     await ref.set({ amount: fire.firestore.FieldValue.increment(delta) }, { merge: true })
  }, [uid])

  return { userAssets, getAmount, updateAmount }
}
