import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Cookie, X } from "lucide-react";

const STORAGE_KEY = "mc_cookie_consent";

type Consent = {
  essential: true;
  analytics: boolean;
  marketing: boolean;
  decidedAt: string;
};

export const getCookieConsent = (): Consent | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Consent) : null;
  } catch {
    return null;
  }
};

const save = (c: Consent) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(c));
  window.dispatchEvent(new CustomEvent("mc:consent-changed", { detail: c }));
};

export const CookieConsent = () => {
  const [open, setOpen] = useState(false);
  const [customize, setCustomize] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    if (!getCookieConsent()) {
      const t = setTimeout(() => setOpen(true), 800);
      return () => clearTimeout(t);
    }
  }, []);

  if (!open) return null;

  const acceptAll = () => {
    save({ essential: true, analytics: true, marketing: true, decidedAt: new Date().toISOString() });
    setOpen(false);
  };
  const rejectNonEssential = () => {
    save({ essential: true, analytics: false, marketing: false, decidedAt: new Date().toISOString() });
    setOpen(false);
  };
  const savePrefs = () => {
    save({ essential: true, analytics, marketing, decidedAt: new Date().toISOString() });
    setOpen(false);
  };

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie consent"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 z-[100] max-w-md rounded-2xl border border-border bg-background/95 backdrop-blur-xl shadow-2xl p-5 animate-in slide-in-from-bottom-4"
    >
      <button
        onClick={rejectNonEssential}
        aria-label="Close"
        className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Cookie className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-foreground">We value your privacy</h3>
          <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
            We use cookies to enhance your browsing experience, analyze site traffic, and secure your medical data.
            Read our{" "}
            <Link to="/cookies" className="underline text-primary">Cookie Policy</Link> and{" "}
            <Link to="/privacy" className="underline text-primary">Privacy Policy</Link>.
          </p>
        </div>
      </div>

      {customize && (
        <div className="mt-4 space-y-2 border-t border-border pt-3 text-xs">
          <label className="flex items-center justify-between opacity-60">
            <span>Essential (required)</span>
            <input type="checkbox" checked readOnly />
          </label>
          <label className="flex items-center justify-between">
            <span>Analytics</span>
            <input type="checkbox" checked={analytics} onChange={(e) => setAnalytics(e.target.checked)} />
          </label>
          <label className="flex items-center justify-between">
            <span>Marketing</span>
            <input type="checkbox" checked={marketing} onChange={(e) => setMarketing(e.target.checked)} />
          </label>
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <Button size="sm" onClick={acceptAll} className="flex-1 min-w-[120px]">Accept all</Button>
        <Button size="sm" variant="outline" onClick={rejectNonEssential} className="flex-1 min-w-[120px]">
          Reject non-essential
        </Button>
        {!customize ? (
          <button
            onClick={() => setCustomize(true)}
            className="text-xs text-muted-foreground hover:text-foreground underline w-full text-center mt-1"
          >
            Customize
          </button>
        ) : (
          <Button size="sm" variant="secondary" onClick={savePrefs} className="w-full">
            Save preferences
          </Button>
        )}
      </div>
    </div>
  );
};

export default CookieConsent;
