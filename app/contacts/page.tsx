import { supabase } from "@/lib/supabase"
import ContactsClient from "@/components/contacts-client"

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

// Mock data fallback
const mockContacts: Contact[] = [
  {
    id: "1",
    name: "John Smith",
    phone: "+1 (555) 123-4567",
    email: "john.smith@email.com",
    location: "New York, NY",
    status: "Lead",
    tags: ["High Priority", "Warm Lead"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    last_contacted: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    notes: "Interested in premium package",
  },
]

async function getContactsData() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const isDemo = !(supabaseUrl && supabaseAnonKey)

  if (isDemo) {
    console.log("Running in demo mode - Supabase not configured")
    return { contacts: mockContacts, isDemo: true }
  }

  try {
    console.log("Fetching contacts from Supabase...")
    const { data: contacts, error } = await supabase
      .from("contacts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50)

    if (error) {
      console.error("Supabase error:", error)
      return { contacts: mockContacts, isDemo: true }
    }

    console.log("Fetched contacts:", contacts?.length || 0)
    return { contacts: contacts || [], isDemo: false }
  } catch (error) {
    console.error("Error connecting to Supabase:", error)
    return { contacts: mockContacts, isDemo: true }
  }
}

export default function ContactsPage() {
  return <ContactsClient />
}
