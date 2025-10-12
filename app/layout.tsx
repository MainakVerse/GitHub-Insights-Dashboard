import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"

import "./globals.css"

export const metadata: Metadata = {
  title: "GitHub Insight Dashboard",
  description: "Visualize your complete GitHub journey in seconds",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        {/* ✅ Wrap the entire app in SessionWrapper (client-safe) */}
       
          <Suspense
            fallback={
              <div className="flex min-h-screen items-center justify-center text-muted-foreground">
                Loading...
              </div>
            }
          >
            {children}
          </Suspense>
          <Analytics />
       
      </body>
    </html>
  )
}
