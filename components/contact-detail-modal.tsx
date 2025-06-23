"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  TrendingUpIcon as TrendingRight,
  Edit,
  Save,
  X,
  ChevronRight,
  Clock,
  CheckCircle,
} from "lucide-react"

interface Contact {
  id: string
  name: string
  phone: string
  email?: string
  address?: string
  city?: string
  state?: string
  zipcode?: string
  location?: string
  status: string
  tags: string[]
  created_at: string
  updated_at: string
  last_contacted?: string
  notes?: string
}

interface ContactDetailModalProps {
  contact: Contact | null
  isOpen: boolean
  onClose: () => void
  onUpdateContact: (contact: Contact) => void
  isDemo: boolean
}

// Pipeline stages - customizable
const PIPELINE_STAGES = [
  { id: "lead", name: "Lead", color: "bg-gray-100 text-gray-800" },
  { id: "qualified", name: "Qualified", color: "bg-blue-100 text-blue-800" },
  { id: "proposal", name: "Proposal Sent", color: "bg-yellow-100 text-yellow-800" },
  { id: "negotiation", name: "Negotiation", color: "bg-orange-100 text-orange-800" },
  { id: "customer", name: "Customer", color: "bg-green-100 text-green-800" },
  { id: "lost", name: "Lost", color: "bg-red-100 text-red-800" },
]

// Mock data for demo
const mockCallHistory = [
  {
    id: "1",
    date: "2024-12-18 2:30 PM",
    duration: "5:23",
    status: "Completed",
    notes: "Discussed pricing options, very interested in premium package",
    transcript: "Agent: Hi John, thanks for taking my call today...\nJohn: Hi, yes I've been expecting your call...",
  },
  {
    id: "2",
    date: "2024-12-15 10:15 AM",
    duration: "2:45",
    status: "Completed",
    notes: "Initial contact, explained our services",
    transcript:
      "Agent: Good morning John, this is Sarah from...\nJohn: Oh yes, I filled out the form on your website...",
  },
]

const mockMessages = [
  {
    id: "1",
    date: "2024-12-19 9:00 AM",
    type: "sent",
    content: "Hi John, following up on our call yesterday. Here's the pricing information you requested.",
    status: "delivered",
  },
  {
    id: "2",
    date: "2024-12-19 9:15 AM",
    type: "received",
    content: "Thanks! This looks good. Can we schedule a demo for next week?",
    status: "read",
  },
]

