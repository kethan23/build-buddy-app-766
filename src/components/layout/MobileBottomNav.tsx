import { Link, useLocation } from "react-router-dom";
import { Home, Search, MessageCircle, LayoutDashboard, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";

/** App-like bottom tab bar for phones and tablets on public + patient pages. */
const MobileBottomNav = () => {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const { role } = useUserRole();

  // Portals with their own navigation, and hospital profile (has its own action bar)
  const hidden =
    /^\/(admin|agent|auth|reset-password)/.test(pathname) ||
    /^\/hospital\/(dashboard|profile|packages|inquiries|appointments|analytics|chat|visa)/.test(pathname) ||
    /^\/hospital\/[^/]+$/.test(pathname) ||
    (user && (role === "hospital" || role === "admin" || role === "agent"));
  if (hidden) return null;

  const tabs = [
    { label: "Home", href: "/", icon: Home },
    { label: "Hospitals", href: "/hospitals", icon: Search },
    { label: "Messages", href: user ? "/patient/inbox" : "/auth?redirect=/patient/inbox", icon: MessageCircle, match: "/patient/inbox" },
    user
      ? { label: "Journey", href: "/patient/dashboard", icon: LayoutDashboard }
      : { label: "Sign In", href: "/auth", icon: User },
  ];

  const isActive = (t: (typeof tabs)[number]) => {
    const h = ("match" in t && t.match) || t.href;
    return h === "/" ? pathname === "/" : pathname.startsWith(h);
  };

  return (
    <nav
      aria-label="Main"
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t border-border bg-background/95 backdrop-blur pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="grid grid-cols-4">
        {tabs.map((t) => {
          const active = isActive(t);
          const Icon = t.icon;
          return (
            <li key={t.label}>
              <Link
                to={t.href}
                aria-current={active ? "page" : undefined}
                className={`flex flex-col items-center justify-center gap-0.5 h-14 text-[11px] font-medium transition-colors ${active ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
              >
                <Icon className="h-5 w-5" />
                {t.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default MobileBottomNav;
