import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Download, DollarSign, CreditCard } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

const Payments = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [payments, setPayments] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      loadPayments();
    }
  }, [user]);

  const loadPayments = async () => {
    const { data, error } = await supabase
      .from('payments')
      .select('*, bookings(treatment_name)')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: 'Error loading payments',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      setPayments(data || []);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-warning',
      completed: 'bg-success',
      failed: 'bg-destructive',
      refunded: 'bg-info',
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
        <div className="mb-6">
          <h1 className="text-3xl font-heading font-bold mb-2">Payment History</h1>
          <p className="text-muted-foreground">View and manage your transaction history</p>
        </div>

        {payments.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <CreditCard className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No payments yet</h3>
              <p className="text-muted-foreground text-center mb-6">
                Your payment transactions will appear here once you confirm bookings
              </p>
              <Button onClick={() => navigate('/patient/bookings')}>
                View My Bookings
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {payments.map((payment) => (
              <Card key={payment.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle>{payment.bookings?.treatment_name || 'Treatment'}</CardTitle>
                      <CardDescription>
                        Transaction ID: {payment.transaction_id || payment.id.slice(0, 16)}
                        {payment.payment_date && ` • ${new Date(payment.payment_date).toLocaleDateString()}`}
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(payment.status)}>
                      {payment.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-3 border-t border-b">
                      <div className="space-y-1">
                        <div className="flex items-center text-2xl font-bold">
                          <DollarSign className="h-6 w-6 mr-1" />
                          {payment.amount.toLocaleString()} {payment.currency}
                        </div>
                        {payment.payment_method && (
                          <p className="text-sm text-muted-foreground">
                            via {payment.payment_method}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Payment Date</p>
                        <p className="font-medium">
                          {payment.payment_date 
                            ? new Date(payment.payment_date).toLocaleDateString()
                            : 'Pending'}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download Invoice
                      </Button>
                      {payment.status === 'completed' && (
                        <Button variant="outline" size="sm">
                          Request Refund
                        </Button>
                      )}
                    </div>
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

export default Payments;
