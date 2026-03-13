import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollReveal } from '@/hooks/useScrollAnimation';
import {
  AlertTriangle, Activity, Hospital, DollarSign, RefreshCw, Shield,
  CheckCircle2, Clock, TrendingUp, MapPin
} from 'lucide-react';
import type { MedicalAnalysis } from '@/pages/patient/AIAnalysis';
import { useNavigate } from 'react-router-dom';

interface Props {
  analysis: MedicalAnalysis;
  onStartOver: () => void;
}

const severityColors: Record<string, string> = {
  mild: 'bg-green-500/15 text-green-700 border-green-500/30',
  moderate: 'bg-yellow-500/15 text-yellow-700 border-yellow-500/30',
  severe: 'bg-orange-500/15 text-orange-700 border-orange-500/30',
  critical: 'bg-red-500/15 text-red-700 border-red-500/30',
};

const urgencyColors: Record<string, string> = {
  routine: 'bg-green-500/15 text-green-700',
  soon: 'bg-yellow-500/15 text-yellow-700',
  urgent: 'bg-orange-500/15 text-orange-700',
  emergency: 'bg-red-500/15 text-red-700',
};

export default function AnalysisResults({ analysis, onStartOver }: Props) {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Summary */}
      <ScrollReveal>
        <Card className="elegant-card border-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Medical Summary
              </CardTitle>
              <Badge className={urgencyColors[analysis.urgencyLevel] || 'bg-muted'}>
                {analysis.urgencyLevel.toUpperCase()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">{analysis.summary}</p>
          </CardContent>
        </Card>
      </ScrollReveal>

      {/* Detected Conditions */}
      <ScrollReveal delay={100}>
        <Card className="elegant-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Detected Conditions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {analysis.detectedConditions.map((c, i) => (
              <div key={i} className="p-4 rounded-lg bg-muted/50 border border-border">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">{c.condition}</h4>
                  <div className="flex gap-2">
                    <Badge variant="outline" className={severityColors[c.severity]}>{c.severity}</Badge>
                    <Badge variant="outline">{c.confidence} confidence</Badge>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{c.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </ScrollReveal>

      {/* Recommended Treatments */}
      <ScrollReveal delay={150}>
        <Card className="elegant-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-accent" />
              Recommended Treatments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analysis.recommendedTreatments.map((t, i) => (
                <div key={i} className="p-4 rounded-xl bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/10">
                  <h4 className="font-semibold text-primary mb-2">{t.treatment}</h4>
                  <p className="text-sm text-muted-foreground mb-3">{t.description}</p>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3 text-accent" />
                      <span>{t.estimatedCostUSD}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span>{t.durationDays} days</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3 text-green-600" />
                      <span>{t.successRate}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </ScrollReveal>

      {/* Recommended Hospitals */}
      <ScrollReveal delay={200}>
        <Card className="elegant-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Hospital className="h-5 w-5 text-primary" />
              Recommended Hospitals in India
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analysis.recommendedHospitals.map((h, i) => (
                <div key={i} className="p-4 rounded-xl border border-border hover:border-primary/30 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-lg">{h.name}</h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" /> {h.city}
                        <span>•</span>
                        <Shield className="h-3 w-3" /> {h.accreditation}
                      </div>
                    </div>
                    <Badge className="bg-accent/15 text-accent border-accent/30">{h.estimatedCost}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2"><strong>Specialty:</strong> {h.specialty}</p>
                  <p className="text-sm text-muted-foreground">{h.whyRecommended}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </ScrollReveal>

      {/* Cost Breakdown */}
      <ScrollReveal delay={250}>
        <Card className="elegant-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-accent" />
              Estimated Cost Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
              {[
                { label: 'Surgery Cost', value: analysis.costBreakdown.surgeryCost },
                { label: 'Hospital Stay', value: analysis.costBreakdown.hospitalStay },
                { label: 'Doctor Fees', value: analysis.costBreakdown.doctorFees },
                { label: 'Medicine Cost', value: analysis.costBreakdown.medicineCost },
                { label: 'Additional Charges', value: analysis.costBreakdown.additionalCharges },
              ].map((item, i) => (
                <div key={i} className="p-3 rounded-lg bg-muted/50 text-center">
                  <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
                  <p className="font-semibold">{item.value}</p>
                </div>
              ))}
              <div className="p-3 rounded-lg bg-gradient-to-r from-primary/10 to-secondary/10 text-center border-2 border-primary/20">
                <p className="text-xs text-primary font-medium mb-1">Total Estimate</p>
                <p className="font-bold text-lg text-primary">{analysis.costBreakdown.totalEstimate}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </ScrollReveal>

      {/* Disclaimer */}
      <ScrollReveal delay={300}>
        <div className="p-4 rounded-lg bg-warning/10 border border-warning/30 text-sm text-muted-foreground">
          <strong className="text-warning">⚠️ Disclaimer:</strong> {analysis.disclaimer}
        </div>
      </ScrollReveal>

      {/* Actions */}
      <ScrollReveal delay={350}>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="outline" onClick={onStartOver} className="flex-1">
            <RefreshCw className="mr-2 h-4 w-4" /> Start Over
          </Button>
          <Button onClick={() => navigate('/hospitals')} className="flex-1 bg-gradient-to-r from-primary to-secondary">
            <Hospital className="mr-2 h-4 w-4" /> Browse Hospitals
          </Button>
          <Button onClick={() => navigate('/patient/chat')} variant="secondary" className="flex-1">
            Talk to AI Assistant
          </Button>
        </div>
      </ScrollReveal>
    </div>
  );
}
