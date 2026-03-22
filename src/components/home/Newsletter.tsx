import { Mail, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslation } from "react-i18next";
import { ScrollReveal } from "@/hooks/useScrollAnimation";

const Newsletter = () => {
  const { t } = useTranslation();

  return (
    <section className="relative py-12 sm:py-20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-primary opacity-95" />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary-foreground/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-primary-foreground/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <ScrollReveal>
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 mb-5 sm:mb-7">
              <Mail className="h-6 w-6 sm:h-8 sm:w-8 text-primary-foreground" />
            </div>
            <h2 className="font-heading font-bold text-xl sm:text-3xl md:text-4xl mb-3 sm:mb-4 text-primary-foreground">
              {t('newsletter.title')}
            </h2>
            <p className="text-primary-foreground/80 mb-6 sm:mb-9 leading-relaxed max-w-xl mx-auto text-xs sm:text-base px-2">
              {t('newsletter.subtitle')}
            </p>
            <div className="max-w-lg mx-auto p-1 sm:p-1.5 rounded-xl sm:rounded-2xl bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/15">
              <form className="flex flex-col sm:flex-row gap-2">
                <Input
                  type="email"
                  placeholder={t('newsletter.placeholder')}
                  className="bg-primary-foreground text-foreground border-0 flex-1 h-10 sm:h-12 rounded-lg sm:rounded-xl px-4 sm:px-5 placeholder:text-muted-foreground text-sm"
                />
                <Button type="submit" variant="secondary" size="lg" className="h-10 sm:h-12 rounded-lg sm:rounded-xl px-5 sm:px-6 font-semibold gap-2 shrink-0 text-sm">
                  {t('newsletter.subscribe')}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </form>
            </div>
            <p className="text-[10px] sm:text-sm text-primary-foreground/60 mt-4 sm:mt-5">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default Newsletter;
