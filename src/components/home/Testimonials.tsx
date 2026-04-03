import { useState, useEffect } from "react";
import { Star, Quote, Sparkles, MessageSquarePlus } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";
import { ScrollReveal } from "@/hooks/useScrollAnimation";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface ReviewWithProfile {
  id: string;
  rating: number;
  comment: string | null;
  title: string | null;
  created_at: string | null;
  hospital_id: string;
  user_id: string;
  profile_name: string;
  hospital_name: string;
  hospital_city: string | null;
}

const Testimonials = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [reviews, setReviews] = useState<ReviewWithProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("reviews")
        .select(`
          id, rating, comment, title, created_at, hospital_id, user_id,
          hospitals(name, city)
        `)
        .eq("is_visible", true)
        .gte("rating", 4)
        .order("created_at", { ascending: false })
        .limit(6);

      if (error) throw error;

      if (data && data.length > 0) {
        // Fetch profile names for all review authors
        const userIds = [...new Set(data.map((r) => r.user_id))];
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, full_name, country")
          .in("user_id", userIds);

        const profileMap = new Map(
          (profiles || []).map((p) => [p.user_id, p])
        );

        const mapped: ReviewWithProfile[] = data.map((r: any) => ({
          id: r.id,
          rating: r.rating,
          comment: r.comment,
          title: r.title,
          created_at: r.created_at,
          hospital_id: r.hospital_id,
          user_id: r.user_id,
          profile_name: profileMap.get(r.user_id)?.full_name || "Patient",
          hospital_name: r.hospitals?.name || "Hospital",
          hospital_city: r.hospitals?.city || null,
        }));

        setReviews(mapped);
      }
    } catch (err) {
      console.error("Error fetching reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-12 sm:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <Skeleton className="h-8 w-48 mx-auto mb-4" />
            <Skeleton className="h-5 w-72 mx-auto" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-8">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48 rounded-xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Empty state — no real reviews yet
  if (reviews.length === 0) {
    return (
      <section className="relative py-12 sm:py-20 overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <ScrollReveal>
            <div className="text-center">
              <div className="section-badge mx-auto mb-3 sm:mb-4 w-fit text-xs sm:text-sm">
                <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span>Patient Stories</span>
              </div>
              <h2 className="font-heading font-bold text-2xl sm:text-3xl md:text-4xl mb-3 sm:mb-4">
                {t("testimonials.title")}
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base max-w-md mx-auto mb-6">
                Be the first to share your medical tourism experience and help
                other patients make informed decisions.
              </p>
              <Button
                onClick={() => navigate("/patient/bookings")}
                className="btn-gradient text-primary-foreground"
              >
                <MessageSquarePlus className="h-4 w-4 mr-2" />
                Share Your Experience
              </Button>
            </div>
          </ScrollReveal>
        </div>
      </section>
    );
  }

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
              {t("testimonials.title")}
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto leading-relaxed px-2">
              {t("testimonials.subtitle")}
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-8">
          {reviews.map((review, index) => (
            <ScrollReveal key={review.id} delay={index * 150} animation="fade-up">
              <div className="elegant-card h-full">
                <div className="relative p-4 sm:p-7">
                  <div className="absolute top-3 right-3 sm:top-5 sm:right-5 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Quote className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                  </div>
                  <div className="flex gap-0.5 sm:gap-1 mb-3 sm:mb-5">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-warning text-warning"
                      />
                    ))}
                  </div>
                  {review.title && (
                    <h4 className="font-heading font-semibold text-sm sm:text-base mb-1.5">
                      {review.title}
                    </h4>
                  )}
                  <p className="text-muted-foreground mb-4 sm:mb-7 italic leading-relaxed text-xs sm:text-base line-clamp-4">
                    "{review.comment}"
                  </p>
                  <div className="h-px bg-border mb-3 sm:mb-5" />
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    <Avatar className="h-9 w-9 sm:h-11 sm:w-11 ring-2 ring-primary/20 ring-offset-2 ring-offset-card">
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs sm:text-base">
                        {review.profile_name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-heading font-semibold text-foreground text-sm sm:text-base">
                        {review.profile_name}
                      </div>
                      <div className="text-[10px] sm:text-xs font-medium text-primary">
                        {review.hospital_name}
                        {review.hospital_city && ` · ${review.hospital_city}`}
                      </div>
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
