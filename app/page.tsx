"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession, signIn, signOut } from "next-auth/react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import {
  GitBranch,
  BarChart3,
  Star,
  TrendingUp,
  Github,
  LogIn,
  LogOut,
  Loader2,
} from "lucide-react"

export default function LandingPage() {
  const [username, setUsername] = useState("")
  const router = useRouter()
  const { data: session, status } = useSession()

  // 🔁 Auto-redirect signed-in users to their own dashboard
  useEffect(() => {
    if (status === "authenticated" && session?.user?.login) {
      router.replace(`/dashboard?user=${session.user.login}`)
    }
  }, [status, session, router])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (username.trim()) {
      router.push(`/dashboard?user=${encodeURIComponent(username.trim())}`)
    }
  }

  // 🌀 While session is loading
  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header (Sign in / Profile) */}
      <header className="flex items-center justify-between border-b border-border bg-card/50 px-6 py-3 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Github className="h-5 w-5 text-primary" />
          <span className="font-mono font-semibold text-foreground">GitHub Insight Dashboard</span>
        </div>

       
        
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
        <div className="container relative mx-auto px-4 py-24 sm:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-8 flex justify-center">
              <div className="rounded-full bg-card p-6 shadow-lg ring-1 ring-border">
                <Github className="h-16 w-16 text-primary" />
              </div>
            </div>

            <h1 className="mb-6 text-balance font-mono text-5xl font-bold tracking-tight text-foreground sm:text-6xl">
              GitHub Insight Dashboard
            </h1>

            <p className="mb-12 text-pretty text-xl leading-relaxed text-muted-foreground">
              Visualize your complete GitHub journey in seconds. Analyze repositories, track contributions, and explore
              your coding patterns with beautiful, interactive charts.
            </p>

            {/* Username Input Form */}
            <form onSubmit={handleSubmit} className="mx-auto max-w-md">
              <div className="flex flex-col gap-3 sm:flex-row">
                <Input
                  type="text"
                  placeholder="Enter GitHub username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="h-12 flex-1 bg-card font-mono text-base"
                  required
                />
                <Button
                  type="submit"
                  size="lg"
                  className="h-12 bg-primary px-8 font-semibold hover:bg-primary/90"
                >
                  Generate Dashboard
                </Button>
              </div>
            </form>

            <p className="mt-4 text-sm text-muted-foreground">
              Try it with:{" "}
              <button onClick={() => setUsername("MainakVerse")} className="font-mono text-primary hover:underline">
                MainakVerse
              </button>
              ,{" "}
              <button onClick={() => setUsername("gaearon")} className="font-mono text-primary hover:underline">
                gaearon
              </button>
              , or{" "}
              <button onClick={() => setUsername("tj")} className="font-mono text-primary hover:underline">
                tj
              </button>
            </p>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="border-b border-border py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground">Understand Your GitHub Activity</h2>
            <p className="mb-16 text-lg leading-relaxed text-muted-foreground">
              Get comprehensive insights into your development journey with real-time data visualization and analytics.
            </p>
          </div>

          {/* Features Grid */}
          <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <FeatureCard
              icon={<GitBranch className="h-6 w-6 text-primary" />}
              title="Language Insights"
              desc="Discover your most-used programming languages across all repositories"
            />
            <FeatureCard
              icon={<BarChart3 className="h-6 w-6 text-primary" />}
              title="Commit Analytics"
              desc="Track your contribution patterns and coding activity over time"
            />
            <FeatureCard
              icon={<Star className="h-6 w-6 text-primary" />}
              title="Star Trends"
              desc="Analyze your most popular repositories and their engagement"
            />
            <FeatureCard
              icon={<TrendingUp className="h-6 w-6 text-primary" />}
              title="Dynamic Updates"
              desc="Real-time synchronization with GitHub every 5 minutes"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground">Ready to Explore Your Data?</h2>
            <p className="mb-8 text-lg leading-relaxed text-muted-foreground">
              Enter your GitHub username and explore your data-driven journey. Discover patterns, track progress, and
              gain insights into your development workflow.
            </p>
            <Button
              size="lg"
              onClick={() => document.querySelector("input")?.focus()}
              className="bg-primary px-8 text-lg font-semibold hover:bg-primary/90"
            >
              Try Now
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Built with 💙 by Mainak. Data updates every 5 minutes.</p>
        </div>
      </footer>
    </div>
  )
}

// 🧩 Small helper component for features
function FeatureCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode
  title: string
  desc: string
}) {
  return (
    <Card className="border-border bg-card transition-all hover:border-primary/50">
      <CardContent className="p-6">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">{icon}</div>
        <h3 className="mb-2 font-semibold text-card-foreground">{title}</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">{desc}</p>
      </CardContent>
    </Card>
  )
}
