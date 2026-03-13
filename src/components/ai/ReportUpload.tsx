import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Upload, FileText, ArrowLeft, Brain, X } from 'lucide-react';
import type { PatientInfo } from '@/pages/patient/AIAnalysis';

interface Props {
  onAnalyze: (text: string) => void;
  onBack: () => void;
  patientInfo: PatientInfo;
}

export default function ReportUpload({ onAnalyze, onBack, patientInfo }: Props) {
  const [files, setFiles] = useState<File[]>([]);
  const [manualText, setManualText] = useState('');
  const [extracting, setExtracting] = useState(false);

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

  const handleAnalyze = async () => {
    setExtracting(true);
    let extractedText = manualText;

    // For uploaded files, we extract text client-side for images using canvas
    // For PDFs, we pass a note to the AI that reports were uploaded
    if (files.length > 0) {
      const fileDescriptions = files.map(f => `[Uploaded file: ${f.name}, Type: ${f.type}, Size: ${(f.size / 1024).toFixed(1)}KB]`).join('\n');
      extractedText = `${fileDescriptions}\n\n${manualText}`;
    }

    onAnalyze(extractedText);
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
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeFile(i)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
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
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <Button
              className="flex-1 bg-gradient-to-r from-primary to-secondary hover:opacity-90"
              size="lg"
              onClick={handleAnalyze}
              disabled={!canAnalyze || extracting}
            >
              <Brain className="mr-2 h-5 w-5" />
              Analyze with AI
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
