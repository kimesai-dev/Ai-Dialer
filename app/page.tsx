import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Phone, Users, MessageSquare, TrendingUp, Upload, Calendar, Zap } from 'lucide-react'
import Link from "next/link"
import { supabase } from "@/lib/supabase"

async function getDashboardStats() {
  // Check if Supabase is configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const isDemo = !(supabaseUrl && supabaseAnonKey)

  if (isDemo) {
    console.log("Dashboard running in demo mode - Supabase not configured")
    return {
      totalContacts: 0,
      activeCampaigns: 0,
      messagesToday: 0,
      responseRate: "0%",
      recentCampaigns: [],
      isDemo: true,
    }
  }

  try {
    console.log("🔄 Fetching dashboard data from Supabase...")

    // Fetch real data from Supabase with better error handling
    const [contactsResult, campaignsResult, messagesResult] = await Promise.all([
      supabase.from("contacts").select("*", { count: "exact" }),
      supabase.from("campaigns").select("*").order("created_at", { ascending: false }),
      supabase.from("messages").select("*", { count: "exact" }),
    ])

    // Log detailed results for debugging
    console.log("📊 Raw Supabase results:", {
      contactsCount: contactsResult.count,
      contactsData: contactsResult.data?.length,
      contactsError: contactsResult.error,
      campaignsCount: campaignsResult.data?.length,
      campaignsError: campaignsResult.error,
      messagesCount: messagesResult.count,
      messagesData: messagesResult.data?.length,
      messagesError: messagesResult.error,
    })

    // Check for errors
    if (contactsResult.error) {
      console.error("❌ Contacts fetch error:", contactsResult.error)
    }
    if (campaignsResult.error) {
      console.error("❌ Campaigns fetch error:", campaignsResult.error)
    }
    if (messagesResult.error) {
      console.error("❌ Messages fetch error:", messagesResult.error)
    }

    // Use the count from Supabase, not the data array length
    const totalContacts = contactsResult.count || 0
    const allCampaigns = campaignsResult.data || []
    const activeCampaigns = allCampaigns.filter((c) => c.status === "Active").length

    // For messages today, filter by today's date
    const today = new Date().toISOString().split("T")[0]
    const messagesToday =
      messagesResult.data?.filter((msg) => msg.created_at && msg.created_at.startsWith(today)).length || 0

    const recentCampaigns = allCampaigns.slice(0, 3) // Only show top 3

    // Calculate response rate from real data
    let responseRate = "0%"
    if (allCampaigns.length > 0) {
      const totalSent = allCampaigns.reduce((sum, campaign) => sum + (campaign.messages_sent || 0), 0)
      const totalResponses = allCampaigns.reduce((sum, campaign) => sum + (campaign.responses_received || 0), 0)
      if (totalSent > 0) {
        responseRate = `${((totalResponses / totalSent) * 100).toFixed(1)}%`
      }
    }

    const finalStats = {
      totalContacts,
      activeCampaigns,
      messagesToday,
      responseRate,
      recentCampaigns,
      isDemo: false,
    }

    console.log("✅ Final dashboard stats:", finalStats)

    return finalStats
  } catch (error) {
    console.error("💥 Error fetching dashboard data:", error)
    // Fall back to demo mode if there's an error
    return {
      totalContacts: 0,
      activeCampaigns: 0,
      messagesToday: 0,
      responseRate: "0%",
      recentCampaigns: [],
      isDemo: true,
    }
  }
}