export default function ContactDetailModal({
  contact,
  isOpen,
  onClose,
  onUpdateContact,
  isDemo,
}: ContactDetailModalProps) {
  const [editingNotes, setEditingNotes] = useState(false)
  const [notes, setNotes] = useState(contact?.notes || "")
  const [selectedStage, setSelectedStage] = useState(contact?.status || "lead")

  if (!contact) return null

  const currentStageIndex = PIPELINE_STAGES.findIndex(
    (stage) => stage.id === selectedStage.toLowerCase() || stage.name.toLowerCase() === selectedStage.toLowerCase(),
  )

  const handleStageChange = (newStage: string) => {
    setSelectedStage(newStage)
    const updatedContact = { ...contact, status: newStage }
    onUpdateContact(updatedContact)
  }

  const handleSaveNotes = () => {
    const updatedContact = { ...contact, notes }
    onUpdateContact(updatedContact)
    setEditingNotes(false)
  }

  const formatAddress = () => {
    const parts = []
    if (contact.address) parts.push(contact.address)
    if (contact.city) parts.push(contact.city)
    if (contact.state) parts.push(contact.state)
    if (contact.zipcode) parts.push(contact.zipcode)
    return parts.join(", ") || contact.location || "No address provided"
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-gray-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{contact.name}</h2>
                <div className="flex gap-2 mt-1">
                  <Badge className={PIPELINE_STAGES[currentStageIndex]?.color || "bg-gray-100 text-gray-800"}>
                    {contact.status}
                  </Badge>
                  {contact.tags?.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span>{contact.phone}</span>
                  <Button size="sm" variant="outline">
                    Call
                  </Button>
                </div>
                {contact.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span>{contact.email}</span>
                    <Button size="sm" variant="outline">
                      Email
                    </Button>
                  </div>
                )}
                <div className="flex items-center gap-3 md:col-span-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span>{formatAddress()}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>Added: {new Date(contact.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span>
                    Last Contact:{" "}
                    {contact.last_contacted ? new Date(contact.last_contacted).toLocaleDateString() : "Never"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pipeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingRight className="h-5 w-5" />
                Sales Pipeline
              </CardTitle>
              <CardDescription>Move contact through your sales process</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Pipeline Visual */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                  {PIPELINE_STAGES.map((stage, index) => (
                    <div key={stage.id} className="flex items-center">
                      <div
                        className={`px-3 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors ${
                          index <= currentStageIndex ? stage.color : "bg-gray-100 text-gray-400"
                        }`}
                        onClick={() => handleStageChange(stage.id)}
                      >
                        {stage.name}
                        {index <= currentStageIndex && <CheckCircle className="h-3 w-3 inline ml-1" />}
                      </div>
                      {index < PIPELINE_STAGES.length - 1 && <ChevronRight className="h-4 w-4 text-gray-400 mx-1" />}
                    </div>
                  ))}
                </div>

                {/* Stage Selector */}
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">Current Stage:</span>
                  <Select value={selectedStage} onValueChange={handleStageChange}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PIPELINE_STAGES.map((stage) => (
                        <SelectItem key={stage.id} value={stage.id}>
                          {stage.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs for detailed information */}
          <Tabs defaultValue="notes" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="notes">Notes</TabsTrigger>
              <TabsTrigger value="calls">Call History</TabsTrigger>
              <TabsTrigger value="messages">Messages</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="notes" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Notes & Comments</span>
                    {!editingNotes ? (
                      <Button size="sm" variant="outline" onClick={() => setEditingNotes(true)}>
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleSaveNotes}>
                          <Save className="h-4 w-4 mr-1" />
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingNotes(false)}>
                          Cancel
                        </Button>
                      </div>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {editingNotes ? (
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add notes about this contact..."
                      rows={6}
                    />
                  ) : (
                    <div className="min-h-[100px] p-3 bg-gray-50 rounded-lg">
                      {notes || contact.notes || "No notes added yet."}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="calls" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Call History</CardTitle>
                  <CardDescription>
                    {isDemo ? "Demo data - Connect to enable real call logging" : "All calls with this contact"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockCallHistory.map((call) => (
                      <div key={call.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-green-600" />
                              <span className="font-medium">{call.date}</span>
                              <Badge variant="secondary">{call.status}</Badge>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">Duration: {call.duration}</p>
                          </div>
                        </div>
                        <p className="text-sm mb-3">{call.notes}</p>
                        <details className="text-sm">
                          <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                            View Transcript
                          </summary>
                          <div className="mt-2 p-3 bg-gray-50 rounded whitespace-pre-line">{call.transcript}</div>
                        </details>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="messages" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Message History</CardTitle>
                  <CardDescription>
                    {isDemo ? "Demo data - Connect to enable real messaging" : "SMS and email conversations"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.type === "sent" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.type === "sent" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-900"
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p className={`text-xs mt-1 ${message.type === "sent" ? "text-blue-100" : "text-gray-500"}`}>
                            {message.date} • {message.status}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Activity Timeline</CardTitle>
                  <CardDescription>Complete history of interactions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium">Stage changed to Qualified</p>
                        <p className="text-sm text-gray-600">Today at 2:30 PM</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium">Call completed (5:23)</p>
                        <p className="text-sm text-gray-600">Yesterday at 2:30 PM</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium">SMS sent</p>
                        <p className="text-sm text-gray-600">Dec 15 at 10:15 AM</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-gray-400 rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium">Contact created</p>
                        <p className="text-sm text-gray-600">{new Date(contact.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}
