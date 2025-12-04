import { useState, useRef, useCallback } from 'react';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Upload, Loader2, Image as ImageIcon, X } from 'lucide-react';

interface ImageCropUploadProps {
  hospitalId: string;
  type: 'logo' | 'cover';
  currentImageUrl?: string | null;
  onUploadComplete: (url: string) => void;
  aspectRatio?: number;
}

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number,
) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  );
}

export function ImageCropUpload({ 
  hospitalId, 
  type, 
  currentImageUrl, 
  onUploadComplete,
  aspectRatio = type === 'logo' ? 1 : 16/9
}: ImageCropUploadProps) {
  const [imgSrc, setImgSrc] = useState('');
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size should be less than 10MB');
      return;
    }

    const reader = new FileReader();
    reader.addEventListener('load', () => {
      setImgSrc(reader.result?.toString() || '');
      setIsDialogOpen(true);
    });
    reader.readAsDataURL(file);
  };

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, aspectRatio));
  }, [aspectRatio]);

  const getCroppedImg = async (
    image: HTMLImageElement,
    pixelCrop: PixelCrop,
  ): Promise<Blob> => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('No 2d context');

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    canvas.width = pixelCrop.width * scaleX;
    canvas.height = pixelCrop.height * scaleY;

    ctx.drawImage(
      image,
      pixelCrop.x * scaleX,
      pixelCrop.y * scaleY,
      pixelCrop.width * scaleX,
      pixelCrop.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height,
    );

    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Canvas is empty'));
        },
        'image/jpeg',
        0.9
      );
    });
  };

  const handleUpload = async () => {
    if (!imgRef.current || !completedCrop) {
      toast.error('Please crop the image first');
      return;
    }

    setUploading(true);
    try {
      const croppedBlob = await getCroppedImg(imgRef.current, completedCrop);
      const fileName = `${hospitalId}/${type}_${Date.now()}.jpg`;

      const { error: uploadError } = await supabase.storage
        .from('hospital-images')
        .upload(fileName, croppedBlob, {
          contentType: 'image/jpeg',
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('hospital-images')
        .getPublicUrl(fileName);

      // Update hospital record
      const updateField = type === 'logo' ? 'logo_url' : 'cover_image_url';
      const { error: updateError } = await supabase
        .from('hospitals')
        .update({ [updateField]: publicUrl })
        .eq('id', hospitalId);

      if (updateError) throw updateError;

      toast.success(`${type === 'logo' ? 'Logo' : 'Cover image'} uploaded successfully`);
      onUploadComplete(publicUrl);
      setIsDialogOpen(false);
      setImgSrc('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    if (!currentImageUrl) return;

    try {
      // Extract file path from URL
      const urlParts = currentImageUrl.split('/hospital-images/');
      if (urlParts.length > 1) {
        await supabase.storage.from('hospital-images').remove([urlParts[1]]);
      }

      const updateField = type === 'logo' ? 'logo_url' : 'cover_image_url';
      const { error } = await supabase
        .from('hospitals')
        .update({ [updateField]: null })
        .eq('id', hospitalId);

      if (error) throw error;

      toast.success(`${type === 'logo' ? 'Logo' : 'Cover image'} removed`);
      onUploadComplete('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove image');
    }
  };

  return (
    <div className="space-y-4">
      <Label>{type === 'logo' ? 'Hospital Logo' : 'Cover Image'}</Label>
      
      {/* Preview */}
      <div className={`relative border-2 border-dashed border-muted rounded-lg overflow-hidden ${
        type === 'logo' ? 'w-32 h-32' : 'w-full h-48'
      }`}>
        {currentImageUrl ? (
          <>
            <img 
              src={currentImageUrl} 
              alt={type} 
              className="w-full h-full object-cover"
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8"
              onClick={handleRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
            <ImageIcon className="h-8 w-8 mb-2" />
            <span className="text-sm">No {type} uploaded</span>
          </div>
        )}
      </div>

      {/* Upload Button */}
      <div>
        <Input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={onSelectFile}
          className="hidden"
          id={`${type}-upload`}
        />
        <Button
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-4 w-4 mr-2" />
          {currentImageUrl ? 'Change' : 'Upload'} {type === 'logo' ? 'Logo' : 'Cover'}
        </Button>
      </div>
      
      <p className="text-xs text-muted-foreground">
        {type === 'logo' 
          ? 'Recommended: Square image, at least 200x200px' 
          : 'Recommended: 16:9 aspect ratio, at least 1200x675px'}
      </p>

      {/* Crop Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Crop {type === 'logo' ? 'Logo' : 'Cover Image'}</DialogTitle>
          </DialogHeader>
          
          <div className="flex items-center justify-center max-h-[60vh] overflow-auto">
            {imgSrc && (
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={aspectRatio}
                className="max-w-full"
              >
                <img
                  ref={imgRef}
                  alt="Crop preview"
                  src={imgSrc}
                  onLoad={onImageLoad}
                  style={{ maxHeight: '50vh' }}
                />
              </ReactCrop>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={uploading}>
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}