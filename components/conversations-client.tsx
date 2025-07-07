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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        Loading conversations...
      </div>
    )
  }

  return (
    <div className="h-screen flex bg-gray-50">
      <div className="w-80 bg-white border-r border-gray-200">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Conversations</h1>
          <Button size="sm" variant="ghost" onClick={fetchConversations} disabled={refreshing}>
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          </Button>
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="px-4">
          <TabsList className="grid grid-cols-4 mb-2">
            <TabsTrigger value="unread" className="text-xs">Unread</TabsTrigger>
            <TabsTrigger value="recents" className="text-xs">Recents</TabsTrigger>
            <TabsTrigger value="starred" className="text-xs">Starred</TabsTrigger>
            <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="px-4 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <Input
              className="pl-10"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="overflow-y-auto flex-1 px-2">
          {contacts.length === 0 ? (
            <p className="text-center text-sm text-gray-400 mt-10">No conversations found</p>
          ) : (
            contacts.map((contact) => (
              <div
                key={contact.id}
                className={`p-3 rounded-lg cursor-pointer hover:bg-gray-100 ${
                  selectedContact?.id === contact.id ? "bg-purple-50 border border-purple-300" : ""
                }`}
                onClick={() => setSelectedContact(contact)}
              >
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{getInitials(contact.name || "")}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{contact.name}</p>
                    <p className="text-xs text-gray-500 truncate">{contact.lastMessage || "No messages yet"}</p>
                  </div>
                  {contact.unreadCount && contact.unreadCount > 0 && (
                    <Badge className="bg-purple-600 text-white text-xs h-5 w-5 flex items-center justify-center rounded-full">
                      {contact.unreadCount}
                    </Badge>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {selectedContact ? (
          <>
            <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>{getInitials(selectedContact.name || "")}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-gray-900">{selectedContact.name}</p>
                  <p className="text-sm text-gray-500">{selectedContact.phone}</p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.length === 0 ? (
                <p className="text-center text-sm text-gray-400">No messages yet</p>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === "sent" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`px-4 py-2 rounded-lg max-w-xs ${
                        message.type === "sent" ? "bg-purple-600 text-white" : "bg-gray-200 text-gray-900"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs mt-1 text-right opacity-70">{message.timestamp}</p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex items-center space-x-2">
                <Input
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Type a message"
                />
                <Button onClick={handleSendMessage}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            Select a contact to start chatting
          </div>
        )}
      </div>
    </div>
  )
}