export default async function Dashboard() {
  const stats = await getDashboardStats()

  console.log("🎯 Dashboard rendering with stats:", stats)

  const dashboardStats = [
    {
      title: "Total Contacts",
      value: stats.totalContacts.toLocaleString(),
      change: stats.totalContacts > 0 ? "+12%" : "0%",
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Active Campaigns",
      value: stats.activeCampaigns.toString(),
      change: stats.activeCampaigns > 0 ? "+2" : "0",
      icon: Calendar,
      color: "text-green-600",
    },
    {
      title: "Messages Today",
      value: stats.messagesToday.toLocaleString(),
      change: stats.messagesToday > 0 ? "+8%" : "0%",
      icon: MessageSquare,
      color: "text-purple-600",
    },
    {
      title: "Response Rate",
      value: stats.responseRate,
      change: stats.responseRate !== "0%" ? "+3.2%" : "0%",
      icon: TrendingUp,
      color: "text-orange-600",
    },
  ]

  const quickActions = [
    {
      title: "Upload Contacts",
      description: "Import contacts from CSV file",
      icon: Upload,
      href: "/contacts",
      color: "bg-blue-50 hover:bg-blue-100 border-blue-200",
    },
    {
      title: "Create Campaign",
      description: "Set up a new drip campaign",
      icon: Zap,
      href: "/campaigns",
      color: "bg-green-50 hover:bg-green-100 border-green-200",
    },
    {
      title: "Send Messages",
      description: "Send text messages to contacts",
      icon: MessageSquare,
      href: "/messages",
      color: "bg-purple-50 hover:bg-purple-100 border-purple-200",
    },
    {
      title: "Make Calls",
      description: "Start AI-powered dialing",
      icon: Phone,
      href: "/dialer",
      color: "bg-orange-50 hover:bg-orange-100 border-orange-200",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              AI Dialer Dashboard
            </h1>
            {stats.isDemo && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200">
                Demo Mode
              </span>
            )}
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your contacts, campaigns, and communications
          </p>
          {stats.isDemo && (
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
              Connect to Supabase to enable real data persistence
            </p>
          )}
        </div>

        {/* Live Data Indicator */}
        {!stats.isDemo && (
          <Card className="mb-6 bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-green-800 dark:text-green-200 font-medium">
                  Live Data Connected
                </span>
                <span className="text-green-600 dark:text-green-300 text-sm">
                  • {stats.totalContacts} contacts • {stats.activeCampaigns} active campaigns • {stats.messagesToday} messages today
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {dashboardStats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card key={index} className="bg-white dark:bg-gray-900">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {stat.value}
                      </p>
                      <p className={`text-sm ${stat.color} font-medium`}>
                        {stat.change}
                      </p>
                    </div>
                    <Icon className={`h-8 w-8 ${stat.color}`} />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon
              return (
                <Link key={index} href={action.href}>
                  <Card className={`cursor-pointer transition-colors ${action.color}`}>
                    <CardContent className="p-6 text-center">
                      <Icon className="h-8 w-8 mx-auto mb-3 text-gray-700 dark:text-gray-300" />
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                        {action.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {action.description}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white dark:bg-gray-900">
            <CardHeader>
              <CardTitle className="dark:text-gray-100">Recent Campaigns</CardTitle>
              <CardDescription className="dark:text-gray-400">
                Your latest drip campaigns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recentCampaigns.length > 0 ? (
                  stats.recentCampaigns.map((campaign: any, index: number) => (
                    <div
                      key={campaign.id || index}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {campaign.name}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {campaign.total_contacts} contacts
                        </p>
                      </div>
                      <div className="text-right">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            campaign.status === "Active"
                              ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200"
                              : campaign.status === "Paused"
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          }`}
                        >
                          {campaign.status}
                        </span>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {campaign.messages_sent} sent
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-500 dark:text-gray-400 text-sm">No campaigns yet</p>
                    <Link href="/campaigns">
                      <Button className="mt-2 bg-black text-white hover:bg-gray-800">
                        Create Your First Campaign
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-900">
            <CardHeader>
              <CardTitle className="dark:text-gray-100">Message Performance</CardTitle>
              <CardDescription className="dark:text-gray-400">
                Today's messaging statistics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Messages Sent</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {stats.messagesToday.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Response Rate</span>
                  <span className="font-semibold text-purple-600 dark:text-purple-300">
                    {stats.responseRate}
                  </span>
                </div>
                <div className="pt-4">
                  <Link href="/messages">
                    <Button className="w-full bg-black text-white hover:bg-gray-800">
                      View Detailed Analytics
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
