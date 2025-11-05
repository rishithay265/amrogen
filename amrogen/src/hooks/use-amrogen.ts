"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AmroGenApi } from "@/lib/api-client";
import type { LeadInputPayload } from "@/lib/validators/lead";

export function useDashboard() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: () => AmroGenApi.getDashboard(),
    refetchInterval: 45_000,
  });
}

export function useLeads() {
  return useQuery({
    queryKey: ["leads"],
    queryFn: () => AmroGenApi.getLeads(),
    refetchInterval: 60_000,
  });
}

export function useOrchestrations() {
  return useQuery({
    queryKey: ["orchestrations"],
    queryFn: () => AmroGenApi.getOrchestrations(),
    refetchInterval: 30_000,
  });
}

export function useOrchestrateLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: LeadInputPayload | { leadId: string }) =>
      AmroGenApi.orchestrate(payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
        queryClient.invalidateQueries({ queryKey: ["orchestrations"] }),
        queryClient.invalidateQueries({ queryKey: ["leads"] }),
      ]);
    },
  });
}

