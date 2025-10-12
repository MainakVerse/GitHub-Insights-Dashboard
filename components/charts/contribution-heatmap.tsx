"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useMemo } from "react"

interface ContributionHeatmapProps {
  data: Array<{ date: string; contributionCount: number; color: string }>
}

export function ContributionHeatmap({ data }: ContributionHeatmapProps) {
  const heatmapData = useMemo(() => {
    // Group contributions by week
    const weeks: Array<Array<{ date: string; count: number; color: string }>> = []
    let currentWeek: Array<{ date: string; count: number; color: string }> = []

    data.forEach((day, index) => {
      const dayOfWeek = new Date(day.date).getDay()

      if (dayOfWeek === 0 && currentWeek.length > 0) {
        weeks.push(currentWeek)
        currentWeek = []
      }

      currentWeek.push({
        date: day.date,
        count: day.contributionCount,
        color: day.color || getColorForCount(day.contributionCount),
      })
    })

    if (currentWeek.length > 0) {
      weeks.push(currentWeek)
    }

    return weeks.slice(-52) // Last 52 weeks
  }, [data])

  function getColorForCount(count: number): string {
    if (count === 0) return "#161b22"
    if (count < 3) return "#0e4429"
    if (count < 6) return "#006d32"
    if (count < 9) return "#26a641"
    return "#39d353"
  }

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  return (
    <Card className="border-border bg-card lg:col-span-2">
      <CardHeader>
        <CardTitle>Contribution Heatmap</CardTitle>
        <CardDescription>Your GitHub activity over the past year</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            {/* Month labels */}
            <div className="mb-2 flex gap-[3px] pl-8">
              {heatmapData
                .filter((_, index) => index % 4 === 0)
                .map((week, index) => {
                  const date = new Date(week[0].date)
                  return (
                    <div key={index} className="w-[52px] text-xs text-muted-foreground">
                      {months[date.getMonth()]}
                    </div>
                  )
                })}
            </div>

            {/* Heatmap grid */}
            <div className="flex gap-[3px]">
              {/* Day labels */}
              <div className="flex flex-col gap-[3px]">
                {days.map((day, index) => (
                  <div key={day} className="h-[10px] text-xs leading-[10px] text-muted-foreground">
                    {index % 2 === 1 ? day.slice(0, 3) : ""}
                  </div>
                ))}
              </div>

              {/* Contribution squares */}
              {heatmapData.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-[3px]">
                  {week.map((day, dayIndex) => (
                    <div
                      key={`${weekIndex}-${dayIndex}`}
                      className="h-[10px] w-[10px] rounded-sm transition-all hover:ring-1 hover:ring-primary"
                      style={{ backgroundColor: day.color }}
                      title={`${day.date}: ${day.count} contributions`}
                    />
                  ))}
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <span>Less</span>
              <div className="flex gap-1">
                {[0, 1, 3, 6, 9].map((count) => (
                  <div
                    key={count}
                    className="h-[10px] w-[10px] rounded-sm"
                    style={{ backgroundColor: getColorForCount(count) }}
                  />
                ))}
              </div>
              <span>More</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
