import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

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

interface ExportOptions {
  role: 'admin' | 'hospital' | 'patient';
  hospitalLogoUrl?: string;
  pendingInquiriesCount?: number;
  pendingPaymentsCount?: number;
}

// Platform logo as base64 (simple M logo placeholder)
const PLATFORM_LOGO_BASE64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAACXBIWXMAAAsTAAALEwEAmpwYAAABcElEQVR4nO2ZsU7DMBCGv4qFLmwsMPAavAIMvBpLF1gQEg/B0AUWJIZY2bJUokKCgQGxsbBkQEJCSAyI0IPYVZKqSe3Yvibu4l+6xHfxd+dz7LuAEEIIIYQQQohTIgDWgTFgCPCAZ+AeOAZuA9Yl0AA+gAD4AhaBnmwCHQKHQFe2jgH7QGe2DsAJMJKt4wk4yjocwBpQz9YxC8xl63ABS0BXto4DoCtbRx/QnK3DCezKJtABzMomcAB0ygbQAUzLJrAPNMoG0AxMySZwBHTJBlADTMomcAAUZAOoABrZBPaAmGwAbcCIbAL7QFE2gFZgRDaBA6AoG0AV0CgbwB4QlQ2gCRiWTWAfKMoG0AIMywawCxRlA6gDGpHdWDfAKrBjue4dYBl4BZaMraPO+n4rcm5pxu6Av4x1BywYW8cjsGOsb+beFWDH2Dq+gV1j64gAe8bW8QPsGltHAGwYW0cIbBpbxzewbWwdv8C2hP/ILxS7c5T5H+1fAAAAAElFTkSuQmCC';

export async function generateAppointmentPDF(
  appointments: AppointmentData[],
  options: ExportOptions
): Promise<Blob> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Add logo based on role
  let logoUrl = PLATFORM_LOGO_BASE64;
  if (options.role === 'hospital' && options.hospitalLogoUrl) {
    logoUrl = options.hospitalLogoUrl;
  }

  try {
    doc.addImage(logoUrl, 'PNG', 15, 10, 25, 25);
  } catch (e) {
    // If logo fails, continue without it
  }

  // Title
  doc.setFontSize(20);
  doc.setTextColor(0, 120, 255);
  const title = options.role === 'admin' ? 'MediConnect - Appointment Report' :
                options.role === 'hospital' ? 'Hospital Appointment Report' :
                'My Appointments';
  doc.text(title, pageWidth / 2, 25, { align: 'center' });

  // Date
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, pageWidth / 2, 32, { align: 'center' });

  // Summary section
  let yPos = 45;
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  
  if (options.pendingInquiriesCount !== undefined) {
    doc.text(`Pending Inquiries: ${options.pendingInquiriesCount}`, 15, yPos);
    yPos += 7;
  }
  if (options.pendingPaymentsCount !== undefined) {
    doc.text(`Pending Payments: ${options.pendingPaymentsCount}`, 15, yPos);
    yPos += 7;
  }

  doc.text(`Total Appointments: ${appointments.length}`, 15, yPos);
  yPos += 15;

  // Appointments
  appointments.forEach((apt, index) => {
    if (yPos > 260) {
      doc.addPage();
      yPos = 20;
    }

    // Appointment card background
    doc.setFillColor(245, 247, 250);
    doc.roundedRect(10, yPos - 5, pageWidth - 20, 55, 3, 3, 'F');

    doc.setFontSize(11);
    doc.setTextColor(0, 120, 255);
    doc.text(`Appointment ID: ${apt.appointment_id}`, 15, yPos);
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    
    yPos += 8;
    doc.text(`Patient: ${apt.patient_name}`, 15, yPos);
    doc.text(`Status: ${apt.status}`, pageWidth - 60, yPos);
    
    yPos += 6;
    doc.text(`Scheduled: ${apt.scheduled_date}`, 15, yPos);
    
    yPos += 6;
    if (apt.caretaker_name) {
      doc.text(`Caretaker: ${apt.caretaker_name} | Phone: ${apt.caretaker_phone || 'N/A'}`, 15, yPos);
      yPos += 6;
    }
    
    doc.text(`Hospital: ${apt.hospital_name}`, 15, yPos);
    yPos += 6;
    doc.text(`Address: ${apt.hospital_address || 'N/A'}`, 15, yPos);
    yPos += 6;
    
    if (apt.doctor_name) {
      doc.text(`Doctor: ${apt.doctor_name}`, 15, yPos);
      if (apt.doctor_cabin_number) {
        doc.text(`Cabin: ${apt.doctor_cabin_number}`, 100, yPos);
      }
      yPos += 6;
    }
    
    doc.text(`Treatment: ${apt.treatment_name}`, 15, yPos);
    if (apt.total_amount) {
      doc.text(`Amount: ${apt.currency || 'USD'} ${apt.total_amount.toLocaleString()}`, pageWidth - 60, yPos);
    }
    
    yPos += 15;
  });

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  const footerText = 'MediConnect - Your trusted medical tourism partner | support@mediconnect.com';
  doc.text(footerText, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });

  return doc.output('blob');
}

export function generateAppointmentExcel(
  appointments: AppointmentData[],
  options: ExportOptions
): Blob {
  const worksheetData = appointments.map(apt => ({
    'Appointment ID': apt.appointment_id,
    'Patient Name': apt.patient_name,
    'Scheduled Date': apt.scheduled_date,
    'Caretaker Name': apt.caretaker_name || '',
    'Caretaker Phone': apt.caretaker_phone || '',
    'Hospital Name': apt.hospital_name,
    'Hospital Address': apt.hospital_address || '',
    'Doctor Name': apt.doctor_name || '',
    'Cabin Number': apt.doctor_cabin_number || '',
    'Treatment': apt.treatment_name,
    'Status': apt.status,
    'Amount': apt.total_amount || '',
    'Currency': apt.currency || 'USD',
  }));

  const worksheet = XLSX.utils.json_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  
  // Set column widths
  worksheet['!cols'] = [
    { wch: 15 }, // Appointment ID
    { wch: 20 }, // Patient Name
    { wch: 20 }, // Scheduled Date
    { wch: 20 }, // Caretaker Name
    { wch: 15 }, // Caretaker Phone
    { wch: 25 }, // Hospital Name
    { wch: 30 }, // Hospital Address
    { wch: 20 }, // Doctor Name
    { wch: 12 }, // Cabin Number
    { wch: 20 }, // Treatment
    { wch: 12 }, // Status
    { wch: 12 }, // Amount
    { wch: 8 },  // Currency
  ];

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Appointments');
  
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
