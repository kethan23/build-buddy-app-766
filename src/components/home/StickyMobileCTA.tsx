import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

/**
 * Floating mobile-only CTA on the landing page.
 * Hides during initial hero view (top of page) and on scroll-up momentum.
 */
export const StickyMobileCTA = () => {
  const { user } = useAuth();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 600);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  const href = user ? "/hospitals" : "/auth";

  return (
    <div className="sm:hidden fixed bottom-4 left-4 right-4 z-40 animate-in slide-in-from-bottom-4">
      <Button
        asChild
        size="lg"
        className="w-full h-12 rounded-full shadow-lg shadow-primary/30 bg-gradient-to-r from-primary to-sky-500 text-primary-foreground"
      >
        <Link to={href}>
          <Sparkles className="h-4 w-4 mr-2" />
          Get a Free Quote
        </Link>
      </Button>
    </div>
  );
};

export default StickyMobileCTA;
