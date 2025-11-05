"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { PipelineMetric } from "@/server/services/analytics";

interface MetricsGridProps {
  metrics?: PipelineMetric[];
  loading?: boolean;
}

const trendColors: Record<PipelineMetric["trend"], string> = {
  up: "text-emerald-500",
  down: "text-red-500",
  flat: "text-muted-foreground",
};

export function MetricsGrid({ metrics, loading }: MetricsGridProps) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="border-dashed">
            <CardHeader>
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!metrics || metrics.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric, index) => (
        <motion.div
          key={metric.label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05, duration: 0.35, ease: "easeOut" }}
        >
          <Card className="border border-border/60 bg-gradient-to-br from-background/80 via-background to-primary/5 shadow-lg">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.label}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-end justify-between">
                <div className="text-3xl font-semibold tracking-tight">
                  {formatMetricValue(metric)}
                </div>
                <span className={cn("text-xs font-medium", trendColors[metric.trend])}>
                  {metric.trend === "flat" ? "—" : `${metric.trend === "up" ? "▲" : "▼"} ${metric.change}%`}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{metric.descriptor}</p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

function formatMetricValue(metric: PipelineMetric) {
  if (metric.label.toLowerCase().includes("pipeline")) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(metric.value);
  }
  return metric.value;
}

