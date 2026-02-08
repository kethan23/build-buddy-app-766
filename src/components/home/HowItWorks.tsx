import { Search, FileText, Plane, Stethoscope, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ScrollReveal } from "@/hooks/useScrollAnimation";

const HowItWorks = () => {
  const { t } = useTranslation();

  const localizedSteps = [
    { icon: Search, title: t('howItWorks.step1Title'), description: t('howItWorks.step1Desc') },
    { icon: FileText, title: t('howItWorks.step2Title'), description: t('howItWorks.step2Desc') },
    { icon: Plane, title: t('howItWorks.step3Title'), description: t('howItWorks.step3Desc') },
    { icon: Stethoscope, title: t('howItWorks.step4Title'), description: t('howItWorks.step4Desc') },
  ];

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Premium background */}
      <div className="absolute inset-0 bg-muted/30 pointer-events-none" />
      <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 relative">
        <ScrollReveal>
          <div className="text-center mb-14">
            <div className="section-badge mx-auto w-fit">
              <Sparkles className="h-4 w-4" />
              Simple Process
            </div>
            <h2 className="font-heading font-bold text-3xl md:text-4xl mb-4 mt-4">
              {t('howItWorks.title')}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t('howItWorks.subtitle')}
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {localizedSteps.map((step, index) => {
            const Icon = step.icon;
            return (
              <ScrollReveal key={index} delay={index * 150} animation="fade-up">
                <div className="relative">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 mb-5 relative group">
                      <Icon className="h-9 w-9 text-primary" />
                      <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shadow-lg">
                        {index + 1}
                      </div>
                    </div>
                    <h3 className="font-heading font-semibold text-lg mb-3">{step.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
                  </div>
                  {index < localizedSteps.length - 1 && (
                    <div className="hidden lg:block absolute top-10 left-[60%] w-full h-0.5 bg-gradient-to-r from-primary/30 to-primary/5" />
                  )}
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
