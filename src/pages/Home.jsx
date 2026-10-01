import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import {
    Hospital, CalendarCheck, VideoCamera,
    Stethoscope, Star, FirstAid, Heartbeat,
    Phone, EnvelopeSimple, MapPin, Clock,
    ArrowRight, Sparkle, ShieldCheck, Certificate
} from '@phosphor-icons/react';

/* ─── Design tokens ─────────────────────────────────────── */
const COLOR = {
    blue:   '#2563EB',
    teal:   '#0D9488',
    purple: '#7C3AED',
    red:    '#DC2626',
    amber:  '#F59E0B',
};

const S = {
    tag: {
        display: 'inline-flex', alignItems: 'center', gap: '6px',
        padding: '4px 13px', borderRadius: '999px',
        background: 'rgba(37,99,235,0.08)', color: COLOR.blue,
        fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em',
        textTransform: 'uppercase', marginBottom: '14px',
        border: '1px solid rgba(37,99,235,0.15)'
    },
    h2: {
        fontSize: '1.95rem', fontWeight: 900, color: 'var(--text-main,#0F172A)',
        letterSpacing: '-0.03em', marginBottom: '12px', lineHeight: 1.15
    },
    sub: {
        fontSize: '0.95rem', color: 'var(--text-muted,#64748B)',
        lineHeight: 1.75, maxWidth: '460px'
    },
    card: {
        background: 'var(--card-bg,#fff)',
        borderRadius: '20px',
        border: '1px solid var(--border-color,#E8EFF6)',
        padding: '28px',
        boxShadow: '0 1px 3px rgba(15,23,42,0.04), 0 4px 16px rgba(15,23,42,0.03)',
        transition: 'box-shadow .2s ease, transform .2s ease',
    },
    divider: {
        height: '1px',
        background: 'linear-gradient(to right, transparent, var(--border-color,#E8EFF6) 20%, var(--border-color,#E8EFF6) 80%, transparent)',
        margin: '60px 0 0'
    }
};

const Tag = ({ icon: Icon, label, color }) => (
    <div style={{ ...S.tag, background: (color || COLOR.blue) + '0D', color: color || COLOR.blue, border: `1px solid ${(color || COLOR.blue)}22` }}>
        <Icon size={11} weight="bold" /> {label}
    </div>
);

