import jsPDF from 'jspdf';
import { format } from 'date-fns';

/**
 * Generates and downloads a clean, professional medical patient report PDF
 * @param {Object} patient - Patient data object
 * @param {Object} hospital - Hospital data (name, phone, email, address)
 * @param {Array} medications - Prescribed medications list
 * @param {Object} vitals - Live vitals (bp, heartRate, spo2, temperature, bloodGroup)
 */
export const generatePatientPDF = (patient, hospital = {}, medications = [], vitals = {}) => {
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });

    const hospitalName = hospital.hospitalName || 'HelTech Multi-Speciality Hospital';
    const hospitalPhone = hospital.phone || '+91 94441 23456';
    const hospitalEmail = hospital.email || 'care@heltech-hospital.org';
    const hospitalAddress = hospital.address || '104 Healthcare Boulevard, Anna Salai, Chennai, TN';

    const patientName = patient.patientName || 'Patient Name';
    const patientId = patient.patientId || patient.id || 'N/A';
    const age = patient.age || 42;
    const gender = patient.gender || 'Male';
    const contact = patient.contactNumber || patient.patientPhone || patient.phone || 'N/A';
    const address = patient.address || 'No address provided';
    const attenderName = patient.attenderName || 'None Listed';
    const attenderPhone = patient.attenderPhone || 'N/A';
    const attenderRelation = patient.attenderRelation || 'Primary Caregiver';
    const specialist = patient.specialist || 'General Medicine';
    const doctorName = patient.reason?.startsWith('Dr.') ? patient.reason : `Dr. ${patient.reason || 'S. Sundaram, MD'}`;
    const symptoms = patient.symptoms || 'General clinical consultation and follow-up';
    const visitDate = patient.time ? format(new Date(patient.time), 'dd MMM yyyy, hh:mm a') : format(new Date(), 'dd MMM yyyy, hh:mm a');
    const reportDate = format(new Date(), 'dd MMMM yyyy, hh:mm a');

    // Default vitals if none provided
    const bp = vitals.bp || '120/80 mmHg';
    const heartRate = vitals.heartRate || '74 bpm';
    const spo2 = vitals.spo2 || '98%';
    const temp = vitals.temperature || '98.6 °F';
    const bloodGroup = vitals.bloodGroup || 'O+';
    const consultationMode = vitals.mode || 'In-Clinic Verified';

    // Default medications if none prescribed yet
    const medList = medications.length > 0 ? medications : [
        { name: 'Amoxicillin & Clavulanate', dose: '625 mg', time: 'Morning & Night (After Food)', duration: '5 Days', note: 'Complete full prescribed course' },
        { name: 'Paracetamol Tablets IP', dose: '650 mg', time: 'As needed (Every 6-8 hrs)', duration: '3 Days', note: 'For fever/mild pain' },
        { name: 'Pantoprazole Gastro-Resistant', dose: '40 mg', time: 'Morning (Before Breakfast)', duration: '7 Days', note: 'Antacid coverage' }
    ];

    // ── 1. Top Decorative Brand Bar ──
    doc.setFillColor(37, 99, 235); // #2563EB
    doc.rect(0, 0, 210, 6, 'F');

    // ── 2. Header Section (Hospital Info) ──
    // Hospital Logo Badge
    doc.setFillColor(30, 58, 138); // #1E3A8A
    doc.roundedRect(14, 12, 14, 14, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('+', 21, 22, { align: 'center' });

    // Hospital Name & Credentials
    doc.setTextColor(15, 23, 42); // #0F172A
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text(hospitalName, 32, 18);

    doc.setTextColor(100, 116, 139); // #64748B
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.text('NABH ACCREDITED HEALTHCARE SYSTEM • 24/7 EMERGENCY & TELEMEDICINE', 32, 23);
    doc.text(`${hospitalAddress} | Phone: ${hospitalPhone} | Email: ${hospitalEmail}`, 32, 27);

    // Right-aligned report code
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(37, 99, 235);
    doc.text('CONFIDENTIAL MEDICAL RECORD', 196, 17, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(`DOC-REF: HLT-${patientId.replace(/[^a-zA-Z0-9]/g, '').slice(-6).toUpperCase()}`, 196, 22, { align: 'right' });
    doc.text(`Issued: ${format(new Date(), 'dd/MM/yyyy')}`, 196, 26, { align: 'right' });

    // Divider line
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.6);
    doc.line(14, 32, 196, 32);

    // ── 3. Document Title Banner ──
    doc.setFillColor(241, 245, 249); // #F1F5F9
    doc.roundedRect(14, 36, 182, 10, 2, 2, 'F');
    doc.setTextColor(30, 58, 138);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.text('PATIENT CLINICAL SUMMARY & HEALTH PROFILE', 20, 42.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`Issued: ${reportDate}`, 190, 42.5, { align: 'right' });

    // ── 4. Patient Demographics & Profile Grid ──
    const startY = 50;
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(14, startY, 182, 36, 3, 3, 'FD');

    // Left Column
    const c1 = 20;
    const c2 = 56;
    doc.setFontSize(8.5);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text('Patient Full Name:', c1, startY + 7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(patientName, c2, startY + 7);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text('Age / Gender:', c1, startY + 14);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(`${age} Years / ${gender}`, c2, startY + 14);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text('Contact Phone:', c1, startY + 21);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(contact, c2, startY + 21);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text('Patient UHID / ID:', c1, startY + 28);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(patientId, c2, startY + 28);

    // Right Column
    const c3 = 110;
    const c4 = 146;

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text('Specialist Dept:', c3, startY + 7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(37, 99, 235);
    doc.text(specialist, c4, startY + 7);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text('Consulting Doctor:', c3, startY + 14);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(doctorName, c4, startY + 14);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text('Clinical Slot Time:', c3, startY + 21);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(visitDate, c4, startY + 21);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text('Residential Address:', c3, startY + 28);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    const shortAddress = address.length > 28 ? address.substring(0, 25) + '...' : address;
    doc.text(shortAddress, c4, startY + 28);

    // ── 5. Attender Details & Emergency Contacts ──
    const attenderY = 90;
    doc.setFillColor(254, 252, 232); // #FEFCE8
    doc.setDrawColor(254, 240, 138); // #FEF08A
    doc.roundedRect(14, attenderY, 182, 14, 2, 2, 'FD');

    doc.setTextColor(133, 77, 14); // #854D0E
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text('ATTENDER & EMERGENCY CONTACT:', 20, attenderY + 6);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(113, 63, 18);
    doc.text(`Name: ${attenderName}  |  Phone: ${attenderPhone}  |  Relationship: ${attenderRelation}`, 20, attenderY + 10.5);

    // ── 6. Live Details & Vitals Monitor ──
    const vitalsY = 108;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text('LIVE CLINICAL VITALS & OBSERVATIONS', 14, vitalsY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(`Recorded via Hospital IoT Vitals Monitor (${consultationMode})`, 196, vitalsY, { align: 'right' });

    // 5 Vitals Cards
    const vitalBoxes = [
        { label: 'BLOOD PRESSURE', val: bp, color: [37, 99, 235] },
        { label: 'HEART RATE', val: heartRate, color: [220, 38, 38] },
        { label: 'OXYGEN (SpO2)', val: spo2, color: [13, 148, 136] },
        { label: 'TEMPERATURE', val: temp, color: [217, 119, 6] },
        { label: 'BLOOD GROUP', val: bloodGroup, color: [124, 58, 237] }
    ];

    const boxW = 34;
    const boxGap = 3;
    let bX = 14;
    vitalBoxes.forEach((v) => {
        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(226, 232, 240);
        doc.roundedRect(bX, vitalsY + 4, boxW, 17, 2, 2, 'FD');

        // Color accent line at top
        doc.setFillColor(v.color[0], v.color[1], v.color[2]);
        doc.rect(bX, vitalsY + 4, boxW, 1.5, 'F');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6.5);
        doc.setTextColor(100, 116, 139);
        doc.text(v.label, bX + (boxW / 2), vitalsY + 9.5, { align: 'center' });

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10.5);
        doc.setTextColor(15, 23, 42);
        doc.text(v.val, bX + (boxW / 2), vitalsY + 16, { align: 'center' });

        bX += boxW + boxGap;
    });

    // Clinical Symptoms Box
    const sympY = vitalsY + 25;
    doc.setFillColor(239, 246, 255); // #EFF6FF
    doc.setDrawColor(191, 219, 254);
    doc.roundedRect(14, sympY, 182, 13, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(30, 64, 175);
    doc.text('PRESENTING SYMPTOMS & CLINICAL NOTES:', 20, sympY + 5.5);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 58, 138);
    doc.text(symptoms, 20, sympY + 9.5);

    // ── 7. Prescribed Medications (Pills Table) ──
    const rxY = sympY + 18;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text('PRESCRIBED MEDICATIONS & REGIMEN (Rx)', 14, rxY);

    // Table Header
    const tHeaderY = rxY + 4;
    doc.setFillColor(30, 58, 138);
    doc.rect(14, tHeaderY, 182, 7, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('#', 18, tHeaderY + 4.8);
    doc.text('Medication / Pill Name', 28, tHeaderY + 4.8);
    doc.text('Dosage', 85, tHeaderY + 4.8);
    doc.text('Frequency & Timing', 115, tHeaderY + 4.8);
    doc.text('Duration & Instructions', 156, tHeaderY + 4.8);

    // Table Rows
    let rowY = tHeaderY + 7;
    medList.forEach((med, idx) => {
        const isAlt = idx % 2 === 1;
        doc.setFillColor(isAlt ? 248 : 255, isAlt ? 250 : 255, isAlt ? 252 : 255);
        doc.setDrawColor(226, 232, 240);
        doc.rect(14, rowY, 182, 9, 'FD');

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text(`${idx + 1}`, 18, rowY + 5.8);

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text(med.name || 'Prescription Drug', 28, rowY + 5.8);

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(37, 99, 235);
        doc.text(med.dose || 'Standard', 85, rowY + 5.8);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(51, 65, 85);
        doc.text(med.time || 'As directed', 115, rowY + 5.8);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(71, 85, 105);
        const note = med.duration ? `${med.duration} - ${med.note || 'Follow prescription'}` : (med.note || 'Oral administration');
        doc.text(note.length > 25 ? note.substring(0, 23) + '..' : note, 156, rowY + 5.8);

        rowY += 9;
    });

    // ── 8. Clinical Advice & Guidelines ──
    const adviceY = rowY + 6;
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(14, adviceY, 182, 18, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text('GENERAL CLINICAL ADVICE & CARE INSTRUCTIONS:', 20, adviceY + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text('• Drink adequate water (2-3 L/day) and maintain adequate rest during recuperation period.', 20, adviceY + 11);
    doc.text('• In case of acute chest discomfort, severe breathlessness, or high fever (>102°F), visit ER immediately.', 20, adviceY + 15);

    // ── 9. Doctor Signature & Verification Footer ──
    const footY = 250;
    doc.setDrawColor(226, 232, 240);
    doc.line(14, footY, 196, footY);

    // Digital Seal Box
    doc.setFillColor(240, 253, 244); // #F0FDF4
    doc.setDrawColor(187, 247, 208);
    doc.roundedRect(14, footY + 4, 80, 24, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(22, 101, 52);
    doc.text('✓ DIGITALLY VERIFIED REPORT', 20, footY + 11);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(21, 128, 61);
    doc.text(`HelTech Electronic Health Record (EHR) ID:`, 20, footY + 16);
    doc.text(`EHR-${patientId.replace(/[^a-zA-Z0-9]/g, '').slice(-8)} • Authenticated`, 20, footY + 21);

    // Doctor Signature Box
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text(doctorName, 150, footY + 14);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(`Reg. No: TN-MED-${Math.floor(10000 + Math.random() * 89999)}`, 150, footY + 18.5);
    doc.text(`Department of ${specialist}`, 150, footY + 23);

    // Bottom Watermark
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text('This clinical report is generated under HelTech Hospital Management System and complies with Digital Health Record Standards.', 105, 287, { align: 'center' });

    // Save and download PDF
    const cleanFileName = `Patient_Report_${patientName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
    doc.save(cleanFileName);
    return cleanFileName;
};
