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
      <div className="flex min-h-screen items-center justify-center p-3 sm:p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1.5 p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl">No Username Provided</CardTitle>
            <CardDescription className="text-sm">
              Please enter a GitHub username to view the dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
            <Button onClick={() => router.push("/")} className="w-full" size="sm">
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
      <div className="min-h-screen bg-background p-3 sm:p-4 md:p-6">
        <div className="mx-auto max-w-7xl">
          <Skeleton className="mb-4 h-8 w-32 sm:mb-6 sm:h-10 sm:w-48 md:h-12 md:w-64" />
          <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-32 sm:h-40 md:h-48" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Error State
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-3 sm:p-4">
        <Card className="w-full max-w-md border-destructive">
          <CardHeader className="space-y-1.5 p-4 sm:p-6">
            <CardTitle className="text-lg text-destructive sm:text-xl">Error</CardTitle>
            <CardDescription className="text-sm">{error}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 p-4 pt-0 sm:flex-row sm:gap-3 sm:p-6 sm:pt-0">
            <Button
              onClick={() => router.push("/")}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              Go Back
            </Button>
            <Button onClick={refresh} size="sm" className="flex-1">
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
    timelineArray = data.repos.timeline
  } else if (typeof data.repos.timeline === "object" && data.repos.timeline !== null) {
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
        <div className="container mx-auto flex flex-col gap-2 px-3 py-2.5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-3 sm:px-4 sm:py-3 md:py-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/")}
              className="h-8 w-8 hover:bg-card sm:h-10 sm:w-10"
            >
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            <h1 className="font-mono text-sm font-bold sm:text-lg md:text-xl">
              GitHub Insight Dashboard
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="flex-1 sm:flex-initial">
              <RefreshIndicator
                lastRefresh={lastRefresh}
                timeUntilNextRefresh={timeUntilNextRefresh}
                loading={loading}
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={refresh}
              disabled={loading}
              className="h-8 flex-1 text-xs sm:h-9 sm:flex-initial sm:text-sm"
            >
              <RefreshCw
                className={`mr-1.5 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-3 py-4 sm:px-4 sm:py-6 md:py-8">
        {/* Live Indicator */}
        <div className="mb-4 rounded-lg border border-primary/20 bg-primary/5 p-2.5 text-xs sm:mb-6 sm:p-3 sm:text-sm md:p-4 md:text-base">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary sm:h-2 sm:w-2" />
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
        <Card className="mb-4 border-border bg-card sm:mb-6">
          <CardContent className="flex flex-col gap-3 p-3 sm:flex-row sm:gap-4 sm:p-4 md:gap-6 md:p-6">
            <Avatar className="h-16 w-16 self-center ring-2 ring-primary/20 sm:h-20 sm:w-20 sm:self-start md:h-24 md:w-24">
              <AvatarImage
                src={data.user.avatar_url || "/placeholder.svg"}
                alt={data.user.login}
              />
              <AvatarFallback>{data.user.login[0].toUpperCase()}</AvatarFallback>
            </Avatar>

            <div className="flex-1 text-center sm:text-left">
              <div className="mb-2 flex flex-col items-center gap-2 sm:flex-row sm:flex-wrap sm:gap-3">
                <h2 className="text-lg font-bold sm:text-xl md:text-2xl">
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
                    className="h-7 gap-1.5 bg-transparent text-xs sm:h-8 sm:gap-2 sm:text-sm"
                  >
                    <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4" />
                    View
                  </Button>
                </Link>
              </div>

              <p className="mb-2 font-mono text-xs text-muted-foreground sm:text-sm">
                @{data.user.login}
              </p>
              {data.user.bio && (
                <p className="mb-3 text-xs leading-relaxed text-foreground sm:text-sm">
                  {data.user.bio}
                </p>
              )}

              <div className="flex flex-wrap justify-center gap-2 text-xs sm:justify-start sm:gap-3 sm:text-sm">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Users className="h-3 w-3 text-muted-foreground sm:h-4 sm:w-4" />
                  <span className="font-semibold">{data.user.followers}</span>
                  <span className="text-muted-foreground">followers</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Users className="h-3 w-3 text-muted-foreground sm:h-4 sm:w-4" />
                  <span className="font-semibold">{data.user.following}</span>
                  <span className="text-muted-foreground">following</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Calendar className="h-3 w-3 text-muted-foreground sm:h-4 sm:w-4" />
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
        <div className="mb-4 grid grid-cols-2 gap-2 sm:mb-6 sm:gap-4 lg:grid-cols-4">
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
              <CardHeader className="p-2.5 pb-1.5 sm:p-3 sm:pb-2 md:pb-2">
                <CardTitle className="text-[10px] font-medium text-muted-foreground sm:text-xs md:text-sm">
                  {title}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2.5 pt-0 sm:p-3 sm:pt-0">
                <div className="text-xl font-bold text-foreground sm:text-2xl md:text-3xl">
                  {value as string}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts */}
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
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
              <div className="rounded-lg border border-border bg-card p-2.5 sm:p-3 md:p-4">
                <div className="mb-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
                  <h3 className="text-sm font-semibold text-foreground sm:text-base md:text-lg">
                    {title}
                  </h3>
                  {description && (
                    <p className="text-[10px] text-muted-foreground sm:text-xs md:text-sm">
                      {description}
                    </p>
                  )}
                </div>
                <div className="relative w-full overflow-x-auto overflow-y-hidden rounded-md border border-border/30 bg-background/50 p-1.5 sm:p-2">
                  <div className="w-full min-h-[180px] flex items-center justify-center sm:min-h-[220px] md:min-h-[280px] lg:min-h-[300px]">
                    <div className="w-full max-w-full overflow-x-auto overflow-y-hidden flex justify-start sm:justify-center items-center">
                      <div className="chart-scale-wrapper w-full min-w-[500px] sm:min-w-0 flex items-center justify-center">
                        <div className="chart-inner-wrapper w-full flex justify-center items-center">
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
        <div className="flex min-h-screen items-center justify-center p-3 sm:p-4">
          <div className="text-center">
            <RefreshCw className="mx-auto mb-3 h-6 w-6 animate-spin text-primary sm:mb-4 sm:h-8 sm:w-8" />
            <p className="text-sm text-muted-foreground sm:text-base">Loading dashboard...</p>
          </div>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  )
}