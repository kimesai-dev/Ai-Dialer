import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()

    const from = formData.get("From")?.toString() || ""
    const body = formData.get("Body")?.toString() || ""

    if (!from || !body) {
      return NextResponse.json({ error: "Missing From or Body" }, { status: 400 })
    }

    const { data: contact } = await supabase
      .from("contacts")
      .select("id")
      .ilike("phone", `%${from.slice(-10)}`)
      .maybeSingle()

    await supabase.from("messages").insert({
      contact_id: contact?.id || null,
      content: body,
      direction: "inbound",
      status: "Received",
      sent_at: new Date().toISOString(),
    })

    return new NextResponse("OK", { status: 200 })
  } catch (error) {
    console.error("Twilio webhook error:", error)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
