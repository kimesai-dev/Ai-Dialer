"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function EnvTestPage() {
  // Check all possible environment variable names
  const nextPublicUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const nextPublicKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_KEY

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Environment Variables Test</h1>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Environment Variables Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Next.js Public Variables:</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>NEXT_PUBLIC_SUPABASE_URL:</span>
                      <span className={nextPublicUrl ? "text-green-600" : "text-red-600"}>
                        {nextPublicUrl ? "✅ Found" : "❌ Missing"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>NEXT_PUBLIC_SUPABASE_ANON_KEY:</span>
                      <span className={nextPublicKey ? "text-green-600" : "text-red-600"}>
                        {nextPublicKey ? "✅ Found" : "❌ Missing"}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Server Variables:</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>SUPABASE_URL:</span>
                      <span className={supabaseUrl ? "text-green-600" : "text-red-600"}>
                        {supabaseUrl ? "✅ Found" : "❌ Missing"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>SUPABASE_KEY:</span>
                      <span className={supabaseKey ? "text-green-600" : "text-red-600"}>
                        {supabaseKey ? "✅ Found" : "❌ Missing"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {nextPublicUrl && (
                <div className="mt-6 p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">Values Preview:</h4>
                  <div className="text-sm text-green-700 space-y-1">
                    <div>URL: {nextPublicUrl.substring(0, 30)}...</div>
                    <div>Key: {nextPublicKey?.substring(0, 30)}...</div>
                  </div>
                </div>
              )}

              {!nextPublicUrl && (
                <div className="mt-6 p-4 bg-red-50 rounded-lg">
                  <h4 className="font-semibold text-red-800 mb-2">Troubleshooting Steps:</h4>
                  <ol className="text-sm text-red-700 space-y-1 list-decimal list-inside">
                    <li>Make sure .env.local is in your project root (same level as package.json)</li>
                    <li>Restart your development server completely (Ctrl+C then npm run dev)</li>
                    <li>Check that there are no spaces around the = sign in your .env.local file</li>
                    <li>Make sure the file is named exactly ".env.local" (not .env.local.txt)</li>
                  </ol>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>All Environment Variables</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              <p className="mb-2">All environment variables starting with NEXT_PUBLIC:</p>
              <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto">
                {JSON.stringify(
                  Object.keys(process.env)
                    .filter((key) => key.startsWith("NEXT_PUBLIC"))
                    .reduce(
                      (obj, key) => {
                        obj[key] = process.env[key]?.substring(0, 20) + "..."
                        return obj
                      },
                      {} as Record<string, string>,
                    ),
                  null,
                  2,
                )}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
