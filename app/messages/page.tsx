"use client"

import { useEffect, useState } from "react"
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

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isDemo, setIsDemo] = useState(false)

  const fetchMessages = async () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const isDemoMode = !(supabaseUrl && supabaseAnonKey)

    if (isDemoMode) {
      setMessages(mockMessages)
      setIsDemo(true)
      return
    }

    try {
      const res = await fetch("/api/messages?status=all&campaign=all")
      const json = await res.json()

      if (!json.data) {
        setMessages(mockMessages)
        setIsDemo(true)
        return
      }

      const formatted = json.data.map((msg: any) => {
        const isInbound = msg.direction === "inbound"

        return {
          id: msg.id,
          content: msg.content,
          recipients: isInbound ? 0 : 1,
          sent: new Date(msg.sent_at || msg.created_at).toLocaleString(),
          status: msg.status || (isInbound ? "Received" : "Sent"),
          responses: 0, // Can enhance later
          campaign: msg.campaign?.name || (isInbound ? "Inbound Message" : "Direct Message"),
        }
      })

      setMessages(formatted)
      setIsDemo(false)
    } catch (err) {
      console.error("❌ Error fetching live messages:", err)
      setMessages(mockMessages)
      setIsDemo(true)
    }
  }

  useEffect(() => {
    fetchMessages()
    const interval = setInterval(fetchMessages, 5000)
    return () => clearInterval(interval)
  }, [])

  return <MessagesClient initialMessages={messages} isDemo={isDemo} />
}
