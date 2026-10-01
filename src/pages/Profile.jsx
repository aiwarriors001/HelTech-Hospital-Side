import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Buildings,
    MapPin,
    Phone,
    Envelope,
    Clock,
    ShieldCheck,
    Stethoscope,
    NavigationArrow,
    PencilSimple,
    Compass,
    Car,
    FirstAid,
    CheckCircle,
    Sparkle,
    ArrowSquareOut,
    Copy,
    Check,
    Hospital,
    Users,
    Heartbeat,
    Ambulance,
    Star,
    X,
    IdentificationBadge,
    Lightning,
    Robot,
    ChatCircleDots,
    ArrowRight,
    ArrowCounterClockwise
} from '@phosphor-icons/react';
import toast from 'react-hot-toast';

const DEFAULT_PROFILE = {
    hospitalName: 'City General Hospital & Trauma Institute',
    tagline: 'Tertiary Care Multi-Specialty & Level-1 Trauma Center',
    phone: '+1 (800) 555-0199',
    emergencyPhone: '+1 (800) 555-9111',
    ambulanceHotline: '108 / 911 Direct Dispatch',
    email: 'contact@citygeneralhealth.org',
    website: 'https://citygeneralhealth.org',
    address: '123 Medical Center Drive, Healthcare Boulevard, Suite 400',
    city: 'New York',
    state: 'NY',
    zipCode: '10016',
    coordinates: '40.7391° N, 73.9754° W',
    mapQuery: '123 Medical Center Drive, New York, NY 10016',
    licenseId: 'HOSP-REG-NY-84920',
    accreditation: 'NABH Gold Standard & JCI International Accredited',
    medicalDirector: 'Dr. Sarah Jenkins, MD, FACS',
    cmo: 'Dr. Robert Vance, MD (Emergency Medicine)',
    totalBeds: '450+ Beds',
    icuBeds: '60 Critical Care Beds',
    traumaLevel: 'Level 1 Trauma Center',
    established: '1998'
};

const SUGGESTED_QUESTIONS = [
    { label: '🚨 Emergency & Ambulance', query: 'What is the emergency hotline and ambulance response protocol?' },
    { label: '📍 Campus Gates & Map', query: 'How do I navigate between Gate 1, Gate 2, and the Helipad?' },
    { label: '⏰ OPD & Visiting Hours', query: 'What are the visiting hours and outpatient consultation timings?' },
    { label: '🛏️ Bed & ICU Capacity', query: 'How many inpatient beds and ICU units are operational?' },
    { label: '🩺 Clinical Specialties', query: 'What centers of clinical excellence and specialties are available?' },
    { label: '🚗 Visitor Parking', query: 'Where can visitors and patients park on campus?' }
];

const generateBotResponse = (userText, hospital) => {
    const q = userText.toLowerCase();

    if (q.includes('emergency') || q.includes('ambulance') || q.includes('trauma') || q.includes('urgent') || q.includes('911') || q.includes('108') || q.includes('hotline')) {
        return `🚨 Emergency & Critical Care Protocol:\n\n• 24/7 Red Alert Hotline: ${hospital.emergencyPhone}\n• Ambulance Dispatch: ${hospital.ambulanceHotline}\n• Facility Level: ${hospital.traumaLevel} with < 6 min average triage response.\n• Access: Dedicated rapid ramp via Gate 1 with direct trauma elevator to ICU suites.`;
    }

    if (q.includes('gate') || q.includes('direction') || q.includes('location') || q.includes('address') || q.includes('where') || q.includes('map') || q.includes('reach') || q.includes('navigate')) {
        return `📍 Hospital Campus Location & Wayfinding:\n\n• Address: ${hospital.address}, ${hospital.city}, ${hospital.state} ${hospital.zipCode}\n• GPS Coordinates: ${hospital.coordinates}\n\nCampus Wayfinding Guide:\n• Gate 1: 24/7 Emergency & Rapid Ambulance Ramp\n• Gate 2: Main OPD Concourse, Reception & Diagnostics\n• Gate 3: Multi-level Parking (P1–P4) with EV Charging\n• Deck H-1: Rooftop Air Ambulance Helipad`;
    }

    if (q.includes('parking') || q.includes('car') || q.includes('vehicle') || q.includes('ev')) {
        return `🚗 Campus Parking Facilities:\n\n• Location: Gate 3 Multi-Level Structure (Levels P1 through P4)\n• Capacity: 600+ reserved slots for patients and visitors\n• EV Amenities: 12 rapid charging stations available\n• Valet Assistance: Available at the Main OPD portico (Gate 2).`;
    }

    if (q.includes('time') || q.includes('hour') || q.includes('timing') || q.includes('visit') || q.includes('open') || q.includes('schedule')) {
        return `⏰ Operational & Visiting Hours:\n\n• Emergency & Trauma Bay: Open 24/7/365\n• Outpatient (OPD) Clinics: Monday – Saturday (08:00 AM – 08:00 PM)\n• Inpatient Visiting Hours: 11:00 AM – 01:00 PM & 05:00 PM – 07:00 PM\n• Pharmacy & Diagnostic Pathology: 24 Hours Open daily.`;
    }

    if (q.includes('bed') || q.includes('icu') || q.includes('capacity') || q.includes('room') || q.includes('occupancy')) {
        return `🛏️ Inpatient Bed & ICU Infrastructure:\n\n• Total Operational Capacity: ${hospital.totalBeds}\n• Intensive Care Units: ${hospital.icuBeds} (ICU, CCU, NICU, PICU)\n• Modular Operation Theaters: 12 State-of-the-Art Robotic Surgical Suites\n• All beds equipped with central medical gases and multi-parameter telemetry.`;
    }

    if (q.includes('doctor') || q.includes('special') || q.includes('specialist') || q.includes('dept') || q.includes('department') || q.includes('director') || q.includes('cmo')) {
        return `🩺 Medical Leadership & Clinical Specialties:\n\n• Lead Medical Director: ${hospital.medicalDirector}\n• Chief Medical Officer: ${hospital.cmo}\n• Clinical Faculty: 120+ Board-Certified Specialists\n• Core Centers of Excellence: Cardiology & Cath Lab, Neurology & Stroke, Level-1 Trauma, Orthopedics & Robotic Surgery, Pediatrics (NICU), and Oncology.`;
    }

    if (q.includes('license') || q.includes('nabh') || q.includes('jci') || q.includes('accreditation') || q.includes('quality') || q.includes('hipaa')) {
        return `🛡️ Accreditation & Institutional Governance:\n\n• Quality Accreditation: ${hospital.accreditation}\n• State License Registration: ${hospital.licenseId}\n• EMR Data Security: 256-bit AES HIPAA Encryption certified & active.`;
    }

    if (q.includes('contact') || q.includes('phone') || q.includes('email') || q.includes('call') || q.includes('number')) {
        return `📞 Official Hospital Directory:\n\n• General Desk: ${hospital.phone}\n• Emergency Hotline: ${hospital.emergencyPhone}\n• Inquiries Email: ${hospital.email}\n• Campus Location: ${hospital.address}, ${hospital.city}.`;
    }

    if (q.includes('appointment') || q.includes('book') || q.includes('consult')) {
        return `📅 Appointments & Consultations:\n\nYou can review, confirm, or reschedule appointments in the "Appointments" tab from the sidebar. In-person walk-in registrations are also processed at the Main OPD Reception (Gate 2).`;
    }

    return `Hello! As the virtual concierge for ${hospital.hospitalName}, I can help you with:\n\n• Campus navigation & access gates (Gate 1, 2, 3 & Helipad)\n• 24/7 Emergency trauma helpline (${hospital.emergencyPhone})\n• OPD timings & visiting policies\n• Clinical specialties & lead doctors\n• Total bed capacity (${hospital.totalBeds})\n\nPlease select one of the quick prompts above or type your question!`;
};

