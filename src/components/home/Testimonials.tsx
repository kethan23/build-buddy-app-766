import { Star, Quote, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTranslation } from "react-i18next";

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
    <section className="relative py-20 overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-secondary/3 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-14">
          <div className="section-badge mx-auto mb-4 w-fit">
            <Sparkles className="h-4 w-4" />
            <span>Patient Stories</span>
          </div>
          <h2 className="font-heading font-bold text-3xl md:text-4xl mb-4">
            {t('testimonials.title')}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {t('testimonials.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 150}ms`, animationFillMode: 'both' }}
            >
              <div className="elegant-card h-full">
                <div className="relative p-7">
                  {/* Decorative quote icon */}
                  <div className="absolute top-5 right-5 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Quote className="h-4 w-4 text-primary" />
                  </div>

                  {/* Star rating */}
                  <div className="flex gap-1 mb-5">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-warning text-warning" />
                    ))}
                  </div>

                  {/* Comment */}
                  <p className="text-muted-foreground mb-7 italic leading-relaxed">
                    "{testimonial.comment}"
                  </p>

                  {/* Divider */}
                  <div className="h-px bg-border mb-5" />

                  {/* Author info */}
                  <div className="flex items-center gap-3">
                    <Avatar className="h-11 w-11 ring-2 ring-primary/20 ring-offset-2 ring-offset-card">
                      <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {testimonial.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-heading font-semibold text-foreground">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.country}</div>
                      <div className="text-xs font-medium text-primary">{testimonial.treatment}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
