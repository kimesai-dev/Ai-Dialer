"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Send, MessageSquare, Clock, CheckCircle, XCircle, Search, Filter } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface Message {
  id: string
  content: string
  recipients: number
  sent: string
  status: string
  responses: number
  campaign: string
}

interface MessagesClientProps {
  initialMessages: Message[]
  isDemo: boolean
}

export default function MessagesClient({ initialMessages, isDemo }: MessagesClientProps) {
  const [isComposeOpen, setIsComposeOpen] = useState(false)
  const [selectedRecipients, setSelectedRecipients] = useState("all")
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [statusFilter, setStatusFilter] = useState("all")
  const [campaignFilter, setCampaignFilter] = useState("all")

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Delivered":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "Sending":
        return <Clock className="h-4 w-4 text-yellow-600" />
      case "Failed":
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Delivered":
        return "bg-green-100 text-green-800"
      case "Sending":
        return "bg-yellow-100 text-yellow-800"
      case "Failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleSendMessage = async (formData: FormData) => {
    if (isDemo) {
      toast({
        title: "Action unavailable",
        description: "Message sending requires Supabase connection",
      })
      setIsComposeOpen(false)
      return
    }

    // In a real implementation, this would call the API
    setIsComposeOpen(false)
    setMessage("")
  }

  const filteredMessages = messages.filter((msg) => {
    if (statusFilter !== "all" && msg.status !== statusFilter) return false
    if (campaignFilter !== "all" && msg.campaign !== campaignFilter) return false
    return true
  })

  const totalSent = messages.reduce((sum, msg) => sum + msg.recipients, 0)
  const totalResponses = messages.reduce((sum, msg) => sum + msg.responses, 0)
  const responseRate = totalSent > 0 ? ((totalResponses / totalSent) * 100).toFixed(1) : "0"

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
              {isDemo && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Demo Mode
                </span>
              )}
            </div>
            <p className="text-gray-600">Send and manage text messages to your contacts</p>
            {isDemo && <p className="text-sm text-yellow-700 mt-1">Connect to Supabase to enable message sending</p>}
          </div>
          <Dialog open={isComposeOpen} onOpenChange={setIsComposeOpen}>
            <DialogTrigger asChild>
              <Button className="bg-black text-white hover:bg-gray-800 mt-4 sm:mt-0" disabled={isDemo}>
                <Send className="h-4 w-4 mr-2" />
                Compose Message
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Compose New Message</DialogTitle>
                <DialogDescription>Send a text message to your selected contacts.</DialogDescription>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  const formData = new FormData(e.currentTarget)
                  handleSendMessage(formData)
                }}
              >
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="recipients">Recipients</Label>
                    <Select value={selectedRecipients} onValueChange={setSelectedRecipients} name="recipients">
                      <SelectTrigger>
                        <SelectValue placeholder="Select recipients" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Contacts (2,847)</SelectItem>
                        <SelectItem value="leads">Leads Only (1,250)</SelectItem>
                        <SelectItem value="customers">Customers Only (890)</SelectItem>
                        <SelectItem value="vip">VIP Customers (156)</SelectItem>
                        <SelectItem value="custom">Custom Selection</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message-content">Message</Label>
                    <Textarea
                      id="message-content"
                      name="content"
                      placeholder="Type your message here... Use {{name}} for personalization"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={4}
                      maxLength={160}
                      required
                    />
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Use {"{{name}}"} for personalization</span>
                      <span>{message.length}/160 characters</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="send-now">Send Time</Label>
                      <Select name="send_time">
                        <SelectTrigger>
                          <SelectValue placeholder="Send now" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="now">Send Now</SelectItem>
                          <SelectItem value="schedule">Schedule for Later</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="campaign-tag">Campaign Tag</Label>
                      <Input id="campaign-tag" name="campaign_tag" placeholder="Optional campaign name" />
                    </div>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Message Preview</h4>
                    <p className="text-blue-800 text-sm">{message || "Your message will appear here..."}</p>
                    <p className="text-blue-600 text-xs mt-2">
                      Estimated cost: $0.{selectedRecipients === "all" ? 28 : selectedRecipients === "leads" ? 13 : 9}(
                      {selectedRecipients === "all" ? "2,847" : selectedRecipients === "leads" ? "1,250" : "890"}{" "}
                      recipients)
                    </p>
                  </div>
                  <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsComposeOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-black text-white hover:bg-gray-800">
                      <Send className="h-4 w-4 mr-2" />
                      Send Message
                    </Button>
                  </div>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Messages Today</p>
                  <p className="text-2xl font-bold text-gray-900">1,247</p>
                  <p className="text-sm text-green-600 font-medium">+8% from yesterday</p>
                </div>
                <MessageSquare className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Delivery Rate</p>
                  <p className="text-2xl font-bold text-gray-900">96.1%</p>
                  <p className="text-sm text-green-600 font-medium">+1.2% this week</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Response Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{responseRate}%</p>
                  <p className="text-sm text-green-600 font-medium">+3.2% this month</p>
                </div>
                <MessageSquare className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Cost Today</p>
                  <p className="text-2xl font-bold text-gray-900">$12.47</p>
                  <p className="text-sm text-gray-600">$0.01 per message</p>
                </div>
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6 bg-white">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                  <Input placeholder="Search messages..." className="pl-10" />
                </div>
              </div>
              <div className="flex gap-3">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Delivered">Delivered</SelectItem>
                    <SelectItem value="Sending">Sending</SelectItem>
                    <SelectItem value="Failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={campaignFilter} onValueChange={setCampaignFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Campaign" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Campaigns</SelectItem>
                    <SelectItem value="Holiday Promotion">Holiday Promotion</SelectItem>
                    <SelectItem value="Follow-up">Follow-up</SelectItem>
                    <SelectItem value="Welcome Series">Welcome Series</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Messages List */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Recent Messages</CardTitle>
            <CardDescription>View and manage your sent messages</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredMessages.map((msg) => (
                <div key={msg.id} className="border rounded-lg p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        {getStatusIcon(msg.status)}
                        <Badge className={getStatusColor(msg.status)}>{msg.status}</Badge>
                        <span className="text-sm text-gray-600">{msg.campaign}</span>
                      </div>
                      <p className="text-gray-900 mb-3 leading-relaxed">{msg.content}</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Recipients:</span> {msg.recipients}
                        </div>
                        <div>
                          <span className="font-medium">Sent:</span> {msg.sent}
                        </div>
                        <div>
                          <span className="font-medium">Responses:</span> {msg.responses}
                        </div>
                        <div>
                          <span className="font-medium">Rate:</span>{" "}
                          {msg.responses > 0 ? `${((msg.responses / msg.recipients) * 100).toFixed(1)}%` : "0%"}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="bg-white text-gray-700 border-gray-300">
                        View Details
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-white text-gray-700 border-gray-300"
                        disabled={isDemo}
                      >
                        Resend
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
