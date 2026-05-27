import { supabase } from "@/integrations/supabase/client";

export async function logDocumentAccess(opts: {
  documentId?: string;
  documentPath?: string;
  action?: "view" | "download" | "share";
  metadata?: Record<string, unknown>;
}) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("document_access_log").insert({
      document_id: opts.documentId ?? null,
      document_path: opts.documentPath ?? null,
      accessed_by: user.id,
      action: opts.action ?? "view",
      metadata: opts.metadata ?? {},
    });
  } catch (e) {
    // Non-blocking — don't break UX if audit insert fails.
    console.warn("audit log failed", e);
  }
}
