import { Search, FileText, Plane, Stethoscope } from "lucide-react";
import { useTranslation } from "react-i18next";

const steps = [
  {
    icon: Search,
    title: "Search & Compare",
    description: "Browse hospitals, compare prices, and read patient reviews to find the best option for your treatment.",
  },
  {
    icon: FileText,
    title: "Get Quotes",
    description: "Request personalized quotes from multiple hospitals and consult with doctors via video call.",
  },
  {
    icon: Plane,
    title: "Plan Your Trip",
    description: "We assist with visa, travel arrangements, accommodation, and airport transfers.",
  },
  {
    icon: Stethoscope,
    title: "Receive Treatment",
    description: "Get world-class treatment with dedicated support throughout your medical journey.",
  },
];

const HowItWorks = () => {
  const { t } = useTranslation();
  
  const localizedSteps = [
    {
      icon: Search,
      title: t('howItWorks.step1Title'),
      description: t('howItWorks.step1Desc'),
    },
    {
      icon: FileText,
      title: t('howItWorks.step2Title'),
      description: t('howItWorks.step2Desc'),
    },
    {
      icon: Plane,
      title: t('howItWorks.step3Title'),
      description: t('howItWorks.step3Desc'),
    },
    {
      icon: Stethoscope,
      title: t('howItWorks.step4Title'),
      description: t('howItWorks.step4Desc'),
    },
  ];
  
  return (
    <section className="py-16 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-heading font-bold text-3xl md:text-4xl mb-4">
            {t('howItWorks.title')}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t('howItWorks.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {localizedSteps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="relative">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4 relative">
                    <Icon className="h-10 w-10 text-primary" />
                    <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>
                  </div>
                  <h3 className="font-heading font-semibold text-xl mb-3">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
                {index < localizedSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-10 left-[60%] w-full h-0.5 bg-gradient-to-r from-primary/50 to-primary/10"></div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
