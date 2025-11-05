"use client";

import { memo } from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { VelocityPoint } from "@/server/services/analytics";

interface VelocityChartProps {
  data?: VelocityPoint[];
  loading?: boolean;
}

const VelocityChart = memo(function VelocityChart({ data, loading }: VelocityChartProps) {
  if (loading) {
    return (
      <Card className="h-[320px]">
        <CardHeader>
          <CardTitle>Agent Run Velocity</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-56 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-[320px]">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Agent Run Velocity
          <span className="text-xs text-muted-foreground">
            Weekly completions by agent specialisation
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data ?? []}>
            <defs>
              <linearGradient id="qualification" x1="0" x2="0" y1="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.7} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="outreach" x1="0" x2="0" y1="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.7} />
                <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="follow" x1="0" x2="0" y1="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--chart-3))" stopOpacity={0.7} />
                <stop offset="95%" stopColor="hsl(var(--chart-3))" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
            />
            <YAxis
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
            />
            <Tooltip
              cursor={{ stroke: "hsl(var(--primary))", strokeOpacity: 0.15, strokeWidth: 2 }}
              contentStyle={{
                background: "hsl(var(--card))",
                borderRadius: 12,
                border: "1px solid hsl(var(--border))",
              }}
            />
            <Area
              type="monotone"
              dataKey="qualification"
              stroke="hsl(var(--primary))"
              fill="url(#qualification)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="outreach"
              stroke="hsl(var(--chart-2))"
              fill="url(#outreach)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="followUp"
              stroke="hsl(var(--chart-3))"
              fill="url(#follow)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
});

export { VelocityChart };

