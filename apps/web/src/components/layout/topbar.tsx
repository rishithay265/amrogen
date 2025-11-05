"use client";

import { useTransition } from "react";

import { Bell, Command, Loader2, Plus } from "lucide-react";

import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

type TopBarProps = {
  workspaceName: string;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onCreateLead: () => void;
  onOpenCommandPalette: () => void;
  isSyncing?: boolean;
};

export function TopBar({
  workspaceName,
  searchTerm,
  onSearchChange,
  onCreateLead,
  onOpenCommandPalette,
  isSyncing = false,
}: TopBarProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <header className="sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="flex items-center justify-between border-b border-border/60 px-6 py-4">
        <div className="flex items-center gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Workspace</p>
            <h1 className="text-xl font-semibold text-foreground">{workspaceName}</h1>
          </div>
          {isSyncing || isPending ? (
            <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Syncing
            </span>
          ) : null}
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex">
            <Input
              value={searchTerm}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search leads, companies, notes..."
              className="w-72"
            />
          </div>
          <TooltipProvider delayDuration={150}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="hidden md:inline-flex"
                  onClick={() =>
                    startTransition(() => {
                      onOpenCommandPalette();
                    })
                  }
                >
                  <Command className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Command palette</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider delayDuration={150}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon">
                  <Bell className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Notifications</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Button onClick={onCreateLead} className="shadow-lg shadow-primary/20">
            <Plus className="mr-2 h-4 w-4" /> New Lead
          </Button>
        </div>
      </div>
      <div className="flex px-6 pb-4 pt-2 md:hidden">
        <Input
          value={searchTerm}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search leads, companies, notes..."
          className="w-full"
        />
      </div>
    </header>
  );
}
