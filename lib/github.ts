// GitHub API utility functions (REST + GraphQL, production-grade)

export interface GitHubUser {
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

export interface GitHubRepo {
  name: string
  full_name: string
  description: string | null
  stargazers_count: number
  forks_count: number
  language: string | null
  created_at: string
  updated_at: string
  html_url: string
}

export interface LanguageStats {
  [language: string]: number
}

export interface ContributionDay {
  date: string
  contributionCount: number
  color: string
}

export interface RepoStatsSummary {
  totalStars: number
  totalForks: number
  totalLanguages: number
  totalRepos: number
}

export interface FullContributions {
  totalCommits: number
  totalIssues: number
  totalPRs: number
  totalReviews: number
  totalReposWithContributions: number
  totalPrivateContributions: number
  contributedRepos: any[]
  ownedRepos: any[]
}

// In-memory cache (5 minutes)
const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

function getCached<T>(key: string): T | null {
  const cached = cache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data as T
  }
  cache.delete(key)
  return null
}

function setCache(key: string, data: any) {
  cache.set(key, { data, timestamp: Date.now() })
}

/* -------------------------------------------------------------------------- */
/*                              USER INFORMATION                              */
/* -------------------------------------------------------------------------- */

export async function fetchGitHubUser(username: string, token: any): Promise<GitHubUser> {
  const cacheKey = `user:${username}`
  const cached = getCached<GitHubUser>(cacheKey)
  if (cached) return cached

  const response = await fetch(`https://api.github.com/users/${username}`, {
    headers: { Accept: "application/vnd.github.v3+json" },
    next: { revalidate: 300 },
  })

  if (!response.ok) throw new Error(`Failed to fetch user: ${response.statusText}`)

  const data = await response.json()
  setCache(cacheKey, data)
  return data
}

/* -------------------------------------------------------------------------- */
/*                        FULL CONTRIBUTION COLLECTION                         */
/* -------------------------------------------------------------------------- */

export async function fetchGitHubContributions(
  username: string,
  token?: string
): Promise<FullContributions> {
  const cacheKey = `fullContrib:${username}`
  const cached = getCached<FullContributions>(cacheKey)
  if (cached) return cached

  // ✅ Use user's OAuth token first, fallback to your app's token
  const authToken = token || process.env.GITHUB_TOKEN

  const query = `
    query($username: String!) {
      user(login: $username) {
        contributionsCollection {
          totalCommitContributions
          totalIssueContributions
          totalPullRequestContributions
          totalPullRequestReviewContributions
          totalRepositoriesWithContributedCommits
          restrictedContributionsCount
        }
        repositoriesContributedTo(first: 100, contributionTypes: [COMMIT, ISSUE, PULL_REQUEST]) {
          nodes {
            name
            url
            stargazerCount
            forkCount
            primaryLanguage { name }
          }
        }
        repositories(first: 100, orderBy: { field: STARGAZERS, direction: DESC }) {
          nodes {
            name
            stargazerCount
            forkCount
            createdAt
          }
        }
      }
    }
  `

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/vnd.github.v3+json",
  }

  // ✅ Add auth header if any valid token exists
  if (authToken) headers.Authorization = `Bearer ${authToken}`

  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers,
    body: JSON.stringify({ query, variables: { username } }),
    next: { revalidate: 300 },
  })

  // ❌ If unauthorized and fallback available, retry once with fallback token
  if (res.status === 401 && !token && process.env.GITHUB_TOKEN) {
    console.warn(`[GitHub] Unauthorized for user token; retrying with fallback token...`)
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`
    const retryRes = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers,
      body: JSON.stringify({ query, variables: { username } }),
      next: { revalidate: 300 },
    })
    if (!retryRes.ok) throw new Error(`GitHub GraphQL error: ${retryRes.statusText}`)
    const retryJson = await retryRes.json()
    const retryUser = retryJson.data?.user
    const retryResult: FullContributions = {
      totalCommits: retryUser?.contributionsCollection?.totalCommitContributions ?? 0,
      totalIssues: retryUser?.contributionsCollection?.totalIssueContributions ?? 0,
      totalPRs: retryUser?.contributionsCollection?.totalPullRequestContributions ?? 0,
      totalReviews: retryUser?.contributionsCollection?.totalPullRequestReviewContributions ?? 0,
      totalReposWithContributions: retryUser?.contributionsCollection?.totalRepositoriesWithContributedCommits ?? 0,
      totalPrivateContributions: retryUser?.contributionsCollection?.restrictedContributionsCount ?? 0,
      contributedRepos: retryUser?.repositoriesContributedTo?.nodes ?? [],
      ownedRepos: retryUser?.repositories?.nodes ?? [],
    }
    setCache(cacheKey, retryResult)
    return retryResult
  }

  if (!res.ok) throw new Error(`GitHub GraphQL error: ${res.statusText}`)

  const json = await res.json()
  const user = json.data?.user

  const result: FullContributions = {
    totalCommits: user?.contributionsCollection?.totalCommitContributions ?? 0,
    totalIssues: user?.contributionsCollection?.totalIssueContributions ?? 0,
    totalPRs: user?.contributionsCollection?.totalPullRequestContributions ?? 0,
    totalReviews: user?.contributionsCollection?.totalPullRequestReviewContributions ?? 0,
    totalReposWithContributions: user?.contributionsCollection?.totalRepositoriesWithContributedCommits ?? 0,
    totalPrivateContributions: user?.contributionsCollection?.restrictedContributionsCount ?? 0,
    contributedRepos: user?.repositoriesContributedTo?.nodes ?? [],
    ownedRepos: user?.repositories?.nodes ?? [],
  }

  setCache(cacheKey, result)
  return result
}


/* -------------------------------------------------------------------------- */
/*                               REPOSITORY DATA                              */
/* -------------------------------------------------------------------------- */

export async function fetchGitHubRepos(username: string, token: any): Promise<GitHubRepo[]> {
  const cacheKey = `repos:${username}`
  const cached = getCached<GitHubRepo[]>(cacheKey)
  if (cached) return cached

  const headers = { Accept: "application/vnd.github.v3+json" }
  let allRepos: GitHubRepo[] = []
  let page = 1
  const perPage = 100

  while (true) {
    const response = await fetch(
      `https://api.github.com/users/${username}/repos?per_page=${perPage}&page=${page}&sort=updated`,
      { headers, next: { revalidate: 300 } }
    )

    if (!response.ok) throw new Error(`Failed to fetch repos: ${response.statusText}`)

    const data: GitHubRepo[] = await response.json()
    allRepos = allRepos.concat(data)
    if (data.length < perPage) break
    page++
  }

  setCache(cacheKey, allRepos)
  return allRepos
}

