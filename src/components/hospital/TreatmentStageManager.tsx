import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/card';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

interface TreatmentStageManagerProps {
  bookingId: string;
  currentStage: string;
  onUpdate?: () => void;
}

const STAGES = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-500' },
  { value: 'in_review', label: 'In Review', color: 'bg-blue-500' },
  { value: 'confirmed', label: 'Confirmed', color: 'bg-green-500' },
  { value: 'in_progress', label: 'In Progress', color: 'bg-purple-500' },
  { value: 'completed', label: 'Completed', color: 'bg-gray-500' },
];

export function TreatmentStageManager({ bookingId, currentStage, onUpdate }: TreatmentStageManagerProps) {
  const [updating, setUpdating] = useState(false);

  const updateStage = async (newStage: string) => {
    setUpdating(true);
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ treatment_stage: newStage })
        .eq('id', bookingId);

      if (error) throw error;

      toast.success('Treatment stage updated');
      onUpdate?.();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update stage');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <GlassCard className="p-4">
      <h4 className="font-medium mb-3">Treatment Stage</h4>
      <div className="flex flex-wrap gap-2">
        {STAGES.map((stage) => (
          <Button
            key={stage.value}
            variant={currentStage === stage.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => updateStage(stage.value)}
            disabled={updating || currentStage === stage.value}
          >
            {stage.label}
          </Button>
        ))}
      </div>
      <div className="mt-4">
        <Badge className={STAGES.find(s => s.value === currentStage)?.color}>
          Current: {STAGES.find(s => s.value === currentStage)?.label}
        </Badge>
      </div>
    </GlassCard>
  );
}
