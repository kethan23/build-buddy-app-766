import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import AgentLayout from '@/components/agent/AgentLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileText, Trash2, ArrowLeft, Download } from 'lucide-react';

const CATEGORIES = [
  { value: 'medical', label: 'Medical Report' },
  { value: 'travel', label: 'Travel Document' },
  { value: 'visa', label: 'Visa Document' },
  { value: 'prescription', label: 'Prescription' },
  { value: 'lab_result', label: 'Lab Result' },
  { value: 'other', label: 'Other' },
];

const AgentPatientDocuments = () => {
  const { patientId } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [agentId, setAgentId] = useState<string | null>(null);
  const [category, setCategory] = useState('medical');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const init = async () => {
      const { data: profile } = await supabase
        .from('agent_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();
      if (profile) {
        setAgentId(profile.id);
        const { data: p } = await supabase
          .from('agent_patients')
          .select('*')
          .eq('id', patientId)
          .eq('agent_id', profile.id)
          .single();
        setPatient(p);
        await loadDocuments(profile.id);
      }
      setLoading(false);
    };
    init();
  }, [user, patientId]);

  const loadDocuments = async (aId?: string) => {
    const { data } = await supabase
      .from('agent_patient_documents')
      .select('*')
      .eq('agent_patient_id', patientId)
      .order('created_at', { ascending: false });
    setDocuments(data || []);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !agentId || !patientId) return;

    setUploading(true);
    try {
      const filePath = `agent-docs/${agentId}/${patientId}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('medical-documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('medical-documents')
        .getPublicUrl(filePath);

      const { error: insertError } = await supabase
        .from('agent_patient_documents')
        .insert({
          agent_id: agentId,
          agent_patient_id: patientId,
          document_type: category,
          file_name: file.name,
          file_url: publicUrl,
          file_size: file.size,
          file_type: file.type,
          description,
          category,
        });

      if (insertError) throw insertError;

      toast({ title: 'Document uploaded', description: `${file.name} uploaded successfully` });
      setDescription('');
      await loadDocuments();
    } catch (err: any) {
      toast({ title: 'Upload failed', description: err.message, variant: 'destructive' });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (doc: any) => {
    const { error } = await supabase
      .from('agent_patient_documents')
      .delete()
      .eq('id', doc.id);
    if (!error) {
      toast({ title: 'Deleted', description: 'Document removed' });
      await loadDocuments();
    }
  };

  if (loading) {
    return <AgentLayout><div className="p-8 text-muted-foreground">Loading...</div></AgentLayout>;
  }

  if (!patient) {
    return (
      <AgentLayout>
        <div className="p-8 text-center">
          <p className="text-muted-foreground">Patient not found</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate('/agent/patients')}>
            Back to Patients
          </Button>
        </div>
      </AgentLayout>
    );
  }

  return (
    <AgentLayout>
      <div className="p-8 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/agent/patients')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Documents for {patient.full_name}
            </h1>
            <p className="text-sm text-muted-foreground font-mono">{patient.agent_patient_id}</p>
          </div>
        </div>

        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-primary" />
              Upload Report / Document
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Document Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Description (optional)</Label>
                <Textarea
                  placeholder="Brief description of the document..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={1}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="file-upload" className="cursor-pointer">
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {uploading ? 'Uploading...' : 'Click to select or drag & drop a file'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG up to 20MB</p>
                </div>
              </Label>
              <Input
                id="file-upload"
                type="file"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={handleUpload}
                disabled={uploading}
              />
            </div>
          </CardContent>
        </Card>

        {/* Documents List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Uploaded Documents ({documents.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {documents.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No documents uploaded yet</p>
            ) : (
              <div className="space-y-3">
                {documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-8 w-8 text-primary/60" />
                      <div>
                        <p className="font-medium text-sm text-foreground">{doc.file_name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {CATEGORIES.find(c => c.value === doc.category)?.label || doc.category}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(doc.created_at).toLocaleDateString()}
                          </span>
                          {doc.file_size && (
                            <span className="text-xs text-muted-foreground">
                              {(doc.file_size / 1024).toFixed(0)} KB
                            </span>
                          )}
                        </div>
                        {doc.description && (
                          <p className="text-xs text-muted-foreground mt-1">{doc.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" asChild>
                        <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                          <Download className="h-4 w-4" />
                        </a>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(doc)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AgentLayout>
  );
};

export default AgentPatientDocuments;
