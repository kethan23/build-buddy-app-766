import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Upload, Trash2, Loader2, Link, Plus } from 'lucide-react';

interface GalleryImage {
  id: string;
  image_url: string;
  caption: string | null;
  display_order: number | null;
}

interface GalleryManagerWithUrlProps {
  hospitalId: string;
}

export function GalleryManagerWithUrl({ hospitalId }: GalleryManagerWithUrlProps) {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [caption, setCaption] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [uploadMethod, setUploadMethod] = useState<'file' | 'url'>('file');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchImages();
  }, [hospitalId]);

  const fetchImages = async () => {
    const { data, error } = await supabase
      .from('hospital_gallery')
      .select('*')
      .eq('hospital_id', hospitalId)
      .order('display_order', { ascending: true });

    if (error) {
      toast.error('Failed to load gallery images');
    } else {
      setImages(data || []);
    }
    setLoading(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    setUploading(true);
    try {
      let imageUrl = '';

      if (uploadMethod === 'url') {
        if (!urlInput.trim()) {
          toast.error('Please enter an image URL');
          setUploading(false);
          return;
        }
        // Validate URL
        try {
          new URL(urlInput);
          imageUrl = urlInput.trim();
        } catch {
          toast.error('Please enter a valid URL');
          setUploading(false);
          return;
        }
      } else {
        if (!selectedFile) {
          toast.error('Please select a file');
          setUploading(false);
          return;
        }

        const fileName = `${hospitalId}/gallery_${Date.now()}.${selectedFile.name.split('.').pop()}`;
        
        const { error: uploadError } = await supabase.storage
          .from('hospital-images')
          .upload(fileName, selectedFile, {
            contentType: selectedFile.type,
          });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('hospital-images')
          .getPublicUrl(fileName);

        imageUrl = publicUrl;
      }

      // Insert into gallery table
      const { error: insertError } = await supabase
        .from('hospital_gallery')
        .insert({
          hospital_id: hospitalId,
          image_url: imageUrl,
          caption: caption || null,
          display_order: images.length + 1,
        });

      if (insertError) throw insertError;

      toast.success('Image added to gallery');
      handleClose();
      fetchImages();
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setIsDialogOpen(false);
    setCaption('');
    setUrlInput('');
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDelete = async (image: GalleryImage) => {
    if (!confirm('Are you sure you want to delete this image?')) return;

    try {
      // Try to delete from storage if it's a Supabase URL
      if (image.image_url.includes('hospital-images')) {
        const urlParts = image.image_url.split('/hospital-images/');
        if (urlParts.length > 1) {
          await supabase.storage.from('hospital-images').remove([urlParts[1]]);
        }
      }

      const { error } = await supabase
        .from('hospital_gallery')
        .delete()
        .eq('id', image.id);

      if (error) throw error;

      toast.success('Image deleted');
      setImages(images.filter(img => img.id !== image.id));
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete image');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <Button
          variant="outline"
          onClick={() => {
            setUploadMethod('file');
            setIsDialogOpen(true);
          }}
        >
          <Upload className="h-4 w-4 mr-2" />
          Upload File
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            setUploadMethod('url');
            setIsDialogOpen(true);
          }}
        >
          <Link className="h-4 w-4 mr-2" />
          Add from URL
        </Button>
      </div>

      {images.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
          <p>No images uploaded yet</p>
          <p className="text-sm">Add images to showcase your hospital</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image) => (
            <div key={image.id} className="relative group aspect-square rounded-lg overflow-hidden border">
              <img
                src={image.image_url}
                alt={image.caption || 'Gallery image'}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => handleDelete(image)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              {image.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2">
                  <p className="text-white text-sm truncate">{image.caption}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Image to Gallery</DialogTitle>
          </DialogHeader>
          
          <Tabs value={uploadMethod} onValueChange={(v) => setUploadMethod(v as 'file' | 'url')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="file">Upload File</TabsTrigger>
              <TabsTrigger value="url">Image URL</TabsTrigger>
            </TabsList>
            
            <TabsContent value="file" className="space-y-4">
              <div className="space-y-2">
                <Label>Select Image</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                {selectedFile && (
                  <p className="text-sm text-muted-foreground">
                    Selected: {selectedFile.name}
                  </p>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="url" className="space-y-4">
              <div className="space-y-2">
                <Label>Image URL</Label>
                <Input
                  placeholder="https://example.com/image.jpg"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Paste a direct link to your image from Google Drive, Dropbox, or any cloud service
                </p>
              </div>
              {urlInput && (
                <div className="flex items-center justify-center">
                  <img
                    src={urlInput}
                    alt="Preview"
                    className="max-h-[200px] max-w-full rounded-lg object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
            </TabsContent>
          </Tabs>

          <div className="space-y-2">
            <Label>Caption (optional)</Label>
            <Input
              placeholder="Enter a caption for this image"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpload} 
              disabled={uploading || (uploadMethod === 'file' && !selectedFile) || (uploadMethod === 'url' && !urlInput)}
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Image
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
