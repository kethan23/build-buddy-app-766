import { Clock, Heart, CheckCircle2, XCircle, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface PackagesTabProps {
  packages: any[];
  onRequestQuote: (packageName: string) => void;
}

const PackagesTab = ({ packages, onRequestQuote }: PackagesTabProps) => {
  if (packages.length === 0) {
    return (
      <Card className="elegant-card">
        <CardContent className="py-16 text-center text-muted-foreground">
          <Package className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No treatment packages available</p>
          <p className="text-sm mt-1">Contact the hospital directly for pricing</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-5">
      {packages.map((pkg, index) => (
        <Card
          key={pkg.id}
          className="group elegant-card overflow-hidden hover:shadow-medium transition-all duration-300 animate-fade-in"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <CardTitle className="text-xl group-hover:text-primary transition-colors">
                  {pkg.name}
                </CardTitle>
                <Badge variant="secondary" className="bg-secondary/10 text-secondary border-secondary/20">
                  {pkg.category}
                </Badge>
              </div>
              <div className="text-right">
                <div className="px-4 py-2 rounded-xl bg-primary/5 border border-primary/10">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Starting from</p>
                  <p className="text-2xl font-heading font-bold text-primary">
                    {pkg.currency} {pkg.price.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            {pkg.description && (
              <p className="text-muted-foreground leading-relaxed">{pkg.description}</p>
            )}

            {/* Duration & Recovery info cards */}
            <div className="grid grid-cols-2 gap-3">
              {pkg.duration_days && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-info/5 border border-info/10">
                  <div className="h-9 w-9 rounded-lg bg-info/10 flex items-center justify-center">
                    <Clock className="h-4 w-4 text-info" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Duration</p>
                    <p className="font-semibold text-sm">{pkg.duration_days} days</p>
                  </div>
                </div>
              )}
              {pkg.recovery_days && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-success/5 border border-success/10">
                  <div className="h-9 w-9 rounded-lg bg-success/10 flex items-center justify-center">
                    <Heart className="h-4 w-4 text-success" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Recovery</p>
                    <p className="font-semibold text-sm">{pkg.recovery_days} days</p>
                  </div>
                </div>
              )}
            </div>

            {/* Inclusions & Exclusions */}
            <div className="grid md:grid-cols-2 gap-4">
              {pkg.inclusions && Array.isArray(pkg.inclusions) && pkg.inclusions.length > 0 && (
                <div className="p-4 rounded-xl bg-success/5 border border-success/10">
                  <h4 className="font-semibold text-sm mb-2 flex items-center gap-1.5 text-success">
                    <CheckCircle2 className="h-4 w-4" />
                    What's Included
                  </h4>
                  <ul className="space-y-1.5">
                    {(pkg.inclusions as string[]).map((item: string, i: number) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-success mt-0.5 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {pkg.exclusions && Array.isArray(pkg.exclusions) && pkg.exclusions.length > 0 && (
                <div className="p-4 rounded-xl bg-destructive/5 border border-destructive/10">
                  <h4 className="font-semibold text-sm mb-2 flex items-center gap-1.5 text-destructive">
                    <XCircle className="h-4 w-4" />
                    Not Included
                  </h4>
                  <ul className="space-y-1.5">
                    {(pkg.exclusions as string[]).map((item: string, i: number) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <XCircle className="h-3.5 w-3.5 text-destructive/50 mt-0.5 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <Button
              className="w-full btn-gradient text-white"
              onClick={() => onRequestQuote(pkg.name)}
            >
              Request Quote
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default PackagesTab;
