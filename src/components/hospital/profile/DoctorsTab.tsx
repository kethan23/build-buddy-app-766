import { Users, Stethoscope, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface DoctorsTabProps {
  doctors: any[];
}

const DoctorsTab = ({ doctors }: DoctorsTabProps) => {
  if (doctors.length === 0) {
    return (
      <Card className="elegant-card">
        <CardContent className="py-16 text-center text-muted-foreground">
          <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No doctors listed yet</p>
          <p className="text-sm mt-1">Check back soon for updated staff information</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {doctors.map((doctor, index) => (
        <Card
          key={doctor.id}
          className="group elegant-card overflow-hidden hover:shadow-medium transition-all duration-300 animate-fade-in"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <CardContent className="pt-6">
            <div className="flex gap-5">
              {doctor.photo_url ? (
                <img
                  src={doctor.photo_url}
                  alt={doctor.name}
                  className="h-20 w-20 rounded-xl object-cover ring-2 ring-primary/10 group-hover:ring-primary/30 transition-all"
                />
              ) : (
                <div className="h-20 w-20 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center ring-2 ring-primary/10">
                  <Stethoscope className="h-8 w-8 text-primary/50" />
                </div>
              )}
              <div className="flex-1">
                <h3 className="font-heading font-semibold text-lg group-hover:text-primary transition-colors">
                  {doctor.name}
                </h3>
                <Badge className="mt-1 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                  {doctor.specialty}
                </Badge>
                {doctor.qualification && (
                  <p className="text-sm text-muted-foreground mt-2">{doctor.qualification}</p>
                )}
                {doctor.experience_years && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <Clock className="h-3 w-3" />
                    {doctor.experience_years} years of experience
                  </p>
                )}
                {doctor.bio && (
                  <p className="text-sm mt-3 text-muted-foreground leading-relaxed">{doctor.bio}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DoctorsTab;
