import { type NextRequest, NextResponse } from "next/server"
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

    // ✅ Use a single backend token (no auth, rate-limit safe)
    const token = process.env.GITHUB_TOKEN

    // ✅ Fetch all data in parallel
    const [user, repos, commitCalendar, organizations, contributions] =
      await Promise.all([
        fetchGitHubUser(username, token),
        fetchGitHubRepos(username, token),
        fetchCommitActivity(username, token),
        fetchUserOrganizations(username, token),
        fetchGitHubContributions(username, token),
      ])

    // ✅ Process analytics
    const languageStats = calculateLanguageStats(repos)
    const topRepos = getTopRepos(repos, 5)
    const repoTimeline = getRepoCreationTimeline(repos)
    const commitActivity = getCommitActivitySummary(commitCalendar)
    const repoStats = getRepoStatsSummary(repos)

    // ✅ Unified final response
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
        activity: commitActivity, // weekly trend
        contributions: commitCalendar, // daily heatmap
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

    // Graceful handling of GitHub rate limit
    if (error instanceof Error && error.message.includes("rate limit")) {
      return NextResponse.json(
        {
          error:
            "GitHub API rate limit exceeded. Please wait a few minutes and try again.",
        },
        { status: 429 }
      )
    }

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
