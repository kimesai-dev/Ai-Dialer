import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    message: "API routes are working!",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    supabaseConfigured: !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    twilioConfigured: !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN),
  })
}
