import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Globe, Phone } from "lucide-react";
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

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { role } = useUserRole();
  const { t, i18n } = useTranslation();

  const navLinks = [
    { label: t('nav.home'), href: "/" },
    { label: t('nav.hospitals'), href: "/hospitals" },
    { label: t('nav.treatments'), href: "/treatments" },
    { label: t('nav.howItWorks'), href: "/how-it-works" },
    { label: t('nav.about'), href: "/about" },
    { label: t('nav.support'), href: "/support" },
  ];

  if (user) {
    navLinks.splice(3, 0, { label: t('nav.messages'), href: "/patient/chat" });
  }

  const handleLanguageChange = (value: string) => {
    i18n.changeLanguage(value);
  };

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
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
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

            {/* Notification Center (for logged-in users) */}
            {user && <NotificationCenter />}

            {/* Auth Buttons */}
            {user ? (
              <>
                <Button size="sm" variant="ghost" className="hidden lg:flex" asChild>
                  <Link to={
                    role === 'admin' ? '/admin/dashboard' :
                    role === 'hospital' ? '/hospital/dashboard' :
                    '/patient/dashboard'
                  }>
                    {t('nav.dashboard')}
                  </Link>
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
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      to={link.href}
                      onClick={() => setIsOpen(false)}
                      className="text-lg font-medium text-foreground hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}
                  <Button className="w-full mt-4">
                    <Phone className="h-4 w-4 mr-2" />
                    {t('nav.support247')}
                  </Button>
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
