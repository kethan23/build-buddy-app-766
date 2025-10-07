import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Plus, MessageSquare, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const inquirySchema = z.object({
  treatment_type: z.string().min(3, 'Treatment type must be at least 3 characters'),
  preferred_date: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

const Inquiries = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<z.infer<typeof inquirySchema>>({
    resolver: zodResolver(inquirySchema),
    defaultValues: {
      treatment_type: '',
      preferred_date: '',
      message: '',
    },
  });

  useEffect(() => {
    if (user) {
      loadInquiries();
    }
  }, [user]);

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
    } else {
      setInquiries(data || []);
    }
  };

  const onSubmit = async (values: z.infer<typeof inquirySchema>) => {
    const { error } = await supabase.from('inquiries').insert([
      {
        user_id: user?.id,
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

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-warning',
      responded: 'bg-info',
      accepted: 'bg-success',
      rejected: 'bg-destructive',
    };
    return colors[status] || 'bg-muted';
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => navigate('/patient/dashboard')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">M</span>
              </div>
              <span className="font-heading font-bold text-xl text-primary">MediConnect</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
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
                  Send an inquiry to hospitals about your treatment needs
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                      <CardTitle>{inquiry.treatment_type}</CardTitle>
                      <CardDescription>
                        Created on {new Date(inquiry.created_at).toLocaleDateString()}
                        {inquiry.preferred_date && ` • Preferred: ${new Date(inquiry.preferred_date).toLocaleDateString()}`}
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(inquiry.status)}>
                      {inquiry.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{inquiry.message}</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      View Conversation
                    </Button>
                    {inquiry.status === 'responded' && (
                      <Button size="sm">View Quotes</Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Inquiries;
