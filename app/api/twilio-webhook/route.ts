import { NextRequest, NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase-server"

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()

    const from = formData.get("From")?.toString() || ""
    const body = formData.get("Body")?.toString() || ""

    // ✅ Console logs to debug Twilio webhook delivery
    console.log("🟣 Twilio webhook received")
    console.log("From:", from)
    console.log("Body:", body)

    if (!from || !body) {
      console.warn("⚠️ Missing From or Body")
      return NextResponse.json({ error: "Missing From or Body" }, { status: 400 })
    }

    const { data: contact, error: contactError } = await supabaseServer
      .from("contacts")
      .select("id")
      .ilike("phone", `%${from.slice(-10)}`)
      .maybeSingle()

    if (contactError) {
      console.error("❌ Supabase contact query error:", contactError)
    }

    const { error: insertError } = await supabaseServer.from("messages").insert({
      contact_id: contact?.id || null,
      content: body,
      direction: "inbound",
      status: "Received",
      sent_at: new Date().toISOString(),
    })

    if (insertError) {
      console.error("❌ Supabase insert error:", insertError)
    }

    return new NextResponse("OK", { status: 200 })
  } catch (error) {
    console.error("❌ Twilio webhook error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