const Home = () => {
    const { user } = useAuth();

    if (!user) return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}>
            <div className="spinner" style={{ width: '2.5rem', height: '2.5rem', borderTopColor: COLOR.blue }}></div>
        </div>
    );

    const hospitalName    = user.hospitalName || 'City General Hospital';
    const hospitalPhone   = user.phone        || '+91 9444123456';
    const hospitalEmail   = user.email        || 'admin@hospital.com';
    const hospitalAddress = user.address      || 'Anna Salai, Chennai, Tamil Nadu';

    const quickLinks = [
        { to: '/appointment', icon: CalendarCheck, color: COLOR.blue,   grad: 'linear-gradient(135deg,#1E3A8A 0%,#2563EB 100%)', title: 'View & Approve Appointments',  desc: 'Review incoming patient requests, verify details, and approve appointment slots.' },
        { to: '/consultancy', icon: VideoCamera,   color: COLOR.purple, grad: 'linear-gradient(135deg,#4C1D95 0%,#7C3AED 100%)', title: 'CareConnect (Live Video)', desc: 'Connect with patients remotely through secure HD telemedicine video consultations.' },
    ];

    const aboutStats = [
        { val: '20+',  label: 'Specialties',     color: COLOR.blue   },
        { val: '150+', label: 'Medical Staff',   color: COLOR.teal   },
        { val: '50k+', label: 'Patients Served', color: COLOR.purple },
        { val: '24/7', label: 'Emergency Care',  color: COLOR.red    },
    ];

    const aboutHighlights = [
        { icon: Certificate, color: COLOR.amber,  title: 'NABH Accredited',    desc: 'Highest patient safety and quality standards.' },
        { icon: FirstAid,    color: COLOR.red,    title: '24/7 Emergency',     desc: 'Emergency trauma and ICU round the clock.' },
        { icon: Stethoscope, color: COLOR.blue,   title: 'Expert Specialists', desc: 'Cardiology, Neurology, Oncology, Orthopaedics & 16 more.' },
        { icon: Heartbeat,   color: COLOR.teal,   title: 'Modern Diagnostics', desc: 'MRI, CT Scan, PET, digital X-ray, in-house pathology.' },
    ];

    const contactInfo = [
        { icon: Phone,          color: COLOR.blue,   label: 'Phone / Helpline', value: hospitalPhone },
        { icon: EnvelopeSimple, color: COLOR.teal,   label: 'Email',            value: hospitalEmail },
        { icon: MapPin,         color: COLOR.red,    label: 'Address',          value: hospitalAddress },
        { icon: Clock,          color: COLOR.purple, label: 'Working Hours',    value: 'Mon – Sat: 8 AM – 8 PM  |  Emergency: 24/7' },
    ];

    return (
        <div style={{ paddingBottom: '72px' }}>

            {/* ════════════════════════════════
                1. HERO
            ════════════════════════════════ */}
            <div style={{
                borderRadius: '24px',
                background: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 55%, #1D4ED8 100%)',
                padding: '52px 48px',
                position: 'relative',
                overflow: 'hidden',
            }}>
                {/* decorative blobs */}
                <div style={{ position:'absolute', width:400, height:400, borderRadius:'50%', background:'rgba(255,255,255,0.04)', top:-120, right:-80, pointerEvents:'none' }} />
                <div style={{ position:'absolute', width:200, height:200, borderRadius:'50%', background:'rgba(255,255,255,0.06)', bottom:-60, right:220, pointerEvents:'none' }} />
                <div style={{ position:'absolute', width:100, height:100, borderRadius:'50%', background:'rgba(255,255,255,0.08)', top:40, right:80, pointerEvents:'none' }} />

                {/* grid dot texture */}
                <div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(rgba(255,255,255,0.07) 1px,transparent 1px)', backgroundSize:'28px 28px', pointerEvents:'none' }} />

                <div style={{ position:'relative', zIndex:1 }}>
                    <div style={{ display:'inline-flex', alignItems:'center', gap:'7px', background:'rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.92)', padding:'5px 15px', borderRadius:'999px', fontSize:'0.78rem', fontWeight:700, marginBottom:'20px', border:'1px solid rgba(255,255,255,0.18)', backdropFilter:'blur(6px)', letterSpacing:'0.05em' }}>
                        <Sparkle weight="fill" size={13} /> Central Administrative Portal
                    </div>

                    <h1 style={{ fontSize:'2.7rem', color:'white', fontWeight:900, letterSpacing:'-0.035em', lineHeight:1.12, marginBottom:'16px' }}>
                        Welcome back,<br />
                        <span style={{ background:'linear-gradient(90deg,rgba(255,255,255,1) 0%,rgba(191,219,254,0.9) 100%)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
                            {hospitalName}
                        </span>
                    </h1>

                    <p style={{ fontSize:'1.02rem', color:'rgba(255,255,255,0.75)', maxWidth:'520px', lineHeight:1.72, marginBottom:0 }}>
                        Your complete hospital command centre — manage patients, run live consultations, and issue prescriptions all from one place.
                    </p>
                </div>
            </div>

            {/* ════════════════════════════════
                2. QUICK ACCESS
            ════════════════════════════════ */}
            <div style={{ padding: '40px 0 0' }}>
                <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom:'20px' }}>
                    <div>
                        <Tag icon={CalendarCheck} label="Patient Services" />
                        <h2 style={{ ...S.h2, marginBottom:0, fontSize:'1.5rem' }}>Quick Access</h2>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px', alignItems: 'stretch' }}>
                    {quickLinks.map(({ to, icon: Icon, grad, title, desc }) => (
                        <Link key={title} to={to} style={{ textDecoration: 'none', display: 'flex', height: '100%' }}>
                            <div
                                style={{
                                    flex: 1,
                                    width: '100%',
                                    minHeight: '130px',
                                    borderRadius: '20px',
                                    padding: '28px 32px',
                                    background: grad,
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    gap: '16px',
                                    cursor: 'pointer',
                                    boxShadow: '0 8px 32px -8px rgba(0,0,0,0.25)',
                                    transition: 'transform .2s ease, box-shadow .2s ease',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    boxSizing: 'border-box'
                                }}
                                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 16px 40px -8px rgba(0,0,0,0.3)'; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 8px 32px -8px rgba(0,0,0,0.25)'; }}
                            >
                                {/* shine overlay */}
                                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '50%', background: 'rgba(255,255,255,0.06)', borderRadius: '20px 20px 60% 60%', pointerEvents: 'none' }} />
                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', position: 'relative', zIndex: 1, flex: 1 }}>
                                    <div style={{ width: 54, height: 54, borderRadius: '16px', background: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.2)' }}>
                                        <Icon size={26} color="white" weight="fill" />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 800, fontSize: '1.05rem', marginBottom: '5px', letterSpacing: '-0.01em' }}>{title}</div>
                                        <div style={{ fontSize: '0.84rem', opacity: 0.85, lineHeight: 1.45 }}>{desc}</div>
                                    </div>
                                </div>
                                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, position: 'relative', zIndex: 1, border: '1px solid rgba(255,255,255,0.22)' }}>
                                    <ArrowRight size={17} weight="bold" color="white" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            <div style={S.divider} />

            {/* ════════════════════════════════
                3. ABOUT US
            ════════════════════════════════ */}
            <div style={{ padding: '60px 0 0' }}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'56px', alignItems:'start' }}>

                    {/* Left */}
                    <div>
                        <Tag icon={Hospital} label="About Us" />
                        <h2 style={S.h2}>About {hospitalName}</h2>
                        <p style={{ ...S.sub, marginBottom:'16px' }}>
                            Established to bring world-class healthcare to every family, {hospitalName} is a multi-speciality facility committed to compassionate, evidence-based medicine.
                        </p>
                        <p style={{ ...S.sub, marginBottom:'36px' }}>
                            Our team of 150+ doctors, nurses, and allied health professionals work round the clock to deliver outstanding patient outcomes across 20+ specialties.
                        </p>

                        {/* Stat grid */}
                        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
                            {aboutStats.map(({ val, label, color }) => (
                                <div key={label} style={{ ...S.card, padding:'18px 22px', borderLeft:`3px solid ${color}`, display:'flex', alignItems:'center', gap:'14px' }}>
                                    <div style={{ width:8, height:8, borderRadius:'50%', background:color, flexShrink:0 }} />
                                    <div>
                                        <div style={{ fontSize:'1.65rem', fontWeight:900, color, lineHeight:1, letterSpacing:'-0.02em' }}>{val}</div>
                                        <div style={{ fontSize:'0.77rem', color:'var(--text-muted,#64748B)', marginTop:'3px', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.04em' }}>{label}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right — highlight cards */}
                    <div style={{ display:'flex', flexDirection:'column', gap:'12px', paddingTop:'8px' }}>
                        {aboutHighlights.map(({ icon: Icon, color, title, desc }) => (
                            <div key={title} style={{
                                ...S.card,
                                display:'flex', gap:'16px', alignItems:'flex-start',
                                padding:'18px 22px',
                                borderLeft:`3px solid ${color}`,
                            }}
                                onMouseEnter={e => { e.currentTarget.style.boxShadow='0 4px 20px rgba(15,23,42,0.08)'; e.currentTarget.style.transform='translateX(2px)'; }}
                                onMouseLeave={e => { e.currentTarget.style.boxShadow=S.card.boxShadow; e.currentTarget.style.transform=''; }}
                            >
                                <div style={{ width:40, height:40, borderRadius:'11px', background:color+'14', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                                    <Icon size={19} color={color} weight="fill" />
                                </div>
                                <div>
                                    <div style={{ fontWeight:700, color:'var(--text-main,#0F172A)', marginBottom:'3px', fontSize:'0.92rem' }}>{title}</div>
                                    <div style={{ fontSize:'0.82rem', color:'var(--text-muted,#64748B)', lineHeight:1.55 }}>{desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div style={S.divider} />

            {/* ════════════════════════════════
                4. CONTACT US
            ════════════════════════════════ */}
            <div style={{ padding: '60px 0 0' }}>
                <div style={{ textAlign:'center', marginBottom:'36px' }}>
                    <Tag icon={Phone} label="Contact Us" color={COLOR.teal} />
                    <h2 style={{ ...S.h2, textAlign:'center' }}>Get in Touch</h2>
                    <p style={{ ...S.sub, margin:'0 auto', textAlign:'center' }}>
                        Our helpdesk is available 24/7. Reach us anytime via phone, email, or visit us directly.
                    </p>
                </div>

                <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'16px' }}>
                    {contactInfo.map(({ icon: Icon, color, label, value }) => (
                        <div key={label}
                            style={{ ...S.card, textAlign:'center', borderTop:`3px solid ${color}`, padding:'26px 18px' }}
                            onMouseEnter={e => { e.currentTarget.style.boxShadow='0 8px 28px rgba(15,23,42,0.1)'; e.currentTarget.style.transform='translateY(-3px)'; }}
                            onMouseLeave={e => { e.currentTarget.style.boxShadow=S.card.boxShadow; e.currentTarget.style.transform=''; }}
                        >
                            <div style={{ width:50, height:50, borderRadius:'15px', background:color+'12', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px', border:`1px solid ${color}22` }}>
                                <Icon size={23} color={color} weight="fill" />
                            </div>
                            <div style={{ fontSize:'0.68rem', fontWeight:800, color:'var(--text-muted,#94A3B8)', textTransform:'uppercase', letterSpacing:'0.09em', marginBottom:'8px' }}>{label}</div>
                            <div style={{ fontWeight:600, color:'var(--text-main,#0F172A)', fontSize:'0.86rem', lineHeight:1.6, wordBreak:'break-word' }}>{value}</div>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
};

export default Home;
