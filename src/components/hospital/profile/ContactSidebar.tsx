import { Mail, Phone, Globe, MapPin, Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ContactSidebarProps {
  hospital: any;
  onRequestConsultation: () => void;
  onSendInquiry: () => void;
  onViewPackages: () => void;
}

const ContactSidebar = ({ hospital, onRequestConsultation, onSendInquiry, onViewPackages }: ContactSidebarProps) => {
  return (
    <div className="space-y-6">
      {/* Contact Card */}
      <Card className="elegant-card overflow-hidden">
        <CardHeader className="bg-gradient-to-br from-primary/5 to-transparent">
          <CardTitle className="text-lg flex items-center gap-2">
            <Mail className="h-4 w-4 text-primary" />
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          {hospital.email && (
            <div className="flex items-center gap-3 group">
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Mail className="h-4 w-4 text-primary" />
              </div>
              <a href={`mailto:${hospital.email}`} className="text-sm text-primary hover:underline truncate">
                {hospital.email}
              </a>
            </div>
          )}
          {hospital.phone && (
            <div className="flex items-center gap-3 group">
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Phone className="h-4 w-4 text-primary" />
              </div>
              <a href={`tel:${hospital.phone}`} className="text-sm text-primary hover:underline">
                {hospital.phone}
              </a>
            </div>
          )}
          {hospital.website && (
            <div className="flex items-center gap-3 group">
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Globe className="h-4 w-4 text-primary" />
              </div>
              <a
                href={hospital.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline"
              >
                Visit Website
              </a>
            </div>
          )}
          {hospital.address && (
            <div className="flex items-start gap-3">
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <MapPin className="h-4 w-4 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {hospital.address}, {hospital.city}
                {hospital.state && `, ${hospital.state}`}
                {hospital.postal_code && ` ${hospital.postal_code}`}, {hospital.country}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions Card */}
      <Card className="elegant-card overflow-hidden sticky top-24">
        <CardHeader className="bg-gradient-to-br from-accent/5 to-transparent">
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 pt-4">
          <Button
            className="w-full btn-gradient text-white"
            onClick={onRequestConsultation}
          >
            Request Consultation
          </Button>
          <Button
            className="w-full"
            variant="outline"
            onClick={onSendInquiry}
          >
            <Send className="h-4 w-4 mr-2" />
            Send Inquiry
          </Button>
          <Button
            className="w-full"
            variant="ghost"
            onClick={onViewPackages}
          >
            View All Packages
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContactSidebar;
