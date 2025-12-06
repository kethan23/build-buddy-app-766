import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileDown, FileSpreadsheet, Loader2 } from 'lucide-react';
import { generateAppointmentPDF, generateAppointmentExcel, downloadBlob } from '@/utils/exportUtils';
import { toast } from 'sonner';

interface AppointmentData {
  appointment_id: string;
  patient_name: string;
  scheduled_date: string;
  caretaker_name?: string;
  caretaker_phone?: string;
  hospital_name: string;
  hospital_address: string;
  doctor_name?: string;
  doctor_cabin_number?: string;
  treatment_name: string;
  status: string;
  total_amount?: number;
  currency?: string;
}

interface AppointmentExportProps {
  appointments: AppointmentData[];
  role: 'admin' | 'hospital' | 'patient';
  hospitalLogoUrl?: string;
  pendingInquiriesCount?: number;
  pendingPaymentsCount?: number;
}

export function AppointmentExport({
  appointments,
  role,
  hospitalLogoUrl,
  pendingInquiriesCount,
  pendingPaymentsCount,
}: AppointmentExportProps) {
  const [exporting, setExporting] = useState<'pdf' | 'excel' | null>(null);

  const handleExportPDF = async () => {
    if (appointments.length === 0) {
      toast.error('No appointments to export');
      return;
    }

    setExporting('pdf');
    try {
      const blob = await generateAppointmentPDF(appointments, {
        role,
        hospitalLogoUrl,
        pendingInquiriesCount,
        pendingPaymentsCount,
      });
      const filename = `appointments_${new Date().toISOString().split('T')[0]}.pdf`;
      downloadBlob(blob, filename);
      toast.success('PDF downloaded successfully');
    } catch (error) {
      toast.error('Failed to generate PDF');
    } finally {
      setExporting(null);
    }
  };

  const handleExportExcel = () => {
    if (appointments.length === 0) {
      toast.error('No appointments to export');
      return;
    }

    setExporting('excel');
    try {
      const blob = generateAppointmentExcel(appointments, {
        role,
        hospitalLogoUrl,
        pendingInquiriesCount,
        pendingPaymentsCount,
      });
      const filename = `appointments_${new Date().toISOString().split('T')[0]}.xlsx`;
      downloadBlob(blob, filename);
      toast.success('Excel downloaded successfully');
    } catch (error) {
      toast.error('Failed to generate Excel');
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleExportPDF}
        disabled={exporting !== null}
      >
        {exporting === 'pdf' ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <FileDown className="h-4 w-4 mr-2" />
        )}
        Export PDF
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleExportExcel}
        disabled={exporting !== null}
      >
        {exporting === 'excel' ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <FileSpreadsheet className="h-4 w-4 mr-2" />
        )}
        Export Excel
      </Button>
    </div>
  );
}
