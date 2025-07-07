"use client"

import { useState, useEffect, useRef } from "react"
import { createClient } from "@supabase/supabase-js"
import {
  Button, Input, Badge, Avatar, AvatarFallback,
  Tabs, TabsList, TabsTrigger, Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui"
import {
  Search, Send, Phone, Mail, Star, MoreVertical,
  Paperclip, Smile, DollarSign, RefreshCw
} from "lucide-react"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Contact {
  id: string
  name: string
  phone: string
  email?: string
  location?: string
  status?: string
  tags?: string[]
  avatar?: string
  lastMessage?: string
  lastMessageTime?: string
  unreadCount?: number
}

interface Message {
  id: string
  contactId: string
  content: string
  type: "sent" | "received"
  timestamp: string
  status: "sending" | "sent" | "delivered" | "read" | "failed"
}

export default function ConversationsClient() {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [messageInput, setMessageInput] = useState("")
  const [activeTab, setActiveTab] = useState("unread")
  const [contacts, setContacts] = useState<Contact[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const fetchConversations = async () => {
    try {
      setRefreshing(true)
      const params = new URLSearchParams()
      if (searchTerm) params.append("search", searchTerm)
      params.append("filter", activeTab)

      const response = await fetch(`/api/conversations?${params}`)
      const result = await response.json()
      if (result.data) {
        setContacts(result.data)
        if (!selectedContact && result.data.length > 0) {
          setSelectedContact(result.data[0])
        }
      }
    } catch (error) {
      console.error("Error fetching conversations:", error)
    } finally {
      setRefreshing(false)
      setLoading(false)
    }
  }

  const fetchMessages = async (contactId: string) => {
    try {
      const response = await fetch(`/api/conversations/${contactId}/messages`)
      const result = await response.json()
      if (result.data) setMessages(result.data)
    } catch (error) {
      console.error("Error fetching messages:", error)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedContact) return

    const newMessage: Message = {
      id: Date.now().toString(),
      contactId: selectedContact.id,
      content: messageInput,
      type: "sent",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      status: "sending",
    }

    setMessages((prev) => [...prev, newMessage])
    setMessageInput("")

    try {
      const response = await fetch("/api/messages/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contactId: selectedContact.id,
          message: messageInput,
          phone: selectedContact.phone,
        }),
      })

      if (response.ok) {
        setMessages((prev) =>
          prev.map((msg) => (msg.id === newMessage.id ? { ...msg, status: "sent" } : msg))
        )
        fetchConversations()
      } else {
        setMessages((prev) =>
          prev.map((msg) => (msg.id === newMessage.id ? { ...msg, status: "failed" } : msg))
        )
      }
    } catch (error) {
      console.error("Failed to send message:", error)
      setMessages((prev) =>
        prev.map((msg) => (msg.id === newMessage.id ? { ...msg, status: "failed" } : msg))
      )
    }
  }

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()

  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case "Lead":
        return "bg-blue-100 text-blue-800"
      case "Customer":
        return "bg-green-100 text-green-800"
      case "Prospect":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  useEffect(() => {
    fetchConversations()
  }, [searchTerm, activeTab])

  useEffect(() => {
    if (selectedContact) fetchMessages(selectedContact.id)
  }, [selectedContact])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    const interval = setInterval(() => {
      fetchConversations()
      if (selectedContact) fetchMessages(selectedContact.id)
    }, 30000)
    return () => clearInterval(interval)
  }, [selectedContact])

  useEffect(() => {
    const channel = supabase
      .channel("messages-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const msg = payload.new
          if (msg.contact_id === selectedContact?.id) {
            const newMsg: Message = {
              id: msg.id,
              contactId: msg.contact_id,
              content: msg.content,
              type: msg.direction === "inbound" ? "received" : "sent",
              timestamp: new Date(msg.sent_at || msg.created_at).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
              status: msg.status || "sent",
            }
            setMessages((prev) => [...prev, newMsg])
          }
          fetchConversations()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [selectedContact])

  return (
    // your existing UI code goes here (sidebar, chat thread, sidebar details)
    // just make sure anywhere you render tags or status uses fallbacks like:
    // selectedContact?.status || "Lead" and (selectedContact?.tags || []).map(...)
    <></>
  )
}
