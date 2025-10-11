import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { MessageSquare, Clock, CheckCircle, XCircle } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QuoteDialog } from '@/components/hospital/QuoteDialog';

const HospitalInquiries = () => {
  const { user } = useAuth();
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [hospital, setHospital] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      const { data: hospitalData } = await supabase
        .from('hospitals')
        .select('*')
        .eq('user_id', user.id)
        .single();

      setHospital(hospitalData);

      if (hospitalData) {
        const { data: inquiriesData } = await supabase
          .from('inquiries')
          .select(`
            *,
            profiles(full_name, email)
          `)
          .eq('hospital_id', hospitalData.id)
          .order('created_at', { ascending: false });

        setInquiries(inquiriesData || []);
      }
    };

    fetchData();
  }, [user]);

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
                  <CardDescription>{inquiry.treatment_type}</CardDescription>
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
              <div className="flex gap-2">
                <QuoteDialog inquiry={inquiry} hospitalId={inquiry.hospital_id} />
                <Button variant="outline" size="sm">
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold">Patient Inquiries</h1>
            <p className="text-muted-foreground">
              Manage and respond to patient inquiries
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
                <div className="text-2xl font-bold">
                  {filterInquiries('pending').length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Responded</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {filterInquiries('responded').length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Accepted</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {filterInquiries('accepted').length}
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="all" className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="responded">Responded</TabsTrigger>
              <TabsTrigger value="accepted">Accepted</TabsTrigger>
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
