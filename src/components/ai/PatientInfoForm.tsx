import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, ArrowRight } from 'lucide-react';
import type { PatientInfo } from '@/pages/patient/AIAnalysis';

interface Props {
  onSubmit: (info: PatientInfo) => void;
}

const indianCities = ['Delhi', 'Mumbai', 'Chennai', 'Hyderabad', 'Bangalore', 'Kolkata', 'Pune', 'Ahmedabad', 'Any'];
const budgetRanges = ['Under $3,000', '$3,000 - $5,000', '$5,000 - $10,000', '$10,000 - $20,000', '$20,000 - $50,000', 'Above $50,000', 'Not sure'];

export default function PatientInfoForm({ onSubmit }: Props) {
  const [info, setInfo] = useState<PatientInfo>({
    name: '', age: '', gender: '', country: '', condition: '', previousTreatments: '', budget: '', preferredCity: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(info);
  };

  const update = (field: keyof PatientInfo, value: string) => setInfo(prev => ({ ...prev, [field]: value }));

  return (
    <Card className="elegant-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <User className="h-5 w-5 text-primary" />
          </div>
          Tell Us About Yourself
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input id="name" required value={info.name} onChange={e => update('name', e.target.value)} placeholder="John Doe" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="age">Age *</Label>
              <Input id="age" type="number" required min="1" max="120" value={info.age} onChange={e => update('age', e.target.value)} placeholder="45" />
            </div>
            <div className="space-y-2">
              <Label>Gender *</Label>
              <Select required value={info.gender} onValueChange={v => update('gender', v)}>
                <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country *</Label>
              <Input id="country" required value={info.country} onChange={e => update('country', e.target.value)} placeholder="United States" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="condition">Medical Condition / Symptoms *</Label>
            <Textarea id="condition" required value={info.condition} onChange={e => update('condition', e.target.value)}
              placeholder="Describe your medical condition, symptoms, or the treatment you're looking for..."
              rows={3} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="previous">Previous Treatments or Surgeries</Label>
            <Textarea id="previous" value={info.previousTreatments} onChange={e => update('previousTreatments', e.target.value)}
              placeholder="List any previous treatments, surgeries, or medications..."
              rows={2} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Budget Range</Label>
              <Select value={info.budget} onValueChange={v => update('budget', v)}>
                <SelectTrigger><SelectValue placeholder="Select budget" /></SelectTrigger>
                <SelectContent>
                  {budgetRanges.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Preferred City in India</Label>
              <Select value={info.preferredCity} onValueChange={v => update('preferredCity', v)}>
                <SelectTrigger><SelectValue placeholder="Select city" /></SelectTrigger>
                <SelectContent>
                  {indianCities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button type="submit" size="lg" className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90">
            Continue to Upload Reports <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
