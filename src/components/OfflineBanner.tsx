import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";

export default function OfflineBanner() {
  const [offline, setOffline] = useState(typeof navigator !== "undefined" && !navigator.onLine);
  useEffect(() => {
    const on = () => setOffline(false);
    const off = () => setOffline(true);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);
  if (!offline) return null;
  return (
    <div className="fixed top-0 inset-x-0 z-[100] bg-warning text-warning-foreground bg-amber-500 text-white text-center text-sm py-2 flex items-center justify-center gap-2 shadow-md">
      <WifiOff className="w-4 h-4" />
      You are offline — some features are unavailable.
    </div>
  );
}
