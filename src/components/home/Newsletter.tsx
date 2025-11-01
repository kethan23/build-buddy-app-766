import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslation } from "react-i18next";

const Newsletter = () => {
  const { t } = useTranslation();
  
  return (
    <section className="py-16 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <Mail className="h-12 w-12 mx-auto mb-6" />
          <h2 className="font-heading font-bold text-3xl md:text-4xl mb-4">
            {t('newsletter.title')}
          </h2>
          <p className="text-primary-foreground/90 mb-8">
            {t('newsletter.subtitle')}
          </p>
          <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <Input
              type="email"
              placeholder={t('newsletter.placeholder')}
              className="bg-primary-foreground text-foreground flex-1"
            />
            <Button type="submit" variant="secondary" size="lg">
              {t('newsletter.subscribe')}
            </Button>
          </form>
          <p className="text-sm text-primary-foreground/80 mt-4">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
