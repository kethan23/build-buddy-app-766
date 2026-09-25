import { Link } from "react-router-dom";
import { Fragment } from "react";
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export interface Crumb { label: string; to?: string }

export default function PageBreadcrumb({ items, className = "" }: { items: Crumb[]; className?: string }) {
  return (
    <Breadcrumb className={`mb-4 ${className}`}>
      <BreadcrumbList>
        {items.map((c, i) => (
          <Fragment key={`${c.label}-${i}`}>
            {i > 0 && <BreadcrumbSeparator />}
            <BreadcrumbItem>
              {c.to && i < items.length - 1 ? (
                <BreadcrumbLink asChild><Link to={c.to}>{c.label}</Link></BreadcrumbLink>
              ) : (
                <BreadcrumbPage className="truncate max-w-[220px]">{c.label}</BreadcrumbPage>
              )}
            </BreadcrumbItem>
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
