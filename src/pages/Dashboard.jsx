
import React from 'react';
import { useData } from '../context/DataContext';
import { motion } from 'framer-motion';
import { Users, Clock, CalendarBlank, ChartLine, Bell, XCircle, CheckCircle, FileText, Pill, User, Phone, MapPin, UserPlus, CaretRight, Drop, Robot, CalendarCheck, VideoCamera, Sparkle, Calendar } from '@phosphor-icons/react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import DashboardAnalyticsChart from '../components/DashboardAnalyticsChart';


const safeFormatDate = (dateVal, formatStr = 'MMM d, h:mm a', fallback = 'Scheduled') => {
    if (!dateVal) return fallback;
    try {
        const d = new Date(dateVal);
        if (isNaN(d.getTime())) return fallback;
        return format(d, formatStr);
    } catch {
        return fallback;
    }
};

const Dashboard = () => {
    const { getAllPrescriptions, getPendingAppointments, confirmAppointment, rescheduleAppointment, getConfirmedAppointments, realTimePatientCount, appointments, callDetails } = useData();
    const prescriptions = getAllPrescriptions() || [];
    const pendingAppointments = getPendingAppointments() || [];
    const confirmedAppointments = (getConfirmedAppointments() || []).slice(0, 3); // Top 3 list

    // Live consultancy count & dynamic completed appointments count
    const [liveConsultancyCount, setLiveConsultancyCount] = React.useState(() => {
        if (callDetails && callDetails.length > 0) return callDetails.length;
        const saved = localStorage.getItem('careconnect_consultancy_count');
        return saved ? parseInt(saved, 10) : 8;
    });

    const [extraCompletedAppts, setExtraCompletedAppts] = React.useState(() => {
        return parseInt(localStorage.getItem('heltech_completed_appointments') || '0', 10);
    });

    React.useEffect(() => {
        if (callDetails && callDetails.length > 0) {
            setLiveConsultancyCount(callDetails.length);
        }
    }, [callDetails]);

    React.useEffect(() => {
        const handleStorage = () => {
            const savedConsult = localStorage.getItem('careconnect_consultancy_count');
            if (savedConsult) setLiveConsultancyCount(parseInt(savedConsult, 10));

            const savedAppts = localStorage.getItem('heltech_completed_appointments');
            if (savedAppts) setExtraCompletedAppts(parseInt(savedAppts, 10));
        };
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    const baseCompleted = (appointments || []).filter(a => a && (a.status === 'completed' || a.status === 'confirmed')).length || getConfirmedAppointments().length;
    const completedAppointmentsCount = baseCompleted + extraCompletedAppts;

    const [isRescheduleOpen, setIsRescheduleOpen] = React.useState(false);
    const [selectedAppointment, setSelectedAppointment] = React.useState(null);
    const [selectedPatientDetails, setSelectedPatientDetails] = React.useState(null); // For read-only details modal
    const [newTime, setNewTime] = React.useState('');
    const [notification, setNotification] = React.useState({ show: false, message: '', type: 'success' });

    const showNotification = (message, type = 'success') => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 3000);
    };

    const handleApprove = async (id) => {
        await confirmAppointment(id);
        showNotification('Appointment Approved! Moved to Scheduled Visits.');
    };

    const openReschedule = (apt) => {
        setSelectedAppointment(apt);
        setNewTime(apt.time); // Pre-fill with current time
        setIsRescheduleOpen(true);
    };

    const handleRescheduleSubmit = async () => {
        if (selectedAppointment && newTime) {
            await rescheduleAppointment(selectedAppointment.id, newTime);
            showNotification('Appointment Rescheduled & Confirmed!');
            setIsRescheduleOpen(false);
            setSelectedAppointment(null);
        }
    };

    // ... (rendering code)

    // Hospital Dashboard
    return (
        <div className="dashboard-container" style={{ position: 'relative' }}>
            {/* Notification Toast */}
            <motion.div
                initial={{ opacity: 0, y: -20, x: '-50%' }}
                animate={{ opacity: notification.show ? 1 : 0, y: notification.show ? 20 : -20, x: '-50%' }}
                style={{
                    position: 'fixed',
                    top: '24px',
                    left: '50%',
                    background: notification.type === 'success' ? '#065F46' : '#991B1B',
                    color: 'white',
                    padding: '12px 24px',
                    borderRadius: '999px',
                    boxShadow: '0 12px 32px rgba(0, 0, 0, 0.25)',
                    zIndex: 2000,
                    fontWeight: '700',
                    fontSize: '0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    pointerEvents: 'none',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                }}
            >
                {notification.type === 'success' ? <CheckCircle weight="fill" size={20} color="#34D399" /> : <XCircle weight="fill" size={20} color="#F87171" />}
                {notification.message}
            </motion.div>

            {/* Dashboard Title Header */}
            <div className="dashboard-header" style={{ marginBottom: '28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 12px',
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
                        <Sparkle size={13} weight="fill" /> Central Command
                    </div>
                    <h1 style={{ margin: 0, fontSize: '2.1rem', fontWeight: 900, color: 'var(--text-main, #0F172A)', letterSpacing: '-0.03em' }}>
                        Hospital Dashboard
                    </h1>
                    <p style={{ margin: '4px 0 0', color: 'var(--text-muted, #64748B)', fontSize: '0.96rem' }}>
                        Live clinical operations, prescription registry, and patient appointments
                    </p>
                </div>
                <div className="current-date-pill" style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 18px',
                    borderRadius: '12px',
                    background: 'var(--card-bg, #FFFFFF)',
                    border: '1px solid var(--border-color, #E2E8F0)',
                    color: 'var(--text-main, #1F2937)',
                    fontWeight: 700,
                    fontSize: '0.86rem',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                }}>
                    <Calendar size={18} weight="duotone" color="#2563EB" />
                    {format(new Date(), 'MMMM d, yyyy')}
                </div>
            </div>

            {/* KPI Stats Grid */}
            <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', marginBottom: '32px' }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="stat-card-premium hover-lift"
                    style={{
                        background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
                        color: 'white',
                        padding: '30px 36px',
                        borderRadius: '24px',
                        position: 'relative',
                        overflow: 'hidden',
                        boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.4)'
                    }}
                >
                    {/* Background Texture Icon */}
                    <Users weight="duotone" style={{ position: 'absolute', right: '-20px', bottom: '-20px', fontSize: '180px', opacity: '0.08', color: 'white', transform: 'rotate(-10deg)', pointerEvents: 'none' }} />

                    <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '28px' }}>
                        {/* Stat 1: Total Unique Patients */}
                        <div style={{ minWidth: '180px', flex: '1 1 0' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                <div style={{ background: 'rgba(255,255,255,0.2)', padding: '8px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Users weight="fill" size={22} color="white" />
                                </div>
                                <span style={{ fontSize: '0.95rem', fontWeight: '600', opacity: 0.95 }}>Total Unique Patients</span>
                            </div>
                            <div style={{ fontSize: '3.2rem', fontWeight: '800', lineHeight: 1, marginBottom: '6px' }}>
                                {realTimePatientCount}
                            </div>
                            <div style={{ fontSize: '0.8rem', opacity: 0.78 }}>
                                Active Hospital Records
                            </div>
                        </div>

                        {/* Divider */}
                        <div style={{ width: '1px', height: '64px', background: 'rgba(255,255,255,0.2)', flexShrink: 0 }} />

                        {/* Stat 2: Appointments Completed */}
                        <div style={{ minWidth: '180px', flex: '1 1 0' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                <div style={{ background: 'rgba(255,255,255,0.2)', padding: '8px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <CalendarCheck weight="fill" size={22} color="white" />
                                </div>
                                <span style={{ fontSize: '0.95rem', fontWeight: '600', opacity: 0.95 }}>Appointments Completed</span>
                            </div>
                            <div style={{ fontSize: '3.2rem', fontWeight: '800', lineHeight: 1, marginBottom: '6px' }}>
                                {completedAppointmentsCount}
                            </div>
                            <div style={{ fontSize: '0.8rem', opacity: 0.78 }}>
                                Scheduled & Confirmed
                            </div>
                        </div>

                        {/* Divider */}
                        <div style={{ width: '1px', height: '64px', background: 'rgba(255,255,255,0.2)', flexShrink: 0 }} />

                        {/* Stat 3: Live Consultancy (CareConnect) */}
                        <div style={{ minWidth: '180px', flex: '1 1 0' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                <div style={{ background: 'rgba(255,255,255,0.2)', padding: '8px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <VideoCamera weight="fill" size={22} color="white" />
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span style={{ fontSize: '0.95rem', fontWeight: '600', opacity: 0.95 }}>Live Consultancy</span>
                                    <span style={{ fontSize: '0.68rem', fontWeight: '700', background: 'rgba(255,255,255,0.24)', padding: '2px 8px', borderRadius: '999px', letterSpacing: '0.03em' }}>CareConnect</span>
                                </div>
                            </div>
                            <div style={{ fontSize: '3.2rem', fontWeight: '800', lineHeight: 1, marginBottom: '6px' }}>
                                {liveConsultancyCount}
                            </div>
                            <div style={{ fontSize: '0.8rem', opacity: 0.78 }}>
                                Telemedicine Sessions
                            </div>
                        </div>

                        {/* Visual Progress/Graph Indicator */}
                        <div style={{ display: 'flex', gap: '4px', alignItems: 'flex-end', height: '60px', opacity: 0.8, flexShrink: 0, paddingLeft: '8px' }}>
                            {[40, 65, 50, 80, 60, 90, 75].map((h, i) => (
                                <div key={i} style={{ width: '8px', height: `${h}%`, background: 'white', borderRadius: '4px' }}></div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Operational Activity & Trend Analytics Graph */}
            <DashboardAnalyticsChart
                totalPatients={realTimePatientCount}
                completedAppts={completedAppointmentsCount}
                liveConsults={liveConsultancyCount}
            />


            {/* Appointment Request Section */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'rgba(37, 99, 235, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB' }}>
                        <Clock weight="bold" size={20} />
                    </div>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main, #0F172A)', letterSpacing: '-0.02em' }}>
                        Appointment Requests
                    </h3>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '3px 10px', borderRadius: '999px', background: pendingAppointments.length > 0 ? 'rgba(245, 158, 11, 0.12)' : 'rgba(16, 185, 129, 0.1)', color: pendingAppointments.length > 0 ? '#D97706' : '#10B981' }}>
                        {pendingAppointments.length} Pending
                    </span>
                </div>
            </div>

            {pendingAppointments.length === 0 ? (
                <div style={{
                    padding: '44px 24px',
                    textAlign: 'center',
                    background: 'var(--card-bg, #FFFFFF)',
                    borderRadius: '20px',
                    border: '1px solid var(--border-color, #E2E8F0)',
                    marginBottom: '40px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                }}>
                    <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                        <CheckCircle size={30} color="#10B981" weight="fill" />
                    </div>
                    <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-main, #0F172A)', marginBottom: '4px' }}>
                        All Caught Up!
                    </div>
                    <p style={{ margin: 0, color: 'var(--text-muted, #64748B)', fontSize: '0.88rem' }}>
                        No pending appointment requests requiring review right now.
                    </p>
                </div>
            ) : (
                <div className="appointments-list" style={{ display: 'grid', gap: '16px', marginBottom: '40px' }}>
                    {pendingAppointments.map(apt => (
                        <motion.div
                            key={apt.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="appointment-card hover-lift"
                            style={{
                                background: 'var(--card-bg, #FFFFFF)',
                                padding: '22px 26px',
                                borderRadius: '18px',
                                border: '1px solid var(--border-color, #E2E8F0)',
                                boxShadow: '0 2px 8px -2px rgba(15, 23, 42, 0.05)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                flexWrap: 'wrap',
                                gap: '18px'
                            }}
                        >
                            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                <div style={{
                                    width: '50px',
                                    height: '50px',
                                    borderRadius: '14px',
                                    background: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: '800',
                                    fontSize: '1.15rem',
                                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
                                    flexShrink: 0
                                }}>
                                    {(apt.patientName || 'Patient').charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h4 style={{ margin: 0, fontSize: '1.08rem', fontWeight: 800, color: 'var(--text-main, #0F172A)' }}>
                                        {apt.patientName || 'Patient'}
                                    </h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '5px', fontSize: '0.88rem', color: 'var(--text-muted, #64748B)' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <Clock size={16} weight="bold" color="#2563EB" /> {safeFormatDate(apt.time, 'MMM d, h:mm a')}
                                        </span>
                                        {/* Medical Details */}
                                        <div style={{ display: 'flex', gap: '8px', marginTop: '2px', flexWrap: 'wrap' }}>
                                            <span style={{ background: '#EFF6FF', color: '#1D4ED8', padding: '3px 10px', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 700, border: '1px solid rgba(37, 99, 235, 0.15)' }}>
                                                {apt.specialist}
                                            </span>
                                            <span style={{ background: 'var(--bg-color, #F8FAFC)', color: 'var(--text-main, #374151)', padding: '3px 10px', borderRadius: '8px', fontSize: '0.78rem', border: '1px solid var(--border-color, #E2E8F0)' }}>
                                                Sx: {apt.symptoms}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button
                                    onClick={() => handleApprove(apt.id)}
                                    className="hover-lift"
                                    title="Approve Appointment"
                                    style={{
                                        background: '#10B981',
                                        color: 'white',
                                        border: 'none',
                                        padding: '9px 18px',
                                        borderRadius: '10px',
                                        cursor: 'pointer',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        fontWeight: 700,
                                        fontSize: '0.86rem',
                                        boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
                                    }}
                                >
                                    <CheckCircle size={18} weight="bold" /> Approve
                                </button>
                                <button
                                    onClick={() => openReschedule(apt)}
                                    className="hover-lift"
                                    title="Reschedule Appointment"
                                    style={{
                                        background: 'var(--bg-color, #F1F5F9)',
                                        color: 'var(--text-main, #334155)',
                                        border: '1px solid var(--border-color, #CBD5E1)',
                                        padding: '9px 16px',
                                        borderRadius: '10px',
                                        cursor: 'pointer',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        fontWeight: 700,
                                        fontSize: '0.86rem'
                                    }}
                                >
                                    <Clock size={17} weight="bold" /> Reschedule
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Reschedule Modal */}
            {isRescheduleOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(15, 23, 42, 0.65)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    backdropFilter: 'blur(8px)'
                }}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.94 }}
                        animate={{ opacity: 1, scale: 1 }}
                        style={{
                            background: 'var(--card-bg, #FFFFFF)',
                            padding: '32px',
                            borderRadius: '24px',
                            width: '90%',
                            maxWidth: '420px',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
                            border: '1px solid var(--border-color, #E2E8F0)'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                            <div style={{ width: 40, height: 40, borderRadius: '12px', background: 'rgba(37, 99, 235, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB' }}>
                                <Clock size={22} weight="bold" />
                            </div>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main, #0F172A)' }}>Reschedule Visit</h3>
                                <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--text-muted, #64748B)' }}>Adjust clinical slot for {selectedAppointment?.patientName}</p>
                            </div>
                        </div>

                        <div style={{ margin: '20px 0 24px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-main, #1F2937)' }}>New Date & Time *</label>
                            <input
                                type="datetime-local"
                                value={newTime}
                                onChange={(e) => setNewTime(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '12px 14px',
                                    borderRadius: '12px',
                                    border: '1.5px solid var(--border-color, #CBD5E1)',
                                    background: 'var(--bg-color, #F8FAFC)',
                                    color: 'var(--text-main, #0F172A)',
                                    fontSize: '0.95rem',
                                    fontWeight: 600,
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => setIsRescheduleOpen(false)}
                                style={{
                                    padding: '10px 18px',
                                    borderRadius: '10px',
                                    border: '1px solid var(--border-color, #CBD5E1)',
                                    background: 'transparent',
                                    color: 'var(--text-main, #334155)',
                                    cursor: 'pointer',
                                    fontWeight: 700,
                                    fontSize: '0.9rem'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleRescheduleSubmit}
                                style={{
                                    padding: '10px 22px',
                                    borderRadius: '10px',
                                    border: 'none',
                                    background: '#2563EB',
                                    color: 'white',
                                    cursor: 'pointer',
                                    fontWeight: 700,
                                    fontSize: '0.9rem',
                                    boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)'
                                }}
                            >
                                Confirm Change
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}






            {/* Patient Directory Preview */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'rgba(37, 99, 235, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB' }}>
                        <Users weight="bold" size={20} />
                    </div>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main, #0F172A)', letterSpacing: '-0.02em' }}>
                        Recent Patients
                    </h3>
                </div>
                <Link to="/patients" style={{ color: 'var(--primary-color, #2563EB)', fontWeight: 700, fontSize: '0.86rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(37, 99, 235, 0.08)', padding: '6px 14px', borderRadius: '8px' }}>
                    View All Directory <CaretRight weight="bold" size={13} />
                </Link>
            </div>

            <div className="patients-grid-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px', marginBottom: '40px' }}>
                {confirmedAppointments.map((apt, index) => (
                    <motion.div
                        key={apt.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="patient-list-card hover-lift"
                        onClick={() => setSelectedPatientDetails(apt)}
                        style={{
                            background: 'var(--card-bg, #FFFFFF)',
                            border: '1px solid var(--border-color, #E2E8F0)',
                            padding: '22px',
                            borderRadius: '18px',
                            display: 'flex',
                            alignItems: 'start',
                            gap: '16px',
                            cursor: 'pointer',
                            boxShadow: '0 2px 8px -2px rgba(15, 23, 42, 0.05)',
                            position: 'relative'
                        }}
                    >
                        <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '14px',
                            background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.15rem',
                            fontWeight: '800',
                            flexShrink: 0,
                            boxShadow: '0 4px 10px rgba(37, 99, 235, 0.2)'
                        }}>
                            {apt.patientName.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                <h4 style={{ margin: 0, fontSize: '1.08rem', fontWeight: 800, color: 'var(--text-main, #0F172A)' }}>{apt.patientName}</h4>
                                <div style={{
                                    fontSize: '0.72rem',
                                    fontWeight: 700,
                                    padding: '3px 9px',
                                    borderRadius: '999px',
                                    background: 'rgba(16, 185, 129, 0.1)',
                                    color: '#10B981',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                    textTransform: 'capitalize'
                                }}>
                                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981' }}></span>
                                    {apt.status}
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px', fontSize: '0.88rem', color: 'var(--text-muted, #64748B)' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Clock size={16} weight="duotone" color="#2563EB" /> {safeFormatDate(apt.time, 'MMMM d, h:mm a')}
                                </span>

                                {/* Medical Details Badge Row */}
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                    {apt.specialist && (
                                        <span style={{ background: '#EFF6FF', color: '#1D4ED8', padding: '3px 10px', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 700, border: '1px solid rgba(37, 99, 235, 0.15)' }}>
                                            {apt.specialist}
                                        </span>
                                    )}
                                    {apt.symptoms !== 'Not specified' && (
                                        <span style={{ background: 'var(--bg-color, #F8FAFC)', color: 'var(--text-main, #374151)', padding: '3px 10px', borderRadius: '8px', fontSize: '0.78rem', border: '1px solid var(--border-color, #E2E8F0)' }}>
                                            {apt.symptoms}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Patient Details Modal */}
            {selectedPatientDetails && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(15, 23, 42, 0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 1100, backdropFilter: 'blur(8px)'
                }} onClick={() => setSelectedPatientDetails(null)}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.94 }}
                        animate={{ opacity: 1, scale: 1 }}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            background: 'var(--card-bg, #FFFFFF)',
                            padding: '32px 36px',
                            borderRadius: '24px',
                            width: '92%',
                            maxWidth: '520px',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
                            border: '1px solid var(--border-color, #E2E8F0)',
                            maxHeight: '90vh',
                            overflowY: 'auto'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ width: 38, height: 38, borderRadius: '10px', background: 'rgba(37, 99, 235, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB' }}>
                                    <User weight="bold" size={20} />
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main, #0F172A)' }}>Patient Record Summary</h3>
                                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted, #64748B)' }}>Confirmed clinical visit file</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedPatientDetails(null)} style={{ background: 'transparent', border: 'none', padding: '6px', cursor: 'pointer', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="hover-bg">
                                <XCircle size={28} weight="fill" color="var(--text-muted, #94A3B8)" />
                            </button>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '22px', padding: '16px 20px', background: 'var(--bg-color, #F8FAFC)', borderRadius: '16px', border: '1px solid var(--border-color, #E2E8F0)' }}>
                            <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'linear-gradient(135deg, #2563EB, #1D4ED8)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: '800', flexShrink: 0, boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)' }}>
                                {selectedPatientDetails.patientName.charAt(0).toUpperCase()}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                                    <h4 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main, #0F172A)' }}>{selectedPatientDetails.patientName}</h4>
                                    <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', background: 'rgba(16, 185, 129, 0.1)', color: '#10B981', textTransform: 'uppercase' }}>
                                        {selectedPatientDetails.status}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted, #64748B)', fontSize: '0.88rem' }}>
                                    <Phone weight="bold" size={15} color="#2563EB" />
                                    <span style={{ fontWeight: 600 }}>{selectedPatientDetails.contactNumber}</span>
                                </div>
                            </div>
                        </div>

                        <div className="modal-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            {/* Specialist */}
                            <div className="detail-item" style={{ background: 'var(--bg-color, #F8FAFC)', padding: '14px 16px', borderRadius: '12px', border: '1px solid var(--border-color, #E2E8F0)' }}>
                                <label style={{ fontSize: '0.72rem', color: 'var(--text-muted, #64748B)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>SPECIALIST</label>
                                <p style={{ margin: 0, fontSize: '0.98rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', color: '#2563EB' }}>
                                    <User size={18} weight="bold" />
                                    {selectedPatientDetails.specialist}
                                </p>
                            </div>

                            {/* Time */}
                            <div className="detail-item" style={{ background: 'var(--bg-color, #F8FAFC)', padding: '14px 16px', borderRadius: '12px', border: '1px solid var(--border-color, #E2E8F0)' }}>
                                <label style={{ fontSize: '0.72rem', color: 'var(--text-muted, #64748B)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>APPOINTMENT TIME</label>
                                <p style={{ margin: 0, fontSize: '0.92rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-main, #0F172A)' }}>
                                    <Clock size={18} weight="bold" color="#2563EB" />
                                    {safeFormatDate(selectedPatientDetails.time, 'MMM d, h:mm a')}
                                </p>
                            </div>

                            {/* Attender Details */}
                            <div className="detail-item" style={{ gridColumn: '1 / -1', background: 'var(--bg-color, #F8FAFC)', padding: '14px 16px', borderRadius: '12px', border: '1px solid var(--border-color, #E2E8F0)' }}>
                                <label style={{ fontSize: '0.72rem', color: 'var(--text-muted, #64748B)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>ATTENDER CONTACT</label>
                                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem' }}>
                                        <UserPlus size={16} weight="bold" color="#2563EB" />
                                        <span style={{ fontWeight: 600, color: 'var(--text-main, #0F172A)' }}>{selectedPatientDetails.attenderName}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem' }}>
                                        <Phone size={16} weight="bold" color="#2563EB" />
                                        <span style={{ color: 'var(--text-muted, #64748B)' }}>{selectedPatientDetails.attenderPhone}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Address */}
                            <div className="detail-item" style={{ gridColumn: '1 / -1', background: 'var(--bg-color, #F8FAFC)', padding: '14px 16px', borderRadius: '12px', border: '1px solid var(--border-color, #E2E8F0)' }}>
                                <label style={{ fontSize: '0.72rem', color: 'var(--text-muted, #64748B)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>ADDRESS</label>
                                <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: '1.5', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-main, #334155)', fontWeight: 500 }}>
                                    <MapPin size={18} weight="bold" color="#2563EB" />
                                    {selectedPatientDetails.address}
                                </p>
                            </div>

                            {/* Symptoms */}
                            <div className="detail-item" style={{ gridColumn: '1 / -1', background: '#EFF6FF', padding: '14px 16px', borderRadius: '12px', border: '1px solid #BFDBFE' }}>
                                <label style={{ fontSize: '0.72rem', color: '#1E40AF', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>REPORTED SYMPTOMS & CLINICAL NOTES</label>
                                <div style={{ color: '#1E40AF', fontSize: '0.92rem', lineHeight: '1.5', fontWeight: 500 }}>
                                    {selectedPatientDetails.symptoms}
                                </div>
                            </div>
                        </div>

                        <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => setSelectedPatientDetails(null)}
                                style={{
                                    background: '#2563EB',
                                    color: 'white',
                                    border: 'none',
                                    padding: '11px 28px',
                                    borderRadius: '12px',
                                    fontSize: '0.92rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)'
                                }}
                            >
                                Close Details
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Recent Prescriptions Section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'rgba(124, 58, 237, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7C3AED' }}>
                        <FileText weight="bold" size={20} />
                    </div>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main, #0F172A)', letterSpacing: '-0.02em' }}>
                        Recent Prescriptions
                    </h3>
                </div>
                <Link to="/prescription" style={{ color: '#7C3AED', fontWeight: 700, fontSize: '0.86rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(124, 58, 237, 0.08)', padding: '6px 14px', borderRadius: '8px' }}>
                    Prescription Registry <CaretRight weight="bold" size={13} />
                </Link>
            </div>

            {prescriptions.length === 0 ? (
                <div style={{
                    padding: '48px 24px',
                    textAlign: 'center',
                    background: 'var(--card-bg, #FFFFFF)',
                    borderRadius: '20px',
                    color: 'var(--text-muted, #64748B)',
                    border: '1px solid var(--border-color, #E2E8F0)',
                    marginBottom: '40px'
                }}>
                    <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(124, 58, 237, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                        <Pill size={32} color="#7C3AED" weight="duotone" />
                    </div>
                    <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-main, #0F172A)', marginBottom: '4px' }}>No Prescriptions Recorded Yet</div>
                    <p style={{ margin: 0, fontSize: '0.88rem' }}>Issued doctor prescriptions will be indexed here automatically.</p>
                </div>
            ) : (
                <div className="prescriptions-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                    {prescriptions.map((p, index) => (
                        <motion.div
                            key={p.id}
                            initial={{ opacity: 0, scale: 0.96 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.08 }}
                            className="prescription-card hover-lift"
                            style={{
                                background: 'var(--card-bg, #FFFFFF)',
                                padding: '22px 24px',
                                borderRadius: '18px',
                                border: '1px solid var(--border-color, #E2E8F0)',
                                boxShadow: '0 2px 8px -2px rgba(15, 23, 42, 0.05)'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '14px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{
                                        width: '46px',
                                        height: '46px',
                                        borderRadius: '13px',
                                        background: 'linear-gradient(135deg, #7C3AED, #6D28D9)',
                                        color: 'white',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '1.1rem',
                                        fontWeight: '800',
                                        boxShadow: '0 4px 10px rgba(124, 58, 237, 0.25)',
                                        flexShrink: 0
                                    }}>
                                        {(p.patientName || 'Patient').charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main, #0F172A)' }}>{p.patientName || 'Patient'}</h4>
                                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted, #64748B)', fontWeight: 600 }}>ID: {p.patientId}</span>
                                    </div>
                                </div>
                                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted, #64748B)', background: 'var(--bg-color, #F8FAFC)', padding: '5px 10px', borderRadius: '8px', border: '1px solid var(--border-color, #E2E8F0)' }}>
                                    {safeFormatDate(p.timestamp, 'MMM d, h:mm a')}
                                </span>
                            </div>

                            <div style={{ borderTop: '1px solid var(--border-color, #E2E8F0)', paddingTop: '14px', marginTop: '12px' }}>
                                <div style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                    <div style={{ width: 28, height: 28, borderRadius: '8px', background: 'rgba(37, 99, 235, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB' }}>
                                        <Pill color="#2563EB" weight="fill" size={16} />
                                    </div>
                                    <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-main, #0F172A)' }}>{p.prescribedMedicines || p.name}</span>
                                    {p.dose && p.dose !== 'As advised' && (
                                        <span style={{ fontSize: '0.78rem', fontWeight: 700, padding: '2px 8px', borderRadius: '6px', background: 'rgba(37, 99, 235, 0.08)', color: '#2563EB' }}>({p.dose})</span>
                                    )}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted, #64748B)', fontSize: '0.88rem' }}>
                                    <Clock weight="bold" size={16} color="#D97706" />
                                    <span>Timings:</span>
                                    <span style={{ color: '#D97706', fontWeight: 700, background: 'rgba(245, 158, 11, 0.1)', padding: '2px 8px', borderRadius: '6px' }}>{p.timing || p.time || 'As directed'}</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div >
    );
};

export default Dashboard;
