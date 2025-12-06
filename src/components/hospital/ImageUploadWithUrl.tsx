import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Upload, Loader2, Image as ImageIcon, X, Link } from 'lucide-react';

interface ImageUploadWithUrlProps {
  hospitalId: string;
  type: 'logo' | 'cover';
  currentImageUrl?: string | null;
  onUploadComplete: (url: string) => void;
}

export function ImageUploadWithUrl({ 
  hospitalId, 
  type, 
  currentImageUrl, 
  onUploadComplete,
}: ImageUploadWithUrlProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploadMethod, setUploadMethod] = useState<'file' | 'url'>('file');
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

    setPreviewUrl(URL.createObjectURL(file));
    setIsDialogOpen(true);
  };

  const handleUrlPreview = () => {
    if (!urlInput.trim()) {
      toast.error('Please enter an image URL');
      return;
    }
    
    // Validate URL format
    try {
      new URL(urlInput);
      setPreviewUrl(urlInput);
      setIsDialogOpen(true);
    } catch {
      toast.error('Please enter a valid URL');
    }
  };

  const handleUpload = async () => {
    setUploading(true);
    try {
      let finalUrl = '';
      
      if (uploadMethod === 'url') {
        // For URL method, we can either store the URL directly or download and re-upload
        // Storing directly is simpler and works for most cloud image services
        finalUrl = urlInput.trim();
      } else {
        // For file upload, upload to Supabase storage
        const file = fileInputRef.current?.files?.[0];
        if (!file) {
          toast.error('No file selected');
          setUploading(false);
          return;
        }

        const fileName = `${hospitalId}/${type}_${Date.now()}.${file.name.split('.').pop()}`;

        const { error: uploadError } = await supabase.storage
          .from('hospital-images')
          .upload(fileName, file, {
            contentType: file.type,
            upsert: true
          });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('hospital-images')
          .getPublicUrl(fileName);

        finalUrl = publicUrl;
      }

      // Update hospital record
      const updateField = type === 'logo' ? 'logo_url' : 'cover_image_url';
      const { error: updateError } = await supabase
        .from('hospitals')
        .update({ [updateField]: finalUrl })
        .eq('id', hospitalId);

      if (updateError) throw updateError;

      toast.success(`${type === 'logo' ? 'Logo' : 'Cover image'} updated successfully`);
      onUploadComplete(finalUrl);
      handleClose();
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setIsDialogOpen(false);
    setPreviewUrl('');
    setUrlInput('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemove = async () => {
    if (!currentImageUrl) return;

    try {
      // Only try to delete from storage if it's a Supabase URL
      if (currentImageUrl.includes('hospital-images')) {
        const urlParts = currentImageUrl.split('/hospital-images/');
        if (urlParts.length > 1) {
          await supabase.storage.from('hospital-images').remove([urlParts[1]]);
        }
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

      {/* Upload Options */}
      <div className="flex gap-2">
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
          onClick={() => {
            setUploadMethod('file');
            fileInputRef.current?.click();
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
          Use URL
        </Button>
      </div>
      
      <p className="text-xs text-muted-foreground">
        {type === 'logo' 
          ? 'Recommended: Square image, at least 200x200px' 
          : 'Recommended: 16:9 aspect ratio, at least 1200x675px'}
      </p>

      {/* Upload/URL Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {uploadMethod === 'file' ? 'Upload' : 'Add'} {type === 'logo' ? 'Logo' : 'Cover Image'}
            </DialogTitle>
          </DialogHeader>
          
          <Tabs value={uploadMethod} onValueChange={(v) => setUploadMethod(v as 'file' | 'url')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="file">Upload File</TabsTrigger>
              <TabsTrigger value="url">Image URL</TabsTrigger>
            </TabsList>
            
            <TabsContent value="file" className="space-y-4">
              {previewUrl && uploadMethod === 'file' && (
                <div className="flex items-center justify-center">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="max-h-[300px] max-w-full rounded-lg object-contain"
                  />
                </div>
              )}
              {!previewUrl && (
                <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center">
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Select Image
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="url" className="space-y-4">
              <div className="space-y-2">
                <Label>Image URL</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="https://example.com/image.jpg"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                  />
                  <Button variant="outline" onClick={handleUrlPreview}>
                    Preview
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Paste a direct link to your image from Google Drive, Dropbox, or any cloud service
                </p>
              </div>
              {previewUrl && uploadMethod === 'url' && (
                <div className="flex items-center justify-center">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="max-h-[300px] max-w-full rounded-lg object-contain"
                    onError={() => {
                      toast.error('Failed to load image. Please check the URL.');
                      setPreviewUrl('');
                    }}
                  />
                </div>
              )}
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpload} 
              disabled={uploading || (!previewUrl && uploadMethod === 'file') || (!urlInput && uploadMethod === 'url')}
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Image'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
