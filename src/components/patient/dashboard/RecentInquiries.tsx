import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, ArrowRight } from 'lucide-react';
import { NavigateFunction } from 'react-router-dom';

interface RecentInquiriesProps {
  inquiries: any[];
  navigate: NavigateFunction;
}

const statusColors: Record<string, string> = {
  pending: 'bg-warning/15 text-warning-foreground border border-warning/30',
  responded: 'bg-info/15 text-foreground border border-info/30',
  accepted: 'bg-success/15 text-foreground border border-success/30',
  rejected: 'bg-destructive/15 text-destructive border border-destructive/30',
};

export function RecentInquiries({ inquiries, navigate }: RecentInquiriesProps) {
  return (
    <div className="elegant-card h-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <FileText className="h-4 w-4 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg font-heading">Recent Inquiries</CardTitle>
            <CardDescription className="text-xs">Your latest hospital inquiries</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {inquiries.length === 0 ? (
          <div className="text-center py-10">
            <div className="w-14 h-14 rounded-2xl bg-muted/60 flex items-center justify-center mx-auto mb-4">
              <FileText className="h-6 w-6 text-muted-foreground/50" />
            </div>
            <p className="text-sm text-muted-foreground mb-1">No inquiries yet</p>
            <p className="text-xs text-muted-foreground/70 mb-4">Start by searching for hospitals!</p>
            <Button size="sm" className="btn-gradient text-primary-foreground" onClick={() => navigate('/patient/search')}>
              Search Hospitals
              <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {inquiries.map((inquiry) => (
              <div key={inquiry.id} className="flex items-center justify-between p-3.5 rounded-xl bg-muted/30 hover:bg-muted/50 transition-all duration-200 border border-transparent hover:border-border/50">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{inquiry.treatment_type}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(inquiry.created_at).toLocaleDateString()}
                  </p>
                </div>
                <Badge className={statusColors[inquiry.status] || 'bg-muted text-muted-foreground'}>
                  {inquiry.status}
                </Badge>
              </div>
            ))}
            <Button variant="outline" className="w-full mt-3 hover:bg-primary/5" onClick={() => navigate('/patient/inquiries')}>
              View All Inquiries
            </Button>
          </div>
        )}
      </CardContent>
    </div>
  );
}
