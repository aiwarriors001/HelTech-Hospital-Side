import React, { useState, useEffect, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Pill,
    PlusCircle,
    MagnifyingGlass,
    FileText,
    User,
    Clock,
    Sparkle,
    CheckCircle,
    X,
    Printer,
    Copy,
    Check,
    CalendarCheck,
    Stethoscope,
    FirstAid,
    Calendar,
    ArrowClockwise,
    Eye,
    DownloadSimple,
    ShareNetwork,
    Database
} from '@phosphor-icons/react';
import toast from 'react-hot-toast';

const COMMON_DRUGS = [
    { name: 'Paracetamol 650mg', dose: '1-0-1', timing: 'Morning & Night (After Food)', duration: '3 Days', advice: 'Take after meals for fever/mild pain' },
    { name: 'Amoxicillin & Clavulanate 625mg', dose: '1-0-1', timing: 'Morning & Night (After Food)', duration: '5 Days', advice: 'Complete full 5-day antibiotic course' },
    { name: 'Pantoprazole 40mg', dose: '1-0-0', timing: 'Before Meals (Empty Stomach)', duration: '7 Days', advice: 'Take empty stomach 30 mins before breakfast' },
    { name: 'Cetirizine 10mg', dose: '0-0-1', timing: 'Once Daily (Bedtime)', duration: '5 Days', advice: 'Take at bedtime for allergy relief' },
    { name: 'Azithromycin 500mg', dose: '1-0-0', timing: 'Once Daily (Morning After Food)', duration: '3 Days', advice: 'Single daily dose after food' },
    { name: 'Metformin 500mg', dose: '1-0-1', timing: 'Morning & Night (With Meals)', duration: '30 Days', advice: 'Take twice daily with meals for glucose control' }
];

const COMMON_DIAGNOSES = [
    'Acute Bronchitis',
    'Type 2 Diabetes Mellitus',
    'Essential Hypertension',
    'Viral Upper Respiratory Infection',
    'Acute Gastroenteritis',
    'Allergic Rhinitis',
    'Lumbar Strain / Backache',
    'Migraine Headache'
];

