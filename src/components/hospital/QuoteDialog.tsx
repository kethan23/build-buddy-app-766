import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { MessageSquare } from 'lucide-react';

interface QuoteDialogProps {
  inquiry: any;
  hospitalId: string;
}

export function QuoteDialog({ inquiry, hospitalId }: QuoteDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const [quote, setQuote] = useState({
    message: '',
    estimated_cost: '',
    currency: 'USD',
    duration_days: '',
  });

  const templates = [
    {
      name: 'Standard Response',
      message: `Dear ${inquiry.profiles?.full_name || 'Patient'},\n\nThank you for your inquiry about ${inquiry.treatment_type}. We have reviewed your requirements and are pleased to provide you with a detailed quote.\n\nOur team of specialists is ready to assist you. Please find the cost estimate and treatment duration below.\n\nBest regards,\nMedical Team`
    },
    {
      name: 'Detailed Consultation',
      message: `Dear ${inquiry.profiles?.full_name || 'Patient'},\n\nWe appreciate your interest in our ${inquiry.treatment_type} services. Based on your inquiry, we recommend scheduling a consultation to discuss your specific needs.\n\nWe have extensive experience in this field and can provide you with comprehensive care throughout your treatment journey.\n\nPlease review our quote below and let us know if you have any questions.`
    }
  ];

  const handleTemplateSelect = (template: string) => {
    const selected = templates.find(t => t.name === template);
    if (selected) {
      setQuote({ ...quote, message: selected.message });
    }
  };

  const handleSubmit = async () => {
    if (!quote.message || !quote.estimated_cost) {
      toast({ title: 'Error', description: 'Message and cost estimate are required', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      // Create conversation if doesn't exist
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .select('id')
        .eq('inquiry_id', inquiry.id)
        .maybeSingle();

      let conversationId = conversation?.id;

      if (!conversation) {
        const { data: newConv, error: newConvError } = await supabase
          .from('conversations')
          .insert({
            patient_id: inquiry.user_id,
            hospital_id: hospitalId,
            inquiry_id: inquiry.id,
          })
          .select()
          .single();

        if (newConvError) throw newConvError;
        conversationId = newConv.id;
      }

      // Send quote message
      const quoteMessage = `${quote.message}\n\n**Quote Details:**\nEstimated Cost: ${quote.currency} ${quote.estimated_cost}\nDuration: ${quote.duration_days} days`;

      const { error: msgError } = await supabase.from('messages').insert({
        conversation_id: conversationId,
        sender_id: (await supabase.auth.getUser()).data.user?.id,
        content: quoteMessage,
        message_type: 'quote',
      });

      if (msgError) throw msgError;

      // Update inquiry status
      await supabase
        .from('inquiries')
        .update({ status: 'responded' })
        .eq('id', inquiry.id);

      toast({ title: 'Success', description: 'Quote sent successfully' });
      setOpen(false);
      setQuote({ message: '', estimated_cost: '', currency: 'USD', duration_days: '' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" size="sm">
          <MessageSquare className="mr-2 h-4 w-4" />
          Send Quote
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Send Quote to {inquiry.profiles?.full_name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Use Template</label>
            <Select onValueChange={handleTemplateSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Select a template" />
              </SelectTrigger>
              <SelectContent>
                {templates.map((t) => (
                  <SelectItem key={t.name} value={t.name}>{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium">Message</label>
            <Textarea
              rows={8}
              value={quote.message}
              onChange={(e) => setQuote({ ...quote, message: e.target.value })}
              placeholder="Enter your response message..."
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="text-sm font-medium">Estimated Cost</label>
              <Input
                type="number"
                value={quote.estimated_cost}
                onChange={(e) => setQuote({ ...quote, estimated_cost: e.target.value })}
                placeholder="Enter cost"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Currency</label>
              <Select value={quote.currency} onValueChange={(v) => setQuote({ ...quote, currency: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                  <SelectItem value="INR">INR</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Treatment Duration (days)</label>
            <Input
              type="number"
              value={quote.duration_days}
              onChange={(e) => setQuote({ ...quote, duration_days: e.target.value })}
              placeholder="e.g., 7"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? 'Sending...' : 'Send Quote'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
