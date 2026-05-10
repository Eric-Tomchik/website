"use client";

import { useCallback } from "react";

/**
 * Read the admin auth key from the `admin_ck` cookie.
 */
function getAdminKey(): string {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(/(?:^|;\s*)admin_ck=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : "";
}

type NotificationType =
  | "invoice_sent"
  | "document_signature_requested"
  | "milestone_completed"
  | "project_status_update";

interface NotifyOptions {
  type: NotificationType;
  recipientEmail: string;
  recipientName: string;
  data: Record<string, unknown>;
}

/**
 * Hook to send client portal email notifications from the admin dashboard.
 *
 * Usage:
 * ```
 * const notify = useClientNotify();
 * await notify({
 *   type: 'invoice_sent',
 *   recipientEmail: 'client@example.com',
 *   recipientName: 'John Doe',
 *   data: { invoiceNumber: 'INV-0001', totalFormatted: '1,500.00' },
 * });
 * ```
 */
export function useClientNotify() {
  return useCallback(async (options: NotifyOptions): Promise<{ success: boolean; error?: string }> => {
    const adminKey = getAdminKey();
    if (!adminKey) return { success: false, error: "Not authenticated" };

    try {
      const res = await fetch("/api/notify/client", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...options, adminKey }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Client notification failed:", data);
        return { success: false, error: data.error || "Failed to send notification" };
      }

      return { success: true };
    } catch (err) {
      console.error("Client notification error:", err);
      return { success: false, error: String(err) };
    }
  }, []);
}
