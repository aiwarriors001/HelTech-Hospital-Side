import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import {
    CalendarCheck, VideoCamera, Pulse, CheckCircle,
    Clock, Stethoscope, ChatCircleDots
} from '@phosphor-icons/react';

const S = {
    section: { padding: '52px 0 0' },
    tag: {
        display: 'inline-flex', alignItems: 'center', gap: '6px',
        padding: '5px 14px', borderRadius: '999px',
        background: 'rgba(37,99,235,0.09)', color: '#2563EB',
        fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.04em',
        textTransform: 'uppercase', marginBottom: '14px'
    },
    h2: {
        fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main,#1F2937)',
        letterSpacing: '-0.02em', marginBottom: '10px', lineHeight: 1.25
    },
    sub: { fontSize: '1rem', color: 'var(--text-muted,#64748B)', maxWidth: '540px', lineHeight: 1.6 },
    card: {
        background: 'var(--card-bg,#fff)', borderRadius: '16px',
        border: '1px solid var(--border-color,#E2E8F0)',
        padding: '28px', transition: 'box-shadow .2s, transform .2s',
    },
    divider: { height: '1px', background: 'var(--border-color,#E2E8F0)', margin: '52px 0 0' }
};

const Tag = ({ icon: Icon, label }) => (
    <div style={S.tag}><Icon size={13} weight="bold" /> {label}</div>
);

