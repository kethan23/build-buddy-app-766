import { Star, Quote } from "lucide-react";
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
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-heading font-bold text-3xl md:text-4xl mb-4">
            {t('testimonials.title')}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t('testimonials.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="relative">
              <Quote className="absolute top-4 right-4 h-8 w-8 text-primary/20" />
              <CardContent className="p-6">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-warning text-warning" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-6 italic">"{testimonial.comment}"</p>
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                    <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.country}</div>
                    <div className="text-xs text-primary">{testimonial.treatment}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
