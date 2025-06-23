import { createClient } from "@supabase/supabase-js"

// Use the NEXT_PUBLIC_ environment variables that are actually available
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable")
}

if (!supabaseAnonKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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