const Services = () => {
    const { user } = useAuth();
    const [apptForm, setApptForm] = useState({ name: '', phone: '', date: '', dept: '', note: '' });
    const [apptSent, setApptSent] = useState(false);

    if (!user) return (
        <div style={{ textAlign: 'center', padding: '60px' }}>
            <div className="spinner" style={{ width: '2.5rem', height: '2.5rem', borderTopColor: 'var(--primary-color)' }}></div>
        </div>
    );

    const hospitalName = user.hospitalName || 'City General Hospital';

    const handleAppt = (e) => { e.preventDefault(); setApptSent(true); setApptForm({ name: '', phone: '', date: '', dept: '', note: '' }); };

    const depts = ['General Medicine','Cardiology','Orthopaedics','Paediatrics','ENT','Gynaecology','Dermatology'];

    const consultFeatures = [
        { icon: VideoCamera, color: '#7C3AED', bg: '#7C3AED18', title: 'HD Video Session', desc: 'Crystal-clear video with auto-reconnect. Works on any device or browser.' },
        { icon: Pulse, color: '#DC2626', bg: '#DC262618', title: 'Real-Time Vitals', desc: 'Share oxygen levels, BP readings, and glucose data live during the call.' },
        { icon: ChatCircleDots, color: '#0D9488', bg: '#0D948818', title: 'In-Call Prescription', desc: 'Doctor issues a digital prescription right at the end of your session.' },
    ];


    return (
        <div id="services-content" style={{ paddingBottom: '60px' }}>

            {/* Page header */}
            <div style={{ marginBottom: '8px' }}>
                <h2 style={{ ...S.h2, fontSize: '2rem', marginBottom: '6px' }}>Patient Services</h2>
                <p style={{ ...S.sub }}>Book appointments, start a live consultation, or get in touch with {hospitalName}.</p>
            </div>

            {/* ── APPOINTMENT ── */}
            <div style={S.section}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', alignItems: 'start' }}>
                    <div>
                        <Tag icon={CalendarCheck} label="Book Appointment" />
                        <h2 style={S.h2}>Schedule an Appointment</h2>
                        <p style={{ ...S.sub, marginBottom: '24px' }}>Patients can request an appointment directly. Our team will confirm within 2 hours during working hours (Mon-Sat, 8 AM - 8 PM).</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            {[{ icon: Clock, text: 'Mon - Sat: 8:00 AM - 8:00 PM' }, { icon: CheckCircle, text: 'Confirmation within 2 hours' }, { icon: Stethoscope, text: 'General, Cardiology, Ortho, Paediatrics & more' }].map(({ icon: Icon, text }) => (
                                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-main,#374151)', fontSize: '0.9rem' }}>
                                    <Icon size={18} color="#2563EB" weight="bold" style={{ flexShrink: 0 }} />{text}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div style={S.card}>
                        {apptSent ? (
                            <div style={{ textAlign: 'center', padding: '32px 0' }}>
                                <CheckCircle size={52} weight="fill" color="#0D9488" style={{ marginBottom: '12px' }} />
                                <h3 style={{ fontWeight: 700, color: 'var(--text-main,#1F2937)', marginBottom: '6px' }}>Request Received!</h3>
                                <p style={{ color: 'var(--text-muted,#64748B)', fontSize: '0.9rem' }}>We will confirm your appointment shortly.</p>
                                <button onClick={() => setApptSent(false)} style={{ marginTop: '20px', padding: '8px 22px', borderRadius: '8px', border: '1.5px solid #2563EB', background: 'transparent', color: '#2563EB', fontWeight: 600, cursor: 'pointer' }}>Book Another</button>
                            </div>
                        ) : (
                            <form onSubmit={handleAppt} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                <h3 style={{ fontWeight: 700, color: 'var(--text-main,#1F2937)', marginBottom: '4px', fontSize: '1.05rem' }}>New Appointment Request</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <div><label className="form-label">Patient Name</label><input className="form-input" placeholder="e.g. Murugan K." required value={apptForm.name} onChange={e => setApptForm(p => ({ ...p, name: e.target.value }))} /></div>
                                    <div><label className="form-label">Phone Number</label><input className="form-input" placeholder="e.g. 9444123456" required value={apptForm.phone} onChange={e => setApptForm(p => ({ ...p, phone: e.target.value }))} /></div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <div><label className="form-label">Preferred Date</label><input type="date" className="form-input" required value={apptForm.date} onChange={e => setApptForm(p => ({ ...p, date: e.target.value }))} /></div>
                                    <div><label className="form-label">Department</label>
                                        <select className="form-input" required value={apptForm.dept} onChange={e => setApptForm(p => ({ ...p, dept: e.target.value }))}>
                                            <option value="">Select...</option>
                                            {depts.map(d => <option key={d}>{d}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div><label className="form-label">Symptoms / Note <span style={{ fontWeight: 400, color: 'var(--text-muted,#94A3B8)' }}>(optional)</span></label>
                                    <textarea className="form-input" rows={2} style={{ resize: 'none' }} placeholder="Brief description of symptoms..." value={apptForm.note} onChange={e => setApptForm(p => ({ ...p, note: e.target.value }))} />
                                </div>
                                <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: '4px' }}>
                                    <CalendarCheck size={18} weight="bold" style={{ marginRight: '7px' }} />Book Appointment
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>

            <div style={S.divider} />

            {/* ── LIVE CONSULTANCY ── */}
            <div style={S.section}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <Tag icon={VideoCamera} label="Live Consultancy" />
                    <h2 style={{ ...S.h2, textAlign: 'center' }}>Online Video Consultations</h2>
                    <p style={{ ...S.sub, margin: '0 auto', textAlign: 'center' }}>Connect with our doctors face-to-face from home. Secure, HIPAA-compliant video sessions available across all major specialties.</p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '20px' }}>
                    {consultFeatures.map(({ icon: Icon, color, bg, title, desc }) => (
                        <div key={title} style={{ ...S.card, textAlign: 'center' }}>
                            <div style={{ width: 56, height: 56, borderRadius: '16px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                                <Icon size={28} color={color} weight="fill" />
                            </div>
                            <h3 style={{ fontWeight: 700, color: 'var(--text-main,#1F2937)', marginBottom: '8px', fontSize: '1rem' }}>{title}</h3>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted,#64748B)', lineHeight: 1.6 }}>{desc}</p>
                        </div>
                    ))}
                </div>
                <div style={{ marginTop: '24px', borderRadius: '16px', background: 'linear-gradient(135deg,#7C3AED 0%,#2563EB 100%)', padding: '32px 36px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
                    <div>
                        <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>AVAILABLE NOW</div>
                        <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'white', marginBottom: '4px' }}>7 Doctors Online Right Now</div>
                        <div style={{ color: 'rgba(255,255,255,0.78)', fontSize: '0.9rem' }}>Average wait time: under 5 minutes</div>
                    </div>
                    <Link to="/consultancy" className="cta-btn ripple-button hover-lift" style={{ background: 'white', color: '#7C3AED', fontWeight: 700, padding: '12px 28px' }}>
                        <VideoCamera size={18} weight="bold" style={{ marginRight: '8px' }} />Start Consultation
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Services;
