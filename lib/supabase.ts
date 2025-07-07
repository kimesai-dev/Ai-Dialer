import { createClient } from "@supabase/supabase-js"

// ✅ Use backend env vars if available, fallback to frontend public ones
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error("Missing SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL environment variable")
}

if (!supabaseKey) {
  throw new Error("Missing SUPABASE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable")
}

export const supabase = createClient(supabaseUrl, supabaseKey)

// Updated Contact interface with new location fields
export interface Contact {
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

export interface Campaign {
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

export interface Message {
  id: string
  contact_id: string
  campaign_id?: string
  content: string
  status: string
  sent_at?: string
  delivered_at?: string
  response_received: boolean
  response_content?: string
  response_at?: string
  created_at: string
  contact?: Contact
  campaign?: Campaign
}

export interface CallLog {
  id: string
  contact_id: string
  duration?: number
  status: string
  notes?: string
  recording_url?: string
  created_at: string
  contact?: Contact
}
