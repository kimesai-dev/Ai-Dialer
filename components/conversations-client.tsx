"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Send, Phone, Mail, Star, MoreVertical, Paperclip, Smile, DollarSign, RefreshCw } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Contact {
  id: string
  name: string
  phone: string
  email?: string
  location?: string
  status: string
  tags: string[]
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

  // Fetch conversations from API
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

        // Auto-select first contact if none selected
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

  // Fetch messages for selected contact
  const fetchMessages = async (contactId: string) => {
    try {
      const response = await fetch(`/api/conversations/${contactId}/messages`)
      const result = await response.json()

      if (result.data) {
        setMessages(result.data)
      }
    } catch (error) {
      console.error("Error fetching messages:", error)
    }
  }

  useEffect(() => {
    fetchConversations()
  }, [searchTerm, activeTab])

  useEffect(() => {
    if (selectedContact) {
      fetchMessages(selectedContact.id)
    }
  }, [selectedContact])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Auto-refresh conversations every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchConversations()
      if (selectedContact) {
        fetchMessages(selectedContact.id)
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [selectedContact])

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
        setMessages((prev) => prev.map((msg) => (msg.id === newMessage.id ? { ...msg, status: "sent" } : msg)))
        // Refresh conversations to update last message
        fetchConversations()
      } else {
        setMessages((prev) => prev.map((msg) => (msg.id === newMessage.id ? { ...msg, status: "failed" } : msg)))
      }
    } catch (error) {
      console.error("Failed to send message:", error)
      setMessages((prev) => prev.map((msg) => (msg.id === newMessage.id ? { ...msg, status: "failed" } : msg)))
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const getStatusColor = (status: string) => {
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

  if (loading) {
    return (
      <div className="h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading conversations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-gray-50 flex">
      {/* Left Sidebar - Conversations List */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold text-gray-900">Conversations</h1>
            <Button variant="ghost" size="sm" onClick={fetchConversations} disabled={refreshing}>
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            </Button>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-4">
              <TabsTrigger value="unread" className="text-xs">
                UNREAD
              </TabsTrigger>
              <TabsTrigger value="recents" className="text-xs">
                RECENTS
              </TabsTrigger>
              <TabsTrigger value="starred" className="text-xs">
                STARRED
              </TabsTrigger>
              <TabsTrigger value="all" className="text-xs">
                ALL
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Search */}
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
            <Input
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Contacts List */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-2">
            <p className="text-xs text-gray-500 mb-2">{contacts.length} RESULTS</p>
            {contacts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm">No conversations yet</p>
                <p className="text-gray-400 text-xs mt-1">Send a message to start a conversation</p>
              </div>
            ) : (
              contacts.map((contact) => (
                <div
                  key={contact.id}
                  onClick={() => setSelectedContact(contact)}
                  className={`flex items-center p-3 rounded-lg cursor-pointer hover:bg-gray-50 mb-1 ${
                    selectedContact?.id === contact.id ? "bg-purple-50 border border-purple-200" : ""
                  }`}
                >
                  <Avatar className="h-10 w-10 mr-3">
                    <AvatarFallback className="bg-purple-100 text-purple-600">
                      {getInitials(contact.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium text-gray-900 truncate">{contact.name}</h3>
                      <span className="text-xs text-gray-500">{contact.lastMessageTime}</span>
                    </div>
                    <p className="text-sm text-gray-600 truncate">{contact.lastMessage}</p>
                  </div>
                  {contact.unreadCount && contact.unreadCount > 0 && (
                    <Badge className="bg-purple-600 text-white ml-2 h-5 w-5 rounded-full flex items-center justify-center text-xs">
                      {contact.unreadCount}
                    </Badge>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedContact ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <div className="flex items-center">
                <Avatar className="h-10 w-10 mr-3">
                  <AvatarFallback className="bg-purple-100 text-purple-600">
                    {getInitials(selectedContact.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="font-semibold text-gray-900">{selectedContact.name}</h2>
                  <p className="text-sm text-gray-600">{selectedContact.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  <Star className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Mail className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No messages yet</p>
                  <p className="text-gray-400 text-sm mt-1">Start the conversation below</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div key={message.id} className={`flex ${message.type === "sent" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.type === "sent" ? "bg-purple-600 text-white" : "bg-gray-200 text-gray-900"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className={`text-xs ${message.type === "sent" ? "text-purple-100" : "text-gray-500"}`}>
                          {message.timestamp}
                        </span>
                        {message.type === "sent" && (
                          <span
                            className={`text-xs ml-2 ${
                              message.status === "failed"
                                ? "text-red-200"
                                : message.status === "sending"
                                  ? "text-purple-200"
                                  : "text-purple-100"
                            }`}
                          >
                            {message.status === "sending"
                              ? "⏳"
                              : message.status === "sent"
                                ? "✓"
                                : message.status === "delivered"
                                  ? "✓✓"
                                  : message.status === "failed"
                                    ? "✗"
                                    : ""}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 p-4">
              <Tabs defaultValue="sms" className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="sms">SMS</TabsTrigger>
                  <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
                  <TabsTrigger value="internal">Internal Comment</TabsTrigger>
                </TabsList>

                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm text-gray-600">From:</span>
                  <Select defaultValue={process.env.TWILIO_PHONE_NUMBER || "+1 260-305-1860"}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="+1 260-305-1860">+1 260-305-1860</SelectItem>
                    </SelectContent>
                  </Select>
                  <span className="text-sm text-gray-600 ml-4">To:</span>
                  <Select value={selectedContact.phone}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={selectedContact.phone}>{selectedContact.phone}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end gap-2">
                  <div className="flex-1 relative">
                    <Input
                      placeholder="Type a message"
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                      className="pr-20"
                    />
                    <div className="absolute right-2 top-2 flex items-center gap-1">
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <Paperclip className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <Smile className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <DollarSign className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <Button onClick={handleSendMessage} className="bg-purple-600 hover:bg-purple-700">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                  <span>
                    Chars: {messageInput.length}, Segs: {Math.ceil(messageInput.length / 160) || 0}
                  </span>
                  <Button variant="ghost" size="sm" className="text-xs" onClick={() => setMessageInput("")}>
                    Clear
                  </Button>
                </div>
              </Tabs>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
              <p className="text-gray-600">Choose a contact from the left to start messaging</p>
            </div>
          </div>
        )}
      </div>

      {/* Right Sidebar - Contact Details */}
      {selectedContact && (
        <div className="w-80 bg-white border-l border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">{selectedContact.name}</h3>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-4">
            {/* Contact Info */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Contact</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">Email</span>
                  </div>
                  <span className="text-sm text-gray-900">{selectedContact.email || "Not provided"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">Phone</span>
                  </div>
                  <span className="text-sm text-gray-900">{selectedContact.phone}</span>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">Tags</h4>
              </div>
              <div className="flex flex-wrap gap-1">
                {selectedContact.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Status */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Status</h4>
              <Badge className={getStatusColor(selectedContact.status)}>{selectedContact.status}</Badge>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
