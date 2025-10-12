"use client"

import { useState, useEffect, useCallback } from "react"

// ---------- Types ----------
interface Repo {
  name: string
  description: string | null
  stargazers_count: number
  forks_count: number
  language: string | null
  html_url: string
}

interface CommitActivity {
  date: string
  count: number
}

interface ContributionDay {
  date: string
  contributionCount: number
  color: string
}

interface Organization {
  login: string
  avatar_url: string
  description: string | null
}

interface GitHubStats {
  totalRepos: number
  totalLanguages: number
  totalStars: number
  totalForks: number
  totalCommits: number
  totalIssues: number
  totalPRs: number
  totalReviews: number
  totalPrivateContributions: number
}

interface GitHubData {
  stats: GitHubStats
  user: {
    login: string
    name: string | null
    avatar_url: string
    bio: string | null
    followers: number
    following: number
    public_repos: number
    created_at: string
    html_url: string
  }
  repos: {
    total: number
    top: Repo[]
    timeline: { [year: string]: number }
  }
  languages: { [language: string]: number }
  commits: {
    activity: CommitActivity[]
    contributions: ContributionDay[]
  }
  organizations: Organization[]
  lastUpdated: string
}

// ---------- Hook Return Type ----------
interface UseGitHubDataReturn {
  data: GitHubData | null
  loading: boolean
  error: string | null
  lastRefresh: Date
  refresh: () => Promise<void>
  timeUntilNextRefresh: number
}

// ---------- Constants ----------
const REFRESH_INTERVAL = 5 * 60 * 1000 // 5 minutes

// ---------- Hook ----------
export function useGitHubData(username: string | null): UseGitHubDataReturn {
  const [data, setData] = useState<GitHubData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
  const [timeUntilNextRefresh, setTimeUntilNextRefresh] = useState(REFRESH_INTERVAL)

  const fetchData = useCallback(async () => {
    if (!username) {
      setError("No username provided")
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/github/${username}`, {
        headers: { "Cache-Control": "no-cache" },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to fetch GitHub data")
      }

      const result: GitHubData = await response.json()
      setData(result)
      setLastRefresh(new Date())
      setTimeUntilNextRefresh(REFRESH_INTERVAL)
    } catch (err) {
      console.error("Error fetching GitHub data:", err)
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setLoading(false)
    }
  }, [username])

  // Initial fetch
  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(fetchData, REFRESH_INTERVAL)
    return () => clearInterval(interval)
  }, [fetchData])

  // Update countdown timer (every second)
  useEffect(() => {
    const timer = setInterval(() => {
      const elapsed = Date.now() - lastRefresh.getTime()
      const remaining = Math.max(0, REFRESH_INTERVAL - elapsed)
      setTimeUntilNextRefresh(remaining)
    }, 1000)

    return () => clearInterval(timer)
  }, [lastRefresh])

  return {
    data,
    loading,
    error,
    lastRefresh,
    refresh: fetchData,
    timeUntilNextRefresh,
  }
}
