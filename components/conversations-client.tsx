"use client"

import { useState, useEffect, useRef } from "react"
import { createClient } from "@supabase/supabase-js"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue
} from "@/components/ui/select"

import {
  Search, Send, Phone, Mail, Star, MoreVertical,
  Paperclip, Smile, DollarSign, RefreshCw
} from "lucide-react"

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

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

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
        setSelectedContact((prev) => prev || result.data[0] || null)
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
      case "Lead": return "bg-blue-100 text-blue-800"
      case "Customer": return "bg-green-100 text-green-800"
      case "Prospect": return "bg-yellow-100 text-yellow-800"
      default: return "bg-gray-100 text-gray-800"
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        Loading conversations...
      </div>
    )
  }

  return (
    <div className="h-screen flex bg-gray-50">
      {/* ... UI content remains unchanged ... */}
      {/* Sidebar, Chat window, Message input, and Contact sidebar here */}
      {/* You already have this from your previous version — only the Realtime hook is gone */}
    </div>
  )
}
