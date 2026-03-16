import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Upload, FileText, ArrowLeft, Brain, X, ScanText, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { PatientInfo } from '@/pages/patient/AIAnalysis';

interface Props {
  onAnalyze: (text: string) => void;
  onBack: () => void;
  patientInfo: PatientInfo;
}

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]); // strip data:...;base64,
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export default function ReportUpload({ onAnalyze, onBack, patientInfo }: Props) {
  const { toast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [manualText, setManualText] = useState('');
  const [extracting, setExtracting] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrStatus, setOcrStatus] = useState('');

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      f => f.type === 'application/pdf' || f.type.startsWith('image/')
    );
    setFiles(prev => [...prev, ...droppedFiles].slice(0, 5));
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files).filter(
        f => f.type === 'application/pdf' || f.type.startsWith('image/')
      );
      setFiles(prev => [...prev, ...selected].slice(0, 5));
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const extractTextFromImages = async (imageFiles: File[]): Promise<string> => {
    if (imageFiles.length === 0) return '';

    setOcrStatus(`Extracting text from ${imageFiles.length} image(s)...`);
    setOcrProgress(10);

    const images = await Promise.all(
      imageFiles.map(async (file) => ({
        base64: await fileToBase64(file),
        mimeType: file.type,
        fileName: file.name,
      }))
    );

    setOcrProgress(40);
    setOcrStatus('Running AI-powered OCR...');

    const { data, error } = await supabase.functions.invoke('extract-text', {
      body: { images },
    });

    setOcrProgress(90);

    if (error) throw new Error(`OCR failed: ${error.message}`);
    if (data?.error) throw new Error(data.error);

    setOcrProgress(100);
    setOcrStatus('Text extraction complete!');
    return data.extractedText || '';
  };

  const handleAnalyze = async () => {
    setExtracting(true);
    setOcrProgress(0);

    try {
      let extractedText = '';

      // Separate image files from PDFs
      const imageFiles = files.filter(f => f.type.startsWith('image/'));
      const pdfFiles = files.filter(f => f.type === 'application/pdf');

      // Extract text from images via OCR
      if (imageFiles.length > 0) {
        extractedText = await extractTextFromImages(imageFiles);
      }

      // For PDFs, add a note (no client-side OCR for PDFs)
      if (pdfFiles.length > 0) {
        const pdfNotes = pdfFiles
          .map(f => `[Uploaded PDF: ${f.name}, Size: ${(f.size / 1024).toFixed(1)}KB — PDF text extraction not available, analyze based on other info]`)
          .join('\n');
        extractedText = extractedText ? `${extractedText}\n\n${pdfNotes}` : pdfNotes;
      }

      // Append manual text
      if (manualText.trim()) {
        extractedText = extractedText
          ? `${extractedText}\n\n--- Additional Notes ---\n${manualText}`
          : manualText;
      }

      onAnalyze(extractedText);
    } catch (err: any) {
      console.error('OCR/Analysis error:', err);
      toast({
        title: 'Text Extraction Failed',
        description: err.message || 'Failed to extract text from reports.',
        variant: 'destructive',
      });
    } finally {
      setExtracting(false);
      setOcrProgress(0);
      setOcrStatus('');
    }
  };

  const canAnalyze = files.length > 0 || manualText.trim().length > 0;

  return (
    <div className="space-y-6">
      {/* Patient summary */}
      <Card className="elegant-card bg-primary/5 border-primary/20">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 text-sm">
            <span><strong>Patient:</strong> {patientInfo.name}</span>
            <span><strong>Age:</strong> {patientInfo.age}</span>
            <span><strong>Condition:</strong> {patientInfo.condition}</span>
            {patientInfo.preferredCity && <span><strong>City:</strong> {patientInfo.preferredCity}</span>}
          </div>
        </CardContent>
      </Card>

      <Card className="elegant-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Upload className="h-5 w-5 text-primary" />
            </div>
            Upload Medical Reports
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Drop zone */}
          <div
            onDrop={handleDrop}
            onDragOver={e => e.preventDefault()}
            className="border-2 border-dashed border-primary/30 rounded-xl p-8 text-center hover:border-primary/60 transition-colors cursor-pointer"
            onClick={() => document.getElementById('file-input')?.click()}
          >
            <Upload className="h-10 w-10 text-primary/60 mx-auto mb-3" />
            <p className="font-medium">Drop your medical reports here</p>
            <p className="text-sm text-muted-foreground mt-1">PDF, JPG, PNG — up to 5 files</p>
            <div className="flex items-center justify-center gap-1 mt-2 text-xs text-accent">
              <ScanText className="h-3 w-3" />
              <span>AI-powered OCR extracts text from images automatically</span>
            </div>
            <input
              id="file-input"
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* File list */}
          {files.length > 0 && (
            <div className="space-y-2">
              {files.map((file, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">{file.name}</span>
                    <span className="text-xs text-muted-foreground">({(file.size / 1024).toFixed(1)} KB)</span>
                    {file.type.startsWith('image/') && (
                      <span className="text-xs bg-accent/15 text-accent px-2 py-0.5 rounded-full">OCR</span>
                    )}
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeFile(i)} disabled={extracting}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* OCR Progress */}
          {extracting && ocrStatus && (
            <div className="space-y-2 p-4 bg-primary/5 rounded-lg border border-primary/20">
              <div className="flex items-center gap-2 text-sm font-medium text-primary">
                <Loader2 className="h-4 w-4 animate-spin" />
                {ocrStatus}
              </div>
              <Progress value={ocrProgress} className="h-2" />
            </div>
          )}

          {/* Manual text input */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Or paste your report content / additional notes:</p>
            <Textarea
              value={manualText}
              onChange={e => setManualText(e.target.value)}
              placeholder="Paste medical report text, lab results, doctor's notes, or any additional information here..."
              rows={5}
            />
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={onBack} disabled={extracting}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <Button
              className="flex-1 bg-gradient-to-r from-primary to-secondary hover:opacity-90"
              size="lg"
              onClick={handleAnalyze}
              disabled={!canAnalyze || extracting}
            >
              {extracting ? (
                <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Extracting & Analyzing...</>
              ) : (
                <><Brain className="mr-2 h-5 w-5" /> Analyze with AI</>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
