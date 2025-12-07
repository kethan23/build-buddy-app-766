import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { MessageSquare, Clock, CheckCircle, XCircle, Mail, Eye, Loader2 } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QuoteDialog } from '@/components/hospital/QuoteDialog';
import { toast } from 'sonner';

const HospitalInquiries = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [hospital, setHospital] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Use maybeSingle to handle case where hospital doesn't exist
        const { data: hospitalData, error: hospitalError } = await supabase
          .from('hospitals')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (hospitalError) {
          console.error('Error fetching hospital:', hospitalError);
          toast.error('Failed to load hospital data');
          setLoading(false);
          return;
        }

        if (!hospitalData) {
          console.log('No hospital found for user:', user.id);
          setLoading(false);
          return;
        }

        setHospital(hospitalData);
        console.log('Hospital found:', hospitalData.id, hospitalData.name);

        // Fetch inquiries for this hospital
        const { data: inquiriesData, error: inquiriesError } = await supabase
          .from('inquiries')
          .select('*')
          .eq('hospital_id', hospitalData.id)
          .order('created_at', { ascending: false });

        console.log('Inquiries query result:', { inquiriesData, inquiriesError });

        if (inquiriesError) {
          console.error('Error fetching inquiries:', inquiriesError);
          toast.error('Failed to load inquiries');
          setLoading(false);
          return;
        }

        if (!inquiriesData || inquiriesData.length === 0) {
          console.log('No inquiries found for hospital:', hospitalData.id);
          setInquiries([]);
          setLoading(false);
          return;
        }

        // Fetch patient profiles separately
        const userIds = [...new Set(inquiriesData.map(i => i.user_id))];
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('user_id, full_name, email, phone')
          .in('user_id', userIds);

        console.log('Profiles query result:', { profilesData, profilesError });

        const profilesMap = new Map(profilesData?.map(p => [p.user_id, p]) || []);
        
        const inquiriesWithProfiles = inquiriesData.map(inquiry => ({
          ...inquiry,
          profiles: profilesMap.get(inquiry.user_id) || null
        }));
        
        setInquiries(inquiriesWithProfiles);
      } catch (error) {
        console.error('Unexpected error:', error);
        toast.error('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleStartConversation = async (inquiry: any) => {
    if (!hospital) return;

    try {
      // Check if conversation already exists
      const { data: existingConversation } = await supabase
        .from('conversations')
        .select('id')
        .eq('patient_id', inquiry.user_id)
        .eq('hospital_id', hospital.id)
        .eq('inquiry_id', inquiry.id)
        .maybeSingle();

      if (existingConversation) {
        navigate(`/patient/chat?conversation=${existingConversation.id}`);
        return;
      }

      // Create new conversation
      const { data: newConversation, error } = await supabase
        .from('conversations')
        .insert({
          patient_id: inquiry.user_id,
          hospital_id: hospital.id,
          inquiry_id: inquiry.id,
          status: 'active'
        })
        .select('id')
        .single();

      if (error) {
        console.error('Error creating conversation:', error);
        toast.error('Failed to start conversation');
        return;
      }

      navigate(`/patient/chat?conversation=${newConversation.id}`);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to start conversation');
    }
  };

  const handleUpdateStatus = async (inquiryId: string, newStatus: 'pending' | 'responded' | 'accepted' | 'rejected') => {
    const { error } = await supabase
      .from('inquiries')
      .update({ status: newStatus })
      .eq('id', inquiryId);

    if (error) {
      toast.error('Failed to update status');
      return;
    }

    setInquiries(prev => 
      prev.map(inq => inq.id === inquiryId ? { ...inq, status: newStatus } : inq)
    );
    toast.success(`Inquiry marked as ${newStatus}`);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'responded':
        return <MessageSquare className="h-4 w-4" />;
      case 'accepted':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'responded':
        return 'bg-blue-100 text-blue-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filterInquiries = (status?: string) => {
    if (!status) return inquiries;
    return inquiries.filter(inq => inq.status === status);
  };

  const InquiryList = ({ status }: { status?: string }) => {
    const filtered = filterInquiries(status);

    if (filtered.length === 0) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          No {status || ''} inquiries found
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {filtered.map((inquiry) => (
          <Card key={inquiry.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <CardTitle className="text-lg">
                    {inquiry.profiles?.full_name || 'Unknown Patient'}
                  </CardTitle>
                  <CardDescription className="space-y-1">
                    <span className="block">{inquiry.treatment_type}</span>
                    {inquiry.profiles?.email && (
                      <span className="flex items-center gap-1 text-xs">
                        <Mail className="h-3 w-3" />
                        {inquiry.profiles.email}
                      </span>
                    )}
                  </CardDescription>
                </div>
                <Badge className={getStatusColor(inquiry.status)}>
                  <span className="flex items-center gap-1">
                    {getStatusIcon(inquiry.status)}
                    {inquiry.status}
                  </span>
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-1">Message:</p>
                <p className="text-sm text-muted-foreground">{inquiry.message}</p>
              </div>
              {inquiry.preferred_date && (
                <div>
                  <p className="text-sm font-medium mb-1">Preferred Date:</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(inquiry.preferred_date).toLocaleDateString()}
                  </p>
                </div>
              )}
              <div className="text-xs text-muted-foreground">
                Received: {new Date(inquiry.created_at).toLocaleString()}
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 pt-2 border-t">
                <Button 
                  variant="default" 
                  size="sm"
                  onClick={() => handleStartConversation(inquiry)}
                >
                  <MessageSquare className="h-4 w-4 mr-1" />
                  Chat
                </Button>
                
                <QuoteDialog inquiry={inquiry} hospitalId={inquiry.hospital_id} />
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate(`/patient/inquiries/${inquiry.id}`)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View Details
                </Button>

                {inquiry.status === 'pending' && (
                  <>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-green-600 hover:text-green-700"
                      onClick={() => handleUpdateStatus(inquiry.id, 'accepted')}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Accept
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleUpdateStatus(inquiry.id, 'rejected')}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!hospital) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>No Hospital Found</CardTitle>
              <CardDescription>
                You don't have a hospital profile associated with your account.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate('/hospital/profile')}>
                Create Hospital Profile
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold">Patient Inquiries</h1>
            <p className="text-muted-foreground">
              Manage and respond to patient inquiries for {hospital.name}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Total</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{inquiries.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {filterInquiries('pending').length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Responded</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {filterInquiries('responded').length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Accepted</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {filterInquiries('accepted').length}
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="all" className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">All ({inquiries.length})</TabsTrigger>
              <TabsTrigger value="pending">Pending ({filterInquiries('pending').length})</TabsTrigger>
              <TabsTrigger value="responded">Responded ({filterInquiries('responded').length})</TabsTrigger>
              <TabsTrigger value="accepted">Accepted ({filterInquiries('accepted').length})</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <InquiryList />
            </TabsContent>
            <TabsContent value="pending">
              <InquiryList status="pending" />
            </TabsContent>
            <TabsContent value="responded">
              <InquiryList status="responded" />
            </TabsContent>
            <TabsContent value="accepted">
              <InquiryList status="accepted" />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default HospitalInquiries;