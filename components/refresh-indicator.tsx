"use client"

import { Badge } from "@/components/ui/badge"
import { RefreshCw } from "lucide-react"

interface RefreshIndicatorProps {
  lastRefresh: Date
  timeUntilNextRefresh: number
  loading?: boolean
}

export function RefreshIndicator({ lastRefresh, timeUntilNextRefresh, loading }: RefreshIndicatorProps) {
  const secondsAgo = Math.floor((Date.now() - lastRefresh.getTime()) / 1000)
  const secondsUntilNext = Math.floor(timeUntilNextRefresh / 1000)

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  return (
    <div className="flex items-center gap-2">
      <Badge variant="outline" className="font-mono text-xs">
        <RefreshCw className={`mr-1 h-3 w-3 ${loading ? "animate-spin" : ""}`} />
        {loading ? "Updating..." : `Updated ${formatTime(secondsAgo)} ago`}
      </Badge>
      {!loading && secondsUntilNext > 0 && (
        <Badge variant="secondary" className="font-mono text-xs">
          Next refresh in {formatTime(secondsUntilNext)}
        </Badge>
      )}
    </div>
  )
}
