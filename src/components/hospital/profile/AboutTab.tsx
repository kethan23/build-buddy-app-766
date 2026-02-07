import { Users, Award, Sparkles, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface AboutTabProps {
  hospital: any;
  specialties: any[];
  certifications: any[];
}

const AboutTab = ({ hospital, specialties, certifications }: AboutTabProps) => {
  return (
    <div className="space-y-6">
      <Card className="elegant-card overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            About {hospital.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground leading-relaxed">{hospital.description}</p>

          {hospital.bed_capacity && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/10">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Bed Capacity</span>
                <p className="font-semibold">{hospital.bed_capacity} beds</p>
              </div>
            </div>
          )}

          {specialties.length > 0 && (
            <div>
              <h3 className="font-heading font-semibold mb-3 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                Specialties
              </h3>
              <div className="flex flex-wrap gap-2">
                {specialties.map((specialty) => (
                  <Badge
                    key={specialty.id}
                    variant="secondary"
                    className="px-3 py-1.5 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors"
                  >
                    {specialty.specialty_name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {certifications.length > 0 && (
            <div>
              <h3 className="font-heading font-semibold mb-3 flex items-center gap-2">
                <Award className="h-4 w-4 text-accent" />
                Certifications & Accreditations
              </h3>
              <div className="grid gap-3">
                {certifications.map((cert, index) => (
                  <div
                    key={cert.id}
                    className="group flex items-center justify-between p-4 rounded-xl bg-accent/5 border border-accent/10 hover:border-accent/30 hover:shadow-soft transition-all duration-300 animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                        <Award className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <p className="font-medium">{cert.certification_name}</p>
                        {cert.issuing_body && (
                          <p className="text-sm text-muted-foreground">{cert.issuing_body}</p>
                        )}
                      </div>
                    </div>
                    {cert.expiry_date && (
                      <Badge variant="outline" className="text-xs">
                        Valid until {new Date(cert.expiry_date).getFullYear()}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AboutTab;
