
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { motion } from 'framer-motion';
import { Users, Clock, CalendarBlank, ChartLine, Bell, XCircle, CheckCircle, FileText, Pill, User, Phone, MapPin, UserPlus, CaretRight, Drop } from '@phosphor-icons/react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';


const Dashboard = () => {
    const { role } = useAuth();
    const { getAllPrescriptions, getPendingAppointments, confirmAppointment, rescheduleAppointment, getConfirmedAppointments, realTimePatientCount } = useData();
    const prescriptions = getAllPrescriptions();
    const pendingAppointments = getPendingAppointments();
    const confirmedAppointments = getConfirmedAppointments().slice(0, 3); // Top 3 list

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

    // Patient View
    if (role === 'patient') {
        return (
            <div className="dashboard-container">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1>My Dashboard</h1>
                    <p>Welcome to your personal health dashboard.</p>
                    {/* Patient specific stats can go here */}
                </motion.div>
            </div>
        );
    }

    // Hospital View
    return (
        <div className="dashboard-container" style={{ position: 'relative' }}>
            {/* Notification Toast */}
            <motion.div
                initial={{ opacity: 0, y: -20, x: '-50%' }}
                animate={{ opacity: notification.show ? 1 : 0, y: notification.show ? 20 : -20, x: '-50%' }}
                style={{
                    position: 'fixed',
                    top: '20px',
                    left: '50%',
                    background: notification.type === 'success' ? '#059669' : '#DC2626',
                    color: 'white',
                    padding: '12px 24px',
                    borderRadius: '24px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    zIndex: 2000,
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    pointerEvents: 'none'
                }}
            >
                {notification.type === 'success' ? <CheckCircle weight="fill" size={20} /> : <XCircle weight="fill" size={20} />}
                {notification.message}
            </motion.div>

            <div className="dashboard-header">
                <div>
                    <h1 style={{ marginBottom: '8px', fontSize: '2rem', fontWeight: 800 }}>Hospital Dashboard</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Overview of patient prescriptions and activity</p>
                </div>
                <div className="current-date-pill">
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
                        padding: '32px',
                        borderRadius: '24px',
                        position: 'relative',
                        overflow: 'hidden',
                        boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.4)'
                    }}
                >
                    {/* Background Texture Icon */}
                    <Users weight="duotone" style={{ position: 'absolute', right: '-20px', bottom: '-20px', fontSize: '180px', opacity: '0.1', color: 'white', transform: 'rotate(-10deg)' }} />

                    <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                <div style={{ background: 'rgba(255,255,255,0.2)', padding: '8px', borderRadius: '12px', display: 'flex' }}>
                                    <Users weight="fill" size={24} color="white" />
                                </div>
                                <span style={{ fontSize: '1rem', fontWeight: '500', opacity: 0.9 }}>Total Unique Patients</span>
                            </div>
                            <div style={{ fontSize: '3.5rem', fontWeight: '800', lineHeight: 1, marginBottom: '8px' }}>
                                {realTimePatientCount}
                            </div>
                        </div>

                        {/* Visual Progress/Graph Placeholder for "Premium" feel */}
                        <div style={{ display: 'flex', gap: '4px', alignItems: 'flex-end', height: '60px', opacity: 0.8 }}>
                            {[40, 65, 50, 80, 60, 90, 75].map((h, i) => (
                                <div key={i} style={{ width: '8px', height: `${h}%`, background: 'white', borderRadius: '4px' }}></div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Appointment Request Section */}
            <h3 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.25rem', fontWeight: 700 }}>
                <Clock weight="duotone" size={28} color="var(--primary-color)" /> Appointment Requests
            </h3>

            {pendingAppointments.length === 0 ? (
                <div style={{ padding: '32px', textAlign: 'center', background: 'var(--card-bg)', borderRadius: '20px', border: '1px solid var(--border-color)', marginBottom: '40px', color: 'var(--text-muted)' }}>
                    <p>No pending appointment requests.</p>
                </div>
            ) : (
                <div className="appointments-list" style={{ display: 'grid', gap: '16px', marginBottom: '40px' }}>
                    {pendingAppointments.map(apt => (
                        <motion.div
                            key={apt.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="appointment-card"
                            style={{
                                background: 'var(--card-bg)',
                                padding: '20px 24px',
                                borderRadius: '16px',
                                border: '1px solid var(--border-color)',
                                boxShadow: 'var(--shadow-sm)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                flexWrap: 'wrap',
                                gap: '16px'
                            }}
                        >
                            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                    {apt.patientName.charAt(0)}
                                </div>
                                <div>
                                    <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>{apt.patientName}</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Clock size={16} /> {format(new Date(apt.time), 'MMM d, h:mm a')}
                                        </span>
                                        {/* Medical Details */}
                                        <div style={{ display: 'flex', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
                                            <span style={{ background: '#eff6ff', color: '#1d4ed8', padding: '2px 8px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '500' }}>
                                                {apt.specialist}
                                            </span>
                                            <span style={{ background: '#f3f4f6', color: '#374151', padding: '2px 8px', borderRadius: '6px', fontSize: '0.8rem' }}>
                                                Sx: {apt.symptoms}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button
                                    onClick={() => handleApprove(apt.id)}
                                    className="hover-lift"
                                    title="Approve"
                                    style={{
                                        background: '#dcfce7',
                                        color: '#166534',
                                        border: 'none',
                                        padding: '10px',
                                        borderRadius: '12px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <CheckCircle size={24} weight="fill" />
                                </button>
                                <button
                                    onClick={() => openReschedule(apt)}
                                    className="hover-lift"
                                    title="Reschedule"
                                    style={{
                                        background: '#fee2e2',
                                        color: '#991b1b',
                                        border: 'none',
                                        padding: '10px',
                                        borderRadius: '12px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <XCircle size={24} weight="fill" />
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
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    backdropFilter: 'blur(4px)'
                }}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        style={{
                            background: 'var(--card-bg)',
                            padding: '32px',
                            borderRadius: '20px',
                            width: '90%',
                            maxWidth: '400px',
                            boxShadow: 'var(--shadow-xl)'
                        }}
                    >
                        <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '1.5rem' }}>Schedule Appointment</h3>
                        <p style={{ marginBottom: '20px', color: 'var(--text-muted)' }}>Enter the time for {selectedAppointment?.patientName} to come.</p>

                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>New Date & Time</label>
                            <input
                                type="datetime-local"
                                value={newTime}
                                onChange={(e) => setNewTime(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: '1px solid var(--border-color)',
                                    background: 'var(--bg-color)',
                                    color: 'var(--text-main)',
                                    fontSize: '1rem'
                                }}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => setIsRescheduleOpen(false)}
                                style={{
                                    padding: '10px 20px',
                                    borderRadius: '8px',
                                    border: '1px solid var(--border-color)',
                                    background: 'transparent',
                                    color: 'var(--text-main)',
                                    cursor: 'pointer',
                                    fontWeight: '600'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleRescheduleSubmit}
                                style={{
                                    padding: '10px 20px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    background: 'var(--primary-color)',
                                    color: 'white',
                                    cursor: 'pointer',
                                    fontWeight: '600',
                                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)'
                                }}
                            >
                                Confirm Change
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}






            {/* Patient Directory Preview */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.25rem', fontWeight: 700 }}>
                    <Users weight="duotone" size={28} color="var(--primary-color)" /> Recent Patients
                </h3>
                <Link to="/patients" style={{ color: 'var(--primary-color)', fontWeight: '600', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    View All <CaretRight weight="bold" />
                </Link>
            </div>

            <div className="patients-grid-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginBottom: '40px' }}>
                {confirmedAppointments.map((apt, index) => (
                    <motion.div
                        key={apt.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="patient-list-card hover-lift"
                        onClick={() => setSelectedPatientDetails(apt)}
                        style={{
                            background: 'var(--card-bg)',
                            border: '1px solid var(--border-color)',
                            padding: '20px',
                            borderRadius: '16px',
                            display: 'flex',
                            alignItems: 'start', // Align to start for better multiline handling
                            gap: '16px',
                            cursor: 'pointer'
                        }}
                    >
                        <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 'bold', flexShrink: 0 }}>
                            {apt.patientName.charAt(0)}
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>{apt.patientName}</h4>
                                <div className={`status-pill active`} style={{ fontSize: '0.7rem', padding: '4px 8px', alignSelf: 'start' }}>
                                    {apt.status}
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Clock size={16} weight="duotone" /> {format(new Date(apt.time), 'MMMM d, h:mm a')}
                                </span>

                                {/* Medical Details Badge Row */}
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                    {apt.specialist && (
                                        <span style={{ background: '#eff6ff', color: '#1d4ed8', padding: '4px 10px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <User size={14} weight="duotone" /> {apt.specialist}
                                        </span>
                                    )}
                                    {apt.symptoms !== 'Not specified' && (
                                        <span style={{ background: '#f3f4f6', color: '#374151', padding: '4px 10px', borderRadius: '8px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <FileText size={14} weight="duotone" /> {apt.symptoms}
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
                    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 1100, backdropFilter: 'blur(4px)'
                }} onClick={() => setSelectedPatientDetails(null)}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            background: 'var(--card-bg)',
                            padding: '32px',
                            borderRadius: '24px',
                            width: '90%',
                            maxWidth: '500px',
                            boxShadow: 'var(--shadow-xl)',
                            maxHeight: '90vh',
                            overflowY: 'auto'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Appointment Details</h2>
                            <button onClick={() => setSelectedPatientDetails(null)} style={{ background: 'transparent', border: 'none', padding: '8px', cursor: 'pointer', borderRadius: '50%', display: 'flex' }} className="hover-bg">
                                <XCircle size={32} weight="fill" color="var(--text-muted)" />
                            </button>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid var(--border-color)' }}>
                            <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'var(--primary-light)', color: 'var(--primary-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 'bold' }}>
                                {selectedPatientDetails.patientName.charAt(0)}
                            </div>
                            <div style={{ flex: 1 }}>
                                <h3 style={{ margin: '0 0 4px 0', fontSize: '1.4rem' }}>{selectedPatientDetails.patientName}</h3>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '1rem', marginBottom: '8px' }}>
                                    <Phone weight="duotone" />
                                    <span>{selectedPatientDetails.contactNumber}</span>
                                </div>
                                <div className={`status-pill active`} style={{ display: 'inline-block' }}>
                                    {selectedPatientDetails.status.toUpperCase()}
                                </div>
                            </div>
                        </div>

                        <div className="modal-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            {/* Row 1: Specialist & Time */}
                            <div className="detail-item">
                                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600', display: 'block', marginBottom: '8px' }}>SPECIALIST REQUIRED</label>
                                <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-color)' }}>
                                    <User size={20} weight="duotone" />
                                    {selectedPatientDetails.specialist}
                                </p>
                            </div>

                            <div className="detail-item">
                                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600', display: 'block', marginBottom: '8px' }}>APPOINTMENT TIME</label>
                                <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Clock size={20} weight="duotone" />
                                    {format(new Date(selectedPatientDetails.time), 'MMM d, yyyy - h:mm a')}
                                </p>
                            </div>

                            {/* Row 2: Attender Details (Full Width) */}
                            <div className="detail-item" style={{ gridColumn: '1 / -1', background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600', display: 'block', marginBottom: '8px' }}>ATTENDER DETAILS</label>
                                <div style={{ display: 'flex', gap: '24px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <UserPlus size={18} weight="duotone" color="var(--text-muted)" />
                                        <span style={{ fontWeight: '500' }}>{selectedPatientDetails.attenderName}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Phone size={18} weight="duotone" color="var(--text-muted)" />
                                        <span>{selectedPatientDetails.attenderPhone}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Row 3: Address (Full Width) */}
                            <div className="detail-item" style={{ gridColumn: '1 / -1' }}>
                                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600', display: 'block', marginBottom: '8px' }}>ADDRESS</label>
                                <p style={{ margin: 0, fontSize: '1rem', lineHeight: '1.5', display: 'flex', alignItems: 'start', gap: '8px' }}>
                                    <MapPin size={20} weight="duotone" color="var(--primary-color)" style={{ marginTop: '2px' }} />
                                    {selectedPatientDetails.address}
                                </p>
                            </div>

                            {/* Row 4: Symptoms (Full Width) */}
                            <div className="detail-item" style={{ gridColumn: '1 / -1' }}>
                                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600', display: 'block', marginBottom: '8px' }}>SYMPTOMS</label>
                                <div style={{ background: '#eff6ff', padding: '16px', borderRadius: '12px', border: '1px solid #bfdbfe', color: '#1e40af', fontSize: '1rem', lineHeight: '1.5' }}>
                                    {selectedPatientDetails.symptoms}
                                </div>
                            </div>
                        </div>

                        <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => setSelectedPatientDetails(null)}
                                style={{
                                    background: 'var(--primary-color)',
                                    color: 'white',
                                    border: 'none',
                                    padding: '12px 32px',
                                    borderRadius: '12px',
                                    fontSize: '1rem',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    boxShadow: 'var(--shadow-md)'
                                }}
                            >
                                Close Details
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            <h3 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.25rem', fontWeight: 700 }}>
                <FileText weight="duotone" size={28} color="var(--primary-color)" /> Recent Prescriptions
            </h3>

            {
                prescriptions.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center', background: 'var(--card-bg)', borderRadius: '20px', color: 'var(--text-muted)', border: '1px solid var(--border-color)' }}>
                        <Pill size={64} style={{ opacity: 0.2, marginBottom: '16px', color: 'var(--text-main)' }} />
                        <p style={{ fontSize: '1.1rem' }}>No prescriptions recorded yet.</p>
                    </div>
                ) : (
                    <div className="prescriptions-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
                        {prescriptions.map((p, index) => (
                            <motion.div
                                key={p.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.1 }}
                                className="prescription-card hover-lift"
                                style={{
                                    background: 'var(--card-bg)',
                                    padding: '24px',
                                    borderRadius: '20px',
                                    border: '1px solid var(--border-color)',
                                    boxShadow: 'var(--shadow-sm)'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'var(--primary-light)', color: 'var(--primary-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <User weight="bold" size={24} />
                                        </div>
                                        <div>
                                            <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>{p.patientName}</h4>
                                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>ID: {p.patientId}</span>
                                        </div>
                                    </div>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', background: 'var(--bg-color)', padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                                        {format(new Date(p.timestamp), 'MMM d, h:mm a')}
                                    </span>
                                </div>

                                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginTop: '16px' }}>
                                    <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <Pill color="var(--primary-color)" weight="fill" size={20} />
                                        <span style={{ fontWeight: '700', fontSize: '1.05rem' }}>{p.name}</span>
                                        <span style={{ color: 'var(--text-muted)' }}>({p.dose})</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                                        <Clock weight="bold" size={18} />
                                        Take at: <span style={{ color: 'var(--primary-dark)', fontWeight: '600', background: 'var(--primary-light)', padding: '2px 8px', borderRadius: '4px' }}>{p.time}</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )
            }
        </div >
    );
};

export default Dashboard;