/* -------------------------------------------------------------------------- */
/*                              ANALYTIC HELPERS                              */
/* -------------------------------------------------------------------------- */

export function calculateLanguageStats(repos: GitHubRepo[]): LanguageStats {
  const stats: LanguageStats = {}
  repos.forEach((repo) => {
    if (repo.language) stats[repo.language] = (stats[repo.language] || 0) + 1
  })
  return stats
}

export function getTopRepos(repos: GitHubRepo[], limit = 5): GitHubRepo[] {
  return [...repos].sort((a, b) => b.stargazers_count - a.stargazers_count).slice(0, limit)
}

export function getRepoCreationTimeline(repos: GitHubRepo[]): { [year: string]: number } {
  const timeline: { [year: string]: number } = {}
  repos.forEach((repo) => {
    const year = new Date(repo.created_at).getFullYear().toString()
    timeline[year] = (timeline[year] || 0) + 1
  })
  return timeline
}

export function getRepoStatsSummary(repos: GitHubRepo[]): RepoStatsSummary {
  const totalStars = repos.reduce((sum, r) => sum + r.stargazers_count, 0)
  const totalForks = repos.reduce((sum, r) => sum + r.forks_count, 0)
  const totalLanguages = new Set(repos.map((r) => r.language).filter(Boolean)).size
  return { totalStars, totalForks, totalLanguages, totalRepos: repos.length }
}

/* -------------------------------------------------------------------------- */
/*                         CONTRIBUTION CALENDAR (GRAPHQL)                    */
/* -------------------------------------------------------------------------- */

export async function fetchCommitActivity(username: string, token?: string): Promise<ContributionDay[]> {
  const cacheKey = `contributions:${username}`
  const cached = getCached<ContributionDay[]>(cacheKey)
  if (cached) return cached

  const query = `
    query($username: String!) {
      user(login: $username) {
        contributionsCollection {
          contributionCalendar {
            weeks {
              contributionDays {
                date
                contributionCount
                color
              }
            }
          }
        }
      }
    }
  `

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/vnd.github.v3+json",
  }
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers,
    body: JSON.stringify({ query, variables: { username } }),
    next: { revalidate: 300 },
  })

  if (!res.ok) {
    console.warn("GraphQL fetch failed; contribution data unavailable.")
    return []
  }

  const result = await res.json()
  const weeks = result.data?.user?.contributionsCollection?.contributionCalendar?.weeks || []
  const days: ContributionDay[] = weeks.flatMap((w: any) => w.contributionDays)

  setCache(cacheKey, days)
  return days
}

/* -------------------------------------------------------------------------- */
/*                              ORGANIZATIONS                                */
/* -------------------------------------------------------------------------- */

export async function fetchUserOrganizations(username: string, token: any): Promise<any[]> {
  const cacheKey = `orgs:${username}`
  const cached = getCached<any[]>(cacheKey)
  if (cached) return cached

  const res = await fetch(`https://api.github.com/users/${username}/orgs`, {
    headers: { Accept: "application/vnd.github.v3+json" },
    next: { revalidate: 300 },
  })

  if (!res.ok) return []

  const data = await res.json()
  setCache(cacheKey, data)
  return data
}

/* -------------------------------------------------------------------------- */
/*                      WEEKLY ACTIVITY SUMMARY (CHARTS)                     */
/* -------------------------------------------------------------------------- */

export function getCommitActivitySummary(contributions: ContributionDay[]): { date: string; count: number }[] {
  const weeklyData: Record<string, number> = {}

  contributions.forEach((day) => {
    const date = new Date(day.date)
    const weekStart = new Date(date)
    weekStart.setDate(date.getDate() - date.getDay())
    const weekKey = weekStart.toISOString().split("T")[0]
    weeklyData[weekKey] = (weeklyData[weekKey] || 0) + day.contributionCount
  })

  return Object.entries(weeklyData)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-52)
}
