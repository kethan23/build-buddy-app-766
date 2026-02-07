import { Image as ImageIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface GalleryTabProps {
  gallery: any[];
}

const GalleryTab = ({ gallery }: GalleryTabProps) => {
  if (gallery.length === 0) {
    return (
      <Card className="elegant-card">
        <CardContent className="py-16 text-center text-muted-foreground">
          <ImageIcon className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No gallery images available</p>
          <p className="text-sm mt-1">Check back soon for hospital photos</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      {gallery.map((image, index) => (
        <div
          key={image.id}
          className="group relative aspect-video rounded-xl overflow-hidden elegant-card animate-fade-in"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <img
            src={image.image_url}
            alt={image.caption || 'Hospital gallery'}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          {image.caption && (
            <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm text-white p-3 text-sm translate-y-full group-hover:translate-y-0 transition-transform duration-300">
              {image.caption}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default GalleryTab;
