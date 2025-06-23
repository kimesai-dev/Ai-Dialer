import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { sendSMS } from "@/lib/twilio"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { contactId, message, phone } = body

    if (!contactId || !message || !phone) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get contact details
    const { data: contact, error: contactError } = await supabase
      .from("contacts")
      .select("name")
      .eq("id", contactId)
      .single()

    if (contactError || !contact) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 })
    }

    // Personalize message
    const personalizedMessage = message.replace(/\{\{name\}\}/g, contact.name)

    // Send via Twilio
    const smsResult = await sendSMS({
      to: phone,
      message: personalizedMessage,
      contactId,
    })

    // Save to database
    const messageRecord = {
      contact_id: contactId,
      content: personalizedMessage,
      status: smsResult.success ? "Sent" : "Failed",
      sent_at: new Date().toISOString(),
      twilio_message_id: smsResult.messageId,
      error_message: smsResult.error,
    }

    const { data: savedMessage, error: saveError } = await supabase
      .from("messages")
      .insert([messageRecord])
      .select()
      .single()

    if (saveError) {
      console.error("Error saving message:", saveError)
    }

    // Update contact last_contacted
    if (smsResult.success) {
      await supabase.from("contacts").update({ last_contacted: new Date().toISOString() }).eq("id", contactId)
    }

    return NextResponse.json({
      success: smsResult.success,
      messageId: smsResult.messageId,
      error: smsResult.error,
      data: savedMessage,
    })
  } catch (error) {
    console.error("Error in send message API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
