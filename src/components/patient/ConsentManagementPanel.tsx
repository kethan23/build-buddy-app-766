import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldCheck, X } from "lucide-react";
import { toast } from "sonner";

interface ConsentRow {
  id: string;
  hospital_id: string;
  scope: string;
  granted_at: string;
  revoked_at: string | null;
  hospitals: { name: string; city: string | null; country: string | null } | null;
}

export const ConsentManagementPanel = () => {
  const { user } = useAuth();
  const [rows, setRows] = useState<ConsentRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("medical_data_consents")
      .select("id, hospital_id, scope, granted_at, revoked_at, hospitals(name, city, country)")
      .eq("patient_id", user.id)
      .order("granted_at", { ascending: false });
    setRows((data as any) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [user]);

  const revoke = async (id: string) => {
    const { error } = await supabase
      .from("medical_data_consents")
      .update({ revoked_at: new Date().toISOString() })
      .eq("id", id);
    if (error) return toast.error("Failed to revoke consent");
    toast.success("Consent revoked");
    load();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5" /> Hospital data sharing
        </CardTitle>
        <CardDescription>
          You've granted the following hospitals permission to view medical documents you shared.
          You can revoke access at any time.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">You haven't shared documents with any hospital yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {rows.map((r) => (
              <li key={r.id} className="py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{r.hospitals?.name || "Hospital"}</p>
                  <p className="text-xs text-muted-foreground">
                    {r.hospitals?.city ? `${r.hospitals.city}, ${r.hospitals.country || ""} · ` : ""}
                    {r.revoked_at
                      ? `Revoked ${new Date(r.revoked_at).toLocaleDateString()}`
                      : `Granted ${new Date(r.granted_at).toLocaleDateString()}`}
                  </p>
                </div>
                {!r.revoked_at && (
                  <Button size="sm" variant="ghost" onClick={() => revoke(r.id)}>
                    <X className="h-4 w-4 mr-1" /> Revoke
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

export default ConsentManagementPanel;
