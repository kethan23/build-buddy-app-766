import { ShieldCheck, Award, Globe2, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface TrustBadgesProps {
  variant?: "light" | "dark";
  className?: string;
}

const BADGES = [
  { icon: ShieldCheck, label: "NABH Accredited" },
  { icon: Award, label: "JCI Certified" },
  { icon: Globe2, label: "Intl. Patient Desk" },
  { icon: Lock, label: "HIPAA-grade Privacy" },
];

export function TrustBadges({ variant = "light", className }: TrustBadgesProps) {
  return (
    <div className={cn("flex flex-wrap items-center justify-center gap-2 sm:gap-3", className)}>
      {BADGES.map((b) => {
        const Icon = b.icon;
        return (
          <div
            key={b.label}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] sm:text-xs font-medium backdrop-blur",
              variant === "light"
                ? "bg-white/70 border border-border/60 text-foreground"
                : "bg-white/15 border border-white/20 text-white"
            )}
          >
            <Icon className="h-3.5 w-3.5 shrink-0" />
            <span>{b.label}</span>
          </div>
        );
      })}
    </div>
  );
}

export default TrustBadges;
