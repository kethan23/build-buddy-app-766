import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SEO from "@/components/SEO";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Shield } from "lucide-react";

interface Row {
  id: string;
  document_id: string | null;
  document_path: string | null;
  accessed_by: string;
  action: string;
  created_at: string;
}

export default function AuditLog() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("document_access_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      setRows((data as Row[]) || []);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <SEO title="Audit Log — Admin | MediConnect" description="Medical document access audit trail." noIndex />
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold">Document Access Audit Log</h1>
        </div>
        <Card className="p-4">
          {loading ? (
            <div className="space-y-2">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
          ) : rows.length === 0 ? (
            <p className="text-sm text-muted-foreground">No access events recorded yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-muted-foreground border-b">
                  <tr><th className="py-2 pr-4">When</th><th className="py-2 pr-4">User</th><th className="py-2 pr-4">Action</th><th className="py-2 pr-4">Document</th></tr>
                </thead>
                <tbody>
                  {rows.map(r => (
                    <tr key={r.id} className="border-b last:border-0">
                      <td className="py-2 pr-4 whitespace-nowrap">{new Date(r.created_at).toLocaleString()}</td>
                      <td className="py-2 pr-4 font-mono text-xs">{r.accessed_by.slice(0, 8)}…</td>
                      <td className="py-2 pr-4"><Badge variant="secondary">{r.action}</Badge></td>
                      <td className="py-2 pr-4 truncate max-w-xs">{r.document_path || r.document_id || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </main>
      <Footer />
    </div>
  );
}
