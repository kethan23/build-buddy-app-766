import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, Globe, MoreHorizontal, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import NotificationCenter from "@/components/notifications/NotificationCenter";
import { useTranslation } from "react-i18next";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { role } = useUserRole();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const dashboardHref =
    role === 'admin' ? '/admin/dashboard' :
    role === 'hospital' ? '/hospital/dashboard' :
    '/patient/dashboard';

  const primaryLinks = [
    { label: t('nav.home'), href: "/" },
    { label: t('nav.hospitals'), href: "/hospitals" },
    { label: t('nav.treatments'), href: "/treatments" },
    { label: 'Visa', href: "/visa-info" },
    ...(user ? [
      { label: 'Dashboard', href: '/patient/dashboard' },
      ...(role === 'admin' ? [{ label: 'Admin Dashboard', href: '/admin/dashboard' }] : []),
      ...(role === 'hospital' ? [{ label: 'Hospital Dashboard', href: '/hospital/dashboard' }] : []),
      ...(role === 'agent' ? [{ label: 'Agent Dashboard', href: '/agent/dashboard' }] : []),
      { label: 'Messages', href: role === 'admin' ? '/admin/communications' : role === 'hospital' ? '/hospital/chat' : '/patient/inbox' },
    ] : []),
  ];

  const secondaryLinks = [
    { label: t('nav.howItWorks'), href: "/how-it-works" },
    { label: t('nav.about'), href: "/about" },
    { label: t('nav.support'), href: "/support" },
  ];

  const handleLanguageChange = (value: string) => {
    i18n.changeLanguage(value);
  };

  const allLinks = [...primaryLinks, ...secondaryLinks];

  const roleLinks: { label: string; href: string }[] = [];
  if (user && role === 'admin') {
    roleLinks.push(
      { label: 'Dashboard', href: '/admin/dashboard' },
      { label: 'Communications', href: '/admin/communications' },
      { label: 'Manage Hospitals', href: '/admin/hospitals' },
      { label: 'Manage Users', href: '/admin/users' },
      { label: 'Visa Management', href: '/admin/visa' },
    );
  } else if (user && role === 'hospital') {
    roleLinks.push(
      { label: 'Dashboard', href: '/hospital/dashboard' },
      { label: 'Inquiries', href: '/hospital/inquiries' },
      { label: 'Messages', href: '/hospital/chat' },
    );
  } else if (user && role === 'patient') {
    roleLinks.push(
      { label: 'Dashboard', href: '/patient/dashboard' },
      { label: 'Inbox', href: '/patient/inbox' },
      { label: 'Bookings', href: '/patient/bookings' },
    );
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="flex h-14 sm:h-16 items-center justify-between">
          {/* Logo + AI Analysis */}
          <div className="flex items-center gap-2.5 shrink-0">
            <Link to="/" className="flex items-center space-x-1.5 sm:space-x-2">
              <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-base sm:text-lg">M</span>
              </div>
              <span className="font-heading font-bold text-lg sm:text-xl text-primary">MediConnect</span>
            </Link>
            <button
              onClick={() => navigate("/patient/ai-analysis")}
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/5 border border-primary/10 hover:bg-primary/10 transition-colors cursor-pointer"
            >
              <Brain className="h-3.5 w-3.5 text-primary" />
              <span className="text-[11px] font-semibold text-primary">AI Analysis</span>
              <span className="text-[8px] font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded-full leading-none">BETA</span>
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6">
            {primaryLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
              >
                {link.label}
              </Link>
            ))}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-sm font-medium text-foreground/80 hover:text-primary gap-1">
                  More <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {secondaryLinks.map((link) => (
                  <DropdownMenuItem key={link.href} asChild>
                    <Link to={link.href} className="w-full cursor-pointer">
                      {link.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
                {roleLinks.length > 0 && (
                  <>
                    <DropdownMenuSeparator />
                    {roleLinks.map((link) => (
                      <DropdownMenuItem key={link.href} asChild>
                        <Link to={link.href} className="w-full cursor-pointer">
                          {link.label}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-1.5 sm:space-x-3">
            {/* Language Selector - compact on mobile */}
            <Select value={i18n.language} onValueChange={handleLanguageChange}>
              <SelectTrigger className="w-10 sm:w-24 h-8 sm:h-9 px-2 sm:px-3">
                <Globe className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline ml-1"><SelectValue /></span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="ar">العربية</SelectItem>
                <SelectItem value="es">Español</SelectItem>
                <SelectItem value="fr">Français</SelectItem>
              </SelectContent>
            </Select>

            {user && <NotificationCenter />}

            {user ? (
              <>
                <Button size="sm" variant="ghost" className="hidden lg:flex" asChild>
                  <Link to={dashboardHref}>{t('nav.dashboard')}</Link>
                </Button>
                <Button size="sm" variant="outline" className="hidden lg:flex" onClick={() => signOut()}>
                  {t('nav.signOut')}
                </Button>
              </>
            ) : (
              <Button size="sm" className="hidden sm:flex text-xs sm:text-sm h-8 sm:h-9 px-3 sm:px-4" asChild>
                <Link to="/auth">{t('nav.signIn')}</Link>
              </Button>
            )}

            {/* Mobile Menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9">
                  {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:w-[300px] px-5 pt-6">
                <div className="flex flex-col space-y-1 mt-6">
                  {allLinks.map((link) => (
                    <Link
                      key={link.href}
                      to={link.href}
                      onClick={() => setIsOpen(false)}
                      className="text-base font-medium text-foreground hover:text-primary hover:bg-primary/5 transition-colors py-2.5 px-3 rounded-lg"
                    >
                      {link.label}
                    </Link>
                  ))}
                  {roleLinks.length > 0 && (
                    <>
                      <div className="h-px bg-border my-3" />
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-1">
                        {role} Portal
                      </p>
                      {roleLinks.map((link) => (
                        <Link
                          key={link.href}
                          to={link.href}
                          onClick={() => setIsOpen(false)}
                          className="text-base font-medium text-foreground hover:text-primary hover:bg-primary/5 transition-colors py-2.5 px-3 rounded-lg"
                        >
                          {link.label}
                        </Link>
                      ))}
                    </>
                  )}
                  <div className="pt-4">
                    {user ? (
                      <Button className="w-full" onClick={() => { signOut(); setIsOpen(false); }}>
                        {t('nav.signOut')}
                      </Button>
                    ) : (
                      <Button className="w-full" asChild>
                        <Link to="/auth" onClick={() => setIsOpen(false)}>{t('nav.signIn')}</Link>
                      </Button>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
