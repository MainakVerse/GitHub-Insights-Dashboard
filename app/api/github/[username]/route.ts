import { NextResponse, type NextRequest } from "next/server"
import {
  fetchGitHubUser,
  fetchGitHubRepos,
  fetchCommitActivity,
  fetchUserOrganizations,
  calculateLanguageStats,
  getTopRepos,
  getRepoCreationTimeline,
  getCommitActivitySummary,
  fetchGitHubContributions,
  getRepoStatsSummary,
} from "@/lib/github"

/**
 * GET /api/github/[username]
 * Fetches full GitHub analytics for a given username.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const username = params.username?.trim()
    if (!username) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 })
    }

    const token = process.env.GITHUB_TOKEN
    if (!token) {
      console.error("[GitHub API] Missing GITHUB_TOKEN in environment.")
      return NextResponse.json(
        { error: "Server configuration error: Missing GitHub token." },
        { status: 500 }
      )
    }

    console.log(`[GitHub API] Fetching data for ${username}...`)

    // ✅ Fetch all GitHub data in parallel (each using Authorization header)
    const [user, repos, commitCalendar, organizations, contributions] =
      await Promise.all([
        fetchGitHubUser(username, token),
        fetchGitHubRepos(username, token),
        fetchCommitActivity(username, token),
        fetchUserOrganizations(username, token),
        fetchGitHubContributions(username, token),
      ])

    // ✅ Compute derived statistics
    const languageStats = calculateLanguageStats(repos)
    const topRepos = getTopRepos(repos, 5)
    const repoTimeline = getRepoCreationTimeline(repos)
    const commitActivity = getCommitActivitySummary(commitCalendar)
    const repoStats = getRepoStatsSummary(repos)

    // ✅ Unified final API response
    const data = {
      user,
      stats: {
        totalRepos: repoStats.totalRepos,
        totalLanguages: repoStats.totalLanguages,
        totalStars: repoStats.totalStars,
        totalForks: repoStats.totalForks,
        totalCommits: contributions.totalCommits,
        totalIssues: contributions.totalIssues,
        totalPRs: contributions.totalPRs,
        totalReviews: contributions.totalReviews,
        totalPrivateContributions: contributions.totalPrivateContributions,
      },
      repos: {
        total: repos.length,
        top: topRepos,
        timeline: repoTimeline,
      },
      languages: languageStats,
      commits: {
        activity: commitActivity, // Weekly trend
        contributions: commitCalendar, // Daily heatmap
      },
      organizations,
      lastUpdated: new Date().toISOString(),
    }

    return NextResponse.json(data, {
      status: 200,
      headers: {
        // Cache for 5 minutes at the edge, revalidate in background
        "Cache-Control": "s-maxage=300, stale-while-revalidate",
      },
    })
  } catch (error: any) {
    console.error("[GitHub API Error]", error)

    // ✅ Handle GitHub rate limit / bad token / general failure
    const message = error?.message || "Unknown error"

    if (message.toLowerCase().includes("bad credentials")) {
      return NextResponse.json(
        { error: "Invalid or expired GitHub token. Please refresh server token." },
        { status: 401 }
      )
    }

    if (message.toLowerCase().includes("rate limit")) {
      return NextResponse.json(
        { error: "GitHub API rate limit exceeded. Please wait a few minutes and try again." },
        { status: 429 }
      )
    }

    return NextResponse.json({ error: message }, { status: 500 })
  }
}
