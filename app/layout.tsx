// app/layout.tsx
import React from 'react'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navigation from '@/components/navigation'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AI Dialer - Smart Communication Platform',
  description: 'AI-powered dialer application for contact management, drip campaigns, and text messaging',
  generator: 'v0.dev',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* ThemeProvider is a client component; it will toggle class="dark" on <html> */}
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <body
          className={`
            ${inter.className}
            min-h-screen
            bg-white text-gray-900
            dark:bg-gray-900 dark:text-gray-100
            transition-colors duration-200
          `}
        >
          <Navigation />
          <main>{children}</main>
          <Toaster />
        </body>
      </ThemeProvider>
    </html>
  )
}
