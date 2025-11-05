"use client";

import { useEffect } from "react";

import { fetchLead } from "../lib/api/leads";
import { getSocket } from "../lib/socket";
import { useLeadStore } from "../store/lead-store";

export function useRealtimeEvents(workspaceId?: string) {
  const { upsertLead, setHighlight } = useLeadStore((state) => ({
    upsertLead: state.upsertLead,
    setHighlight: state.setHighlight,
  }));

  useEffect(() => {
    if (!workspaceId) {
      return;
    }

    const socket = getSocket();

    const handler = async (event: {
      type: string;
      workspaceId: string;
      leadId?: string;
    }) => {
      if (event.workspaceId !== workspaceId || !event.leadId) {
        return;
      }

      try {
        switch (event.type) {
          case "lead.created":
          case "lead.qualified":
          case "outreach.sent":
          case "followup.completed": {
            const lead = await fetchLead(event.leadId);
            upsertLead(lead);
            setTimeout(() => setHighlight(null), 3200);
            break;
          }
          default:
            break;
        }
      } catch (error) {
        console.error("Failed to hydrate lead from event", error);
      }
    };

    socket.on("amrogen:event", handler);

    return () => {
      socket.off("amrogen:event", handler);
    };
  }, [setHighlight, upsertLead, workspaceId]);
}
