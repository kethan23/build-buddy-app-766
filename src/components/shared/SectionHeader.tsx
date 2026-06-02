import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  eyebrow?: string;
  title: string | ReactNode;
  subtitle?: string | ReactNode;
  align?: "left" | "center";
  className?: string;
}

/**
 * Unified section header used across marketing/patient pages.
 * Enforces the premium aesthetic: subtle eyebrow chip, bold heading, muted subhead.
 */
export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  align = "center",
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" ? "mx-auto text-center" : "text-left",
        className
      )}
    >
      {eyebrow && (
        <div
          className={cn(
            "inline-flex items-center gap-2 bg-primary/8 border border-primary/15 rounded-full px-3 py-1 mb-3",
            align === "center" ? "" : ""
          )}
        >
          <span className="text-[10px] font-semibold text-primary uppercase tracking-[0.14em]">
            {eyebrow}
          </span>
        </div>
      )}
      <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold text-foreground leading-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="text-sm sm:text-base text-muted-foreground mt-3 leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}

export default SectionHeader;
