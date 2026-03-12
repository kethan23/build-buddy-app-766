import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Globe, Phone, MoreHorizontal } from "lucide-react";
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

  // Primary links always visible
  const primaryLinks = [
    { label: t('nav.home'), href: "/" },
    { label: t('nav.hospitals'), href: "/hospitals" },
    { label: t('nav.treatments'), href: "/treatments" },
  ];

  // Secondary links go into "More" dropdown
  const secondaryLinks = [
    { label: 'Visa Assistance', href: "/visa-info" },
    { label: t('nav.howItWorks'), href: "/how-it-works" },
    { label: t('nav.about'), href: "/about" },
    { label: t('nav.support'), href: "/support" },
  ];

  // Role-specific dashboard link (single entry, no duplication)
  const dashboardHref =
    role === 'admin' ? '/admin/dashboard' :
    role === 'hospital' ? '/hospital/dashboard' :
    '/patient/dashboard';

  const handleLanguageChange = (value: string) => {
    i18n.changeLanguage(value);
  };

  // All links for mobile menu
  const allLinks = [...primaryLinks, ...secondaryLinks];

  // Role-specific links for mobile
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
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">M</span>
            </div>
            <span className="font-heading font-bold text-xl text-primary">MediConnect</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {primaryLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
              >
                {link.label}
              </Link>
            ))}

            {/* More dropdown for secondary links */}
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
          <div className="flex items-center space-x-3">
            {/* Language Selector */}
            <Select value={i18n.language} onValueChange={handleLanguageChange}>
              <SelectTrigger className="w-24 h-9">
                <Globe className="h-4 w-4 mr-2" />
                <SelectValue />
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
              <Button size="sm" className="hidden lg:flex" asChild>
                <Link to="/auth">{t('nav.signIn')}</Link>
              </Button>
            )}

            {/* Mobile Menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px]">
                <div className="flex flex-col space-y-4 mt-8">
                  {allLinks.map((link) => (
                    <Link
                      key={link.href}
                      to={link.href}
                      onClick={() => setIsOpen(false)}
                      className="text-lg font-medium text-foreground hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}
                  {roleLinks.length > 0 && (
                    <>
                      <div className="h-px bg-border my-2" />
                      {roleLinks.map((link) => (
                        <Link
                          key={link.href}
                          to={link.href}
                          onClick={() => setIsOpen(false)}
                          className="text-lg font-medium text-foreground hover:text-primary transition-colors"
                        >
                          {link.label}
                        </Link>
                      ))}
                    </>
                  )}
                  {user ? (
                    <Button className="w-full mt-4" onClick={() => { signOut(); setIsOpen(false); }}>
                      {t('nav.signOut')}
                    </Button>
                  ) : (
                    <Button className="w-full mt-4" asChild>
                      <Link to="/auth" onClick={() => setIsOpen(false)}>{t('nav.signIn')}</Link>
                    </Button>
                  )}
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
