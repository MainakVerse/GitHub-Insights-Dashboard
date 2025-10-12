import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth" // ✅ fixed import

import {
  fetchGitHubUser,
  fetchGitHubRepos,
  fetchGitHubContributions,
  fetchCommitActivity,
  fetchUserOrganizations,
  calculateLanguageStats,
  getTopRepos,
  getRepoCreationTimeline,
  getCommitActivitySummary,
} from "@/lib/github"

export async function GET(request: NextRequest, { params }: { params: { username: string } }) {
  try {
    const username = params.username
    if (!username) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 })
    }

    // 🔐 Securely get the user's session and GitHub token
    const session = await getServerSession(authOptions)
    const token = session?.accessToken || process.env.GITHUB_TOKEN

    // ✅ Fetch data concurrently
    const [user, repos, commitDays, organizations, contributions] = await Promise.all([
      fetchGitHubUser(username, token),
      fetchGitHubRepos(username, token),
      fetchCommitActivity(username, token), // daily contribution data (ContributionDay[])
      fetchUserOrganizations(username, token),
      fetchGitHubContributions(username, token), // total commits/issues/PRs summary
    ])

    // ✅ Process data
    const languageStats = calculateLanguageStats(repos)
    const topRepos = getTopRepos(repos, 5)
    const repoTimeline = getRepoCreationTimeline(repos)
    const commitActivity = getCommitActivitySummary(commitDays)

    // ✅ Return unified data
    return NextResponse.json({
      user,
      repos: {
        total: repos.length,
        top: topRepos,
        timeline: repoTimeline,
      },
      languages: languageStats,
      commits: {
        activity: commitActivity,
        contributions: commitDays,
        totals: contributions, // extra aggregated stats
      },
      organizations,
      lastUpdated: new Date().toISOString(),
    })
  } catch (error) {
    console.error("GitHub API Error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch GitHub data" },
      { status: 500 }
    )
  }
}
