import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const campaign = searchParams.get("campaign")
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    let query = supabase
      .from("messages")
      .select(`
        *,
        contact:contacts(*),
        campaign:campaigns(*)
      `)
      .order("sent_at", { ascending: false }) // ✅ Changed from created_at
      .range(offset, offset + limit - 1)

    if (status && status !== "all") {
      query = query.eq("status", status)
    }

    if (campaign && campaign !== "all") {
      query = query.eq("campaign_id", campaign)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ error: "Supabase not configured" }, { status: 501 })
    }

    const { supabase } = await import("@/lib/supabase")
    const { sendSMS } = await import("@/lib/twilio")

    const body = await request.json()
    const { contact_ids, content, campaign_id } = body

    if (!contact_ids || !Array.isArray(contact_ids) || contact_ids.length === 0) {
      return NextResponse.json({ error: "No contacts specified" }, { status: 400 })
    }

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: "Message content is required" }, { status: 400 })
    }

    const { data: contacts, error: contactError } = await supabase
      .from("contacts")
      .select("id, name, phone")
      .in("id", contact_ids)

    if (contactError) {
      return NextResponse.json({ error: contactError.message }, { status: 500 })
    }

    if (!contacts || contacts.length === 0) {
      return NextResponse.json({ error: "No valid contacts found" }, { status: 400 })
    }

    const results = []
    const messageRecords = []

    for (const contact of contacts) {
      const personalizedMessage = content.replace(/\{\{name\}\}/g, contact.name)

      const smsResult = await sendSMS({
        to: contact.phone,
        message: personalizedMessage,
        contactId: contact.id,
        campaignId: campaign_id,
      })

      const messageRecord = {
        contact_id: contact.id,
        campaign_id: campaign_id,
        content: personalizedMessage,
        status: smsResult.success ? "Sent" : "Failed",
        sent_at: new Date().toISOString(),
        twilio_message_id: smsResult.messageId,
        error_message: smsResult.error,
      }

      messageRecords.push(messageRecord)
      results.push({
        contact_id: contact.id,
        contact_name: contact.name,
        phone: contact.phone,
        success: smsResult.success,
        message_id: smsResult.messageId,
        error: smsResult.error,
      })
    }

    const { data: savedMessages, error: saveError } = await supabase
      .from("messages")
      .insert(messageRecords)
      .select()

    if (saveError) {
      console.error("Error saving messages to database:", saveError)
    }

    const successfulContactIds = results.filter((r) => r.success).map((r) => r.contact_id)

    if (successfulContactIds.length > 0) {
      await supabase
        .from("contacts")
        .update({ last_contacted: new Date().toISOString() })
        .in("id", successfulContactIds)
    }

    const successCount = results.filter((r) => r.success).length
    const failureCount = results.filter((r) => !r.success).length

    return NextResponse.json({
      success: true,
      message: `Sent ${successCount} messages successfully${failureCount > 0 ? `, ${failureCount} failed` : ""}`,
      results,
      data: savedMessages,
    })
  } catch (error) {
    console.error("Error in messages API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
