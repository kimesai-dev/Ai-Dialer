"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Upload, Search, Filter, Download, Plus, Phone, Mail, MapPin, Users } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import ContactDetailModal from "./contact-detail-modal"

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

export default function ContactsClient() {
  const [dragActive, setDragActive] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [contacts, setContacts] = useState<Contact[]>([])
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([])
  const [uploading, setUploading] = useState(false)
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isDemo, setIsDemo] = useState(false)

  // Fetch contacts from API on component mount
  useEffect(() => {
    fetchContacts()
  }, [])

  // Filter contacts based on search term and status filter
  useEffect(() => {
    let filtered = contacts

    if (searchTerm) {
      filtered = filtered.filter(
        (contact) =>
          contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          contact.phone.includes(searchTerm) ||
          contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          contact.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          contact.state?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          contact.zipcode?.includes(searchTerm),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((contact) => contact.status === statusFilter)
    }

    setFilteredContacts(filtered)
  }, [contacts, searchTerm, statusFilter])

  // Fetch contacts from API
  const fetchContacts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (searchTerm) params.append("search", searchTerm)
      if (statusFilter !== "all") params.append("status", statusFilter)

      const response = await fetch(`/api/contacts?${params}`)
      const result = await response.json()

      if (response.status === 501) {
        // Supabase not configured - demo mode
        setIsDemo(true)
        setContacts([])
      } else if (result.data) {
        setIsDemo(false)
        setContacts(result.data)
      } else {
        console.error("No data received from API")
        setContacts([])
      }
    } catch (error) {
      console.error("Error fetching contacts:", error)
      setIsDemo(true)
      setContacts([])
    } finally {
      setLoading(false)
    }
  }

  const handleContactClick = (contact: Contact) => {
    setSelectedContact(contact)
    setIsDetailModalOpen(true)
  }

  const handleUpdateContact = (updatedContact: Contact) => {
    setContacts(contacts.map((c) => (c.id === updatedContact.id ? updatedContact : c)))
    setSelectedContact(updatedContact)
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleFileUpload(e.dataTransfer.files[0])
    }
  }

  const handleFileUpload = async (file: File) => {
    if (!file.name.endsWith(".csv")) {
      alert("Please upload a CSV file")
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/contacts/upload", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (result.error) {
        alert(`Error: ${result.error}`)
      } else {
        alert(result.message)
        await fetchContacts() // Refresh the contacts list
      }
    } catch (error) {
      alert("Error uploading file")
    } finally {
      setUploading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0])
    }
  }

  const formatLastContacted = (dateString?: string) => {
    if (!dateString) return "Never"
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) return "1 day ago"
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`
    return `${Math.ceil(diffDays / 30)} months ago`
  }

  const formatAddress = (contact: Contact) => {
    const parts = []
    if (contact.address) parts.push(contact.address)
    if (contact.city) parts.push(contact.city)
    if (contact.state) parts.push(contact.state)
    if (contact.zipcode) parts.push(contact.zipcode)

    if (parts.length === 0 && contact.location) {
      return contact.location
    }

    return parts.join(", ") || "No address"
  }

  const downloadTemplate = () => {
    // Updated CSV template with new location fields
    const csvContent = `Name,Phone,Email,Address,City,State,Zipcode,Location,Status,Tags,Notes
