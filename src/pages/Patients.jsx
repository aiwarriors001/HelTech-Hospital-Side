
import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { motion } from 'framer-motion';
import { Users, MagnifyingGlass, CaretRight, User, Drop, Clock, FileText, XCircle, Phone, MapPin, UserPlus } from '@phosphor-icons/react';
import { format } from 'date-fns';

const Patients = () => {
    const { getConfirmedAppointments } = useData(); // Get from context
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPatientDetails, setSelectedPatientDetails] = useState(null);

    const scheduledVisits = getConfirmedAppointments();

    const filteredAppointments = scheduledVisits.filter(apt =>
        apt.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.patientId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="page-container" style={{ paddingBottom: '80px' }}>
            <div className="dashboard-header">
                <div>
                    <h1 style={{ marginBottom: '8px', fontSize: '2rem', fontWeight: 800 }}>Patient Management</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Manage scheduled patient visits</p>
                </div>
                <div className="current-date-pill">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Users size={20} weight="bold" />
                        <span>{scheduledVisits.length} Scheduled</span>
                    </div>
                </div>
            </div>

            {/* Search Bar */}
            <div style={{ marginBottom: '32px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <div className="glass-card-premium" style={{ flex: 1, padding: '24px', display: 'flex', alignItems: 'center' }}>
                    <div style={{ position: 'relative', width: '100%' }}>
                        <MagnifyingGlass size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            placeholder="Search scheduled patients..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="form-input"
                            style={{ paddingLeft: '48px', width: '100%' }}
                        />
                    </div>
                </div>
            </div>

            {/* Scheduled Visits List */}
            <div className="scheduled-grid" style={{ display: 'grid', gap: '16px' }}>
                {filteredAppointments.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                        <p>No confirmed appointments found.</p>
                        <p style={{ fontSize: '0.9rem' }}>Approve appointments from the Dashboard.</p>
                    </div>
                ) : (
                    filteredAppointments.map((apt, index) => (
                        <motion.div
                            key={apt.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="appointment-row hover-lift"
                            style={{
                                background: 'var(--card-bg)',
                                padding: '24px',
                                borderRadius: '16px',
                                border: '1px solid var(--border-color)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '16px',
                                cursor: 'pointer'
                            }}
                            onClick={() => setSelectedPatientDetails(apt)}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#dcfce7', color: '#166534', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 'bold' }}>
                                    {apt.patientName.charAt(0)}
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{apt.patientName}</h3>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>ID: {apt.patientId}</span>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Scheduled For</span>
                                <div style={{ fontWeight: '600', fontSize: '1.05rem' }}>
                                    {new Date(apt.time).toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Reason</span>
                                <span style={{ fontWeight: '500' }}>{apt.reason}</span>
                            </div>

                            <div className="status-pill active">
                                Confirmed
                            </div>
                        </motion.div>
                    ))
                )}
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
        </div >
    );
};

export default Patients;
