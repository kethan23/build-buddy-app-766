import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { seedHospitalImages } from '@/utils/seedHospitalImages';
import { Loader2, CheckCircle2 } from 'lucide-react';

const SeedHospitalData = () => {
  const [running, setRunning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [done, setDone] = useState(false);

  const handleSeed = async () => {
    setRunning(true);
    setLogs([]);
    setDone(false);

    try {
      await seedHospitalImages((msg) => {
        setLogs(prev => [...prev, msg]);
      });
      setDone(true);
    } catch (error: any) {
      setLogs(prev => [...prev, `❌ Error: ${error.message}`]);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Seed Hospital Photos & Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              This will upload cover images, logos, and gallery photos for all hospitals, 
              and update their descriptions with scraped information.
            </p>
            <Button onClick={handleSeed} disabled={running} className="w-full">
              {running ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Seeding...
                </>
              ) : done ? (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Done! Run Again
                </>
              ) : (
                'Start Seeding'
              )}
            </Button>

            {logs.length > 0 && (
              <div className="bg-muted rounded-lg p-4 max-h-80 overflow-y-auto">
                {logs.map((log, i) => (
                  <p key={i} className="text-sm font-mono">{log}</p>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SeedHospitalData;
