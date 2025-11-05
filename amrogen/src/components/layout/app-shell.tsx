"use client";

import { PropsWithChildren, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BrainCircuit,
  Compass,
  GaugeCircle,
  Inbox,
  MessageSquareMore,
  Radar,
  Settings2,
  Sparkles,
  UsersRound,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const navItems = [
  {
    label: "Mission Control",
    items: [
      {
        label: "Revenue Command",
        description: "Autonomous pipeline intelligence",
        href: "/",
        icon: GaugeCircle,
      },
      {
        label: "Lead Intelligence",
        description: "ICP clusters, intent and enrichment",
        href: "/leads",
        icon: Radar,
      },
      {
        label: "Sequences",
        description: "Channel orchestration and cadences",
        href: "/sequences",
        icon: MessageSquareMore,
      },
    ],
  },
  {
    label: "Automation",
    items: [
      {
        label: "Agent Mesh",
        description: "Claude & Gemini collaboration mesh",
        href: "/agents",
        icon: BrainCircuit,
        children: [
          { label: "Delegations", href: "/agents/delegations" },
          { label: "Hooks", href: "/agents/hooks" },
        ],
      },
      {
        label: "Signals",
        description: "Real-time trigger automations",
        href: "/signals",
        icon: Sparkles,
      },
      {
        label: "Routing",
        description: "Ownership and SLA intelligence",
        href: "/routing",
        icon: Compass,
      },
    ],
  },
];

export function AppShell({ children }: PropsWithChildren) {
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" variant="inset" className="backdrop-blur-md">
        <SidebarHeader className="gap-4">
          <Link href="/" className="flex items-center gap-3 px-2">
            <div className="bg-gradient-to-br from-primary/80 via-primary to-purple-500/80 flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-lg shadow-primary/30">
              <span className="text-lg font-semibold">AG</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold tracking-tight">AmroGen</span>
              <span className="text-xs text-muted-foreground">Autonomous Revenue OS</span>
            </div>
          </Link>
          <SidebarSeparator />
        </SidebarHeader>
        <SidebarContent className="gap-4">
          {navItems.map((group) => (
            <SidebarGroup key={group.label}>
              <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton asChild isActive={isActive} tooltip={item.label}>
                          <Link href={item.href}>
                            <Icon className="text-primary" />
                            <span>{item.label}</span>
                            <span className="text-xs text-muted-foreground">{item.description}</span>
                          </Link>
                        </SidebarMenuButton>
                        {item.children ? (
                          <SidebarMenuSub>
                            {item.children.map((child) => (
                              <SidebarMenuSubItem key={child.href}>
                                <SidebarMenuSubButton asChild isActive={pathname === child.href}>
                                  <Link href={child.href}>{child.label}</Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        ) : null}
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarContent>
        <SidebarFooter>
          <div className="rounded-xl border border-sidebar-border bg-white/40 p-3 text-xs shadow-inner shadow-primary/5 dark:bg-slate-900/50">
            <p className="font-medium text-sidebar-foreground">Live Model Blend</p>
            <div className="mt-2 flex items-center justify-between text-[11px] uppercase tracking-wide">
              <span>Claude Sonnet 4.5</span>
              <Badge variant="outline" className="border-primary/40 bg-primary/10 text-primary">
                Strategy
              </Badge>
            </div>
            <div className="mt-1 flex items-center justify-between text-[11px] uppercase tracking-wide">
              <span>Gemini 2.0 Flash</span>
              <Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/10 text-emerald-600">
                Realtime
              </Badge>
            </div>
            <div className="mt-3 text-muted-foreground">
              <p>Orchestrator: v{ORCHESTRATOR_VERSION}</p>
              <p>Runtime latency: &lt; 8.2s p95</p>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <AppHeader />
        <div className="flex-1 space-y-6 bg-transparent px-4 pb-16 pt-6 md:px-8">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

function AppHeader() {
  const initials = useMemo(() => "Am", []);
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border/60 bg-background/75 px-4 backdrop-blur-lg md:px-8">
      <div className="flex items-center gap-3">
        <SidebarTrigger />
        <div className="hidden flex-col md:flex">
          <span className="text-xs font-medium uppercase text-primary">Command Center</span>
          <h1 className="text-lg font-semibold">Revenue Automation Overview</h1>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="gap-2 pr-3">
          <UsersRound className="size-4" />
          Cohorts
        </Button>
        <Button variant="outline" size="sm" className="gap-2 pr-3">
          <Inbox className="size-4" />
          Inbox
        </Button>
        <ThemeToggle />
        <Button variant="ghost" size="icon">
          <Settings2 className="size-4" />
        </Button>
        <Avatar className="size-9 border border-primary/40 shadow-sm">
          <AvatarFallback className="bg-gradient-to-br from-primary/60 via-primary to-indigo-500 text-white font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}

const ORCHESTRATOR_VERSION = "2025.11.05";

