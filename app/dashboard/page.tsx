"use client"

import { Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ArrowLeft,
  Users,
  GitFork,
  Star,
  Calendar,
  ExternalLink,
  RefreshCw,
} from "lucide-react"
import Link from "next/link"
import { LanguageChart } from "@/components/charts/language-chart"
import { RepoTimelineChart } from "@/components/charts/repo-timeline-chart"
import { ContributionHeatmap } from "@/components/charts/contribution-heatmap"
import { useGitHubData } from "@/hooks/use-github-data"
import { RefreshIndicator } from "@/components/refresh-indicator"

function DashboardContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const username = searchParams.get("user")

  const { data, loading, error, lastRefresh, refresh, timeUntilNextRefresh } =
    useGitHubData(username)

  // No username
  if (!username) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>No Username Provided</CardTitle>
            <CardDescription>
              Please enter a GitHub username to view the dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/")} className="w-full">
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Loading State
  if (loading && !data) {
    return (
      <div className="min-h-screen bg-background p-4 sm:p-6">
        <div className="mx-auto max-w-7xl">
          <Skeleton className="mb-6 h-10 w-48 sm:h-12 sm:w-64" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-40 sm:h-48" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Error State
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 sm:flex-row">
            <Button
              onClick={() => router.push("/")}
              variant="outline"
              className="flex-1"
            >
              Go Back
            </Button>
            <Button onClick={refresh} className="flex-1">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!data) return null

  // ✅ Build Monthly Repo Timeline for 2025
  const currentYear = 2025
  const monthOrder = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ]

  // Convert any timeline shape (array or object) into a unified array
  let timelineArray: any[] = []

  if (Array.isArray(data.repos.timeline)) {
    // Already array (each element likely a repo)
    timelineArray = data.repos.timeline
  } else if (typeof data.repos.timeline === "object" && data.repos.timeline !== null) {
    // Convert object entries like {"2025-03-04": 2}
    timelineArray = Object.entries(data.repos.timeline).map(([key, value]) => ({
      created_at: key,
      count: value,
    }))
  }

  // Group and filter
  const monthlyTimeline = timelineArray
    .filter((repo) => {
      const year = new Date(repo.created_at).getFullYear()
      return year === currentYear
    })
    .reduce((acc: Record<string, number>, repo) => {
      const date = new Date(repo.created_at)
      const month = date.toLocaleString("default", { month: "short" })
      acc[month] = (acc[month] || 0) + 1
      return acc
    }, {})

  const monthlyTimelineData = Object.entries(monthlyTimeline)
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month))

  // ✅ UI Rendering
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/")}
              className="hover:bg-card"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="font-mono text-lg font-bold sm:text-xl">
              GitHub Insight Dashboard
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <RefreshIndicator
              lastRefresh={lastRefresh}
              timeUntilNextRefresh={timeUntilNextRefresh}
              loading={loading}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={refresh}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 sm:py-8">
        {/* Live Indicator */}
        <div className="mb-6 rounded-lg border border-primary/20 bg-primary/5 p-3 sm:p-4 text-sm sm:text-base">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
              <span className="font-semibold text-foreground">
                Live Updates Enabled
              </span>
            </div>
            <span className="text-muted-foreground">
              Syncs every 5 minutes with GitHub
            </span>
          </div>
        </div>

        {/* Profile Overview */}
        <Card className="mb-6 border-border bg-card">
          <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:gap-6 sm:p-6">
            <Avatar className="h-20 w-20 sm:h-24 sm:w-24 ring-2 ring-primary/20">
              <AvatarImage
                src={data.user.avatar_url || "/placeholder.svg"}
                alt={data.user.login}
              />
              <AvatarFallback>{data.user.login[0].toUpperCase()}</AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="mb-2 flex flex-wrap items-center gap-2 sm:gap-3">
                <h2 className="text-xl font-bold sm:text-2xl">
                  {data.user.name || data.user.login}
                </h2>
                <Link
                  href={data.user.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 bg-transparent"
                  >
                    <ExternalLink className="h-4 w-4" />
                    View
                  </Button>
                </Link>
              </div>

              <p className="mb-2 font-mono text-xs sm:text-sm text-muted-foreground">
                @{data.user.login}
              </p>
              {data.user.bio && (
                <p className="mb-3 text-sm leading-relaxed text-foreground">
                  {data.user.bio}
                </p>
              )}

              <div className="flex flex-wrap gap-3 text-xs sm:text-sm">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="font-semibold">{data.user.followers}</span>
                  <span className="text-muted-foreground">followers</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="font-semibold">{data.user.following}</span>
                  <span className="text-muted-foreground">following</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    Joined{" "}
                    {new Date(data.user.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Total Repositories", data.repos.total],
            ["Languages Used", Object.keys(data.languages).length],
            [
              "Total Stars",
              data.stats?.totalStars?.toLocaleString() ??
                data.repos.top.reduce(
                  (sum, repo) => sum + repo.stargazers_count,
                  0
                ),
            ],
            ["Total Commits", data.stats?.totalCommits],
          ].map(([title, value], i) => (
            <Card key={i} className="border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground sm:text-sm">
                  {title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground sm:text-3xl">
                  {value as string}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          {[
            
            {
              title: "Contribution Heatmap",
              description: "Your GitHub activity over the past year",
              Component: (
                <ContributionHeatmap data={data.commits.contributions} />
              ),
              fullWidth: true,
            },
          ].map(({ title, description, Component, fullWidth }, i) => (
            <div key={i} className={fullWidth ? "lg:col-span-2" : ""}>
              <div className="rounded-lg border border-border bg-card p-3 sm:p-4">
                <div className="mb-2 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <h3 className="text-base font-semibold text-foreground sm:text-lg">
                    {title}
                  </h3>
                  {description && (
                    <p className="text-xs text-muted-foreground sm:text-sm">
                      {description}
                    </p>
                  )}
                </div>
                <div className="relative w-full overflow-hidden rounded-md border border-border/30 bg-background/50 p-2">
                  <div className="w-full h-auto min-h-[220px] sm:min-h-[300px] flex items-center justify-center">
                    <div className="w-full max-w-full overflow-hidden flex justify-center items-center">
                      <div className="chart-scale-wrapper w-full h-auto flex items-center justify-center">
                        <div className="chart-inner-wrapper w-full h-auto flex justify-center items-center overflow-hidden">
                          {Component}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="text-center">
            <RefreshCw className="mx-auto mb-4 h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  )
}
