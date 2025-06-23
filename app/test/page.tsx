"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle } from "lucide-react"

export default function TestPage() {
  const routes = [
    { name: "Dashboard", path: "/", description: "Main dashboard with stats and overview" },
    { name: "Contacts", path: "/contacts", description: "Contact management and CSV upload" },
    { name: "Campaigns", path: "/campaigns", description: "Drip campaign management" },
    { name: "Messages", path: "/messages", description: "Text message sending and tracking" },
    { name: "Dialer", path: "/dialer", description: "AI-powered calling interface" },
    { name: "Settings", path: "/settings", description: "Application settings and configuration" },
  ]

  // Check if Supabase is configured using the correct environment variable names
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Application Test Page</h1>
          <p className="text-gray-600 mt-2">Verify all pages load without errors</p>
        </div>

        {/* Configuration Status */}
        <Card className="mb-8 bg-white">
          <CardHeader>
            <CardTitle>Configuration Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              {isSupabaseConfigured ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-green-800 font-medium">Supabase Configured</span>
                  <span className="text-sm text-gray-600">- Full functionality available</span>
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-yellow-600" />
                  <span className="text-yellow-800 font-medium">Demo Mode</span>
                  <span className="text-sm text-gray-600">- Using mock data</span>
                </>
              )}
            </div>
            <div className="mt-4 text-sm text-gray-600">
              <p>
                <strong>Supabase URL:</strong> {supabaseUrl ? "✓ Set" : "✗ Missing"}
              </p>
              <p>
                <strong>Supabase Anon Key:</strong> {supabaseAnonKey ? "✓ Set" : "✗ Missing"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Route Testing */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Page Routes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {routes.map((route) => (
                <div key={route.path} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{route.name}</h3>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{route.description}</p>
                  <div className="flex gap-2">
                    <Link href={route.path}>
                      <Button size="sm" variant="outline" className="bg-white text-gray-700 border-gray-300">
                        Visit Page
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-white text-gray-700 border-gray-300"
                      onClick={() => window.open(route.path, "_blank")}
                    >
                      Open in New Tab
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Environment Variables */}
        <Card className="mt-8 bg-white">
          <CardHeader>
            <CardTitle>Environment Variables</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="font-medium">NEXT_PUBLIC_SUPABASE_URL:</span>
                <span className={supabaseUrl ? "text-green-600" : "text-red-600"}>
                  {supabaseUrl ? "Configured" : "Missing"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">NEXT_PUBLIC_SUPABASE_ANON_KEY:</span>
                <span className={supabaseAnonKey ? "text-green-600" : "text-red-600"}>
                  {supabaseAnonKey ? "Configured" : "Missing"}
                </span>
              </div>
            </div>
            {!isSupabaseConfigured && (
              <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> To enable full functionality, add the following environment variables:
                </p>
                <ul className="mt-2 text-xs text-yellow-700 space-y-1">
                  <li>• NEXT_PUBLIC_SUPABASE_URL=your_supabase_url</li>
                  <li>• NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key</li>
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
