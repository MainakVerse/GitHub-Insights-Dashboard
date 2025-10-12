"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"

interface RepoTimelineChartProps {
  data: { [year: string]: number }
}

export function RepoTimelineChart({ data }: RepoTimelineChartProps) {
  const chartData = Object.entries(data)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([year, count]) => ({
      year,
      repos: count,
    }))

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle>Repository Creation Timeline</CardTitle>
        <CardDescription>Number of repositories created each year</CardDescription>
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
            <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
              <XAxis dataKey="year" stroke="#8b949e" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#8b949e" fontSize={12} tickLine={false} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="repos" fill="#58a6ff" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
