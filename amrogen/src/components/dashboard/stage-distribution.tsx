"use client";

import { memo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { StageDistribution } from "@/server/services/analytics";

interface StageDistributionProps {
  data?: StageDistribution[];
  loading?: boolean;
}

const StageDistributionChart = memo(function StageDistributionChart({
  data,
  loading,
}: StageDistributionProps) {
  if (loading) {
    return (
      <Card className="h-[320px]">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Stage Momentum
          </CardTitle>
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
          Stage Momentum
          <span className="text-xs font-medium text-muted-foreground">
            Weighted by active orchestration cycles
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data ?? []}>
            <defs>
              <linearGradient id="barGradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.85} />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.6} />
            <XAxis
              dataKey="stage"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            />
            <YAxis
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            />
            <Tooltip
              cursor={{ fill: "hsl(var(--primary) / 0.1)" }}
              contentStyle={{
                background: "hsl(var(--card))",
                borderRadius: 12,
                border: "1px solid hsl(var(--border))",
              }}
            />
            <Bar dataKey="count" fill="url(#barGradient)" radius={12} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
});

export { StageDistributionChart };

