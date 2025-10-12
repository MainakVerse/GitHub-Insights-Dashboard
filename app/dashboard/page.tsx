"use client"

import { Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, Users, GitFork, Star, Calendar, ExternalLink, RefreshCw } from "lucide-react"
import Link from "next/link"
import { LanguageChart } from "@/components/charts/language-chart"
import { CommitActivityChart } from "@/components/charts/commit-activity-chart"
import { RepoTimelineChart } from "@/components/charts/repo-timeline-chart"
import { ContributionHeatmap } from "@/components/charts/contribution-heatmap"
import { useGitHubData } from "@/hooks/use-github-data"
import { RefreshIndicator } from "@/components/refresh-indicator"

function DashboardContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const username = searchParams.get("user")

  const { data, loading, error, lastRefresh, refresh, timeUntilNextRefresh } = useGitHubData(username)

  if (!username) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>No Username Provided</CardTitle>
            <CardDescription>Please enter a GitHub username to view the dashboard.</CardDescription>
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

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="container mx-auto max-w-7xl">
          <Skeleton className="mb-6 h-12 w-64" />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="max-w-md border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-3">
            <Button onClick={() => router.push("/")} variant="outline" className="flex-1">
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push("/")} className="hover:bg-card">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="font-mono text-xl font-bold">GitHub Insight Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <RefreshIndicator lastRefresh={lastRefresh} timeUntilNextRefresh={timeUntilNextRefresh} loading={loading} />
            <Button variant="outline" size="sm" onClick={refresh} disabled={loading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 rounded-lg border border-primary/20 bg-primary/5 p-4">
          <div className="flex items-center gap-2 text-sm">
            <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
            <span className="font-semibold text-foreground">Live Updates Enabled</span>
            <span className="text-muted-foreground">
              Dashboard syncs with GitHub every 5 minutes to reflect real-time changes
            </span>
          </div>
        </div>

        {/* Profile Overview */}
        <Card className="mb-6 border-border bg-card">
          <CardContent className="p-6">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
              <Avatar className="h-24 w-24 ring-2 ring-primary/20">
                <AvatarImage src={data.user.avatar_url || "/placeholder.svg"} alt={data.user.login} />
                <AvatarFallback>{data.user.login[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="mb-2 flex flex-wrap items-center gap-3">
                  <h2 className="text-2xl font-bold text-foreground">{data.user.name || data.user.login}</h2>
                  <Link href={data.user.html_url} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                      <ExternalLink className="h-4 w-4" />
                      View on GitHub
                    </Button>
                  </Link>
                </div>
                <p className="mb-4 font-mono text-sm text-muted-foreground">@{data.user.login}</p>
                {data.user.bio && <p className="mb-4 leading-relaxed text-foreground">{data.user.bio}</p>}
                <div className="flex flex-wrap gap-4 text-sm">
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
                      Joined {new Date(data.user.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        {/* Stats Grid (Repositories + Languages + Stars + Orgs) */}
<div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
  <Card className="border-border bg-card">
    <CardHeader className="pb-3">
      <CardTitle className="text-sm font-medium text-muted-foreground">Total Repositories</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-bold text-foreground">{data.repos.total}</div>
    </CardContent>
  </Card>

  <Card className="border-border bg-card">
    <CardHeader className="pb-3">
      <CardTitle className="text-sm font-medium text-muted-foreground">Languages Used</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-bold text-foreground">{Object.keys(data.languages).length}</div>
    </CardContent>
  </Card>

  <Card className="border-border bg-card">
    <CardHeader className="pb-3">
      <CardTitle className="text-sm font-medium text-muted-foreground">Total Stars</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-bold text-foreground">
        {data.stats?.totalStars?.toLocaleString() ||
          data.repos.top.reduce((sum, repo) => sum + repo.stargazers_count, 0)}
      </div>
    </CardContent>
  </Card>

  <Card className="border-border bg-card">
    <CardHeader className="pb-3">
      <CardTitle className="text-sm font-medium text-muted-foreground">Organizations</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-bold text-foreground">{data.organizations.length}</div>
    </CardContent>
  </Card>
</div>

{/* Developer Activity Stats */}
<div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
  <Card className="border-border bg-card">
    <CardHeader className="pb-3">
      <CardTitle className="text-sm font-medium text-muted-foreground">Total Commits</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-bold text-foreground">
        {data.stats?.totalCommits?.toLocaleString() ?? "—"}
      </div>
    </CardContent>
  </Card>

  <Card className="border-border bg-card">
    <CardHeader className="pb-3">
      <CardTitle className="text-sm font-medium text-muted-foreground">Pull Requests</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-bold text-foreground">
        {data.stats?.totalPRs?.toLocaleString() ?? "—"}
      </div>
    </CardContent>
  </Card>

  <Card className="border-border bg-card">
    <CardHeader className="pb-3">
      <CardTitle className="text-sm font-medium text-muted-foreground">Issues Created</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-bold text-foreground">
        {data.stats?.totalIssues?.toLocaleString() ?? "—"}
      </div>
    </CardContent>
  </Card>

  <Card className="border-border bg-card">
    <CardHeader className="pb-3">
      <CardTitle className="text-sm font-medium text-muted-foreground">Code Reviews</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-bold text-foreground">
        {data.stats?.totalReviews?.toLocaleString() ?? "—"}
      </div>
    </CardContent>
  </Card>

  <Card className="border-border bg-card">
    <CardHeader className="pb-3">
      <CardTitle className="text-sm font-medium text-muted-foreground">Private Contributions</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-bold text-foreground">
        {data.stats?.totalPrivateContributions?.toLocaleString() ?? "—"}
      </div>
      {data.stats?.totalPrivateContributions > 0 && (
        <p className="mt-1 text-xs text-muted-foreground">Included in totals</p>
      )}
    </CardContent>
  </Card>
</div>


        {/* Top Repositories */}
        <Card className="mb-6 border-border bg-card">
          <CardHeader>
            <CardTitle>Top Repositories</CardTitle>
            <CardDescription>Your most starred repositories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.repos.top.map((repo) => (
                <div
                  key={repo.name}
                  className="flex items-start justify-between border-b border-border pb-4 last:border-0 last:pb-0"
                >
                  <div className="flex-1">
                    <Link
                      href={repo.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group mb-1 flex items-center gap-2"
                    >
                      <h3 className="font-mono font-semibold text-foreground group-hover:text-primary">{repo.name}</h3>
                      <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                    </Link>
                    {repo.description && <p className="mb-2 text-sm text-muted-foreground">{repo.description}</p>}
                    <div className="flex items-center gap-4 text-sm">
                      {repo.language && (
                        <span className="flex items-center gap-1">
                          <span className="h-3 w-3 rounded-full bg-primary" />
                          <span className="font-mono text-muted-foreground">{repo.language}</span>
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Star className="h-3 w-3" />
                        {repo.stargazers_count}
                      </span>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <GitFork className="h-3 w-3" />
                        {repo.forks_count}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Charts Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          <LanguageChart data={data.languages} />
          <RepoTimelineChart data={data.repos.timeline} />
          
          <ContributionHeatmap data={data.commits.contributions} />
        </div>

        {/* Organizations */}
        {data.organizations.length > 0 && (
          <Card className="mt-6 border-border bg-card">
            <CardHeader>
              <CardTitle>Organizations</CardTitle>
              <CardDescription>Organizations you belong to</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {data.organizations.map((org) => (
                  <div
                    key={org.login}
                    className="flex items-center gap-3 rounded-lg border border-border bg-secondary/50 p-3"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={org.avatar_url || "/placeholder.svg"} alt={org.login} />
                      <AvatarFallback>{org.login[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 overflow-hidden">
                      <p className="truncate font-mono text-sm font-semibold text-foreground">{org.login}</p>
                      {org.description && <p className="truncate text-xs text-muted-foreground">{org.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
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
