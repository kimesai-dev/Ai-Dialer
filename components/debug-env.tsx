"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function DebugEnv() {
  // Check both client and server environment variables
  const clientSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const clientSupabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // These won't be available on client side, but let's check anyway
  const serverSupabaseUrl = process.env.SUPABASE_URL
  const serverSupabaseKey = process.env.SUPABASE_KEY

  return (
    <Card className="mb-4 bg-yellow-50 border-yellow-200">
      <CardHeader>
        <CardTitle className="text-yellow-800">🔍 Environment Debug Info</CardTitle>
      </CardHeader>
      <CardContent className="text-sm">
        <div className="space-y-2">
          <div>
            <strong>Client-side (NEXT_PUBLIC_*):</strong>
            <ul className="ml-4 mt-1">
              <li>NEXT_PUBLIC_SUPABASE_URL: {clientSupabaseUrl ? "✅ Set" : "❌ Missing"}</li>
              <li>NEXT_PUBLIC_SUPABASE_ANON_KEY: {clientSupabaseKey ? "✅ Set" : "❌ Missing"}</li>
            </ul>
          </div>
          <div>
            <strong>Server-side:</strong>
            <ul className="ml-4 mt-1">
              <li>SUPABASE_URL: {serverSupabaseUrl ? "✅ Set" : "❌ Missing"}</li>
              <li>SUPABASE_KEY: {serverSupabaseKey ? "✅ Set" : "❌ Missing"}</li>
            </ul>
          </div>
          <div className="mt-3 p-2 bg-yellow-100 rounded">
            <strong>Values (first 20 chars):</strong>
            <ul className="ml-4 mt-1 text-xs">
              <li>URL: {clientSupabaseUrl?.substring(0, 20) || "Not found"}...</li>
              <li>Key: {clientSupabaseKey?.substring(0, 20) || "Not found"}...</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