John Doe,+1 (555) 123-4567,john.doe@email.com,"123 Main St, Apt 4B",New York,NY,10001,"New York, NY",Lead,"High Priority;Warm Lead","Interested in our services"
Jane Smith,+1 (555) 987-6543,jane.smith@email.com,"456 Oak Avenue",Los Angeles,CA,90210,"Los Angeles, CA",Customer,"VIP;Repeat Customer","Long-term customer"
Mike Johnson,+1 (555) 456-7890,mike.johnson@email.com,"789 Pine Street, Suite 200",Chicago,IL,60601,"Chicago, IL",Prospect,"Cold Lead","Needs follow-up call"
Sarah Wilson,+1 (555) 321-9876,sarah.wilson@email.com,"321 Elm Drive",Houston,TX,77001,"Houston, TX",Lead,"Qualified Lead","Requested product demo"
Robert Brown,+1 (555) 654-3210,robert.brown@email.com,"654 Maple Lane, Unit 5",Phoenix,AZ,85001,"Phoenix, AZ",Customer,"Active","Recent purchase, very happy"`

    // Create blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)

    link.setAttribute("href", url)
    link.setAttribute("download", "contacts_template.csv")
    link.style.visibility = "hidden"

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading contacts...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">Contacts</h1>
              {isDemo && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Demo Mode
                </span>
              )}
            </div>
            <p className="text-gray-600">Manage your contact database</p>
            {isDemo && (
              <p className="text-sm text-yellow-700 mt-1">
                Connect to Supabase to enable CSV upload and data persistence
              </p>
            )}
          </div>
          <div className="flex gap-3 mt-4 sm:mt-0">
            <Button variant="outline" className="bg-white text-gray-700 border-gray-300">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button className="bg-black text-white hover:bg-gray-800">
              <Plus className="h-4 w-4 mr-2" />
              Add Contact
            </Button>
          </div>
        </div>

        {/* Upload Section */}
        <Card className="mb-8 bg-white">
          <CardHeader>
            <CardTitle>Upload Contacts</CardTitle>
            <CardDescription>
              {isDemo ? "CSV upload requires Supabase connection" : "Import contacts from a CSV file"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive && !isDemo ? "border-blue-400 bg-blue-50" : "border-gray-300 hover:border-gray-400"
              } ${isDemo ? "opacity-50" : ""}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {uploading ? "Uploading..." : "Drop your CSV file here, or click to browse"}
              </h3>
              <p className="text-gray-600 mb-4">
                Supports CSV files with columns: Name, Phone, Email, Address, City, State, Zipcode, Location, Status,
                Tags, Notes
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                <Button
                  variant="outline"
                  className="bg-white text-gray-700 border-gray-300"
                  disabled={uploading || isDemo}
                  onClick={() => document.getElementById("file-upload")?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {uploading ? "Uploading..." : "Choose File"}
                </Button>
                <input id="file-upload" type="file" accept=".csv" onChange={handleFileSelect} className="hidden" />
                <Button variant="outline" className="bg-white text-gray-700 border-gray-300" onClick={downloadTemplate}>
                  Download Template
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search and Filters */}
        <Card className="mb-6 bg-white">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="search" className="sr-only">
                  Search contacts
                </Label>
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Search contacts by name, phone, email, city, state, or zip..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
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
                    <SelectItem value="Lead">Lead</SelectItem>
                    <SelectItem value="Customer">Customer</SelectItem>
                    <SelectItem value="Prospect">Prospect</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contacts List */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Contact List ({filteredContacts.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredContacts.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No contacts found</h3>
                <p className="text-gray-600">
                  {isDemo
                    ? "Connect to Supabase to add real contacts"
                    : "Upload a CSV file or add contacts manually to get started."}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredContacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="flex flex-col lg:flex-row lg:items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => handleContactClick(contact)}
                  >
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900">{contact.name}</h3>
                        <div className="flex gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {contact.status}
                          </Badge>
                          {contact.tags?.map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                          {contact.phone}
                        </div>
                        {contact.email && (
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
                            {contact.email}
                          </div>
                        )}
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                          <span className="truncate">{formatAddress(contact)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mt-3 lg:mt-0">
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Last: {formatLastContacted(contact.last_contacted)}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-white text-gray-700 border-gray-300"
                          onClick={(e) => {
                            e.stopPropagation()
                            // Handle call action
                          }}
                        >
                          <Phone className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-white text-gray-700 border-gray-300"
                          onClick={(e) => {
                            e.stopPropagation()
                            // Handle email action
                          }}
                        >
                          <Mail className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contact Detail Modal */}
        <ContactDetailModal
          contact={selectedContact}
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          onUpdateContact={handleUpdateContact}
          isDemo={isDemo}
        />
      </div>
    </div>
  )
}
