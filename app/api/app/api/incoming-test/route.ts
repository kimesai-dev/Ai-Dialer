import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  console.log("🚀 incoming-test route hit")

  const formData = await request.formData()

  const from = formData.get("From") as string
  const to = formData.get("To") as string
  const body = formData.get("Body") as string
  const messageSid = formData.get("MessageSid") as string

  console.log("📨 Incoming message data:", { from, to, body, messageSid })

  return NextResponse.json({ success: true })
}