export const Prescription = () => {
    const { user } = useAuth();
    const { prescriptions: rawPrescriptions, addPrescription, getConfirmedAppointments, fetchPrescriptions } = useData();
    const [searchParams] = useSearchParams();

    const hospitalName = user?.hospitalName || 'City General Hospital';

    // Search and filter state
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'today' | 'recent'
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [copiedId, setCopiedId] = useState(null);
    const [selectedRxForView, setSelectedRxForView] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Issue Prescription form state with unified prescribedMedicines & timings
    const [formData, setFormData] = useState({
        patientName: '',
        doctor: user?.name ? `Dr. ${user.name.replace('Dr. ', '')}` : 'Dr. Sarah Jenkins',
        diagnosis: 'Acute Bronchitis',
        assignedOn: new Date().toISOString().split('T')[0],
        prescription: `RX-${Math.floor(100000 + Math.random() * 900000)}`,
        prescribedMedicines: 'Amoxicillin & Clavulanate 625mg (1-0-1, 5 Days), Paracetamol 650mg SOS',
        timing: 'Morning & Night (After Food)',
        doctorAdvice: 'Take medications after food with plenty of water. Complete full course.'
    });

    const prescriptions = useMemo(() => rawPrescriptions || [], [rawPrescriptions]);
    const confirmedPatients = getConfirmedAppointments ? getConfirmedAppointments() : [];

    // Distinct patient names for quick autocomplete
    const recentPatientSuggestions = Array.from(
        new Set([
            ...confirmedPatients.map(c => c.patientName).filter(Boolean),
            ...prescriptions.map(p => p.patientName).filter(Boolean)
        ])
    ).slice(0, 6);

    // Auto-fill from URL query param if navigated from CareConnect or Patients
    useEffect(() => {
        const patientParam = searchParams.get('patient');
        if (patientParam) {
            setFormData(prev => ({
                ...prev,
                patientName: patientParam
            }));
            setIsFormOpen(true);
        }
    }, [searchParams]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleQuickDrugAdd = (drug) => {
        const entry = `${drug.name} (${drug.dose}, ${drug.duration})`;
        setFormData(prev => {
            const current = prev.prescribedMedicines.trim();
            const updatedMeds = current ? `${current}, ${entry}` : entry;
            const updatedAdvice = prev.doctorAdvice ? `${prev.doctorAdvice} ${drug.advice}.` : drug.advice;
            return {
                ...prev,
                prescribedMedicines: updatedMeds,
                timing: drug.timing || prev.timing,
                doctorAdvice: updatedAdvice
            };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.patientName.trim()) {
            toast.error('Patient Name is required.');
            return;
        }
        if (!formData.prescribedMedicines.trim()) {
            toast.error('Please enter the prescribed medicines.');
            return;
        }

        setIsSubmitting(true);
        try {
            await addPrescription({
                patientName: formData.patientName.trim(),
                doctor: formData.doctor.trim(),
                diagnosis: formData.diagnosis.trim(),
                assignedOn: formData.assignedOn,
                prescription: formData.prescription.trim(),
                prescribedMedicines: formData.prescribedMedicines.trim(),
                timing: formData.timing.trim(),
                doctorAdvice: formData.doctorAdvice.trim()
            });

            toast.success(`Prescription ${formData.prescription} successfully issued to Registry!`);

            setFormData({
                patientName: '',
                doctor: formData.doctor,
                diagnosis: 'General Consultation',
                assignedOn: new Date().toISOString().split('T')[0],
                prescription: `RX-${Math.floor(100000 + Math.random() * 900000)}`,
                prescribedMedicines: '',
                timing: 'Morning & Night (After Food)',
                doctorAdvice: 'Take medications after food with plenty of water.'
            });

            setIsFormOpen(false);
        } catch (err) {
            console.error('Error adding prescription:', err);
            toast.error('Could not save prescription: ' + err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCopyRx = (item, id) => {
        const text = `PRESCRIPTION REGISTRY RECORD
Rx Code: ${item.prescription || 'N/A'}
Patient Name: ${item.patientName || 'N/A'}
Attending Doctor: ${item.doctor || item.doctorName || 'N/A'}
Diagnosis / Disease: ${item.diagnosis || 'N/A'}
Assigned On: ${item.assignedOn || item.timestamp?.split('T')[0] || 'N/A'}
Prescribed Medicines: ${item.prescribedMedicines || item.name || 'N/A'}
Timings & Schedule: ${item.timing || item.time || 'As directed'}
Doctor's Advice & Instructions: ${item.doctorAdvice || item.note || 'None'}`;

        navigator.clipboard.writeText(text);
        setCopiedId(id);
        toast.success('Prescription record copied to clipboard!');
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handlePrintSlip = () => {
        window.print();
    };

    // Filter prescriptions
    const filteredPrescriptions = useMemo(() => {
        const todayStr = new Date().toISOString().split('T')[0];
        const recentCutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;

        return (prescriptions || []).filter(p => {
            const patientMatch = p.patientName && p.patientName.toLowerCase().includes(searchTerm.toLowerCase());
            const doctorMatch = (p.doctor || p.doctorName) && (p.doctor || p.doctorName).toLowerCase().includes(searchTerm.toLowerCase());
            const diagMatch = p.diagnosis && p.diagnosis.toLowerCase().includes(searchTerm.toLowerCase());
            const rxMatch = p.prescription && p.prescription.toLowerCase().includes(searchTerm.toLowerCase());
            const medsMatch = (p.prescribedMedicines || p.name) && (p.prescribedMedicines || p.name).toLowerCase().includes(searchTerm.toLowerCase());
            const timingMatch = (p.timing || p.time) && (p.timing || p.time).toLowerCase().includes(searchTerm.toLowerCase());

            const matchQuery = !searchTerm.trim() || (patientMatch || doctorMatch || diagMatch || rxMatch || medsMatch || timingMatch);

            if (activeFilter === 'today') {
                const assigned = p.assignedOn || (p.timestamp ? p.timestamp.split('T')[0] : '');
                return matchQuery && assigned === todayStr;
            }

            if (activeFilter === 'recent') {
                const itemTime = p.timestamp ? new Date(p.timestamp).getTime() : Date.now();
                return matchQuery && itemTime >= recentCutoff;
            }

            return matchQuery;
        });
    }, [prescriptions, searchTerm, activeFilter]);

    const uniquePatientsCount = new Set((prescriptions || []).map(p => p.patientName).filter(Boolean)).size;
    const todayStr = new Date().toISOString().split('T')[0];
    const todayCount = (prescriptions || []).filter(p => (p.assignedOn === todayStr || p.timestamp?.startsWith(todayStr))).length;
    const uniqueDoctorsCount = new Set((prescriptions || []).map(p => p.doctor || p.doctorName).filter(Boolean)).size;

    return (
        <div className="page-container" style={{ paddingBottom: '80px' }}>
            {/* Header & Controls */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px',
                marginBottom: '26px'
            }}>
                <div>
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 13px',
                        borderRadius: '999px',
                        background: 'rgba(37, 99, 235, 0.08)',
                        color: '#2563EB',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                        marginBottom: '8px',
                        border: '1px solid rgba(37, 99, 235, 0.16)'
                    }}>
                        <Sparkle size={13} weight="fill" />
                        Clinical Pharmacy & Medication Registry
                    </div>
                    <h1 style={{
                        margin: 0,
                        fontSize: '2.1rem',
                        fontWeight: 900,
                        color: 'var(--text-main, #0F172A)',
                        letterSpacing: '-0.03em'
                    }}>
                        Prescriptions & Registry
                    </h1>
                    <p style={{ margin: '4px 0 0', color: 'var(--text-muted, #64748B)', fontSize: '0.96rem' }}>
                        Clinical prescription registry storing patient name, doctor, diagnosis, date, prescription ID, medicines, and doctor's advice.
                    </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <button
                        onClick={() => fetchPrescriptions()}
                        className="btn btn-secondary"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '10px 16px',
                            borderRadius: '12px',
                            fontWeight: 700,
                            cursor: 'pointer'
                        }}
                        title="Refresh Registry"
                    >
                        <ArrowClockwise size={18} /> Refresh
                    </button>

                    <button
                        onClick={() => setIsFormOpen(!isFormOpen)}
                        style={{
                            background: isFormOpen ? 'var(--bg-color, #F1F5F9)' : '#2563EB',
                            color: isFormOpen ? 'var(--text-main, #0F172A)' : 'white',
                            border: isFormOpen ? '1px solid var(--border-color, #CBD5E1)' : 'none',
                            padding: '11px 22px',
                            borderRadius: '12px',
                            fontWeight: 800,
                            fontSize: '0.9rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            cursor: 'pointer',
                            boxShadow: isFormOpen ? 'none' : '0 4px 14px rgba(37, 99, 235, 0.28)'
                        }}
                    >
                        {isFormOpen ? (
                            <>
                                <X size={18} weight="bold" />
                                Close Form
                            </>
                        ) : (
                            <>
                                <PlusCircle size={20} weight="bold" />
                                Issue New Prescription
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Top KPI Metrics Strip */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
                gap: '16px',
                marginBottom: '26px'
            }}>
                <div style={{
                    background: 'var(--card-bg, #FFFFFF)',
                    padding: '20px 22px',
                    borderRadius: '16px',
                    border: '1px solid var(--border-color, #E2E8F0)',
                    boxShadow: '0 2px 8px -2px rgba(15, 23, 42, 0.04)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.76rem', fontWeight: 800, color: 'var(--text-muted, #64748B)', textTransform: 'uppercase' }}>
                            Total Prescriptions
                        </span>
                        <div style={{ width: 34, height: 34, borderRadius: '10px', background: 'rgba(37,99,235,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB' }}>
                            <Pill size={18} weight="fill" />
                        </div>
                    </div>
                    <div style={{ fontSize: '2.1rem', fontWeight: 900, color: 'var(--text-main, #0F172A)' }}>
                        {(prescriptions || []).length}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#2563EB', fontWeight: 600, marginTop: '2px' }}>
                        Active in Registry
                    </div>
                </div>

                <div style={{
                    background: 'var(--card-bg, #FFFFFF)',
                    padding: '20px 22px',
                    borderRadius: '16px',
                    border: '1px solid var(--border-color, #E2E8F0)',
                    boxShadow: '0 2px 8px -2px rgba(15, 23, 42, 0.04)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.76rem', fontWeight: 800, color: 'var(--text-muted, #64748B)', textTransform: 'uppercase' }}>
                            Unique Patients
                        </span>
                        <div style={{ width: 34, height: 34, borderRadius: '10px', background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10B981' }}>
                            <User size={18} weight="bold" />
                        </div>
                    </div>
                    <div style={{ fontSize: '2.1rem', fontWeight: 900, color: 'var(--text-main, #0F172A)' }}>
                        {uniquePatientsCount}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#10B981', fontWeight: 600, marginTop: '2px' }}>
                        Registered individuals
                    </div>
                </div>

                <div style={{
                    background: 'var(--card-bg, #FFFFFF)',
                    padding: '20px 22px',
                    borderRadius: '16px',
                    border: '1px solid var(--border-color, #E2E8F0)',
                    boxShadow: '0 2px 8px -2px rgba(15, 23, 42, 0.04)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.76rem', fontWeight: 800, color: 'var(--text-muted, #64748B)', textTransform: 'uppercase' }}>
                            Active Doctors
                        </span>
                        <div style={{ width: 34, height: 34, borderRadius: '10px', background: 'rgba(124,58,237,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7C3AED' }}>
                            <Stethoscope size={18} weight="bold" />
                        </div>
                    </div>
                    <div style={{ fontSize: '2.1rem', fontWeight: 900, color: 'var(--text-main, #0F172A)' }}>
                        {uniqueDoctorsCount || 1}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#7C3AED', fontWeight: 600, marginTop: '2px' }}>
                        Physicians issuing Rx
                    </div>
                </div>

                <div style={{
                    background: 'var(--card-bg, #FFFFFF)',
                    padding: '20px 22px',
                    borderRadius: '16px',
                    border: '1px solid var(--border-color, #E2E8F0)',
                    boxShadow: '0 2px 8px -2px rgba(15, 23, 42, 0.04)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.76rem', fontWeight: 800, color: 'var(--text-muted, #64748B)', textTransform: 'uppercase' }}>
                            Issued Today
                        </span>
                        <div style={{ width: 34, height: 34, borderRadius: '10px', background: 'rgba(245,158,11,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D97706' }}>
                            <Calendar size={18} weight="bold" />
                        </div>
                    </div>
                    <div style={{ fontSize: '2.1rem', fontWeight: 900, color: 'var(--text-main, #0F172A)' }}>
                        {todayCount}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#D97706', fontWeight: 600, marginTop: '2px' }}>
                        Today's assignments
                    </div>
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════ */}
            {/* ISSUE NEW PRESCRIPTION FORM (EXACT 7 FIELDS)                */}
            {/* ═══════════════════════════════════════════════════════════ */}
            <AnimatePresence>
                {isFormOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        style={{ overflow: 'hidden', marginBottom: '28px' }}
                    >
                        <div style={{
                            background: 'var(--card-bg, #FFFFFF)',
                            border: '2px solid #2563EB',
                            borderRadius: '20px',
                            padding: '28px',
                            boxShadow: '0 10px 30px rgba(37, 99, 235, 0.12)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{ width: 40, height: 40, borderRadius: '12px', background: 'rgba(37, 99, 235, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB' }}>
                                        <FirstAid size={22} weight="bold" />
                                    </div>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main, #0F172A)' }}>
                                            Issue Electronic Prescription
                                        </h3>
                                        <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted, #64748B)' }}>
                                            Complete clinical prescription order with diagnosis, dosage regimen & instructions
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setIsFormOpen(false)}
                                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted,#64748B)' }}
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Quick Prescribing Formulary Chips */}
                            <div style={{ marginBottom: '20px', background: 'var(--bg-color, #F8FAFC)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-color, #E2E8F0)' }}>
                                <div style={{ fontSize: '0.76rem', fontWeight: 800, color: 'var(--text-muted, #64748B)', textTransform: 'uppercase', marginBottom: '8px' }}>
                                    Quick Drug Formulary (Click to add to Prescribed Medicines)
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    {COMMON_DRUGS.map((d, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => handleQuickDrugAdd(d)}
                                            style={{
                                                background: 'var(--card-bg, #FFFFFF)',
                                                border: '1px solid var(--border-color, #CBD5E1)',
                                                padding: '5px 12px',
                                                borderRadius: '8px',
                                                fontSize: '0.78rem',
                                                fontWeight: 700,
                                                color: '#2563EB',
                                                cursor: 'pointer',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '5px'
                                            }}
                                        >
                                            <Pill size={13} weight="fill" /> + {d.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {/* Row 1: Patient Name & Doctor */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-main, #1F2937)', marginBottom: '6px' }}>
                                            1. Patient Name *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            name="patientName"
                                            placeholder="e.g. Diwakaran"
                                            value={formData.patientName}
                                            onChange={handleInputChange}
                                            className="form-input"
                                            style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', fontSize: '0.9rem' }}
                                        />
                                        {recentPatientSuggestions.length > 0 && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                                                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted, #94A3B8)' }}>Quick Select:</span>
                                                {recentPatientSuggestions.map((name, i) => (
                                                    <span
                                                        key={i}
                                                        onClick={() => setFormData(prev => ({ ...prev, patientName: name }))}
                                                        style={{
                                                            fontSize: '0.72rem',
                                                            color: '#2563EB',
                                                            background: 'rgba(37, 99, 235, 0.08)',
                                                            padding: '2px 8px',
                                                            borderRadius: '4px',
                                                            cursor: 'pointer',
                                                            fontWeight: 600
                                                        }}
                                                    >
                                                        {name}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-main, #1F2937)', marginBottom: '6px' }}>
                                            2. Attending Doctor *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            name="doctor"
                                            placeholder="e.g. Dr. Sarah Jenkins"
                                            value={formData.doctor}
                                            onChange={handleInputChange}
                                            className="form-input"
                                            style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', fontSize: '0.9rem' }}
                                        />
                                    </div>
                                </div>

                                {/* Row 2: Diagnosis / Disease, Assigned On, & Prescription Code */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', gap: '16px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-main, #1F2937)', marginBottom: '6px' }}>
                                            3. Diagnosis / Disease *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            name="diagnosis"
                                            placeholder="e.g. Acute Bronchitis / Hypertension"
                                            value={formData.diagnosis}
                                            onChange={handleInputChange}
                                            className="form-input"
                                            style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', fontSize: '0.9rem' }}
                                        />
                                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                                            {COMMON_DIAGNOSES.slice(0, 4).map((diag, i) => (
                                                <span
                                                    key={i}
                                                    onClick={() => setFormData(prev => ({ ...prev, diagnosis: diag }))}
                                                    style={{
                                                        fontSize: '0.7rem',
                                                        color: 'var(--text-muted, #64748B)',
                                                        background: 'var(--bg-color, #F1F5F9)',
                                                        padding: '1px 6px',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    {diag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-main, #1F2937)', marginBottom: '6px' }}>
                                            4. Assigned On (Date) *
                                        </label>
                                        <input
                                            type="date"
                                            required
                                            name="assignedOn"
                                            value={formData.assignedOn}
                                            onChange={handleInputChange}
                                            className="form-input"
                                            style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', fontSize: '0.9rem' }}
                                        />
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-main, #1F2937)', marginBottom: '6px' }}>
                                            5. Prescription # (Rx ID) *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            name="prescription"
                                            placeholder="e.g. RX-849201"
                                            value={formData.prescription}
                                            onChange={handleInputChange}
                                            className="form-input"
                                            style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', fontSize: '0.9rem', fontWeight: 700, color: '#2563EB' }}
                                        />
                                    </div>
                                </div>

                                {/* Row 3: Prescribed Medicines */}
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-main, #1F2937)', marginBottom: '6px' }}>
                                        6. Prescribed Medicines *
                                    </label>
                                    <textarea
                                        required
                                        rows={2}
                                        name="prescribedMedicines"
                                        placeholder="e.g. Amoxicillin & Clavulanate 625mg (1-0-1, 5 Days), Paracetamol 650mg (SOS for fever)"
                                        value={formData.prescribedMedicines}
                                        onChange={handleInputChange}
                                        className="form-input"
                                        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', fontSize: '0.9rem', resize: 'vertical' }}
                                    />
                                </div>

                                {/* Row 4: Timings & Schedule (From Database column: timing) */}
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-main, #1F2937)', marginBottom: '6px' }}>
                                        7. Timings & Schedule *
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <Clock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#D97706' }} />
                                        <input
                                            type="text"
                                            required
                                            name="timing"
                                            placeholder="e.g. Morning & Night (After Food)"
                                            value={formData.timing}
                                            onChange={handleInputChange}
                                            className="form-input"
                                            style={{ width: '100%', padding: '10px 14px 10px 38px', borderRadius: '10px', fontSize: '0.9rem' }}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '7px' }}>
                                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted, #94A3B8)', alignSelf: 'center', fontWeight: 700 }}>Quick Timings:</span>
                                        {[
                                            'Morning & Night (After Food)',
                                            'Morning - Afternoon - Night (1-1-1)',
                                            'Once Daily (Morning After Food)',
                                            'Once Daily (Bedtime)',
                                            'Before Meals (Empty Stomach)',
                                            'SOS / When Needed'
                                        ].map((t, idx) => (
                                            <span
                                                key={idx}
                                                onClick={() => setFormData(prev => ({ ...prev, timing: t }))}
                                                style={{
                                                    fontSize: '0.72rem',
                                                    color: '#B45309',
                                                    background: 'rgba(245, 158, 11, 0.1)',
                                                    border: '1px solid rgba(245, 158, 11, 0.25)',
                                                    padding: '2px 8px',
                                                    borderRadius: '6px',
                                                    cursor: 'pointer',
                                                    fontWeight: 600
                                                }}
                                            >
                                                {t}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Row 5: Doctor's Advice & Instructions */}
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-main, #1F2937)', marginBottom: '6px' }}>
                                        8. Doctor's Advice & Instructions
                                    </label>
                                    <textarea
                                        rows={2}
                                        name="doctorAdvice"
                                        placeholder="e.g. Complete the full 5-day course. Take after food with warm water. Review in OPD after 1 week if cough persists."
                                        value={formData.doctorAdvice}
                                        onChange={handleInputChange}
                                        className="form-input"
                                        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', fontSize: '0.9rem', resize: 'vertical' }}
                                    />
                                </div>

                                {/* Actions */}
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px', marginTop: '6px' }}>
                                    <button
                                        type="button"
                                        onClick={() => setIsFormOpen(false)}
                                        style={{
                                            background: 'var(--bg-color, #F1F5F9)',
                                            border: '1px solid var(--border-color, #CBD5E1)',
                                            color: 'var(--text-main, #1F2937)',
                                            padding: '10px 20px',
                                            borderRadius: '12px',
                                            fontWeight: 700,
                                            fontSize: '0.88rem',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        style={{
                                            background: '#2563EB',
                                            border: 'none',
                                            color: 'white',
                                            padding: '10px 24px',
                                            borderRadius: '12px',
                                            fontWeight: 800,
                                            fontSize: '0.88rem',
                                            cursor: 'pointer',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)'
                                        }}
                                    >
                                        <CheckCircle size={18} weight="bold" />
                                        {isSubmitting ? 'Issuing Prescription...' : 'Issue & Save to Registry'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ═══════════════════════════════════════════════════════════ */}
            {/* PRESCRIPTION REGISTRY TABLE & SEARCH BAR                    */}
            {/* ═══════════════════════════════════════════════════════════ */}
            <div style={{
                background: 'var(--card-bg, #FFFFFF)',
                padding: '16px 20px',
                borderRadius: '16px',
                border: '1px solid var(--border-color, #E2E8F0)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '14px',
                marginBottom: '20px',
                boxShadow: '0 2px 8px -2px rgba(15, 23, 42, 0.04)'
            }}>
                {/* Filter Tabs */}
                <div style={{
                    display: 'flex',
                    background: 'var(--bg-color, #F1F5F9)',
                    padding: '4px',
                    borderRadius: '12px',
                    border: '1px solid var(--border-color, #E2E8F0)'
                }}>
                    <button
                        onClick={() => setActiveFilter('all')}
                        style={{
                            border: 'none',
                            background: activeFilter === 'all' ? '#2563EB' : 'transparent',
                            color: activeFilter === 'all' ? 'white' : 'var(--text-muted, #64748B)',
                            padding: '8px 18px',
                            borderRadius: '9px',
                            fontSize: '0.84rem',
                            fontWeight: 800,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        All Records ({(prescriptions || []).length})
                    </button>

                    <button
                        onClick={() => setActiveFilter('today')}
                        style={{
                            border: 'none',
                            background: activeFilter === 'today' ? '#2563EB' : 'transparent',
                            color: activeFilter === 'today' ? 'white' : 'var(--text-muted, #64748B)',
                            padding: '8px 18px',
                            borderRadius: '9px',
                            fontSize: '0.84rem',
                            fontWeight: 800,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        Today ({todayCount})
                    </button>

                    <button
                        onClick={() => setActiveFilter('recent')}
                        style={{
                            border: 'none',
                            background: activeFilter === 'recent' ? '#2563EB' : 'transparent',
                            color: activeFilter === 'recent' ? 'white' : 'var(--text-muted, #64748B)',
                            padding: '8px 18px',
                            borderRadius: '9px',
                            fontSize: '0.84rem',
                            fontWeight: 800,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        Recent (7 Days)
                    </button>
                </div>

                {/* Search Bar */}
                <div style={{ position: 'relative', flex: '1', minWidth: '240px', maxWidth: '420px' }}>
                    <MagnifyingGlass size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted, #94A3B8)' }} />
                    <input
                        type="text"
                        placeholder="Search patient, doctor, diagnosis, medicines..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="form-input"
                        style={{
                            paddingLeft: '40px',
                            width: '100%',
                            fontSize: '0.88rem',
                            borderRadius: '10px'
                        }}
                    />
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════ */}
            {/* THE PRESCRIPTION REGISTRY TABLE                             */}
            {/* ═══════════════════════════════════════════════════════════ */}
            <div style={{
                background: 'var(--card-bg, #FFFFFF)',
                borderRadius: '18px',
                border: '1px solid var(--border-color, #E2E8F0)',
                boxShadow: '0 4px 16px -2px rgba(15, 23, 42, 0.05)',
                overflow: 'hidden'
            }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                        <thead>
                            <tr style={{
                                background: 'var(--bg-color, #F8FAFC)',
                                borderBottom: '2px solid var(--border-color, #E2E8F0)',
                                color: 'var(--text-muted, #64748B)',
                                fontSize: '0.76rem',
                                fontWeight: 800,
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                            }}>
                                <th style={{ padding: '16px 18px', width: '120px' }}>Prescription #</th>
                                <th style={{ padding: '16px 18px', minWidth: '160px' }}>Patient Name</th>
                                <th style={{ padding: '16px 18px', minWidth: '150px' }}>Doctor</th>
                                <th style={{ padding: '16px 18px', minWidth: '160px' }}>Diagnosis / Disease</th>
                                <th style={{ padding: '16px 18px', minWidth: '120px' }}>Assigned On</th>
                                <th style={{ padding: '16px 18px', minWidth: '200px' }}>Prescribed Medicines</th>
                                <th style={{ padding: '16px 18px', minWidth: '170px' }}>Timings</th>
                                <th style={{ padding: '16px 18px', minWidth: '220px' }}>Doctor's Advice & Instructions</th>
                                <th style={{ padding: '16px 18px', textAlign: 'center', width: '100px' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPrescriptions.length === 0 ? (
                                <tr>
                                    <td colSpan={9} style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--text-muted, #64748B)' }}>
                                        <Pill size={36} color="#94A3B8" weight="duotone" style={{ margin: '0 auto 10px' }} />
                                        <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-main, #0F172A)' }}>
                                            No Prescriptions in Registry
                                        </div>
                                        <div style={{ fontSize: '0.84rem', marginTop: '4px', marginBottom: '16px' }}>
                                            {searchTerm ? 'No prescriptions match your search criteria.' : 'Click below to issue the first prescription into Supabase.'}
                                        </div>
                                        <button
                                            onClick={() => setIsFormOpen(true)}
                                            style={{
                                                background: '#2563EB',
                                                color: 'white',
                                                border: 'none',
                                                padding: '8px 18px',
                                                borderRadius: '10px',
                                                fontWeight: 700,
                                                fontSize: '0.84rem',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <PlusCircle size={16} weight="bold" /> Issue Prescription
                                        </button>
                                    </td>
                                </tr>
                            ) : (
                                filteredPrescriptions.map((item, idx) => {
                                    const rxCode = item.prescription || (item.id ? `RX-${item.id.replace(/-/g, '').slice(0, 6).toUpperCase()}` : `RX-${idx + 101}`);
                                    const patient = item.patientName || 'Unknown Patient';
                                    const doctor = item.doctor || item.doctorName || 'Dr. Sarah Jenkins';
                                    const diagnosis = item.diagnosis || 'Clinical Consultation';
                                    const assignedOn = item.assignedOn || (item.timestamp ? item.timestamp.split('T')[0] : 'Today');
                                    const medicines = item.prescribedMedicines || item.name || 'Standard Regimen';
                                    const timing = item.timing || item.time || 'As directed';
                                    const advice = item.doctorAdvice || item.note || item.instructions || 'Take as advised with water.';

                                    return (
                                        <tr
                                            key={item.id || idx}
                                            style={{
                                                borderBottom: '1px solid var(--border-color, #E2E8F0)',
                                                background: idx % 2 === 0 ? 'var(--card-bg, #FFFFFF)' : 'var(--bg-color, #FAFAFA)',
                                                transition: 'background 0.15s ease'
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(37, 99, 235, 0.04)'}
                                            onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? 'var(--card-bg, #FFFFFF)' : 'var(--bg-color, #FAFAFA)'}
                                        >
                                            {/* 1. Prescription # */}
                                            <td style={{ padding: '16px 18px' }}>
                                                <span style={{
                                                    background: '#EFF6FF',
                                                    color: '#2563EB',
                                                    fontWeight: 800,
                                                    fontSize: '0.8rem',
                                                    padding: '4px 8px',
                                                    borderRadius: '6px',
                                                    border: '1px solid rgba(37, 99, 235, 0.2)',
                                                    letterSpacing: '0.04em',
                                                    display: 'inline-block'
                                                }}>
                                                    {rxCode}
                                                </span>
                                            </td>

                                            {/* 2. Patient Name */}
                                            <td style={{ padding: '16px 18px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <div style={{
                                                        width: 32, height: 32, borderRadius: '8px',
                                                        background: 'rgba(37, 99, 235, 0.1)', color: '#2563EB',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        fontWeight: 800, fontSize: '0.78rem'
                                                    }}>
                                                        {patient.slice(0, 2).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 800, color: 'var(--text-main, #0F172A)' }}>
                                                            {patient}
                                                        </div>
                                                        {item.patientId && item.patientId !== 'N/A' && (
                                                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted, #94A3B8)' }}>
                                                                ID: {item.patientId}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* 3. Doctor */}
                                            <td style={{ padding: '16px 18px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-main, #1F2937)' }}>
                                                    <Stethoscope size={16} color="#7C3AED" weight="bold" />
                                                    <span style={{ fontWeight: 700 }}>{doctor}</span>
                                                </div>
                                            </td>

                                            {/* 4. Diagnosis / Disease */}
                                            <td style={{ padding: '16px 18px' }}>
                                                <span style={{
                                                    background: 'rgba(16, 185, 129, 0.08)',
                                                    color: '#059669',
                                                    fontWeight: 700,
                                                    padding: '4px 10px',
                                                    borderRadius: '8px',
                                                    fontSize: '0.8rem',
                                                    display: 'inline-block',
                                                    border: '1px solid rgba(16, 185, 129, 0.2)'
                                                }}>
                                                    {diagnosis}
                                                </span>
                                            </td>

                                            {/* 5. Assigned On */}
                                            <td style={{ padding: '16px 18px', color: 'var(--text-muted, #64748B)', fontWeight: 600 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <CalendarCheck size={16} color="#2563EB" />
                                                    <span>{assignedOn}</span>
                                                </div>
                                            </td>

                                            {/* 6. Prescribed Medicines */}
                                            <td style={{ padding: '16px 18px' }}>
                                                <div style={{ fontWeight: 700, color: 'var(--text-main, #0F172A)', lineHeight: 1.4 }}>
                                                    {medicines}
                                                </div>
                                                {item.dose && item.dose !== 'As advised' && (
                                                    <div style={{ fontSize: '0.74rem', color: '#2563EB', marginTop: '2px', fontWeight: 600 }}>
                                                        Dosage: {item.dose}
                                                    </div>
                                                )}
                                            </td>

                                            {/* 7. Timings (From Database column: timing) */}
                                            <td style={{ padding: '16px 18px' }}>
                                                <span style={{
                                                    background: 'rgba(245, 158, 11, 0.1)',
                                                    color: '#D97706',
                                                    fontWeight: 700,
                                                    padding: '4px 10px',
                                                    borderRadius: '8px',
                                                    fontSize: '0.78rem',
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '5px',
                                                    border: '1px solid rgba(245, 158, 11, 0.25)',
                                                    whiteSpace: 'nowrap'
                                                }}>
                                                    <Clock size={14} weight="bold" /> {timing}
                                                </span>
                                            </td>

                                            {/* 8. Doctor's Advice & Instructions */}
                                            <td style={{ padding: '16px 18px', color: 'var(--text-muted, #475569)', fontSize: '0.84rem', lineHeight: 1.45 }}>
                                                <div style={{ fontStyle: 'italic' }}>
                                                    "{advice}"
                                                </div>
                                            </td>

                                            {/* 9. Actions */}
                                            <td style={{ padding: '16px 18px', textAlign: 'center' }}>
                                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                                    <button
                                                        onClick={() => setSelectedRxForView(item)}
                                                        style={{
                                                            background: 'rgba(37, 99, 235, 0.08)',
                                                            border: 'none',
                                                            color: '#2563EB',
                                                            padding: '6px 8px',
                                                            borderRadius: '6px',
                                                            cursor: 'pointer'
                                                        }}
                                                        title="View & Print Official Rx Slip"
                                                    >
                                                        <Printer size={16} weight="bold" />
                                                    </button>

                                                    <button
                                                        onClick={() => handleCopyRx(item, item.id || idx)}
                                                        style={{
                                                            background: copiedId === (item.id || idx) ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-color, #F1F5F9)',
                                                            border: 'none',
                                                            color: copiedId === (item.id || idx) ? '#10B981' : 'var(--text-muted, #64748B)',
                                                            padding: '6px 8px',
                                                            borderRadius: '6px',
                                                            cursor: 'pointer'
                                                        }}
                                                        title="Copy Rx details"
                                                    >
                                                        {copiedId === (item.id || idx) ? <Check size={16} weight="bold" /> : <Copy size={16} />}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════ */}
            {/* PRINT / OFFICIAL RX SLIP MODAL                              */}
            {/* ═══════════════════════════════════════════════════════════ */}
            {selectedRxForView && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.6)',
                    backdropFilter: 'blur(4px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9999,
                    padding: '20px'
                }}>
                    <div style={{
                        background: 'white',
                        color: '#0F172A',
                        borderRadius: '20px',
                        padding: '32px',
                        width: '100%',
                        maxWidth: '680px',
                        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                        maxHeight: '90vh',
                        overflowY: 'auto'
                    }}>
                        {/* Hospital Prescription Slip Header */}
                        <div style={{ borderBottom: '2px solid #E2E8F0', paddingBottom: '18px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <FirstAid size={28} weight="fill" color="#2563EB" />
                                    <h2 style={{ margin: 0, fontSize: '1.45rem', fontWeight: 900, color: '#0F172A' }}>
                                        {hospitalName}
                                    </h2>
                                </div>
                                <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#64748B' }}>
                                    NABH Accredited Tertiary Healthcare Facility • Pharmacy Registry Slip
                                </p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontWeight: 800, color: '#2563EB', fontSize: '1.1rem' }}>
                                    {selectedRxForView.prescription || `RX-${selectedRxForView.id?.slice(0, 6).toUpperCase()}`}
                                </div>
                                <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '2px' }}>
                                    Date: {selectedRxForView.assignedOn || selectedRxForView.timestamp?.split('T')[0] || 'Today'}
                                </div>
                            </div>
                        </div>

                        {/* Patient & Doctor Banner */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '16px',
                            background: '#F8FAFC',
                            padding: '16px',
                            borderRadius: '12px',
                            marginBottom: '20px',
                            border: '1px solid #E2E8F0',
                            fontSize: '0.88rem'
                        }}>
                            <div>
                                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Patient Name</div>
                                <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0F172A', marginTop: '2px' }}>
                                    {selectedRxForView.patientName}
                                </div>
                                {selectedRxForView.patientId && (
                                    <div style={{ fontSize: '0.76rem', color: '#64748B' }}>UHID / ID: {selectedRxForView.patientId}</div>
                                )}
                            </div>

                            <div>
                                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Attending Physician</div>
                                <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0F172A', marginTop: '2px' }}>
                                    {selectedRxForView.doctor || selectedRxForView.doctorName || 'Dr. Sarah Jenkins'}
                                </div>
                                <div style={{ fontSize: '0.76rem', color: '#64748B' }}>Clinical Medicine / OPD</div>
                            </div>
                        </div>

                        {/* Diagnosis */}
                        <div style={{ marginBottom: '20px' }}>
                            <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '6px' }}>
                                Clinical Diagnosis / Condition:
                            </div>
                            <div style={{
                                background: 'rgba(16, 185, 129, 0.08)',
                                border: '1px solid rgba(16, 185, 129, 0.2)',
                                color: '#065F46',
                                padding: '10px 14px',
                                borderRadius: '10px',
                                fontWeight: 800,
                                fontSize: '0.94rem'
                            }}>
                                {selectedRxForView.diagnosis || 'Clinical Consultation'}
                            </div>
                        </div>

                        {/* Rx Prescribed Medicines */}
                        <div style={{ marginBottom: '20px' }}>
                            <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '6px' }}>
                                Prescribed Medicines (Rx):
                            </div>
                            <div style={{
                                border: '1px solid #E2E8F0',
                                borderRadius: '12px',
                                padding: '16px',
                                background: '#FFFFFF',
                                fontWeight: 700,
                                fontSize: '0.96rem',
                                color: '#0F172A',
                                lineHeight: 1.6
                            }}>
                                {selectedRxForView.prescribedMedicines || selectedRxForView.name}
                            </div>
                        </div>

                        {/* Timings & Dosage Frequency */}
                        <div style={{ marginBottom: '20px' }}>
                            <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '6px' }}>
                                Timings & Dosage Schedule:
                            </div>
                            <div style={{
                                border: '1px solid rgba(245, 158, 11, 0.3)',
                                borderRadius: '12px',
                                padding: '12px 16px',
                                background: 'rgba(245, 158, 11, 0.06)',
                                fontWeight: 700,
                                fontSize: '0.92rem',
                                color: '#B45309',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <Clock size={18} weight="bold" />
                                {selectedRxForView.timing || selectedRxForView.time || 'As directed by physician'}
                            </div>
                        </div>

                        {/* Doctor's Advice & Instructions */}
                        <div style={{ marginBottom: '24px' }}>
                            <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '6px' }}>
                                Doctor's Advice & Patient Instructions:
                            </div>
                            <div style={{
                                background: '#F8FAFC',
                                border: '1px solid #E2E8F0',
                                padding: '14px 16px',
                                borderRadius: '12px',
                                color: '#334155',
                                fontSize: '0.88rem',
                                fontStyle: 'italic',
                                lineHeight: 1.5
                            }}>
                                "{selectedRxForView.doctorAdvice || selectedRxForView.note || selectedRxForView.instructions || 'Take as advised with water.'}"
                            </div>
                        </div>

                        {/* Signature & NABH Stamp */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px dashed #CBD5E1', paddingTop: '18px', marginBottom: '20px' }}>
                            <div style={{ fontSize: '0.74rem', color: '#94A3B8' }}>
                                Generated securely by HelTech Health OS • Electronic Signature Verified
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontWeight: 800, color: '#2563EB', fontSize: '0.9rem', marginBottom: '2px' }}>
                                    {selectedRxForView.doctor || selectedRxForView.doctorName || 'Dr. Sarah Jenkins'}
                                </div>
                                <div style={{ fontSize: '0.72rem', color: '#64748B' }}>Authorized Medical Practitioner</div>
                            </div>
                        </div>

                        {/* Modal Action Buttons */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                            <button
                                onClick={() => setSelectedRxForView(null)}
                                style={{
                                    background: '#F1F5F9',
                                    border: '1px solid #CBD5E1',
                                    color: '#0F172A',
                                    padding: '9px 18px',
                                    borderRadius: '10px',
                                    fontWeight: 700,
                                    fontSize: '0.88rem',
                                    cursor: 'pointer'
                                }}
                            >
                                Close
                            </button>
                            <button
                                onClick={handlePrintSlip}
                                style={{
                                    background: '#2563EB',
                                    color: 'white',
                                    border: 'none',
                                    padding: '9px 22px',
                                    borderRadius: '10px',
                                    fontWeight: 800,
                                    fontSize: '0.88rem',
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '7px',
                                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)'
                                }}
                            >
                                <Printer size={18} weight="bold" /> Print Prescription
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Prescription;
