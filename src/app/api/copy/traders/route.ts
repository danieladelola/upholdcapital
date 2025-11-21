import { NextResponse } from "next/server"
import { traders, toggleFollow } from "@/lib/mock-copy-data"

export async function GET() {
  return NextResponse.json(traders)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { traderId } = body
    const isFollowing = toggleFollow(traderId)
    return NextResponse.json({ ok: true, isFollowing })
  } catch (e) {
    return NextResponse.json({ ok: false }, { status: 400 })
  }
}
