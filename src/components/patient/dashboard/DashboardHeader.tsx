import { ScrollReveal } from '@/hooks/useScrollAnimation';
import { Sparkles, Activity, Heart, Shield } from 'lucide-react';

interface DashboardHeaderProps {
  profileName?: string;
}

export function DashboardHeader({ profileName }: DashboardHeaderProps) {
  return (
    <ScrollReveal>
      <div className="mb-8">
        <div className="elegant-card p-8 md:p-10 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-1/2 w-40 h-40 bg-accent/5 rounded-full blur-2xl" />
          
          <div className="relative z-10">
            <div className="section-badge w-fit mb-4">
              <Sparkles className="h-4 w-4" />
              Patient Portal
            </div>
            <h1 className="text-3xl md:text-4xl font-heading font-bold mb-2 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              Welcome back, {profileName || 'Patient'} 👋
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              Your medical journey is in good hands. Browse hospitals, manage inquiries, and track your bookings all in one place.
            </p>

            {/* Stats row */}
            <div className="flex flex-wrap gap-6 mt-6 pt-6 border-t border-border/50">
              {[
                { icon: Activity, label: 'Active Inquiries', value: '—' },
                { icon: Heart, label: 'Saved Hospitals', value: '—' },
                { icon: Shield, label: 'Verified Profile', value: '✓' },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <stat.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                    <p className="text-sm font-semibold">{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ScrollReveal>
  );
}
