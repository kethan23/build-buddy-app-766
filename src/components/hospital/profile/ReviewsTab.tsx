import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Star, MessageSquarePlus, Play, ImageIcon, Sparkles } from 'lucide-react';
import { ReviewForm } from '@/components/patient/ReviewForm';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ScrollReveal } from '@/hooks/useScrollAnimation';

interface ReviewsTabProps {
  hospitalId: string;
  hospitalName: string;
}

const ReviewsTab = ({ hospitalId, hospitalName }: ReviewsTabProps) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewFormOpen, setReviewFormOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<{ type: 'image' | 'video'; url: string } | null>(null);

  const fetchReviews = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('reviews' as any)
      .select('*, profiles!reviews_user_id_fkey(full_name, country, profile_image_url)')
      .eq('hospital_id', hospitalId)
      .eq('is_visible', true)
      .order('created_at', { ascending: false });
    setReviews((data as any[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchReviews();
  }, [hospitalId]);

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0';

  const ratingCounts = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter((r: any) => r.rating === star).length,
    pct: reviews.length > 0 ? (reviews.filter((r: any) => r.rating === star).length / reviews.length) * 100 : 0,
  }));

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card className="elegant-card overflow-hidden">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Patient Reviews
            </CardTitle>
            {user && (
              <Button className="btn-gradient text-white gap-2" onClick={() => setReviewFormOpen(true)}>
                <MessageSquarePlus className="h-4 w-4" />
                Write a Review
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
            {/* Average */}
            <div className="text-center">
              <div className="text-5xl font-heading font-bold text-primary">{avgRating}</div>
              <div className="flex gap-0.5 my-2 justify-center">
                {[1, 2, 3, 4, 5].map(s => (
                  <Star key={s} className={`h-5 w-5 ${s <= Math.round(Number(avgRating)) ? 'fill-warning text-warning' : 'text-muted-foreground/20'}`} />
                ))}
              </div>
              <p className="text-sm text-muted-foreground">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
            </div>

            {/* Breakdown */}
            <div className="flex-1 space-y-2 w-full max-w-sm">
              {ratingCounts.map(({ star, count, pct }) => (
                <div key={star} className="flex items-center gap-3 text-sm">
                  <span className="w-8 text-right font-medium">{star}★</span>
                  <div className="flex-1 h-2.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-warning transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-8 text-muted-foreground">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      {loading ? (
        <div className="text-center py-10 text-muted-foreground">Loading reviews...</div>
      ) : reviews.length === 0 ? (
        <Card className="elegant-card">
          <CardContent className="flex flex-col items-center py-14">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <MessageSquarePlus className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-heading font-semibold text-lg mb-1">No reviews yet</h3>
            <p className="text-muted-foreground text-center max-w-sm mb-4">
              Be the first to share your experience with {hospitalName}.
            </p>
            {user && (
              <Button className="btn-gradient text-white" onClick={() => setReviewFormOpen(true)}>
                Write a Review
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((review: any, index: number) => {
            const profile = review.profiles;
            const photos = Array.isArray(review.photo_urls) ? review.photo_urls : [];
            return (
              <ScrollReveal key={review.id} delay={index * 80} animation="fade-up">
                <Card className="elegant-card">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-11 w-11 ring-2 ring-primary/20 ring-offset-2 ring-offset-card">
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {profile?.full_name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div>
                            <span className="font-heading font-semibold">{profile?.full_name || 'Anonymous'}</span>
                            {profile?.country && (
                              <span className="text-sm text-muted-foreground ml-2">from {profile.country}</span>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(review.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map(s => (
                              <Star key={s} className={`h-4 w-4 ${s <= review.rating ? 'fill-warning text-warning' : 'text-muted-foreground/20'}`} />
                            ))}
                          </div>
                          {review.is_verified && <Badge variant="secondary" className="text-xs">Verified Patient</Badge>}
                        </div>

                        {review.title && <h4 className="font-medium mt-3">{review.title}</h4>}
                        <p className="text-muted-foreground mt-2 leading-relaxed">{review.comment}</p>

                        {/* Photos */}
                        {photos.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {photos.map((url: string, i: number) => (
                              <button
                                key={i}
                                onClick={() => setSelectedMedia({ type: 'image', url })}
                                className="w-20 h-20 rounded-lg overflow-hidden border border-border hover:ring-2 hover:ring-primary/40 transition-all"
                              >
                                <img src={url} alt="" className="w-full h-full object-cover" />
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Video */}
                        {review.video_url && (
                          <button
                            onClick={() => setSelectedMedia({ type: 'video', url: review.video_url })}
                            className="mt-3 flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/5 border border-primary/20 hover:bg-primary/10 transition-colors"
                          >
                            <Play className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium text-primary">Watch Video Testimonial</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </ScrollReveal>
            );
          })}
        </div>
      )}

      {/* Review Form Dialog */}
      <ReviewForm
        open={reviewFormOpen}
        onOpenChange={setReviewFormOpen}
        hospitalId={hospitalId}
        hospitalName={hospitalName}
        onSuccess={fetchReviews}
      />

      {/* Media Viewer */}
      <Dialog open={!!selectedMedia} onOpenChange={() => setSelectedMedia(null)}>
        <DialogContent className="sm:max-w-[700px] p-2">
          {selectedMedia?.type === 'image' ? (
            <img src={selectedMedia.url} alt="Review photo" className="w-full rounded-lg" />
          ) : selectedMedia?.type === 'video' ? (
            <video src={selectedMedia.url} controls autoPlay className="w-full rounded-lg" />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReviewsTab;
