import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  console.log("🚀 verify-hook route hit")

  const formData = await request.formData()

  const from = formData.get("From") as string
  const body = formData.get("Body") as string

  console.log("📨 Message:", { from, body })

  return NextResponse.json({ success: true })
}
