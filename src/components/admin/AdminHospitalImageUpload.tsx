import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Upload, Link, Image, X, Loader2 } from 'lucide-react';

interface AdminHospitalImageUploadProps {
  hospitalId: string;
  currentLogoUrl?: string;
  currentCoverUrl?: string;
  onUpdate: () => void;
}

export function AdminHospitalImageUpload({ 
  hospitalId, 
  currentLogoUrl, 
  currentCoverUrl, 
  onUpdate 
}: AdminHospitalImageUploadProps) {
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [logoUrl, setLogoUrl] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [galleryUrl, setGalleryUrl] = useState('');
  const [galleryCaption, setGalleryCaption] = useState('');

  const uploadFile = async (file: File, type: 'logo' | 'cover' | 'gallery') => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${hospitalId}/${type}_${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('hospital-images')
      .upload(fileName, file, { cacheControl: '3600', upsert: false });

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from('hospital-images')
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  };

  const handleLogoUpload = async (file: File | null, url?: string) => {
    setUploadingLogo(true);
    try {
      let imageUrl = url;
      
      if (file) {
        imageUrl = await uploadFile(file, 'logo');
      }

      if (!imageUrl) {
        toast.error('Please provide an image file or URL');
        return;
      }

      const { error } = await supabase
        .from('hospitals')
        .update({ logo_url: imageUrl })
        .eq('id', hospitalId);

      if (error) throw error;

      toast.success('Logo updated successfully');
      setLogoUrl('');
      onUpdate();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update logo');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleCoverUpload = async (file: File | null, url?: string) => {
    setUploadingCover(true);
    try {
      let imageUrl = url;
      
      if (file) {
        imageUrl = await uploadFile(file, 'cover');
      }

      if (!imageUrl) {
        toast.error('Please provide an image file or URL');
        return;
      }

      const { error } = await supabase
        .from('hospitals')
        .update({ cover_image_url: imageUrl })
        .eq('id', hospitalId);

      if (error) throw error;

      toast.success('Cover image updated successfully');
      setCoverUrl('');
      onUpdate();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update cover image');
    } finally {
      setUploadingCover(false);
    }
  };

  const handleGalleryUpload = async (file: File | null, url?: string) => {
    setUploadingGallery(true);
    try {
      let imageUrl = url;
      
      if (file) {
        imageUrl = await uploadFile(file, 'gallery');
      }

      if (!imageUrl) {
        toast.error('Please provide an image file or URL');
        return;
      }

      const { error } = await supabase
        .from('hospital_gallery')
        .insert({
          hospital_id: hospitalId,
          image_url: imageUrl,
          caption: galleryCaption || null,
        });

      if (error) throw error;

      toast.success('Gallery image added successfully');
      setGalleryUrl('');
      setGalleryCaption('');
      onUpdate();
    } catch (error: any) {
      toast.error(error.message || 'Failed to add gallery image');
    } finally {
      setUploadingGallery(false);
    }
  };

  const ImageUploadSection = ({
    label,
    currentUrl,
    urlValue,
    onUrlChange,
    uploading,
    onFileUpload,
    onUrlUpload,
  }: {
    label: string;
    currentUrl?: string;
    urlValue: string;
    onUrlChange: (val: string) => void;
    uploading: boolean;
    onFileUpload: (file: File) => void;
    onUrlUpload: (url: string) => void;
  }) => (
    <div className="space-y-4">
      {currentUrl && (
        <div className="mb-4">
          <p className="text-sm text-muted-foreground mb-2">Current {label}:</p>
          <img 
            src={currentUrl} 
            alt={`Current ${label}`}
            className="max-h-32 rounded-lg object-cover"
          />
        </div>
      )}
      
      <Tabs defaultValue="file" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="file">Upload File</TabsTrigger>
          <TabsTrigger value="url">Paste URL</TabsTrigger>
        </TabsList>
        
        <TabsContent value="file" className="space-y-2">
          <Label htmlFor={`${label}-file`}>Choose an image file</Label>
          <Input
            id={`${label}-file`}
            type="file"
            accept="image/*"
            disabled={uploading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onFileUpload(file);
            }}
          />
        </TabsContent>
        
        <TabsContent value="url" className="space-y-2">
          <Label htmlFor={`${label}-url`}>Image URL (Google Photos, Dropbox, etc.)</Label>
          <div className="flex gap-2">
            <Input
              id={`${label}-url`}
              type="url"
              placeholder="https://..."
              value={urlValue}
              onChange={(e) => onUrlChange(e.target.value)}
              disabled={uploading}
            />
            <Button 
              onClick={() => onUrlUpload(urlValue)}
              disabled={uploading || !urlValue}
            >
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Image className="h-4 w-4" />
            Hospital Logo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ImageUploadSection
            label="Logo"
            currentUrl={currentLogoUrl}
            urlValue={logoUrl}
            onUrlChange={setLogoUrl}
            uploading={uploadingLogo}
            onFileUpload={(file) => handleLogoUpload(file)}
            onUrlUpload={(url) => handleLogoUpload(null, url)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Image className="h-4 w-4" />
            Cover Image
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ImageUploadSection
            label="Cover"
            currentUrl={currentCoverUrl}
            urlValue={coverUrl}
            onUrlChange={setCoverUrl}
            uploading={uploadingCover}
            onFileUpload={(file) => handleCoverUpload(file)}
            onUrlUpload={(url) => handleCoverUpload(null, url)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Image className="h-4 w-4" />
            Add Gallery Image
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="gallery-caption">Caption (optional)</Label>
            <Input
              id="gallery-caption"
              placeholder="Enter image caption..."
              value={galleryCaption}
              onChange={(e) => setGalleryCaption(e.target.value)}
            />
          </div>
          
          <Tabs defaultValue="file" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="file">Upload File</TabsTrigger>
              <TabsTrigger value="url">Paste URL</TabsTrigger>
            </TabsList>
            
            <TabsContent value="file" className="space-y-2">
              <Label htmlFor="gallery-file">Choose an image file</Label>
              <Input
                id="gallery-file"
                type="file"
                accept="image/*"
                disabled={uploadingGallery}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleGalleryUpload(file);
                }}
              />
            </TabsContent>
            
            <TabsContent value="url" className="space-y-2">
              <Label htmlFor="gallery-url">Image URL</Label>
              <div className="flex gap-2">
                <Input
                  id="gallery-url"
                  type="url"
                  placeholder="https://..."
                  value={galleryUrl}
                  onChange={(e) => setGalleryUrl(e.target.value)}
                  disabled={uploadingGallery}
                />
                <Button 
                  onClick={() => handleGalleryUpload(null, galleryUrl)}
                  disabled={uploadingGallery || !galleryUrl}
                >
                  {uploadingGallery ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add'}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
