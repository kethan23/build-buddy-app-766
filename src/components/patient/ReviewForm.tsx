import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Star, Upload, X, Image as ImageIcon, Video, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ReviewFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hospitalId: string;
  hospitalName: string;
  bookingId?: string;
  onSuccess?: () => void;
}

export const ReviewForm = ({ open, onOpenChange, hospitalId, hospitalName, bookingId, onSuccess }: ReviewFormProps) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [video, setVideo] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handlePhotoAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(f => {
      if (f.size > 5 * 1024 * 1024) {
        toast.error(`${f.name} exceeds 5MB limit`);
        return false;
      }
      return f.type.startsWith('image/');
    });
    setPhotos(prev => [...prev, ...validFiles].slice(0, 5));
    e.target.value = '';
  };

  const handleVideoAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) {
      toast.error('Video must be under 50MB');
      return;
    }
    if (!file.type.startsWith('video/')) {
      toast.error('Please upload a video file');
      return;
    }
    setVideo(file);
    e.target.value = '';
  };

  const uploadFile = async (file: File, folder: string) => {
    const ext = file.name.split('.').pop();
    const path = `${user?.id}/${folder}/${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
    const { error } = await supabase.storage.from('review-media').upload(path, file);
    if (error) throw error;
    const { data } = supabase.storage.from('review-media').getPublicUrl(path);
    return data.publicUrl;
  };

  const handleSubmit = async () => {
    if (!user) return;
    if (rating === 0) { toast.error('Please select a rating'); return; }
    if (!comment.trim()) { toast.error('Please write a review'); return; }

    setSubmitting(true);
    try {
      const photoUrls: string[] = [];
      for (const photo of photos) {
        const url = await uploadFile(photo, 'photos');
        photoUrls.push(url);
      }

      let videoUrl: string | null = null;
      if (video) {
        videoUrl = await uploadFile(video, 'videos');
      }

      const { error } = await supabase.from('reviews' as any).insert({
        user_id: user.id,
        hospital_id: hospitalId,
        booking_id: bookingId || null,
        rating,
        title: title.trim() || null,
        comment: comment.trim(),
        photo_urls: photoUrls,
        video_url: videoUrl,
      });

      if (error) throw error;

      toast.success('Review submitted successfully!');
      onOpenChange(false);
      resetForm();
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setRating(0);
    setTitle('');
    setComment('');
    setPhotos([]);
    setVideo(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto elegant-card">
        <DialogHeader>
          <DialogTitle className="font-heading">Review {hospitalName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Star Rating */}
          <div>
            <Label className="mb-2 block">Your Rating *</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-0.5 transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-8 w-8 transition-colors ${
                      star <= (hoverRating || rating)
                        ? 'fill-warning text-warning'
                        : 'text-muted-foreground/30'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <Label htmlFor="review-title">Review Title</Label>
            <Input
              id="review-title"
              placeholder="Summarize your experience..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
            />
          </div>

          {/* Comment */}
          <div>
            <Label htmlFor="review-comment">Your Review *</Label>
            <Textarea
              id="review-comment"
              placeholder="Tell others about your experience with this hospital..."
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={2000}
            />
            <p className="text-xs text-muted-foreground mt-1">{comment.length}/2000</p>
          </div>

          {/* Photo Upload */}
          <div>
            <Label className="mb-2 block">Photos (up to 5)</Label>
            {photos.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {photos.map((photo, i) => (
                  <div key={i} className="relative group w-20 h-20 rounded-lg overflow-hidden border border-border">
                    <img src={URL.createObjectURL(photo)} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setPhotos(prev => prev.filter((_, idx) => idx !== i))}
                      className="absolute top-0.5 right-0.5 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {photos.length < 5 && (
              <label className="flex items-center gap-2 px-4 py-2 border border-dashed border-primary/30 rounded-lg cursor-pointer hover:bg-primary/5 transition-colors w-fit">
                <ImageIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Add Photos</span>
                <input type="file" className="hidden" accept="image/*" multiple onChange={handlePhotoAdd} />
              </label>
            )}
          </div>

          {/* Video Upload */}
          <div>
            <Label className="mb-2 block">Video Testimonial</Label>
            {video ? (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border">
                <Video className="h-5 w-5 text-primary" />
                <span className="text-sm flex-1 truncate">{video.name}</span>
                <span className="text-xs text-muted-foreground">
                  {(video.size / (1024 * 1024)).toFixed(1)} MB
                </span>
                <button type="button" onClick={() => setVideo(null)}>
                  <X className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                </button>
              </div>
            ) : (
              <label className="flex items-center gap-2 px-4 py-2 border border-dashed border-primary/30 rounded-lg cursor-pointer hover:bg-primary/5 transition-colors w-fit">
                <Video className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Add Video (max 50MB)</span>
                <input type="file" className="hidden" accept="video/*" onChange={handleVideoAdd} />
              </label>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button className="btn-gradient text-white" onClick={handleSubmit} disabled={submitting}>
            {submitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Submitting...</> : 'Submit Review'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
