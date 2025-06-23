"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Phone, PhoneCall, PhoneOff, Mic, MicOff, Volume2, VolumeX, Clock, User } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

function getDialerConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Remove this line:
  // return {
  //   isDemo: false, // Temporarily force this to test
  // }

  // Replace with:
  const isDemo = !(supabaseUrl && supabaseAnonKey)
  return { isDemo }
}

export default function DialerPage() {
  const [isCallActive, setIsCallActive] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isSpeakerOn, setIsSpeakerOn] = useState(false)
  const [callDuration, setCallDuration] = useState("00:00")
  const [selectedContact, setSelectedContact] = useState<any>(null)

  const { isDemo } = getDialerConfig()

  const contacts = [
    { id: 1, name: "John Smith", phone: "+1 (555) 123-4567", status: "Lead", lastCall: "Never" },
    { id: 2, name: "Sarah Johnson", phone: "+1 (555) 987-6543", status: "Customer", lastCall: "2 days ago" },
    { id: 3, name: "Mike Davis", phone: "+1 (555) 456-7890", status: "Prospect", lastCall: "1 week ago" },
  ]

  const recentCalls = [
    { id: 1, name: "John Smith", phone: "+1 (555) 123-4567", duration: "3:45", status: "Completed", time: "10:30 AM" },
    {
      id: 2,
      name: "Sarah Johnson",
      phone: "+1 (555) 987-6543",
      duration: "1:20",
      status: "No Answer",
      time: "10:15 AM",
    },
    { id: 3, name: "Mike Davis", phone: "+1 (555) 456-7890", duration: "5:12", status: "Completed", time: "9:45 AM" },
  ]

  const handleCall = (contact: any) => {
    setSelectedContact(contact)
    setIsCallActive(true)
    // Simulate call duration timer
    let seconds = 0
    const timer = setInterval(() => {
      seconds++
      const mins = Math.floor(seconds / 60)
      const secs = seconds % 60
      setCallDuration(`${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`)
    }, 1000)

    // Auto end call after demo
    setTimeout(() => {
      clearInterval(timer)
      setIsCallActive(false)
      setCallDuration("00:00")
      setSelectedContact(null)
    }, 10000)
  }

  const endCall = () => {
    setIsCallActive(false)
    setCallDuration("00:00")
    setSelectedContact(null)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">AI Dialer</h1>
            {isDemo && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Demo Mode
              </span>
            )}
          </div>
          <p className="text-gray-600 mt-2">Make AI-powered calls to your contacts</p>
          {isDemo && <p className="text-sm text-yellow-700 mt-1">Connect to Supabase to enable call logging</p>}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Dialer Interface */}
          <div className="lg:col-span-2">
            <Card className="bg-white mb-6">
              <CardHeader>
                <CardTitle>Dialer Interface</CardTitle>
                <CardDescription>Select a contact or enter a number to call</CardDescription>
              </CardHeader>
              <CardContent>
                {!isCallActive ? (
                  <div className="space-y-6">
                    {/* Manual Number Input */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Phone Number</label>
                      <Input placeholder="+1 (555) 123-4567" className="text-lg" />
                    </div>

                    {/* Quick Contact Selection */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Quick Select Contact</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a contact to call" />
                        </SelectTrigger>
                        <SelectContent>
                          {contacts.map((contact) => (
                            <SelectItem key={contact.id} value={contact.id.toString()}>
                              {contact.name} - {contact.phone}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Call Button */}
                    <Button
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg"
                      onClick={() => handleCall(contacts[0])}
                    >
                      <PhoneCall className="h-5 w-5 mr-2" />
                      Start Call
                    </Button>
                  </div>
                ) : (
                  /* Active Call Interface */
                  <div className="text-center space-y-6">
                    <div className="space-y-2">
                      <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto flex items-center justify-center">
                        <User className="h-10 w-10 text-gray-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900">{selectedContact?.name}</h3>
                      <p className="text-gray-600">{selectedContact?.phone}</p>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Connected
                      </Badge>
                    </div>

                    <div className="text-2xl font-mono text-gray-900">{callDuration}</div>

                    {/* Call Controls */}
                    <div className="flex justify-center space-x-4">
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={() => setIsMuted(!isMuted)}
                        className={`${isMuted ? "bg-red-100 border-red-300" : "bg-white border-gray-300"}`}
                      >
                        {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                      </Button>
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                        className={`${isSpeakerOn ? "bg-blue-100 border-blue-300" : "bg-white border-gray-300"}`}
                      >
                        {isSpeakerOn ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
                      </Button>
                      <Button size="lg" onClick={endCall} className="bg-red-600 hover:bg-red-700 text-white">
                        <PhoneOff className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Contact List */}
            <Card className="bg-white">
              <CardHeader>
                <CardTitle>Quick Dial Contacts</CardTitle>
                <CardDescription>Your most frequently called contacts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {contacts.map((contact) => (
                    <div
                      key={contact.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{contact.name}</h4>
                        <p className="text-sm text-gray-600">{contact.phone}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {contact.status}
                          </Badge>
                          <span className="text-xs text-gray-500">Last call: {contact.lastCall}</span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleCall(contact)}
                        disabled={isCallActive}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Phone className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Call Stats */}
            <Card className="bg-white">
              <CardHeader>
                <CardTitle>Today's Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Calls Made</span>
                  <span className="font-semibold">23</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Connected</span>
                  <span className="font-semibold text-green-600">18</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">No Answer</span>
                  <span className="font-semibold text-yellow-600">5</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Duration</span>
                  <span className="font-semibold">2h 34m</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Success Rate</span>
                  <span className="font-semibold text-blue-600">78%</span>
                </div>
              </CardContent>
            </Card>

            {/* Recent Calls */}
            <Card className="bg-white">
              <CardHeader>
                <CardTitle>Recent Calls</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentCalls.map((call) => (
                    <div key={call.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 text-sm">{call.name}</h4>
                        <p className="text-xs text-gray-600">{call.phone}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-500">{call.time}</span>
                          <Badge
                            variant="secondary"
                            className={`text-xs ${
                              call.status === "Completed"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {call.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-medium text-gray-900">{call.duration}</p>
                        <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                          <Phone className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* AI Assistant */}
            <Card className="bg-white">
              <CardHeader>
                <CardTitle>AI Assistant</CardTitle>
                <CardDescription>Smart suggestions for your calls</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-900 font-medium">Suggested Script</p>
                    <p className="text-xs text-blue-800 mt-1">
                      "Hi [Name], this is [Your Name] from [Company]. I'm calling about..."
                    </p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-900 font-medium">Best Time to Call</p>
                    <p className="text-xs text-green-800 mt-1">Based on data, 2-4 PM has the highest answer rate</p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <p className="text-sm text-purple-900 font-medium">Follow-up Reminder</p>
                    <p className="text-xs text-purple-800 mt-1">3 contacts need follow-up calls today</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
