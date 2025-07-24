import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import twilio from "twilio"

export async function POST(request: NextRequest) {
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
      console.warn("Invalid Twilio signature for status webhook")
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 })
    }

    const messageId = formData.get("MessageSid") as string
    const messageStatus = formData.get("MessageStatus") as string
    const errorCode = formData.get("ErrorCode") as string
    const errorMessage = formData.get("ErrorMessage") as string

    if (!messageId) {
      return NextResponse.json({ error: "Missing MessageSid" }, { status: 400 })
    }

    // Update message status in database
    const updateData: any = {
      status: messageStatus,
      updated_at: new Date().toISOString(),
    }

    if (messageStatus === "delivered") {
      updateData.delivered_at = new Date().toISOString()
    }

    if (errorCode) {
      updateData.error_message = `${errorCode}: ${errorMessage}`
    }

    const { error } = await supabase.from("messages").update(updateData).eq("twilio_message_id", messageId)

    if (error) {
      console.error("Error updating message status:", error)
      return NextResponse.json({ error: "Database update failed" }, { status: 500 })
    }

    console.log(`Updated message ${messageId} status to ${messageStatus}`)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
