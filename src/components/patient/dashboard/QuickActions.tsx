import { ScrollReveal } from '@/hooks/useScrollAnimation';
import { Card, CardContent } from '@/components/ui/card';
import { VisaStatusCard } from '@/components/patient/VisaStatusCard';
import { Search, FileText, Calendar, Bell, Plane } from 'lucide-react';
import { NavigateFunction } from 'react-router-dom';

interface QuickActionsProps {
  navigate: NavigateFunction;
}

const actions = [
  { icon: Search, title: 'Search Hospitals', desc: 'Find the perfect hospital', path: '/patient/search', gradient: 'from-primary/15 to-secondary/10', iconBg: 'bg-primary/15', iconColor: 'text-primary' },
  { icon: FileText, title: 'View Inquiries', desc: 'Track your inquiries', path: '/patient/inquiries', gradient: 'from-accent/15 to-accent/5', iconBg: 'bg-accent/15', iconColor: 'text-accent-foreground' },
  { icon: Calendar, title: 'Book Consultation', desc: 'Schedule appointments', path: '/patient/bookings', gradient: 'from-success/15 to-success/5', iconBg: 'bg-success/15', iconColor: 'text-foreground' },
  { icon: Bell, title: 'Notifications', desc: 'Stay updated', path: null, gradient: 'from-info/15 to-info/5', iconBg: 'bg-info/15', iconColor: 'text-foreground' },
];

export function QuickActions({ navigate }: QuickActionsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {actions.map((action, index) => {
        const Icon = action.icon;
        return (
          <ScrollReveal key={action.title} delay={index * 80} animation="scale-in">
            <Card
              className={`group cursor-pointer border-0 backdrop-blur-sm hover:shadow-medium transition-all duration-300 hover:-translate-y-1.5 h-full bg-gradient-to-br ${action.gradient}`}
              onClick={() => action.path && navigate(action.path)}
            >
              <CardContent className="p-5 flex flex-col items-center text-center gap-3">
                <div className={`w-12 h-12 rounded-2xl ${action.iconBg} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`h-5 w-5 ${action.iconColor}`} />
                </div>
                <div>
                  <p className="text-sm font-semibold mb-0.5">{action.title}</p>
                  <p className="text-xs text-muted-foreground leading-tight">{action.desc}</p>
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>
        );
      })}
      <ScrollReveal delay={320} animation="scale-in">
        <VisaStatusCard />
      </ScrollReveal>
    </div>
  );
}
