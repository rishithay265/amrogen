"use client";

import { useMemo, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

const workspaceSchema = z.object({
  name: z.string().min(2),
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/),
  timezone: z.string().min(1),
});

type WorkspaceFormValues = z.infer<typeof workspaceSchema>;

export function WorkspaceOnboarding() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const timezones = useMemo(() => {
    const fallback = ["UTC", "America/New_York", "Europe/London", "Asia/Singapore"];
    if (typeof Intl !== "undefined") {
      const enrichedIntl = Intl as typeof Intl & { supportedValuesOf?: (key: string) => string[] };
      if (typeof enrichedIntl.supportedValuesOf === "function") {
        return enrichedIntl.supportedValuesOf("timeZone");
      }
    }
    return fallback;
  }, []);

  const form = useForm<WorkspaceFormValues>({
    resolver: zodResolver(workspaceSchema),
    defaultValues: {
      name: "",
      slug: "",
      timezone: timezones[0] ?? "UTC",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setError(null);
    try {
      const response = await fetch("/api/workspaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload?.error ?? "Failed to create workspace");
      }

      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    }
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-primary/10 px-4">
      <Card className="mx-auto w-full max-w-xl border-none shadow-2xl">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl font-semibold">Create your revenue workspace</CardTitle>
          <CardDescription>
            Configure a workspace to unlock AmroGen orchestration, live analytics, and cross-agent automations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="name">Workspace name</Label>
              <Input id="name" placeholder="Acme Revenue Ops" {...form.register("name")} />
              {form.formState.errors.name ? (
                <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
              ) : null}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" placeholder="acme" {...form.register("slug")} />
              {form.formState.errors.slug ? (
                <p className="text-xs text-destructive">{form.formState.errors.slug.message}</p>
              ) : null}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="timezone">Timezone</Label>
              <select
                id="timezone"
                className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
                {...form.register("timezone")}
              >
                {timezones.map((tz) => (
                  <option key={tz} value={tz}>
                    {tz}
                  </option>
                ))}
              </select>
            </div>

            {error ? <p className="text-sm text-destructive">{error}</p> : null}

            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              Launch AmroGen workspace
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
