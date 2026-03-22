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
    <section className="py-12 sm:py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-muted/30 pointer-events-none" />

      <div className="container mx-auto px-4 relative">
        <ScrollReveal>
          <div className="text-center mb-8 sm:mb-14">
            <div className="section-badge mx-auto w-fit text-xs sm:text-sm">
              <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Simple Process
            </div>
            <h2 className="font-heading font-bold text-2xl sm:text-3xl md:text-4xl mb-3 sm:mb-4 mt-3 sm:mt-4">
              {t('howItWorks.title')}
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto px-2">
              {t('howItWorks.subtitle')}
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
          {localizedSteps.map((step, index) => {
            const Icon = step.icon;
            return (
              <ScrollReveal key={index} delay={index * 150} animation="fade-up">
                <div className="relative">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-14 h-14 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl bg-primary/10 mb-3 sm:mb-5 relative group">
                      <Icon className="h-6 w-6 sm:h-9 sm:w-9 text-primary" />
                      <div className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs sm:text-sm shadow-lg">
                        {index + 1}
                      </div>
                    </div>
                    <h3 className="font-heading font-semibold text-sm sm:text-lg mb-1.5 sm:mb-3">{step.title}</h3>
                    <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">{step.description}</p>
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
