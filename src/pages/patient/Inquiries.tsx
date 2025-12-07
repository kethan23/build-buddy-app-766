import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Plus, MessageSquare, FileText, DollarSign, Building2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const inquirySchema = z.object({
  hospital_id: z.string().min(1, 'Please select a hospital'),
  treatment_type: z.string().min(3, 'Treatment type must be at least 3 characters'),
  preferred_date: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

const Inquiries = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [viewQuotesDialog, setViewQuotesDialog] = useState<{ open: boolean; inquiry: any; quotes: any[] }>({
    open: false,
    inquiry: null,
    quotes: []
  });

  const form = useForm<z.infer<typeof inquirySchema>>({
    resolver: zodResolver(inquirySchema),
    defaultValues: {
      hospital_id: '',
      treatment_type: '',
      preferred_date: '',
      message: '',
    },
  });

  useEffect(() => {
    if (user) {
      loadInquiries();
      loadHospitals();
    }
  }, [user]);

  const loadHospitals = async () => {
    const { data } = await supabase
      .from('hospitals')
      .select('id, name, city, country')
      .eq('verification_status', 'verified')
      .eq('is_active', true)
      .order('name');
    
    setHospitals(data || []);
  };

  const loadInquiries = async () => {
    const { data, error } = await supabase
      .from('inquiries')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: 'Error loading inquiries',
        description: error.message,
        variant: 'destructive',
      });
      return;
    }

    // Fetch hospital names for each inquiry
    if (data && data.length > 0) {
      const hospitalIds = [...new Set(data.filter(i => i.hospital_id).map(i => i.hospital_id))];
      
      if (hospitalIds.length > 0) {
        const { data: hospitalsData } = await supabase
          .from('hospitals')
          .select('id, name')
          .in('id', hospitalIds);

        const hospitalsMap = new Map(hospitalsData?.map(h => [h.id, h]) || []);
        
        const inquiriesWithHospitals = data.map(inquiry => ({
          ...inquiry,
          hospital: hospitalsMap.get(inquiry.hospital_id) || null
        }));
        
        setInquiries(inquiriesWithHospitals);
      } else {
        setInquiries(data);
      }
    } else {
      setInquiries([]);
    }
  };

  const onSubmit = async (values: z.infer<typeof inquirySchema>) => {
    const { error } = await supabase.from('inquiries').insert([
      {
        user_id: user?.id,
        hospital_id: values.hospital_id,
        treatment_type: values.treatment_type,
        preferred_date: values.preferred_date || null,
        message: values.message,
        status: 'pending',
      },
    ]);

    if (error) {
      toast({
        title: 'Error creating inquiry',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Inquiry created',
        description: 'Your inquiry has been sent successfully',
      });
      form.reset();
      setIsOpen(false);
      loadInquiries();
    }
  };

  const handleViewConversation = async (inquiry: any) => {
    // Find or check for existing conversation
    const { data: conversation } = await supabase
      .from('conversations')
      .select('id')
      .eq('inquiry_id', inquiry.id)
      .maybeSingle();

    if (conversation) {
      navigate(`/patient/chat?conversation=${conversation.id}`);
    } else {
      toast({
        title: 'No conversation yet',
        description: 'The hospital has not responded to your inquiry yet.',
      });
    }
  };

  const handleViewQuotes = async (inquiry: any) => {
    // Fetch conversation and quote messages
    const { data: conversation } = await supabase
      .from('conversations')
      .select('id')
      .eq('inquiry_id', inquiry.id)
      .maybeSingle();

    if (!conversation) {
      toast({
        title: 'No quotes yet',
        description: 'No quotes have been received for this inquiry.',
      });
      return;
    }

    // Fetch quote messages
    const { data: messages } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversation.id)
      .eq('message_type', 'quote')
      .order('created_at', { ascending: false });

    if (!messages || messages.length === 0) {
      toast({
        title: 'No quotes yet',
        description: 'No quotes have been received for this inquiry.',
      });
      return;
    }

    setViewQuotesDialog({
      open: true,
      inquiry,
      quotes: messages
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      responded: 'bg-blue-100 text-blue-800',
      accepted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-muted';
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-heading font-bold mb-2">My Inquiries</h1>
            <p className="text-muted-foreground">Track your hospital inquiries and responses</p>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Inquiry
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create New Inquiry</DialogTitle>
                <DialogDescription>
                  Send an inquiry to a hospital about your treatment needs
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="hospital_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Select Hospital</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Choose a hospital" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {hospitals.map((hospital) => (
                              <SelectItem key={hospital.id} value={hospital.id}>
                                {hospital.name} - {hospital.city}, {hospital.country}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="treatment_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Treatment Type</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Cardiac Surgery, Dental Implants" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="preferred_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preferred Date (Optional)</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe your medical needs and any specific requirements..."
                            rows={4}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full">
                    Submit Inquiry
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {inquiries.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <FileText className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No inquiries yet</h3>
              <p className="text-muted-foreground text-center mb-6">
                Start your medical journey by sending an inquiry to hospitals
              </p>
              <Button onClick={() => setIsOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Inquiry
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {inquiries.map((inquiry) => (
              <Card key={inquiry.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        {inquiry.treatment_type}
                      </CardTitle>
                      <CardDescription className="space-y-1 mt-1">
                        {inquiry.hospital && (
                          <span className="flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            {inquiry.hospital.name}
                          </span>
                        )}
                        <span className="block">
                          Created on {new Date(inquiry.created_at).toLocaleDateString()}
                          {inquiry.preferred_date && ` • Preferred: ${new Date(inquiry.preferred_date).toLocaleDateString()}`}
                        </span>
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(inquiry.status)}>
                      {inquiry.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{inquiry.message}</p>
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewConversation(inquiry)}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      View Conversation
                    </Button>
                    {(inquiry.status === 'responded' || inquiry.status === 'accepted') && (
                      <Button 
                        size="sm"
                        onClick={() => handleViewQuotes(inquiry)}
                      >
                        <DollarSign className="h-4 w-4 mr-2" />
                        View Quotes
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* View Quotes Dialog */}
      <Dialog open={viewQuotesDialog.open} onOpenChange={(open) => setViewQuotesDialog(prev => ({ ...prev, open }))}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Quotes for {viewQuotesDialog.inquiry?.treatment_type}</DialogTitle>
            <DialogDescription>
              Review the quotes received from the hospital
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {viewQuotesDialog.quotes.map((quote) => (
              <Card key={quote.id}>
                <CardContent className="pt-4">
                  <div className="whitespace-pre-wrap text-sm">{quote.content}</div>
                  <div className="text-xs text-muted-foreground mt-2">
                    Received: {new Date(quote.created_at).toLocaleString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button 
              variant="outline" 
              onClick={() => setViewQuotesDialog(prev => ({ ...prev, open: false }))}
            >
              Close
            </Button>
            <Button onClick={() => {
              setViewQuotesDialog(prev => ({ ...prev, open: false }));
              handleViewConversation(viewQuotesDialog.inquiry);
            }}>
              Go to Conversation
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Inquiries;