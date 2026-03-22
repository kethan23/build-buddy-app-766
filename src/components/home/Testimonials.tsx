import { Star, Quote, Sparkles } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTranslation } from "react-i18next";
import { ScrollReveal } from "@/hooks/useScrollAnimation";

const testimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    country: "United States",
    treatment: "Cardiac Surgery",
    rating: 5,
    comment: "The care I received was exceptional. The doctors were highly skilled and the facilities were world-class. I saved over 60% compared to US prices.",
    avatar: "/placeholder.svg",
  },
  {
    id: 2,
    name: "Ahmed Al-Rahman",
    country: "Saudi Arabia",
    treatment: "Orthopedic Surgery",
    rating: 5,
    comment: "From booking to post-surgery care, everything was seamless. MediConnect made my medical journey stress-free and affordable.",
    avatar: "/placeholder.svg",
  },
  {
    id: 3,
    name: "Emma Wilson",
    country: "United Kingdom",
    treatment: "Dental Implants",
    rating: 5,
    comment: "Amazing experience! The hospital was clean, staff was friendly, and the treatment quality exceeded my expectations. Highly recommended.",
    avatar: "/placeholder.svg",
  },
];

const Testimonials = () => {
  const { t } = useTranslation();

  return (
    <section className="relative py-12 sm:py-20 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <ScrollReveal>
          <div className="text-center mb-8 sm:mb-14">
            <div className="section-badge mx-auto mb-3 sm:mb-4 w-fit text-xs sm:text-sm">
              <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>Patient Stories</span>
            </div>
            <h2 className="font-heading font-bold text-2xl sm:text-3xl md:text-4xl mb-3 sm:mb-4">
              {t('testimonials.title')}
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto leading-relaxed px-2">
              {t('testimonials.subtitle')}
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-8">
          {testimonials.map((testimonial, index) => (
            <ScrollReveal key={testimonial.id} delay={index * 150} animation="fade-up">
              <div className="elegant-card h-full">
                <div className="relative p-4 sm:p-7">
                  <div className="absolute top-3 right-3 sm:top-5 sm:right-5 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Quote className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                  </div>
                  <div className="flex gap-0.5 sm:gap-1 mb-3 sm:mb-5">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-warning text-warning" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4 sm:mb-7 italic leading-relaxed text-xs sm:text-base">
                    "{testimonial.comment}"
                  </p>
                  <div className="h-px bg-border mb-3 sm:mb-5" />
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    <Avatar className="h-9 w-9 sm:h-11 sm:w-11 ring-2 ring-primary/20 ring-offset-2 ring-offset-card">
                      <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs sm:text-base">
                        {testimonial.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-heading font-semibold text-foreground text-sm sm:text-base">{testimonial.name}</div>
                      <div className="text-xs sm:text-sm text-muted-foreground">{testimonial.country}</div>
                      <div className="text-[10px] sm:text-xs font-medium text-primary">{testimonial.treatment}</div>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
