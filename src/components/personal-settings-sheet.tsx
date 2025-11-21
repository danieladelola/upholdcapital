"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"


export function PersonalSettingsSheet() {


  return (
    <Button  variant={'link'} asChild>
      <Link href={'/user-profile'}>Personal Settings</Link>
    </Button>
  )
}