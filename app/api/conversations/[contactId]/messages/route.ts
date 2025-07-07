import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(
  _req: NextRequest,
  { params }: { params: { contactId: string } }
) {
  const { contactId } = params

  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("contact_id", contactId)
    .order("sent_at", { ascending: true })

  if (error) {
    console.error("Failed to fetch messages:", error)
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 })
  }

  // Normalize messages for the frontend
  const formatted = (data || []).map((msg) => ({
    id: msg.id,
    contactId: msg.contact_id,
    content: msg.content,
    type: msg.direction === "inbound" ? "received" : "sent",
    timestamp: new Date(msg.sent_at || msg.created_at).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
    status: msg.status || "sent",
  }))

  return NextResponse.json({ data: formatted })
}
