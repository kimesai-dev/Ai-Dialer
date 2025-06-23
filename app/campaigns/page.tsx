import { supabase } from "@/lib/supabase"
import CampaignsClient from "@/components/campaigns-client"

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

// Mock data fallback
const mockCampaigns: Campaign[] = [
  {
    id: "1",
    name: "Holiday Promotion",
    description: "Special holiday offers for all customers",
    status: "Active",
    message_template: "Hi {{name}}, we have a special holiday offer just for you!",
    send_time: "09:00:00",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    next_send_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    total_contacts: 1250,
    messages_sent: 3200,
    responses_received: 245,
  },
]

async function getCampaignsData() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const isDemo = !(supabaseUrl && supabaseAnonKey)

  if (isDemo) {
    return { campaigns: mockCampaigns, isDemo: true }
  }

  try {
    const { data: campaigns, error } = await supabase
      .from("campaigns")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching campaigns:", error)
      return { campaigns: mockCampaigns, isDemo: true }
    }

    return { campaigns: campaigns || [], isDemo: false }
  } catch (error) {
    console.error("Error connecting to Supabase:", error)
    return { campaigns: mockCampaigns, isDemo: true }
  }
}

export default async function CampaignsPage() {
  const { campaigns, isDemo } = await getCampaignsData()
  return <CampaignsClient initialCampaigns={campaigns} isDemo={isDemo} />
}
