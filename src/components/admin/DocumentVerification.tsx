import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { CheckCircle, XCircle, FileText, User } from 'lucide-react';

interface Document {
  id: string;
  file_name: string;
  category: string;
  verification_status: string;
  created_at: string;
  user_id: string;
  profiles?: {
    full_name: string;
    email: string;
  };
}

export function DocumentVerification() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      // Fetch profile data separately
      const docsWithProfiles = await Promise.all(
        data.map(async (doc) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('user_id', doc.user_id)
            .single();
          
          return { ...doc, profiles: profile };
        })
      );
      setDocuments(docsWithProfiles as any);
    }
  };

  const verifyDocument = async (docId: string, status: 'verified' | 'rejected') => {
    if (!user) return;
    setLoading(true);

    try {
      const { error } = await supabase
        .from('documents')
        .update({
          verification_status: status,
          verified_by: user.id,
          verified_at: new Date().toISOString(),
        })
        .eq('id', docId);

      if (error) throw error;

      toast.success(`Document ${status}`);
      loadDocuments();
    } catch (error: any) {
      toast.error(error.message || 'Failed to verify document');
    } finally {
      setLoading(false);
    }
  };

  const pendingDocs = documents.filter(d => d.verification_status === 'pending');

  return (
    <Card className="premium-card">
      <CardHeader>
        <CardTitle>Document Verification</CardTitle>
        <p className="text-sm text-muted-foreground">
          {pendingDocs.length} documents pending verification
        </p>
      </CardHeader>
      <CardContent>
        {documents.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No documents to verify</p>
        ) : (
          <div className="space-y-4">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-4 border rounded-lg hover-lift"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <FileText className="h-4 w-4 text-primary" />
                    <p className="font-medium">{doc.file_name}</p>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <User className="h-3 w-3" />
                    <span>{doc.profiles?.full_name || 'Unknown'}</span>
                    <span>•</span>
                    <span>{doc.profiles?.email}</span>
                  </div>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      {doc.category.replace('_', ' ').toUpperCase()}
                    </Badge>
                    <Badge
                      variant={
                        doc.verification_status === 'verified'
                          ? 'default'
                          : doc.verification_status === 'rejected'
                          ? 'destructive'
                          : 'secondary'
                      }
                    >
                      {doc.verification_status.toUpperCase()}
                    </Badge>
                  </div>
                </div>
                {doc.verification_status === 'pending' && (
                  <div className="flex space-x-2">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => verifyDocument(doc.id, 'verified')}
                      disabled={loading}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Verify
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => verifyDocument(doc.id, 'rejected')}
                      disabled={loading}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
