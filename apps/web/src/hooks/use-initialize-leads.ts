"use client";

import { useEffect } from "react";

import type { LeadRecord } from "../lib/types";
import { useLeadStore } from "../store/lead-store";

export function useInitializeLeads(leads: LeadRecord[]) {
  const setInitialLeads = useLeadStore((state) => state.setInitialLeads);

  useEffect(() => {
    setInitialLeads(leads);
  }, [leads, setInitialLeads]);
}
