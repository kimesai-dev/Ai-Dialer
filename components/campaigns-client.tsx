"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Plus, Play, Pause, Edit, Trash2, Calendar, Users, TrendingUp } from "lucide-react"
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

interface Campaign {
  id: string
  name: string
  description?: string
  status: string
  message_template: string
  contact_filter?: any
  send_time?: string
  created_at: string
  updated_at: string
  next_send_date?: string
  total_contacts: number
  messages_sent: number
  responses_received: number
}

interface CampaignsClientProps {
  initialCampaigns: Campaign[]
  isDemo: boolean
}

export default function CampaignsClient({ initialCampaigns, isDemo }: CampaignsClientProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800"
      case "Paused":
        return "bg-yellow-100 text-yellow-800"
      case "Draft":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleCreateCampaign = async (formData: FormData) => {
    if (isDemo) {
      toast({
        title: "Action unavailable",
        description: "Campaign creation requires Supabase connection",
      })
      return
    }

    // In a real implementation, this would call the API
    setIsCreateDialogOpen(false)
  }

  const handleStatusChange = async (campaignId: string, newStatus: string) => {
    if (isDemo) {
      // Update local state for demo
      setCampaigns(campaigns.map((c) => (c.id === campaignId ? { ...c, status: newStatus } : c)))
      return
    }

    // In a real implementation, this would call the API
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">Drip Campaigns</h1>
              {isDemo && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Demo Mode
                </span>
              )}
            </div>
            <p className="text-gray-600">Create and manage automated messaging campaigns</p>
            {isDemo && (
              <p className="text-sm text-yellow-700 mt-1">Connect to Supabase to enable campaign management</p>
            )}
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-black text-white hover:bg-gray-800 mt-4 sm:mt-0" disabled={isDemo}>
                <Plus className="h-4 w-4 mr-2" />
                Create Campaign
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Create New Campaign</DialogTitle>
                <DialogDescription>
                  Set up a new drip campaign to engage with your contacts automatically.
                </DialogDescription>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  const formData = new FormData(e.currentTarget)
                  handleCreateCampaign(formData)
                }}
              >
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="campaign-name">Campaign Name</Label>
                    <Input id="campaign-name" name="name" placeholder="Enter campaign name" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="campaign-description">Description</Label>
                    <Textarea id="campaign-description" name="description" placeholder="Describe your campaign..." />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contact-list">Contact List</Label>
                      <Select name="contact_list">
                        <SelectTrigger>
                          <SelectValue placeholder="Select contacts" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Contacts</SelectItem>
                          <SelectItem value="leads">Leads Only</SelectItem>
                          <SelectItem value="customers">Customers Only</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="send-time">Send Time</Label>
                      <Select name="send_time">
                        <SelectTrigger>
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="9am">9:00 AM</SelectItem>
                          <SelectItem value="12pm">12:00 PM</SelectItem>
                          <SelectItem value="3pm">3:00 PM</SelectItem>
                          <SelectItem value="6pm">6:00 PM</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message-template">Message Template</Label>
                    <Textarea
                      id="message-template"
                      name="message_template"
                      placeholder="Hi {{name}}, we have an exciting offer for you..."
                      rows={4}
                      required
                    />
                  </div>
                  <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-black text-white hover:bg-gray-800">
                      Create Campaign
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
                  <p className="text-sm font-medium text-gray-600">Total Campaigns</p>
                  <p className="text-2xl font-bold text-gray-900">{campaigns.length}</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Campaigns</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {campaigns.filter((c) => c.status === "Active").length}
                  </p>
                </div>
                <Play className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Contacts</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {campaigns.reduce((sum, c) => sum + c.total_contacts, 0).toLocaleString()}
                  </p>
                </div>
                <Users className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Response Rate</p>
                  <p className="text-2xl font-bold text-gray-900">8.5%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Campaigns List */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Your Campaigns</CardTitle>
            <CardDescription>Manage your drip campaigns and track performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {campaigns.map((campaign) => (
                <div key={campaign.id} className="border rounded-lg p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{campaign.name}</h3>
                        <Badge className={getStatusColor(campaign.status)}>{campaign.status}</Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Contacts:</span> {campaign.total_contacts.toLocaleString()}
                        </div>
                        <div>
                          <span className="font-medium">Sent:</span> {campaign.messages_sent.toLocaleString()}
                        </div>
                        <div>
                          <span className="font-medium">Responses:</span> {campaign.responses_received}
                        </div>
                        <div>
                          <span className="font-medium">Rate:</span>{" "}
                          {campaign.messages_sent > 0
                            ? `${((campaign.responses_received / campaign.messages_sent) * 100).toFixed(1)}%`
                            : "0%"}
                        </div>
                      </div>
                      <div className="mt-2 text-sm text-gray-600">
                        <span className="font-medium">Next Send:</span>{" "}
                        {campaign.next_send_date ? new Date(campaign.next_send_date).toLocaleString() : "Not scheduled"}{" "}
                        •<span className="ml-1">Created: {new Date(campaign.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4 lg:mt-0">
                      {campaign.status === "Active" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-white text-gray-700 border-gray-300"
                          onClick={() => handleStatusChange(campaign.id, "Paused")}
                        >
                          <Pause className="h-4 w-4 mr-1" />
                          Pause
                        </Button>
                      ) : campaign.status === "Paused" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-white text-gray-700 border-gray-300"
                          onClick={() => handleStatusChange(campaign.id, "Active")}
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Resume
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          className="bg-black text-white hover:bg-gray-800"
                          onClick={() => handleStatusChange(campaign.id, "Active")}
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Start
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-white text-gray-700 border-gray-300"
                        disabled={isDemo}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-white text-red-600 border-red-300 hover:bg-red-50"
                        disabled={isDemo}
                      >
                        <Trash2 className="h-4 w-4" />
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
