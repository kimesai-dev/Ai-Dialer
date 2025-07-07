import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

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
