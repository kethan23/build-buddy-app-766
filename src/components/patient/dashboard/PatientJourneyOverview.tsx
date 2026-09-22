import { Check, Circle, ClipboardCheck, FileHeart, HeartPulse, Plane, Stethoscope } from 'lucide-react';
import { cn } from '@/lib/utils';

export type JourneyStageKey = 'need' | 'consultation' | 'plan' | 'travel' | 'treatment';

interface PatientJourneyOverviewProps {
  currentStage: JourneyStageKey;
  completedStages: JourneyStageKey[];
}

const stages: Array<{ key: JourneyStageKey; label: string; icon: typeof HeartPulse }> = [
  { key: 'need', label: 'Medical Need', icon: HeartPulse },
  { key: 'consultation', label: 'Consultation', icon: Stethoscope },
  { key: 'plan', label: 'Treatment Plan', icon: ClipboardCheck },
  { key: 'travel', label: 'Travel', icon: Plane },
  { key: 'treatment', label: 'Treatment', icon: FileHeart },
];

export function PatientJourneyOverview({ currentStage, completedStages }: PatientJourneyOverviewProps) {
  return (
    <ol className="grid gap-0 md:grid-cols-5" aria-label="Your medical journey progress">
      {stages.map((stage, index) => {
        const isCompleted = completedStages.includes(stage.key);
        const isCurrent = stage.key === currentStage;
        const Icon = stage.icon;

        return (
          <li key={stage.key} className="relative flex gap-3 pb-5 last:pb-0 md:block md:pb-0">
            {index < stages.length - 1 && (
              <span
                aria-hidden="true"
                className={cn(
                  'absolute left-5 top-10 h-[calc(100%-2.25rem)] w-px md:left-[calc(50%+1.25rem)] md:top-5 md:h-px md:w-[calc(100%-2.5rem)]',
                  isCompleted ? 'bg-success' : 'bg-border',
                )}
              />
            )}
            <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border bg-card md:mx-auto">
              {isCompleted ? (
                <Check className="h-5 w-5 text-success" aria-hidden="true" />
              ) : isCurrent ? (
                <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
              ) : (
                <Circle className="h-4 w-4 text-muted-foreground/50" aria-hidden="true" />
              )}
            </div>
            <div className="min-w-0 pt-1.5 md:mt-3 md:px-2 md:pt-0 md:text-center">
              <p className={cn('text-sm font-medium', isCurrent ? 'text-primary' : isCompleted ? 'text-foreground' : 'text-muted-foreground')}>
                {stage.label}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {isCompleted ? 'Completed' : isCurrent ? 'Current step' : 'Upcoming'}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}