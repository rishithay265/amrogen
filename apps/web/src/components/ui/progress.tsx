"use client";

import * as React from "react";

import { cn } from "../../lib/utils";

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  indicatorClassName?: string;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, indicatorClassName, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "relative h-2 w-full rounded-full bg-muted",
        className,
      )}
      {...props}
    >
      <div
        className={cn(
          "h-full w-full rounded-full bg-primary transition-all",
          indicatorClassName,
        )}
        style={{
          transform: `translateX(-${100 - Math.min(Math.max(value, 0), 100)}%)`,
        }}
      />
    </div>
  ),
);
Progress.displayName = "Progress";

export { Progress };
