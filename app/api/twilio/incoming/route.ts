import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import twilio from "twilio"

// Add GET method for testing the endpoint
export async function GET() {
  console.log("🔍 Webhook GET request received")
  return NextResponse.json({
    message: "Twilio webhook endpoint is working!",
    timestamp: new Date().toISOString(),
    status: "active",
  })
}

export async function POST(request: NextRequest) {
  console.log("🚀 Webhook POST request received!")

  try {
    const formData = await request.formData()

    const params: Record<string, string> = {}
    for (const [key, value] of formData.entries()) {
      params[key] = String(value)
    }

    const authToken = process.env.TWILIO_AUTH_TOKEN
    const signature = request.headers.get("x-twilio-signature") || ""
    const url = request.nextUrl.href

    if (!authToken || !twilio.validateRequest(authToken, signature, url, params)) {
      console.warn("Invalid Twilio signature for incoming message")
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 })
    }

    const from = formData.get("From") as string
    const to = formData.get("To") as string
    const body = formData.get("Body") as string
    const messageSid = formData.get("MessageSid") as string

    console.log("📨 Incoming message data:", { from, to, body, messageSid })

    if (!from || !body) {
      console.error("❌ Missing required fields:", { from, body })
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Clean phone number for lookup
    const cleanPhone = from.replace(/[^\d+]/g, "")
    console.log("🔍 Looking for contact with phone:", cleanPhone)

    // Find or create contact
    let { data: contact, error: contactError } = await supabase
      .from("contacts")
      .select("*")
      .eq("phone", cleanPhone)
      .single()

    if (contactError || !contact) {
      console.log("👤 Creating new contact for:", cleanPhone)
      const { data: newContact, error: createError } = await supabase
        .from("contacts")
        .insert([
          {
            name: `Contact ${cleanPhone}`,
            phone: cleanPhone,
            status: "Lead",
            tags: ["Inbound"],
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single()

      if (createError) {
        console.error("❌ Error creating contact:", createError)
        return NextResponse.json({ error: "Failed to create contact" }, { status: 500 })
      }

      contact = newContact
      console.log("✅ Created new contact:", contact.id)
    }

    // Save incoming message
    console.log("💾 Saving message to database...")
    const { data: message, error: messageError } = await supabase
      .from("messages")
      .insert([
        {
          contact_id: contact.id,
          content: body,
          status: "Received",
          sent_at: new Date().toISOString(),
          delivered_at: new Date().toISOString(),
          twilio_message_id: messageSid,
          direction: "inbound",
        },
      ])
      .select()
      .single()

    if (messageError) {
      console.error("❌ Error saving message:", messageError)
      return NextResponse.json({ error: "Failed to save message" }, { status: 500 })
    }

    console.log("✅ Message saved successfully:", message.id)

    // Update contact's last_contacted timestamp
    await supabase
      .from("contacts")
      .update({
        last_contacted: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", contact.id)

    console.log("✅ Webhook processing complete")

    return new NextResponse("OK", { status: 200 })
  } catch (error) {
    console.error("💥 Webhook error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
