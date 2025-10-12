"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Pie, PieChart, Cell, ResponsiveContainer } from "recharts"

interface LanguageChartProps {
  data: { [language: string]: number }
}

const COLORS = ["#1f6feb", "#58a6ff", "#79c0ff", "#a5d6ff", "#c9d1d9", "#8b949e", "#6e7681", "#484f58"]

export function LanguageChart({ data }: LanguageChartProps) {
  const chartData = Object.entries(data)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
    .map(([name, value]) => ({
      name,
      value,
    }))

  const total = chartData.reduce((sum, item) => sum + item.value, 0)

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle>Language Distribution</CardTitle>
        <CardDescription>Programming languages across all repositories</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartData.reduce(
            (acc, item, index) => ({
              ...acc,
              [item.name]: {
                label: item.name,
                color: COLORS[index % COLORS.length],
              },
            }),
            {},
          )}
          className="h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value) => `${value} repos (${((Number(value) / total) * 100).toFixed(1)}%)`}
                  />
                }
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
        <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
          {chartData.slice(0, 4).map((item, index) => (
            <div key={item.name} className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-sm" style={{ backgroundColor: COLORS[index] }} />
              <span className="font-mono text-muted-foreground">{item.name}</span>
              <span className="ml-auto font-semibold text-foreground">{item.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