const Profile = () => {
    const { user } = useAuth();
    const [copied, setCopied] = useState(false);
    const [copiedCoords, setCopiedCoords] = useState(false);
    const [mapViewType, setMapViewType] = useState('roadmap'); // 'roadmap' | 'satellite'
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // Profile state with localStorage persistence
    const [hospitalData, setHospitalData] = useState(() => {
        try {
            const saved = localStorage.getItem('heltech_hospital_profile');
            if (saved) {
                return { ...DEFAULT_PROFILE, ...JSON.parse(saved) };
            }
        } catch (e) {
            console.warn('Failed to parse saved hospital profile', e);
        }
        return {
            ...DEFAULT_PROFILE,
            hospitalName: user?.hospitalName || DEFAULT_PROFILE.hospitalName,
            email: user?.email || DEFAULT_PROFILE.email,
            phone: user?.phone || DEFAULT_PROFILE.phone,
            address: user?.address || DEFAULT_PROFILE.address,
            medicalDirector: user?.name || DEFAULT_PROFILE.medicalDirector
        };
    });

    const [editForm, setEditForm] = useState(hospitalData);

    // ─── Chatbot State ──────────────────────────────────────────
    const [chatMessages, setChatMessages] = useState(() => [
        {
            id: 1,
            sender: 'bot',
            text: `Hello! I am the ${hospitalData.hospitalName} AI Concierge. I can answer inquiries regarding campus wayfinding (Gates 1–3), 24/7 emergency dispatch, OPD & visiting timings, bed availability, and clinical specialties. How can I assist you today?`,
            time: 'Just now'
        }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const chatEndRef = useRef(null);
    const chatbotSectionRef = useRef(null);

    const scrollToChatBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToChatBottom();
    }, [chatMessages, isTyping]);

    const messageCounterRef = useRef(10);

    const handleSendMessage = useCallback((textToSend) => {
        const query = (typeof textToSend === 'string' ? textToSend : inputMessage).trim();
        if (!query) return;

        messageCounterRef.current += 1;
        const currentId = messageCounterRef.current;
        const now = new Date();
        const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        const userMsg = {
            id: currentId,
            sender: 'user',
            text: query,
            time: timeStr
        };

        setChatMessages(prev => [...prev, userMsg]);
        setInputMessage('');
        setIsTyping(true);

        // Realistic response delay
        setTimeout(() => {
            messageCounterRef.current += 1;
            const replyText = generateBotResponse(query, hospitalData);
            const botMsg = {
                id: messageCounterRef.current,
                sender: 'bot',
                text: replyText,
                time: timeStr
            };
            setChatMessages(prev => [...prev, botMsg]);
            setIsTyping(false);
        }, 450);
    }, [inputMessage, hospitalData]);

    const handleClearChat = useCallback(() => {
        messageCounterRef.current += 1;
        setChatMessages([
            {
                id: messageCounterRef.current,
                sender: 'bot',
                text: `Chat session reset. Hello! I am your ${hospitalData.hospitalName} virtual assistant. What would you like to know about our campus, protocols, or services?`,
                time: 'Just now'
            }
        ]);
        toast.success('Chat history cleared');
    }, [hospitalData.hospitalName]);

    const handleCopyAddress = () => {
        const fullAddr = `${hospitalData.hospitalName}, ${hospitalData.address}, ${hospitalData.city}, ${hospitalData.state} ${hospitalData.zipCode}`;
        navigator.clipboard.writeText(fullAddr);
        setCopied(true);
        toast.success('Hospital address copied to clipboard!');
        setTimeout(() => setCopied(false), 2200);
    };

    const handleCopyCoordinates = () => {
        navigator.clipboard.writeText(hospitalData.coordinates);
        setCopiedCoords(true);
        toast.success('GPS coordinates copied!');
        setTimeout(() => setCopiedCoords(false), 2200);
    };

    const handleOpenDirections = () => {
        const dest = encodeURIComponent(`${hospitalData.hospitalName} ${hospitalData.address} ${hospitalData.city} ${hospitalData.state}`);
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${dest}`, '_blank', 'noopener,noreferrer');
    };

    const handleSaveProfile = (e) => {
        e.preventDefault();
        setHospitalData(editForm);
        try {
            localStorage.setItem('heltech_hospital_profile', JSON.stringify(editForm));
        } catch (err) {
            console.error('Save failed:', err);
        }
        setIsEditModalOpen(false);
        toast.success('Hospital profile updated successfully!');
    };

    const mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(
        hospitalData.mapQuery || `${hospitalData.hospitalName} ${hospitalData.address}`
    )}&t=${mapViewType === 'satellite' ? 'k' : 'm'}&z=16&ie=UTF8&iwloc=&output=embed`;

    return (
        <div className="page-container" style={{ paddingBottom: '90px', position: 'relative' }}>
            {/* Top Operational Breadcrumb / Action Bar */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px',
                marginBottom: '24px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 14px',
                        borderRadius: '999px',
                        background: 'rgba(37, 99, 235, 0.08)',
                        color: '#2563EB',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        letterSpacing: '0.04em',
                        border: '1px solid rgba(37, 99, 235, 0.18)'
                    }}>
                        <Sparkle size={14} weight="fill" />
                        INSTITUTIONAL REGISTRY & FACILITY PROFILE
                    </div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted, #64748B)', fontWeight: 600 }}>
                        License: {hospitalData.licenseId}
                    </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button
                        onClick={() => chatbotSectionRef.current?.scrollIntoView({ behavior: 'smooth' })}
                        className="hover-lift"
                        style={{
                            background: 'rgba(37, 99, 235, 0.08)',
                            border: '1px solid rgba(37, 99, 235, 0.25)',
                            color: '#2563EB',
                            padding: '10px 18px',
                            borderRadius: '12px',
                            fontSize: '0.86rem',
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            cursor: 'pointer'
                        }}
                    >
                        <Robot size={18} weight="bold" />
                        AI Concierge Chat
                    </button>

                    <button
                        onClick={handleOpenDirections}
                        className="hover-lift"
                        style={{
                            background: 'var(--card-bg, #FFFFFF)',
                            border: '1px solid var(--border-color, #E2E8F0)',
                            color: 'var(--text-main, #0F172A)',
                            padding: '10px 18px',
                            borderRadius: '12px',
                            fontSize: '0.86rem',
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            cursor: 'pointer',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                        }}
                    >
                        <NavigationArrow size={16} weight="bold" color="#2563EB" />
                        Get Directions
                    </button>

                    <button
                        onClick={() => {
                            setEditForm(hospitalData);
                            setIsEditModalOpen(true);
                        }}
                        className="hover-lift"
                        style={{
                            background: '#2563EB',
                            border: 'none',
                            color: 'white',
                            padding: '10px 20px',
                            borderRadius: '12px',
                            fontSize: '0.86rem',
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)'
                        }}
                    >
                        <PencilSimple size={16} weight="bold" />
                        Edit Profile
                    </button>
                </div>
            </div>

            {/* Main Hospital Hero Card */}
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                style={{
                    background: 'var(--card-bg, #FFFFFF)',
                    borderRadius: '24px',
                    border: '1px solid var(--border-color, #E2E8F0)',
                    padding: '36px',
                    boxShadow: '0 4px 20px -4px rgba(15, 23, 42, 0.06)',
                    position: 'relative',
                    overflow: 'hidden',
                    marginBottom: '28px'
                }}
            >
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '6px',
                    background: 'linear-gradient(90deg, #2563EB, #06B6D4, #10B981, #7C3AED)'
                }}></div>

                <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '24px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
                        <div style={{
                            width: '84px',
                            height: '84px',
                            borderRadius: '24px',
                            background: 'linear-gradient(135deg, #1D4ED8 0%, #2563EB 50%, #3B82F6 100%)',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '2.5rem',
                            fontWeight: '900',
                            flexShrink: 0,
                            boxShadow: '0 8px 24px -4px rgba(37, 99, 235, 0.35)',
                            border: '3px solid rgba(255, 255, 255, 0.6)'
                        }}>
                            <Hospital size={44} weight="fill" />
                        </div>

                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '6px' }}>
                                <h1 style={{
                                    margin: 0,
                                    fontSize: '2.1rem',
                                    fontWeight: 900,
                                    color: 'var(--text-main, #0F172A)',
                                    letterSpacing: '-0.03em'
                                }}>
                                    {hospitalData.hospitalName}
                                </h1>
                                <span style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                    background: 'rgba(16, 185, 129, 0.12)',
                                    color: '#059669',
                                    padding: '4px 10px',
                                    borderRadius: '999px',
                                    fontSize: '0.78rem',
                                    fontWeight: 800
                                }}>
                                    <CheckCircle size={14} weight="fill" />
                                    NABH & JCI Accredited
                                </span>
                            </div>

                            <p style={{
                                margin: '0 0 14px',
                                fontSize: '1.05rem',
                                color: 'var(--text-muted, #64748B)',
                                fontWeight: 500
                            }}>
                                {hospitalData.tagline} • Est. {hospitalData.established}
                            </p>

                            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                                <div style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '7px',
                                    fontSize: '0.86rem',
                                    color: 'var(--text-main, #1F2937)',
                                    background: 'var(--bg-color, #F8FAFC)',
                                    padding: '6px 14px',
                                    borderRadius: '10px',
                                    border: '1px solid var(--border-color, #E2E8F0)'
                                }}>
                                    <MapPin size={16} color="#2563EB" weight="bold" />
                                    <span>{hospitalData.address}, {hospitalData.city}</span>
                                </div>

                                <div style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '7px',
                                    fontSize: '0.86rem',
                                    color: 'var(--text-main, #1F2937)',
                                    background: 'var(--bg-color, #F8FAFC)',
                                    padding: '6px 14px',
                                    borderRadius: '10px',
                                    border: '1px solid var(--border-color, #E2E8F0)'
                                }}>
                                    <Phone size={16} color="#10B981" weight="bold" />
                                    <span>{hospitalData.phone}</span>
                                </div>

                                <div style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '7px',
                                    fontSize: '0.86rem',
                                    color: 'var(--text-main, #1F2937)',
                                    background: 'var(--bg-color, #F8FAFC)',
                                    padding: '6px 14px',
                                    borderRadius: '10px',
                                    border: '1px solid var(--border-color, #E2E8F0)'
                                }}>
                                    <Envelope size={16} color="#7C3AED" weight="bold" />
                                    <span>{hospitalData.email}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{
                        background: 'linear-gradient(135deg, #FEF2F2, #FEE2E2)',
                        border: '1px solid rgba(239, 68, 68, 0.25)',
                        padding: '16px 22px',
                        borderRadius: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                        minWidth: '220px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{
                                width: 10,
                                height: 10,
                                borderRadius: '50%',
                                background: '#DC2626',
                                boxShadow: '0 0 0 4px rgba(220, 38, 38, 0.2)'
                            }}></span>
                            <span style={{ fontSize: '0.74rem', fontWeight: 900, color: '#DC2626', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                24/7 Critical Trauma Bay
                            </span>
                        </div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#991B1B' }}>
                            {hospitalData.emergencyPhone}
                        </div>
                        <span style={{ fontSize: '0.78rem', color: '#B91C1C', fontWeight: 600 }}>
                            Direct Ambulance & Red Alert Dispatch
                        </span>
                    </div>
                </div>
            </motion.div>

            {/* Key Facility Infrastructure Stats */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
                marginBottom: '32px'
            }}>
                <div style={{
                    background: 'var(--card-bg, #FFFFFF)',
                    padding: '20px 22px',
                    borderRadius: '18px',
                    border: '1px solid var(--border-color, #E2E8F0)',
                    boxShadow: '0 2px 8px -2px rgba(15, 23, 42, 0.04)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted, #64748B)', textTransform: 'uppercase' }}>
                            Total Bed Capacity
                        </span>
                        <div style={{ width: 34, height: 34, borderRadius: '10px', background: 'rgba(37,99,235,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB' }}>
                            <Buildings size={18} weight="bold" />
                        </div>
                    </div>
                    <div style={{ fontSize: '1.65rem', fontWeight: 900, color: 'var(--text-main, #0F172A)', lineHeight: 1 }}>
                        {hospitalData.totalBeds}
                    </div>
                    <span style={{ fontSize: '0.78rem', color: '#2563EB', fontWeight: 700, marginTop: '6px', display: 'inline-block' }}>
                        {hospitalData.icuBeds}
                    </span>
                </div>

                <div style={{
                    background: 'var(--card-bg, #FFFFFF)',
                    padding: '20px 22px',
                    borderRadius: '18px',
                    border: '1px solid var(--border-color, #E2E8F0)',
                    boxShadow: '0 2px 8px -2px rgba(15, 23, 42, 0.04)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted, #64748B)', textTransform: 'uppercase' }}>
                            Emergency Care
                        </span>
                        <div style={{ width: 34, height: 34, borderRadius: '10px', background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EF4444' }}>
                            <Ambulance size={18} weight="bold" />
                        </div>
                    </div>
                    <div style={{ fontSize: '1.65rem', fontWeight: 900, color: 'var(--text-main, #0F172A)', lineHeight: 1 }}>
                        {hospitalData.traumaLevel}
                    </div>
                    <span style={{ fontSize: '0.78rem', color: '#10B981', fontWeight: 700, marginTop: '6px', display: 'inline-block' }}>
                        &lt; 6 Min Avg Triage Response
                    </span>
                </div>

                <div style={{
                    background: 'var(--card-bg, #FFFFFF)',
                    padding: '20px 22px',
                    borderRadius: '18px',
                    border: '1px solid var(--border-color, #E2E8F0)',
                    boxShadow: '0 2px 8px -2px rgba(15, 23, 42, 0.04)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted, #64748B)', textTransform: 'uppercase' }}>
                            Specialist Faculty
                        </span>
                        <div style={{ width: 34, height: 34, borderRadius: '10px', background: 'rgba(124,58,237,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7C3AED' }}>
                            <Stethoscope size={18} weight="bold" />
                        </div>
                    </div>
                    <div style={{ fontSize: '1.65rem', fontWeight: 900, color: 'var(--text-main, #0F172A)', lineHeight: 1 }}>
                        120+ Doctors
                    </div>
                    <span style={{ fontSize: '0.78rem', color: '#7C3AED', fontWeight: 700, marginTop: '6px', display: 'inline-block' }}>
                        24 Clinical Specialties
                    </span>
                </div>

                <div style={{
                    background: 'var(--card-bg, #FFFFFF)',
                    padding: '20px 22px',
                    borderRadius: '18px',
                    border: '1px solid var(--border-color, #E2E8F0)',
                    boxShadow: '0 2px 8px -2px rgba(15, 23, 42, 0.04)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted, #64748B)', textTransform: 'uppercase' }}>
                            Patient Satisfaction
                        </span>
                        <div style={{ width: 34, height: 34, borderRadius: '10px', background: 'rgba(245,158,11,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D97706' }}>
                            <Star size={18} weight="fill" />
                        </div>
                    </div>
                    <div style={{ fontSize: '1.65rem', fontWeight: 900, color: 'var(--text-main, #0F172A)', lineHeight: 1 }}>
                        4.9 / 5.0
                    </div>
                    <span style={{ fontSize: '0.78rem', color: '#D97706', fontWeight: 700, marginTop: '6px', display: 'inline-block' }}>
                        Over 28,000 Verified Reviews
                    </span>
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════ */}
            {/* FEATURED: HOSPITAL CAMPUS LOCATION & INTERACTIVE MAP       */}
            {/* ═══════════════════════════════════════════════════════════ */}
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                style={{
                    background: 'var(--card-bg, #FFFFFF)',
                    borderRadius: '24px',
                    border: '1px solid var(--border-color, #E2E8F0)',
                    boxShadow: '0 4px 20px -4px rgba(15, 23, 42, 0.06)',
                    marginBottom: '32px',
                    overflow: 'hidden'
                }}
            >
                <div style={{
                    padding: '24px 30px',
                    borderBottom: '1px solid var(--border-color, #E2E8F0)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '16px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '12px',
                            background: 'rgba(37, 99, 235, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#2563EB'
                        }}>
                            <MapPin size={24} weight="bold" />
                        </div>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <h2 style={{
                                    margin: 0,
                                    fontSize: '1.35rem',
                                    fontWeight: 900,
                                    color: 'var(--text-main, #0F172A)',
                                    letterSpacing: '-0.02em'
                                }}>
                                    Hospital Campus & Location Map
                                </h2>
                                <span style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    background: 'rgba(16, 185, 129, 0.12)',
                                    color: '#059669',
                                    fontSize: '0.72rem',
                                    fontWeight: 800,
                                    padding: '2px 8px',
                                    borderRadius: '6px'
                                }}>
                                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981' }}></span>
                                    Campus Open & Accessible
                                </span>
                            </div>
                            <p style={{ margin: '3px 0 0', fontSize: '0.88rem', color: 'var(--text-muted, #64748B)' }}>
                                Real-time geolocation, campus navigation, patient drop-off bays, and emergency transit access
                            </p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                            display: 'flex',
                            background: 'var(--bg-color, #F1F5F9)',
                            padding: '4px',
                            borderRadius: '12px',
                            border: '1px solid var(--border-color, #E2E8F0)'
                        }}>
                            <button
                                onClick={() => setMapViewType('roadmap')}
                                style={{
                                    border: 'none',
                                    background: mapViewType === 'roadmap' ? '#2563EB' : 'transparent',
                                    color: mapViewType === 'roadmap' ? 'white' : 'var(--text-muted, #64748B)',
                                    padding: '6px 14px',
                                    borderRadius: '8px',
                                    fontSize: '0.8rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                Road Map
                            </button>
                            <button
                                onClick={() => setMapViewType('satellite')}
                                style={{
                                    border: 'none',
                                    background: mapViewType === 'satellite' ? '#2563EB' : 'transparent',
                                    color: mapViewType === 'satellite' ? 'white' : 'var(--text-muted, #64748B)',
                                    padding: '6px 14px',
                                    borderRadius: '8px',
                                    fontSize: '0.8rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                Satellite View
                            </button>
                        </div>

                        <button
                            onClick={handleOpenDirections}
                            className="hover-lift"
                            style={{
                                background: '#2563EB',
                                color: 'white',
                                border: 'none',
                                padding: '8px 16px',
                                borderRadius: '12px',
                                fontSize: '0.82rem',
                                fontWeight: 700,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                cursor: 'pointer',
                                boxShadow: '0 2px 8px rgba(37, 99, 235, 0.2)'
                            }}
                        >
                            <ArrowSquareOut size={16} weight="bold" />
                            Open Map
                        </button>
                    </div>
                </div>

                {/* Map Viewport Area */}
                <div style={{ position: 'relative', width: '100%', height: '420px', background: '#E2E8F0' }}>
                    <iframe
                        title="Hospital Campus Location"
                        width="100%"
                        height="100%"
                        style={{ border: 0, display: 'block' }}
                        loading="lazy"
                        allowFullScreen
                        referrerPolicy="no-referrer-when-downgrade"
                        src={mapSrc}
                    />

                    <div style={{
                        position: 'absolute',
                        top: '16px',
                        left: '16px',
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(10px)',
                        padding: '14px 18px',
                        borderRadius: '16px',
                        border: '1px solid rgba(226, 232, 240, 0.8)',
                        boxShadow: '0 8px 24px -4px rgba(15, 23, 42, 0.15)',
                        maxWidth: '340px',
                        zIndex: 10
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <Hospital size={20} weight="fill" color="#2563EB" />
                            <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: '#0F172A' }}>
                                {hospitalData.hospitalName}
                            </h4>
                        </div>
                        <p style={{ margin: '0 0 10px', fontSize: '0.82rem', color: '#64748B', lineHeight: 1.4 }}>
                            {hospitalData.address}, {hospitalData.city}, {hospitalData.state} {hospitalData.zipCode}
                        </p>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <button
                                onClick={handleCopyAddress}
                                style={{
                                    background: 'var(--bg-color, #F1F5F9)',
                                    border: '1px solid #CBD5E1',
                                    color: '#1E293B',
                                    padding: '5px 10px',
                                    borderRadius: '8px',
                                    fontSize: '0.74rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                }}
                            >
                                {copied ? <Check size={13} color="#10B981" weight="bold" /> : <Copy size={13} />}
                                {copied ? 'Address Copied' : 'Copy Address'}
                            </button>

                            <button
                                onClick={handleCopyCoordinates}
                                style={{
                                    background: 'var(--bg-color, #F1F5F9)',
                                    border: '1px solid #CBD5E1',
                                    color: '#1E293B',
                                    padding: '5px 10px',
                                    borderRadius: '8px',
                                    fontSize: '0.74rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                }}
                            >
                                {copiedCoords ? <Check size={13} color="#10B981" weight="bold" /> : <Compass size={13} />}
                                {copiedCoords ? 'GPS Copied' : 'GPS Coords'}
                            </button>
                        </div>
                    </div>

                    <div style={{
                        position: 'absolute',
                        bottom: '16px',
                        right: '16px',
                        background: 'rgba(15, 23, 42, 0.85)',
                        backdropFilter: 'blur(8px)',
                        color: 'white',
                        padding: '6px 14px',
                        borderRadius: '999px',
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        zIndex: 10
                    }}>
                        <Compass size={14} weight="bold" color="#38BDF8" />
                        <span>GPS: {hospitalData.coordinates}</span>
                    </div>
                </div>

                {/* Campus Gates & Wayfinding Guide */}
                <div style={{ padding: '28px 30px', background: 'var(--card-bg, #FFFFFF)' }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '18px'
                    }}>
                        <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main, #0F172A)' }}>
                            Campus Gates & Wayfinding Directory
                        </h3>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted, #64748B)' }}>
                            Follow signage upon entering the medical campus
                        </span>
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                        gap: '16px'
                    }}>
                        <div style={{
                            padding: '16px 18px',
                            borderRadius: '16px',
                            background: 'rgba(239, 68, 68, 0.05)',
                            border: '1px solid rgba(239, 68, 68, 0.16)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                <div style={{ width: 28, height: 28, borderRadius: '8px', background: '#EF4444', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Ambulance size={16} weight="bold" />
                                </div>
                                <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800, color: '#991B1B' }}>
                                    Gate 1 — Emergency & Trauma Bay
                                </h4>
                            </div>
                            <p style={{ margin: 0, fontSize: '0.82rem', color: '#7F1D1D', lineHeight: 1.4 }}>
                                Dedicated rapid ambulance driveway, 24/7 Red Alert triage desk, and immediate ICU elevators.
                            </p>
                        </div>

                        <div style={{
                            padding: '16px 18px',
                            borderRadius: '16px',
                            background: 'rgba(37, 99, 235, 0.05)',
                            border: '1px solid rgba(37, 99, 235, 0.16)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                <div style={{ width: 28, height: 28, borderRadius: '8px', background: '#2563EB', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Buildings size={16} weight="bold" />
                                </div>
                                <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800, color: '#1E40AF' }}>
                                    Gate 2 — Main OPD & Check-in
                                </h4>
                            </div>
                            <p style={{ margin: 0, fontSize: '0.82rem', color: '#1E3A8A', lineHeight: 1.4 }}>
                                Main lobby reception, outpatient physician consultation blocks, pharmacy, and diagnostic sample lab.
                            </p>
                        </div>

                        <div style={{
                            padding: '16px 18px',
                            borderRadius: '16px',
                            background: 'rgba(16, 185, 129, 0.05)',
                            border: '1px solid rgba(16, 185, 129, 0.16)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                <div style={{ width: 28, height: 28, borderRadius: '8px', background: '#10B981', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Car size={16} weight="bold" />
                                </div>
                                <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800, color: '#065F46' }}>
                                    Gate 3 — Parking Structure (P1-P4)
                                </h4>
                            </div>
                            <p style={{ margin: 0, fontSize: '0.82rem', color: '#064E3B', lineHeight: 1.4 }}>
                                600+ reserved slots for patients and visitors, valet assistance, and electric vehicle charging bays.
                            </p>
                        </div>

                        <div style={{
                            padding: '16px 18px',
                            borderRadius: '16px',
                            background: 'rgba(124, 58, 237, 0.05)',
                            border: '1px solid rgba(124, 58, 237, 0.16)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                <div style={{ width: 28, height: 28, borderRadius: '8px', background: '#7C3AED', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Lightning size={16} weight="bold" />
                                </div>
                                <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800, color: '#5B21B6' }}>
                                    Deck H-1 — Rooftop Helipad
                                </h4>
                            </div>
                            <p style={{ margin: 0, fontSize: '0.82rem', color: '#4C1D95', lineHeight: 1.4 }}>
                                Certified air ambulance landing facility for critical inter-hospital patient airlift & organ transport.
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* ═══════════════════════════════════════════════════════════ */}
            {/* FEATURED: HOSPITAL AI VIRTUAL CONCIERGE & CHATBOT           */}
            {/* ═══════════════════════════════════════════════════════════ */}
            <div ref={chatbotSectionRef} style={{ marginBottom: '32px' }}>
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    style={{
                        background: 'var(--card-bg, #FFFFFF)',
                        borderRadius: '24px',
                        border: '1.5px solid rgba(37, 99, 235, 0.22)',
                        boxShadow: '0 8px 30px -4px rgba(37, 99, 235, 0.12)',
                        overflow: 'hidden'
                    }}
                >
                    {/* Chatbot Header */}
                    <div style={{
                        padding: '22px 28px',
                        background: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '14px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                            <div style={{
                                width: '46px',
                                height: '46px',
                                borderRadius: '14px',
                                background: 'rgba(255, 255, 255, 0.18)',
                                backdropFilter: 'blur(6px)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '1px solid rgba(255, 255, 255, 0.25)',
                                color: 'white'
                            }}>
                                <Robot size={26} weight="fill" />
                            </div>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, letterSpacing: '-0.02em' }}>
                                        {hospitalData.hospitalName} AI Concierge
                                    </h3>
                                    <span style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        background: 'rgba(16, 185, 129, 0.25)',
                                        color: '#6EE7B7',
                                        fontSize: '0.72rem',
                                        fontWeight: 800,
                                        padding: '2px 8px',
                                        borderRadius: '999px',
                                        border: '1px solid rgba(16, 185, 129, 0.4)'
                                    }}>
                                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981' }}></span>
                                        Online • 24/7
                                    </span>
                                </div>
                                <p style={{ margin: '3px 0 0', fontSize: '0.84rem', opacity: 0.85 }}>
                                    Ask about campus gates, emergency hotline, bed capacity, doctors, or visiting guidelines
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={handleClearChat}
                            style={{
                                background: 'rgba(255, 255, 255, 0.15)',
                                border: '1px solid rgba(255, 255, 255, 0.25)',
                                color: 'white',
                                padding: '8px 14px',
                                borderRadius: '10px',
                                fontSize: '0.78rem',
                                fontWeight: 700,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                cursor: 'pointer'
                            }}
                            title="Reset conversation"
                        >
                            <ArrowCounterClockwise size={14} weight="bold" />
                            Reset Chat
                        </button>
                    </div>

                    {/* Quick Inquiry Prompt Chips */}
                    <div style={{
                        padding: '14px 28px',
                        background: 'var(--bg-color, #F8FAFC)',
                        borderBottom: '1px solid var(--border-color, #E2E8F0)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        flexWrap: 'wrap'
                    }}>
                        <span style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--text-muted, #64748B)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            Suggested Inquiries:
                        </span>
                        {SUGGESTED_QUESTIONS.map((sq, i) => (
                            <button
                                key={i}
                                onClick={() => handleSendMessage(sq.query)}
                                style={{
                                    background: 'var(--card-bg, #FFFFFF)',
                                    border: '1px solid var(--border-color, #CBD5E1)',
                                    borderRadius: '999px',
                                    padding: '5px 12px',
                                    fontSize: '0.76rem',
                                    fontWeight: 700,
                                    color: 'var(--text-main, #1F2937)',
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease'
                                }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = '#2563EB'; e.currentTarget.style.color = '#2563EB'; e.currentTarget.style.background = '#EFF6FF'; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color, #CBD5E1)'; e.currentTarget.style.color = 'var(--text-main, #1F2937)'; e.currentTarget.style.background = 'var(--card-bg, #FFFFFF)'; }}
                            >
                                {sq.label}
                            </button>
                        ))}
                    </div>

                    {/* Chat Messages Thread */}
                    <div style={{
                        padding: '24px 28px',
                        height: '350px',
                        overflowY: 'auto',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '14px',
                        background: 'var(--card-bg, #FFFFFF)'
                    }}>
                        {chatMessages.map(msg => {
                            const isBot = msg.sender === 'bot';
                            return (
                                <div
                                    key={msg.id}
                                    style={{
                                        display: 'flex',
                                        gap: '10px',
                                        alignItems: 'flex-start',
                                        justifyContent: isBot ? 'flex-start' : 'flex-end'
                                    }}
                                >
                                    {isBot && (
                                        <div style={{
                                            width: 34,
                                            height: 34,
                                            borderRadius: '10px',
                                            background: 'rgba(37, 99, 235, 0.1)',
                                            color: '#2563EB',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0
                                        }}>
                                            <Robot size={18} weight="fill" />
                                        </div>
                                    )}

                                    <div style={{
                                        maxWidth: '78%',
                                        background: isBot ? 'var(--bg-color, #F1F5F9)' : 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%)',
                                        color: isBot ? 'var(--text-main, #0F172A)' : 'white',
                                        padding: '14px 18px',
                                        borderRadius: isBot ? '18px 18px 18px 4px' : '18px 18px 4px 18px',
                                        fontSize: '0.88rem',
                                        lineHeight: 1.55,
                                        whiteSpace: 'pre-line',
                                        boxShadow: isBot ? '0 1px 3px rgba(0,0,0,0.03)' : '0 4px 12px rgba(37, 99, 235, 0.22)'
                                    }}>
                                        {msg.text}
                                        <div style={{
                                            fontSize: '0.68rem',
                                            marginTop: '6px',
                                            textAlign: 'right',
                                            opacity: isBot ? 0.6 : 0.8
                                        }}>
                                            {msg.time}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {isTyping && (
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <div style={{
                                    width: 34,
                                    height: 34,
                                    borderRadius: '10px',
                                    background: 'rgba(37, 99, 235, 0.1)',
                                    color: '#2563EB',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <Robot size={18} weight="fill" />
                                </div>
                                <div style={{
                                    background: 'var(--bg-color, #F1F5F9)',
                                    padding: '10px 16px',
                                    borderRadius: '16px',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                }}>
                                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#2563EB', animation: 'pulse 1s infinite' }}></span>
                                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#2563EB', animation: 'pulse 1s infinite 0.2s' }}></span>
                                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#2563EB', animation: 'pulse 1s infinite 0.4s' }}></span>
                                </div>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Chat Input Bar */}
                    <div style={{
                        padding: '16px 24px',
                        background: 'var(--card-bg, #FFFFFF)',
                        borderTop: '1px solid var(--border-color, #E2E8F0)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                    }}>
                        <input
                            type="text"
                            placeholder={`Ask about ${hospitalData.hospitalName} campus, visiting hours, trauma emergency...`}
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendMessage();
                                }
                            }}
                            className="form-input"
                            style={{
                                flex: 1,
                                padding: '12px 18px',
                                borderRadius: '12px',
                                fontSize: '0.9rem',
                                border: '1.5px solid var(--border-color, #CBD5E1)'
                            }}
                        />

                        <button
                            onClick={() => handleSendMessage()}
                            disabled={!inputMessage.trim()}
                            style={{
                                background: inputMessage.trim() ? '#2563EB' : 'var(--bg-color, #F1F5F9)',
                                color: inputMessage.trim() ? 'white' : 'var(--text-muted, #94A3B8)',
                                border: 'none',
                                padding: '12px 22px',
                                borderRadius: '12px',
                                fontSize: '0.88rem',
                                fontWeight: 800,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                cursor: inputMessage.trim() ? 'pointer' : 'not-allowed',
                                boxShadow: inputMessage.trim() ? '0 4px 12px rgba(37, 99, 235, 0.25)' : 'none',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <span>Send</span>
                            <ArrowRight size={16} weight="bold" />
                        </button>
                    </div>
                </motion.div>
            </div>

            {/* Two-Column Grid: Contact Information & Institutional Credentials */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
                gap: '24px',
                marginBottom: '32px'
            }}>
                <div style={{
                    background: 'var(--card-bg, #FFFFFF)',
                    borderRadius: '20px',
                    border: '1px solid var(--border-color, #E2E8F0)',
                    padding: '28px',
                    boxShadow: '0 2px 10px -2px rgba(15, 23, 42, 0.04)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                        <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'rgba(37,99,235,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB' }}>
                            <Phone size={20} weight="bold" />
                        </div>
                        <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main, #0F172A)' }}>
                            Official Communication & Desk Helplines
                        </h3>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                            <div style={{ width: 32, height: 32, borderRadius: '8px', background: 'var(--bg-color, #F8FAFC)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB', flexShrink: 0 }}>
                                <Envelope size={18} weight="bold" />
                            </div>
                            <div style={{ flex: 1 }}>
                                <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted, #64748B)', textTransform: 'uppercase' }}>
                                    Official Inquiries Email
                                </span>
                                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main, #0F172A)' }}>
                                    {hospitalData.email}
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                            <div style={{ width: 32, height: 32, borderRadius: '8px', background: 'var(--bg-color, #F8FAFC)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10B981', flexShrink: 0 }}>
                                <Phone size={18} weight="bold" />
                            </div>
                            <div style={{ flex: 1 }}>
                                <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted, #64748B)', textTransform: 'uppercase' }}>
                                    General Reception & OPD Desk
                                </span>
                                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main, #0F172A)' }}>
                                    {hospitalData.phone}
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                            <div style={{ width: 32, height: 32, borderRadius: '8px', background: 'var(--bg-color, #F8FAFC)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#DC2626', flexShrink: 0 }}>
                                <Ambulance size={18} weight="bold" />
                            </div>
                            <div style={{ flex: 1 }}>
                                <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted, #64748B)', textTransform: 'uppercase' }}>
                                    Ambulance Dispatch Helpline
                                </span>
                                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#DC2626' }}>
                                    {hospitalData.emergencyPhone} ({hospitalData.ambulanceHotline})
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                            <div style={{ width: 32, height: 32, borderRadius: '8px', background: 'var(--bg-color, #F8FAFC)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7C3AED', flexShrink: 0 }}>
                                <Clock size={18} weight="bold" />
                            </div>
                            <div style={{ flex: 1 }}>
                                <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted, #64748B)', textTransform: 'uppercase' }}>
                                    Operating Hours
                                </span>
                                <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-main, #0F172A)' }}>
                                    Emergency & Critical Care: 24/7/365 Open
                                </div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted, #64748B)' }}>
                                    OPD Consultations: Mon – Sat (08:00 AM – 08:00 PM)
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{
                    background: 'var(--card-bg, #FFFFFF)',
                    borderRadius: '20px',
                    border: '1px solid var(--border-color, #E2E8F0)',
                    padding: '28px',
                    boxShadow: '0 2px 10px -2px rgba(15, 23, 42, 0.04)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                        <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10B981' }}>
                            <ShieldCheck size={20} weight="bold" />
                        </div>
                        <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main, #0F172A)' }}>
                            Institutional Governance & Compliance
                        </h3>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                            <div style={{ width: 32, height: 32, borderRadius: '8px', background: 'var(--bg-color, #F8FAFC)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB', flexShrink: 0 }}>
                                <IdentificationBadge size={18} weight="bold" />
                            </div>
                            <div style={{ flex: 1 }}>
                                <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted, #64748B)', textTransform: 'uppercase' }}>
                                    State Medical License & UHID Registration
                                </span>
                                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main, #0F172A)' }}>
                                    {hospitalData.licenseId}
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                            <div style={{ width: 32, height: 32, borderRadius: '8px', background: 'var(--bg-color, #F8FAFC)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10B981', flexShrink: 0 }}>
                                <ShieldCheck size={18} weight="bold" />
                            </div>
                            <div style={{ flex: 1 }}>
                                <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted, #64748B)', textTransform: 'uppercase' }}>
                                    Quality Standards & Accreditation
                                </span>
                                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main, #0F172A)' }}>
                                    {hospitalData.accreditation}
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                            <div style={{ width: 32, height: 32, borderRadius: '8px', background: 'var(--bg-color, #F8FAFC)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7C3AED', flexShrink: 0 }}>
                                <Stethoscope size={18} weight="bold" />
                            </div>
                            <div style={{ flex: 1 }}>
                                <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted, #64748B)', textTransform: 'uppercase' }}>
                                    Lead Medical Director
                                </span>
                                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main, #0F172A)' }}>
                                    {hospitalData.medicalDirector}
                                </div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted, #64748B)' }}>
                                    Chief Medical Officer: {hospitalData.cmo}
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                            <div style={{ width: 32, height: 32, borderRadius: '8px', background: 'var(--bg-color, #F8FAFC)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669', flexShrink: 0 }}>
                                <CheckCircle size={18} weight="bold" />
                            </div>
                            <div style={{ flex: 1 }}>
                                <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted, #64748B)', textTransform: 'uppercase' }}>
                                    EMR Security & HIPAA Data Standards
                                </span>
                                <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#059669' }}>
                                    256-bit AES Encryption • Zero-Trust Compliance Active
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Centers of Excellence & Clinical Specialties */}
            <div style={{
                background: 'var(--card-bg, #FFFFFF)',
                borderRadius: '20px',
                border: '1px solid var(--border-color, #E2E8F0)',
                padding: '28px',
                boxShadow: '0 2px 10px -2px rgba(15, 23, 42, 0.04)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                    <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'rgba(37,99,235,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB' }}>
                        <Hospital size={20} weight="bold" />
                    </div>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main, #0F172A)' }}>
                            Centers of Clinical Excellence
                        </h3>
                        <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--text-muted, #64748B)' }}>
                            Specialized therapeutic departments equipped with advanced medical telemetry & surgical robotics
                        </p>
                    </div>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '14px'
                }}>
                    {[
                        { title: 'Emergency & Trauma', sub: '24/7 Red Bay, Level 1', status: '24 Hours Open', color: '#DC2626' },
                        { title: 'Cardiology & Cath Lab', sub: 'Angioplasty & EP Studies', status: '24 Hours Open', color: '#2563EB' },
                        { title: 'Neurology & Stroke Center', sub: 'Comprehensive Stroke Unit', status: '24 Hours Open', color: '#7C3AED' },
                        { title: 'Orthopedics & Joint Care', sub: 'Robotic Knee & Hip Surgery', status: 'OPD & Inpatient', color: '#059669' },
                        { title: 'Pediatrics & NICU', sub: 'Level III Neonatal Intensive', status: '24 Hours Open', color: '#D97706' },
                        { title: 'Oncology & Radiation', sub: 'Linear Accelerator & Chemo', status: 'Daycare & IPD', color: '#9333EA' },
                        { title: 'NABL Diagnostic Lab', sub: 'Automated 24/7 Pathology', status: '24 Hours Open', color: '#0284C7' },
                        { title: 'Advanced Radiology', sub: '3.0T MRI & 128-Slice CT', status: '24 Hours Open', color: '#4F46E5' }
                    ].map((dept, idx) => (
                        <div
                            key={idx}
                            style={{
                                padding: '14px 16px',
                                borderRadius: '14px',
                                background: 'var(--bg-color, #F8FAFC)',
                                border: '1px solid var(--border-color, #E2E8F0)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '4px'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-main, #0F172A)' }}>
                                    {dept.title}
                                </span>
                                <span style={{
                                    fontSize: '0.68rem',
                                    fontWeight: 700,
                                    background: dept.status.includes('24') ? 'rgba(16, 185, 129, 0.12)' : 'rgba(37, 99, 235, 0.08)',
                                    color: dept.status.includes('24') ? '#059669' : '#2563EB',
                                    padding: '2px 6px',
                                    borderRadius: '6px'
                                }}>
                                    {dept.status}
                                </span>
                            </div>
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted, #64748B)' }}>
                                {dept.sub}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════ */}
            {/* EDIT HOSPITAL PROFILE MODAL                                 */}
            {/* ═══════════════════════════════════════════════════════════ */}
            <AnimatePresence>
                {isEditModalOpen && (
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
                        onClick={() => setIsEditModalOpen(false)}
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
                                maxWidth: '720px',
                                maxHeight: '90vh',
                                overflowY: 'auto',
                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                                border: '1px solid var(--border-color, #E2E8F0)'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: 44, height: 44, borderRadius: '14px', background: 'rgba(37,99,235,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB' }}>
                                        <Hospital size={24} weight="bold" />
                                    </div>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 900, color: 'var(--text-main, #0F172A)' }}>
                                            Edit Facility Information & Location
                                        </h3>
                                        <p style={{ margin: '2px 0 0', fontSize: '0.84rem', color: 'var(--text-muted, #64748B)' }}>
                                            Update institutional details, campus address, and map coordinates
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsEditModalOpen(false)}
                                    style={{
                                        border: 'none',
                                        background: 'var(--bg-color, #F1F5F9)',
                                        width: 36,
                                        height: 36,
                                        borderRadius: '10px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        color: 'var(--text-muted, #64748B)'
                                    }}
                                >
                                    <X size={18} weight="bold" />
                                </button>
                            </div>

                            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-main, #1F2937)', marginBottom: '6px' }}>
                                            Hospital Name *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={editForm.hospitalName}
                                            onChange={(e) => setEditForm({ ...editForm, hospitalName: e.target.value })}
                                            className="form-input"
                                            style={{
                                                width: '100%',
                                                padding: '10px 14px',
                                                borderRadius: '10px',
                                                border: '1px solid var(--border-color, #CBD5E1)',
                                                fontSize: '0.9rem'
                                            }}
                                        />
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-main, #1F2937)', marginBottom: '6px' }}>
                                            Tagline / Classification
                                        </label>
                                        <input
                                            type="text"
                                            value={editForm.tagline}
                                            onChange={(e) => setEditForm({ ...editForm, tagline: e.target.value })}
                                            className="form-input"
                                            style={{
                                                width: '100%',
                                                padding: '10px 14px',
                                                borderRadius: '10px',
                                                border: '1px solid var(--border-color, #CBD5E1)',
                                                fontSize: '0.9rem'
                                            }}
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-main, #1F2937)', marginBottom: '6px' }}>
                                            General Desk Phone *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={editForm.phone}
                                            onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                            className="form-input"
                                            style={{
                                                width: '100%',
                                                padding: '10px 14px',
                                                borderRadius: '10px',
                                                border: '1px solid var(--border-color, #CBD5E1)',
                                                fontSize: '0.9rem'
                                            }}
                                        />
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#DC2626', marginBottom: '6px' }}>
                                            Emergency 24/7 Hotline *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={editForm.emergencyPhone}
                                            onChange={(e) => setEditForm({ ...editForm, emergencyPhone: e.target.value })}
                                            className="form-input"
                                            style={{
                                                width: '100%',
                                                padding: '10px 14px',
                                                borderRadius: '10px',
                                                border: '1px solid #FCA5A5',
                                                background: '#FEF2F2',
                                                fontSize: '0.9rem',
                                                color: '#991B1B',
                                                fontWeight: 700
                                            }}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-main, #1F2937)', marginBottom: '6px' }}>
                                        Official Contact Email *
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        value={editForm.email}
                                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                        className="form-input"
                                        style={{
                                            width: '100%',
                                            padding: '10px 14px',
                                            borderRadius: '10px',
                                            border: '1px solid var(--border-color, #CBD5E1)',
                                            fontSize: '0.9rem'
                                        }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-main, #1F2937)', marginBottom: '6px' }}>
                                        Campus Physical Address *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={editForm.address}
                                        onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                                        className="form-input"
                                        style={{
                                            width: '100%',
                                            padding: '10px 14px',
                                            borderRadius: '10px',
                                            border: '1px solid var(--border-color, #CBD5E1)',
                                            fontSize: '0.9rem'
                                        }}
                                    />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '12px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-main, #1F2937)', marginBottom: '6px' }}>
                                            City
                                        </label>
                                        <input
                                            type="text"
                                            value={editForm.city}
                                            onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                                            className="form-input"
                                            style={{
                                                width: '100%',
                                                padding: '10px 14px',
                                                borderRadius: '10px',
                                                border: '1px solid var(--border-color, #CBD5E1)',
                                                fontSize: '0.9rem'
                                            }}
                                        />
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-main, #1F2937)', marginBottom: '6px' }}>
                                            State
                                        </label>
                                        <input
                                            type="text"
                                            value={editForm.state}
                                            onChange={(e) => setEditForm({ ...editForm, state: e.target.value })}
                                            className="form-input"
                                            style={{
                                                width: '100%',
                                                padding: '10px 14px',
                                                borderRadius: '10px',
                                                border: '1px solid var(--border-color, #CBD5E1)',
                                                fontSize: '0.9rem'
                                            }}
                                        />
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-main, #1F2937)', marginBottom: '6px' }}>
                                            ZIP Code
                                        </label>
                                        <input
                                            type="text"
                                            value={editForm.zipCode}
                                            onChange={(e) => setEditForm({ ...editForm, zipCode: e.target.value })}
                                            className="form-input"
                                            style={{
                                                width: '100%',
                                                padding: '10px 14px',
                                                borderRadius: '10px',
                                                border: '1px solid var(--border-color, #CBD5E1)',
                                                fontSize: '0.9rem'
                                            }}
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-main, #1F2937)', marginBottom: '6px' }}>
                                            GPS Coordinates (Latitude, Longitude)
                                        </label>
                                        <input
                                            type="text"
                                            value={editForm.coordinates}
                                            onChange={(e) => setEditForm({ ...editForm, coordinates: e.target.value })}
                                            className="form-input"
                                            placeholder="e.g. 40.7391° N, 73.9754° W"
                                            style={{
                                                width: '100%',
                                                padding: '10px 14px',
                                                borderRadius: '10px',
                                                border: '1px solid var(--border-color, #CBD5E1)',
                                                fontSize: '0.9rem'
                                            }}
                                        />
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-main, #1F2937)', marginBottom: '6px' }}>
                                            Map Location Search Query
                                        </label>
                                        <input
                                            type="text"
                                            value={editForm.mapQuery}
                                            onChange={(e) => setEditForm({ ...editForm, mapQuery: e.target.value })}
                                            className="form-input"
                                            placeholder="Address used by Google Maps embed"
                                            style={{
                                                width: '100%',
                                                padding: '10px 14px',
                                                borderRadius: '10px',
                                                border: '1px solid var(--border-color, #CBD5E1)',
                                                fontSize: '0.9rem'
                                            }}
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-main, #1F2937)', marginBottom: '6px' }}>
                                            Medical Director
                                        </label>
                                        <input
                                            type="text"
                                            value={editForm.medicalDirector}
                                            onChange={(e) => setEditForm({ ...editForm, medicalDirector: e.target.value })}
                                            className="form-input"
                                            style={{
                                                width: '100%',
                                                padding: '10px 14px',
                                                borderRadius: '10px',
                                                border: '1px solid var(--border-color, #CBD5E1)',
                                                fontSize: '0.9rem'
                                            }}
                                        />
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-main, #1F2937)', marginBottom: '6px' }}>
                                            Total Operational Beds
                                        </label>
                                        <input
                                            type="text"
                                            value={editForm.totalBeds}
                                            onChange={(e) => setEditForm({ ...editForm, totalBeds: e.target.value })}
                                            className="form-input"
                                            style={{
                                                width: '100%',
                                                padding: '10px 14px',
                                                borderRadius: '10px',
                                                border: '1px solid var(--border-color, #CBD5E1)',
                                                fontSize: '0.9rem'
                                            }}
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                                    <button
                                        type="button"
                                        onClick={() => setIsEditModalOpen(false)}
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
                                        style={{
                                            background: '#2563EB',
                                            border: 'none',
                                            color: 'white',
                                            padding: '10px 24px',
                                            borderRadius: '12px',
                                            fontWeight: 700,
                                            fontSize: '0.88rem',
                                            cursor: 'pointer',
                                            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)'
                                        }}
                                    >
                                        Save Facility Profile
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

export default Profile;
