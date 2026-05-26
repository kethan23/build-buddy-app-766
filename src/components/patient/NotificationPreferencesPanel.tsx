import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Bell, Mail, Smartphone } from "lucide-react";

interface Prefs {
  email_enabled: boolean;
  push_enabled: boolean;
  booking_updates: boolean;
  message_alerts: boolean;
  visa_updates: boolean;
  marketing: boolean;
}

const DEFAULTS: Prefs = {
  email_enabled: true,
  push_enabled: true,
  booking_updates: true,
  message_alerts: true,
  visa_updates: true,
  marketing: false,
};

export const NotificationPreferencesPanel = () => {
  const { user } = useAuth();
  const [prefs, setPrefs] = useState<Prefs>(DEFAULTS);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("notification_preferences")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data) setPrefs(data as any);
    })();
  }, [user]);

  const update = async (patch: Partial<Prefs>) => {
    if (!user) return;
    const next = { ...prefs, ...patch };
    setPrefs(next);
    setSaving(true);
    const { error } = await supabase
      .from("notification_preferences")
      .upsert({ user_id: user.id, ...next, updated_at: new Date().toISOString() });
    setSaving(false);
    if (error) toast.error("Failed to save preferences");
  };

  const Row = ({ id, icon: Icon, title, desc, value, onChange }: any) => (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="flex items-start gap-3">
        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <div>
          <Label htmlFor={id} className="text-sm font-medium cursor-pointer">{title}</Label>
          <p className="text-xs text-muted-foreground">{desc}</p>
        </div>
      </div>
      <Switch id={id} checked={value} onCheckedChange={onChange} />
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" /> Notification preferences
        </CardTitle>
        <CardDescription>Control how MediConnect contacts you.</CardDescription>
      </CardHeader>
      <CardContent className="divide-y divide-border">
        <Row id="email_enabled" icon={Mail} title="Email notifications"
          desc="Booking confirmations, visa updates, security alerts."
          value={prefs.email_enabled} onChange={(v: boolean) => update({ email_enabled: v })} />
        <Row id="push_enabled" icon={Smartphone} title="Push notifications"
          desc="Real-time updates in your browser when this app is open."
          value={prefs.push_enabled} onChange={(v: boolean) => update({ push_enabled: v })} />
        <Row id="booking_updates" icon={Bell} title="Booking updates"
          desc="Status changes for your appointments and bookings."
          value={prefs.booking_updates} onChange={(v: boolean) => update({ booking_updates: v })} />
        <Row id="message_alerts" icon={Bell} title="Message alerts"
          desc="When a hospital coordinator replies to your inquiry."
          value={prefs.message_alerts} onChange={(v: boolean) => update({ message_alerts: v })} />
        <Row id="visa_updates" icon={Bell} title="Visa updates"
          desc="Each time your visa workflow stage changes."
          value={prefs.visa_updates} onChange={(v: boolean) => update({ visa_updates: v })} />
        <Row id="marketing" icon={Mail} title="Newsletter & offers"
          desc="Occasional product updates and treatment offers (opt-in)."
          value={prefs.marketing} onChange={(v: boolean) => update({ marketing: v })} />
        {saving && <p className="text-xs text-muted-foreground pt-3">Saving…</p>}
      </CardContent>
    </Card>
  );
};

export default NotificationPreferencesPanel;
