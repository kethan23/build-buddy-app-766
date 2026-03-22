import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";

const Footer = () => {
  const { t } = useTranslation();
  const footerLinks = {
    "For Patients": [
      { label: "Find Hospitals", href: "/hospitals" },
      { label: "Browse Treatments", href: "/treatments" },
      { label: "How It Works", href: "/how-it-works" },
      { label: "Success Stories", href: "/success-stories" },
    ],
    "For Hospitals": [
      { label: "List Your Hospital", href: "/hospital-registration" },
      { label: "Hospital Portal", href: "/hospital/login" },
      { label: "Pricing", href: "/pricing" },
    ],
    "Resources": [
      { label: "Blog", href: "/blog" },
      { label: "Support Center", href: "/support" },
      { label: "FAQs", href: "/support#faq" },
      { label: "Travel Guide", href: "/travel-guide" },
    ],
    "Company": [
      { label: "About Us", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Careers", href: "/careers" },
      { label: "Press", href: "/press" },
    ],
  };

  return (
    <footer className="bg-muted border-t">
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-8">
          {/* Brand Section */}
          <div className="col-span-2 sm:col-span-2 md:col-span-3 lg:col-span-1 mb-2 lg:mb-0">
            <Link to="/" className="flex items-center space-x-2 mb-3 sm:mb-4">
              <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-base sm:text-lg">M</span>
              </div>
              <span className="font-heading font-bold text-lg sm:text-xl text-primary">MediConnect</span>
            </Link>
            <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 max-w-xs">
              {t('footer.tagline')}
            </p>
            <div className="flex space-x-3">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Facebook className="h-4 w-4 sm:h-5 sm:w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="h-4 w-4 sm:h-5 sm:w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="h-4 w-4 sm:h-5 sm:w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Linkedin className="h-4 w-4 sm:h-5 sm:w-5" />
              </a>
            </div>
          </div>

          {/* Links Sections */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="font-heading font-semibold text-sm sm:text-base mb-2.5 sm:mb-4">{title}</h3>
              <ul className="space-y-1.5 sm:space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact Info */}
        <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6">
            <div className="flex items-center space-x-2.5 sm:space-x-3">
              <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0" />
              <a 
                href="mailto:support@mediconnect.com" 
                className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                support@mediconnect.com
              </a>
            </div>
            <div className="flex items-center space-x-2.5 sm:space-x-3">
              <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0" />
              <a 
                href="tel:+919014883449" 
                className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                +91 9014883449
              </a>
            </div>
            <div className="flex items-center space-x-2.5 sm:space-x-3">
              <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0" />
              <span className="text-xs sm:text-sm text-muted-foreground">Vishakapatnam, AP, India</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
          <p className="text-xs sm:text-sm text-muted-foreground">
            © 2025 MediConnect. {t('footer.allRights')}
          </p>
          <div className="flex space-x-4 sm:space-x-6">
            <Link to="/privacy" className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors">
              {t('footer.privacy')}
            </Link>
            <Link to="/terms" className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors">
              {t('footer.terms')}
            </Link>
            <Link to="/cookies" className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
