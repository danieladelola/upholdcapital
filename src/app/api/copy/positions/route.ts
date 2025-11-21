import { NextResponse } from "next/server"
import { positions, copyPosition, closePosition } from "@/lib/mock-copy-data"

export async function GET() {
  return NextResponse.json(positions)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const created = copyPosition(body)
    return NextResponse.json({ ok: true, created })
  } catch (e) {
    return NextResponse.json({ ok: false }, { status: 400 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    if (!id) return NextResponse.json({ ok: false }, { status: 400 })
    const closed = closePosition(id)
    return NextResponse.json({ ok: true, closed })
  } catch (e) {
    return NextResponse.json({ ok: false }, { status: 400 })
  }
}
