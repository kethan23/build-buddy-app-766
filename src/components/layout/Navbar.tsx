import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, Globe, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import NotificationCenter from "@/components/notifications/NotificationCenter";
import CurrencySelector from "@/components/CurrencySelector";
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

  const { pathname } = useLocation();
  const isActivePath = (href: string) =>
    href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(href + '/') || (href === '/hospitals' && pathname.startsWith('/hospital/'));
  const primaryLinks = [
    { label: t('nav.hospitals'), href: "/hospitals" },
    { label: t('nav.treatments'), href: "/treatments" },
  ];

  const planLinks = [
    { label: 'Cost Estimator', href: "/cost-estimator", desc: 'Compare treatment prices' },
    { label: 'Visa Help', href: "/visa-info", desc: 'Medical visa guidance' },
    { label: 'AI Report Analysis', href: "/patient/ai-analysis", desc: 'Understand your reports' },
    { label: 'Compare Hospitals', href: "/compare", desc: 'Side-by-side view' },
  ];

  const secondaryLinks = [
    { label: t('nav.howItWorks'), href: "/how-it-works" },
    { label: 'Success Stories', href: "/success-stories" },
    { label: t('nav.about'), href: "/about" },
    { label: 'Pricing', href: "/pricing" },
    { label: 'Blog', href: "/blog" },
    { label: 'Contact', href: "/contact" },
    { label: t('nav.support'), href: "/support" },
  ];

  const handleLanguageChange = (value: string) => {
    i18n.changeLanguage(value);
  };


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
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
            <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-base sm:text-lg">M</span>
            </div>
            <span className="font-heading font-bold text-lg sm:text-xl text-primary">MediConnect</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1 mx-4 flex-1 justify-center">
            {primaryLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                aria-current={isActivePath(link.href) ? 'page' : undefined}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:text-primary hover:bg-primary/5 ${isActivePath(link.href) ? 'text-primary bg-primary/5' : 'text-foreground/80'}`}
              >
                {link.label}
              </Link>
            ))}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className={`text-sm font-medium gap-1 ${planLinks.some(l => isActivePath(l.href)) ? 'text-primary' : 'text-foreground/80'}`}>
                  Plan Your Trip <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-[420px] p-2 grid grid-cols-2 gap-1">
                {planLinks.map((link) => (
                  <DropdownMenuItem key={link.href} asChild>
                    <Link to={link.href} className="flex flex-col items-start gap-0.5 cursor-pointer rounded-lg p-3">
                      <span className="text-sm font-medium">{link.label}</span>
                      <span className="text-xs text-muted-foreground">{link.desc}</span>
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-sm font-medium text-foreground/80 gap-1">
                  Learn <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-48">
                {secondaryLinks.map((link) => (
                  <DropdownMenuItem key={link.href} asChild>
                    <Link to={link.href} className="w-full cursor-pointer">{link.label}</Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-1.5 sm:space-x-3">
            {/* Language Selector - only on home page; choice applies site-wide */}
            {pathname === '/' && (
              <div className="hidden lg:flex items-center gap-2">
              <Select value={i18n.language} onValueChange={handleLanguageChange}>
              <SelectTrigger className="w-24 h-9 px-3">
                <Globe className="h-4 w-4 shrink-0" />
                <span className="ml-1"><SelectValue /></span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="ar">العربية</SelectItem>
                <SelectItem value="es">Español</SelectItem>
                <SelectItem value="fr">Français</SelectItem>
              </SelectContent>
            </Select>

            <CurrencySelector />
              </div>
            )}

            {user && <NotificationCenter />}

            {user ? (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="outline" className="hidden lg:flex gap-1">
                      My Account <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    {roleLinks.map((link) => (
                      <DropdownMenuItem key={link.href} asChild>
                        <Link to={link.href} className="w-full cursor-pointer">{link.label}</Link>
                      </DropdownMenuItem>
                    ))}
                    {roleLinks.length === 0 && (
                      <DropdownMenuItem asChild><Link to={dashboardHref}>{t('nav.dashboard')}</Link></DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer">{t('nav.signOut')}</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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
                <div className="flex flex-col space-y-0.5 mt-4 overflow-y-auto max-h-[calc(100vh-4rem)] pb-6">
                  {roleLinks.length > 0 && (<>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mt-4 mb-1">My Account</p>
                  {roleLinks.map((link) => (
                    <Link key={link.href} to={link.href} onClick={() => setIsOpen(false)} className="text-base font-medium text-foreground hover:text-primary hover:bg-primary/5 transition-colors py-2.5 px-3 rounded-lg">
                      {link.label}
                    </Link>
                  ))}
                  </>)}
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mt-4 mb-1">Find Care</p>
                  {primaryLinks.map((link) => (
                    <Link key={link.href} to={link.href} onClick={() => setIsOpen(false)} className="text-base font-medium text-foreground hover:text-primary hover:bg-primary/5 transition-colors py-2.5 px-3 rounded-lg">
                      {link.label}
                    </Link>
                  ))}
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mt-4 mb-1">Plan Your Trip</p>
                  {planLinks.map((link) => (
                    <Link key={link.href} to={link.href} onClick={() => setIsOpen(false)} className="text-base font-medium text-foreground hover:text-primary hover:bg-primary/5 transition-colors py-2.5 px-3 rounded-lg">
                      {link.label}
                    </Link>
                  ))}
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mt-4 mb-1">Learn</p>
                  {secondaryLinks.map((link) => (
                    <Link key={link.href} to={link.href} onClick={() => setIsOpen(false)} className="text-base font-medium text-foreground hover:text-primary hover:bg-primary/5 transition-colors py-2.5 px-3 rounded-lg">
                      {link.label}
                    </Link>
                  ))}
                  {pathname === '/' && (<>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mt-4 mb-2">Language & Currency</p>
                  <div className="flex gap-2 px-3">
                    <Select value={i18n.language} onValueChange={handleLanguageChange}>
                      <SelectTrigger className="w-28 h-9"><Globe className="h-4 w-4 mr-1" /><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="ar">العربية</SelectItem>
                        <SelectItem value="es">Español</SelectItem>
                        <SelectItem value="fr">Français</SelectItem>
                      </SelectContent>
                    </Select>
                    <CurrencySelector />
                  </div>
                  </>)}
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
