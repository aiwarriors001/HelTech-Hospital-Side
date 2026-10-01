import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CalendarCheck, Clock, CheckCircle,
    Phone, Sparkle,
    PlusCircle, MagnifyingGlass, UserPlus,
    X, ShieldCheck
} from '@phosphor-icons/react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const Appointment = () => {
    const { user } = useAuth();
    const {
        getPendingAppointments,
        getConfirmedAppointments,
        createAppointment,
        confirmAppointment,
        rescheduleAppointment
    } = useData();

    const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'confirmed'
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDept, setSelectedDept] = useState('all');

    // Reschedule state
    const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
    const [selectedAppt, setSelectedAppt] = useState(null);
    const [newDateTime, setNewDateTime] = useState('');

    // Walk-in booking modal state
    const [isWalkInOpen, setIsWalkInOpen] = useState(false);
    const [walkInForm, setWalkInForm] = useState({
        name: '',
        phone: '',
        date: new Date().toISOString().split('T')[0],
        time: '10:00',
        doctor: 'Dr. Sarah Jenkins',
        specialist: 'General Medicine',
        symptoms: 'Outpatient Clinical Consultation',
        attenderName: '',
        attenderPhone: ''
    });

    if (!user) {
        return (
            <div style={{ textAlign: 'center', padding: '60px' }}>
                <div className="spinner" style={{ width: '2.5rem', height: '2.5rem', borderTopColor: 'var(--primary-color, #2563EB)' }}></div>
            </div>
        );
    }

    const pendingList = getPendingAppointments() || [];
    const confirmedList = getConfirmedAppointments() || [];

    const currentList = activeTab === 'pending' ? pendingList : confirmedList;

    const filteredAppointments = currentList.filter(apt => {
        const matchesSearch =
            (apt.patientName && apt.patientName.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (apt.contactNumber && apt.contactNumber.includes(searchTerm)) ||
            (apt.specialist && apt.specialist.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (apt.reason && apt.reason.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesDept = selectedDept === 'all' || (apt.specialist && apt.specialist.toLowerCase() === selectedDept.toLowerCase());

        return matchesSearch && matchesDept;
    });

    const handleApprove = async (id, patientName) => {
        try {
            await confirmAppointment(id);
            toast.success(`Appointment confirmed for ${patientName || 'patient'}!`);
        } catch (err) {
            console.error('Approval failed:', err);
            toast.error('Failed to confirm appointment.');
        }
    };

    const openRescheduleModal = (apt) => {
        setSelectedAppt(apt);
        // Default to current appointment time or next hour
        try {
            const dateObj = apt.time ? new Date(apt.time) : new Date();
            const formatted = dateObj.toISOString().slice(0, 16);
            setNewDateTime(formatted);
        } catch {
            setNewDateTime(new Date().toISOString().slice(0, 16));
        }
        setIsRescheduleOpen(true);
    };

    const handleConfirmReschedule = async (e) => {
        e.preventDefault();
        if (!selectedAppt || !newDateTime) return;

        try {
            await rescheduleAppointment(selectedAppt.id, newDateTime);
            toast.success(`Appointment rescheduled to ${format(new Date(newDateTime), 'MMM d, h:mm a')}`);
            setIsRescheduleOpen(false);
            setSelectedAppt(null);
        } catch (err) {
            console.error('Reschedule failed:', err);
            toast.error('Failed to reschedule appointment.');
        }
    };

    const handleWalkInSubmit = async (e) => {
        e.preventDefault();
        const dateTimeString = `${walkInForm.date}T${walkInForm.time}:00`;

        await createAppointment({
            patientName: walkInForm.name,
            patientId: walkInForm.phone,
            contactNumber: walkInForm.phone,
            date: walkInForm.date,
            timeStr: `${walkInForm.time}:00`,
            time: dateTimeString,
            doctor: walkInForm.doctor,
            symptoms: walkInForm.symptoms,
            specialist: walkInForm.specialist,
            status: 'confirmed',
            attenderName: walkInForm.attenderName || 'Self',
            attenderPhone: walkInForm.attenderPhone || walkInForm.phone,
            address: 'In-Person Walk-in'
        });

        toast.success(`Walk-in appointment registered & confirmed for ${walkInForm.name}!`);
        setIsWalkInOpen(false);
        setWalkInForm({
            name: '',
            phone: '',
            date: new Date().toISOString().split('T')[0],
            time: '10:00',
            doctor: 'Dr. Sarah Jenkins',
            specialist: 'General Medicine',
            symptoms: 'Outpatient Clinical Consultation',
            attenderName: '',
            attenderPhone: ''
        });
    };

    return (
        <div className="page-container" style={{ paddingBottom: '80px' }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px',
                marginBottom: '28px'
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
                        Patient Appointments & Approvals
                    </div>
                    <h1 style={{
                        margin: 0,
                        fontSize: '2.1rem',
                        fontWeight: 900,
                        color: 'var(--text-main, #0F172A)',
                        letterSpacing: '-0.03em'
                    }}>
                        View & Approve Appointments
                    </h1>
                    <p style={{ margin: '4px 0 0', color: 'var(--text-muted, #64748B)', fontSize: '0.96rem' }}>
                        Review incoming patient requests, verify clinical symptoms & attenders, and confirm consultation slots.
                    </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button
                        onClick={() => setIsWalkInOpen(true)}
                        className="hover-lift"
                        style={{
                            background: '#2563EB',
                            border: 'none',
                            color: 'white',
                            padding: '10px 18px',
                            borderRadius: '12px',
                            fontWeight: 700,
                            fontSize: '0.88rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)'
                        }}
                    >
                        <PlusCircle size={18} weight="bold" />
                        Schedule Walk-in
                    </button>
                </div>
            </div>

            {/* Quick Stat Tiles */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '16px',
                marginBottom: '28px'
            }}>
                <div style={{
                    background: 'var(--card-bg, #FFFFFF)',
                    padding: '20px 22px',
                    borderRadius: '18px',
                    border: '1px solid var(--border-color, #E2E8F0)',
                    boxShadow: '0 2px 8px -2px rgba(15, 23, 42, 0.04)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted, #64748B)', textTransform: 'uppercase' }}>
                            Pending Approvals
                        </span>
                        <div style={{ width: 34, height: 34, borderRadius: '10px', background: 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D97706' }}>
                            <Clock size={18} weight="bold" />
                        </div>
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 900, color: '#D97706', lineHeight: 1 }}>
                        {pendingList.length}
                    </div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted, #64748B)', marginTop: '4px', display: 'inline-block' }}>
                        Requires doctor or desk review
                    </span>
                </div>

                <div style={{
                    background: 'var(--card-bg, #FFFFFF)',
                    padding: '20px 22px',
                    borderRadius: '18px',
                    border: '1px solid var(--border-color, #E2E8F0)',
                    boxShadow: '0 2px 8px -2px rgba(15, 23, 42, 0.04)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted, #64748B)', textTransform: 'uppercase' }}>
                            Confirmed Appointments
                        </span>
                        <div style={{ width: 34, height: 34, borderRadius: '10px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10B981' }}>
                            <CheckCircle size={18} weight="bold" />
                        </div>
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 900, color: '#10B981', lineHeight: 1 }}>
                        {confirmedList.length}
                    </div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted, #64748B)', marginTop: '4px', display: 'inline-block' }}>
                        Confirmed in clinical schedule
                    </span>
                </div>

                <div style={{
                    background: 'var(--card-bg, #FFFFFF)',
                    padding: '20px 22px',
                    borderRadius: '18px',
                    border: '1px solid var(--border-color, #E2E8F0)',
                    boxShadow: '0 2px 8px -2px rgba(15, 23, 42, 0.04)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted, #64748B)', textTransform: 'uppercase' }}>
                            Average Response
                        </span>
                        <div style={{ width: 34, height: 34, borderRadius: '10px', background: 'rgba(37, 99, 235, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB' }}>
                            <ShieldCheck size={18} weight="bold" />
                        </div>
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-main, #0F172A)', lineHeight: 1 }}>
                        &lt; 15 Mins
                    </div>
                    <span style={{ fontSize: '0.78rem', color: '#10B981', fontWeight: 700, marginTop: '4px', display: 'inline-block' }}>
                        Prompt Patient Communication
                    </span>
                </div>
            </div>

            {/* Filter and Tab Bar */}
            <div style={{
                background: 'var(--card-bg, #FFFFFF)',
                padding: '16px 20px',
                borderRadius: '18px',
                border: '1px solid var(--border-color, #E2E8F0)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '14px',
                marginBottom: '24px',
                boxShadow: '0 2px 8px -2px rgba(15, 23, 42, 0.04)'
            }}>
                {/* Tabs */}
                <div style={{
                    display: 'flex',
                    background: 'var(--bg-color, #F1F5F9)',
                    padding: '4px',
                    borderRadius: '12px',
                    border: '1px solid var(--border-color, #E2E8F0)'
                }}>
                    <button
                        onClick={() => setActiveTab('pending')}
                        style={{
                            border: 'none',
                            background: activeTab === 'pending' ? '#2563EB' : 'transparent',
                            color: activeTab === 'pending' ? 'white' : 'var(--text-muted, #64748B)',
                            padding: '8px 18px',
                            borderRadius: '9px',
                            fontSize: '0.86rem',
                            fontWeight: 800,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <span>Pending Approvals</span>
                        <span style={{
                            background: activeTab === 'pending' ? 'rgba(255,255,255,0.25)' : 'rgba(245,158,11,0.2)',
                            color: activeTab === 'pending' ? 'white' : '#D97706',
                            padding: '2px 8px',
                            borderRadius: '999px',
                            fontSize: '0.74rem'
                        }}>
                            {pendingList.length}
                        </span>
                    </button>

                    <button
                        onClick={() => setActiveTab('confirmed')}
                        style={{
                            border: 'none',
                            background: activeTab === 'confirmed' ? '#2563EB' : 'transparent',
                            color: activeTab === 'confirmed' ? 'white' : 'var(--text-muted, #64748B)',
                            padding: '8px 18px',
                            borderRadius: '9px',
                            fontSize: '0.86rem',
                            fontWeight: 800,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <span>Confirmed Schedule</span>
                        <span style={{
                            background: activeTab === 'confirmed' ? 'rgba(255,255,255,0.25)' : 'rgba(16,185,129,0.2)',
                            color: activeTab === 'confirmed' ? 'white' : '#059669',
                            padding: '2px 8px',
                            borderRadius: '999px',
                            fontSize: '0.74rem'
                        }}>
                            {confirmedList.length}
                        </span>
                    </button>
                </div>

                {/* Filter Controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                    <select
                        value={selectedDept}
                        onChange={(e) => setSelectedDept(e.target.value)}
                        className="form-input"
                        style={{
                            maxWidth: '190px',
                            fontSize: '0.86rem',
                            borderRadius: '10px',
                            padding: '8px 12px'
                        }}
                    >
                        <option value="all">All Specialties</option>
                        <option value="General Medicine">General Medicine</option>
                        <option value="Cardiology">Cardiology</option>
                        <option value="Orthopaedics">Orthopaedics</option>
                        <option value="Paediatrics">Paediatrics</option>
                        <option value="Neurology">Neurology</option>
                        <option value="ENT">ENT</option>
                        <option value="Gynaecology">Gynaecology</option>
                        <option value="Dermatology">Dermatology</option>
                    </select>

                    <div style={{ position: 'relative', width: '100%', maxWidth: '300px' }}>
                        <MagnifyingGlass size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted, #94A3B8)' }} />
                        <input
                            type="text"
                            placeholder="Search patient, phone, doctor..."
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
            </div>

            {/* List of Appointments */}
            {filteredAppointments.length === 0 ? (
                <div style={{
                    padding: '60px 24px',
                    textAlign: 'center',
                    background: 'var(--card-bg, #FFFFFF)',
                    borderRadius: '20px',
                    border: '1px solid var(--border-color, #E2E8F0)',
                    color: 'var(--text-muted, #64748B)'
                }}>
                    <div style={{
                        width: 60,
                        height: 60,
                        borderRadius: '50%',
                        background: activeTab === 'pending' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(37, 99, 235, 0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 14px'
                    }}>
                        {activeTab === 'pending' ? (
                            <CheckCircle size={32} color="#10B981" weight="fill" />
                        ) : (
                            <CalendarCheck size={32} color="#2563EB" weight="fill" />
                        )}
                    </div>
                    <h3 style={{ margin: '0 0 6px', fontWeight: 800, fontSize: '1.2rem', color: 'var(--text-main, #0F172A)' }}>
                        {activeTab === 'pending' ? 'No Pending Appointments Awaiting Approval' : 'No Confirmed Appointments Found'}
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.9rem' }}>
                        {activeTab === 'pending'
                            ? 'All incoming requests have been reviewed and approved. New requests will appear here instantly.'
                            : 'Approved patient appointments will appear here with scheduled consultation timings.'}
                    </p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '16px' }}>
                    {filteredAppointments.map((apt) => {
                        const isPending = apt.status === 'pending';
                        let formattedDate = 'Flexible Schedule';
                        try {
                            if (apt.time) formattedDate = format(new Date(apt.time), 'EEE, dd MMM yyyy • hh:mm a');
                        } catch {
                            formattedDate = apt.time || 'Schedule to be confirmed';
                        }

                        return (
                            <motion.div
                                key={apt.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                style={{
                                    background: 'var(--card-bg, #FFFFFF)',
                                    borderRadius: '20px',
                                    border: '1px solid var(--border-color, #E2E8F0)',
                                    padding: '24px 28px',
                                    boxShadow: '0 2px 10px -2px rgba(15, 23, 42, 0.04)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    flexWrap: 'wrap',
                                    gap: '20px'
                                }}
                            >
                                {/* Left: Patient Details & Contact */}
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '18px', minWidth: '280px' }}>
                                    <div style={{
                                        width: '54px',
                                        height: '54px',
                                        borderRadius: '16px',
                                        background: isPending
                                            ? 'linear-gradient(135deg, #F59E0B, #D97706)'
                                            : 'linear-gradient(135deg, #2563EB, #1D4ED8)',
                                        color: 'white',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '1.3rem',
                                        fontWeight: '800',
                                        flexShrink: 0,
                                        boxShadow: isPending ? '0 4px 12px rgba(245, 158, 11, 0.25)' : '0 4px 12px rgba(37, 99, 235, 0.25)'
                                    }}>
                                        {(apt.patientName || 'P').charAt(0).toUpperCase()}
                                    </div>

                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                            <h3 style={{ margin: 0, fontSize: '1.18rem', fontWeight: 800, color: 'var(--text-main, #0F172A)' }}>
                                                {apt.patientName}
                                            </h3>
                                            <span style={{
                                                fontSize: '0.74rem',
                                                fontWeight: 800,
                                                padding: '2px 8px',
                                                borderRadius: '6px',
                                                background: isPending ? 'rgba(245, 158, 11, 0.12)' : 'rgba(16, 185, 129, 0.12)',
                                                color: isPending ? '#D97706' : '#059669',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.04em'
                                            }}>
                                                {isPending ? 'Pending Review' : 'Confirmed'}
                                            </span>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px', fontSize: '0.86rem', color: 'var(--text-muted, #64748B)' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                <Phone size={15} color="#2563EB" weight="bold" />
                                                <strong>{apt.contactNumber || apt.patientId || 'N/A'}</strong>
                                            </span>
                                            <span>•</span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                <Clock size={15} color="#10B981" weight="bold" />
                                                {formattedDate}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Middle: Attender & Medical Info */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '220px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                        <span style={{
                                            background: 'rgba(37, 99, 235, 0.08)',
                                            color: '#2563EB',
                                            padding: '3px 10px',
                                            borderRadius: '8px',
                                            fontSize: '0.8rem',
                                            fontWeight: 700
                                        }}>
                                            {apt.specialist || 'General Medicine'}
                                        </span>
                                        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted, #64748B)', fontWeight: 600 }}>
                                            {apt.reason || 'Outpatient Consultation'}
                                        </span>
                                    </div>

                                    <div style={{ fontSize: '0.84rem', color: 'var(--text-main, #334155)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <UserPlus size={15} color="#64748B" weight="bold" />
                                        <span>Attender: <strong>{apt.attenderName || 'Self / Direct'}</strong> {apt.attenderPhone ? `(${apt.attenderPhone})` : ''}</span>
                                    </div>

                                    {apt.symptoms && (
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted, #64748B)', fontStyle: 'italic' }}>
                                            Symptoms: {apt.symptoms}
                                        </div>
                                    )}
                                </div>

                                {/* Right Actions: Approve & Reschedule */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    {isPending ? (
                                        <>
                                            <button
                                                onClick={() => handleApprove(apt.id, apt.patientName)}
                                                className="hover-lift"
                                                style={{
                                                    background: '#10B981',
                                                    color: 'white',
                                                    border: 'none',
                                                    padding: '10px 20px',
                                                    borderRadius: '12px',
                                                    fontSize: '0.88rem',
                                                    fontWeight: 800,
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    cursor: 'pointer',
                                                    boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
                                                }}
                                            >
                                                <CheckCircle size={18} weight="bold" />
                                                Approve
                                            </button>

                                            <button
                                                onClick={() => openRescheduleModal(apt)}
                                                className="hover-lift"
                                                style={{
                                                    background: 'var(--bg-color, #F1F5F9)',
                                                    color: 'var(--text-main, #1F2937)',
                                                    border: '1px solid var(--border-color, #CBD5E1)',
                                                    padding: '10px 16px',
                                                    borderRadius: '12px',
                                                    fontSize: '0.88rem',
                                                    fontWeight: 700,
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <Clock size={16} weight="bold" />
                                                Reschedule
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <div style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                padding: '8px 14px',
                                                borderRadius: '10px',
                                                background: 'rgba(16, 185, 129, 0.08)',
                                                color: '#059669',
                                                fontWeight: 800,
                                                fontSize: '0.84rem'
                                            }}>
                                                <CheckCircle size={18} weight="fill" />
                                                Slot Confirmed
                                            </div>

                                            <button
                                                onClick={() => openRescheduleModal(apt)}
                                                style={{
                                                    background: 'transparent',
                                                    color: 'var(--text-muted, #64748B)',
                                                    border: '1px solid var(--border-color, #E2E8F0)',
                                                    padding: '8px 14px',
                                                    borderRadius: '10px',
                                                    fontSize: '0.82rem',
                                                    fontWeight: 700,
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                Change Time
                                            </button>
                                        </>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* ═══════════════════════════════════════════════════════════ */}
            {/* RESCHEDULE MODAL                                            */}
            {/* ═══════════════════════════════════════════════════════════ */}
            <AnimatePresence>
                {isRescheduleOpen && (
                    <div
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'rgba(15, 23, 42, 0.65)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 1200,
                            backdropFilter: 'blur(8px)',
                            padding: '20px'
                        }}
                        onClick={() => setIsRescheduleOpen(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.94 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.94 }}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                background: 'var(--card-bg, #FFFFFF)',
                                padding: '32px',
                                borderRadius: '24px',
                                width: '100%',
                                maxWidth: '440px',
                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                                border: '1px solid var(--border-color, #E2E8F0)'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{ width: 40, height: 40, borderRadius: '12px', background: 'rgba(37, 99, 235, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB' }}>
                                        <Clock size={22} weight="bold" />
                                    </div>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-main, #0F172A)' }}>
                                            Reschedule Appointment
                                        </h3>
                                        <p style={{ margin: '2px 0 0', fontSize: '0.84rem', color: 'var(--text-muted, #64748B)' }}>
                                            Patient: {selectedAppt?.patientName}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsRescheduleOpen(false)}
                                    style={{
                                        border: 'none',
                                        background: 'var(--bg-color, #F1F5F9)',
                                        width: 32,
                                        height: 32,
                                        borderRadius: '8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        color: 'var(--text-muted, #64748B)'
                                    }}
                                >
                                    <X size={16} weight="bold" />
                                </button>
                            </div>

                            <form onSubmit={handleConfirmReschedule} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 800, color: 'var(--text-main, #1F2937)', marginBottom: '8px' }}>
                                        Select New Date & Time Slot *
                                    </label>
                                    <input
                                        type="datetime-local"
                                        required
                                        value={newDateTime}
                                        onChange={(e) => setNewDateTime(e.target.value)}
                                        className="form-input"
                                        style={{
                                            width: '100%',
                                            padding: '12px 14px',
                                            borderRadius: '12px',
                                            fontSize: '0.94rem',
                                            fontWeight: 600
                                        }}
                                    />
                                </div>

                                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                                    <button
                                        type="button"
                                        onClick={() => setIsRescheduleOpen(false)}
                                        style={{
                                            background: 'var(--bg-color, #F1F5F9)',
                                            border: '1px solid var(--border-color, #CBD5E1)',
                                            color: 'var(--text-main, #1F2937)',
                                            padding: '10px 18px',
                                            borderRadius: '12px',
                                            fontWeight: 700,
                                            fontSize: '0.86rem',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        style={{
                                            background: '#2563EB',
                                            color: 'white',
                                            border: 'none',
                                            padding: '10px 22px',
                                            borderRadius: '12px',
                                            fontWeight: 700,
                                            fontSize: '0.86rem',
                                            cursor: 'pointer',
                                            boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)'
                                        }}
                                    >
                                        Save & Notify Patient
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ═══════════════════════════════════════════════════════════ */}
            {/* WALK-IN REGISTRATION MODAL                                  */}
            {/* ═══════════════════════════════════════════════════════════ */}
            <AnimatePresence>
                {isWalkInOpen && (
                    <div
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'rgba(15, 23, 42, 0.65)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 1200,
                            backdropFilter: 'blur(8px)',
                            padding: '20px'
                        }}
                        onClick={() => setIsWalkInOpen(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.94 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.94 }}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                background: 'var(--card-bg, #FFFFFF)',
                                padding: '32px',
                                borderRadius: '24px',
                                width: '100%',
                                maxWidth: '580px',
                                maxHeight: '90vh',
                                overflowY: 'auto',
                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                                border: '1px solid var(--border-color, #E2E8F0)'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{ width: 42, height: 42, borderRadius: '12px', background: 'rgba(37, 99, 235, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB' }}>
                                        <PlusCircle size={24} weight="bold" />
                                    </div>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-main, #0F172A)' }}>
                                            Register Walk-in Patient
                                        </h3>
                                        <p style={{ margin: '2px 0 0', fontSize: '0.84rem', color: 'var(--text-muted, #64748B)' }}>
                                            Add a direct in-person clinic appointment to the roster
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsWalkInOpen(false)}
                                    style={{
                                        border: 'none',
                                        background: 'var(--bg-color, #F1F5F9)',
                                        width: 32,
                                        height: 32,
                                        borderRadius: '8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        color: 'var(--text-muted, #64748B)'
                                    }}
                                >
                                    <X size={16} weight="bold" />
                                </button>
                            </div>

                            <form onSubmit={handleWalkInSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-main, #1F2937)', marginBottom: '6px' }}>
                                            Patient Full Name *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={walkInForm.name}
                                            onChange={(e) => setWalkInForm({ ...walkInForm, name: e.target.value })}
                                            className="form-input"
                                            placeholder="e.g. Anand Sharma"
                                            style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', fontSize: '0.9rem' }}
                                        />
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-main, #1F2937)', marginBottom: '6px' }}>
                                            Phone / Contact Number *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={walkInForm.phone}
                                            onChange={(e) => setWalkInForm({ ...walkInForm, phone: e.target.value })}
                                            className="form-input"
                                            placeholder="e.g. 98401 23456"
                                            style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', fontSize: '0.9rem' }}
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-main, #1F2937)', marginBottom: '6px' }}>
                                            Consultation Date *
                                        </label>
                                        <input
                                            type="date"
                                            required
                                            value={walkInForm.date}
                                            onChange={(e) => setWalkInForm({ ...walkInForm, date: e.target.value })}
                                            className="form-input"
                                            style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', fontSize: '0.9rem' }}
                                        />
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-main, #1F2937)', marginBottom: '6px' }}>
                                            Slot Time *
                                        </label>
                                        <input
                                            type="time"
                                            required
                                            value={walkInForm.time}
                                            onChange={(e) => setWalkInForm({ ...walkInForm, time: e.target.value })}
                                            className="form-input"
                                            style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', fontSize: '0.9rem' }}
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-main, #1F2937)', marginBottom: '6px' }}>
                                            Clinical Specialty *
                                        </label>
                                        <select
                                            value={walkInForm.specialist}
                                            onChange={(e) => setWalkInForm({ ...walkInForm, specialist: e.target.value })}
                                            className="form-input"
                                            style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', fontSize: '0.9rem' }}
                                        >
                                            <option value="General Medicine">General Medicine</option>
                                            <option value="Cardiology">Cardiology</option>
                                            <option value="Orthopaedics">Orthopaedics</option>
                                            <option value="Paediatrics">Paediatrics</option>
                                            <option value="Neurology">Neurology</option>
                                            <option value="ENT">ENT</option>
                                            <option value="Gynaecology">Gynaecology</option>
                                            <option value="Dermatology">Dermatology</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-main, #1F2937)', marginBottom: '6px' }}>
                                            Consulting Doctor
                                        </label>
                                        <input
                                            type="text"
                                            value={walkInForm.doctor}
                                            onChange={(e) => setWalkInForm({ ...walkInForm, doctor: e.target.value })}
                                            className="form-input"
                                            placeholder="e.g. Dr. Sarah Jenkins"
                                            style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', fontSize: '0.9rem' }}
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-main, #1F2937)', marginBottom: '6px' }}>
                                            Attender Name (Optional)
                                        </label>
                                        <input
                                            type="text"
                                            value={walkInForm.attenderName}
                                            onChange={(e) => setWalkInForm({ ...walkInForm, attenderName: e.target.value })}
                                            className="form-input"
                                            placeholder="e.g. Priya Sharma"
                                            style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', fontSize: '0.9rem' }}
                                        />
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-main, #1F2937)', marginBottom: '6px' }}>
                                            Attender Phone
                                        </label>
                                        <input
                                            type="text"
                                            value={walkInForm.attenderPhone}
                                            onChange={(e) => setWalkInForm({ ...walkInForm, attenderPhone: e.target.value })}
                                            className="form-input"
                                            placeholder="e.g. 98402 33445"
                                            style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', fontSize: '0.9rem' }}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-main, #1F2937)', marginBottom: '6px' }}>
                                        Presenting Symptoms / Notes
                                    </label>
                                    <textarea
                                        rows={2}
                                        value={walkInForm.symptoms}
                                        onChange={(e) => setWalkInForm({ ...walkInForm, symptoms: e.target.value })}
                                        className="form-input"
                                        placeholder="Chief medical complaints or triage notes..."
                                        style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', fontSize: '0.9rem', resize: 'none' }}
                                    />
                                </div>

                                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                                    <button
                                        type="button"
                                        onClick={() => setIsWalkInOpen(false)}
                                        style={{
                                            background: 'var(--bg-color, #F1F5F9)',
                                            border: '1px solid var(--border-color, #CBD5E1)',
                                            color: 'var(--text-main, #1F2937)',
                                            padding: '10px 18px',
                                            borderRadius: '12px',
                                            fontWeight: 700,
                                            fontSize: '0.86rem',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        style={{
                                            background: '#2563EB',
                                            color: 'white',
                                            border: 'none',
                                            padding: '10px 22px',
                                            borderRadius: '12px',
                                            fontWeight: 700,
                                            fontSize: '0.86rem',
                                            cursor: 'pointer',
                                            boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)'
                                        }}
                                    >
                                        Confirm & Add to Schedule
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Appointment;
