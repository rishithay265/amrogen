"use client";

import { useTheme } from "next-themes";
import { useMemo } from "react";
import { MoonStar, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const isDark = useMemo(() => (theme === "system" ? resolvedTheme === "dark" : theme === "dark"), [theme, resolvedTheme]);

  return (
    <Button
      size="icon"
      variant="ghost"
      aria-label="Toggle theme"
      className="relative h-9 w-9"
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      <Sun className="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <MoonStar className="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </Button>
  );
}

