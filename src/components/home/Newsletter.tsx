import { Mail, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslation } from "react-i18next";
import { ScrollReveal } from "@/hooks/useScrollAnimation";

const Newsletter = () => {
  const { t } = useTranslation();

  return (
    <section className="relative py-20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-primary opacity-95" />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary-foreground/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-primary-foreground/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <ScrollReveal>
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 mb-7">
              <Mail className="h-8 w-8 text-primary-foreground" />
            </div>
            <h2 className="font-heading font-bold text-3xl md:text-4xl mb-4 text-primary-foreground">
              {t('newsletter.title')}
            </h2>
            <p className="text-primary-foreground/80 mb-9 leading-relaxed max-w-xl mx-auto">
              {t('newsletter.subtitle')}
            </p>
            <div className="max-w-lg mx-auto p-1.5 rounded-2xl bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/15">
              <form className="flex flex-col sm:flex-row gap-2">
                <Input
                  type="email"
                  placeholder={t('newsletter.placeholder')}
                  className="bg-primary-foreground text-foreground border-0 flex-1 h-12 rounded-xl px-5 placeholder:text-muted-foreground"
                />
                <Button type="submit" variant="secondary" size="lg" className="h-12 rounded-xl px-6 font-semibold gap-2 shrink-0">
                  {t('newsletter.subscribe')}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </form>
            </div>
            <p className="text-sm text-primary-foreground/60 mt-5">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default Newsletter;
