import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth" // ✅ avoids circular import

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

export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const username = params.username
    if (!username) {
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 }
      )
    }

    // ✅ Use logged-in user’s GitHub OAuth token OR fallback to PAT
    const session = await getServerSession(authOptions)
    const token = session?.accessToken || process.env.GITHUB_TOKEN

    // ✅ Fetch all data in parallel using the correct token
    const [user, repos, commitCalendar, organizations, contributions] =
      await Promise.all([
        fetchGitHubUser(username, token),
        fetchGitHubRepos(username, token),
        fetchCommitActivity(username, token),
        fetchUserOrganizations(username, token),
        fetchGitHubContributions(username, token),
      ])

    // ✅ Process repository-level data
    const languageStats = calculateLanguageStats(repos)
    const topRepos = getTopRepos(repos, 5)
    const repoTimeline = getRepoCreationTimeline(repos)
    const commitActivity = getCommitActivitySummary(commitCalendar)
    const repoStats = getRepoStatsSummary(repos)

    // ✅ Unified API response
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
        activity: commitActivity, // Weekly summary chart
        contributions: commitCalendar, // Daily heatmap data
      },
      organizations,
      lastUpdated: new Date().toISOString(),
    }

    return NextResponse.json(data, {
      status: 200,
      headers: {
        "Cache-Control": "s-maxage=300, stale-while-revalidate",
      },
    })
  } catch (error) {
    console.error("GitHub API Error:", error)
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch GitHub data",
      },
      { status: 500 }
    )
  }
}
