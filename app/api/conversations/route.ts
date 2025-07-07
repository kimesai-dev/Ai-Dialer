import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const filter = searchParams.get("filter") || "all"

    // Fetch all contacts and their messages
    let contactQuery = supabase
      .from("contacts")
      .select(`
        *,
        messages:messages(
          id, content, direction, sent_at, status
        )
      `)
      .order("updated_at", { ascending: false })

    if (search) {
      contactQuery = contactQuery.ilike("name", `%${search}%`)
    }

    const { data, error } = await contactQuery

    if (error) {
      console.error("Error fetching contacts:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Format results
    const formatted = (data || []).map((contact: any) => {
      const messages = contact.messages || []

      const last = messages.sort((a: any, b: any) =>
        new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime()
      )[0]

      const unreadCount = messages.filter(
        (msg: any) => msg.direction === "inbound" && msg.status !== "read"
      ).length

      return {
        id: contact.id,
        name: contact.name,
        phone: contact.phone,
        email: contact.email || "",
        tags: contact.tags || [],
        location: contact.location || "",
        status: contact.status || "Lead",
        avatar: null,
        lastMessage: last?.content || "",
        lastMessageTime: last?.sent_at
          ? new Date(last.sent_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
          : null,
        unreadCount,
      }
    })

    return NextResponse.json({ data: formatted })
  } catch (err) {
    console.error("Error in /api/conversations:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
