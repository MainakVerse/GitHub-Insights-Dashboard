"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"

interface RepoTimelineChartProps {
  data: { month: string; count: number }[]
}

export function RepoTimelineChart({ data }: RepoTimelineChartProps) {
  // Ensure all months are represented even if 0 repos
  const monthOrder = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]

  // Merge given data with default 0-count months
  const filledData = monthOrder.map((month) => {
    const found = data.find((item) => item.month === month)
    return {
      month,
      repos: found ? found.count : 0,
    }
  })

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle>Repository Creation Timeline (2025 Monthly)</CardTitle>
        <CardDescription>Number of repositories created each month in 2025</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            repos: {
              label: "Repositories",
              color: "#58a6ff",
            },
          }}
          className="h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={filledData}
              margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
              <XAxis
                dataKey="month"
                stroke="#8b949e"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#8b949e"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar
                dataKey="repos"
                fill="#58a6ff"
                radius={[4, 4, 0, 0]}
                isAnimationActive={true}
                animationDuration={900}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
