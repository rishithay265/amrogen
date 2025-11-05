import * as React from "react";

import { cn } from "../../lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, leadingIcon, trailingIcon, ...props }, ref) => {
    if (!leadingIcon && !trailingIcon) {
      return (
        <input
          type={type}
          className={cn(
            "flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60",
            className,
          )}
          ref={ref}
          {...props}
        />
      );
    }

    return (
      <div
        className={cn(
          "flex h-10 w-full items-center gap-2 rounded-lg border border-input bg-background px-3 text-sm shadow-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring/60 focus-within:ring-offset-2",
          className,
        )}
      >
        {leadingIcon ? (
          <span className="text-muted-foreground">{leadingIcon}</span>
        ) : null}
        <input
          type={type}
          className="flex-1 bg-transparent placeholder:text-muted-foreground focus:outline-none"
          ref={ref}
          {...props}
        />
        {trailingIcon ? (
          <span className="text-muted-foreground">{trailingIcon}</span>
        ) : null}
      </div>
    );
  },
);
Input.displayName = "Input";

export { Input };
