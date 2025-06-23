import { supabase } from "@/lib/supabase"
import MessagesClient from "@/components/messages-client"

interface Message {
  id: string
  content: string
  recipients: number
  sent: string
  status: string
  responses: number
  campaign: string
}

// Mock data fallback
const mockMessages: Message[] = [
  {
    id: "1",
    content: "Hi John, we have a special offer for you this week.",
    recipients: 150,
    sent: "2024-12-06 10:30 AM",
    status: "Delivered",
    responses: 12,
    campaign: "Holiday Promotion",
  },
]

async function getMessagesData() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const isDemo = !(supabaseUrl && supabaseAnonKey)

  if (isDemo) {
    return { messages: mockMessages, isDemo: true }
  }

  try {
    const { data: messagesData, error } = await supabase
      .from("messages")
      .select(`
        *,
        contact:contacts(*),
        campaign:campaigns(*)
      `)
      .order("created_at", { ascending: false })
      .limit(20)

    if (error) {
      console.error("Error fetching messages:", error)
      return { messages: mockMessages, isDemo: true }
    }

    // Transform the data to match the expected format
    const messages =
      messagesData?.map((msg) => ({
        id: msg.id,
        content: msg.content,
        recipients: 1, // Individual message
        sent: new Date(msg.sent_at || msg.created_at).toLocaleString(),
        status: msg.status,
        responses: msg.response_received ? 1 : 0,
        campaign: msg.campaign?.name || "Direct Message",
      })) || []

    return { messages, isDemo: false }
  } catch (error) {
    console.error("Error connecting to Supabase:", error)
    return { messages: mockMessages, isDemo: true }
  }
}

export default async function MessagesPage() {
  const { messages, isDemo } = await getMessagesData()
  return <MessagesClient initialMessages={messages} isDemo={isDemo} />
}
