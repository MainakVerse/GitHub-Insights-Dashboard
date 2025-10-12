"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"

interface CommitActivityChartProps {
  data: Array<{ date: string; count: number }>
}

export function CommitActivityChart({ data }: CommitActivityChartProps) {
  const chartData = data.map((item) => ({
    date: new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    commits: item.count,
  }))

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle>Commit Activity</CardTitle>
        <CardDescription>Weekly contribution trends over the last year</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            commits: {
              label: "Commits",
              color: "#1f6feb",
            },
          }}
          className="h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
              <XAxis
                dataKey="date"
                stroke="#8b949e"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
                tickFormatter={(value, index) => (index % 8 === 0 ? value : "")}
              />
              <YAxis stroke="#8b949e" fontSize={12} tickLine={false} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                type="monotone"
                dataKey="commits"
                stroke="#1f6feb"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: "#1f6feb" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
