import { NextResponse } from "next/server"
import { history } from "@/lib/mock-copy-data"

export async function GET() {
  return NextResponse.json(history)
}
